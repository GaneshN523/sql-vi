import { NavLink } from "react-router-dom";
import styles from "./leftsidebar.module.css";

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <h1 className={styles.heading}>Sidebar</h1>

      <div className={styles.buttonContainer}>
        <NavLink to="/" className={styles.button}>Manage Tables</NavLink>
        <NavLink to="/select" className={styles.button}>Select Operations</NavLink>
        <NavLink to="/indexview" className={styles.button}>IndexView Operations</NavLink>
        <NavLink to="/sequences" className={styles.button}>Sequence Operations</NavLink>
        <NavLink to="/transactions" className={styles.button}>Transaction Operations</NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
