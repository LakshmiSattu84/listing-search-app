from datetime import date
from django.test import SimpleTestCase
from rest_framework.test import APIClient
from .service import load_listings, relevance_score, search_listings

TODAY = date(2026, 9, 5)


class SearchServiceTests(SimpleTestCase):
    def setUp(self):
        self.listings = load_listings()

    def test_city_case_insensitive_and_keyword(self):
        response = search_listings(self.listings, city=' springfield ', keyword='fenced', today=TODAY)
        self.assertEqual(response['total'], 2)

    def test_price_and_bedroom_filters(self):
        response = search_listings(self.listings, min_price=450000, max_price=500000,
                                   min_bedrooms=3, today=TODAY)
        self.assertEqual({x['id'] for x in response['results']}, {'A5', 'B11'})

    def test_no_matches(self):
        response = search_listings(self.listings, city='Atlantis', today=TODAY)
        self.assertEqual(response['results'], [])
        self.assertEqual(response['totalPages'], 0)

    def test_ranking_prefers_budget_fit_when_dates_equal(self):
        base = {'listedDate': '2026-09-05', 'source': 'MLS_A', 'description': ''}
        items = [{**base, 'id': 'cheap', 'price': 400000, 'bedrooms': 2, 'city': 'X'},
                 {**base, 'id': 'close', 'price': 500000, 'bedrooms': 2, 'city': 'X'}]
        response = search_listings(items, target_budget=500000, today=TODAY)
        self.assertEqual(response['results'][0]['id'], 'close')

    def test_tied_scores_have_deterministic_order(self):
        base = {'listedDate': '2026-09-05', 'price': 500000, 'source': 'MLS_A',
                'description': '', 'city': 'X', 'bedrooms': 2}
        items = [{**base, 'id': 'Z'}, {**base, 'id': 'A'}]
        response = search_listings(items, target_budget=500000, today=TODAY)
        self.assertEqual([x['id'] for x in response['results']], ['A', 'Z'])

    def test_pagination_last_page(self):
        response = search_listings(self.listings, page=3, page_size=5, today=TODAY)
        self.assertEqual((response['total'], response['totalPages'], len(response['results'])), (12, 3, 2))

    def test_out_of_range_page(self):
        with self.assertRaises(ValueError):
            search_listings(self.listings, page=4, page_size=5, today=TODAY)

    def test_more_recent_scores_higher(self):
        newer = {'price': 450000, 'listedDate': '2026-09-04'}
        older = {'price': 450000, 'listedDate': '2026-08-01'}
        self.assertGreater(relevance_score(newer, 450000, TODAY),
                           relevance_score(older, 450000, TODAY))


class ListingAPITests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def test_success(self):
        response = self.client.get('/api/listings/', {'pageSize': 3})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 3)
        self.assertEqual(response.data['total'], 12)

    def test_invalid_min_max(self):
        response = self.client.get('/api/listings/', {'minPrice': 600000, 'maxPrice': 100000})
        self.assertEqual(response.status_code, 400)
        self.assertIn('minPrice', response.data['errors'])

    def test_invalid_page_size(self):
        response = self.client.get('/api/listings/', {'pageSize': 0})
        self.assertEqual(response.status_code, 400)

    def test_invalid_negative_bedrooms(self):
        response = self.client.get('/api/listings/', {'minBedrooms': -1})
        self.assertEqual(response.status_code, 400)

    def test_invalid_budget(self):
        response = self.client.get('/api/listings/', {'targetBudget': 0})
        self.assertEqual(response.status_code, 400)

    def test_out_of_range_page(self):
        response = self.client.get('/api/listings/', {'page': 999})
        self.assertEqual(response.status_code, 400)
