import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoText}>SIGEPA</span>
          </Link>
        </div>
        <nav className={styles.navLinks}>
          <Link to="/login" className={styles.navLink}>Iniciar Sesión</Link>
          <Link to="/registro" className={styles.navLink}>Registro</Link>
        </nav>
      </header>
      <main className={styles.content}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} SIGEPA - Sistema de Gestión de Pagos. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
} 