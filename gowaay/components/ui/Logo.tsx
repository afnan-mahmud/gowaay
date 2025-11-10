import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ className, size = 32, showText = true, textClassName }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("relative flex-shrink-0", className)} style={{ width: size, height: size }}>
        <Image
          src="/logo.svg"
          alt="GoWaay Logo"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn("font-bold text-gray-900", textClassName)}>
          GoWaay
        </span>
      )}
    </div>
  );
}

