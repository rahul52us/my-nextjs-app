"use client"; // Mark the component as a client-side component

import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect } from "react";

// Dynamically import the Greeting component
const LazyGreeting = dynamic(() => import("./mainHome/Greeting"), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

export default function HomePage() {
  useEffect(() => {
    // Dynamically update the document title after the component mounts
    document.title = "My Awesome Dynamic Website";
  }, []);

  return (
    <>
      <Head>
        <meta
          name="description"
          content="Welcome to my awesome website where I share amazing content!"
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="My Awesome Website" />
        <meta
          property="og:description"
          content="Welcome to my awesome website where I share amazing content!"
        />
        <meta property="og:image" content="https://example.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div style={containerStyles}>
        <h1 style={headingStyles}>Welcome to the Main Page!</h1>
        <p style={messageStyles}>
          This is the default page under the '/main' route.
        </p>

        {/* Lazy load the Greeting component */}
        <LazyGreeting />
      </div>
      <div style={containerStyles}>
        <h1 style={headingStyles}>Welcome to the Main Page!</h1>
        <p style={messageStyles}>
          This is the default page under the '/main' route.
        </p>

        {/* Lazy load the Greeting component */}
        <LazyGreeting />
      </div>
      <div style={containerStyles}>
        <h1 style={headingStyles}>Welcome to the Main Page!</h1>
        <p style={messageStyles}>
          This is the default page under the '/main' route.
        </p>

        {/* Lazy load the Greeting component */}
        <LazyGreeting />
      </div>
    </>
  );
}

const containerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "70vh",
  textAlign: "center",
  padding: "20px",
};

const headingStyles: React.CSSProperties = {
  fontSize: "3rem",
  color: "#333",
  fontWeight: "bold",
  marginBottom: "10px",
};

const messageStyles: React.CSSProperties = {
  fontSize: "1.2rem",
  color: "#666",
  marginBottom: "20px",
};
