// Convierte archivos pequeños a data URL para poder "adjuntarlos" sin backend
// de almacenamiento real. En producción esto se reemplaza por Firebase Storage.

export const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4MB, límite razonable para localStorage

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
