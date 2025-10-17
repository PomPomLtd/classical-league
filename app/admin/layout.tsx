import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminNavigation } from '@/components/admin-navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Check if session is expired
  const isExpired = session?.expires ? new Date(session.expires) <= new Date() : true

  if (!session || !session.user || session.user.role !== 'admin' || isExpired) {
    // Add reason parameter if session expired
    if (isExpired && session?.user) {
      redirect('/admin-auth?reason=session-expired')
    }
    redirect('/admin-auth')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation />
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}