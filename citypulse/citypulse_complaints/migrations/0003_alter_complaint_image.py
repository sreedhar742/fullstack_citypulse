# Generated by Django 5.1 on 2025-07-25 06:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('citypulse_complaints', '0002_alter_complaint_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='complaint',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='complaint_images/'),
        ),
    ]
