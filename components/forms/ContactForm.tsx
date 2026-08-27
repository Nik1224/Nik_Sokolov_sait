'use client';

/**
 * Форма заявки (ТЗ §5.8, §7, §13).
 *
 * Отдельная форма для каждой ветки: набор полей и тип задачи подставляются из
 * контекста направления. Поле услуги предзаполняется, когда пользователь
 * пришёл со страницы услуги (§5.4).
 */

import { useActionState, useEffect, useId, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { ContactChannel, WorkFormat } from '@/content/types';
import { track } from '@/lib/analytics';
import { submitContact } from '@/lib/forms/actions';
import type { SubmitState } from '@/lib/forms/contact';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import type { Direction, Locale } from '@/lib/site';

type Option = { value: string; label: string };

type Props = {
  locale: Locale;
  direction: Direction;
  dict: Dictionary;
  taskTypes: Option[];
  formats: WorkFormat[];
  contacts: ContactChannel[];
  /** Предзаполненный тип задачи — например, услуга, с которой пришёл пользователь. */
  defaultTaskType?: string;
  /** PRIVATE спрашивает дату и город, BUSINESS и PRODUCTION — нет. */
  showDateAndCity?: boolean;
};

const initialState: SubmitState = { status: 'idle' };

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <p className="m-0 flex flex-col gap-2">
      <label htmlFor={id} className="label text-bone-dim">
        {label}
        {hint ? <span className="ml-2 normal-case tracking-normal text-bone-faint">({hint})</span> : null}
      </label>
      {children}
      {error ? (
        <span id={`${id}-error`} className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </p>
  );
}

const inputClass =
  'w-full border border-line bg-ink-raised px-4 py-3 text-bone placeholder:text-bone-faint focus:border-line-strong';

export function ContactForm({
  locale,
  direction,
  dict,
  taskTypes,
  formats,
  contacts,
  defaultTaskType,
  showDateAndCity = false,
}: Props) {
  const [state, action, pending] = useActionState(submitContact, initialState);
  const pathname = usePathname();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status !== 'success') return;
    formRef.current?.reset();
    track('contact_success', { direction });
  }, [state.status, direction]);

  useEffect(() => {
    if (state.status === 'error') track('contact_error', { direction });
  }, [state.status, direction]);

  const errors = state.status === 'invalid' ? state.errors : {};
  const field = (name: string) => `${uid}-${name}`;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <form
        ref={formRef}
        action={action}
        onFocus={() => track('contact_start', { direction })}
        onSubmit={() => track('contact_submit', { direction })}
        noValidate
        className="flex flex-col gap-6"
      >
        <input type="hidden" name="direction" value={direction} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="sourceUrl" value={pathname} />

        {/* Honeypot: скрыт от людей, доступен ботам. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-px w-px opacity-0"
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={field('name')} label={dict.form.name} error={errors.name}>
            <input
              id={field('name')}
              name="name"
              autoComplete="name"
              required
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? `${field('name')}-error` : undefined}
              className={inputClass}
            />
          </Field>

          <Field id={field('email')} label={dict.form.email} error={errors.email}>
            <input
              id={field('email')}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${field('email')}-error` : undefined}
              className={inputClass}
            />
          </Field>

          <Field id={field('phone')} label={dict.form.phone}>
            <input id={field('phone')} name="phone" autoComplete="tel" className={inputClass} />
          </Field>

          <Field id={field('taskType')} label={dict.form.taskType}>
            <select
              id={field('taskType')}
              name="taskType"
              defaultValue={defaultTaskType ?? ''}
              className={inputClass}
            >
              <option value="">—</option>
              {taskTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          {showDateAndCity ? (
            <>
              <Field id={field('date')} label={dict.form.date}>
                <input id={field('date')} name="date" type="date" className={inputClass} />
              </Field>
              <Field id={field('city')} label={dict.form.city}>
                <input id={field('city')} name="city" autoComplete="address-level2" className={inputClass} />
              </Field>
            </>
          ) : null}

          <Field id={field('budget')} label={dict.form.budget} hint={dict.form.budgetOptional}>
            <input id={field('budget')} name="budget" className={inputClass} />
          </Field>
        </div>

        {formats.length > 0 ? (
          <fieldset className="m-0 border-0 p-0">
            <legend className="label mb-3 p-0 text-bone-dim">{dict.form.formatsField}</legend>
            <span className="flex flex-wrap gap-x-6 gap-y-3">
              {formats.map((format) => (
                <label key={format._id} className="flex items-center gap-2 text-sm text-bone-dim">
                  <input type="checkbox" name="formats" value={format.slug} className="h-4 w-4 accent-[var(--color-accent)]" />
                  {localizedString(format.title, locale)}
                </label>
              ))}
            </span>
          </fieldset>
        ) : null}

        <Field id={field('message')} label={dict.form.message} error={errors.message}>
          <textarea
            id={field('message')}
            name="message"
            rows={5}
            required
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? `${field('message')}-error` : undefined}
            className={inputClass}
          />
        </Field>

        <p className="m-0">
          <label className="flex items-start gap-3 text-sm text-bone-dim">
            <input
              type="checkbox"
              name="consent"
              required
              aria-invalid={errors.consent ? true : undefined}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
            />
            {dict.form.consent}
          </label>
          {errors.consent ? <span className="mt-2 block text-sm text-danger">{errors.consent}</span> : null}
        </p>

        <div>
          <button
            type="submit"
            disabled={pending}
            className="label bg-bone px-7 py-4 text-ink transition-colors hover:bg-accent disabled:opacity-60"
          >
            {dict.form.submit}
          </button>
        </div>

        {/* Статус отправки объявляется ассистивным технологиям (§5.8). */}
        <div role="status" aria-live="polite" className="text-sm">
          {state.status === 'disabled' ? (
            <p className="m-0 border-l-2 border-accent bg-ink-raised px-4 py-3 text-bone-dim">
              {dict.form.channelPending}
            </p>
          ) : null}
          {state.status === 'error' ? (
            <p className="m-0 border-l-2 border-danger bg-ink-raised px-4 py-3 text-bone-dim">
              {state.message}
            </p>
          ) : null}
          {state.status === 'success' ? (
            <div className="border-l-2 border-accent bg-ink-raised px-4 py-3">
              <p className="label m-0 text-accent">{dict.form.successTitle}</p>
              <p className="m-0 mt-2 text-bone-dim">{dict.form.successBody}</p>
            </div>
          ) : null}
        </div>
      </form>

      <aside className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <p className="label text-accent">{dict.form.directContacts}</p>
        {contacts.length > 0 ? (
          <ul className="m-0 mt-4 list-none space-y-3 p-0">
            {contacts.map((contact) => (
              <li key={contact.href}>
                <a
                  href={contact.href}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  onClick={() => track('outbound_contact', { kind: contact.kind, direction })}
                  className="text-bone underline decoration-accent underline-offset-4"
                >
                  <span className="label mr-2 text-bone-faint">{contact.label}</span>
                  {contact.value}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-bone-faint">[{dict.content.unconfirmed}]</p>
        )}
      </aside>
    </div>
  );
}
