from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Vendor, VendorBankDetail


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class VendorBankDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorBankDetail
        fields = ["id", "bank_name", "account_number", "ifsc", "is_primary"]


class VendorSerializer(serializers.ModelSerializer):
    bank_details = VendorBankDetailSerializer(many=True, required=False)

    class Meta:
        model = Vendor
        fields = ["id", "name", "gstin", "pan", "email", "phone", "address",
                  "status", "bank_details", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]

    def create(self, validated_data):
        banks = validated_data.pop("bank_details", [])
        vendor = Vendor.objects.create(**validated_data)
        for b in banks:
            VendorBankDetail.objects.create(vendor=vendor, **b)
        return vendor

    def update(self, instance, validated_data):
        banks = validated_data.pop("bank_details", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if banks is not None:
            instance.bank_details.all().delete()
            for b in banks:
                VendorBankDetail.objects.create(vendor=instance, **b)
        return instance