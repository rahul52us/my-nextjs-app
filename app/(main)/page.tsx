"use client";

import Head from "next/head";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Base64 Encoder & Decoder | Simple & Fast";
  }, []);

  const handleEncode = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        setEncoded(btoa(input.trim()));
        setDecoded("");
        setError("");
      } catch {
        setError("Invalid input for Base64 encoding.");
      } finally {
        setLoading(false);
      }
    }, 500); // Simulate a loading effect for user experience
  };

  const handleDecode = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        setDecoded(atob(input.trim()));
        setEncoded("");
        setError("");
      } catch {
        setError("Invalid Base64 input for decoding.");
      } finally {
        setLoading(false);
      }
    }, 500); // Simulate a loading effect
  };

  return (
    <>
      <Head>
        <meta
          name="description"
          content="Easily encode and decode data with Base64. Convert text, files, images, and more using our simple tool."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Base64 Encoder & Decoder" />
        <meta
          property="og:description"
          content="Convert text and data using Base64 encoding and decoding. Ideal for developers and learners."
        />
        <meta property="og:image" content="https://example.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="container">
        <h1 className="heading">Base64 Encoder & Decoder</h1>
        <p className="message">
          Quickly encode or decode text with Base64. Perfect for developers,
          students, and tech enthusiasts.
        </p>

        <textarea
          className="input-box"
          placeholder="Enter text to encode or decode..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
        />

        <div className="button-container">
          <button onClick={handleEncode} className="button" disabled={loading}>
            {loading ? "Encoding..." : "Encode"}
          </button>
          <button onClick={handleDecode} className="button" disabled={loading}>
            {loading ? "Decoding..." : "Decode"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {encoded && (
          <div className="result-container">
            <h3 className="result-heading">Encoded Result:</h3>
            <p className="result-text">{encoded}</p>
          </div>
        )}

        {decoded && (
          <div className="result-container">
            <h3 className="result-heading">Decoded Result:</h3>
            <p className="result-text">{decoded}</p>
          </div>
        )}
      </div>

      <div className="info-container">
        <h2 className="info-heading">What is Base64 Encoding?</h2>
        <p className="info-text">
          Base64 encoding transforms binary data into a text format using
          readable ASCII characters. It's often used in web development to
          encode images, files, or data for safe transmission via text-based
          protocols like email or HTTP.
        </p>

        <h2 className="info-heading">Common Applications of Base64</h2>
        <ul className="info-list">
          <li><strong>Images:</strong> Embed small images directly into HTML or CSS as Base64 strings.</li>
          <li><strong>Files:</strong> Encode binary data for safe transmission across text-based systems.</li>
          <li><strong>URLs:</strong> Encode data for use in URLs without breaking.</li>
          <li><strong>Documents:</strong> Encode PDFs or other documents for embedding or sharing.</li>
        </ul>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background-color: #f9fafb;
          min-height: 70vh;
          max-width: 900px;
          margin: auto;
        }

        .heading {
          font-size: 2.5rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }

        .message {
          font-size: 1.2rem;
          color: #555;
          margin-bottom: 20px;
          text-align: center;
          max-width: 700px;
        }

        .input-box {
          width: 80%;
          padding: 12px;
          margin: 20px 0;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1.1rem;
          box-sizing: border-box;
        }

        .button-container {
          display: flex;
          gap: 20px;
        }

        .button {
          padding: 12px 24px;
          font-size: 1rem;
          background-color: #0070f3;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .button:disabled {
          background-color: #a0a0a0;
        }

        .button:hover {
          background-color: #0051a1;
        }

        .error-message {
          color: red;
          margin-top: 10px;
        }

        .result-container {
          margin-top: 20px;
          background-color: #eef2f7;
          padding: 10px;
          border-radius: 8px;
          width: 80%;
          word-break: break-word;
        }

        .result-heading {
          font-size: 1.5rem;
          color: #333;
        }

        .result-text {
          font-size: 1.1rem;
          color: #555;
        }

        .info-container {
          padding: 40px 20px;
          background-color: #ffffff;
          max-width: 900px;
          margin: 40px auto;
        }

        .info-heading {
          font-size: 2rem;
          color: #0070f3;
          margin-bottom: 10px;
        }

        .info-text {
          font-size: 1.2rem;
          color: #444;
          line-height: 1.8;
          margin-bottom: 20px;
          max-width: 800px;
        }

        .info-list {
          font-size: 1rem;
          color: #555;
          padding-left: 20px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .container {
            padding: 20px;
          }

          .input-box {
            width: 100%;
          }

          .button-container {
            flex-direction: column;
            gap: 10px;
          }

          .result-container {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
