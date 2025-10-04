export interface PaymentData {
  account_number: string | null;
  bank_code: string | null;
  branch_code: string | null;
  amount: number | null;
  currency: string | null;
  payment_date: string | null;
  message: string | null;
  variable_symbol: number | null;
  constant_symbol: number | null;
  specific_symbol: number | null;
}
