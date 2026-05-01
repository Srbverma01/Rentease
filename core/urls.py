from django.urls import path

from .views import (
    add_product,
    checkout,
    history,
    password_reset_confirm,
    password_reset_request,
    product_list,
    profile,
    register,
    update_product,
)

urlpatterns = [
    path("products/", product_list),
    path("products/<int:product_id>/", update_product),
    path("register/", register),
    path("add-product/", add_product),
    path("profile/", profile),
    path("history/", history),
    path("checkout/", checkout),
    path("password-reset/request/", password_reset_request),
    path("password-reset/confirm/", password_reset_confirm),
]
