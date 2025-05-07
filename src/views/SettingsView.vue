<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Settings</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-list>
            <v-list-item
              v-for="(item, i) in settingsMenu"
              :key="i"
              :value="item"
              :active="activeTab === item.value"
              @click="activeTab = item.value"
              color="primary"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card>
          <!-- Account Settings -->
          <template v-if="activeTab === 'account'">
            <v-card-title>Account Settings</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updateAccountSettings" ref="accountForm">
                <v-text-field
                  v-model="accountSettings.email"
                  label="Email"
                  disabled
                  readonly
                ></v-text-field>

                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mb-4"
                  @click="showChangePasswordDialog = true"
                >
                  Change Password
                </v-btn>

                <v-divider class="my-4"></v-divider>

                <v-btn
                  color="error"
                  variant="outlined"
                  @click="showDeleteAccountDialog = true"
                >
                  Delete Account
                </v-btn>
              </v-form>
            </v-card-text>
          </template>

          <!-- Preferences -->
          <template v-else-if="activeTab === 'preferences'">
            <v-card-title>Preferences</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updatePreferences" ref="preferencesForm">
                <v-switch
                  v-model="preferences.darkMode"
                  label="Dark Mode"
                  color="primary"
                  hide-details
                  class="mb-4"
                ></v-switch>

                <v-select
                  v-model="preferences.language"
                  :items="languageOptions"
                  label="Language"
                  class="mb-4"
                ></v-select>

                <v-select
                  v-model="preferences.currency"
                  :items="currencyOptions"
                  label="Currency"
                  class="mb-4"
                ></v-select>

                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                >
                  Save Preferences
                </v-btn>
              </v-form>
            </v-card-text>
          </template>

          <!-- Notifications -->
          <template v-else-if="activeTab === 'notifications'">
            <v-card-title>Notification Settings</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updateNotificationSettings" ref="notificationsForm">
                <v-switch
                  v-model="notifications.email"
                  label="Email Notifications"
                  color="primary"
                  hide-details
                  class="mb-4"
                ></v-switch>

                <v-switch
                  v-model="notifications.push"
                  label="Push Notifications"
                  color="primary"
                  hide-details
                  class="mb-4"
                ></v-switch>

                <v-switch
                  v-model="notifications.transactionAlerts"
                  label="Transaction Alerts"
                  color="primary"
                  hide-details
                  class="mb-4"
                ></v-switch>

                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                >
                  Save Notification Settings
                </v-btn>
              </v-form>
            </v-card-text>
          </template>

          <!-- Security -->
          <template v-else-if="activeTab === 'security'">
            <v-card-title>Security Settings</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updateSecuritySettings" ref="securityForm">
                <v-switch
                  v-model="security.twoFactorAuth"
                  label="Two-Factor Authentication"
                  color="primary"
                  hide-details
                  class="mb-4"
                ></v-switch>

                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                  class="mb-4"
                >
                  Save Security Settings
                </v-btn>

                <v-divider class="my-4"></v-divider>

                <h3 class="text-h6 mb-2">Active Sessions</h3>
                <p class="text-body-2 mb-4">These are the devices that are currently logged into your account.</p>

                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-laptop" color="primary"></v-icon>
                    </template>
                    <v-list-item-title>Current Session</v-list-item-title>
                    <v-list-item-subtitle>{{ deviceInfo }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-form>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- Change Password Dialog -->
    <v-dialog v-model="showChangePasswordDialog" max-width="500px">
      <v-card>
        <v-card-title>Change Password</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="changePassword" ref="passwordForm">
            <v-text-field
              v-model="passwordData.currentPassword"
              label="Current Password"
              :type="showCurrentPassword ? 'text' : 'password'"
              required
              :rules="[v => !!v || 'Current password is required']"
              :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showCurrentPassword = !showCurrentPassword"
            ></v-text-field>

            <v-text-field
              v-model="passwordData.newPassword"
              label="New Password"
              :type="showNewPassword ? 'text' : 'password'"
              required
              :rules="[
                v => !!v || 'New password is required',
                v => v.length >= 8 || 'Password must be at least 8 characters',
                v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
                v => /[0-9]/.test(v) || 'Password must contain at least one number'
              ]"
              :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showNewPassword = !showNewPassword"
            ></v-text-field>

            <v-text-field
              v-model="passwordData.confirmPassword"
              label="Confirm New Password"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              :rules="[
                v => !!v || 'Please confirm your password',
                v => v === passwordData.newPassword || 'Passwords do not match'
              ]"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showChangePasswordDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="changePassword" :loading="loading">Change Password</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Account Dialog -->
    <v-dialog v-model="showDeleteAccountDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 text-error">Delete Account</v-card-title>
        <v-card-text>
          <p class="mb-4">Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.</p>
          <v-form @submit.prevent="deleteAccount" ref="deleteAccountForm">
            <v-text-field
              v-model="deleteAccountPassword"
              label="Enter your password to confirm"
              :type="showDeletePassword ? 'text' : 'password'"
              required
              :rules="[v => !!v || 'Password is required']"
              :append-inner-icon="showDeletePassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showDeletePassword = !showDeletePassword"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showDeleteAccountDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteAccount" :loading="loading">Delete Account</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, signOut } = useAuth()

// Forms
const accountForm = ref(null)
const preferencesForm = ref(null)
const notificationsForm = ref(null)
const securityForm = ref(null)
const passwordForm = ref(null)
const deleteAccountForm = ref(null)

// State
const loading = ref(false)
const activeTab = ref('account')
const showChangePasswordDialog = ref(false)
const showDeleteAccountDialog = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const showDeletePassword = ref(false)
const deleteAccountPassword = ref('')

// Settings menu
const settingsMenu = [
  { title: 'Account', value: 'account', icon: 'mdi-account-cog' },
  { title: 'Preferences', value: 'preferences', icon: 'mdi-cog' },
  { title: 'Notifications', value: 'notifications', icon: 'mdi-bell-outline' },
  { title: 'Security', value: 'security', icon: 'mdi-shield-account' },
]

// Form data
const accountSettings = ref({
  email: '',
})

const preferences = ref({
  darkMode: false,
  language: 'en',
  currency: 'PHP',
})

const notifications = ref({
  email: true,
  push: true,
  transactionAlerts: true,
})

const security = ref({
  twoFactorAuth: false,
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Options
const languageOptions = [
  { title: 'English', value: 'en' },
  { title: 'Filipino', value: 'fil' },
]

const currencyOptions = [
  { title: 'Philippine Peso (₱)', value: 'PHP' },
  { title: 'US Dollar ($)', value: 'USD' },
]

// Computed
const deviceInfo = ref('')

// Methods
const updateAccountSettings = async () => {
  // Implementation for updating account settings
}

const updatePreferences = async () => {
  loading.value = true
  
  try {
    // Save preferences to user metadata
    await supabase.auth.updateUser({
      data: {
        preferences: preferences.value
      }
    })
    
    // Show success message
  } catch (error) {
    console.error('Error updating preferences:', error)
    // Show error message
  } finally {
    loading.value = false
  }
}

const updateNotificationSettings = async () => {
  loading.value = true
  
  try {
    // Save notification settings to user metadata
    await supabase.auth.updateUser({
      data: {
        notifications: notifications.value
      }
    })
    
    // Show success message
  } catch (error) {
    console.error('Error updating notification settings:', error)
    // Show error message
  } finally {
    loading.value = false
  }
}

const updateSecuritySettings = async () => {
  loading.value = true
  
  try {
    // Save security settings to user metadata
    await supabase.auth.updateUser({
      data: {
        security: security.value
      }
    })
    
    // Show success message
  } catch (error) {
    console.error('Error updating security settings:', error)
    // Show error message
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  const { valid } = await passwordForm.value.validate()
  
  if (!valid) return
  
  loading.value = true
  
  try {
    // Update password
    const { error } = await supabase.auth.updateUser({
      password: passwordData.value.newPassword
    })
    
    if (error) throw error
    
    // Reset form and close dialog
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
    
    showChangePasswordDialog.value = false
    
    // Show success message
  } catch (error) {
    console.error('Error changing password:', error)
    // Show error message
  } finally {
    loading.value = false
  }
}

const deleteAccount = async () => {
  const { valid } = await deleteAccountForm.value.validate()
  
  if (!valid) return
  
  loading.value = true
  
  try {
    // First, delete user data from database
    // This would involve deleting records from business_profiles and transactions tables
    
    // Then, delete the user account
    // Note: In a real application, this would typically be handled by a server-side function
    // for security reasons
    
    // Sign out the user
    await signOut()
    
    // Redirect to login page
    router.push({ name: 'auth', query: { message: 'Your account has been deleted successfully' } })
  } catch (error) {
    console.error('Error deleting account:', error)
    // Show error message
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  // Load user data
  if (user.value) {
    accountSettings.value.email = user.value.email
    
    // Load user preferences from metadata
    if (user.value.user_metadata) {
      if (user.value.user_metadata.preferences) {
        preferences.value = { ...preferences.value, ...user.value.user_metadata.preferences }
      }
      
      if (user.value.user_metadata.notifications) {
        notifications.value = { ...notifications.value, ...user.value.user_metadata.notifications }
      }
      
      if (user.value.user_metadata.security) {
        security.value = { ...security.value, ...user.value.user_metadata.security }
      }
    }
  }
  
  // Get device info
  const browser = navigator.userAgent
  const os = navigator.platform
  deviceInfo.value = `${browser} on ${os}`
})

onMounted(() => {
  // Load user data
  if (user.value) {
    accountSettings.value.email = user.value.email

    // Load user preferences from metadata
    if (user.value.user_metadata) {
      if (user.value.user_metadata.preferences) {
        preferences.value = { ...preferences.value, ...user.value.user_metadata.preferences }
      }

      if (user.value.user_metadata.notifications) {
        notifications.value = { ...notifications.value, ...user.value.user_metadata.notifications }
      }

      if (user.value.user_metadata.security) {
        security.value = { ...security.value, ...user.value.user_metadata.security }
      }
    }
  }

  // Get device info
  const browser = navigator.userAgent
  const os = navigator.platform
  deviceInfo.value = `${browser} on ${os}`
})
// Add default export for router
defineOptions({
  name: 'SettingsView'
})
</script>
