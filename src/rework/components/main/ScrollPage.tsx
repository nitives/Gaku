import React, { ReactNode } from "react";
import { Footer } from "./Footer";
import style from "./Main.module.css";
import { DynamicPage } from "./DynamicPage";

interface ScrollPageProps {
  children?: ReactNode;
}

export const ScrollPage = ({ children }: ScrollPageProps) => {
  return (
    <div className={style.ScrollPage}>
      <DynamicPage key={1}>{children}</DynamicPage>
      {/* <Footer /> */}
    </div>
  );
};
