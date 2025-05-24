from rest_framework.permissions import BasePermission

class IsAdminUserRole(BasePermission):
    """
    Custom permission to allow only users with the 'admin' role to access the view.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin'