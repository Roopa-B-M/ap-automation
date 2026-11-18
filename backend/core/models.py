from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models

GSTIN_VALIDATOR = RegexValidator(
    regex=r"^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$",
    message="Enter a valid 15-character GSTIN.",
)


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        AP_CLERK = "AP_CLERK", "AP Clerk"
        APPROVER = "APPROVER", "Approver"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.AP_CLERK)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Vendor(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACTIVE = "ACTIVE", "Active"
        BLOCKED = "BLOCKED", "Blocked"

    name = models.CharField(max_length=200)
    gstin = models.CharField(max_length=15, unique=True, validators=[GSTIN_VALIDATOR])
    pan = models.CharField(max_length=10, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="vendors_created")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class VendorBankDetail(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="bank_details")
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=30)
    ifsc = models.CharField(max_length=11)
    is_primary = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.vendor.name} - {self.bank_name}"