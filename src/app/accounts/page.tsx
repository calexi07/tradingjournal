import { redirect } from 'next/navigation'

// Redirect /accounts -> /dashboard
export default function AccountsPage() {
  redirect('/dashboard')
}
