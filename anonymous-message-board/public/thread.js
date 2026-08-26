'use strict';

const parts = window.location.pathname.split('/').filter(Boolean);
const board = decodeURIComponent(parts[1] || 'general');
const threadId = parts[2];
const root = document.getElementById('thread');
const heading = document.getElementById('thread-heading');
const form = document.getElementById('new-reply');
const back = document.getElementById('back-link');
back.href = '/b/' + encodeURIComponent(board) + '/';

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

async function requestAction(method, data) {
  const response = await fetch('/api/replies/' + encodeURIComponent(board), {
    method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data)
  });
  return response.text();
}

async function loadThread() {
  const response = await fetch('/api/replies/' + encodeURIComponent(board) + '?thread_id=' + encodeURIComponent(threadId));
  if (!response.ok) throw new Error(await response.text());
  const thread = await response.json();

  heading.textContent = thread.text;
  root.replaceChildren();
  root.appendChild(el('div', 'Created: ' + new Date(thread.created_on).toLocaleString(), 'meta'));

  thread.replies.forEach(function (reply) {
    const card = el('article', undefined, 'reply');
    card.appendChild(el('p', reply.text));
    card.appendChild(el('div', new Date(reply.created_on).toLocaleString(), 'meta'));

    const actions = el('div', undefined, 'actions');
    const report = el('button', 'Report');
    report.type = 'button';
    report.addEventListener('click', async function () {
      await requestAction('PUT', { thread_id: threadId, reply_id: reply._id });
      report.disabled = true;
      report.textContent = 'Reported';
    });

    const remove = el('button', 'Delete');
    remove.type = 'button';
    remove.addEventListener('click', async function () {
      const password = window.prompt('Delete password:');
      if (password === null) return;
      window.alert(await requestAction('DELETE', {
        thread_id: threadId,
        reply_id: reply._id,
        delete_password: password
      }));
      await loadThread();
    });

    actions.append(report, remove);
    card.appendChild(actions);
    root.appendChild(card);
  });
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const data = new FormData(form);
  data.set('thread_id', threadId);
  await fetch('/api/replies/' + encodeURIComponent(board), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data)
  });
  form.reset();
  await loadThread();
});

loadThread().catch(function (error) {
  root.textContent = 'Unable to load thread: ' + error.message;
});
