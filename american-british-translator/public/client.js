'use strict';

const form = document.getElementById('translate-form');
const textInput = document.getElementById('text-input');
const localeSelect = document.getElementById('locale-select');
const output = document.getElementById('translated-sentence');
const errorOutput = document.getElementById('error-msg');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  output.textContent = '';
  errorOutput.textContent = '';

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: textInput.value,
        locale: localeSelect.value
      })
    });

    const data = await response.json();

    if (data.error) {
      errorOutput.textContent = data.error;
      return;
    }

    output.innerHTML = data.translation;
  } catch (error) {
    errorOutput.textContent = 'Unable to translate right now.';
  }
});
