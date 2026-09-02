from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Cart, CartItem, Order, OrderItem, Product, Rental


class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            image_url = obj.image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return None


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    price = serializers.IntegerField(source="product.price", read_only=True)
    image = serializers.SerializerMethodField()
    deposit = serializers.IntegerField(source="product.deposit", read_only=True)
    stock = serializers.IntegerField(source="product.stock", read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_name", "price", "image", "deposit", "stock", "quantity"]

    def get_image(self, obj):
        if obj.product.image:
            request = self.context.get("request")
            image_url = obj.product.image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    monthly_subtotal = serializers.SerializerMethodField()
    refundable_deposit = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "item_count", "monthly_subtotal", "refundable_deposit"]

    def get_item_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_monthly_subtotal(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())

    def get_refundable_deposit(self, obj):
        return sum(item.product.deposit * item.quantity for item in obj.items.all())


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "date_joined",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = ["username", "date_joined", "is_staff", "is_superuser"]


class RentalSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    price = serializers.IntegerField(source="product.price", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Rental
        fields = [
            "id",
            "product",
            "product_name",
            "price",
            "image",
            "start_date",
            "end_date",
            "status",
        ]

    def get_image(self, obj):
        if obj.product.image:
            request = self.context.get("request")
            image_url = obj.product.image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "image", "quantity", "monthly_price"]

    def get_image(self, obj):
        if obj.product.image:
            request = self.context.get("request")
            image_url = obj.product.image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "total_price",
            "monthly_subtotal",
            "shipping_charge",
            "refundable_deposit",
            "customer_name",
            "phone",
            "address",
            "city",
            "pincode",
            "payment_method",
            "payment_status",
            "payment_reference",
            "status",
            "created_at",
            "items",
        ]
