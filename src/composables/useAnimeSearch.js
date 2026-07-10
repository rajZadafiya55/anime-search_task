import { ref, reactive } from 'vue'
import { getAnimeList } from '../services/animeService'

export function useAnimeSearch() {
  const animes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalRecords = ref(0)

  const searchParams = reactive({
    q: '',
    status: 'All',
    type: null,
    page: 1,
    limit: 5,
    order_by: 'start_date',
    sort: 'desc'
  })

  const fetchAnimes = async () => {
    loading.value = true
    error.value = null
    try {
      const params = { page: searchParams.page, limit: searchParams.limit }
      if (searchParams.q) params.q = searchParams.q
      if (searchParams.status && searchParams.status !== 'All') params.status = searchParams.status.toLowerCase()
      if (searchParams.type) params.type = searchParams.type.toLowerCase().replace(' ', '_')
      if (searchParams.order_by) params.order_by = searchParams.order_by
      if (searchParams.sort) params.sort = searchParams.sort

      const data = await getAnimeList(params)
      animes.value = data.data || []

      if (data.pagination && data.pagination.items) {
        totalRecords.value = data.pagination.items.total || 0
      } else {
        totalRecords.value = 0
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch anime'
      animes.value = []
      totalRecords.value = 0
    } finally {
      loading.value = false
    }
  }

  let debounceTimer = null
  const debouncedFetchAnimes = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fetchAnimes()
    }, 100)
  }

  return {
    animes,
    loading,
    error,
    totalRecords,
    searchParams,
    fetchAnimes: debouncedFetchAnimes
  }
}
