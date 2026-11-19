from django.urls import path
from search.views import ListingSearchView

urlpatterns = [
    path('api/listings/', 
         ListingSearchView.as_view(),
         name='listing-search')
    ]
