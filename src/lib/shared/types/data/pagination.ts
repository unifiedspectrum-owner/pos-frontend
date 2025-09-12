/* Pagination interface for API responses */
export interface PaginationInfo {
  current_page: number
  limit: number
  total_count: number
  total_pages: number
  has_next_page: boolean
  has_prev_page: boolean
}