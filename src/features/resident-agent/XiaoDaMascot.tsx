export default function XiaoDaMascot({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 27C12 16.8 20.3 10 32 10s20 6.8 20 17v12c0 9.5-7.7 15-19.1 15h-6.4L18 60l1.7-9.5C14.8 47.6 12 43.5 12 38V27Z"
        fill="#2F6B5F"
      />
      <path
        d="M49.5 22.5c4.9-5 8.2-4.5 9.2-2.2.7 1.8-.5 3.2-2.4 3.5 2.2.4 3.1 1.8 2.4 3.5-1 2.3-4.2 2.6-9.2-.5"
        fill="#F06A4B"
      />
      <path d="M21 43.5c5.8 3.4 15.7 3.4 22 0" stroke="#E6C79C" strokeWidth="3" strokeLinecap="round" />
      <circle cx="39.5" cy="31" r="3" fill="#FFF8ED" />
      <circle cx="40.2" cy="31.5" r="1.25" fill="#17313B" />
      <path d="M21.5 31.5c2-2 4.4-2 6.5 0" stroke="#FFF8ED" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 38c2.6 2.2 5.5 2.2 8 0" stroke="#FFF8ED" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="19" cy="37" r="2" fill="#F28E78" opacity="0.75" />
      <path d="M27 10c1.5-4.6 5-6.4 9-5.2-1.2 4.4-4.3 6.2-9 5.2Z" fill="#E9A23B" />
      <path d="M30.5 9.2 32 13" stroke="#E9A23B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
