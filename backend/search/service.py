"""Pure, independently testable listing search and ranking logic."""
import json
import math
from datetime import date
from pathlib import Path

DATA_PATH = Path(__file__).with_name('listings.json')


def load_listings():
    with DATA_PATH.open(encoding='utf-8') as file:
        return json.load(file)


def relevance_score(listing, target_budget=None):
    listed_date = date.fromisoformat(listing["listedDate"])

    days_old = max(
        0,
        (date.today() - listed_date).days
    )

    # Recency score between 0 and 1
    recency_score = max(0, 1 - days_old / 90)

    # No budget provided: rank entirely by recency
    if target_budget is None:
        return round(recency_score * 100, 2)

    if target_budget <= 0:
        raise ValueError("Target budget must be positive")

    # Budget fit score between 0 and 1
    budget_score = max(
        0,
        1 - abs(listing["price"] - target_budget)
        / target_budget
    )

    # Weighted relevance score
    relevance_score = (
        0.7 * budget_score +
        0.3 * recency_score
    ) * 100

    return round(relevance_score, 2)


def search_listings(listings, *, min_price=None, max_price=None, min_bedrooms=None,
                    city='', keyword='', target_budget=None, page=1, page_size=5, today=None):
    """Filter -> score -> stable sort -> paginate. Inputs validated at the API boundary."""
    city = city.strip().casefold()
    keyword = keyword.strip().casefold()
    filtered = [item for item in listings
                if (min_price is None or item['price'] >= min_price)
                and (max_price is None or item['price'] <= max_price)
                and (min_bedrooms is None or item['bedrooms'] >= min_bedrooms)
                and (not city or item['city'].strip().casefold() == city)
                and (not keyword or keyword in item['description'].casefold())]

    ranked = [{**item, 'relevanceScore': relevance_score(item, target_budget)}
              for item in filtered]
    ranked.sort(key=lambda item: (-item['relevanceScore'], -date.fromisoformat(item['listedDate']).toordinal(),
                                  item['source'], item['id']))
    total = len(ranked)
    total_pages = math.ceil(total / page_size)
    if total_pages and page > total_pages:
        raise ValueError(f'Page {page} is out of range; last page is {total_pages}.')
    if not total and page > 1:
        raise ValueError('Page is out of range; no results match the filters.')
    start = (page - 1) * page_size
    return {'results': ranked[start:start + page_size], 'total': total, 'page': page,
            'pageSize': page_size, 'totalPages': total_pages}
