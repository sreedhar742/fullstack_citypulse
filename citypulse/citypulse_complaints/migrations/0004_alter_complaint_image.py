# Generated by Django 5.1 on 2025-07-25 06:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('citypulse_complaints', '0003_alter_complaint_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='complaint',
            name='image',
            field=models.BinaryField(blank=True, null=True),
        ),
    ]
