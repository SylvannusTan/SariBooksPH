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
              Transactions
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="showAddTransactionDialog = true"
                variant="tonal"
              >
                Add Transaction
              </v-btn>
            </v-card-title>

            <!-- Filters -->
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="filters.search"
                    label="Search"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="applyFilters"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="filters.type"
                    label="Type"
                    :items="[
                      { title: 'All', value: null },
                      { title: 'Sales', value: 'sale' },
                      { title: 'Expenses', value: 'expense' }
                    ]"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="applyFilters"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="filters.startDate"
                    label="Start Date"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="applyFilters"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="filters.endDate"
                    label="End Date"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="applyFilters"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>

            <!-- Transactions Table -->
            <v-data-table
              :headers="headers"
              :items="transactions"
              :loading="loading"
              class="elevation-1"
            >
              <!-- Type Column -->
              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="item.type === 'sale' ? 'success' : 'error'"
                  size="small"
                  class="text-white"
                >
                  {{ item.type === 'sale' ? 'Sale' : 'Expense' }}
                </v-chip>
              </template>
              
              <!-- Amount Column -->
              <template v-slot:item.amount="{ item }">
                <span :class="item.type === 'sale' ? 'text-success' : 'text-error'">
                  ₱{{ formatCurrency(item.amount) }}
                </span>
              </template>
              
              <!-- Date Column -->
              <template v-slot:item.transaction_date="{ item }">
                {{ formatDate(item.transaction_date) }}
              </template>
              
              <!-- Actions Column -->
              <template v-slot:item.actions="{ item }">
                <div class="d-flex gap-2">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="editTransaction(item)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="confirmDelete(item)"
                  ></v-btn>
                </div>
              </template>
              
              <!-- Empty State -->
              <template v-slot:no-data>
                <div class="d-flex flex-column align-center py-6">
                  <v-icon icon="mdi-receipt" size="64" class="text-medium-emphasis mb-4"></v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">No Transactions Found</h3>
                  <p class="text-body-1 text-medium-emphasis mb-4">
                    Start adding transactions to track your business finances
                  </p>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="showAddTransactionDialog = true"
                  >
                    Add Transaction
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add/Edit Transaction Dialog -->
      <v-dialog v-model="showTransactionDialog" max-width="600px">
        <v-card>
          <v-card-title>{{ editMode ? 'Edit Transaction' : 'Add Transaction' }}</v-card-title>
          <v-card-text>
            <transaction-form
              v-if="businessProfile"
              :transaction="currentTransaction"
              :user-id="user?.id"
              :business-id="businessProfile.id"
              @submit="saveTransaction"
              @cancel="showTransactionDialog = false"
            />
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="showDeleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h5">Confirm Delete</v-card-title>
          <v-card-text>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
            <v-btn color="error" variant="text" @click="deleteSelectedTransaction">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useBusinessProfile } from '@/composables/useBusinessProfile'
import { useTransactions } from '@/composables/useTransactions'
import TransactionForm from '@/components/TransactionForm.vue'

// All hooks are called at the top level
const { user } = useAuth()
const { businessProfile, fetchBusinessProfile } = useBusinessProfile()
const { 
  transactions, 
  fetchTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction 
} = useTransactions()

// Table headers
const headers = [
  { title: 'Date', key: 'transaction_date', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Description', key: 'description', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Local state
const loading = ref(true)
const showTransactionDialog = ref(false)
const showAddTransactionDialog = ref(false)
const showDeleteDialog = ref(false)
const editMode = ref(false)
const currentTransaction = ref(null)
const transactionToDelete = ref(null)

// Filter state
const filters = ref({
  search: '',
  type: null,
  startDate: '',
  endDate: '',
})

// Methods
const formatCurrency = (value) => {
  return Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const applyFilters = async () => {
  if (!user.value || !businessProfile.value) return
  
  loading.value = true
  
  try {
    await fetchTransactions(user.value.id, businessProfile.value.id, {
      search: filters.value.search,
      type: filters.value.type,
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
    })
  } catch (error) {
    console.error('Error applying filters:', error)
  } finally {
    loading.value = false
  }
}

const editTransaction = (transaction) => {
  currentTransaction.value = { ...transaction }
  editMode.value = true
  showTransactionDialog.value = true
}

const confirmDelete = (transaction) => {
  transactionToDelete.value = transaction
  showDeleteDialog.value = true
}

const deleteSelectedTransaction = async () => {
  if (!transactionToDelete.value) return
  
  try {
    await deleteTransaction(transactionToDelete.value.id)
    showDeleteDialog.value = false
    transactionToDelete.value = null
  } catch (error) {
    console.error('Error deleting transaction:', error)
  }
}

const saveTransaction = async (transactionData) => {
  try {
    if (editMode.value && currentTransaction.value) {
      await updateTransaction(currentTransaction.value.id, transactionData)
    } else {
      await addTransaction(transactionData)
    }
    
    showTransactionDialog.value = false
    editMode.value = false
    currentTransaction.value = null
  } catch (error) {
    console.error('Error saving transaction:', error)
  }
}

// Watch for add transaction dialog
const watchAddTransactionDialog = ref(false);

// Lifecycle hooks
onMounted(async () => {
  try {
    if (user.value) {
      await fetchBusinessProfile(user.value.id)
      
      if (businessProfile.value) {
        await fetchTransactions(user.value.id, businessProfile.value.id)
      }
    }
  } catch (error) {
    console.error('Error loading transactions:', error)
  } finally {
    loading.value = false
  }
})

// Watch for add transaction dialog changes
watch(showAddTransactionDialog, (newValue) => {
    if (newValue) {
        editMode.value = false;
        currentTransaction.value = null;
        showTransactionDialog.value = true;
    }
});

// Add default export for router
defineOptions({
  name: 'TransactionsView'
})
</script>
