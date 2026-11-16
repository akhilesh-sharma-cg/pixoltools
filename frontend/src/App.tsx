
import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import { useAuth } from './context/AuthContext';
import './App.css';

/* ------------------------------------------------------------------ */
/* Navbar                                                             */
/* ------------------------------------------------------------------ */

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__logo" aria-label="PixelTools">
          <span className="logo__mark"></span>
          PixelTools
        </div>

        <div className={`navbar__menu ${isOpen ? 'open' : ''}`}>
          <a href="#home" className="navbar__link" onClick={() => setIsOpen(false)}>
            Home
          </a>

          <a
            href="#background-remover"
            className="navbar__link"
            onClick={() => setIsOpen(false)}
          >
            Background Remover
          </a>

          <a href="#pricing" className="navbar__link" onClick={() => setIsOpen(false)}>
            Pricing
          </a>

          <Link
            to="/login"
            className="navbar__link navbar__link--ghost"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="navbar__link navbar__link--primary"
            onClick={() => setIsOpen(false)}
          >
            Sign Up
          </Link>
        </div>

        <button
          className="navbar__burger"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Hero / Image Upload                                                */
/* ------------------------------------------------------------------ */

type AcceptedFile = 'image/jpeg' | 'image/png' | 'image/webp';

function Hero() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeMessage, setResumeMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, loading: authLoading } = useAuth();

  const ACCEPTED_TYPES: AcceptedFile[] = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  const ACCEPTED_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp'
  ];

  /* Restore the image after successful login */
  useEffect(() => {
    const pendingFile = location.state?.pendingFile;

    if (!(pendingFile instanceof File)) return;

    setFile(pendingFile);
    setError(null);
    setResumeMessage(
      'You are signed in. Your uploaded image has been restored. You can continue.'
    );

    const reader = new FileReader();

    reader.onload = (event) => {
      setPreview(event.target?.result as string | null);
    };

    reader.onerror = () => {
      setError('Could not restore your image. Please upload it again.');
    };

    reader.readAsDataURL(pendingFile);

    // Clear temporary navigation state after restoring the image.
    navigate('/', {
      replace: true,
      state: null
    });
  }, [location.state, navigate]);

  const isValidFile = (f: File): boolean => {
    if (!ACCEPTED_TYPES.includes(f.type as AcceptedFile)) {
      return false;
    }

    const ext = '.' + f.name.split('.').pop()?.toLowerCase();

    return ACCEPTED_EXTENSIONS.includes(ext);
  };

  const handleFiles = (files: FileList | File[]) => {
    setError(null);
    setResumeMessage('');

    const selectedFile = files[0];

    if (!selectedFile) return;

    if (!isValidFile(selectedFile)) {
      setError('Please upload a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = (event) => {
      setPreview(event.target?.result as string | null);
    };

    reader.onerror = () => {
      setError('Could not load this image. Please try again.');
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setResumeMessage('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* Login protection for background removal */
  const handleRemoveBackground = () => {
    if (!file || authLoading) return;

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          pendingFile: file
        }
      });

      return;
    }

    alert(
      'You are logged in successfully. Your image is ready. ' +
      'Background removal requires a backend connection.'
    );
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files.length) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }

    e.target.value = '';
  };

  return (
    <section id="home" className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <span className="hero__badge">
            Background Remover
          </span>

          <h1 className="hero__title">
            Remove Image Backgrounds <br />
            <span className="title__gradient">
              in Seconds
            </span>
          </h1>

          <p className="hero__description">
            Upload your image and let PixelTools remove the background instantly.
            Supports JPG, JPEG, PNG, and WebP.
          </p>

          <div className="hero__upload">
            <div
              className={`hero__dropzone ${
                dragActive ? 'hero__dropzone--active' : ''
              } ${error ? 'hero__dropzone--error' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hero__file-input"
                onChange={handleFileInputChange}
                aria-label="Select image"
              />

              {preview ? (
                <div className="preview__wrapper">
                  <img
                    className="hero__preview"
                    src={preview}
                    alt="Image preview"
                  />

                  <button
                    type="button"
                    className="preview__remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <div className="hero__dropzone-icon">
                    ↑
                  </div>

                  <p className="hero__dropzone-text">
                    Drag &amp; drop your image here
                  </p>

                  <p className="hero__dropzone-hint">
                    or click to browse
                  </p>

                  <p className="hero__dropzone-supported">
                    Supports JPG, JPEG, PNG, WebP
                  </p>
                </>
              )}
            </div>

            {error && (
              <p className="hero__upload-error">
                {error}
              </p>
            )}

            {resumeMessage && (
              <p className="pt-auth-message" role="status">
                {resumeMessage}
              </p>
            )}

            <button
              type="button"
              className="hero__remove-button"
              onClick={handleRemoveBackground}
              disabled={!file || authLoading}
            >
              {authLoading
                ? 'Checking login...'
                : file
                  ? 'Remove Background'
                  : 'Upload an image first'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How It Works                                                       */
/* ------------------------------------------------------------------ */

type Step = {
  number: number;
  title: string;
  description: string;
};

function StepItem({ number, title, description }: Step) {
  return (
    <div className="step">
      <div className="step__number">
        {number}
      </div>

      <div className="step__content">
        <h3 className="step__title">
          {title}
        </h3>

        <p className="step__description">
          {description}
        </p>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps: Step[] = [
    {
      number: 1,
      title: 'Upload your image',
      description: 'Drag and drop or select a JPG, JPEG, PNG, or WebP file.'
    },
    {
      number: 2,
      title: 'Preview your image',
      description: 'See your uploaded image preview before processing.'
    },
    {
      number: 3,
      title: 'Remove the background',
      description: 'Click Remove Background once the backend is connected.'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works__container">
        <div className="section__header">
          <h2 className="section__title">
            How It Works
          </h2>

          <p className="section__description">
            Simple steps to get a transparent background in seconds.
          </p>
        </div>

        <div className="how-it-works__steps">
          {steps.map((step) => (
            <StepItem key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand" aria-label="PixelTools">
          <span className="logo__mark"></span>
          PixelTools
        </div>

        <p className="footer__tagline">
          Remove image backgrounds in seconds.
        </p>

        <div className="footer__links">
          <a href="#home">Home</a>
          <a href="#background-remover">Background Remover</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>

        <p className="footer__copyright">
          &copy; {new Date().getFullYear()} PixelTools. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                */
/* ------------------------------------------------------------------ */

function App() {
  const location = useLocation();

  if (location.pathname === '/login') {
    return <Login />;
  }

  if (location.pathname === '/signup') {
    return <Signup />;
  }

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default App;
