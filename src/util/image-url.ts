import noImage from "../assets/no-image.jpg";

const getCroppedImageUrl = (url: string, width: number, height: number) => {
  if (!url) return noImage;

  const target = "media/";
  const index = url.indexOf(target);

  if (index === -1) return url;

  const insertionPoint = index + target.length;

  // Avoid double-cropping if the URL is already optimized
  if (url.slice(insertionPoint).startsWith("crop/")) return url;

  return (
    url.slice(0, insertionPoint) +
    `crop/${width}/${height}/` +
    url.slice(insertionPoint)
  );
};

export default getCroppedImageUrl;
