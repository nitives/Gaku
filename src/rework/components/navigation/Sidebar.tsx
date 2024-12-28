import React from "react";
import { SidebarContent } from "./SidebarContent";
import { SearchBar } from "./search/SearchBar";
import style from "./Sidebar.module.css";
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
      <SearchBar />
    </header>
  );
};
