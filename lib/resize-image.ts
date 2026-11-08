const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.82;

/* Phone photos run 5-12 MB; on a mountain connection that upload never finishes. */
export async function resizeImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    return blob && blob.size < file.size ? blob : file;
  } catch {
    // Formats the browser can't decode still go up as they are.
    return file;
  }
}
