<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Reports</h1>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else>
      <!-- Date Range Selector -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="dateRange"
                    :items="dateRangeOptions"
                    label="Date Range"
                    @update:model-value="updateDateRange"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="startDate"
                    label="Start Date"
                    type="date"
                    :disabled="dateRange !== 'custom'"
                    @update:model-value="fetchReportData"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="endDate"
                    label="End Date"
                    type="date"
                    :disabled="dateRange !== 'custom'"
                    @update:model-value="fetchReportData"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Summary Cards -->
      <v-row>
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

      <!-- Charts -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Income vs Expenses</v-card-title>
            <v-card-text class="d-flex justify-center">
              <!-- Placeholder for chart -->
              <div class="chart-placeholder">
                <v-icon icon="mdi-chart-bar" size="64" class="text-medium-emphasis"></v-icon>
                <p class="text-center text-medium-emphasis mt-2">Bar chart will be displayed here</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Sales by Category</v-card-title>
            <v-card-text class="d-flex justify-center">
              <!-- Placeholder for chart -->
              <div class="chart-placeholder">
                <v-icon icon="mdi-chart-pie" size="64" class="text-medium-emphasis"></v-icon>
                <p class="text-center text-medium-emphasis mt-2">Pie chart will be displayed here</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Transactions Table -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>Transaction Summary</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="transactionSummary"
                :loading="loading"
                class="elevation-1"
              >
                <!-- Amount Column -->
                <template v-slot:item.amount="{ item }">
                  <span :class="item.type === 'sale' ? 'text-success' : 'text-error'">
                    ₱{{ formatCurrency(item.amount) }}
                  </span>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Export Options -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>Export Report</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-btn
                    block
                    color="primary"
                    prepend-icon="mdi-file-pdf-box"
                    variant="outlined"
                    @click="exportReport('pdf')"
                  >
                    Export as PDF
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn
                    block
                    color="success"
                    prepend-icon="mdi-file-excel"
                    variant="outlined"
                    @click="exportReport('excel')"
                  >
                    Export as Excel
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn
                    block
                    color="info"
                    prepend-icon="mdi-printer"
                    variant="outlined"
                    @click="printReport"
                  >
                    Print Report
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useBusinessProfile } from '@/composables/useBusinessProfile'
import { useTransactions } from '@/composables/useTransactions'

// All hooks are called at the top level
const { user } = useAuth()
const { businessProfile, fetchBusinessProfile } = useBusinessProfile()
const { transactions, fetchTransactions, calculateSummary } = useTransactions()

// Local state
const loading = ref(true)
const dateRange = ref('month')
const startDate = ref('')
const endDate = ref('')
const transactionSummary = ref([])

// Date range options
const dateRangeOptions = [
  { title: 'Today', value: 'today' },
  { title: 'This Week', value: 'week' },
  { title: 'This Month', value: 'month' },
  { title: 'This Quarter', value: 'quarter' },
  { title: 'This Year', value: 'year' },
  { title: 'Custom Range', value: 'custom' },
]

// Table headers
const headers = [
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Count', key: 'count', sortable: true },
  { title: 'Amount', key: 'amount', sortable: true },
]

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

const updateDateRange = () => {
  const today = new Date()
  let start = new Date()
  let end = new Date()
  
  switch (dateRange.value) {
    case 'today':
      // Start and end are already today
      break
    case 'week':
      // Start is the beginning of the week (Sunday)
      start.setDate(today.getDate() - today.getDay())
      break
    case 'month':
      // Start is the first day of the month
      start.setDate(1)
      break
    case 'quarter':
      // Start is the first day of the quarter
      const quarter = Math.floor(today.getMonth() / 3)
      start.setMonth(quarter * 3)
      start.setDate(1)
      break
    case 'year':
      // Start is the first day of the year
      start.setMonth(0)
      start.setDate(1)
      break
    case 'custom':
      // Use the custom date range
      return
  }
  
  // Format dates for input fields
  startDate.value = start.toISOString().substr(0, 10)
  endDate.value = end.toISOString().substr(0, 10)
  
  // Fetch report data with new date range
  fetchReportData()
}

const fetchReportData = async () => {
  if (!user.value || !businessProfile.value) return
  
  loading.value = true
  
  try {
    // Fetch transactions for the selected date range
    await fetchTransactions(user.value.id, businessProfile.value.id, {
      startDate: startDate.value,
      endDate: endDate.value,
    })
    
    // Generate transaction summary by category
    generateTransactionSummary()
  } catch (error) {
    console.error('Error fetching report data:', error)
  } finally {
    loading.value = false
  }
}

const generateTransactionSummary = () => {
  // Group transactions by category and type
  const summary = {}
  
  transactions.value.forEach(transaction => {
    const key = `${transaction.category}-${transaction.type}`
    
    if (!summary[key]) {
      summary[key] = {
        category: transaction.category,
        type: transaction.type,
        count: 0,
        amount: 0,
      }
    }
    
    summary[key].count++
    summary[key].amount += Number(transaction.amount)
  })
  
  // Convert to array for data table
  transactionSummary.value = Object.values(summary)
}

const exportReport = (format) => {
  // Implementation for exporting report
  console.log(`Exporting report as ${format}...`)
}

const printReport = () => {
  // Implementation for printing report
  window.print()
}

// Lifecycle hooks
onMounted(async () => {
  loading.value = true // Initialize loading to true

  try {
    if (user.value) {
      await fetchBusinessProfile(user.value.id)
      
      // Set default date range to this month
      updateDateRange()
    }
  } catch (error) {
    console.error('Error loading report data:', error)
  } finally {
    loading.value = false
  }
})

// Add default export for router
defineOptions({
  name: 'ReportsView'
})
</script>

<style scoped>
.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
}

@media print {
  .v-btn, .v-card:last-child {
    display: none;
  }
}
</style>
