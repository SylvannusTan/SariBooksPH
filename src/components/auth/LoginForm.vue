<template>
  <v-form @submit.prevent="handleSubmit" ref="form">
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
    >
      {{ error }}
    </v-alert>
    
    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      closable
      class="mb-4"
    >
      {{ successMessage }}
    </v-alert>

    <v-text-field
      v-model="email"
      label="Email"
      type="email"
      required
      :rules="[
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid'
      ]"
      autocomplete="email"
    ></v-text-field>

    <v-text-field
      v-model="password"
      label="Password"
      :type="showPassword ? 'text' : 'password'"
      required
      :rules="[v => !!v || 'Password is required']"
      autocomplete="current-password"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="showPassword = !showPassword"
    ></v-text-field>

    <v-btn
      color="primary"
      type="submit"
      block
      :loading="loading"
      class="mt-4"
    >
      Login
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits(['success'])
const route = useRoute()
const { signIn, error: authError } = useAuth()

// Form state
const form = ref(null)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

// Methods
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return
  
  loading.value = true
  error.value = ''
  
  try {
    await signIn(email.value, password.value)
    emit('success')
  } catch (err) {
    error.value = err.message || 'Failed to login. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  // Check for success message in query params
  if (route.query.message) {
    successMessage.value = route.query.message
  }
})

watch(
  () => authError.value,
  (newError) => {
    if (newError) {
      error.value = newError
    }
  }
)
</script>
