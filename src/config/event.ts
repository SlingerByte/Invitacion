/**
 * Todos los datos del evento viven aquí. La composición sólo lee lo que muestra;
 * los campos que no se usan se eliminan en cuanto dejan de tener consumidor.
 */

export interface EventConfig {
  meta: {
    /** Título para la pestaña y al compartir por WhatsApp. */
    title: string;
    description: string;
    /** Dominio definitivo, vacío por ahora. Se usa para la URL canónica. */
    siteUrl: string;
  };
  parents: {
    /** Dos nombres, se muestran unidos con «y». */
    names: [string, string];
  };
  celebration: {
    /** Texto ya formateado para mostrar. */
    dateLabel: string;
    /** ISO 8601 (hora de Colombia) para calcular y ordenar. */
    dateISO: string | null;
    timeLabel: string;
    /** Se muestra como «Código de vestimenta: …». Vacío = sin línea. */
    dressCode: string;
  };
  venue: {
    name: string;
    address: string;
    /** Enlace de Google Maps. Vacío = sin enlace, nunca uno inventado. */
    mapsUrl: string;
  };
  rsvp: {
    /** Sólo dígitos con código de país, ej. "573001234567". Vacío = sin enlace. */
    whatsappNumber: string;
    message: string;
  };
  copy: {
    invitation: {
      /** Líneas del texto de invitación, tal como se leen. */
      lines: string[];
      voteQuestion: string;
      nameLabel: string;
      namePlaceholder: string;
      nameHelp: string;
    };
  };
}

export const event: EventConfig = {
  meta: {
    title: 'Danna y Oscar · Revelación de género',
    description:
      'Acompáñanos a celebrar la revelación de género de nuestro bebé. Domingo 15 de noviembre de 2026, Finca mis sueños DJ.',
    siteUrl: '',
  },
  parents: {
    names: ['Danna', 'Oscar'],
  },
  celebration: {
    dateLabel: 'Domingo 15 de noviembre de 2026',
    dateISO: '2026-11-15T14:30:00-05:00',
    timeLabel: '2:30 p. m.',
    dressCode: 'blanco o beige',
  },
  venue: {
    name: 'Finca mis sueños DJ',
    address: 'Corregimiento Borrero Ayerbe / KM 30',
    mapsUrl: '',
  },
  rsvp: {
    whatsappNumber: '',
    message:
      '¡Hola! Recibí la invitación y quiero confirmar mi asistencia a la celebración. ¡Gracias!',
  },
  copy: {
    invitation: {
      lines: [
        '¡Te invitamos a compartir',
        'con nosotros!',
        'La revelación de género',
        'de nuestro bebé.',
      ],
      voteQuestion: 'Yo digo que será:',
      nameLabel: 'Tu nombre',
      namePlaceholder: 'Escribe tu nombre',
      nameHelp: 'Lo guardamos sólo para acompañar tu predicción.',
    },
  },
};
