import { Platform } from "react-native";

export interface CameraPhoto {
  id: string;
  uri: string;
}

/**
 * Fetch recent photos from the device library.
 *
 * Web / permission-denied / any error → [].
 * Never throws. Photos stay on-device and are never uploaded.
 *
 * Uses a dynamic import so the web bundle never includes expo-media-library
 * (which is native-only). `npx expo export --platform web` stays clean.
 *
 * Uses the SDK 56 Query-based API (Asset / Query / AssetField / MediaType).
 */
export async function getRecentPhotos(limit = 8): Promise<CameraPhoto[]> {
  if (Platform.OS === "web") return [];
  try {
    // Dynamic import: resolved on native only; never bundled for web.
    const MediaLibrary = await import("expo-media-library");
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== "granted") return [];

    // SDK 56: use the Query builder. Filter to IMAGE type, order by creation
    // time descending (most recent first), limit to N.
    const { AssetField, MediaType, Query } = MediaLibrary;
    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
      .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
      .limit(limit)
      .exe();

    // Asset.getUri() is async — resolve all URIs in parallel.
    const photos = await Promise.all(
      assets.map(async (asset) => ({
        id: asset.id,
        uri: await asset.getUri(),
      })),
    );
    return photos;
  } catch {
    return [];
  }
}

/**
 * Request photo library permission.
 *
 * Web → false. Never throws.
 * Uses a dynamic import for the same web-safety reason as getRecentPhotos.
 */
export async function requestPhotoPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const MediaLibrary = await import("expo-media-library");
    const { granted } = await MediaLibrary.requestPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}
