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
    path('', include('citypulse_complaints.urls')),  # we'll create this
    path('', include('citypulse_users.urls')),  # we'll create this
    path('', include('citypulse_notifications.urls')),  # we'll create this
    path('', include('citypulse_workers.urls')),  # we'll create this
]
