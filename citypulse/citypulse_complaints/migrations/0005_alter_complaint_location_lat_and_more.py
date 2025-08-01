# Generated by Django 5.1 on 2025-07-25 07:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('citypulse_complaints', '0004_alter_complaint_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='complaint',
            name='location_lat',
            field=models.DecimalField(decimal_places=8, max_digits=9),
        ),
        migrations.AlterField(
            model_name='complaint',
            name='location_lng',
            field=models.DecimalField(decimal_places=8, max_digits=9),
        ),
    ]
