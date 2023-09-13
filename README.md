# bun-router

Extremely basic and simple router module for [Bun](https://butn.sh).

## Usage

```js
import Router from 'bun-conductor'
const router = new Router();

router.serveAPI();
router.post('path', handler);

Bun.serve({
  fetch(req) { return router.handle(req); },
});
```

The `handler` must return a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response) object.

## Static Files

Allows a folder to be served as static files.

```js
import Router from 'bun-conductor'
const router = new Router();

router.serveClient('client');

Bun.serve({
  fetch(req) { return router.handle(req); },
});
```

## Sub Paths

```js
import Router from 'bun-conductor'
const router = new Router();

// Define the new router
const testRouter = new Router();
testRouter.get('hello-world', () => {
  return new Response('Hello World from /api/test/hello-world');
})

// Define the new segment and its router
router.use('test', testRouter)

// Serve the API
router.serveAPI();

// Run the server
Bun.serve({
  fetch(req) { return router.handle(req); },
});
```
