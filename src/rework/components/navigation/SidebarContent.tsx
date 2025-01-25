import React from "react";
import style from "./Sidebar.module.css";
import { LinearBlur } from "progressive-blur";
import Link from "next/link";

const exampleItems = [
  { href: "/artist/lilyeat/295329678", text: "Yeat" },
  { href: "/artist/osamason/222077223", text: "Osamason" },
  { href: "/artist/szababy2/312938480", text: "SZA" },
  { href: "/album/sos/1928518223", text: "SOS - Album" },
  { href: "/album/2093/1776273075", text: "2093 - Album" },
];

export const SidebarContent = () => {
  return (
    <div className={style.SidebarContent}>
      <div className={style.SidebarContentScrollArea}>
        <ul className={style.SidebarList}>
          <Item href="/" text="Home" />
          <div className="py-2">
            {exampleItems.map((item, index) => (
              <Item key={index} href={item.href} text={item.text} />
            ))}
          </div>
          <Item href="/library/albums" text="Your Albums" />
          <Item href="/library/songs" text="Your Songs" />
        </ul>
      </div>
      <div className={style.SidebarFooter}>
        <div className="z-10 relative">
          {/* <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis
            temporibus cupiditate?
          </p> */}
        </div>
        <span className="z-0 relative w-full grid">
          <div
            style={{
              zIndex: 1,
              width: "100%",
              height: "1rem",
              position: "absolute",
              bottom: 0,
              background: "var(--blur-tint-gradient)",
            }}
          />
          <LinearBlur
            style={{
              zIndex: 0,
              width: "100%",
              height: "2rem",
              position: "absolute",
              bottom: 0,
            }}
            side="bottom"
            tint="var(--blur-tint)"
          />
        </span>
      </div>
    </div>
  );
};

const Item = ({ href, text }: { href: string; text: string }) => (
  <li className={style.SidebarItem}>
    <Link href={href}>{text}</Link>
  </li>
);
