export interface EditorialVideoFrame {
  width: number;
  height: number;
  url: string;
  textColor1?: string;
  textColor2: string;
  textColor3: string;
  textColor4?: string;
  bgColor?: string;
  hasP3?: boolean;
}

export interface EditorialVideoSection {
  previewFrame: EditorialVideoFrame;
  video: string;
}

export interface EditorialVideo {
  motionDetailSquare: EditorialVideoSection;
  motionDetailTall: EditorialVideoSection;
  motionSquareVideo1x1: EditorialVideoSection;
}
