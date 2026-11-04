import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Easing compartido: el mismo movimiento en CSS y en Motion. */
export const EASE_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];
