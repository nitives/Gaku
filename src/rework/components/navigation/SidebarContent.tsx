import React from "react";
import style from "./Sidebar.module.css";
import { LinearBlur } from "progressive-blur";
import Link from "next/link";

export const SidebarContent = () => {
  return (
    <div className={style.SidebarContent}>
      <div className={style.SidebarContentScrollArea}>
      <ul>
          <li>
            {/* Home route */}
            <Link href="/" className="navigation-item__link" aria-pressed="false">
              Home
            </Link>
          </li>
          <li>
            {/* Example: Go to /playlist/abc123 */}
            <Link href="/playlist/abc123" className="navigation-item__link">
              Playlist "abc123"
            </Link>
          </li>
          <li>
            {/* Example: /album/spaceships/12345 */}
            <Link href="/album/spaceships/12345" className="navigation-item__link">
              Album "spaceships" (#12345)
            </Link>
          </li>
          <li>
            {/* Example: /artist/drake/768 */}
            <Link href="/artist/drake/768" className="navigation-item__link">
              Artist "drake" (#768)
            </Link>
          </li>
          <li>
            {/* Example: /library/albums */}
            <Link href="/library/albums" className="navigation-item__link">
              Your Albums
            </Link>
          </li>
          <li>
            {/* Example: /library/songs */}
            <Link href="/library/songs" className="navigation-item__link">
              Your Songs
            </Link>
          </li>
          {/* etc. */}
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
