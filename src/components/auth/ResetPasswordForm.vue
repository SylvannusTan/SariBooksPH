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

    <v-card-text class="text-center mb-4">
      <h3 class="text-h6 mb-2">Reset Your Password</h3>
      <p class="text-body-1">
        Enter your new password below.
      </p>
    </v-card-text>

    <v-text-field
      v-model="password"
      label="New Password"
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
      label="Confirm New Password"
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

    <v-btn
      color="primary"
      type="submit"
      block
      :loading="loading"
      class="mt-4"
    >
      Reset Password
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const emit = defineEmits(['success'])

// Form state
const form = ref(null)
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')

// Methods
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return
  
  loading.value = true
  error.value = ''
  
  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: password.value
    })
    
    if (updateError) throw updateError
    
    emit('success')
  } catch (err) {
    error.value = err.message || 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
