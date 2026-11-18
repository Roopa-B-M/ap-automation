from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, VendorViewSet, me

router = DefaultRouter()
router.register("vendors", VendorViewSet, basename="vendor")

urlpatterns = [
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("auth/me/", me),
    path("", include(router.urls)),
]