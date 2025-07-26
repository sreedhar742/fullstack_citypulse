from django.db import models
from django.contrib.auth.models import User

class Notification(models.Model):
    complaint = models.ForeignKey('citypulse_complaints.Complaint', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To: {self.user.username} - {self.message[:30]}"
