export const MAX_IMAGE_MB = 5;
export const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Lit un fichier image, recadre au centre en 2:3 (ou garde le ratio) et compresse en JPEG base64.
 *  TODO(Supabase) : uploader vers Storage et stocker l'URL publique à la place du base64. */
export async function processImage(file: File, crop23 = true): Promise<string> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Format non accepté (JPG, PNG ou WebP).");
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) throw new Error(`Fichier trop lourd (max ${MAX_IMAGE_MB} Mo).`);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("Image illisible"));
      i.src = url;
    });
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (crop23) {
      const target = 2 / 3;
      if (sw / sh > target) {
        sw = sh * target;
        sx = (img.width - sw) / 2;
      } else {
        sh = sw / target;
        sy = (img.height - sh) / 2;
      }
    }
    const W = 600;
    const H = Math.round((W * sh) / sw);
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    canvas.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}
