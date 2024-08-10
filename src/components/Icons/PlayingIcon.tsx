import React from "react";
import "./PlayingIcon.css";

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  size?: string | number;
  color?: string;
  title?: string;
}

export const PlayingIcon: React.FC<IconBaseProps> = ({
  size = "24",
  color = "currentColor",
  title = "Icon depicting sound waves with three vertical bars changing in height in a pulsating manner",
  ...props
}) => {
  return (
    <span className="size-fit -ml-1">
      <svg
        fill={color}
        viewBox="0 0 24 30"
        width={size}
        height={size}
        {...props}
      >
        <title>{title}</title>
        <rect
          className="playing-icon-1"
          height="30"
          rx="2"
          ry="2"
          width="4"
        ></rect>
        <rect
          className="playing-icon-2"
          height="22"
          rx="2"
          ry="2"
          width="4"
          x="10"
          y="4"
        ></rect>
        <rect
          className="playing-icon-3"
          height="30"
          rx="2"
          ry="2"
          width="4"
          x="20"
        ></rect>
      </svg>
    </span>
  );
};

export const PausedIcon: React.FC<IconBaseProps> = ({
  size = "24",
  color = "currentColor",
  title = "Icon depicting sound waves with three vertical bars in a static, paused state",
  ...props
}) => {
  return (
    <span className="size-fit -ml-1">
      <svg
        fill={color}
        viewBox="0 0 30 10"
        width={size}
        height={size}
        {...props}
      >
        <title>{title}</title>
        <circle cx="5" cy="5" r="3" />
        <circle cx="15" cy="5" r="3" />
        <circle cx="25" cy="5" r="3" />
      </svg>
    </span>
  );
};
