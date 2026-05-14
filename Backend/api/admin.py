from django.contrib import admin
from .models import User, Event, Stall, MenuItem, Order

# This tells Django to show these tables in the admin dashboard
admin.site.register(User)
admin.site.register(Event)
admin.site.register(Stall)
admin.site.register(MenuItem)
admin.site.register(Order)