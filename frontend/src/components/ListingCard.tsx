import type { Listing } from '../types';

const money = (amount: number) => amount.toLocaleString('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
});

type Props = { listing: Listing; hasBudget: boolean };

export default function ListingCard({ listing, hasBudget }: Props) {
  return (
    <article className="listing">
      <div className="listing-main">
        <div className="listing-top">
          <h3>{listing.address}</h3>
          <span className="score">
            {hasBudget ? 'Relevance' : 'Recency'}: {listing.relevanceScore.toFixed(2)}
          </span>
        </div>
        <p className="location">{listing.city}, {listing.state} {listing.zip} · {listing.source} · {listing.status}</p>
        <p className="details">
          <strong>{money(listing.price)}</strong>
          <span>{listing.bedrooms} beds</span>
          <span>{listing.bathrooms} baths</span>
          <span>{listing.sqft.toLocaleString()} sqft</span>
        </p>
        <p className="description">{listing.description}</p>
        <p className="listed-date">Listed {listing.listedDate}</p>
      </div>
    </article>
  );
}
