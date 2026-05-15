from rest_framework import serializers
from .models import Event, Stall, MenuItem, User

class UserSerializer(serializers.ModelSerializer):
    # React expects string IDs, so we explicitly cast the integer to a string
    id = serializers.CharField(read_only=True) 
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'avatar']

class EventSerializer(serializers.ModelSerializer):
    # 1. Map Django's snake_case to React's camelCase
    endDate = serializers.DateField(source='end_date')
    organizerId = serializers.PrimaryKeyRelatedField(source='organizer', read_only=True)
    
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