"use client";
import { dev } from "@/lib/utils";
import { useContextMenu } from "react-contexify";

type ContextMenuProps = {
  type: "song" | "album" | "artist";
  itemId: string;
  children: React.ReactNode;
  ref: React.Ref<any>;
  as?: React.ElementType;
  className?: string;
  title?: string;
};

export const handleContextMenu = (
  e: React.MouseEvent,
  type: "song" | "album" | "artist",
  itemId: string,
  show: (props: { event: React.MouseEvent; props: { itemId: string } }) => void
) => {
  e.preventDefault();
  dev.log("Context menu |", "type:", type, "id:", itemId);
  show({ event: e, props: { itemId } });
};

const ContextMenu = ({
  type,
  itemId,
  children,
  ref,
  as: Element = "div",
  className = "",
  title = "",
}: ContextMenuProps) => {
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
      throw new Error("Invalid menu type");
  }

  const { show } = useContextMenu({ id: menuId });

  return (
    <Element
      ref={ref}
      {...(title ? { title } : {})} // dont add title if it's empty
      onContextMenu={(e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      // Pass itemId to the menu
      dev.log("Context menu |", "type:", type, "id:", itemId);
      show({ event: e, props: { itemId } });
      }}
      className={className}
    >
      {children}
    </Element>
  );
};

export default ContextMenu;
