from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from rest_framework import status 
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
# pyrefly: ignore [missing-import]
from .models import Product, Category, Cart, CartItem, Order,OrderItem, UserProfile
# pyrefly: ignore [missing-import]
from .serializers import (
    ProductSerializer, CategorySerializer,
    CartSerializer, CartItemSerializer,
    ProfileSerializer
)
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken


# Custom permission
class IsProfileCompeleted(BasePermission):
    message = 'Profile is incomplete.'

    def has_permission(self,request,view):
        try:
            profile = UserProfile.objects.get(user = request.user)
            is_compeleted = bool(profile.phone and profile.address)
            return is_compeleted
        except UserProfile.DoesNotExist:
            return False



# Create your views here.


@api_view(['GET'])
@permission_classes([AllowAny])
def get_products(request):
    product = Product.objects.all()
    serializer = ProductSerializer(product,many= True)

    return Response(serializer.data)


@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_product(request,pk):
    try:
       product = Product.objects.get(id=pk)
       serializer = ProductSerializer(product,context = {'request':request})
       return Response(serializer.data)

    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated,IsProfileCompeleted])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated,IsProfileCompeleted])
def add_to_cart(request):
    product_id = request.data.get('product_id')

    try:
        product = Product.objects.get(id = product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    cart,created = Cart.objects.get_or_create(user= request.user)

    item,item_created = CartItem.objects.get_or_create(
        cart = cart,product = product
    )

    if not item_created:
        item.quantity += 1
        item.save()
    
    serializer = CartSerializer(cart)
    return Response({
        'message': 'Product added to cart',
        'cart': serializer.data
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated,IsProfileCompeleted])
def remove_from_cart(request):
    item_id = request.data.get('item_id')
    CartItem.objects.filter(id=item_id, cart__user=request.user).delete()
    return Response({'message': 'Item removed from cart'})
 

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsProfileCompeleted])
def update_cart_quantity(request):
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')

    if not item_id or quantity is None:
        return Response(
            {'error': 'Item ID and quantity are required'},
            status=400
        )

    try:
        item = CartItem.objects.get(id=item_id, cart__user=request.user)

        if int(quantity) < 1:
            return Response(
                {'error': 'Quantity must be at least 1'},
                status=400
            )
        item.quantity = quantity
        item.save()

        serializer = CartItemSerializer(item)
        return Response(serializer.data)
    
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart Item Not Found'}, status=404)
    

# Order Views
@api_view(['POST'])
@permission_classes([IsAuthenticated,IsProfileCompeleted])
def create_order(request):
    try:
        data = request.data
        address = data.get('address')
        phone = data.get('phone')
        payment_method = data.get('payment_method', 'COD')
        cart, created = Cart.objects.get_or_create(user= request.user)

        if not cart or not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status = 400)
        total = sum(
            float(item.product.price) * item.quantity
            for item in cart.items.all()
        )

        order = Order.objects.create(
            user=request.user,
            total_amount=total,
            address=address,
            phone=phone,
            payment_method=payment_method
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        
        cart.items.all().delete()

        return Response({
            'message': 'Order placed successfully',
            'order_id': order.id
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Email verification setup
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Build the confirmation URL pointing to React frontend
        activation_link = f"http://localhost:5173/verify-email/{uid}/{token}/"
        
        subject = "Activate your ShopNest Account"
        message = (
            f"Hi {user.username},\n\n"
            f"Thank you for registering at ShopNest! Please click the link below to verify your email address:\n\n"
            f"{activation_link}\n\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"Happy shopping!\n"
            f"The ShopNest Team"
        )
        
        email_sent = False
        try:
            send_mail(
                subject,
                message,
                'no-reply@shopnest.com',  
                [user.email],             
                fail_silently=False,
            )
            email_sent = True
        except Exception as e:
            # Print/log the email sending failure for debugging
            print(f"Error sending verification email: {e}")

        response_data = {
            'message': 'Account created successfully! Please check your email to verify and activate your account.',
            'user': UserSerializer(user).data,
            'email_sent': email_sent
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    
    if not uidb64 or not token:
        return Response({'error': 'UID and Token are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
        
    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({'message': 'Email verified successfully! You can now log in.'}, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid or expired verification link.'}, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')

            response.set_cookie(
                key='access_token',
                value=access_token,
                max_age=3600, # 1 hour
                httponly=True,
                samesite='Lax'
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                max_age=3600 * 24, # 24 hours
                httponly=True,
                samesite='Lax'
            )
        return response



GOOGLE_CLIENT_ID = getattr(settings, 'GOOGLE_CLIENT_ID', '')


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login_view(request):
    token = request.data.get('token')

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        email = idinfo['email']
        username = idinfo.get('name',email.split('@')[0])

        user, created = User.objects.get_or_create(email = email,defaults = {'username': username,'is_active': True})
        
        if not user.is_active:
            user.is_active = True
            user.save()

        refresh = RefreshToken.for_user(user)
        
        # Create response
        response = Response({
            'message': 'Google Login successful',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status = status.HTTP_200_OK)

        # Set cookies
        response.set_cookie('access_token', str(refresh.access_token), max_age=3600, httponly=True, samesite='Lax')
        response.set_cookie('refresh_token', str(refresh), max_age=3600 * 24, httponly=True, samesite='Lax')

        return response

    except ValueError:
        return Response({'error': 'Invalid google Token'}, status = status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response

    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_status(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        is_completed = bool(
            user_profile.phone and user_profile.phone.strip() and
            user_profile.address and user_profile.address.strip()
        )
        return Response({
            'has_profile': True,
            'is_completed': is_completed,
            'profile': {
                'phone': user_profile.phone,
                'address': user_profile.address,
            }
        })
    except UserProfile.DoesNotExist:
        return Response({
            'has_profile': False,
            'is_completed': False
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_or_update_profile(request):
    phone = request.data.get('phone', '')
    address = request.data.get('address', '')
    active = request.data.get('active', True)

    profile, created = UserProfile.objects.get_or_create(user=request.user)
    profile.phone = phone
    profile.address = address
    profile.active = active
    profile.save()

    return Response({'message': 'Profile saved successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Safe response to prevent email harvesting
        return Response({
            'message': 'If an account exists with this email, a password reset link has been sent.',
            'email_sent': False
        }, status=status.HTTP_200_OK)
        
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"
    
    subject = "Reset your ShopNest Password"
    message = (
        f"Hi {user.username},\n\n"
        f"We received a request to reset your password for your ShopNest account. "
        f"Please click the link below to set a new password:\n\n"
        f"{reset_link}\n\n"
        f"If you did not request a password reset, please ignore this email.\n\n"
        f"The ShopNest Team"
    )
    
    email_sent = False
    try:
        send_mail(
            subject,
            message,
            'no-reply@shopnest.com',  
            [user.email],             
            fail_silently=False,
        )
        email_sent = True
    except Exception as e:
        print(f"Error sending password reset email: {e}")

    return Response({
        'message': 'If an account exists with this email, a password reset link has been sent.',
        'email_sent': email_sent
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not uidb64 or not token or not new_password:
        return Response({'error': 'UID, Token, and New Password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
        
    if user is not None and default_token_generator.check_token(user, token):
        user.set_password(new_password)
        # Ensure user can log in
        user.is_active = True
        user.save()
        return Response({'message': 'Password has been reset successfully! You can now log in.'}, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid or expired password reset link.'}, status=status.HTTP_400_BAD_REQUEST)