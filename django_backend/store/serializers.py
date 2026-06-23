from rest_framework import serializers, exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Product, Category, Cart,CartItem, UserProfile
from django.contrib.auth.models import User
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    class Meta:
        model = Product
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(
        source='product.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    product_image = serializers.ImageField(
        source='product.image',
        read_only=True
    )

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_name', 'product_price',
            'product_image', 'quantity'
        ]

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only = True)

    total = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = '__all__'


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email']

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        
        email = data.get('email')
        if not email:
            raise serializers.ValidationError({'email': 'Email is required.'})
            
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'A user with this email already exists.'})
            
        return data

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_active=False 
        )

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get('password')
        
        user = None
       
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                pass
            

        if user is not None:
            
            attrs[self.username_field] = user.username
           
            if not user.check_password(password):
                raise exceptions.AuthenticationFailed(
                    self.error_messages['no_active_account'],
                    'no_active_account',
                )
            
            
            if not user.is_active:
                from django.contrib.auth.tokens import default_token_generator
                from django.utils.http import urlsafe_base64_encode
                from django.utils.encoding import force_bytes
                from django.core.mail import send_mail
                
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                activation_link = f"http://localhost:5173/verify-email/{uid}/{token}/"
                
                subject = "Activate your ShopNest Account"
                message = (
                    f"Hi {user.username},\n\n"
                    f"It looks like you tried to login but your email is not verified yet. "
                    f"Please click the link below to verify your email address and activate your account:\n\n"
                    f"{activation_link}\n\n"
                    f"Happy shopping!\n"
                    f"The ShopNest Team"
                )
                               
                
                try:
                    send_mail(
                        subject,
                        message,
                        'no-reply@shopnest.com',
                        [user.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    print(f"Error sending verification email during login: {e}")
                
                raise exceptions.AuthenticationFailed(
                    'Your email address is not verified yet. We have resent a new verification link to your email.',
                    'email_not_verified'
                )


              



        return super().validate(attrs)


        