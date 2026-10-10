// A restrained, line-drawn egg motif standing in for product photography.
// Deliberately not cartoonish: single stroke weight, no color fill, no face/personality.
export default function EggMotif({ className = '', strokeColor = 'currentColor' }) {
  return (
    <svg viewBox="0 0 120 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M60 8C35 8 14 58 14 98c0 28 20.6 54 46 54s46-26 46-54C106 58 85 8 60 8Z"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <path d="M60 8C50 30 44 60 44 98" stroke={strokeColor} strokeWidth="1" strokeOpacity="0.35" />
    </svg>
  );
}
