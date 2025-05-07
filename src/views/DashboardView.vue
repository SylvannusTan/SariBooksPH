<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else>
      <!-- Business Profile Alert -->
      <v-row v-if="!businessProfile">
        <v-col cols="12">
          <v-alert type="info" variant="tonal">
            Please complete your business profile to get started.
            <v-btn
              color="primary"
              variant="text"
              class="ml-2"
              :to="{ name: 'business-profile' }"
            >
              Set up now
            </v-btn>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Dashboard Summary Cards -->
      <v-row v-else>
        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="primary" theme="dark">
            <v-card-item>
              <v-card-title>Total Sales</v-card-title>
              <div class="text-h4 pt-2">₱{{ formatCurrency(summaryData.totalSales) }}</div>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="error" theme="dark">
            <v-card-item>
              <v-card-title>Total Expenses</v-card-title>
              <div class="text-h4 pt-2">₱{{ formatCurrency(summaryData.totalExpenses) }}</div>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="success" theme="dark">
            <v-card-item>
              <v-card-title>Net Amount</v-card-title>
              <div class="text-h4 pt-2">₱{{ formatCurrency(summaryData.netAmount) }}</div>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="warning" theme="dark">
            <v-card-item>
              <v-card-title>Est. Tax</v-card-title>
              <div class="text-h4 pt-2">₱{{ formatCurrency(estimatedTax) }}</div>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Transactions -->
      <v-row v-if="businessProfile">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              Recent Transactions
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
            
            <v-card-text v-if="transactions.length === 0">
              <v-alert type="info" variant="tonal">
                No transactions yet. Start by adding your first transaction.
              </v-alert>
            </v-card-text>
            
            <v-list v-else lines="two">
              <v-list-item
                v-for="transaction in transactions"
                :key="transaction.id"
                :title="transaction.description"
                :subtitle="`${formatDate(transaction.transaction_date)} - ${transaction.category}`"
              >
                <template v-slot:prepend>
                  <v-avatar :color="transaction.type === 'sale' ? 'success' : 'error'" variant="tonal">
                    <v-icon>{{ transaction.type === 'sale' ? 'mdi-cash-plus' : 'mdi-cash-minus' }}</v-icon>
                  </v-avatar>
                </template>
                
                <template v-slot:append>
                  <div :class="transaction.type === 'sale' ? 'text-success' : 'text-error'">
                    {{ transaction.type === 'sale' ? '+' : '-' }}₱{{ formatCurrency(transaction.amount) }}
                  </div>
                </template>
              </v-list-item>
            </v-list>
            
            <v-card-actions v-if="transactions.length > 0">
              <v-btn
                block
                variant="text"
                color="primary"
                :to="{ name: 'transactions' }"
              >
                View All Transactions
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row v-if="businessProfile" class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6" sm="4" md="2">
                  <v-btn
                    block
                    color="success"
                    variant="outlined"
                    prepend-icon="mdi-cash-plus"
                    @click="showAddTransactionDialog = true; transactionType = 'sale'"
                  >
                    Add Sale
                  </v-btn>
                </v-col>
                
                <v-col cols="6" sm="4" md="2">
                  <v-btn
                    block
                    color="error"
                    variant="outlined"
                    prepend-icon="mdi-cash-minus"
                    @click="showAddTransactionDialog = true; transactionType = 'expense'"
                  >
                    Add Expense
                  </v-btn>
                </v-col>
                
                <v-col cols="6" sm="4" md="2">
                  <v-btn
                    block
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-file-chart"
                    :to="{ name: 'reports' }"
                  >
                    View Reports
                  </v-btn>
                </v-col>
                
                <v-col cols="6" sm="4" md="2">
                  <v-btn
                    block
                    color="warning"
                    variant="outlined"
                    prepend-icon="mdi-calculator"
                    @click="showTaxCalculator = true"
                  >
                    Tax Calculator
                  </v-btn>
                </v-col>
                
                <v-col cols="6" sm="4" md="2">
                  <v-btn
                    block
                    color="info"
                    variant="outlined"
                    prepend-icon="mdi-store"
                    :to="{ name: 'business-profile' }"
                  >
                    Business Profile
                  </v-btn>
                </v-col>
                
                <v-col cols="6" sm="4" md="2">
                  <v-btn
                    block
                    color="secondary"
                    variant="outlined"
                    prepend-icon="mdi-cog"
                    :to="{ name: 'settings' }"
                  >
                    Settings
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Add Transaction Dialog -->
    <v-dialog v-model="showAddTransactionDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ transactionType === 'sale' ? 'Add Sale' : 'Add Expense' }}
        </v-card-title>
        <v-card-text>
          <transaction-form
            v-if="businessProfile"
            :user-id="user?.id"
            :business-id="businessProfile.id"
            @submit="handleAddTransaction"
            @cancel="showAddTransactionDialog = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useBusinessProfile } from '@/composables/useBusinessProfile'
import { useTransactions } from '@/composables/useTransactions'
import TransactionForm from '@/components/TransactionForm.vue'

// All hooks are called at the top level
const { user } = useAuth()
const { businessProfile, fetchBusinessProfile } = useBusinessProfile()
const { transactions, fetchTransactions, addTransaction, calculateSummary } = useTransactions()

// Local state
const loading = ref(true)
const showAddTransactionDialog = ref(false)
const transactionType = ref('sale')
const showTaxCalculator = ref(false)

const hasBusinessProfile = ref(false);

// Computed properties
const summaryData = computed(() => {
  return calculateSummary(transactions.value)
})

const estimatedTax = computed(() => {
  if (!businessProfile.value) return 0
  
  const taxRate = businessProfile.value.tax_rate || 0.03
  return summaryData.value.totalSales * taxRate
})

// Methods
const formatCurrency = (value) => {
  return Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleAddTransaction = async (transactionData) => {
  try {
    await addTransaction(transactionData)
    showAddTransactionDialog.value = false
  } catch (error) {
    console.error('Error adding transaction:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  if (!user.value) {
    loading.value = false;
    return;
  }

  try {
    await fetchBusinessProfile(user.value.id);
    hasBusinessProfile.value = !!businessProfile.value;

    if (businessProfile.value) {
      await fetchTransactions(user.value.id, businessProfile.value.id, {
        limit: 5,
      });
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loading.value = false;
  }
});

// Add default export for router
defineOptions({
  name: 'DashboardView'
})
</script>

<style scoped>
@media (max-width: 600px) {
  .v-card-title {
    font-size: 1.1rem;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>
