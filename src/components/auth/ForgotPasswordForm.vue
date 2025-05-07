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
      v-if="success"
      type="success"
      variant="tonal"
      closable
      class="mb-4"
    >
      Password reset instructions have been sent to your email.
    </v-alert>

    <v-card-text class="text-center mb-4">
      <h3 class="text-h6 mb-2">Forgot Your Password?</h3>
      <p class="text-body-1">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
    </v-card-text>

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

    <v-btn
      color="primary"
      type="submit"
      block
      :loading="loading"
      class="mt-4"
    >
      Send Reset Instructions
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits(['success'])
const { resetPassword } = useAuth()

// Form state
const form = ref(null)
const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const authError = ref('')

// Methods
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return
  
  loading.value = true
  error.value = ''
  
  try {
    await resetPassword(email.value)
    success.value = true
    setTimeout(() => {
      emit('success')
    }, 3000)
  } catch (err) {
    error.value = err.message || 'Failed to send reset instructions. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
