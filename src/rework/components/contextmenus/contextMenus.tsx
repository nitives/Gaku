"use client";
import { Menu, Item } from "react-contexify";
import { useUser } from "@/hooks/useUser";

export const SongMenu = () => {
  const { addSongToLibrary } = useUser();

  return (
    <Menu id="songMenu">
      <Item
        id="addToLibrary"
        onClick={(data) => {
          addSongToLibrary(data.props.itemId);
        }}
      >
        Add to library
      </Item>
    </Menu>
  );
};

// Similar definitions for AlbumMenu and ArtistMenu
export const contextMenus = (
  <>
    <SongMenu />
    {/* <AlbumMenu />
    <ArtistMenu /> */}
  </>
);
