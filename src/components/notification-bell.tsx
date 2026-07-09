import Link from "next/link";

export function NotificationBell({
  href,
  label,
  unread,
}: {
  href: string;
  label: string;
  unread: number;
}) {
  return (
    <Link
      href={href}
      aria-label={
        unread > 0 ? `${label} · ${unread} unread` : label
      }
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 font-mono text-[9px] font-semibold text-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}