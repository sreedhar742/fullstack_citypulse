from django.contrib import admin

# Register your models here.
from citypulse_complaints.models import Complaint, ComplaintStatus

admin.site.register(Complaint)
admin.site.register(ComplaintStatus)