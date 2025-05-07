<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              {{ businessProfile ? 'Business Profile' : 'Create Business Profile' }}
              <v-spacer></v-spacer>
              <v-btn
                v-if="businessProfile"
                color="primary"
                prepend-icon="mdi-pencil"
                @click="isEditing = true"
                variant="tonal"
              >
                Edit Profile
              </v-btn>
            </v-card-title>

            <v-card-text v-if="!isEditing && businessProfile">
              <v-row>
                <v-col cols="12" md="6">
                  <v-list>
                    <v-list-subheader>Business Information</v-list-subheader>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-store</v-icon>
                      </template>
                      <v-list-item-title>Business Name</v-list-item-title>
                      <v-list-item-subtitle>{{ businessProfile.business_name }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-tag</v-icon>
                      </template>
                      <v-list-item-title>Business Type</v-list-item-title>
                      <v-list-item-subtitle>{{ businessProfile.business_type }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item v-if="businessProfile.address">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>Address</v-list-item-title>
                      <v-list-item-subtitle>{{ businessProfile.address }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item v-if="businessProfile.phone">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-phone</v-icon>
                      </template>
                      <v-list-item-title>Phone</v-list-item-title>
                      <v-list-item-subtitle>{{ businessProfile.phone }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item v-if="businessProfile.email">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-email</v-icon>
                      </template>
                      <v-list-item-title>Email</v-list-item-title>
                      <v-list-item-subtitle>{{ businessProfile.email }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-list>
                    <v-list-subheader>Tax Information</v-list-subheader>
                    <v-list-item v-if="businessProfile.tax_id">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-identifier</v-icon>
                      </template>
                      <v-list-item-title>Tax ID (TIN)</v-list-item-title>
                      <v-list-item-subtitle>{{ businessProfile.tax_id }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-file-document</v-icon>
                      </template>
                      <v-list-item-title>Tax Type</v-list-item-title>
                      <v-list-item-subtitle>{{ businessProfile.tax_type }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-percent</v-icon>
                      </template>
                      <v-list-item-title>Tax Rate</v-list-item-title>
                      <v-list-item-subtitle>{{ formatTaxRate(businessProfile.tax_rate) }}%</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-calendar</v-icon>
                      </template>
                      <v-list-item-title>Filing Frequency</v-list-item-title>
                      <v-list-item-subtitle>{{ businessProfile.tax_filing_frequency }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>

            <template v-if="isEditing || !businessProfile">
              <business-profile-form
                :profile="businessProfile"
                @submit="handleSubmit"
                @cancel="isEditing = false"
              />
            </template>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useBusinessProfile } from '@/composables/useBusinessProfile'
import BusinessProfileForm from '@/components/BusinessProfileForm.vue'

// All hooks are called at the top level
const { user } = useAuth()
const { businessProfile, fetchBusinessProfile, createBusinessProfile, updateBusinessProfile } = useBusinessProfile()

// Local state
const loading = ref(true)
const isEditing = ref(false)
const shouldEditOnMount = ref(false)

// Methods
const formatTaxRate = (rate) => {
  return (rate * 100).toFixed(2)
}

const loadData = async () => {
  try {
    if (user.value) {
      await fetchBusinessProfile(user.value.id)
      
      // If no profile exists, go into edit mode
      shouldEditOnMount.value = !businessProfile.value
    }
  } catch (error) {
    console.error('Error loading business profile:', error)
  } finally {
    loading.value = false
    isEditing.value = shouldEditOnMount.value;
  }
}

const handleSubmit = async (profileData) => {
  try {
    if (businessProfile.value) {
      await updateBusinessProfile(businessProfile.value.id, profileData)
    } else {
      await createBusinessProfile(user.value.id, profileData)
    }
    isEditing.value = false
  } catch (error) {
    console.error('Error saving business profile:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  await loadData()
})

// Add default export for router
defineOptions({
  name: 'BusinessProfileView'
})
</script>
