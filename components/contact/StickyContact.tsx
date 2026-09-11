'use client';

/**
 * Липкая полоса связи на телефоне (ветка BUSINESS).
 *
 * Главная ветки — пять с половиной тысяч пикселей прокрутки, и до недавнего
 * времени на всём этом пути не было ни одной кнопки связи: она стояла в первом
 * экране и в самом низу. Человек, которого убедил третий кейс, должен был
 * листать в конец или искать меню.
 *
 * Только телефон. На десктопе шапка с пунктом «Контакты» видна всегда, и
 * вторая кнопка поверх страницы там ничего не добавляет, зато отъедает
 * нижнюю часть экрана.
 */

import { useEffect, useState } from 'react';
import type { ContactChannel } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { ContactButton } from './ContactButton';

type Props = {
  dict: Dictionary;
  contacts: ContactChannel[];
  /** Тема первого сообщения: с какой ветки человек пишет. */
  subject?: string;
};

export function StickyContact({ dict, contacts, subject }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY;
      /*
       * Полоса не показывается в двух местах, и оба — не «примерно», а по
       * делу. В первом экране кнопка уже есть, и дублировать её поверх самой
       * себя незачем. У конца страницы стоит блок «Связаться» — накрывать его
       * плавающей кнопкой значит прятать то, к чему человек и шёл.
       */
      const nearBottom =
        scrolled + window.innerHeight > document.documentElement.scrollHeight - 520;
      setVisible(scrolled > window.innerHeight * 0.7 && !nearBottom);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      /*
       * Элемент стоит в разметке всегда и прячется прозрачностью: появление
       * из ничего при каждом пересечении порога дёргало бы страницу. Пока
       * полоса скрыта, она не ловит нажатия — иначе перекрывала бы нижнюю
       * часть экрана невидимой преградой.
       */
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-sunken/95 px-[var(--spacing-gutter)] py-4 backdrop-blur transition-opacity duration-[var(--duration-base)] lg:hidden ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      /*
       * `inert`, а не `aria-hidden`. Скрытая полоса остаётся в разметке, и
       * `aria-hidden` над живой кнопкой — прямое нарушение: кнопка пропадает
       * для скринридера, но остаётся в порядке табуляции, и фокус уезжает в
       * элемент, о котором ничего не сообщается. `inert` убирает и то, и
       * другое, не трогая прозрачность, — переход остаётся плавным.
       */
      inert={!visible}
    >
      <ContactButton
        dict={dict}
        contacts={contacts}
        className="w-full text-center"
        draft={subject ? { subject } : undefined}
      />
    </div>
  );
}
