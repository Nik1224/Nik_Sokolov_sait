/**
 * Главная ветки BUSINESS: журнальная полоса.
 *
 * Отдельный шаблон, а не варианты общего. Состав и порядок разделов те же, что
 * у остальных веток, — меняется только то, как они свёрстаны: тональная
 * лестница вместо одной подложки, двенадцать колонок с асимметрией вместо
 * одинаковых сеток, кадры разных пропорций вместо равных превью и очень
 * крупный капс против мелкой технической подписи.
 *
 * Выражать это флагами в общих шаблонах значило бы протащить арт-дирекцию
 * одной ветки через весь сайт: каждая карточка и каждая секция получили бы по
 * ветвлению, а PRIVATE и PRODUCTION — риск сломаться от правки, которая их не
 * касается. Здесь же общего кода нет вовсе, и они физически вне досягаемости.
 */

import Link from 'next/link';
import type {
  Article,
  ArticleType,
  Category,
  DirectionDoc,
  GlobalSettings,
  ImageRef,
  MediaAsset,
  PricingEntry,
  Project,
  Testimonial,
} from '@/content/types';
import { ContactButton } from '@/components/contact/ContactButton';
import { ShowreelDialog } from '@/components/content/ShowreelDialog';
import { Picture } from '@/components/media/Picture';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatDate, hasTranslation, localizedString } from '@/lib/i18n/localize';
import { moneyFormat } from '@/lib/pricing/money';
import { href } from '@/lib/routing';
import type { Locale } from '@/lib/site';
import { HeroReel } from './HeroReel';
import { Rail } from './Rail';
import { Band, BandHead, Cta, FineRow, Rise, bandField } from './parts';
import { ClientMarquee } from './ClientMarquee';
import { HeaderState } from './HeaderState';

type Props = {
  locale: Locale;
  dict: Dictionary;
  doc: DirectionDoc;
  categories: Category[];
  covers: Record<string, ImageRef | undefined>;
  projects: Project[];
  pricing: PricingEntry[];
  testimonials: Testimonial[];
  articles: Article[];
  articleTypes: ArticleType[];
  settings: GlobalSettings;
};

/** Кадр из медиа: у видео берётся постер, у изображения оно само. */
function frameOf(media: MediaAsset | undefined): ImageRef | undefined {
  if (!media) return undefined;
  return media.type === 'image' ? media.image : media.poster;
}

/**
 * Кадр в рамке заданной пропорции.
 *
 * Рамка держит `overflow`, поэтому изображение может выходить за неё при
 * появлении и наезжать под курсором, не сдвигая соседей. Скругления нет
 * намеренно: любой радиус здесь превращает разворот в интерфейс.
 */
function Shot({
  image,
  ratio,
  ratioClass,
  sizes,
  priority = false,
  className = '',
}: {
  image: ImageRef;
  /** Пропорция одним числом. Не задаётся, если её меняет `ratioClass`. */
  ratio?: number;
  /**
   * Пропорция классом — там, где она разная на разных ширинах. Задавать её
   * `min-height` поверх `aspect-ratio` нельзя: браузер добирает до пропорции
   * ширину, и блок вылезает за экран.
   */
  ratioClass?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      data-reveal
      className={`relative overflow-hidden bg-ink-sunken ${ratioClass ?? ''} ${className}`}
      style={ratioClass ? undefined : { aspectRatio: String(ratio) }}
    >
      <Picture
        image={image}
        alt=""
        sizes={sizes}
        priority={priority}
        className="frame-in absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

/* --- 01. Первый экран ------------------------------------------------------ */

/**
 * Кадр во весь экран, набор поверх него.
 *
 * Кадр лежит `inset-0` и занимает первый экран целиком — это поверхность, а не
 * иллюстрация в колонке. Заголовок стоит на ней слева, в семи колонках из
 * двенадцати, и читается благодаря вуали (`.hero-scrim`): она гасит кадр в
 * бумагу под текстом и отпускает его к правому краю, где текста нет.
 *
 * Раскладка одна на все ширины — на телефоне меняется только вуаль, которая
 * забирает больше высоты: колонка там во всю ширину, и кадру под ней нужно
 * уйти тише.
 *
 * Прежняя редакция этого блока делила экран пополам — слева типографика,
 * справа кадр. От неё осталось описание, но не вёрстка.
 */
function Opening({
  locale,
  dict,
  doc,
  categories,
  settings,
}: {
  locale: Locale;
  dict: Dictionary;
  doc: DirectionDoc;
  categories: Category[];
  settings: GlobalSettings;
}) {
  const year = new Date().getFullYear();

  /*
   * Первый экран показывает шоурил, а не заставку. Он один на весь сайт и
   * живёт в настройках, поэтому берётся оттуда, а не заводится второй раз у
   * направления. Нет шоурила — на его месте hero-кадр ветки, и разворот
   * работает ровно так же.
   */
  const reel = settings.showreel?.type === 'video' ? settings.showreel : undefined;
  const image = reel?.poster ?? frameOf(doc.hero);
  const alt = localizedString(reel?.alt ?? doc.hero?.alt, locale);

  /*
   * Нижняя строка первого экрана — переходы в те же категории портфолио, что
   * лежат разделом ниже. Новых смыслов здесь нет: это существующие ссылки,
   * поднятые в разворот, чтобы человек с первого экрана видел не только чем
   * тут занимаются, но и что именно снимают.
   */
  const quickLinks = categories.slice(0, 4);

  return (
    <section
      /*
       * Первый экран — начало поля: молочный сверху, бумага снизу, и ровно
       * бумагой его принимает полоса клиентов. Вуаль поверх кадра красится тем
       * же тоном, поэтому спокойная часть разворота и есть поле, а не плашка,
       * положенная на него.
       */
      style={bandField('ivory', 'ivory', 'paper')}
      className="band band-light relative -mt-16 flex min-h-[92svh] flex-col justify-end overflow-hidden lg:-mt-20"
    >
      {/* Кадр во всю ширину и высоту первого экрана. Не иллюстрация в колонке,
          а поверхность, на которой всё остальное лежит. */}
      <div className="absolute inset-0">
        {image && reel?.loopSrc ? (
          <HeroReel poster={image} loopSrc={reel.loopSrc} alt={alt} />
        ) : image ? (
          <Picture
            image={image}
            alt={alt}
            sizes="100vw"
            priority
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
      </div>
      <span aria-hidden="true" className="hero-scrim absolute inset-0" />

      <div className="container-wide relative pt-28 pb-10 lg:pb-12 lg:pt-32">
        <div className="editorial-grid">
          {/*
           * Раскрытие полосы: надзаголовок, заголовок и лид выходят из-под
           * обреза друг за другом. Одно движение на всю страницу — дальше
           * блоки только выезжают при прокрутке, и второго такого выхода
           * нигде нет: он тем и работает, что случается один раз.
           */}
          <div className="col-span-12 lg:col-span-7">
            <Rise>
              <p className="label-fine m-0 text-bone-faint">{dict.directions.business}</p>
            </Rise>
            <Rise delay={90} className="mt-6">
              <h1 className="text-display m-0 uppercase text-balance">
                {localizedString(doc.title, locale)}
              </h1>
            </Rise>
            <Rise delay={200} className="mt-7">
              <p className="max-w-[40ch] text-lead text-bone-dim">
                {localizedString(doc.lead, locale)}
              </p>
            </Rise>

            <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-4">
              <Cta href={href({ locale, direction: 'business', section: 'contact' })}>
                {dict.contact.heading}
              </Cta>
              <Cta
                href={href({ locale, direction: 'business', section: 'cases' })}
                variant="outline"
              >
                {dict.nav.cases}
              </Cta>
            </div>

            {/*
             * Шоурил — третье действие в том же гнезде, что и две кнопки, но
             * набранное тише: строка со знаком вместо плашки.
             *
             * Раньше он стоял в подвале разворота справа, на плотной тёмной
             * плашке. Плашка была нужна не сама по себе: справа внизу вуаль уже
             * сошла на нет, и под строкой — голый кадр, который по ходу петли то
             * светлеет, то темнеет. Но она же была третьей тёмной фигурой на
             * экране и самой тяжёлой из трёх — при том что обещает меньше всех.
             *
             * Здесь плашка не нужна вовсе: левая колонка лежит на сплошной
             * бумаге по всей высоте, и строка читается тоном полосы. Заодно
             * шоурил встаёт туда, где принимают решение, — рядом со «Связаться»,
             * а не в выходных данных. Компании, выбирающей подрядчика по видео,
             * он нужнее всего остального на этом экране.
             */}
            {reel?.videoId ? (
              <div className="reel-cta mt-8">
                <ShowreelDialog
                  provider={reel.provider}
                  videoId={reel.videoId}
                  label={dict.media.watchShowreel}
                  dict={dict}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/*
         * Подвал разворота: переходы в категории и выходные данные. Тонкая
         * линия над ними — та же, что разделяет полосы ниже, поэтому первый
         * экран заканчивается не обрывом, а строкой.
         */}
        <div className="mt-14 border-t border-line pt-6 lg:mt-20">
          {quickLinks.length > 0 ? (
            <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-3 p-0">
              {quickLinks.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`${href({ locale, direction: 'business', section: 'portfolio' })}?category=${category.slug}`}
                    className="label-fine text-bone-dim transition-colors hover:text-bone"
                  >
                    {localizedString(category.title, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <FineRow
            className="mt-8 text-bone-faint"
            items={[
              dict.brand.descriptor,
              localizedString(settings.location, locale),
              String(year),
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* --- 02. С кем работали ---------------------------------------------------- */

function Clients({
  locale,
  dict,
  clients,
}: {
  locale: Locale;
  dict: Dictionary;
  clients: NonNullable<DirectionDoc['clients']>;
}) {
  return (
    /*
     * Полоса, а не сетка. Десять названий сеткой занимали три ряда и треть
     * экрана — непропорционально тому, что они сообщают. Бегущая строка говорит
     * то же самое одной строкой и при этом заметнее неподвижного списка.
     *
     * Секция своя, а не `Band`: строка идёт от края до края экрана, а подпись и
     * кнопка остаются в контейнере — контейнер вокруг движения сделал бы из
     * полосы виджет.
     */
    <section
      /*
       * Тёмная ступень — `warm-graphite`: единственная, которая ещё не занята.
       * `ink` держит главу «Стоимость», `graphite` — подвал, и повторять их
       * здесь значило бы получить три одинаковых пятна вместо трёх разных по
       * весу. Светлее обоих — и полоса читается акцентом, а не второй главой.
       *
       * Границы резаные (`band-cut`): сойтись мягко из бумаги в тёмное
       * невозможно — переход прошёл бы через мёртвую середину шкалы и стал бы
       * размывом. Поверхность держат свет и зерно, а не растушёвка края.
       */
      className="band band-cut band-dark py-[clamp(2.5rem,4vw,4rem)]"
      style={bandField('paper', 'warm-graphite', 'warm-grey')}
    >
      <ClientMarquee clients={clients} locale={locale} dict={dict} />
    </section>
  );
}

/* --- 03. Портфолио --------------------------------------------------------- */

/**
 * Ритм обложек: спан в сетке и пропорция кадра на каждую позицию.
 *
 * Ряды складываются в двенадцать колонок — 7+5, 5+7, 4+4+4, — а пропорции
 * нарочно разные: одинаковые превью подряд превращают полосу в каталог. При
 * другом числе категорий рисунок продолжится циклом, и ряд может выйти
 * неполным — для журнальной полосы это нормально, для таблицы было бы браком.
 */
function Portfolio({
  locale,
  dict,
  categories,
  covers,
}: {
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
  covers: Record<string, ImageRef | undefined>;
}) {
  return (
    <section
      className="band band-light py-[clamp(5rem,9vw,10rem)]"
      style={bandField('warm-grey', 'stone', 'warm-grey')}
    >
      <div className="container-wide">
        <BandHead title={dict.nav.portfolio} />
      </div>

      {/*
       * Лента, а не сетка.
       *
       * Сетка требует, чтобы у каждой категории был кадр равного достоинства:
       * недобранная ячейка в ней читается как дыра, а кадры разной высоты — как
       * сбой вёрстки. Лента этого не требует. Она идёт от левого поля и уходит
       * за правый край экрана — обрез говорит «дальше есть ещё» лучше любой
       * стрелки, и это ровно тот приём, которым верстают полосу «избранное» в
       * журнале.
       *
       * Прокрутка здесь своя и только по горизонтали: страница целиком по
       * горизонтали не едет.
       */}
      <div className="mt-14 lg:mt-20">
        <Rail dict={dict} label={dict.media.rail}>
        <ul
          className="m-0 flex list-none snap-x snap-mandatory gap-4 p-0 lg:gap-5"
          style={{
            paddingInline: 'clamp(1.25rem, 4.5vw, 4.5rem)',
          }}
        >
          {categories.map((category, position) => {
            const cover = covers[category.slug];
            const description = localizedString(category.description, locale);

            return (
              <li
                key={category._id}
                className="w-[76vw] shrink-0 snap-start sm:w-[46vw] lg:w-[26vw] xl:w-[23vw]"
              >
                <Link
                  href={`${href({ locale, direction: 'business', section: 'portfolio' })}?category=${category.slug}`}
                  className="group relative block overflow-hidden"
                >
                  {cover ? (
                    /*
                     * Вертикальная обложка: кадр в ленте должен стоять, а не
                     * лежать — тогда ряд читается как ряд, а не как череда
                     * экранов. Пропорцию держит рамка, кадр её заполняет.
                     */
                    <div
                      data-reveal
                      className="relative overflow-hidden bg-ink-sunken"
                      style={{ aspectRatio: '3 / 4' }}
                    >
                      {/*
                       * Без `priority`. Лента лежит примерно в полутора экранах
                       * ниже обреза, и поднятые в высокий приоритет обложки
                       * соревновались за канал с постером первого экрана — тем
                       * самым кадром, по которому и меряется LCP. Три высоких
                       * приоритета сразу означают, что высокого нет ни у кого.
                       */}
                      <Picture
                        image={cover}
                        alt=""
                        sizes="(min-width: 1024px) 26vw, (min-width: 640px) 46vw, 76vw"
                        className="frame-in absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="bg-ink-sunken"
                      style={{ aspectRatio: '3 / 4' }}
                    />
                  )}

                  <span
                    aria-hidden="true"
                    className="cover-scrim pointer-events-none absolute inset-0"
                  />

                  <span className="on-image label-fine absolute left-5 top-5 text-bone">
                    {String(position + 1).padStart(2, '0')}
                  </span>

                  <div className="on-image absolute inset-x-0 bottom-0 p-5 lg:p-6">
                    <h3 className="text-h3 m-0 uppercase text-balance text-bone">
                      {localizedString(category.title, locale)}
                    </h3>
                    {description ? (
                      <p className="mt-3 text-sm leading-snug text-bone-dim">{description}</p>
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="label mt-5 block text-bone transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        </Rail>
      </div>
    </section>
  );
}

/* --- 04. Как устроена работа ----------------------------------------------- */

/**
 * Не карточки, а полосы с волосяной линией.
 *
 * Порядок работы — это последовательность, и сетка карточек её ломает: четыре
 * равных прямоугольника читаются как четыре независимых свойства. Строки,
 * идущие сверху вниз с номерами, читаются как шаги.
 */
function Process({
  locale,
  dict,
  doc,
}: {
  locale: Locale;
  dict: Dictionary;
  doc: DirectionDoc;
}) {
  return (
    <Band from="warm-grey" core="ivory" to="ivory">
      <BandHead title={dict.common.process} lead={dict.common.processLead} />

      <ol className="m-0 mt-14 list-none p-0 lg:mt-20">
        {doc.highlights.map((item, position) => (
          <li key={position} data-reveal className="border-t border-line">
            <div className="editorial-grid items-baseline gap-y-4 py-9 lg:py-12">
              <p className="label-fine col-span-2 m-0 text-bone-faint lg:col-span-1">
                {String(position + 1).padStart(2, '0')}
              </p>
              <h3 className="text-h3 col-span-10 m-0 uppercase text-balance text-bone lg:col-span-3">
                {localizedString(item.title, locale)}
              </h3>
              {item.body ? (
                <p className="col-span-12 m-0 max-w-[62ch] text-bone-dim lg:col-span-8">
                  {localizedString(item.body, locale)}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </Band>
  );
}

/* --- 05. Кейсы -------------------------------------------------------------- */

function Cases({
  locale,
  dict,
  projects,
  categories,
}: {
  locale: Locale;
  dict: Dictionary;
  projects: Project[];
  categories: Category[];
}) {
  const [lead, ...rest] = projects;
  const leadImage = frameOf(lead.cover);
  const leadFigures = (lead.figures ?? []).slice(0, 4);
  const titlesOf = (project: Project) =>
    categories
      .filter((category) => project.categorySlugs.includes(category.slug))
      .map((category) => localizedString(category.title, locale));

  return (
    <>
      <Band from="ivory" core="paper" to="paper" space="normal">
        <BandHead
          title={dict.nav.cases}
          action={{
            label: dict.common.viewAll,
            href: href({ locale, direction: 'business', section: 'cases' }),
          }}
        />
      </Band>

      {/*
       * Первая работа идёт кадром во всю ширину экрана, без контейнера. Это
       * самое сильное, что есть на странице, и колонка ему мала: разворот
       * должен упираться в края.
       */}
      <Link
        href={href({ locale, direction: 'business', section: 'cases', slug: lead.slug })}
        className="group block"
      >
        {leadImage ? (
          <Shot image={leadImage} ratioClass="ratio-case-lead" sizes="100vw" />
        ) : null}

        <div className="container-wide">
          <div data-reveal className="editorial-grid items-end gap-y-6 pt-8 lg:pt-10">
            <div className="col-span-12 lg:col-span-6">
              <FineRow items={titlesOf(lead)} className="text-bone-faint" />
              <h3 className="text-h2 m-0 mt-4 uppercase text-balance text-bone transition-colors group-hover:text-accent">
                {localizedString(lead.title, locale)}
              </h3>
            </div>

            {leadFigures.length > 0 ? (
              <dl className="col-span-12 m-0 flex flex-wrap gap-x-12 gap-y-5 lg:col-span-6 lg:justify-end">
                {leadFigures.map((figure, position) => (
                  <div key={position}>
                    <dt className="text-h3 m-0 whitespace-nowrap text-bone">
                      {localizedString(figure.value, locale)}
                    </dt>
                    <dd className="label-fine m-0 mt-2 text-bone-faint">
                      {localizedString(figure.label, locale)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="col-span-12 m-0 max-w-[46ch] text-bone-dim lg:col-span-5 lg:col-start-8">
                {localizedString(lead.lead, locale)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {rest.length > 0 ? (
        <Band from="paper" core="paper" to="paper" space="tight">
          <ul className="editorial-grid m-0 list-none gap-y-14 p-0 lg:gap-y-20">
            {rest.map((project, position) => {
              const image = frameOf(project.cover);
              /*
               * Асимметрия смещением, а не шириной.
               *
               * Чередование 7/5 колонок красиво ровно до тех пор, пока число
               * работ делится нацело: на нечётном хвосте ряд остаётся
               * наполовину пустым, и это читается как недостающая карточка, а
               * не как приём. Равные половины со сдвигом второй колонки вниз
               * дают тот же неровный ритм и не ломаются ни на каком числе.
               */
              const dropped = position % 2 === 1;
              return (
                <li
                  key={project._id}
                  className={`col-span-12 md:col-span-6 lg:col-span-6 ${dropped ? 'lg:mt-24' : ''}`}
                >
                  <Link
                    href={href({ locale, direction: 'business', section: 'cases', slug: project.slug })}
                    className="group block"
                  >
                    {image ? (
                      <Shot
                        image={image}
                        ratio={4 / 3}
                        sizes="(min-width: 1024px) 46vw, 100vw"
                      />
                    ) : null}
                    <div data-reveal className="mt-6">
                      <FineRow items={titlesOf(project)} className="text-bone-faint" />
                      <h3 className="text-h3 m-0 mt-3 uppercase text-balance text-bone transition-colors group-hover:text-accent">
                        {localizedString(project.title, locale)}
                      </h3>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Band>
      ) : null}
    </>
  );
}

/* --- Кадр-разрыв ------------------------------------------------------------ */

/**
 * Одна фотография во всю ширину, без полей, без подписи и без ссылки.
 *
 * После первого экрана страница идёт восемью полосами, и четыре из них набраны
 * одной фигурой: заголовок, волосяная линия, список строк. Ритм настолько
 * ровный, что превращается в гул. Разрыв делит полосу надвое — всё выше него
 * про съёмку, всё ниже про деньги — и даёт вдохнуть перед тёмной главой.
 *
 * Ровно один на страницу: три таких, и приём перестаёт работать.
 *
 * Края резаные, как у полос. Кадр ниже ведущего кадра кейса (`ratio-break`):
 * он пауза, а не ещё одна работа, и спорить с ней за внимание ему нечем.
 */
function Break({ image }: { image: ImageRef }) {
  return (
    <section data-reveal className="ratio-break relative w-full overflow-hidden bg-ink-sunken">
      <Picture
        image={image}
        alt=""
        sizes="100vw"
        className="frame-in absolute inset-0 h-full w-full object-cover"
      />
    </section>
  );
}

/**
 * Кадр для разрыва: горизонтальный и ещё не показанный на этой странице.
 *
 * Обложки уже стоят в ленте портфолио и в кейсах, и повтор одного из них
 * читался бы не как пауза, а как сбой вёрстки — «эту фотографию я только что
 * видел». Поэтому берётся кадр из материалов работы, а всё, что уже было на
 * полосе, отсеивается по адресу файла.
 *
 * Не нашлось — разрыва нет. Пустая полоса хуже отсутствующей, а подставлять
 * сюда что попало значит ставить случайный кадр на самое заметное место.
 */
function breakFrame(projects: Project[], covers: Record<string, ImageRef | undefined>) {
  const shown = new Set<string>();
  for (const image of Object.values(covers)) if (image) shown.add(image.src);
  for (const project of projects) {
    const cover = frameOf(project.cover);
    if (cover) shown.add(cover.src);
  }

  for (const project of projects) {
    for (const media of project.media) {
      const image = frameOf(media);
      if (!image || shown.has(image.src)) continue;
      if (image.width <= image.height) continue;
      return image;
    }
  }
  return undefined;
}

/* --- 06. Стоимость ---------------------------------------------------------- */

function Pricing({
  locale,
  dict,
  entries,
  settings,
}: {
  locale: Locale;
  dict: Dictionary;
  entries: PricingEntry[];
  settings: GlobalSettings;
}) {
  const price = (entry: PricingEntry) => {
    if (typeof entry.price !== 'number') return dict.pricing.onRequest;
    const formatted = moneyFormat(locale, entry.currency).format(entry.price);
    const unit = localizedString(entry.unit, locale);
    return `${entry.priceFrom ? `${dict.pricing.from} ` : ''}${formatted}${unit ? ` / ${unit}` : ''}`;
  };

  return (
    <Band from="paper" core="ink" to="ivory" mode="dark" cut>
      <BandHead
        title={dict.nav.pricing}
        action={{
          label: dict.common.packages,
          href: href({ locale, direction: 'business', section: 'pricing' }),
        }}
      />

      {/*
       * Пакеты строками, а не карточками. У них нет цены — только описание, —
       * и три коробки с подписью «по запросу» выглядят пустыми обещаниями.
       * Строка с ценой справа читается как прайс-лист: то же содержание,
       * но видно, что это перечень, а не витрина.
       */}
      <ul className="m-0 mt-14 list-none p-0 lg:mt-20">
        {entries.map((entry) => (
          /*
           * Без номера: пакеты — перечень, а не последовательность, и «03»
           * перед «Брендом и имиджем» не сообщает ничего. Освободившаяся
           * колонка ушла в дело — название и цена стоят ближе к описанию.
           */
          <li key={entry._id} data-reveal className="border-t border-line">
            <div className="editorial-grid items-baseline gap-y-5 py-9 lg:py-12">
              <h3 className="text-h3 col-span-12 m-0 uppercase text-balance text-bone lg:col-span-4">
                {localizedString(entry.title, locale)}
              </h3>

              <div className="col-span-12 lg:col-span-5">
                <p className="m-0 max-w-[52ch] text-bone-dim">
                  {localizedString(entry.description, locale)}
                </p>
                {entry.includes.length > 0 ? (
                  <ul className="m-0 mt-5 list-none space-y-2 p-0">
                    {entry.includes.map((line, lineIndex) => (
                      <li key={lineIndex} className="label-fine flex gap-3 text-bone-faint">
                        <span aria-hidden="true" className="mt-[0.45em] h-px w-3 shrink-0 bg-line-strong" />
                        {localizedString(line, locale)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <p className="label col-span-12 m-0 text-accent lg:col-span-3 lg:justify-self-end lg:text-right">
                {price(entry)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div data-reveal className="mt-12 border-t border-line pt-10">
        <ContactButton
          dict={dict}
          contacts={settings.contacts}
          variant="quiet"
          className="label text-bone transition-colors hover:text-accent"
          draft={{ subject: dict.contact.directionSubject.business }}
        />
      </div>
    </Band>
  );
}

/* --- 07. Отзывы -------------------------------------------------------------- */

function Quotes({
  locale,
  dict,
  items,
}: {
  locale: Locale;
  dict: Dictionary;
  items: Testimonial[];
}) {
  const [first, ...rest] = items;

  return (
    <Band from="ivory" core="ivory" to="paper">
      <BandHead title={dict.common.testimonials} />

      {/*
       * Первый отзыв набран крупно и занимает половину полосы, остальные идут
       * колонками мельче. Коробок нет вовсе: длина отзыва не в нашей власти, а
       * подложка одинаковой высоты под текстом разной длины всегда где-нибудь
       * зияет. Разной величины набор эту разницу использует, а не прячет.
       */}
      <div className="editorial-grid mt-14 gap-y-14 lg:mt-20">
        {first ? (
          <figure data-reveal className="col-span-12 m-0 lg:col-span-7">
            <blockquote className="text-h3 m-0 leading-snug text-bone">
              «{localizedString(first.text, locale)}»
            </blockquote>
            <figcaption className="label-fine mt-8 flex flex-wrap items-center gap-3 text-bone-faint">
              {first.author}
              {!hasTranslation(first.text, locale) ? (
                <span lang="en" className="border border-line px-2 py-1">
                  {dict.fallback.short}
                </span>
              ) : null}
            </figcaption>
          </figure>
        ) : null}

        {rest.length > 0 ? (
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            {rest.map((item) => (
              <figure key={item._id} data-reveal className="m-0 border-t border-line py-8 first:pt-0">
                <blockquote className="m-0 text-bone-dim">
                  «{localizedString(item.text, locale)}»
                </blockquote>
                <figcaption className="label-fine mt-5 flex flex-wrap items-center gap-3 text-bone-faint">
                  {item.author}
                  {!hasTranslation(item.text, locale) ? (
                    <span lang="en" className="border border-line px-2 py-1">
                      {dict.fallback.short}
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    </Band>
  );
}

/* --- 08. Журнал --------------------------------------------------------------- */

function Journal({
  locale,
  dict,
  articles,
  types,
}: {
  locale: Locale;
  dict: Dictionary;
  articles: Article[];
  types: ArticleType[];
}) {
  const typeOf = (slug: string) => {
    const found = types.find((type) => type.slug === slug);
    return found ? localizedString(found.title, locale) : undefined;
  };

  const [lead, ...rest] = articles;
  const leadImage = frameOf(lead?.cover);

  return (
    <Band from="paper" core="paper" to="warm-grey" space="tight">
      <BandHead
        title={dict.nav.blog}
        action={{
          label: dict.common.viewAll,
          href: href({ locale, direction: 'business', section: 'blog' }),
        }}
      />

      {/*
       * Ведущая заметка кадром, остальные строками.
       *
       * Тремя равными строками журнал был четвёртой полосой подряд с одной и
       * той же фигурой — заголовок, волосяная линия, список, — и к этому месту
       * ритм уже не читался как ритм. Своя раскладка возвращает полосе лицо, не
       * превращая её в витрину: карточек по-прежнему нет, крупный кадр ровно
       * один, и спорить с портфолио и кейсами ему нечем — он в конце полосы, на
       * половине её ширины.
       *
       * Ведущей идёт первая заметка: список приходит отсортированным по дате, и
       * выбирать «главную» вручную здесь нечем и незачем.
       */}
      <div className="editorial-grid mt-12 gap-y-12 lg:mt-16">
        {lead ? (
          <article data-reveal className="col-span-12 lg:col-span-6">
            <Link
              href={href({ locale, direction: 'business', section: 'blog', slug: lead.slug })}
              className="group block"
            >
              {leadImage ? (
                <Shot
                  image={leadImage}
                  ratio={3 / 2}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                />
              ) : null}
              <FineRow
                className="mt-6 text-bone-faint"
                items={[typeOf(lead.typeSlug), formatDate(lead.publishedAt, locale)]}
              />
              <h3 className="text-h2 m-0 mt-3 uppercase text-balance text-bone transition-colors group-hover:text-accent">
                {localizedString(lead.title, locale)}
              </h3>
              <p className="mt-4 max-w-[46ch] text-bone-dim">
                {localizedString(lead.excerpt, locale)}
              </p>
            </Link>
          </article>
        ) : null}

        {rest.length > 0 ? (
          <ul className="col-span-12 m-0 list-none self-end p-0 lg:col-span-5 lg:col-start-8">
            {rest.map((article) => (
              <li key={article._id} data-reveal className="border-t border-line">
                <Link
                  href={href({ locale, direction: 'business', section: 'blog', slug: article.slug })}
                  className="group block py-7 lg:py-8"
                >
                  <FineRow
                    className="text-bone-faint"
                    items={[typeOf(article.typeSlug), formatDate(article.publishedAt, locale)]}
                  />
                  <h3 className="text-h3 m-0 mt-3 uppercase text-balance text-bone transition-colors group-hover:text-accent">
                    {localizedString(article.title, locale)}
                  </h3>
                  <p className="mt-2 max-w-[46ch] text-sm text-bone-dim">
                    {localizedString(article.excerpt, locale)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Band>
  );
}

/* --- 09. Связаться ------------------------------------------------------------ */

function Contact({
  locale,
  dict,
  settings,
}: {
  locale: Locale;
  dict: Dictionary;
  settings: GlobalSettings;
}) {
  const phone = settings.contacts.find((contact) => contact.kind === 'phone');

  /*
   * Поле не доходит до `stone-dark` под текстом: на нём не читается ничего —
   * ни тёмное, ни светлое. Спуск в него отдан подвалу, где текста нет вовсе.
   */
  return (
    <Band from="warm-grey" core="warm-grey" to="stone" space="wide">
      <div className="editorial-grid items-end gap-y-10">
        <div data-reveal className="col-span-12 lg:col-span-7">
          <h2 className="text-h1 m-0 uppercase text-balance">{dict.contact.heading}</h2>
          <p className="mt-7 max-w-[42ch] text-lead text-bone-dim">{dict.contact.homeLead}</p>
          <ContactButton
            dict={dict}
            contacts={settings.contacts}
            className="btn btn-solo label mt-11 rounded-none bg-bone text-ink [--btn-wipe:var(--color-accent)]"
            draft={{ subject: dict.contact.directionSubject.business }}
          />
        </div>

        <div data-reveal className="col-span-12 lg:col-span-4 lg:col-start-9">
          <FineRow
            className="text-bone-faint"
            items={[localizedString(settings.location, locale), phone?.value]}
          />
        </div>
      </div>
    </Band>
  );
}

/* --- Полоса целиком ------------------------------------------------------------ */

export function BusinessHome({
  locale,
  dict,
  doc,
  categories,
  covers,
  projects,
  pricing,
  testimonials,
  articles,
  articleTypes,
  settings,
}: Props) {
  const breakImage = breakFrame(projects, covers);

  return (
    <>
      <HeaderState />

      <Opening
        locale={locale}
        dict={dict}
        doc={doc}
        categories={categories}
        settings={settings}
      />

      {doc.clients && doc.clients.length > 0 ? (
        <Clients locale={locale} dict={dict} clients={doc.clients} />
      ) : null}

      {categories.length > 0 ? (
        <Portfolio
          locale={locale}
          dict={dict}
          categories={categories}
          covers={covers}
        />
      ) : null}

      {doc.highlights.length > 0 ? (
        <Process locale={locale} dict={dict} doc={doc} />
      ) : null}

      {projects.length > 0 ? (
        <Cases
          locale={locale}
          dict={dict}
          projects={projects}
          categories={categories}
        />
      ) : null}

      {/* Разрыв стоит перед «Стоимостью»: здесь полоса переходит от съёмки к
          деньгам, и это единственный шов страницы, который стоит отметить. */}
      {breakImage ? <Break image={breakImage} /> : null}

      {pricing.length > 0 ? (
        <Pricing
          locale={locale}
          dict={dict}
          entries={pricing}
          settings={settings}
        />
      ) : null}

      {testimonials.length > 0 ? (
        <Quotes locale={locale} dict={dict} items={testimonials} />
      ) : null}

      {articles.length > 0 ? (
        <Journal
          locale={locale}
          dict={dict}
          articles={articles}
          types={articleTypes}
        />
      ) : null}

      <Contact locale={locale} dict={dict} settings={settings} />
    </>
  );
}
