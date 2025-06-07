from rest_framework import serializers
from .models import Book, Review,LikedBook

class BookSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True) 
    class Meta:
        model = Book
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = '__all__'


class LikedBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikedBook
        fields = '__all__'


