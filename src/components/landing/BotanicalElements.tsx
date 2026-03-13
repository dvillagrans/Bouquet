export const AmbientLeaf = ({ className, size = 100 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    opacity={0.08}
  >
    <path
      d="M20 80C30 90 45 95 60 90C75 85 85 70 85 50C85 30 70 15 50 15C30 15 15 30 15 50C15 65 20 75 20 80Z"
      stroke="currentColor"
      strokeWidth="0.5"
    />
    <path
      d="M15 85C40 60 60 40 85 15"
      stroke="currentColor"
      strokeWidth="0.5"
    />
    <path
      d="M50 15C55 25 60 40 50 50C40 60 25 65 15 60"
      stroke="currentColor"
      strokeWidth="0.5"
    />
  </svg>
);

export const CornerOrnament = ({ className, flip = false }: { className?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ transform: flip ? 'rotate(180deg)' : 'none' }}
    opacity={0.15}
  >
    <path
      d="M10 10H40M10 10V40"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path
      d="M15 15H30M15 15V30"
      stroke="currentColor"
      strokeWidth="0.5"
    />
    <circle cx="10" cy="10" r="2" fill="currentColor" />
    <circle cx="40" cy="10" r="1" fill="currentColor" />
    <circle cx="10" cy="40" r="1" fill="currentColor" />
    <path 
      d="M10 10C25 25 40 30 50 20" 
      stroke="currentColor" 
      strokeWidth="0.5" 
      fill="none" 
    />
  </svg>
);

export const FloralEngraving = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    opacity={0.06}
  >
    {/* Abstract vintage floral/botanical engraving impression */}
    <path d="M100 200C100 150 120 120 180 100C120 80 100 50 100 0C100 50 80 80 20 100C80 120 100 150 100 200Z" stroke="currentColor" strokeWidth="0.5" />
    <path d="M100 170C100 130 115 110 150 100C115 90 100 70 100 30C100 70 85 90 50 100C85 110 100 130 100 170Z" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="100" cy="100" r="15" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="100" cy="100" r="5" fill="currentColor" />
  </svg>
);
