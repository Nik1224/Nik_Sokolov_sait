/**
 * Страница проекта / кейса (ТЗ §5.5, §14.4).
 *
 * Порядок блоков: hero → задача → решение → результат → медиа → credits →
 * backstage ↔ проект → похожие работы. Один шаблон обслуживает BUSINESS Cases,
 * PRODUCTION Work и PRIVATE Portfolio.
 */

import Link from 'next/link';
import { PortableBody } from '@/components/content/PortableBody';
import { ProjectCard } from '@/components/content/cards';
import { RelatedArticleLinks } from '@/components/content/RelatedContent';
import { Section } from '@/components/content/Section';
import { Breadcrumbs, FallbackNotice, UnconfirmedTag } from '@/components/global/misc';
import { MediaGallery } from '@/components/media/MediaGallery';
import { Picture } from '@/components/media/Picture';
import type { Article, Category, Project, WorkFormat } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString, pageNeedsFallbackNotice, resolveLocalized } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';

type Props = {
  locale: Locale;
  direction: Direction;
  section: 'cases' | 'work' | 'portfolio';
  dict: Dictionary;
  project: Project;
  categories: Category[];
  formats: WorkFormat[];
  articles: Article[];
  related: Project[];
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-4">
      <dt className="label text-bone-faint">{label}</dt>
      <dd className="m-0 mt-2 text-bone">{children}</dd>
    </div>
  );
}

export function ProjectDetail({
  locale,
  direction,
  section,
  dict,
  project,
  categories,
  formats,
  articles,
  related,
}: Props) {
  const title = localizedString(project.title, locale);
  const cover = project.cover;
  const coverImage = cover.type === 'image' ? cover.image : cover.poster;
  /** Кадр выше, чем 3:4, полосой не показываем — от него осталась бы середина. */
  const coverIsTall = coverImage.height / (coverImage.width || 1) > 0.75;
  /** Больше четырёх цифр — это уже таблица, а её никто не читает. */
  const figures = (project.figures ?? []).slice(0, 4);




  const challenge = resolveLocalized(project.challenge, locale);
  const solution = resolveLocalized(project.solution, locale);
  const result = resolveLocalized(project.result, locale);
  const role = localizedString(project.role, locale);
  const lead = localizedString(project.lead, locale);

  /*
   * Задача → решение → результат. Пустые разделы отпадают: кейс без метрик
   * лучше показать без раздела «Результат», чем с пустым заголовком.
   */
  const story = (
    [
      [dict.common.challenge, challenge.value],
      [dict.common.solution, solution.value],
      [dict.common.result, result.value],
    ] as const
  ).filter(([, value]) => Boolean(value));
  const hasStory = story.length > 0;

  const showFallbackNotice = pageNeedsFallbackNotice(
    [project.title, project.lead, project.challenge, project.solution],
    locale,
  );

  // Роль ещё не подтверждена владельцем — помечаем, а не выдумываем (§15.1).
  const roleUnconfirmed = role.toUpperCase().includes('ПОДТВЕРЖДЕНИЮ') || role.toUpperCase().includes('CONFIRMED');

  return (
    <article>
      <div className="container-content pt-16 lg:pt-20">
        <Breadcrumbs
          dict={dict}
          items={[
            { label: dict.common.home, href: href({ locale, direction }) },
            { label: dict.nav[section], href: href({ locale, direction, section }) },
            { label: title },
          ]}
        />

        {showFallbackNotice ? (
          <div className="mb-8 max-w-2xl">
            <FallbackNotice dict={dict} />
          </div>
        ) : null}

        <h1 className="text-h1 m-0 max-w-4xl text-balance">{title}</h1>
        {lead ? <p className="mt-6 max-w-2xl text-lead text-bone-dim">{lead}</p> : null}

        <dl className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {project.client ? <Fact label={dict.common.client}>{project.client}</Fact> : null}
          {role ? (
            <Fact label={dict.common.role}>
              {roleUnconfirmed ? <UnconfirmedTag dict={dict} /> : role}
            </Fact>
          ) : null}
          {formats.length > 0 ? (
            <Fact label={dict.common.formats}>
              {formats.map((format) => localizedString(format.title, locale)).join(' · ')}
            </Fact>
          ) : null}
        </dl>
      </div>

      {/*
       * Обложка — полоса во всю ширину колонки, а не кадр по центру.
       *
       * Раньше она тянулась во всю ширину в своих пропорциях, и вертикальный
       * кадр занимал две с половиной высоты экрана. Ограничение по высоте это
       * чинило, но горизонтальный кадр повисал по центру с пустыми полями по
       * бокам — будто заглушка. Полоса фиксированных пропорций держит первый
       * экран и не спорит с текстом.
       *
       * Вертикальная обложка в полосу не режется: от неё осталась бы середина
       * без головы. Такая остаётся кадром по центру, ограниченным по высоте.
       */}
      <div className="container-content mt-12 lg:mt-16">
        {coverIsTall ? (
          <Picture
            image={coverImage}
            alt={localizedString(cover.alt, locale)}
            sizes="(min-width: 1024px) 40rem, 100vw"
            priority
            className="mx-auto h-auto max-h-[60svh] w-auto max-w-full"
          />
        ) : (
          <div className="relative overflow-hidden bg-ink-raised" style={{ aspectRatio: '16 / 9' }}>
            <Picture
              image={coverImage}
              alt={localizedString(cover.alt, locale)}
              sizes="(min-width: 1024px) 78rem, 100vw"
              priority
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      {/*
       * Задача, решение и результат идут друг за другом, а не тремя колонками.
       *
       * Колонки выглядели таблицей: три разной длины столбца с рваным низом,
       * строка в тридцать знаков и мелкий серый текст. Кейс читают как историю,
       * поэтому здесь один столбец нормальной длины, а метка стоит на полях
       * слева — так набирают развороты в журналах.
       */}
      {/*
       * Цифры кейса лентой, а не сеткой карточек.
       *
       * Крупное число с подписью под ним — ровно тот блок, который стоит на
       * каждом втором сайте. Здесь цифры набраны моноширинным в строку, через
       * точки: так выглядит счётчик на камере и строка тайм-кода в монтажной,
       * то есть язык самой работы. Заодно это одна строка вместо четырёх
       * колонок — страница короче на целый экран.
       */}
      {figures.length > 0 ? (
        <div className="container-content mt-12 lg:mt-16">
          <p className="m-0 flex flex-wrap items-baseline gap-x-4 gap-y-3 border-y border-line py-5 font-mono text-h3 uppercase tracking-[0.06em] text-bone lg:gap-x-7">
            {figures.map((figure, index) => (
              <span key={index} className="inline-flex items-baseline gap-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="mr-2 text-line-strong lg:mr-5">
                    ·
                  </span>
                ) : null}
                <span>{localizedString(figure.value, locale)}</span>
                <span className="text-bone-faint">{localizedString(figure.label, locale)}</span>
              </span>
            ))}
          </p>
        </div>
      ) : null}

      {/*
       * Разворот: слева рассказ, справа кадры.
       *
       * Раньше текст и галерея шли друг за другом, и страница вытягивалась на
       * три экрана подряд — сначала стена слов, потом стена картинок. Здесь
       * они идут параллельно и заканчиваются примерно вместе.
       *
       * Композиция взята у самой работы: в этих роликах слева слайд, справа
       * человек в кадре. Страница повторяет кадр, который на ней показан, —
       * поэтому деление именно вертикальное и именно в этих пропорциях.
       */}
      {hasStory || project.media.length > 0 ? (
        <Section>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            {hasStory ? (
              <div className="space-y-10 lg:space-y-14">
                {story.map(([label, value]) => (
                  <div key={label} className="border-t border-line pt-7">
                    <h2 className="label m-0 mb-5 text-accent">{label}</h2>
                    <PortableBody value={value!} locale={locale} dict={dict} className="case-body" />
                  </div>
                ))}
              </div>
            ) : null}

            {project.media.length > 0 ? (
              <MediaGallery items={project.media} locale={locale} dict={dict} layout="rail" />
            ) : null}
          </div>
        </Section>
      ) : null}

      {project.credits.length > 0 || articles.length > 0 ? (
        <Section>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-12">
              {project.credits.length > 0 ? (
                <div className="border-t border-line pt-6">
                  <p className="label mb-6 text-accent">{dict.common.credits}</p>
                  <ul className="m-0 list-none space-y-3 p-0">
                    {project.credits.map((entry) => (
                      <li key={entry.person._id} className="flex flex-wrap justify-between gap-4">
                        <span className="text-bone">{entry.person.displayName}</span>
                        <span className="label text-bone-faint">
                          {localizedString(entry.role ?? entry.person.role, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

            </div>

            {/* Обратная сторона связи project ↔ article (§5.7, §17). */}
            <RelatedArticleLinks
              articles={articles}
              locale={locale}
              direction={direction}
              title={dict.common.backstageNotes}
            />
          </div>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section title={dict.common.relatedProjects}>
          <ul className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item._id}>
                <ProjectCard
                  project={item}
                  locale={locale}
                  direction={direction}
                  dict={dict}
                  categories={categories}
                  section={section}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section>
        <Link
          href={href({ locale, direction, section: 'contact' })}
          className="label inline-block bg-bone px-7 py-4 text-ink transition-colors hover:bg-accent"
        >
          {dict.contact.heading}
        </Link>
      </Section>
    </article>
  );
}
