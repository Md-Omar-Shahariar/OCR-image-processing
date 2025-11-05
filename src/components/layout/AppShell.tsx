import { ReactNode } from "react";

interface BackgroundBlob {
  className: string;
}

interface AppShellProps {
  children: ReactNode;
  gradient?: string;
  blobs?: BackgroundBlob[];
  overlay?: ReactNode;
}

const defaultBlobs: BackgroundBlob[] = [
  { className: "top-0 left-0 w-72 h-72 bg-blue-200" },
  { className: "top-0 right-0 w-72 h-72 bg-purple-200 animation-delay-2000" },
  { className: "bottom-0 left-1/2 w-72 h-72 bg-pink-200 animation-delay-4000" },
];

export function AppShell({
  children,
  gradient = "bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50",
  blobs = defaultBlobs,
  overlay,
}: AppShellProps) {
  return (
    <main className={`min-h-screen ${gradient} relative overflow-hidden`}>
      {blobs.map((blob, index) => (
        <div
          key={`blob-${index}`}
          className={`absolute rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${blob.className}`}
        ></div>
      ))}
      {overlay && <div className="absolute inset-0">{overlay}</div>}
      <div className="relative z-10">{children}</div>
    </main>
  );
}

export default AppShell;
