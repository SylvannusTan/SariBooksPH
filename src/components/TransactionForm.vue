<template>
  <v-form @submit.prevent="handleSubmit" ref="form">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="formData.type"
            :items="transactionTypes"
            label="Transaction Type"
            required
            :rules="[v => !!v || 'Transaction type is required']"
          ></v-select>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="formData.description"
            label="Description"
            required
            :rules="[v => !!v || 'Description is required']"
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.amount"
            label="Amount (₱)"
            type="number"
            required
            prefix="₱"
            :rules="[
              v => !!v || 'Amount is required',
              v => v > 0 || 'Amount must be greater than 0'
            ]"
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.transaction_date"
            label="Date"
            type="date"
            required
            :rules="[v => !!v || 'Date is required']"
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-select
            v-model="formData.category"
            :items="getCategoryOptions"
            label="Category"
            required
            :rules="[v => !!v || 'Category is required']"
          ></v-select>
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="formData.notes"
            label="Notes (Optional)"
            rows="3"
          ></v-textarea>
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
            {{ isEdit ? 'Update' : 'Save' }} Transaction
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  transaction: {
    type: Object,
    default: () => null
  },
  businessId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Form state
const form = ref(null)
const loading = ref(false)
const isEdit = computed(() => !!props.transaction)

// Form data with default values
const formData = ref({
  type: 'sale',
  description: '',
  amount: '',
  transaction_date: new Date().toISOString().substr(0, 10),
  category: '',
  notes: ''
})

// Transaction types
const transactionTypes = [
  { title: 'Sale', value: 'sale' },
  { title: 'Expense', value: 'expense' }
]

// Categories based on transaction type
const saleCategories = [
  'Product Sale',
  'Service',
  'Other Income'
]

const expenseCategories = [
  'Inventory',
  'Rent',
  'Utilities',
  'Salaries',
  'Transportation',
  'Marketing',
  'Other Expense'
]

// Computed property for category options based on transaction type
const getCategoryOptions = computed(() => {
  return formData.value.type === 'sale' ? saleCategories : expenseCategories
})

// Methods
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return
  
  loading.value = true
  
  try {
    const transactionData = {
      ...formData.value,
      user_id: props.userId,
      business_id: props.businessId,
      amount: parseFloat(formData.value.amount)
    }
    
    emit('submit', transactionData)
  } catch (error) {
    console.error('Error submitting transaction:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  // If editing an existing transaction, populate form data
  if (props.transaction) {
    formData.value = { ...props.transaction }
    
    // Ensure date is in the correct format for the input
    if (formData.value.transaction_date) {
      const date = new Date(formData.value.transaction_date)
      formData.value.transaction_date = date.toISOString().substr(0, 10)
    }
  }
})
</script>
