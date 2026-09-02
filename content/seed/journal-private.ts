/**
 * Статьи журнала о съёмках, кроме свадеб: портрет, семья, частные события.
 *
 * Написаны под настоящие вопросы, которые задают до съёмки: что надеть, где
 * снимать, как пройдёт съёмка с детьми, что делать на юбилее. Одна статья —
 * один вопрос: и поисковик, и человек ищут ответ на конкретное, а не сайт
 * вообще.
 *
 * Обложки — кадры из тех же галерей портфолио, что и в разделе съёмок.
 */

import type { Article, MediaAsset } from '../types';
import { bodyRuEn } from './helpers';

const WIDTHS = [600, 1200, 1800] as const;

/** Обложка из портфолио. Горизонтальный кадр 1800×1200. */
function cover(folder: string, id: string, ru: string, en: string): MediaAsset {
  const base = `/media/portfolio/${folder}`;
  return {
    _key: `art-cover-${id}`,
    type: 'image',
    rights: 'owned',
    alt: { ru, en },
    image: {
      src: `${base}/${id}-1800.jpg`,
      width: 1800,
      height: 1200,
      sources: WIDTHS.map((size) => ({ width: size, src: `${base}/${id}-${size}.jpg` })),
    },
  };
}

const published = { status: 'published' } as const;
const base = {
  ...published,
  directions: ['private'] as const,
  primaryDirection: 'private' as const,
  author: 'Никита Соколов',
  publishedAt: '2026-09-03',
  projectSlugs: [] as string[],
};

export const privateArticles: Article[] = [
  {
    ...base,
    directions: ['private'],
    _id: 'art.portrait-clothes',
    slug: 'chto-nadet-na-semku',
    typeSlug: 'preparation',
    order: 20,
    title: { ru: 'Что надеть на съёмку', en: 'What to wear to a shoot' },
    excerpt: {
      ru: 'Самый частый вопрос перед портретной съёмкой. Несколько правил, которые работают почти всегда, и три вещи, которые лучше оставить дома.',
      en: 'The most common question before a portrait shoot. A few rules that almost always work, and three things better left at home.',
    },
    body: bodyRuEn(
      [
        'Это первый вопрос, который задают перед портретной съёмкой, и волнуются из-за него больше, чем стоит. Одежда действительно влияет на результат, но правил тут немного, и они простые.',
        'Первое: одежда должна быть удобной. Не «эффектной», а такой, в которой вы не думаете о том, где что тянет и не задралось ли. Любое неудобство мгновенно читается в позе — плечи поднимаются, руки прижимаются к телу, и никакая помощь с позированием этого не исправит.',
        'Второе: простой крой и однотонные ткани работают лучше сложных. На фотографии внимание идёт туда, где больше контраста и деталей. Если это блузка с крупным рисунком, смотреть будут на неё, а не на вас. Однотонное вытягивает лицо на первый план — а портрет ради лица и снимается.',
        'Третье: цвет лучше выбирать спокойный и глубокий, а не яркий и чистый. Тёплые нейтральные оттенки, приглушённые цвета, благородные тёмные — все они дружат с кожей. Ядовитые оттенки отражаются на лице цветным светом, и его потом приходится вычищать в обработке.',
        'Четвёртое: соберите комплект целиком и померьте заранее. Не отдельно верх и низ, а всё вместе, с обувью и украшениями, за пару дней. Половина проблем обнаруживается именно в этот момент, а не в день съёмки.',
        'Что лучше оставить дома. Мелкую частую полоску и клетку — на фотографии они дают рябь. Крупные логотипы и надписи — они датируют кадр и перетягивают внимание. Совсем новую обувь — в ней вы будете думать о ногах.',
        'И про смену образов. Два комплекта на съёмку — разумно: один поспокойнее, один поинтереснее. Три и больше — это уже переодевания вместо съёмки: на каждую смену уходит минут пятнадцать, и они вычитаются из времени, когда вас снимают.',
      ],
      [
        'This is the first question people ask before a portrait shoot, and it causes more worry than it should. Clothes do affect the result, but there are only a few rules and they are simple.',
        'First: clothes have to be comfortable. Not "striking", but something you are not thinking about — where it pulls, whether it has ridden up. Any discomfort reads instantly in the posture: shoulders lift, arms press to the body, and no amount of help with posing fixes it.',
        'Second: simple cuts and plain fabrics beat complicated ones. In a photograph, attention goes where there is most contrast and detail. If that is a boldly patterned blouse, people will look at the blouse rather than at you. Plain fabric pushes the face forward — and a portrait exists for the face.',
        'Third: choose calm, deep colour over bright and saturated. Warm neutrals, muted shades and rich darks all get along with skin. Acid colours bounce onto the face as coloured light, which then has to be cleaned up in the edit.',
        'Fourth: assemble the whole outfit and try it on in advance. Not the top and the bottom separately, but everything together, with shoes and jewellery, a couple of days before. Half the problems show up at that moment rather than on the day.',
        'What to leave at home. Fine stripes and small checks — they shimmer in a photograph. Large logos and slogans — they date the frame and pull attention. Brand-new shoes — you will be thinking about your feet.',
        'On changes of outfit: two is sensible — one calmer, one more interesting. Three or more turns the session into changing rather than shooting: each change costs about fifteen minutes, taken out of the time you are actually being photographed.',
      ],
    ),
    cover: cover('portrait', '0988e2fe49db', 'Портретная съёмка в городе', 'A portrait shoot in the city'),
  },

  {
    ...base,
    directions: ['private'],
    _id: 'art.portrait-location',
    slug: 'studiya-ili-ulitsa',
    typeSlug: 'location',
    order: 21,
    title: { ru: 'Студия или улица: где снимать портрет', en: 'Studio or outdoors: where to shoot a portrait' },
    excerpt: {
      ru: 'Разница не в красоте, а в предсказуемости и в том, что окажется в кадре кроме вас. Как выбрать под задачу.',
      en: 'The difference is not beauty but predictability, and what ends up in the frame besides you. How to choose for the task.',
    },
    body: bodyRuEn(
      [
        'Выбор между студией и улицей обычно делают по картинкам: где красивее. Разница на самом деле в другом — в том, насколько предсказуем результат и что попадёт в кадр кроме вас.',
        'Студия — это полный контроль. Свет ставится под вас, погода не имеет значения, фон нейтральный, и ничто не отвлекает от лица. Съёмка идёт спокойно, можно переодеться, попить чаю, посмотреть отснятое. Если портрет нужен для дела — для профиля, для сайта, для документов посерьёзнее паспорта, — студия почти всегда правильный ответ.',
        'Минус у студии один, но существенный: она нейтральна. Белая или серая циклорама ничего не рассказывает о человеке. Кадр получается о лице и только о нём — иногда это ровно то, что нужно, иногда пусто.',
        'Улица — наоборот. Она даёт воздух, контекст и настроение: город, парк, вода, окна, отражения. Кадр получается о человеке в мире, а не о человеке на фоне. Но за это приходится платить непредсказуемостью: погода, свет, посторонние люди в кадре, ограничения на съёмку в некоторых местах.',
        'Про свет на улице стоит знать одно: полдень — худшее время. Солнце сверху даёт жёсткие тени под глазами и заставляет щуриться. Час-полтора после рассвета и перед закатом — лучшее. Пасмурный день тоже отличный: облака работают как гигантский рассеиватель.',
        'Как выбрать, если сомневаетесь. Спросите себя, для чего снимок. Если ответ «чтобы было понятно, кто я и как выгляжу» — студия. Если «чтобы было ощущение» — улица. Если хочется и того, и другого, честнее развести на две съёмки, чем пытаться уместить в одну: переезд из студии на улицу съедает час и меняет свет.',
        'И практическое: на улице нужна запасная обувь и что-то тёплое, даже летом. Съёмка идёт полтора часа в основном стоя, и мёрзнуть на ней успевают в любую погоду.',
      ],
      [
        'The choice between a studio and outdoors is usually made from pictures: which looks nicer. The real difference is elsewhere — in how predictable the result is, and what ends up in the frame besides you.',
        'A studio is full control. The light is built around you, weather is irrelevant, the background is neutral, and nothing competes with the face. The session is calm: you can change, have tea, look at what has been shot. If the portrait is for work — a profile, a website, anything more serious than a passport photo — a studio is almost always the right answer.',
        'The studio has one real drawback: it is neutral. A white or grey backdrop says nothing about the person. The frame is about the face and only the face — sometimes exactly right, sometimes empty.',
        'Outdoors is the opposite. It gives air, context and mood: the city, a park, water, windows, reflections. The frame becomes about a person in the world rather than a person against a backdrop. The price is unpredictability: weather, light, strangers in shot, and restrictions on photography in some places.',
        'One thing to know about outdoor light: midday is the worst time. Sun from overhead throws hard shadows under the eyes and makes people squint. The hour or so after sunrise and before sunset is the best. An overcast day is excellent too — cloud works as an enormous diffuser.',
        'How to decide if you are torn. Ask what the picture is for. If the answer is "so people can see who I am and what I look like", that is a studio. If it is "so there is a feeling", that is outdoors. If you want both, it is more honest to split into two shoots than to squeeze them into one: moving from studio to street eats an hour and changes the light.',
        'And a practical note: outdoors you need spare shoes and something warm, even in summer. A shoot runs an hour and a half, mostly standing, and people get cold in any weather.',
      ],
    ),
    cover: cover('portrait', '2845ae7a89eb', 'Портретная съёмка на закате у воды', 'A portrait shoot by the water at sunset'),
  },

  {
    ...base,
    directions: ['private'],
    _id: 'art.family-kids',
    slug: 'semeynaya-semka-s-detmi',
    typeSlug: 'process',
    order: 22,
    title: { ru: 'Семейная съёмка с детьми: как она проходит на самом деле', en: 'A family shoot with children: how it actually goes' },
    excerpt: {
      ru: 'Дети не позируют, и это хорошо. Как устроена такая съёмка, сколько она длится и что можно сделать заранее, чтобы всем было легко.',
      en: 'Children do not pose, and that is a good thing. How this kind of shoot works, how long it lasts, and what to prepare so it goes easily.',
    },
    body: bodyRuEn(
      [
        'Родители почти всегда приходят с одним и тем же опасением: «наш не будет слушаться». Он и не должен. Съёмка с детьми устроена не так, как съёмка взрослых, и держится не на послушании.',
        'Взрослых можно поставить и попросить. С детьми это не работает вообще: ребёнок, которого просят улыбнуться, выдаёт то самое напряжённое лицо, которое потом никому не нравится. Поэтому съёмка идёт наоборот — ребёнку дают заниматься своим делом, а я снимаю то, что происходит.',
        'Отсюда главное, что нужно от родителей: не воспитывать в кадре. Фразы «встань ровно», «улыбнись», «не балуйся» ломают всё за секунду. Гораздо лучше работает обратное — играйте, разговаривайте, щекочите, подкидывайте. Живые кадры берутся оттуда.',
        'Про длительность. Час-полтора — предел, и это не про фотографа, а про ребёнка. Дошкольник выдерживает минут сорок активного внимания, дальше начинается усталость, а с ней капризы. Лучше снять сорок хороших минут, чем два часа с истерикой в середине.',
        'Что стоит сделать заранее. Выспаться и поесть — голодный и невыспавшийся ребёнок не снимается никак. Прийти без спешки, с запасом в двадцать минут: съёмка, начатая с бега и нервов, потом полчаса выравнивается. Взять любимую игрушку или книжку — они не для кадра, а чтобы было к чему вернуться.',
        'Про одежду: комплекты для всей семьи лучше подбирать в одной гамме, но не одинаковые. Одинаковые белые рубашки на всех выглядят как корпоративное фото. Общая палитра из двух-трёх спокойных цветов даёт ощущение семьи и при этом оставляет каждого собой.',
        'И то, ради чего это всё. Постановочный кадр, где все смотрят в камеру и улыбаются, обычно тоже получается — он нужен бабушкам, и я его сделаю. Но пересматривать через десять лет вы будете не его, а тот, где ребёнок висит на отце вниз головой.',
      ],
      [
        'Parents almost always arrive with the same worry: "ours will not behave". They do not have to. A shoot with children works differently from a shoot with adults, and it does not rest on obedience.',
        'Adults can be placed and asked. With children that does not work at all: a child asked to smile produces exactly the tense face nobody likes afterwards. So the session runs the other way round — the child gets on with their own business and I photograph what happens.',
        'Which leads to the main thing needed from parents: do not parent in front of the camera. "Stand up straight", "smile", "stop messing about" break everything in a second. The opposite works far better — play, talk, tickle, throw them in the air. The living frames come from there.',
        'On length. An hour to ninety minutes is the ceiling, and that is about the child, not the photographer. A pre-schooler holds about forty minutes of active attention; after that comes tiredness and, with it, tears. Forty good minutes beat two hours with a meltdown in the middle.',
        'What to arrange in advance. Sleep and food — a hungry, tired child does not photograph at all. Arrive without rushing, twenty minutes early: a session that starts with running and nerves takes half an hour to settle. Bring a favourite toy or book — not for the frame, but as something to come back to.',
        'On clothes: dress the family in one palette, but not identically. Matching white shirts on everyone look like a corporate photo. Two or three calm shades shared across the family give a sense of belonging while leaving everyone themselves.',
        'And the point of all of it. The posed frame where everyone looks at the camera and smiles usually happens too — grandmothers need it, and I will take it. But the one you come back to in ten years is the other one, where the child is hanging upside down off their father.',
      ],
    ),
    cover: cover('family', '2e2b30c8d16a', 'Семья с ребёнком на съёмке', 'A family with a small child during a shoot'),
  },

  {
    ...base,
    directions: ['private'],
    _id: 'art.family-generations',
    slug: 'semka-bolshoy-semi',
    typeSlug: 'preparation',
    order: 23,
    title: { ru: 'Съёмка большой семьи: как собрать три поколения и не потерять полдня', en: 'Photographing a large family: three generations without losing half a day' },
    excerpt: {
      ru: 'Главная сложность не в свете, а в организации. Что решить до съёмки, чтобы пятнадцать человек не разошлись через полчаса.',
      en: 'The hard part is not the light but the logistics. What to settle in advance so fifteen people do not drift off within half an hour.',
    },
    body: bodyRuEn(
      [
        'Съёмка большой семьи — это в первую очередь организационная задача, а не фотографическая. Свет ставится один раз, а вот собрать пятнадцать человек в одном месте в одно время и удержать их там час — это работа, и делать её надо до съёмки.',
        'Первое: назначьте одного человека ответственным. Не фотографа — кого-то из семьи, кто знает всех и кого все слушают. Его задача — созвать, напомнить накануне и в день, собрать по группам, когда попрошу. Без такого человека съёмка на пятнадцать персон превращается в перекличку.',
        'Второе: снимайте с общего кадра, а не в конце. Обычный порядок — сначала все вместе, потом по семьям, потом пары и дети по отдельности. Причина простая: общий кадр требует всех сразу, и если оставить его на потом, кто-то уже уйдёт курить, кто-то к машине, кто-то с ребёнком в туалет.',
        'Третье: отпускайте по мере готовности. Как только сняли старшее поколение, скажите им, что они свободны. Пожилым людям тяжело стоять час, и они устают заметно раньше остальных. Дети, кстати, тоже — их лучше снять в первые двадцать минут, пока им интересно.',
        'Четвёртое: заложите время честно. Один общий кадр — это не пять минут, а пятнадцать: собрать, расставить по росту и родству, дождаться, пока все посмотрят в одну сторону и никто не моргнёт. На семью из пятнадцати человек с разбивкой по группам уходит полтора-два часа.',
        'Пятое, про одежду: общая палитра, но не форма. Договоритесь о двух-трёх спокойных цветах и попросите избегать крупных рисунков и логотипов. Рассылать всем список «что надеть» не нужно — достаточно назвать гамму, дальше каждый оденется как ему удобно.',
        'И про место. Студия для такой съёмки почти всегда удобнее улицы: не зависит от погоды, есть куда сесть, есть где переждать. Если хочется на природе — выбирайте место, куда можно подъехать близко: пожилые родственники и коляски не любят долгих переходов.',
      ],
      [
        'Photographing a large family is a logistical task first and a photographic one second. The light is set once; gathering fifteen people in one place at one time and keeping them there for an hour is the actual work, and it is done before the shoot.',
        'First: appoint one person in charge. Not the photographer — someone in the family who knows everyone and whom everyone listens to. Their job is to call people, remind them the day before and on the day, and gather groups when I ask. Without that person, a shoot for fifteen turns into a roll call.',
        'Second: start with the group shot rather than ending on it. The usual order is everyone together, then by family, then couples and children separately. The reason is simple: the group frame needs everyone at once, and if you leave it for later, someone has gone for a cigarette, someone to the car, someone to the bathroom with a child.',
        'Third: release people as you finish with them. Once the eldest generation is done, tell them they are free. Standing for an hour is hard at that age, and they tire noticeably sooner. Children too, incidentally — shoot them in the first twenty minutes while it still interests them.',
        'Fourth: allow honest time. One group frame is not five minutes but fifteen: gathering, arranging by height and family, waiting for everyone to look the same way without blinking. A family of fifteen with group breakdowns takes an hour and a half to two hours.',
        'Fifth, on clothes: a shared palette, not a uniform. Agree on two or three calm colours and ask people to avoid large patterns and logos. There is no need to circulate a "what to wear" list — naming the palette is enough, and everyone dresses as they please within it.',
        'And on the place. For this kind of shoot a studio is almost always easier than outdoors: no weather, somewhere to sit, somewhere to wait. If you want to be outside, choose a spot you can drive close to — elderly relatives and pushchairs do not enjoy long walks.',
      ],
    ),
    cover: cover('family', '51b1703890fb', 'Три поколения семьи в студии', 'Three generations of a family in a studio'),
  },

  {
    ...base,
    directions: ['private'],
    _id: 'art.event-anniversary',
    slug: 'semka-yubileya',
    typeSlug: 'process',
    order: 24,
    title: { ru: 'Съёмка юбилея и дня рождения: репортаж, а не постановка', en: 'Photographing an anniversary or birthday: reportage, not staging' },
    excerpt: {
      ru: 'На празднике фотограф не строит кадры, а не мешает. Что стоит обсудить заранее и почему список обязательных кадров важнее сценария.',
      en: 'At a party the photographer does not build frames, they stay out of the way. What to agree in advance, and why a must-have list matters more than a script.',
    },
    body: bodyRuEn(
      [
        'Юбилей, день рождения, крестины, выпускной — всё это репортажная съёмка. Здесь нет постановки и почти нет режиссуры: моя задача не выстраивать кадры, а оказываться в нужном месте и не мешать празднику идти своим ходом.',
        'Из этого следует главное отличие от портретной съёмки: результат зависит не от того, как вы будете позировать, а от того, насколько я заранее понимаю, что и когда произойдёт. Поэтому единственное, что действительно нужно от вас, — рассказать сценарий.',
        'Что важно назвать заранее. Во сколько выносят торт. Когда будет главный тост и кто его говорит. Готовят ли гости сюрприз, номер, видео. Будет ли момент с подарками. Планируется ли что-то на улице. Каждый из этих моментов длится минуту-две и не повторяется — если о нём не знать, его легко пропустить.',
        'Второе — список людей, которых нужно снять обязательно. На большом празднике сорок гостей, и фотограф не знает, кто из них двоюродная сестра, приехавшая из другого города, а кто сосед. Пять-семь имён с приметами закрывают этот вопрос полностью.',
        'Третье — общий кадр со всеми. Он почти всегда нужен и почти всегда получается плохо, если о нём вспоминают в конце вечера. Лучшее время — до начала застолья или сразу после главного тоста, пока все ещё на местах и трезвы настолько, чтобы смотреть в одну сторону. Занимает десять минут.',
        'Четвёртое, про свет, и это единственное техническое. Рестораны и банкетные залы почти всегда тёмные, а верхний свет там холодный и плоский. Если есть возможность повлиять на площадку — попросите оставить тёплые лампы и свечи и приглушить верхний свет. Кадры от этого выигрывают сильнее, чем от любой техники.',
        'И про то, сколько снимать. Праздник обычно имеет смысл снимать не целиком: первые три-четыре часа дают всё главное — встречу гостей, накрытый зал, тосты, торт, первые танцы. Дальше начинается повтор. Исключение — если на конец запланировано что-то отдельное вроде фейерверка.',
      ],
      [
        'An anniversary, a birthday, a christening, a graduation — all of these are reportage. There is no staging and almost no direction: my job is not to build frames but to be in the right place and stay out of the way while the party runs itself.',
        'Which brings the main difference from a portrait shoot: the result depends not on how you pose but on how well I know in advance what will happen and when. So the one thing genuinely needed from you is the running order.',
        'What to name in advance. When the cake comes out. When the main toast happens and who gives it. Whether guests have prepared a surprise, a performance, a video. Whether there is a moment with the presents. Whether anything is planned outside. Each of these lasts a minute or two and does not repeat — unknown, they are easy to miss.',
        'Second: a list of people who must be photographed. At a large party there are forty guests, and the photographer cannot tell which one is the cousin who travelled from another city and which is a neighbour. Five to seven names with descriptions settle this completely.',
        'Third: the group photograph with everyone. It is almost always wanted, and almost always turns out badly when it is remembered at the end of the evening. The best moment is before the meal begins or right after the main toast, while everyone is still in place and sober enough to look the same way. It takes ten minutes.',
        'Fourth, on light, and this is the only technical point. Restaurants and banqueting halls are almost always dark, and their overhead light is cold and flat. If you can influence the venue, ask them to keep warm lamps and candles on and dim the ceiling lights. That improves the pictures more than any equipment.',
        'And on how long to shoot. It usually makes no sense to cover a party from end to end: the first three or four hours give you everything that matters — guests arriving, the laid room, the toasts, the cake, the first dancing. After that it repeats. The exception is when something separate, like fireworks, is planned for the close.',
      ],
    ),
    cover: cover('family', '05c9ce2c3872', 'Семейный праздник', 'A family celebration'),
  },
];
