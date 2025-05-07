<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <h1 class="text-h2 mb-6">404</h1>
        <h2 class="text-h4 mb-6">Page Not Found</h2>
        <p class="text-body-1 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <v-btn
          color="primary"
          :to="{ name: 'dashboard' }"
          prepend-icon="mdi-home"
        >
          Go to Dashboard
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Add default export for router
defineOptions({
  name: 'NotFoundView'
})
</script>
