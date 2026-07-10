<script setup>
import { ref, watch, computed } from 'vue'
import { useAnimeSearch } from '../composables/useAnimeSearch'
import { useFavorites } from '../composables/useFavorites'

const searchInput = ref('')
const { animes, loading, error, totalRecords, searchParams, fetchAnimes } = useAnimeSearch()
const { toggleFavorite, isFavorite } = useFavorites()
let debounceTimeout = null

const headers = [
  { title: 'Image', key: 'images', sortable: false },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Episodes', key: 'episodes', sortable: false },
  { title: 'Score', key: 'score', sortable: false },
  { title: 'Rank', key: 'rank', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const hasFilters = computed(() => {
  return searchParams.q || searchParams.status !== 'All' || searchParams.type
})

watch(searchInput, (newQuery) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    searchParams.q = newQuery
    searchParams.page = 1
    fetchAnimes()
  }, 400)
})

const onFilterChange = () => {
  searchParams.page = 1
  fetchAnimes()
}

const clearSearch = () => {
  searchInput.value = ''
  searchParams.q = ''
  searchParams.page = 1
  fetchAnimes()
}

const clearStatus = () => {
  searchParams.status = 'All'
  searchParams.page = 1
  fetchAnimes()
}

const clearType = () => {
  searchParams.type = null
  searchParams.page = 1
  fetchAnimes()
}

const clearAll = () => {
  searchInput.value = ''
  searchParams.q = ''
  searchParams.status = 'All'
  searchParams.type = null
  searchParams.page = 1
  fetchAnimes()
}

const updateOptions = (options) => {
  const { page, itemsPerPage, sortBy } = options
  
  searchParams.page = page
  searchParams.limit = itemsPerPage
  
  if (sortBy && sortBy.length > 0) {
    searchParams.order_by = sortBy[0].key
    searchParams.sort = sortBy[0].order
  } else {
    searchParams.order_by = 'start_date'
    searchParams.sort = 'desc'
  }
  
  fetchAnimes()
}

const getAnimeId = (row) => {
  return row.raw?.mal_id || row.mal_id || row.value || row.columns?.mal_id
}

const getRawAnime = (row) => {
  const id = getAnimeId(row)
  return animes.value.find(a => a.mal_id === id) || row.raw || row
}

const getScoreColor = (score) => {
  if (!score) return 'grey'
  if (score >= 8) return 'success'
  if (score >= 6) return 'warning'
  return 'error'
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Anime Search</h1>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchInput"
              label="Search Anime"
              variant="outlined"
              clearable
              prepend-inner-icon="mdi-magnify"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="searchParams.type"
              :items="['TV', 'Movie', 'OVA', 'Special', 'ONA', 'Music', 'CM', 'PV', 'TV Special']"
              label="Type Filter"
              variant="outlined"
              clearable
              hide-details
              @update:model-value="onFilterChange"
            ></v-select>
          </v-col>
        </v-row>

        <v-tabs v-model="searchParams.status" class="mb-4 mt-4" @update:model-value="onFilterChange">
          <v-tab value="All">All</v-tab>
          <v-tab value="Airing">Airing</v-tab>
          <v-tab value="Complete">Complete</v-tab>
          <v-tab value="Upcoming">Upcoming</v-tab>
        </v-tabs>

        <div v-if="hasFilters" class="d-flex align-center flex-wrap mb-4" style="gap: 8px;">
          <v-chip v-if="searchParams.q" closable @click:close="clearSearch">
            Search: {{ searchParams.q }}
          </v-chip>
          <v-chip v-if="searchParams.status !== 'All'" closable @click:close="clearStatus">
            Status: {{ searchParams.status }}
          </v-chip>
          <v-chip v-if="searchParams.type" closable @click:close="clearType">
            Type: {{ searchParams.type }}
          </v-chip>
          <v-btn variant="text" size="small" @click="clearAll">Clear All</v-btn>
        </div>

        <v-alert
          v-if="error"
          type="error"
          class="mb-6"
        >
          {{ error }}
        </v-alert>

        <v-data-table-server
          v-model:page="searchParams.page"
          :headers="headers"
          :items="animes"
          :loading="loading"
          :items-length="totalRecords"
          :items-per-page="searchParams.limit"
          :items-per-page-options="[5, 10, 15, 25]"
          item-value="mal_id"
          class="elevation-1"
          @update:options="updateOptions"
        >
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
          </template>

          <template v-slot:no-data>
            <v-alert type="info" variant="tonal" class="ma-4">
              No Anime Found
            </v-alert>
          </template>

          <template v-slot:item.images="{ item }">
            <v-img
              :src="(item.raw || item).images?.jpg?.image_url"
              :alt="(item.raw || item).title"
              width="50"
              height="70"
              cover
              class="my-2 rounded"
            ></v-img>
          </template>

          <template v-slot:item.score="{ item }">
            <v-chip
              :color="getScoreColor((item.raw || item).score)"
              size="small"
              v-if="(item.raw || item).score"
            >
              {{ (item.raw || item).score }}
            </v-chip>
            <span v-else>N/A</span>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              variant="text"
              :color="isFavorite(getAnimeId(item)) ? 'red' : 'grey'"
              @click="toggleFavorite(getRawAnime(item))"
              :title="isFavorite(getAnimeId(item)) ? 'Remove favorite' : 'Add to favorites'"
            >
              <v-icon>{{ isFavorite(getAnimeId(item)) ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
            </v-btn>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </v-container>
</template>
