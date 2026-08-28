'use client';

/**
 * Кнопка «Связаться» (ТЗ §5.8, §7).
 *
 * Формы заявок нет: она заставляла человека писать в пустоту и ждать ответа на
 * почту. Кнопка открывает выбор мессенджера и уводит сразу в переписку — с уже
 * составленным первым сообщением, если человек пришёл от калькулятора или от
 * пакета.
 *
 * Список каналов приходит из данных: новый мессенджер добавляется в CMS, а не
 * правкой этого файла.
 */

import { useEffect, useRef, useState } from 'react';
import type { ContactChannel } from '@/content/types';
import { track } from '@/lib/analytics';
import { buildMessengers, type MessengerKind } from '@/lib/contact/channels';
import { contactMessage, type MessageDraft } from '@/lib/contact/message';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type Props = {
  dict: Dictionary;
  contacts: ContactChannel[];
  /** Чем заполнить первое сообщение. Пусто — нейтральное «пишу с сайта». */
  draft?: MessageDraft;
  /** solid — главная кнопка блока, quiet — ссылка внутри карточки. */
  variant?: 'solid' | 'quiet';
  label?: string;
  className?: string;
};

const ICONS: Record<MessengerKind, string> = {
  telegram: 'M9.04 15.47 8.7 20.2c.48 0 .69-.2.94-.45l2.25-2.15 4.66 3.41c.86.48 1.47.23 1.7-.79l3.08-14.44c.27-1.27-.46-1.77-1.29-1.46L2.2 9.9c-1.24.48-1.22 1.17-.21 1.48l4.6 1.43 10.7-6.73c.5-.33.96-.15.58.18Z',
  max: 'M4 20V4h3.2l4.8 7.2L16.8 4H20v16h-3V9.3l-4.2 6.2h-1.6L7 9.3V20H4Z',
  whatsapp:
    'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.44 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.34-.5.04-.98.22-3.3-.69-2.78-1.1-4.55-3.94-4.69-4.12-.14-.18-1.12-1.49-1.12-2.85s.71-2.02.96-2.3c.25-.27.55-.34.73-.34l.52.01c.17 0 .4-.06.62.48.24.57.8 1.98.87 2.12.07.14.12.31.02.5-.1.18-.15.29-.29.45l-.44.5c-.14.14-.29.3-.12.58.17.28.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.14.46.12.63-.07.17-.2.72-.85.91-1.14.19-.29.39-.24.65-.14.26.09 1.67.79 1.96.93.29.14.48.21.55.33.07.11.07.66-.17 1.34Z',
  sms: 'M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
};

export function ContactButton({
  dict,
  contacts,
  draft,
  variant = 'solid',
  label,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  /**
   * Определяется только после монтирования: на сервере системы клиента не
   * видно, а расхождение разметки ломало бы гидратацию.
   */
  const [isIos, setIsIos] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const message = contactMessage(draft ?? {}, dict);
  const messengers = buildMessengers(contacts, message, isIos);
  const phone = contacts.find((item) => item.kind === 'phone');

  useEffect(() => {
    const ua = navigator.userAgent;
    // iPadOS 13+ отдаёт десктопный UA, поэтому отдельно смотрим на тач.
    setIsIos(/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1));
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function show() {
    setCopied(false);
    setOpen(true);
    track('contact_start', { withQuote: Boolean(draft?.estimate) });
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      // Буфер может быть закрыт настройками браузера. Текст виден на экране —
      // человек скопирует его вручную, поэтому ошибку не показываем.
    }
  }

  const buttonClass =
    variant === 'solid'
      ? 'label inline-block bg-bone px-7 py-4 text-ink transition-colors hover:bg-accent hover:text-ink'
      : 'label inline-block text-bone transition-colors hover:text-accent';

  return (
    <>
      <button type="button" onClick={show} className={`${buttonClass} ${className}`.trim()}>
        {label ?? dict.contact.button}
        {variant === 'quiet' ? ' →' : null}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        /* Клик мимо карточки закрывает окно: у <dialog> сама подложка и есть элемент. */
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
        aria-label={dict.contact.pickChannel}
        className="contact-dialog w-[min(30rem,calc(100vw-2rem))] border border-line bg-ink-raised p-0 text-bone"
      >
        {open ? (
          <div className="p-7 sm:p-9">
            <div className="flex items-start justify-between gap-6">
              <h2 className="text-h3 m-0">{dict.contact.pickChannel}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="label -mr-2 -mt-1 shrink-0 p-2 text-bone-faint transition-colors hover:text-bone"
              >
                {dict.contact.close}
              </button>
            </div>

            <p className="mt-2 text-sm text-bone-faint">{dict.contact.pickChannelLead}</p>

            <div className="mt-6 border border-line bg-ink p-4">
              <p className="label m-0 text-bone-faint">{dict.contact.messageLabel}</p>
              <p className="m-0 mt-2 whitespace-pre-line text-sm text-bone-dim">{message}</p>
              <button
                type="button"
                onClick={copyMessage}
                className="label mt-4 text-accent transition-opacity hover:opacity-70"
              >
                {copied ? dict.contact.copied : dict.contact.copy}
              </button>
            </div>

            <ul className="m-0 mt-6 list-none space-y-2 p-0">
              {messengers.map((messenger) => (
                <li key={messenger.kind} className="m-0">
                  <a
                    href={messenger.href}
                    target={messenger.kind === 'sms' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Каналу без подстановки текст кладём в буфер: иначе
                      // человек откроет пустой чат и начнёт объяснять заново.
                      if (!messenger.prefills && message) void copyMessage();
                      track('outbound_contact', { channel: messenger.kind });
                    }}
                    className="flex items-center gap-4 border border-line px-4 py-3.5 transition-colors hover:border-line-strong hover:bg-ink-sunken"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0 fill-accent"
                      focusable="false"
                    >
                      <path d={ICONS[messenger.kind]} />
                    </svg>
                    <span className="label text-bone">{messenger.label}</span>
                    <span className="ml-auto truncate text-right text-sm text-bone-faint">
                      {messenger.value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {messengers.some((item) => !item.prefills) ? (
              <p className="mt-4 text-sm text-bone-faint">{dict.contact.pasteHint}</p>
            ) : null}

            {phone ? (
              <p className="mt-6 border-t border-line pt-5 text-sm text-bone-faint">
                {dict.contact.call}:{' '}
                <a
                  href={phone.href}
                  onClick={() => track('outbound_contact', { channel: 'phone' })}
                  className="text-bone underline underline-offset-4 transition-colors hover:text-accent"
                >
                  {phone.value}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
