from django.db import models
from django.contrib.auth.models import User

class Complaint(models.Model):
    CATEGORY_CHOICES = [
        ('garbage', 'Garbage'),
        ('road', 'Road'),
        ('water', 'Water'),
        ('lights', 'Street Lights'),
    ]
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.BinaryField(null=True, blank=True)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
    
    
class ComplaintStatus(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]

    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='statuses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.complaint.title} - {self.status}"
