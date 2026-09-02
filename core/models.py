from django.contrib.auth.models import User
from django.db import models


class Product(models.Model):
    CONDITION_CHOICES = [
        ("New", "New"),
        ("Like New", "Like New"),
        ("Good", "Good"),
        ("Refurbished", "Refurbished"),
    ]

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=80, blank=True)
    description = models.TextField(blank=True)
    price = models.IntegerField()
    deposit = models.IntegerField(default=0)
    stock = models.PositiveIntegerField(default=1)
    delivery_time = models.CharField(max_length=80, blank=True, default="3-5 days")
    condition = models.CharField(max_length=30, choices=CONDITION_CHOICES, default="Good")
    rental_duration_days = models.PositiveIntegerField(default=30)
    featured = models.BooleanField(default=False)
    image = models.ImageField(upload_to="products/", null=True, blank=True)

    def __str__(self):
        return self.name


class Rental(models.Model):
    STATUS_CHOICES = [
        ("Booked", "Booked"),
        ("Active", "Active"),
        ("Returned", "Returned"),
        ("Cancelled", "Cancelled"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user_name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Booked")

    def __str__(self):
        return f"{self.user_name} - {self.product.name}"


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cart")

    def __str__(self):
        return f"{self.user} cart"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("Product", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["cart", "product"], name="unique_cart_product")
        ]

    def __str__(self):
        return f"{self.cart.user} - {self.product.name} x {self.quantity}"


class Order(models.Model):
    STATUS_CHOICES = [
        ("Placed", "Placed"),
        ("Processing", "Processing"),
        ("Out for Delivery", "Out for Delivery"),
        ("Delivered", "Delivered"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
        ("Returned", "Returned"),
    ]
    PAYMENT_STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Failed", "Failed"),
        ("Refunded", "Refunded"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    total_price = models.IntegerField(default=0)
    monthly_subtotal = models.IntegerField(default=0)
    shipping_charge = models.IntegerField(default=0)
    refundable_deposit = models.IntegerField(default=0)
    customer_name = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=80, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    payment_method = models.CharField(max_length=40, default="cash_on_delivery")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="Pending")
    payment_reference = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Placed")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    monthly_price = models.IntegerField()

    def __str__(self):
        return f"Order #{self.order.id} - {self.product.name}"
