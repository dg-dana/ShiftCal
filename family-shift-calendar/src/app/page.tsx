import Calendar from '@/components/Calendar';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header style={{ 
        background: 'var(--card-bg)', 
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Family Shift Calendar
            </h1>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
              Manage your family's work schedules
            </p>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Calendar />
      </main>
    </div>
  );
}
