import React, { ReactNode } from "react";
import style from "./Main.module.css";

interface DynamicPageProps {
  children?: ReactNode;
}

export const DynamicPage = ({ children }: DynamicPageProps) => {
  return (
    <main className={style.DynamicPage}>
      {children}
    </main>
  );
};
