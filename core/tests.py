from django.contrib.auth.models import User
from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Order, OrderItem, Product, Rental


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class ProductManagementTests(APITestCase):
    def setUp(self):
        self.product = Product.objects.create(name="Desk", price=1200)
        self.staff_user = User.objects.create_user(
            username="catalog-admin",
            password="strong-pass-123",
            is_staff=True,
        )
        self.regular_user = User.objects.create_user(
            username="member-user",
            password="strong-pass-123",
        )

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
