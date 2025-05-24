from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/complaints/', include('citypulse_complaints.urls')),  # we'll create this
    path('api/users/', include('citypulse_users.urls')),  # we'll create this
    path('api/notifications/', include('citypulse_notifications.urls')),  # we'll create this
    path('api/workers/', include('citypulse_workers.urls')),  # we'll create this
]
