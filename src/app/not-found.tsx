import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)'
        }}>
            <h1 className="brand-name" style={{ fontSize: '4rem', marginBottom: '1rem' }}>Coming Soon.....</h1>
            <p style={{ opacity: 0.6, marginBottom: '2rem' }}>We are working hard to bring you the best skincare experience.</p>
            <Link href="/" style={{
                padding: '0.8rem 2rem',
                border: '1px solid var(--gold-matte)',
                color: 'var(--gold-matte)',
                borderRadius: '50px',
                textDecoration: 'none',
                transition: 'var(--transition-smooth)'
            }}>
                Return Home
            </Link>
        </div>
    );
}
