from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrClerkForWrite(BasePermission):
    """Everyone logged in can read. Only Admin and AP Clerk can write."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ("ADMIN", "AP_CLERK")