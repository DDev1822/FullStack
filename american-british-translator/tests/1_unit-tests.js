const chai = require('chai');
const assert = chai.assert;
const Translator = require('../components/translator.js');

suite('Unit Tests', () => {
  const translator = new Translator();

  const cases = [
    ['Mangoes are my favorite fruit.', 'american-to-british', 'Mangoes are my favourite fruit.'],
    ['I ate yogurt for breakfast.', 'american-to-british', 'I ate yoghurt for breakfast.'],
    ["We had a party at my friend's condo.", 'american-to-british', "We had a party at my friend's flat."],
    ['Can you toss this in the trashcan for me?', 'american-to-british', 'Can you toss this in the bin for me?'],
    ['The parking lot was full.', 'american-to-british', 'The car park was full.'],
    ['Like a high tech Rube Goldberg machine.', 'american-to-british', 'Like a high tech Heath Robinson device.'],
    ['To play hooky means to skip class or work.', 'american-to-british', 'To bunk off means to skip class or work.'],
    ['No Mr. Bond, I expect you to die.', 'american-to-british', 'No Mr Bond, I expect you to die.'],
    ['Dr. Grosh will see you now.', 'american-to-british', 'Dr Grosh will see you now.'],
    ['Lunch is at 12:15 today.', 'american-to-british', 'Lunch is at 12.15 today.'],
    ['We watched the footie match for a while.', 'british-to-american', 'We watched the soccer match for a while.'],
    ['Paracetamol takes up to an hour to work.', 'british-to-american', 'Tylenol takes up to an hour to work.'],
    ['First, caramelise the onions.', 'british-to-american', 'First, caramelize the onions.'],
    ['I spent the bank holiday at the funfair.', 'british-to-american', 'I spent the public holiday at the carnival.'],
    ['I had a bicky then went to the chippy.', 'british-to-american', 'I had a cookie then went to the fish-and-chip shop.'],
    ["I've just got bits and bobs in my bum bag.", 'british-to-american', "I've just got odds and ends in my fanny pack."],
    ['The car boot sale at Boxted Airfield was called off.', 'british-to-american', 'The swap meet at Boxted Airfield was called off.'],
    ['Have you met Mrs Kalyani?', 'british-to-american', 'Have you met Mrs. Kalyani?'],
    ["Prof Joyner of King's College, London.", 'british-to-american', "Prof. Joyner of King's College, London."],
    ['Tea time is usually around 4 or 4.30.', 'british-to-american', 'Tea time is usually around 4 or 4:30.']
  ];

  cases.forEach(([input, locale, expected]) => {
    test(`Translate: ${input}`, () => {
      assert.strictEqual(translator.translate(input, locale), expected);
    });
  });

  const highlighted = [
    ['Mangoes are my favorite fruit.', 'american-to-british', 'Mangoes are my <span class="highlight">favourite</span> fruit.'],
    ['I ate yogurt for breakfast.', 'american-to-british', 'I ate <span class="highlight">yoghurt</span> for breakfast.'],
    ['We watched the footie match for a while.', 'british-to-american', 'We watched the <span class="highlight">soccer</span> match for a while.'],
    ['Paracetamol takes up to an hour to work.', 'british-to-american', '<span class="highlight">Tylenol</span> takes up to an hour to work.']
  ];

  highlighted.forEach(([input, locale, expected]) => {
    test(`Highlight: ${input}`, () => {
      assert.strictEqual(translator.translateAndHighlight(input, locale), expected);
    });
  });
});
