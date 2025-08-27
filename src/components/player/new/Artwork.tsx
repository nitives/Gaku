import Image from "next/image";
import style from "./styles/Artwork.module.css";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";

interface ArtworkProps {
  artworkUrl: string;
  altText: string;
  onClick?: () => void;
}

const Artwork: React.FC<ArtworkProps> = ({ artworkUrl, altText, onClick }) => {
  const PLACEHOLDER_IMAGE = useThemedPlaceholder();
  return (
    <div onClick={onClick} className={style.artworkWrapper}>
      <div
        className={style.blurredArtwork}
        style={{ backgroundImage: `url(${artworkUrl})` }}
      />
      <div className={style.artworkContainer}>
        <Image
          src={artworkUrl || PLACEHOLDER_IMAGE}
          alt={altText}
          fill
          // layout="fill"
          objectFit="cover"
          placeholder="blur"
          blurDataURL={PLACEHOLDER_IMAGE}
        />
      </div>
    </div>
  );
};

export default Artwork;
