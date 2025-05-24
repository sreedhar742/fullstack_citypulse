from django.contrib import admin

# Register your models here.
from citypulse_notifications.models import Notification

admin.site.register(Notification)