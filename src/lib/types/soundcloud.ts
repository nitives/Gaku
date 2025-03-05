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
  latest: any[];
}

export interface SoundCloudTrack {
  artwork_url: string;
  artwork_url_hd: string | null;
  caption: string | null;
  comment_count: number;
  commentable: boolean;
  created_at: string;
  description: string;
  display_date: string;
  download_count: number;
  downloadable: boolean;
  duration: number;
  embeddable_by: string;
  full_duration: number;
  genre: string;
  has_downloads_left: boolean;
  id: number;
  kind: string;
  label_name: string;
  last_modified: string;
  license: string;
  likes_count: number;
  media: {
    transcodings: Array<{
      duration: number;
      format: {
        mime_type: string;
        protocol: string;
      };
      preset: string;
      quality: string;
      snipped: boolean;
      url: string;
    }>;
  };
  monetization_model: string;
  permalink: string;
  permalink_url: string;
  playback_count: number;
  policy: string;
  public: boolean;
  publisher_metadata: {
    artist: string;
    contains_music: boolean;
    explicit: boolean;
    album_title: string;
    id: number;
    isrc: string;
    urn: string;
  };
  purchase_title: string | null;
  purchase_url: string | null;
  release_date: string;
  reposts_count: number;
  secret_token: string | null;
  sharing: string;
  state: string;
  station_permalink: string;
  station_urn: string;
  streamable: boolean;
  tag_list: string;
  title: string;
  track_authorization: string;
  uri: string;
  urn: string;
  user: SoundCloudArtist;
  user_id: number;
  visuals: any | null;
  waveform_url: string;
}

export interface SoundCloudAlbum {
  artwork_url: string;
  created_at: string;
  description: string | null;
  display_date: string;
  duration: number;
  embeddable_by: string;
  genre: string;
  id: number;
  is_album: boolean;
  kind: string;
  label_name: string | null;
  last_modified: string;
  license: string;
  likes_count: number;
  managed_by_feeds: boolean;
  permalink: string;
  permalink_url: string;
  public: boolean;
  published_at: string;
  purchase_title: string | null;
  purchase_url: string | null;
  release_date: string;
  reposts_count: number;
  secret_token: string | null;
  set_type: string;
  sharing: string;
  tag_list: string;
  title: string;
  track_count: number;
  tracks: SoundCloudTrack[];
  uri: string;
  user: SoundCloudArtist;
  user_id: number;
}

export interface SoundCloudSearchResult {
  large: {
    collection: SoundCloudTrack[];
  };
  small: {
    collection: Array<{
      output: string;
      query: string;
    }>;
    next_href: string | null;
    query_urn: string;
  };
}

// Sections

export interface SoundCloudSections {
  collection: {
    urn: string;
    query_urn?: string;
    title: string;
    description?: string | null;
    tracking_feature_name: string;
    last_updated?: string | null;
    style?: string | null;
    social_proof?: string | null;
    social_proof_users?: string | null;
    items: {
      collection: {
        artwork_url?: string | null;
        artwork_url_hd?: string | null;
        created_at: string;
        duration: number;
        id: number;
        kind: "user" | "playlist";
        last_modified: string;
        likes_count: number;
        managed_by_feeds: boolean;
        permalink: string;
        permalink_url: string;
        public: boolean;
        reposts_count: number;
        secret_token?: string | null;
        sharing: string;
        title: string;
        track_count: number;
        uri: string;
        user_id: number;
        set_type: string;
        is_album: boolean;
        published_at?: string | null;
        release_date?: string | null;
        display_date: string;
        // User ------------------------------------------------
        avatar_url_hd?: string | null;
        avatar_url?: string | null;
        first_name: string;
        followers_count: number;
        full_name: string;
        last_name: string;
        urn: string;
        username: string;
        verified: boolean;
        city: string | null;
        country_code: string;
        badges: {
          pro: false;
          creator_mid_tier: false;
          pro_unlimited: true;
          verified: true;
        };
        // User - End ------------------------------------------
        user: {
          avatar_url: string;
          first_name: string;
          followers_count: number;
          full_name: string;
          id: number;
          kind: string;
          last_modified: string;
          last_name: string;
          permalink: string;
          permalink_url: string;
          uri: string;
          urn: string;
          username: string;
          verified: boolean;
          city?: string | null;
          country_code?: string | null;
          badges: {
            pro: boolean;
            creator_mid_tier: boolean;
            pro_unlimited: boolean;
            verified: boolean;
          };
        };
      }[];
      next_href?: string | null;
      query_urn?: string | null;
    };
    kind: string;
    id: string;
  }[];
}
