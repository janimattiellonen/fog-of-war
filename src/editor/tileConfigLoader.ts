import { type TileConfig, parseTileConfig } from '../game/mapParser';

export interface LoadedTileConfig {
  config: TileConfig;
  images: Map<string, HTMLImageElement>;
}

export async function loadEditorTileConfig(configUrl = '/maps/tiles.conf'): Promise<LoadedTileConfig> {
  const response = await fetch(configUrl);
  if (!response.ok) {
    throw new Error(`Failed to load tile config (${response.status}): ${configUrl}`);
  }
  const text = await response.text();
  const config = parseTileConfig(text);

  const images = new Map<string, HTMLImageElement>();
  const loadPromises: Promise<void>[] = [];

  for (const [code, tileDef] of Object.entries(config.tiles)) {
    const promise = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        images.set(code, img);
        resolve();
      };
      img.onerror = () => {
        resolve();
      };
      img.src = `/assets/tiles/${tileDef.image}`;
    });
    loadPromises.push(promise);
  }

  await Promise.all(loadPromises);
  return { config, images };
}
