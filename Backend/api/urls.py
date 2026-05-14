from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, StallViewSet, MenuItemViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
# Add these two lines:
router.register(r'stalls', StallViewSet, basename='stall')
router.register(r'menu-items', MenuItemViewSet, basename='menuitem')

urlpatterns = [
    path('', include(router.urls)),
]