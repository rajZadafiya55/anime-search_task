<script setup>
</script>
<template>
  <v-app>
    <v-app-bar title="Anime Tracker" elevation="1">
      <v-spacer></v-spacer>
      
      <v-btn to="/" variant="text" prepend-icon="mdi-magnify" class="mr-4 bg-info">Search</v-btn>
      <v-btn to="/favorites" variant="text" prepend-icon="mdi-heart" class="mr-4 bg-info">Favorites</v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
