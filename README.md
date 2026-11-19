# Listing Search Service — React/TypeScript + Django REST Framework

A full-stack solution for the supplied Software Engineer Coding Assessment. Uses the provided 12-record JSON dataset. No database setup required.

## Requirements
- Python 3.10+ (Python 3.12 recommended)
- Node.js 20+

## Start backend (terminal 1)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py runserver 8000
```
Backend: http://127.0.0.1:8000/api/listings/

## Start frontend (terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

Vite proxies `/api` to Django, so the browser doesn't require special CORS configuration in development.

## Run tests
```bash
cd backend
source .venv/bin/activate
python manage.py test search
```

## API
`GET /api/listings/?minPrice=400000&maxPrice=600000&minBedrooms=3&city=Springfield&keyword=fenced&targetBudget=500000&page=1&pageSize=5`

All filters optional. Defaults: `page=1`, `pageSize=5`.

Successful response:
```json
{
  "results": [{"id": "A2", "source": "MLS_A", "address": "456 Oak Ave", "relevanceScore": 89.12}],
  "total": 2, "page": 1, "pageSize": 5, "totalPages": 1
}
```
The `results` objects contain all original listing fields plus `relevanceScore`; the example above is illustrative, not an exact response.

Invalid inputs return HTTP 400 with an `errors` object, including negative prices, nonpositive page size/budget, `minPrice > maxPrice`, and out-of-range pages. A no-match search on page 1 returns HTTP 200 with an empty `results` list.

## Scoring
With target budget B > 0:
- **Budget fit** = `max(0, 1 - abs(price - B) / B)`
- **Recency** = `1 / (1 + max(0, days_since_listed) / 30)`
- **Relevance score** = `round(100 * (0.70 * budget_fit + 0.30 * recency), 2)`

Without a target budget, score is `100 * recency`, avoiding an arbitrary assumed budget. Higher scores are better. Scores are calculated against the current server date. Exact score ties are resolved by newest listing first, then source, then ID for deterministic pagination.

## Trade-offs and follow-up extensions
- JSON is read on each request: ideal for a 12-record interview exercise, not production scale. At scale, import to PostgreSQL, index filter fields, and use database-backed pagination.
- Listings are identified by `(source, id)`, not `id` alone. Cross-feed duplicates remain visible intentionally because deduplication was not explicitly requested. A future deduplication feature could cluster normalized addresses + geolocation and define canonical record selection.
- City uses case-insensitive exact matching with trimmed whitespace; keyword uses case-insensitive substring matching on description only.
- Ranking is explainable and deterministic, but simple. Production relevance could use calibrated weights, geospatial proximity, full-text search, and listing status policy.
- Pagination is offset-based; cursor pagination is preferable for rapidly changing large result sets.
- All statuses are included because the assessment does not specify an active-only filter.
- This sample is for local development. Production deployment needs secrets, authentication/authorization as appropriate, HTTPS, observability, and robust data validation on ingestion.
