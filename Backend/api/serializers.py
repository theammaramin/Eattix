from rest_framework import serializers
from .models import Event

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