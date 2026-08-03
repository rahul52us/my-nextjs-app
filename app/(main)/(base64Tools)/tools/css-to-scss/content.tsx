'use client'
// components/CssToScssConverter.tsx
import { useState } from 'react';

const CssToScssConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [scssContent, setScssContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Handle file change (upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    setScssContent('');
    setError('');
  };

  // Convert CSS to SCSS
  const handleConvert = async () => {
    if (!file) return;

    try {
      const fileContent = await file.text();
      const convertedScss = convertCssToScss(fileContent);
      setScssContent(convertedScss);
    } catch (err) {
      console.log(err)
      setError('Failed to read or convert file.');
    }
  };

  // Function to convert CSS to SCSS
  const convertCssToScss = (cssContent: string): string => {
    let scss = cssContent;

    // Convert CSS variables to SCSS variables
    scss = scss.replace(/--([a-zA-Z0-9\-]+)\s*:\s*([^;]+);/g, (match, varName, varValue) => {
      return `$${varName}: ${varValue};`; // CSS var to SCSS variable
    });

    // Replace var() with SCSS variable
    scss = scss.replace(/var\(--([a-zA-Z0-9\-]+)\)/g, (match, varName) => {
      return `\$${varName}`; // var() to SCSS variable
    });

    // Convert media queries (CSS to SCSS format)
    scss = scss.replace(/@media\s*\(([^)]+)\)\s*\{([^}]+)\}/g, (match, query, content) => {
      return `@media (${query}) {\n  ${content.replace(/([^\{\}]+)\s*\{\s*([^}]+)\s*\}/g, (m : any, selector : any, properties : any) => {
        return `${selector} {\n    ${properties.trim()}\n  }`;
      })}\n}`; // Proper formatting for SCSS
    });

    // Handle pseudo-classes like &:hover
    scss = scss.replace(/([a-zA-Z0-9\-_]+)\s*\{\s*([^{]+)\s*(&[^{]+)\s*\{([^}]+)\}\s*\}/g, (match, parent, properties, child, hoverProperties) => {
      return `${parent} {
        ${properties.trim()}
        ${child} {
          ${hoverProperties.trim()}
        }
      }`;
    });

    // Simple nesting (e.g. parent > child styles)
    scss = scss.replace(/([a-zA-Z0-9\-_]+)\s*\{\s*([a-zA-Z0-9\-_]+)\s*\{([^}]+)\}\s*\}/g, (match, parent, child, properties) => {
      return `${parent} {
        ${child} {
          ${properties.trim()}
        }
      }`;
    });

    return scss;
  };

  return (
    <div>
      <h1>Convert CSS to SCSS</h1>
      <input type="file" accept=".css" onChange={handleFileChange} />
      <button onClick={handleConvert} disabled={!file}>
        Convert
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {scssContent && (
        <div>
          <h2>Converted SCSS</h2>
          <textarea
            rows={20}
            cols={80}
            value={scssContent}
            readOnly
          />
          <button
            onClick={() => {
              const element = document.createElement('a');
              const file = new Blob([scssContent], { type: 'text/plain' });
              element.href = URL.createObjectURL(file);
              element.download = 'converted.scss';
              document.body.appendChild(element);
              element.click();
            }}
          >
            Download SCSS
          </button>
        </div>
      )}
    </div>
  );
};

export default CssToScssConverter;
