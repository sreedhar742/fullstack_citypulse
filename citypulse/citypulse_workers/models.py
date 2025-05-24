from django.db import models

class Worker(models.Model):
    SPECIALIZATION_CHOICES = [
        ('garbage', 'Garbage'),
        ('road', 'Road'),
        ('water', 'Water'),
        ('lights', 'Lights'),
    ]

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(null=True, blank=True)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


from citypulse_complaints.models import Complaint

class AssignedTask(models.Model):
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE)
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.worker.name} -> {self.complaint.title}"
