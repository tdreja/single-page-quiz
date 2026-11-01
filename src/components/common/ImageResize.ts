/**
 * Images are stored as base64 data URLs inside the quiz, which is kept in the local storage.
 * To keep the quiz small, larger images are scaled down before they are added.
 */
export const MAX_IMAGE_WIDTH = 1600;
export const MAX_IMAGE_HEIGHT = 1000;

export interface Dimensions {
    width: number,
    height: number,
}

/**
 * Scales the dimensions down to fit into the maximum size, keeping the aspect ratio.
 * Smaller images are never scaled up.
 */
export function fitDimensions(
    original: Dimensions,
    maxWidth: number = MAX_IMAGE_WIDTH,
    maxHeight: number = MAX_IMAGE_HEIGHT,
): Dimensions {
    const scale = Math.min(1, maxWidth / original.width, maxHeight / original.height);
    return {
        width: Math.max(1, Math.round(original.width * scale)),
        height: Math.max(1, Math.round(original.height * scale)),
    };
}

function readAsDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result as string));
        reader.addEventListener('error', () => reject(reader.error));
        reader.readAsDataURL(file);
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', () => reject(new Error('Image could not be loaded')));
        image.src = src;
    });
}

/**
 * Reads the image file as data URL, scales it down to the maximum size and converts it to WebP to keep it small.
 * Vector graphics and WebP images that already fit are kept unchanged.
 */
export async function imageFileToDataUrl(file: File): Promise<string> {
    const original = await readAsDataUrl(file);
    if (file.type === 'image/svg+xml') {
        return original;
    }
    const image = await loadImage(original);
    const target = fitDimensions({ width: image.naturalWidth, height: image.naturalHeight });
    if (file.type === 'image/webp' && target.width === image.naturalWidth && target.height === image.naturalHeight) {
        return original;
    }

    const canvas = document.createElement('canvas');
    canvas.width = target.width;
    canvas.height = target.height;
    const context = canvas.getContext('2d');
    if (!context) {
        return original;
    }
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, target.width, target.height);
    // WebP is smaller than JPEG for photos and keeps the transparency of PNGs
    return canvas.toDataURL('image/webp', 0.9);
}
