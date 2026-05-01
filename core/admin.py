from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, Product, Rental


class ProductAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "price"]
    list_filter = ["price"]


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
    list_display = ["id", "user", "status", "total_price", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["user__username"]


admin.site.register(Product, ProductAdmin)
admin.site.register(Rental, RentalAdmin)
admin.site.register(Cart, CartAdmin)
admin.site.register(CartItem)
admin.site.register(Order, OrderAdmin)
