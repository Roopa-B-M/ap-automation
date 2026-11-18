from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Vendor
from .permissions import IsAdminOrClerkForWrite
from .serializers import CustomTokenSerializer, UserSerializer, VendorSerializer


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


@api_view(["GET"])
def me(request):
    return Response(UserSerializer(request.user).data)


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.prefetch_related("bank_details").order_by("-created_at")
    serializer_class = VendorSerializer
    permission_classes = [IsAdminOrClerkForWrite]
    search_fields = ["name", "gstin"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)