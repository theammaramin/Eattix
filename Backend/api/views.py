from rest_framework import viewsets
from django.db.models import Q
from .models import Event
from .serializers import EventSerializer

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        queryset = Event.objects.all()
        
        # Grab the filters sent from eventService.js
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        status = self.request.query_params.get('status', None)

        # Apply the filters exactly how your mock function did
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(location__icontains=search) | 
                Q(category__icontains=search)
            )
        if category:
            queryset = queryset.filter(category=category)
        if status:
            queryset = queryset.filter(status=status)

        return queryset