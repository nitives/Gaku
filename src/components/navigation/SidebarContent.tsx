import React from "react";
import style from "./Sidebar.module.css";
// import { LinearBlur } from "progressive-blur";
import Link from "next/link";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { AiFillHome, AiFillClockCircle, AiFillHeart } from "react-icons/ai";
import { BiSolidAlbum, BiSolidMusic } from "react-icons/bi";
import { FaUserAlt, FaListAlt } from "react-icons/fa";
import { IoMusicalNote } from "react-icons/io5";
import { useUser } from "@/hooks/useUser";

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
  // {
  //   href: "/2093-all-parts",
  //   text: "2093 (All Parts)",
  //   icon: <BiSolidPlaylist />,
  // },
];

const meItems = [
  { href: "/me/likes", text: "Your Likes", icon: <AiFillHeart /> },
  { href: "/me/playlists", text: "Your Playlists", icon: <FaListAlt /> },
  // {
  //   href: "/2093-all-parts",
  //   text: "2093 (All Parts)",
  //   icon: <BiSolidPlaylist />,
  // },
];

const pinnedItems = [
  {
    href: "/album/eternal-atake-2-1/1899041115",
    text: "Eternal Atake 2",
    icon: <IoMusicalNote />,
  },
  {
    href: "/album/lyfestyle-7/1891771676",
    text: "LYFESTYLE",
    icon: <IoMusicalNote />,
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

          <SectionLabel title="Your Soundcloud Content" label="Me" />
          {meItems.map((item, index) => (
            <Item
              key={`me-${index}`}
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

          <SectionLabel label="Pinned" />
          {pinnedItems.map((item, index) => (
            <Item
              key={`pinned-${index}`}
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
          {/* <LinearBlur
            style={{
              zIndex: 0,
              width: "100%",
              height: "2rem",
              position: "absolute",
              bottom: 0,
            }}
            side="bottom"
            tint="var(--blur-tint)"
          /> */}
        </span>
      </div>
    </div>
  );
};

const SectionLabel = ({ label, title }: { label: string; title?: string }) => (
  <div title={title} className={style.SidebarSectionLabel}>
    {label}
  </div>
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
  const { settings } = useUser();
  return (
    <li className={style.SidebarItem}>
      <Link href={href} className={style.SidebarItemLink}>
        {settings?.data?.showSidebarIcons && icon && (
          <span className={style.SidebarItemIcon}>{icon}</span>
        )}
        <span>{text}</span>
      </Link>
    </li>
  );
};
