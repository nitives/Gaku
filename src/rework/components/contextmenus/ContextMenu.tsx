"use client";
import { useContextMenu } from "react-contexify";

type ContextMenuProps = {
  type: "song" | "album" | "artist";
  itemId: string;
  children: React.ReactNode;
};

const ContextMenu = ({ type, itemId, children }: ContextMenuProps) => {
  let menuId: string;

  switch (type) {
    case "song":
      menuId = "songMenu";
      break;
    case "album":
      menuId = "albumMenu";
      break;
    case "artist":
      menuId = "artistMenu";
      break;
    default:
      throw new Error("Invalid type");
  }

  const { show } = useContextMenu({
    id: menuId,
  });

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        show({ event: e });
      }}
      style={{ position: "relative" }}
    >
      {children}
    </div>
  );
};

export default ContextMenu;
