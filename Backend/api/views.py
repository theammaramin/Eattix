from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

# Import all the models and serializers
from .models import Event, Stall, MenuItem
from .serializers import EventSerializer, StallSerializer, MenuItemSerializer

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

    # Matches: getStallsByEvent -> /api/events/:eventId/stalls/
    @action(detail=True, methods=['get'])
    def stalls(self, request, pk=None):
        event = self.get_object()
        stalls = Stall.objects.filter(event=event)
        serializer = StallSerializer(stalls, many=True)
        return Response(serializer.data)

    # Matches: applyToEvent -> /api/events/:eventId/apply/
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        event = self.get_object()
        serializer = StallSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(event=event, status='pending')
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class StallViewSet(viewsets.ModelViewSet):
    serializer_class = StallSerializer

    def get_queryset(self):
        queryset = Stall.objects.all()
        # Matches: getStallsByVendor -> /api/stalls/?vendorId=...
        vendor_id = self.request.query_params.get('vendorId', None)
        if vendor_id:
            queryset = queryset.filter(vendor=vendor_id)
        return queryset

    # Matches: getMenuByStall & createMenuItem -> /api/stalls/:stallId/menu/
    @action(detail=True, methods=['get', 'post'])
    def menu(self, request, pk=None):
        stall = self.get_object()
        if request.method == 'GET':
            items = MenuItem.objects.filter(stall=stall)
            serializer = MenuItemSerializer(items, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = MenuItemSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(stall=stall)
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)

    # Matches: updateStallStatus -> /api/stalls/:stallId/status/
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        stall = self.get_object()
        status_val = request.data.get('status')
        if status_val:
            stall.status = status_val
            stall.save()
        serializer = StallSerializer(stall)
        return Response(serializer.data)


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer