from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. User Model (Customizing to include roles and avatars)
class User(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('vendor', 'Vendor'),
        ('organizer', 'Organizer'),
    ]
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255) # In production, use Django's built-in Auth
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    avatar = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

# 2. Event Model
class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    end_date = models.DateField()
    time = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    image = models.URLField()
    banner = models.URLField()
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    category = models.CharField(max_length=100)
    status = models.CharField(max_length=50) # upcoming, past
    lat = models.FloatField()
    lng = models.FloatField()

    def __str__(self):
        return self.title

# 3. Stall Model
class Stall(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='stalls')
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stalls')
    name = models.CharField(max_length=255)
    description = models.TextField()
    image = models.URLField()
    banner = models.URLField()
    category = models.CharField(max_length=100)
    rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    wait_time = models.CharField(max_length=50)
    status = models.CharField(max_length=50) # approved, pending
    is_open = models.BooleanField(default=True)
    location_code = models.CharField(max_length=100) # e.g., 'Stall A-12'

    def __str__(self):
        return self.name

# 4. Menu Item Model
class MenuItem(models.Model):
    stall = models.ForeignKey(Stall, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField()
    category = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)
    prep_time = models.IntegerField() # in minutes

    def __str__(self):
        return f"{self.name} ({self.stall.name})"

# 5. Order Model
class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    stall = models.ForeignKey(Stall, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50)
    pickup_code = models.CharField(max_length=10)
    placed_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Order {self.id} by {self.customer.name}"