"use client";
import { InputHTMLAttributes } from "react";
import style from "./SearchBar.module.css";

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  query: string;
  placeholder: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  placeholder,
  handleInputChange,
  onBlur,
  onSubmit,
  ...props
}) => {
  return (
    <div className={style.SearchBarWrapper}>
      <div className={style.SearchBar}>
        <form role="search" onSubmit={onSubmit}>
          <SearchIcon />
          <input
            value={query}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={style.SearchInput}
            type="search"
            aria-autocomplete="list"
            aria-multiline="false"
            aria-label="Search"
            aria-controls="search-suggestions"
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            {...props}
          />
        </form>
      </div>
    </div>
  );
};

export const SearchIcon = () => {
  return (
    <svg
      height="14"
      width="14"
      style={{
        fill: "var(--SearchIcon-fill)",
        position: "absolute",
        top: "20px",
        insetInlineStart: "10px",
      }}
      viewBox="0 0 16 16"
      className="search-svg"
      aria-hidden="true"
    >
      <path d="M11.87 10.835c.018.015.035.03.051.047l3.864 3.863a.735.735 0 1 1-1.04 1.04l-3.863-3.864a.744.744 0 0 1-.047-.051 6.667 6.667 0 1 1 1.035-1.035zM6.667 12a5.333 5.333 0 1 0 0-10.667 5.333 5.333 0 0 0 0 10.667z"></path>
    </svg>
  );
};
