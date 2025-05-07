<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="mx-auto pa-4">
          <v-card-title class="text-center text-h5 mb-4">
            <v-img
              src="/logo.png"
              alt="SariBooks Logo"
              width="180"
              class="mx-auto mb-4"
              v-if="false" 
            ></v-img>
            <span class="text-primary font-weight-bold">SariBooks</span>
          </v-card-title>

          <!-- Login Form -->
          <template v-if="authMode === 'login'">
            <login-form @success="handleLoginSuccess" />
            <v-card-text class="text-center mt-4">
              <p>
                Don't have an account?
                <v-btn variant="text" color="primary" @click="authMode = 'register'">
                  Register
                </v-btn>
              </p>
              <p>
                <v-btn variant="text" color="primary" @click="authMode = 'forgot-password'">
                  Forgot Password?
                </v-btn>
              </p>
            </v-card-text>
          </template>

          <!-- Register Form -->
          <template v-else-if="authMode === 'register'">
            <register-form @success="handleRegisterSuccess" />
            <v-card-text class="text-center mt-4">
              <p>
                Already have an account?
                <v-btn variant="text" color="primary" @click="authMode = 'login'">
                  Login
                </v-btn>
              </p>
            </v-card-text>
          </template>

          <!-- Forgot Password Form -->
          <template v-else-if="authMode === 'forgot-password'">
            <forgot-password-form @success="handleForgotPasswordSuccess" />
            <v-card-text class="text-center mt-4">
              <p>
                <v-btn variant="text" color="primary" @click="authMode = 'login'">
                  Back to Login
                </v-btn>
              </p>
            </v-card-text>
          </template>

          <!-- Reset Password Form -->
          <template v-else-if="authMode === 'reset-password'">
            <reset-password-form @success="handleResetPasswordSuccess" />
          </template>

          <!-- Email Verification -->
          <template v-else-if="authMode === 'verify-email'">
            <v-card-text class="text-center">
              <v-icon icon="mdi-email-check" color="success" size="64" class="mb-4"></v-icon>
              <h3 class="text-h5 mb-2">Verify Your Email</h3>
              <p class="mb-4">
                We've sent a verification email to <strong>{{ email }}</strong>. 
                Please check your inbox and click the verification link to complete your registration.
              </p>
              <p class="text-body-2 text-medium-emphasis mb-4">
                If you don't see the email, check your spam folder or click below to resend.
              </p>
              <v-btn
                color="primary"
                block
                :loading="resendLoading"
                @click="resendVerificationEmail"
              >
                Resend Verification Email
              </v-btn>
              <v-btn
                variant="text"
                color="primary"
                class="mt-4"
                @click="authMode = 'login'"
              >
                Back to Login
              </v-btn>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, resendEmailVerification } = useAuth()

// State
const authMode = ref('login')
const email = ref('')
const resendLoading = ref(false)

// Lifecycle hooks
// Check if user is already authenticated
const isAlreadyAuthenticated = ref(false);

onMounted(() => {
  // Always check authentication status
  isAlreadyAuthenticated.value = isAuthenticated.value;

  if (isAlreadyAuthenticated.value) {
    router.push({ name: 'dashboard' });
    return;
  }

  // Check for query parameters
  const mode = route.query.mode;
  if (mode && ['login', 'register', 'forgot-password', 'reset-password'].includes(mode)) {
    authMode.value = mode;
  }

  // Check for reset password token in URL
  if (route.hash.includes('type=recovery')) {
    authMode.value = 'reset-password';
  }
});

// Methods
const handleLoginSuccess = () => {
  router.push({ name: 'dashboard' })
}

const handleRegisterSuccess = (userEmail) => {
  email.value = userEmail
  authMode.value = 'verify-email'
}

const handleForgotPasswordSuccess = () => {
  router.push({ 
    name: 'auth', 
    query: { mode: 'login', message: 'Password reset instructions sent to your email' } 
  })
}

const handleResetPasswordSuccess = () => {
  router.push({ 
    name: 'auth', 
    query: { mode: 'login', message: 'Password has been reset successfully' } 
  })
}

const resendVerificationEmail = async () => {
  if (!email.value) return
  
  resendLoading.value = true
  
  try {
    await resendEmailVerification(email.value)
    // Show success message
  } catch (error) {
    console.error('Error resending verification email:', error)
    // Show error message
  } finally {
    resendLoading.value = false
  }
}

// Add default export for router
defineOptions({
  name: 'AuthView'
})
</script>
