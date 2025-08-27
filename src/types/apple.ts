export interface AppleLyricsResponse {
  lyrics: {
    data: Array<{
      id: string;
      type: string;
      attributes: {
        playParams: {
          catalogId: string;
          displayType: number;
          id: string;
          kind: string;
        };
        ttml: string;
      };
    }>;
  };
  artwork: {
    bgColor: string;
    height: number;
    textColor1: string;
    textColor2: string;
    textColor3: string;
    textColor4: string;
    url: string;
    width: number;
  };
}
