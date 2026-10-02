import { NavLink, Outlet } from "react-router-dom";
import { useSession } from "../../auth/session";
import { Button } from "../Button";
import styles from "./Layout.module.css";
import { FaServicestack } from "react-icons/fa6";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Layout() {
  const session = useSession();
  const name = session.user?.name ?? "";

  return (
    <div className={styles.app}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <header className={styles.header}>
        <NavLink to="/requests" className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            <FaServicestack />
          </span>
          <span>Report Hub</span>
        </NavLink>

        <nav aria-label="Main" className={styles.nav}>
          <NavLink to="/requests" end className={navClass}>
            Requests
          </NavLink>
          <NavLink to="/requests/new" className={navClass}>
            New request
          </NavLink>
        </nav>

        <div className={styles.user}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(name)}
          </span>
          <span className={styles.userName}>{name}</span>
          <Button
            className={styles.signOut}
            onClick={() => void session.signOut()}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;
}
