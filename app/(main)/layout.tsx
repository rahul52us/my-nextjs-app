import Link from 'next/link';  // Import Link from Next.js

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#34495E', padding: '0.5rem' }}>
      <Link
          href="/"
          style={{
            marginRight: '1rem',
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            transition: 'background-color 0.3s ease',
          }}
        >
          Home
        </Link>
        <Link
          href="/about"
          style={{
            marginRight: '1rem',
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            transition: 'background-color 0.3s ease',
          }}
        >
          About
        </Link>
        <Link
          href="/contact"
          style={{
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            transition: 'background-color 0.3s ease',
          }}
        >
          Contact
        </Link>
      </nav>

      {/* Main Content */}
      <main style={{ flex: '1' }}>
        {children}
      </main>

      {/* Footer Section */}
      <footer style={{ backgroundColor: '#2C3E50', padding: '1rem', color: 'white', textAlign: 'center' }}>
        <p>&copy; 2024 My Website. All rights reserved.</p>
      </footer>
    </div>
  );
}
