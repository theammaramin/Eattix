import uuid
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response

# Import all the models and serializers
from .models import User, Event, Stall, MenuItem, Order
from .serializers import UserSerializer, EventSerializer, StallSerializer, MenuItemSerializer, OrderSerializer

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


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            # Find the user in the database
            user = User.objects.get(email=email, password=password)
            serializer = UserSerializer(user)
            # Generate a secure-looking token for the session
            token = f"eattix-token-{user.id}-{uuid.uuid4()}"
            
            return Response({
                'user': serializer.data, 
                'token': token
            })
        except User.DoesNotExist:
            return Response({'detail': 'Invalid email or password'}, status=400)


class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        # Check if email is already taken
        if User.objects.filter(email=email).exists():
            return Response({'detail': 'An account with this email already exists'}, status=400)
        
        # Create the new user
        name = request.data.get('name')
        user = User.objects.create(
            name=name,
            email=email,
            password=request.data.get('password'),
            role=request.data.get('role', 'customer'),
            avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={name}"
        )
        
        serializer = UserSerializer(user)
        token = f"eattix-token-{user.id}-{uuid.uuid4()}"
        
        return Response({
            'user': serializer.data, 
            'token': token
        })


class LogoutView(APIView):
    def post(self, request):
        # React handles clearing the token from localStorage, 
        # so Django just needs to send a success message.
        return Response({'success': True})


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        # Always return newest orders first
        queryset = Order.objects.all().order_by('-placed_at')
        
        # Matches: getOrdersByCustomer -> /api/orders/?customerId=...
        customer_id = self.request.query_params.get('customerId', None)
        if customer_id:
            queryset = queryset.filter(customer=customer_id)
            
        # Matches: getOrdersByStall -> /api/orders/?stallId=...
        stall_id = self.request.query_params.get('stallId', None)
        if stall_id:
            queryset = queryset.filter(stall=stall_id)
            
        return queryset

    # Matches: updateOrderStatus -> /api/orders/:orderId/status/
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        order = self.get_object()
        status_val = request.data.get('status')
        if status_val:
            order.status = status_val
            order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)