"use client";
import { Menu, Item, ItemParams, PredicateParams } from "react-contexify";
import { useUser } from "@/hooks/useUser";
import { showToast } from "@/hooks/useToast";
import { useCallback } from "react";

export const SONG_MENU_ID = "songMenu";

// Define the shape of props passed to the menu
interface SongMenuProps {
  itemId: string;
}

export function SongMenu() {
  const { addSongToLibrary, removeSongFromLibrary, librarySongs } = useUser();

  const isInLibrary = useCallback(
    (songId: string) => {
      return librarySongs?.some((song) => song.id === songId) || false;
    },
    [librarySongs]
  );

  // Handle adding a song, expecting ItemParams with SongMenuProps
  const handleAddToLibrary = ({ props }: ItemParams<SongMenuProps>) => {
    const itemId = props?.itemId;
    if (itemId) {
      addSongToLibrary(itemId);
      showToast("success", `Song added to library`);
    }
  };

  // Handle removing a song, expecting ItemParams with SongMenuProps
  const handleRemoveFromLibrary = ({ props }: ItemParams<SongMenuProps>) => {
    const itemId = props?.itemId;
    if (itemId) {
      removeSongFromLibrary(itemId);
      showToast("success", `Song removed from library`);
    }
  };

  return (
    <Menu id={SONG_MENU_ID} animation="fade">
      {/* Show "Add to Library" only if song is not in library */}
      <Item
        hidden={({ props }: PredicateParams<SongMenuProps>) => {
          const songId = props?.itemId;
          return !songId || isInLibrary(songId);
        }}
        onClick={handleAddToLibrary}
      >
        Add to Library
      </Item>
      {/* Show "Remove from Library" only if song is in library */}
      <Item
        hidden={({ props }: PredicateParams<SongMenuProps>) => {
          const songId = props?.itemId;
          return !songId || !isInLibrary(songId);
        }}
        onClick={handleRemoveFromLibrary}
      >
        Remove from Library
      </Item>
    </Menu>
  );
}

export const contextMenus = (
  <>
    <SongMenu />
    {/* <AlbumMenu /> */}
    {/* <ArtistMenu /> */}
  </>
);
