from django.contrib.auth.models import User
from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Order, OrderItem, Product, Rental


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class ProductManagementTests(APITestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="Desk",
            price=1200,
            deposit=800,
            stock=3,
            category="study-tables",
            description="Compact work desk",
        )
        self.staff_user = User.objects.create_user(
            username="catalog-admin",
            password="strong-pass-123",
            is_staff=True,
        )
        self.regular_user = User.objects.create_user(
            username="member-user",
            password="strong-pass-123",
        )

    def delivery_payload(self):
        return {
            "fullName": "Member User",
            "phone": "9999999999",
            "address": "12 Main Street",
            "city": "Indore",
            "pincode": "452001",
        }

    def test_profile_includes_staff_status(self):
        self.client.force_authenticate(user=self.staff_user)

        response = self.client.get("/api/profile/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_staff"])

    def test_staff_user_can_update_product_price(self):
        self.client.force_authenticate(user=self.staff_user)

        response = self.client.patch(
            f"/api/products/{self.product.id}/",
            {"price": 1800},
            format="json",
        )

        self.product.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.product.price, 1800)

    def test_non_staff_user_cannot_update_product_price(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.patch(
            f"/api/products/{self.product.id}/",
            {"price": 1800},
            format="json",
        )

        self.product.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.product.price, 1200)

    def test_checkout_is_atomic_when_an_item_is_invalid(self):
        self.client.force_authenticate(user=self.regular_user)
        order_count = Order.objects.count()
        order_item_count = OrderItem.objects.count()
        rental_count = Rental.objects.count()

        response = self.client.post(
            "/api/checkout/",
            {
                "delivery": self.delivery_payload(),
                "items": [
                    {"id": self.product.id, "qty": 1},
                    {"id": 999999, "qty": 1},
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Order.objects.count(), order_count)
        self.assertEqual(OrderItem.objects.count(), order_item_count)
        self.assertEqual(Rental.objects.count(), rental_count)

    def test_cart_is_persisted_for_authenticated_user(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.post(
            "/api/cart/items/",
            {"product": self.product.id, "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["item_count"], 2)

        response = self.client.get("/api/cart/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["items"][0]["product"], self.product.id)
        self.assertEqual(response.data["items"][0]["quantity"], 2)

    def test_checkout_stores_delivery_payment_and_clears_cart(self):
        self.client.force_authenticate(user=self.regular_user)
        self.client.post(
            "/api/cart/items/",
            {"product": self.product.id, "quantity": 2},
            format="json",
        )

        response = self.client.post(
            "/api/checkout/",
            {
                "delivery": self.delivery_payload(),
                "payment_method": "mock_upi",
            },
            format="json",
        )

        self.product.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["customer_name"], "Member User")
        self.assertEqual(response.data["payment_status"], "Paid")
        self.assertTrue(response.data["payment_reference"].startswith("MOCK-"))
        self.assertEqual(response.data["monthly_subtotal"], 2400)
        self.assertEqual(response.data["refundable_deposit"], 1600)
        self.assertEqual(response.data["total_price"], 4120)
        self.assertEqual(self.product.stock, 1)
        self.assertEqual(self.client.get("/api/cart/").data["item_count"], 0)

    def test_staff_user_can_update_order_status(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post(
            "/api/checkout/",
            {
                "delivery": self.delivery_payload(),
                "payment_method": "cash_on_delivery",
                "items": [{"id": self.product.id, "qty": 1}],
            },
            format="json",
        )
        order_id = response.data["id"]

        self.client.force_authenticate(user=self.staff_user)
        response = self.client.patch(
            f"/api/staff/orders/{order_id}/",
            {"status": "Delivered", "payment_status": "Paid"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "Delivered")
        self.assertEqual(response.data["payment_status"], "Paid")
        self.assertEqual(Rental.objects.get().status, "Active")

    @override_settings(
        FRONTEND_URL="https://app.rentease.example",
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    )
    def test_password_reset_uses_configured_frontend_url(self):
        self.regular_user.email = "member@example.com"
        self.regular_user.save(update_fields=["email"])

        response = self.client.post(
            "/api/password-reset/request/",
            {"email": "member@example.com"},
            format="json",
            HTTP_ORIGIN="https://attacker.example",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("https://app.rentease.example/reset-password/", mail.outbox[0].body)
        self.assertNotIn("https://attacker.example", mail.outbox[0].body)
