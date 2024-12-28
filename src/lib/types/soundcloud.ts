export interface SoundCloudArtist {
  avatar_url: string;
  city: string;
  comments_count: number;
  country_code: string | null;
  created_at: string;
  creator_subscriptions: {
    product: {
      id: string;
    };
  }[];
  creator_subscription: {
    product: {
      id: string;
    };
  };
  description: string;
  followers_count: number;
  followings_count: number;
  first_name: string;
  full_name: string;
  groups_count: number;
  id: number;
  kind: string;
  last_modified: string;
  last_name: string;
  likes_count: number;
  playlist_likes_count: number;
  permalink: string;
  permalink_url: string;
  playlist_count: number;
  reposts_count: number | null;
  track_count: number;
  uri: string;
  urn: string;
  username: string;
  verified: boolean;
  visuals: {
    urn: string;
    enabled: boolean;
    visuals: {
      urn: string;
      entry_time: number;
      visual_url: string;
    }[];
    tracking: null;
  };
  badges: {
    pro: boolean;
    creator_mid_tier: boolean;
    pro_unlimited: boolean;
    verified: boolean;
  };
  station_urn: string;
  station_permalink: string;
  spotlight: any[];
}
