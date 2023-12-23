# journal.network

Journal Network is a place to reveal your innermost plans for a brilliant future for the world. Here's how it works:

1. Create a journal

2. Subscribe to an agenda

3. Post journal entries

4. Your subscribers are notified

5. People vote based on how well your journal entries support your agenda

6. Every agenda on an entry can be voted on at most once every hour

7. Each agenda has a leaderboard

The primary purpose of Journal Network is to allow the collective consciousness of the planet to discover itself.

Be a part of the transformation of humanity.

## Local development

You'll need 2 separate terminal windows or tabs to run the development environment.

### Terminal 1: Wrangler

First, in terminal 1, install dependencies and start CloudFlare Wrangler for local development:

```
npm install
npm start
```

Then, visit http://localhost:8788/ in a web browser

### Terminal 2: build or watch source files

In terminal 2, you need to rebuild TypeScript sources as you make changes locally.

To rebuild TypeScript sources once, run:

```
npm run build
```

To watch TypeScript sources and rebuild on change, run:

```
npm run build:watch
```
