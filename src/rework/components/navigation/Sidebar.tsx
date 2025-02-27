import { SidebarContent } from "./SidebarContent";
import style from "./Sidebar.module.css";
import Search from "./search/Search";
// TODO | Change the all the import paths with the @ symbol

export const Sidebar = () => {
  return (
    <div className={style.SidebarContainer} aria-label="Sidebar Container">
      <nav className={style.Sidebar} role="navigation" aria-label="Sidebar">
        <SidebarHeader />
        <SidebarContent />
      </nav>
    </div>
  );
};

const SidebarHeader = () => {
  return (
    <header className={style.SidebarHeader}>
      <div className={style.SidebarHeaderLogo}>
        <h1>Gaku</h1>
      </div>
      <Search />
    </header>
  );
};
