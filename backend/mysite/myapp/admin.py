from django.contrib import admin

# Register your models here.
from .models import Book,Review,Order,LikedBook

admin.site.register(Book)
admin.site.register(Order)
admin.site.register(LikedBook)

admin.site.register(Review)

