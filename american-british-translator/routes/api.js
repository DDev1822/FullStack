'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  const translator = new Translator();
  const locales = new Set(['american-to-british', 'british-to-american']);

  app.post('/api/translate', (req, res) => {
    const body = req.body || {};
    const hasText = Object.prototype.hasOwnProperty.call(body, 'text');
    const hasLocale = Object.prototype.hasOwnProperty.call(body, 'locale');

    if (!hasText || !hasLocale) {
      return res.json({ error: 'Required field(s) missing' });
    }

    if (typeof body.text !== 'string' || body.text.trim() === '') {
      return res.json({ error: 'No text to translate' });
    }

    if (!locales.has(body.locale)) {
      return res.json({ error: 'Invalid value for locale field' });
    }

    const translation = translator.translateAndHighlight(body.text, body.locale);

    return res.json({
      text: body.text,
      translation: translation === body.text
        ? 'Everything looks good to me!'
        : translation
    });
  });
};
