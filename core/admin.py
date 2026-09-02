from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, Product, Rental


class ProductAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "category", "price", "deposit", "stock", "condition", "featured"]
    list_filter = ["category", "condition", "featured"]
    search_fields = ["name", "description"]


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


class CartAdmin(admin.ModelAdmin):
    inlines = [CartItemInline]
    list_display = ["id", "user"]


class RentalAdmin(admin.ModelAdmin):
    list_display = ["id", "user_name", "product", "status", "start_date", "end_date"]
    search_fields = ["user_name", "product__name"]
    list_filter = ["status", "start_date"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ["id", "user", "status", "payment_status", "total_price", "city", "created_at"]
    list_filter = ["status", "payment_status", "city", "created_at"]
    search_fields = ["user__username", "customer_name", "phone", "payment_reference"]


admin.site.register(Product, ProductAdmin)
admin.site.register(Rental, RentalAdmin)
admin.site.register(Cart, CartAdmin)
admin.site.register(CartItem)
admin.site.register(Order, OrderAdmin)
