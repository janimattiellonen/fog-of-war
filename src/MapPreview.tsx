interface MapPreviewProps {
  mapFile: string;
  size?: number;
}

export default function MapPreview({ mapFile, size = 120 }: MapPreviewProps) {
  const previewSrc = `/maps/${mapFile.replace(/\.map$/, '.preview.png')}`;

  return (
    <img
      src={previewSrc}
      alt={mapFile}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: 6,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: '#0a0a0a',
      }}
    />
  );
}
