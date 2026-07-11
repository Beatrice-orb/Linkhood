import React from 'react';

export type IconProps = React.SVGProps<SVGSVGElement>;

export function DabashouMap({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  );
}

export function DabashouCircle({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="6" r="2" />
      <path d="M8 11a4 4 0 0 1 8 0" />
      <circle cx="6" cy="15" r="2" />
      <path d="M2 20a4 4 0 0 1 8 0" />
      <circle cx="18" cy="15" r="2" />
      <path d="M14 20a4 4 0 0 1 8 0" />
    </svg>
  );
}

export function DabashouMe({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="11" r="2.5" />
      <path d="M8 17.5a4 4 0 0 1 8 0" />
    </svg>
  );
}

export function DabashouPublish({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M2 13c3 0 6 2 8 6a6 6 0 0 0 10-2l2-3" />
      <line x1="12" y1="5" x2="12" y2="11" />
      <line x1="9" y1="8" x2="15" y2="8" />
    </svg>
  );
}

export function DabashouCredit({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 11 11 13 15 9" />
    </svg>
  );
}

export function DabashouPoints({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
      <polygon points="12 8 13.5 11 16.5 11 14 13 15 16 12 14.5 9 16 10 13 7.5 11 10.5 11" />
    </svg>
  );
}

export function DabashouBadge({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      <circle cx="12" cy="8" r="7" />
      <polygon points="12 5 13 7 15.5 7 13.5 8.5 14 11 12 9.5 10 11 10.5 8.5 8.5 7 11 7" />
    </svg>
  );
}
