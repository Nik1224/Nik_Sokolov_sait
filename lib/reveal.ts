/**
 * Появление блоков по прокрутке (M1).
 *
 * Скрипт встроен в страницу и выполняется первым в `<body>` — до того, как
 * браузер отрисует остальное. Из-за этого нет вспышки: содержимое не успевает
 * показаться и спрятаться обратно.
 *
 * Скрывать содержимое до прокрутки — рискованная затея: если бы правила CSS
 * прятали блоки сами, а скрипт не выполнился, страница осталась бы пустой.
 * Поэтому класс `reveal-ready`, который включает эти правила, ставит тот же
 * код, что заводит наблюдателя: разойтись они не могут.
 *
 * Ниже — строка, попадающая в разметку. Не модуль: подключённый обычным
 * образом файл выполнился бы после отрисовки, и вспышка вернулась бы.
 */

/** Разметка отмечается атрибутами, а не классами: класс — дело оформления. */
export const REVEAL_ATTR = 'data-reveal';
export const REVEAL_STAGGER_ATTR = 'data-reveal-stagger';

/**
 * Задержка между соседями в каскаде и её потолок. Двенадцатая карточка не
 * должна ждать секунду — к этому моменту человек уже смотрит на неё.
 */
const STEP_MS = 60;
const MAX_STEPS = 8;

export const REVEAL_SCRIPT = `(function(){
  var doc = document;
  var root = doc.documentElement;
  if (!('IntersectionObserver' in window)) return;
  // Уважаем системную настройку: без неё страница просто видна целиком.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.classList.add('reveal-ready');

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (!entry.isIntersecting) continue;
      var el = entry.target;
      if (el.hasAttribute('${REVEAL_STAGGER_ATTR}')) {
        var kids = el.children;
        for (var k = 0; k < kids.length; k++) {
          kids[k].style.setProperty('--reveal-delay', Math.min(k, ${MAX_STEPS}) * ${STEP_MS} + 'ms');
        }
      }
      el.classList.add('is-revealed');
      io.unobserve(el);
    }
  }, {
    // Блок начинает проявляться, когда его верхний край поднялся в кадр, а не
    // когда виден целиком: секция бывает выше экрана, и ждать её всю нельзя.
    rootMargin: '0px 0px -12% 0px',
  });

  function scan() {
    var nodes = doc.querySelectorAll('[${REVEAL_ATTR}]:not(.is-revealed), [${REVEAL_STAGGER_ATTR}]:not(.is-revealed)');
    for (var i = 0; i < nodes.length; i++) io.observe(nodes[i]);
  }

  scan();
  // Переход между страницами не перезагружает документ: новые блоки приходят
  // в уже живой DOM, и наблюдателю нужно узнать о них.
  new MutationObserver(scan).observe(doc.body || root, { childList: true, subtree: true });
})();`;
