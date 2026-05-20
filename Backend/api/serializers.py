import random
import string
from rest_framework import serializers
from .models import Event, Stall, MenuItem, User, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    # React expects string IDs, so we explicitly cast the integer to a string
    id = serializers.CharField(read_only=True) 
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'avatar']

class EventSerializer(serializers.ModelSerializer):
    # 1. Map Django's snake_case to React's camelCase
    endDate = serializers.DateField(source='end_date')
    
    # --- FIXED: Tell Django to accept the organizer ID from React! ---
    organizerId = serializers.PrimaryKeyRelatedField(source='organizer', queryset=User.objects.all())
    
    # 2. Add computed fields
    stallCount = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'endDate', 'time', 
            'location', 'image', 'banner', 'organizerId', 'category', 
            'stallCount', 'status', 'tags', 'lat', 'lng'
        ]

    def get_stallCount(self, obj):
        # Counts how many stalls are connected to this event
        return obj.stalls.count()

    def get_tags(self, obj):
        # Since 'tags' isn't in your Django model yet, we return a fallback array 
        # so your React frontend doesn't crash when it tries to map over it.
        # (Consider adding a JSONField or ManyToMany tag model later!)
        return ["Live Event", "Food"]
    

class MenuItemSerializer(serializers.ModelSerializer):
    # Map Django fields to React camelCase
    stallId = serializers.PrimaryKeyRelatedField(source='stall', read_only=True)
    isAvailable = serializers.BooleanField(source='is_available', required=False)
    prepTime = serializers.IntegerField(source='prep_time', required=False)

    class Meta:
        model = MenuItem
        fields = ['id', 'stallId', 'name', 'description', 'price', 'image', 'category', 'isAvailable', 'prepTime']

class StallSerializer(serializers.ModelSerializer):
    # Relational mapping
    eventId = serializers.PrimaryKeyRelatedField(source='event', read_only=True)
    vendorId = serializers.PrimaryKeyRelatedField(source='vendor', read_only=True)
    
    # CamelCase mapping
    reviewCount = serializers.IntegerField(source='review_count', required=False)
    waitTime = serializers.CharField(source='wait_time', required=False)
    isOpen = serializers.BooleanField(source='is_open', required=False)
    location = serializers.CharField(source='location_code', required=False)
    
    # Fallback for the tags array
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Stall
        fields = [
            'id', 'eventId', 'vendorId', 'name', 'description', 'image', 'banner', 
            'category', 'rating', 'reviewCount', 'waitTime', 'status', 'isOpen', 
            'tags', 'location'
        ]

    def get_tags(self, obj):
        return ["Popular", "Fresh"] # Fallback so React map() doesn't crash


# --- CHECKOUT SERIALIZERS ---

class OrderItemSerializer(serializers.ModelSerializer):
    # Map menuItemId from the cart to the menu_item foreign key
    menuItemId = serializers.PrimaryKeyRelatedField(source='menu_item', queryset=MenuItem.objects.all(), required=False, allow_null=True)

    class Meta:
        model = OrderItem
        fields = ['menuItemId', 'name', 'price', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    customerId = serializers.PrimaryKeyRelatedField(source='customer', queryset=User.objects.all())
    stallId = serializers.PrimaryKeyRelatedField(source='stall', queryset=Stall.objects.all())
    eventId = serializers.PrimaryKeyRelatedField(source='event', queryset=Event.objects.all())
    
    # Catch the array of cart items
    items = OrderItemSerializer(many=True)
    
    # Map the read-only generated fields back to the frontend
    pickupCode = serializers.CharField(source='pickup_code', read_only=True)
    estimatedTime = serializers.CharField(source='estimated_time', read_only=True)
    placedAt = serializers.DateTimeField(source='placed_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    paymentMethod = serializers.CharField(source='payment_method', required=False)

    class Meta:
        model = Order
        fields = [
            'id', 'customerId', 'stallId', 'eventId', 'total',
            'status', 'pickupCode', 'estimatedTime', 'note',
            'paymentMethod', 'placedAt', 'updatedAt', 'items'
        ]

    def create(self, validated_data):
        # 1. Pull the array of items out of the data
        items_data = validated_data.pop('items')
        
        # 2. Generate a random 4-character pickup code (e.g., "A7B2")
        validated_data['pickup_code'] = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        validated_data['estimated_time'] = "15-20 mins"

        # 3. Save the main Order first
        order = Order.objects.create(**validated_data)
        
        # 4. Loop through the cart and save each OrderItem connected to the main Order
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        return order