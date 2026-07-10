import { ref, watch } from 'vue'

const FAVORITES_KEY = 'anime_favorites'

export function useFavorites() {
  const favorites = ref(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [])

  watch(favorites, (newFavorites) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
  }, { deep: true })

  const toggleFavorite = (anime) => {
    const index = favorites.value.findIndex(f => f.mal_id === anime.mal_id)
    if (index === -1) {
      favorites.value.push(anime)
    } else {
      favorites.value.splice(index, 1)
    }
  }

  const isFavorite = (id) => {
    return favorites.value.some(f => f.mal_id === id)
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite
  }
}
