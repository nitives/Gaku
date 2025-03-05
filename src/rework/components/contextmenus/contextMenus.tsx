"use client";
import { Menu, Item, ItemParams } from "react-contexify";
import { useUser } from "@/hooks/useUser";
import { showToast } from "@/hooks/useToast";

// We'll reference this ID in <ContextMenu type="song" ...>
export const SONG_MENU_ID = "songMenu";

export function SongMenu() {
  const { addSongToLibrary } = useUser();

  // This callback handles the click on "Add to library"
  // `ItemParams` is the shape of the data we receive
  const handleAddToLibrary = ({ props }: ItemParams) => {
    // `props` is whatever we pass to `show({ props: {...} })`
    const itemId = props?.itemId;
    if (itemId) {
      addSongToLibrary(itemId);
      showToast("success", `Song added to library`);
    }
  };

  return (
    <Menu id={SONG_MENU_ID} theme="dark" animation="fade">
      <Item onClick={handleAddToLibrary}>Add to Library</Item>
    </Menu>
  );
}

// You can create similar menus for albumMenu, artistMenu, etc.
// For example:
// export const ALBUM_MENU_ID = "albumMenu";
// export function AlbumMenu() { /* ... */ }

export const contextMenus = (
  <>
    <SongMenu />
    {/* <AlbumMenu /> */}
    {/* <ArtistMenu /> */}
  </>
);
