from datetime import timedelta

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

from .models import Order, OrderItem, Product, Rental
from .serializers import OrderSerializer, ProductSerializer, ProfileSerializer, RentalSerializer


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
    products = Product.objects.all()
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


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_product(request, product_id):
    staff_only_response = _require_staff_user(request)
    if staff_only_response:
        return staff_only_response

    product = get_object_or_404(Product, id=product_id)
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout(request):
    items = request.data.get("items") or []
    if not items:
        return Response(
            {"error": "Your cart is empty"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    start_date = timezone.now().date()
    normalized_items = []

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
        normalized_items.append((product, quantity))

    total_price = sum(product.price * quantity for product, quantity in normalized_items)

    with transaction.atomic():
        order = Order.objects.create(user=request.user, total_price=total_price)

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
                end_date=start_date + timedelta(days=30),
                status="Booked",
            )

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
