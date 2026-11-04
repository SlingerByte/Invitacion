import { event } from '@/config/event';

const PLACEHOLDER = /^\[.*\]$/;

/**
 * Un valor está "definido" cuando no está vacío ni es un marcador [ASÍ].
 * Sirve para que la interfaz degrade la acción en lugar de inventar datos.
 */
export function isDefined(value: string | null | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !PLACEHOLDER.test(trimmed);
}

export function mapsUrl(): string | null {
  const raw = event.venue.mapsUrl.trim();
  if (!isDefined(raw)) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function whatsappUrl(): string | null {
  const digits = event.rsvp.whatsappNumber.replace(/\D/g, '');
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(event.rsvp.message)}`;
}

/**
 * Con un enlace verificado se abre tal cual; sin él se busca el nombre y la
 * dirección reales en Google Maps. Nunca se inventan coordenadas: el invitado
 * confirma el resultado en su propia app.
 */
export function mapHref(): string | null {
  const verified = mapsUrl();
  if (verified) return verified;

  const query = [event.venue.name, event.venue.address]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
  if (!query) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
