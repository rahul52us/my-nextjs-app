// This will be the home page for the `/` route
export default function HomePage() {
    return (
      <div style={containerStyles}>
        <h1 style={headingStyles}>Welcome to the Main Page!</h1>
        <p style={messageStyles}>This is the default page under the '/main' route.</p>
      </div>
    );
  }

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    textAlign: 'center',
    padding: '20px',
  };

  const headingStyles: React.CSSProperties = {
    fontSize: '3rem',
    color: '#333',
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  const messageStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '20px',
  };
