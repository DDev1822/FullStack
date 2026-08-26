# Anonymous Message Board

Full-stack JavaScript implementation of the freeCodeCamp Information Security project using a local SQLite database.

## Setup

1. `cd anonymous-message-board`
2. `npm install`
3. Copy `sample.env` to `.env`.
4. Keep `DB=./data/messageboard.db` or change it to another local SQLite file path.
5. Run `npm start`.

No MongoDB server, Atlas account, database user, password, or internet connection is required for the database. The `data` directory and SQLite database file are created automatically on first run and are ignored by Git.

Set `NODE_ENV=test` when you want the built-in freeCodeCamp-style functional test runner to execute. You can also run `npm test`.

## API behavior

- `POST /api/threads/:board` creates a thread.
- `GET /api/threads/:board` returns the 10 most recently bumped threads and only the 3 most recent replies per thread.
- `DELETE /api/threads/:board` deletes a thread only when the password matches.
- `PUT /api/threads/:board` reports a thread.
- `POST /api/replies/:board` creates a reply and bumps the thread.
- `GET /api/replies/:board?thread_id=...` returns one thread with all replies.
- `DELETE /api/replies/:board` replaces a reply's text with `[deleted]` only when the password matches.
- `PUT /api/replies/:board` reports a reply.

Delete passwords are SHA-256 hashed before storage and are never included in API responses. The `reported` field is also kept private.
