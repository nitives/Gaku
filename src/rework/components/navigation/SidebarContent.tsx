import React from "react";
import style from "./Sidebar.module.css";
import { LinearBlur } from "progressive-blur";
import Link from "next/link";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { AiFillHome, AiFillClockCircle, AiFillHeart } from "react-icons/ai";
import { BiSolidAlbum, BiSolidPlaylist, BiSolidMusic } from "react-icons/bi";
import { FaUserAlt, FaListAlt } from "react-icons/fa";
import { USER } from "@/lib/constants";

const libraryItems = [
  {
    href: "/library/recently-added",
    text: "Recently Added",
    icon: <AiFillClockCircle />,
  },
  { href: "/library/artists", text: "Artists", icon: <FaUserAlt /> },
  { href: "/library/albums", text: "Albums", icon: <BiSolidAlbum /> },
  { href: "/library/songs", text: "Songs", icon: <BiSolidMusic /> },
];

const playlistItems = [
  { href: "/playlists", text: "All Playlists", icon: <FaListAlt /> },
  { href: "/favorite-songs", text: "Favorite Songs", icon: <AiFillHeart /> },
  {
    href: "/2093-all-parts",
    text: "2093 (All Parts)",
    icon: <BiSolidPlaylist />,
  },
];

export const SidebarContent = () => {
  return (
    <div className={style.SidebarContent}>
      <div className={style.SidebarContentScrollArea}>
        <ul className={style.SidebarList}>
          <Item href="/" text="Home" icon={<AiFillHome />} />

          <SectionLabel label="Library" />
          {libraryItems.map((item, index) => (
            <Item
              key={`library-${index}`}
              href={item.href}
              text={item.text}
              icon={item.icon}
            />
          ))}

          <SectionLabel label="Playlists" />
          {playlistItems.map((item, index) => (
            <Item
              key={`playlist-${index}`}
              href={item.href}
              text={item.text}
              icon={item.icon}
            />
          ))}
        </ul>
      </div>
      <div className={style.SidebarFooter}>
        <SidebarUserFooter />
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

const SectionLabel = ({ label }: { label: string }) => (
  <div className={style.SidebarSectionLabel}>{label}</div>
);

const Item = ({
  href,
  text,
  icon,
}: {
  href: string;
  text: string;
  icon?: React.ReactNode;
}) => {
  const showIcons = USER.settings.sidebar.showIcons;
  return (
    <li className={style.SidebarItem}>
      <Link href={href} className={style.SidebarItemLink}>
        {showIcons && icon && (
          <span className={style.SidebarItemIcon}>{icon}</span>
        )}
        <span>{text}</span>
      </Link>
    </li>
  );
};
