from django.urls import path,re_path
from django.conf import settings
from django.conf.urls.static import static
from .views import BookListAPIView, BookDetailAPIView, ReviewAPIView,LikedBookAPIView
from .views import login_view, register_view
from django.contrib.auth.decorators import login_required
from .views import google_login_view
from .views import create_order



urlpatterns = [

    path('api/create-order', create_order, name='create_order'),
    path("google-login/", google_login_view, name="google-login"),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('api/<str:user>/books/', BookListAPIView.as_view(), name='book-list'),
    path('api/<str:user>/books/<int:id>/', BookDetailAPIView.as_view(), name='book-detail'),
    path('api/<str:user>/liked-books/', LikedBookAPIView.as_view(), name='liked-books'),  # Liked books endpoint
    path('api/books/<int:id>/reviews/', ReviewAPIView.as_view(), name='book-reviews'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
