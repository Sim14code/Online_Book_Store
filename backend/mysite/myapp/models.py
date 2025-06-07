from django.db import models
from django.contrib.auth.models import User  # For associating reviews with users

# Book model


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='book_images/', blank=True, null=True)
    published_date = models.DateField(blank=True, null=True)
    liked_by = models.ManyToManyField(User, related_name="liked_books", blank=True)

    def __str__(self):
        return self.title
    
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    razorpay_order_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=[("PENDING", "Pending"), ("SUCCESS", "Success")])
    created_at = models.DateTimeField(auto_now_add=True)





# Review model
class Review(models.Model):
    book = models.ForeignKey(Book, related_name='reviews', on_delete=models.CASCADE)
    comment = models.TextField()
    rating = models.PositiveIntegerField()  # Assuming ratings are integers (e.g., 1-5)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.book.title}"
    

class LikedBook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')
        
    def __str__(self):
        return f"{self.user.username} likes {self.book.title}"


