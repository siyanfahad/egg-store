import { useEffect, useState } from 'react';
import EggMotif from './EggMotif';

const TONES = ['bg-forest/10', 'bg-gold/15', 'bg-charcoal/5'];

export default function ProductImage({ seed = 0, imageUrl, alt = 'Fresh eggs', className = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const tone = TONES[seed % TONES.length];
  const resolvedImageUrl = imageUrl?.startsWith('/images/')
    ? `${import.meta.env.BASE_URL}${imageUrl.slice(1)}`
    : imageUrl;

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedImageUrl]);

  return (
    <div className={`${tone} relative flex items-center justify-center overflow-hidden ${className}`}>
      <EggMotif className="w-1/3 h-1/3 text-charcoal/25" />
      {resolvedImageUrl && !imageFailed && (
        <img
          src={resolvedImageUrl}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}
