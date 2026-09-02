from django.urls import path

from .views import (
    add_product,
    cart_detail,
    cart_item_detail,
    cart_items,
    checkout,
    history,
    password_reset_confirm,
    password_reset_request,
    product_list,
    profile,
    register,
    staff_orders,
    update_order,
    update_product,
)

urlpatterns = [
    path("products/", product_list),
    path("products/<int:product_id>/", update_product),
    path("register/", register),
    path("add-product/", add_product),
    path("cart/", cart_detail),
    path("cart/items/", cart_items),
    path("cart/items/<int:product_id>/", cart_item_detail),
    path("profile/", profile),
    path("history/", history),
    path("staff/orders/", staff_orders),
    path("staff/orders/<int:order_id>/", update_order),
    path("checkout/", checkout),
    path("password-reset/request/", password_reset_request),
    path("password-reset/confirm/", password_reset_confirm),
]
