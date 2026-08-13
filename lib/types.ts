export interface UserInfo {
  id: number
  first_name?: string
  last_name?: string
  email?: string
}

export interface OrgSummary {
  total_loads: number
  total_tonnage: number
  total_revenue: number
  total_kms: number
  total_contracts: number
  active_contracts: number
}

export interface OrgCompanyRef {
  id: number
  company_name: string
  is_active: number
}

export interface OrgListItem {
  id: number
  org_name: string
  org_abn: string | null
  org_email: string | null
  org_phone: string | null
  is_active: number
  created_at: string | null
  companies: OrgCompanyRef[]
  summary: OrgSummary
}

export interface OrgListResponse {
  status: boolean
  message: string
  organizations: OrgListItem[]
}

export interface DetailSummary extends OrgSummary {
  companies_count: number
  drivers_count: number
  customers_count: number
  assets_count: number
}

export interface StatusBreakdownRow {
  status: string | null
  count: number
  tonnage: string | number
  revenue: string | number
  total_kms: string | number
}

export interface MonthlyTrendRow {
  month: string
  loads: number
  tonnage: string | number
  revenue: string | number
}

export interface CompanyRow {
  id: number
  company_name: string
  company_abn: string | null
  company_email: string | null
  company_phone: string | null
  is_active: number
  total_loads: number
  total_tonnage: number
  total_revenue: number
  total_contracts: number
  active_contracts: number
}

export interface CustomerRef {
  company_name?: string | null
}

export interface CommodityTypeRef {
  name?: string | null
}

export interface ContractRow {
  id: number
  contract_no: string | null
  contract_name: string | null
  is_active: number
  start_date: string | null
  end_date: string | null
  estimated_tonnage: string | null
  contract_rate: string | null
  pickup_location: string | null
  dropoff_location: string | null
  customer?: CustomerRef | null
  commodity_type?: CommodityTypeRef | null
}

export interface LoadRow {
  id: number
  load_start_date: string | null
  release_no: string | null
  delivery_no: string | null
  pickup_location: string | null
  dropoff_location: string | null
  tonnage: string | number | null
  load_rate: string | null
  total_kms: string | null
  status: string | null
  company?: { company_name?: string | null } | null
  customer?: CustomerRef | null
  driver?: { first_name?: string | null; last_name?: string | null } | null
  asset?: { registration_no?: string | null } | null
  contract?: { contract_no?: string | null; contract_name?: string | null } | null
  commodity_type?: CommodityTypeRef | null
}

export interface BillingSubscription {
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  is_billable: number
  bill_rate: string | null
  currency: string | null
  days_until_due: number | null
  default_payment_method_id: string | null
  coupon_code: string | null
  coupon_redeemed: boolean
}

export interface PaymentMethodRow {
  id: string
  brand: string | null
  last4: string | null
  exp_month: number | null
  exp_year: number | null
  is_default: boolean
}

export interface BillRow {
  id: number
  billing_period_start: string | null
  billing_period_end: string | null
  total_active_trucks: number
  total_amount: string | number | null
  status: string | null
  stripe_invoice_id: string | null
  stripe_payment_intent_id: string | null
  hosted_invoice_url: string | null
  invoice_pdf: string | null
  created_at: string | null
}

export interface OrgBilling {
  subscription: BillingSubscription
  payment_methods: PaymentMethodRow[]
  bills: BillRow[]
}

export interface OrgDetailResponse {
  status: boolean
  message: string
  organization: {
    id: number
    org_name: string
    org_abn: string | null
    org_email: string | null
    org_phone: string | null
    org_address: string | null
    is_active: number
    currency: string | null
    created_at: string | null
  }
  summary: DetailSummary
  status_breakdown: StatusBreakdownRow[]
  monthly_trend: MonthlyTrendRow[]
  companies: CompanyRow[]
  contracts: ContractRow[]
  recent_loads: LoadRow[]
  billing: OrgBilling
}
