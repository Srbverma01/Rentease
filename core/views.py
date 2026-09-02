from datetime import timedelta
from uuid import uuid4

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Cart, CartItem, Order, OrderItem, Product, Rental
from .serializers import CartSerializer, OrderSerializer, ProductSerializer, ProfileSerializer, RentalSerializer


def home(request):
    return HttpResponse("Welcome to RentEase")


def _require_staff_user(request):
    if request.user.is_staff:
        return None

    return Response(
        {"detail": "Only staff users can manage products."},
        status=status.HTTP_403_FORBIDDEN,
    )


@api_view(["GET"])
def product_list(request):
    products = Product.objects.all().order_by("-featured", "category", "name")
    serializer = ProductSerializer(products, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_product(request):
    staff_only_response = _require_staff_user(request)
    if staff_only_response:
        return staff_only_response

    serializer = ProductSerializer(data=request.data, context={"request": request})

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def update_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.method == "DELETE":
        if not request.user.is_superuser:
            return Response(
                {"detail": "Only superusers can delete products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    staff_only_response = _require_staff_user(request)
    if staff_only_response:
        return staff_only_response

    serializer = ProductSerializer(
        product,
        data=request.data,
        partial=True,
        context={"request": request},
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def register(request):
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password") or ""
    email = (request.data.get("email") or "").strip().lower()

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

    if email and User.objects.filter(email__iexact=email).exists():
        return Response(
            {"error": "Email is already in use"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(username=username, password=password, email=email)
    return Response(
        {
            "message": "User created successfully",
            "user": {
                "username": user.username,
                "email": user.email,
            },
        }
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == "GET":
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    serializer = ProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _get_user_cart(user):
    return Cart.objects.prefetch_related("items__product").get_or_create(user=user)[0]


def _serialize_cart(cart, request):
    cart = Cart.objects.prefetch_related("items__product").get(id=cart.id)
    return CartSerializer(cart, context={"request": request}).data


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def cart_detail(request):
    cart = _get_user_cart(request.user)

    if request.method == "DELETE":
        cart.items.all().delete()
        return Response(_serialize_cart(cart, request))

    return Response(_serialize_cart(cart, request))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cart_items(request):
    product_id = request.data.get("product") or request.data.get("id")
    mode = request.data.get("mode", "add")

    try:
        quantity = max(int(request.data.get("quantity", request.data.get("qty", 1)) or 1), 1)
    except (TypeError, ValueError):
        return Response(
            {"error": "Quantity must be a whole number."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    product = get_object_or_404(Product, id=product_id)
    if product.stock < 1:
        return Response(
            {"error": "This product is currently out of stock."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart = _get_user_cart(request.user)
    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={"quantity": min(quantity, product.stock)},
    )

    if not created:
        next_quantity = quantity if mode == "set" else item.quantity + quantity
        item.quantity = min(next_quantity, product.stock)
        item.save(update_fields=["quantity"])

    return Response(_serialize_cart(cart, request), status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def cart_item_detail(request, product_id):
    cart = _get_user_cart(request.user)
    item = get_object_or_404(CartItem, cart=cart, product_id=product_id)

    if request.method == "DELETE":
        item.delete()
        return Response(_serialize_cart(cart, request))

    try:
        quantity = int(request.data.get("quantity", request.data.get("qty", item.quantity)))
    except (TypeError, ValueError):
        return Response(
            {"error": "Quantity must be a whole number."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if quantity <= 0:
        item.delete()
        return Response(_serialize_cart(cart, request))

    item.quantity = min(quantity, item.product.stock)
    item.save(update_fields=["quantity"])
    return Response(_serialize_cart(cart, request))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def history(request):
    orders = Order.objects.filter(user=request.user).prefetch_related("items__product").order_by("-created_at")
    rentals = Rental.objects.filter(user_name=request.user.username).select_related("product").order_by("-start_date")

    return Response(
        {
            "orders": OrderSerializer(orders, many=True, context={"request": request}).data,
            "rentals": RentalSerializer(rentals, many=True, context={"request": request}).data,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def staff_orders(request):
    staff_only_response = _require_staff_user(request)
    if staff_only_response:
        return staff_only_response

    orders = Order.objects.select_related("user").prefetch_related("items__product").order_by("-created_at")
    return Response(OrderSerializer(orders, many=True, context={"request": request}).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_order(request, order_id):
    staff_only_response = _require_staff_user(request)
    if staff_only_response:
        return staff_only_response

    order = get_object_or_404(Order, id=order_id)
    next_status = request.data.get("status")
    next_payment_status = request.data.get("payment_status")

    if next_status:
        valid_statuses = {choice[0] for choice in Order.STATUS_CHOICES}
        if next_status not in valid_statuses:
            return Response({"error": "Invalid order status."}, status=status.HTTP_400_BAD_REQUEST)
        order.status = next_status

        rental_status = {
            "Delivered": "Active",
            "Completed": "Returned",
            "Returned": "Returned",
            "Cancelled": "Cancelled",
        }.get(next_status)
        if rental_status:
            Rental.objects.filter(
                user_name=order.user.username,
                product_id__in=order.items.values_list("product_id", flat=True),
            ).update(status=rental_status)

    if next_payment_status:
        valid_payment_statuses = {choice[0] for choice in Order.PAYMENT_STATUS_CHOICES}
        if next_payment_status not in valid_payment_statuses:
            return Response({"error": "Invalid payment status."}, status=status.HTTP_400_BAD_REQUEST)
        order.payment_status = next_payment_status

    order.save(update_fields=["status", "payment_status"])
    return Response(OrderSerializer(order, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout(request):
    cart = _get_user_cart(request.user)
    request_items = request.data.get("items")
    items = request_items if request_items is not None else [
        {"id": cart_item.product_id, "qty": cart_item.quantity}
        for cart_item in cart.items.select_related("product")
    ]
    if not items:
        return Response(
            {"error": "Your cart is empty"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    start_date = timezone.now().date()
    normalized_items = []
    delivery = request.data.get("delivery") or {}
    required_delivery_fields = ["fullName", "phone", "address", "city", "pincode"]

    missing_fields = [field for field in required_delivery_fields if not str(delivery.get(field, "")).strip()]
    if missing_fields:
        return Response(
            {"error": "Delivery details are required before checkout."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    for item in items:
        product_id = item.get("id") or item.get("product")
        try:
            quantity = max(int(item.get("qty", item.get("quantity", 1)) or 1), 1)
        except (TypeError, ValueError):
            return Response(
                {"error": "Quantity must be a whole number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product = get_object_or_404(Product, id=product_id)
        if quantity > product.stock:
            return Response(
                {"error": f"Only {product.stock} unit(s) of {product.name} are available."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        normalized_items.append((product, quantity))

    monthly_subtotal = sum(product.price * quantity for product, quantity in normalized_items)
    refundable_deposit = sum(product.deposit * quantity for product, quantity in normalized_items)
    shipping_charge = int(request.data.get("shipping_charge") or round(monthly_subtotal * 0.05))
    payment_method = request.data.get("payment_method", "cash_on_delivery")
    is_deferred_payment = payment_method in {"cash_on_delivery", "manual"}
    payment_status = "Pending" if is_deferred_payment else "Paid"
    payment_reference = "" if is_deferred_payment else f"MOCK-{uuid4().hex[:12].upper()}"
    total_price = monthly_subtotal + refundable_deposit + shipping_charge

    with transaction.atomic():
        order = Order.objects.create(
            user=request.user,
            total_price=total_price,
            monthly_subtotal=monthly_subtotal,
            shipping_charge=shipping_charge,
            refundable_deposit=refundable_deposit,
            customer_name=delivery.get("fullName", "").strip(),
            phone=delivery.get("phone", "").strip(),
            address=delivery.get("address", "").strip(),
            city=delivery.get("city", "").strip(),
            pincode=delivery.get("pincode", "").strip(),
            payment_method=payment_method,
            payment_status=payment_status,
            payment_reference=payment_reference,
        )

        for product, quantity in normalized_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                monthly_price=product.price,
            )

            Rental.objects.create(
                product=product,
                user_name=request.user.username,
                start_date=start_date,
                end_date=start_date + timedelta(days=product.rental_duration_days),
                status="Booked",
            )

            product.stock = max(product.stock - quantity, 0)
            product.save(update_fields=["stock"])

        cart.items.all().delete()

    serializer = OrderSerializer(order, context={"request": request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def password_reset_request(request):
    email = (request.data.get("email") or "").strip().lower()

    if not email:
        return Response(
            {"error": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    message = "If an account with that email exists, a reset link has been sent."
    user = User.objects.filter(email__iexact=email).first()
    reset_link = None

    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password/{uid}/{token}"

        send_mail(
            subject="RentEase password reset",
            message=(
                "Use the link below to reset your password:\n\n"
                f"{reset_link}\n\n"
                "If you did not request this, you can ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

    payload = {"message": message}
    if settings.DEBUG and reset_link:
        payload["reset_link"] = reset_link

    return Response(payload)


@api_view(["POST"])
def password_reset_confirm(request):
    uid = request.data.get("uid")
    token = request.data.get("token")
    password = request.data.get("password") or ""

    if not uid or not token or not password:
        return Response(
            {"error": "Invalid password reset request"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {"error": "Reset link is invalid or has expired"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not default_token_generator.check_token(user, token):
        return Response(
            {"error": "Reset link is invalid or has expired"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(password)
    user.save(update_fields=["password"])
    return Response({"message": "Password reset successful"})


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
