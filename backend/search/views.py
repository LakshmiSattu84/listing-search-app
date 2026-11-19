from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .service import load_listings, search_listings


class SearchParamsSerializer(serializers.Serializer):
    minPrice = serializers.FloatField(required=False, min_value=0, allow_null=False)
    maxPrice = serializers.FloatField(required=False, min_value=0, allow_null=False)
    minBedrooms = serializers.IntegerField(required=False, min_value=0)
    city = serializers.CharField(required=False, allow_blank=True, max_length=120)
    keyword = serializers.CharField(required=False, allow_blank=True, max_length=300)
    targetBudget = serializers.FloatField(required=False, min_value=0.01)
    page = serializers.IntegerField(required=False, min_value=1, default=1)
    pageSize = serializers.IntegerField(required=False, min_value=1, max_value=100, default=5)

    def validate(self, attrs):
        if ('minPrice' in attrs and 'maxPrice' in attrs
                and attrs['minPrice'] > attrs['maxPrice']):
            raise serializers.ValidationError({'minPrice': 'Must be less than or equal to maxPrice.'})
        return attrs


class ListingSearchView(APIView):
    def get(self, request):
        params = SearchParamsSerializer(data=request.query_params)
        if not params.is_valid():
            return Response({'errors': params.errors}, status=status.HTTP_400_BAD_REQUEST)
        values = params.validated_data
        try:
            response = search_listings(
                load_listings(), min_price=values.get('minPrice'), max_price=values.get('maxPrice'),
                min_bedrooms=values.get('minBedrooms'), city=values.get('city', ''),
                keyword=values.get('keyword', ''), target_budget=values.get('targetBudget'),
                page=values['page'], page_size=values['pageSize'])
        except ValueError as exc:
            return Response({'errors': {'page': [str(exc)]}}, status=status.HTTP_400_BAD_REQUEST)
        return Response(response)
