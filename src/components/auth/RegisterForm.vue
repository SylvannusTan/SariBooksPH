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
      :rules="[
        v => !!v || 'Password is required',
        v => v.length >= 8 || 'Password must be at least 8 characters',
        v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
        v => /[0-9]/.test(v) || 'Password must contain at least one number'
      ]"
      autocomplete="new-password"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="showPassword = !showPassword"
    ></v-text-field>

    <v-text-field
      v-model="confirmPassword"
      label="Confirm Password"
      :type="showConfirmPassword ? 'text' : 'password'"
      required
      :rules="[
        v => !!v || 'Please confirm your password',
        v => v === password || 'Passwords do not match'
      ]"
      autocomplete="new-password"
      :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="showConfirmPassword = !showConfirmPassword"
    ></v-text-field>

    <v-checkbox
      v-model="agreeToTerms"
      label="I agree to the Terms of Service and Privacy Policy"
      :rules="[v => !!v || 'You must agree to continue']"
      required
    ></v-checkbox>

    <v-btn
      color="primary"
      type="submit"
      block
      :loading="loading"
      class="mt-4"
    >
      Register
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits(['success'])
const { signUp } = useAuth()

// Form state
const form = ref(null)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeToTerms = ref(false)
const loading = ref(false)
const error = ref('')
const authError = ref('')

// Methods
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return
  
  loading.value = true
  error.value = ''
  
  try {
    await signUp(email.value, password.value)
    emit('success', email.value)
  } catch (err) {
    error.value = err.message || 'Failed to register. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
