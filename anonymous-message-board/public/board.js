'use strict';

const parts = window.location.pathname.split('/').filter(Boolean);
const board = decodeURIComponent(parts[1] || 'general');
const heading = document.getElementById('board-name');
const list = document.getElementById('threads');
const form = document.getElementById('new-thread');
heading.textContent = '/' + board + '/';

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

async function loadThreads() {
  const response = await fetch('/api/threads/' + encodeURIComponent(board));
  const threads = await response.json();
  list.replaceChildren();

  threads.forEach(function (thread) {
    const card = el('article', undefined, 'thread');
    const link = el('a', thread.text);
    link.href = '/b/' + encodeURIComponent(board) + '/' + thread._id;
    card.appendChild(link);
    card.appendChild(el('div', 'Created: ' + new Date(thread.created_on).toLocaleString() + ' · Replies: ' + thread.replycount, 'meta'));

    thread.replies.forEach(function (reply) {
      card.appendChild(el('div', reply.text, 'reply'));
    });

    const actions = el('div', undefined, 'actions');
    const report = el('button', 'Report thread');
    report.type = 'button';
    report.addEventListener('click', async function () {
      await fetch('/api/threads/' + encodeURIComponent(board), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ thread_id: thread._id })
      });
      report.disabled = true;
      report.textContent = 'Reported';
    });

    const remove = el('button', 'Delete thread');
    remove.type = 'button';
    remove.addEventListener('click', async function () {
      const password = window.prompt('Delete password:');
      if (password === null) return;
      const result = await fetch('/api/threads/' + encodeURIComponent(board), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ thread_id: thread._id, delete_password: password })
      });
      window.alert(await result.text());
      await loadThreads();
    });

    actions.append(report, remove);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const data = new FormData(form);
  await fetch('/api/threads/' + encodeURIComponent(board), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data)
  });
  form.reset();
  await loadThreads();
});

loadThreads().catch(function (error) {
  list.textContent = 'Unable to load threads: ' + error.message;
});
