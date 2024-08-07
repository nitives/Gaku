"use client";
import Link from "next/link";
import React from "react";
import { GoHomeFill } from "react-icons/go";
import { IoAlbums, IoSearch } from "react-icons/io5";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export const Navbar = ({
  volume,
  setVolume,
  muted,
  setMuted,
  playing,
  setPlaying,
  duration,
  played,
  onSeek,
}: {
  volume?: number;
  setVolume?: (volume: number) => void;
  muted?: boolean;
  setMuted?: (muted: boolean) => void;
  playing?: boolean;
  setPlaying?: (playing: boolean) => void;
  duration?: number;
  played?: number;
  onSeek?: (time: number) => void;
}) => {
  const pathname = usePathname();
  const isLinkActive = (href: string) => pathname === href;

  return (
    <div className="navbar-mobile-container select-none !z-[100] relative">
      <nav className="navbar-mobile bg-background/15">
        <motion.div whileTap={{ scale: 0.925 }}>
          <Link href={"/"} className="flex flex-col items-center">
            <GoHomeFill
              className={`navbar-icon ${
                isLinkActive("/") ? "text-ambient" : "text-foreground/30"
              }`}
              size={30}
            />
            <span
              className={`navbar-icon-title ${
                isLinkActive("/") ? "text-ambient" : "text-foreground/30"
              }`}
            >
              Home
            </span>
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.925 }}>
          <Link href={"/search"} className="flex flex-col items-center">
            <IoSearch
              className={`navbar-icon ${
                isLinkActive("/search") ? "text-ambient" : "text-foreground/30"
              }`}
              size={30}
            />
            <span
              className={`navbar-icon-title ${
                isLinkActive("/search") ? "text-ambient" : "text-foreground/30"
              }`}
            >
              Search
            </span>
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.925 }}>
          <Link href={"/library"} className="flex flex-col items-center">
            <IoAlbums
              className={`navbar-icon ${
                isLinkActive("/library") ? "text-ambient" : "text-foreground/30"
              }`}
              size={30}
            />
            <span
              className={`navbar-icon-title ${
                isLinkActive("/library") ? "text-ambient" : "text-foreground/30"
              }`}
            >
              Library
            </span>
          </Link>
        </motion.div>
      </nav>
    </div>
  );
};
