<template>
  <v-form @submit.prevent="handleSubmit" ref="form">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h2 class="text-h5 mb-4">{{ isEdit ? 'Update Business Profile' : 'Create Business Profile' }}</h2>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.business_name"
            label="Business Name"
            required
            :rules="[v => !!v || 'Business name is required']"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-select
            v-model="formData.business_type"
            :items="businessTypes"
            label="Business Type"
            required
            :rules="[v => !!v || 'Business type is required']"
          ></v-select>
        </v-col>
        
        <v-col cols="12">
          <v-textarea
            v-model="formData.address"
            label="Business Address"
            rows="3"
          ></v-textarea>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.phone"
            label="Phone Number"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.email"
            label="Business Email"
            type="email"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12">
          <h3 class="text-h6 mb-2">Tax Information</h3>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.tax_id"
            label="Tax ID Number (TIN)"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-select
            v-model="formData.tax_type"
            :items="taxTypes"
            label="Tax Type"
          ></v-select>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="formData.tax_rate"
            label="Tax Rate (%)"
            type="number"
            min="0"
            max="100"
            step="0.01"
            hint="Enter percentage (e.g., 3 for 3%)"
            persistent-hint
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-select
            v-model="formData.tax_filing_frequency"
            :items="taxFilingFrequencies"
            label="Tax Filing Frequency"
          ></v-select>
        </v-col>
        
        <v-col cols="12" class="d-flex justify-end">
          <v-btn
            variant="text"
            class="mr-2"
            @click="$emit('cancel')"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            type="submit"
            :loading="loading"
          >
            {{ isEdit ? 'Update' : 'Save' }} Profile
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Form state
const form = ref(null)
const loading = ref(false)
const isEdit = computed(() => !!props.profile)

// Form data with default values
const formData = ref({
  business_name: '',
  business_type: 'Sari-Sari Store',
  address: '',
  phone: '',
  email: '',
  tax_id: '',
  tax_type: 'Non-VAT Registered',
  tax_rate: 3, // Default 3%
  tax_filing_frequency: 'Quarterly'
})

// Form options
const businessTypes = [
  'Sari-Sari Store',
  'Restaurant',
  'Retail Shop',
  'Service Provider',
  'Online Seller',
  'Freelancer',
  'Other'
]

const taxTypes = [
  'VAT Registered',
  'Non-VAT Registered',
  'Percentage Tax',
  'Exempt'
]

const taxFilingFrequencies = [
  'Monthly',
  'Quarterly',
  'Annually'
]

// Methods
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return
  
  loading.value = true
  
  try {
    // Convert tax_rate from percentage to decimal for database storage
    const profileData = {
      ...formData.value,
      tax_rate: parseFloat(formData.value.tax_rate) / 100
    }
    
    emit('submit', profileData)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  // If editing an existing profile, populate form data
  if (props.profile) {
    formData.value = {
      ...props.profile,
      // Convert tax_rate from decimal to percentage for display
      tax_rate: props.profile.tax_rate ? props.profile.tax_rate * 100 : 3
    }
  }
})
</script>
