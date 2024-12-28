interface Song {
  name?: string;
  artist?: string;
  lyrics?: any[];
  expiresAt?: number;
}

interface User {
  key?: number;
  name?: string;
  config?: Record<string, any>;
}

interface GakuData {
  songs: Song[];
  user?: User;
  [key: string]: any;
}

const STORAGE_KEY = "gakuData";

export const GakuStorage = {
  getData(): GakuData {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { songs: [] };
  },

  setData(data: GakuData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  updateData(updater: (data: GakuData) => GakuData): void {
    const currentData = this.getData();
    const newData = updater(currentData);
    this.setData(newData);
  },

  addSong(song: Song): void {
    this.updateData((data) => ({
      ...data,
      songs: [...(data.songs || []), song],
    }));
  },

  updateSong(songIndex: number, updates: Partial<Song>): void {
    this.updateData((data) => {
      const songs = [...data.songs];
      songs[songIndex] = { ...songs[songIndex], ...updates };
      return { ...data, songs };
    });
  },

  updateUser(userUpdate: Partial<User>): void {
    this.updateData((data) => ({
      ...data,
      user: { ...(data.user || {}), ...userUpdate },
    }));
  },

  updateUserConfig(config: Record<string, any>): void {
    this.updateData((data) => ({
      ...data,
      user: {
        ...(data.user || {}),
        config: { ...(data.user?.config || {}), ...config },
      },
    }));
  },
};
