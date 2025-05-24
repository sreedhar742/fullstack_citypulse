from django.contrib import admin

# Register your models here.
from citypulse_workers.models import Worker, AssignedTask

admin.site.register(Worker)
admin.site.register(AssignedTask)