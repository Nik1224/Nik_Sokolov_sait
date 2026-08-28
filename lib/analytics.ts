/**
 * События аналитики (ТЗ §12).
 *
 * Провайдер намеренно не подключён: система аналитики и порядок получения
 * согласия не подтверждены (§18). Точки вызова расставлены заранее, чтобы
 * подключение на этапе 5 не требовало правки компонентов.
 *
 * Персональные данные и содержимое форм сюда не попадают — только имя события
 * и безопасные признаки (§12, §17).
 */

export type AnalyticsEvent =
  | 'direction_select'
  | 'direction_switch'
  | 'locale_switch'
  | 'service_view'
  | 'project_view'
  | 'video_start'
  | 'video_complete'
  | 'contact_start'
  | 'outbound_contact';

/** Только безопасные значения: без имён, адресов и текста сообщений. */
export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, payload);
  }
  // Провайдер подключается здесь, после подтверждения системы и consent (§18).
}
