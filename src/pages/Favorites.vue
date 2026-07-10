<script setup>
import { useFavorites } from '../composables/useFavorites'

const { favorites, toggleFavorite } = useFavorites()

const headers = [
  { title: 'Image', key: 'images', sortable: false },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Episodes', key: 'episodes', sortable: true },
  { title: 'Score', key: 'score', sortable: true },
  { title: 'Rank', key: 'rank', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const getScoreColor = (score) => {
  if (!score) return 'grey'
  if (score >= 8) return 'success'
  if (score >= 6) return 'warning'
  return 'error'
}

const getAnimeId = (row) => {
  return row.raw?.mal_id || row.mal_id || row.value || row.columns?.mal_id
}

const getRawAnime = (row) => {
  const id = getAnimeId(row)
  return favorites.value.find(a => a.mal_id === id) || row.raw || row
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Favorites</h1>
        
        <v-data-table
          :headers="headers"
          :items="favorites"
          item-value="mal_id"
          class="elevation-1"
        >
          <template v-slot:no-data>
            <v-alert type="info" variant="tonal" class="ma-4">
              No Favorites Found
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
              color="red"
              @click="toggleFavorite(getRawAnime(item))"
              title="Remove from favorites"
            >
              <v-icon>mdi-heart-broken</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>
