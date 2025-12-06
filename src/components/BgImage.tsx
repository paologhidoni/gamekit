import noImage from "../assets/no-image.png";

interface BgImageProps {
  gameName: string;
  gameBgImage: string;
  extraClasses?: string;
}

export default function BgImage({
  gameName,
  gameBgImage,
  extraClasses,
}: BgImageProps) {
  const bgImage = gameBgImage || noImage;
  const classes = `absolute inset-0 h-full w-full object-cover rounded-2xl group-hover:scale-105 transition-all transition-100 ${extraClasses}`;

  return <img src={bgImage} alt={gameName} className={classes} />;
}
