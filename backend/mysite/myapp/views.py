from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from .models import Book, Review,User,LikedBook
from .serializers import BookSerializer, ReviewSerializer,LikedBookSerializer
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.permissions import IsAuthenticated

class BookListAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Ensures the user is authenticated

    def get(self, request, user):
        # Filter books by user if needed
        books = Book.objects.filter(user__username=user)  # Adjust according to your model structure
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@csrf_exempt

def register_view(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)
        if not username or not password:
            return JsonResponse({"error": "Username and password are required"}, status=400)
        
        User.objects.create_user(username=username, password=password)
        
        return JsonResponse({"message": "User registered successfully!"}, status=201)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt

def login_view(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
                
            login(request, user)
            return JsonResponse({"message": "Login successful!"}, status=200)

        else:
            return JsonResponse({"error": "Invalid credentials"}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)



class BookListAPIView(APIView):
    
    def get(self, request,user):
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

class BookDetailAPIView(APIView):
   

    def get(self, request, id,user):
        try:
            book = Book.objects.get(pk=id)
            user_obj = User.objects.get(username=user)
            is_liked = book.liked_by.filter(id=user_obj.id).exists() 
            book_data = BookSerializer(book).data
            book_data["is_liked"] = is_liked 
            return Response(book_data)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
        

    def post(self, request, id, user):
        try:
            # Get the book and user objects
            book = Book.objects.get(pk=id)
            user_obj = User.objects.get(username=user)
            
            # Toggle the "liked_by" relationship
            if book.liked_by.filter(id=user_obj.id).exists():
                book.liked_by.remove(user_obj)  # Remove the user from the liked list
                is_liked = False
            else:
                book.liked_by.add(user_obj)  # Add the user to the liked list
                is_liked = True

            # Serialize the book data and send back the "is_liked" status
            book_data = BookSerializer(book).data
            book_data["is_liked"] = is_liked
            return Response(book_data)

        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)



class ReviewAPIView(APIView):

    def get(self, request, id):
        try:
            book = Book.objects.get(id=id)
            reviews = Review.objects.filter(book=book)
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, id):
        try:
            book = Book.objects.get(id=id)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        data["book"] = book.id

        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class LikedBookAPIView(APIView):

    def post(self, request, book_id):
        user = request.user
        book = Book.objects.get(id=book_id)

        # Add to liked_by
        if user not in book.liked_by.all():
            book.liked_by.add(user)
            return Response({"message": "Book liked"}, status=status.HTTP_200_OK)
        
        return Response({"message": "Already liked"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, book_id):
        user = request.user
        book = Book.objects.get(id=book_id)

        # Remove from liked_by
        if user in book.liked_by.all():
            book.liked_by.remove(user)
            return Response({"message": "Book unliked"}, status=status.HTTP_200_OK)
        
        return Response({"message": "Not liked yet"}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request,user):
        user= get_object_or_404(User,username=user)

        liked_books = Book.objects.filter(liked_by=user)

        # Prepare the response data
        books_data = []
        for book in liked_books:
            books_data.append({
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "image": book.image.url if book.image else None,
            })

        return Response({"liked_books": books_data}, status=status.HTTP_200_OK)

from google.oauth2 import id_token
from google.auth.transport import requests
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login


GOOGLE_CLIENT_ID = "538317814599-ucsjb8a4ollj15te80hv3tjpmfc22uj5.apps.googleusercontent.com"

@csrf_exempt
def google_login_view(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        token = data.get("token")

        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

            # Extract user info
            email = idinfo.get("email")
            username = idinfo.get("name")

            # Check if the user already exists, if not, create a new one
            user, created = User.objects.get_or_create(username=username, defaults={"email": email})

            # Log the user in
            login(request, user)

            # Send the username in the response
            return JsonResponse({"message": "Google login successful!", "username": user.username}, status=200)

        except ValueError as e:
            return JsonResponse({"error": "Invalid token", "details": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


import razorpay
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Initialize Razorpay client with your API keys
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
import json



@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        try:
            # Get the amount (in rupees) from the request
            import json
            data = json.loads(request.body)
            amount = data.get("amount")  # Amount in paise

            # Check for valid amount
            if not amount or amount <= 0:
                return JsonResponse({'error': 'Invalid amount'}, status=400)

            # Create a Razorpay order
            order_data = {
                'amount': amount,
                'currency': 'INR',
                'payment_capture': 1,
            }

            # Create the order via Razorpay client
            order = client.order.create(data=order_data)

            if order['status'] == 'created':
                return JsonResponse({
                    'order_id': order['id'],
                    'amount': order['amount'],
                    'currency': order['currency'],
                })

            return JsonResponse({'error': 'Order creation failed'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
