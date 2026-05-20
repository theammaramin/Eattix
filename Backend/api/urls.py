from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import all your ViewSets and Auth APIViews
from .views import (
    EventViewSet,
    StallViewSet,
    MenuItemViewSet,
    OrderViewSet,
    LoginView,
    RegisterView,
    LogoutView,
    CreatePaymentIntentView,
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'stalls', StallViewSet, basename='stall')
router.register(r'menu-items', MenuItemViewSet, basename='menuitem')
# Register the new Order route
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    # Your standard ViewSet routes
    path('', include(router.urls)),
    
    # Custom Authentication Routes
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),

    # Stripe
    path('create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
]