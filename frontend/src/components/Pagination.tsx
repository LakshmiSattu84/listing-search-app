type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 0) return null;
  return (
    <nav className="pagination" aria-label="Search result pages">
      <button type="button" className="secondary" disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}>Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button type="button" className="secondary" disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}>Next</button>
    </nav>
  );
}
