
from django.urls import path
# pyrefly: ignore [missing-import]
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('products/', views.get_products, name='get_products'),
    path('categories/', views.get_categories, name='get_categories'),
    path('products/<int:pk>/', views.get_product, name='get_product'),

    path('auth/profile/status/', views.profile_status),
    path('auth/profile/',views.create_or_update_profile),

    # Cart APIs
    path('cart/', views.get_cart),
    path('add_to_cart/', views.add_to_cart),
    path('remove_from_cart/', views.remove_from_cart),
    path('cart/update/', views.update_cart_quantity),

    # Auth APIs
    path('auth/register/', views.register_view),
    path('auth/verify-email/', views.verify_email, name='verify_email'),
    path('auth/token/', views.CustomTokenObtainPairView.as_view()),        
    path('auth/token/refresh/', TokenRefreshView.as_view()),   
    path('auth/google/', views.google_login_view, name='google_auth'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('auth/password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),

    # Order APIs
    # path('orders/create/', views.create_order),
]
 