# Updated branch since getting feedback from issue below

Link to issue in PlayWright repo:
- https://github.com/microsoft/playwright/issues/29190

Documentation on `route.fallback` + `route.fulfill`:
- https://playwright.dev/docs/api/class-route#route-fallback
- https://playwright.dev/docs/api/class-route#route-fulfill

PlayWright tests demonstrating this:
- https://github.com/microsoft/playwright/commit/32034728ad1d03c9a012b80060f8e8353fa2aa4b?diff=unified&w=0

Original README below:

---

# PlayWright: HAR vs. Manual mocking

This repo was created to demonstrate an issue with HAR vs. Manual mocking in
PlayWright.

Link to issue in PlayWright repo:
- https://github.com/microsoft/playwright/issues/29190

## Problem

We wish to intercept and modify PlayWright HAR requests and responses.

There does not appear to be a way of doing this directly on `routeFromHAR`, so
this repo demonstrates an attempt to use both `page.route` and `routeFromHAR`
together.

Needless to say, the technique does not work.

```sh
npm i
npm test
```

## Use-case

The JSON RPC spec requires an `id` at the [root-level of a
request](https://www.jsonrpc.org/specification#request_object).

In our own JSON RPC implementation, we are using a randomly generated prefix
for our `id`s. They are generated on Application startup, and include an
incrementing counter as a suffix:

```javascript
const id = `${jsonRpcAppLoadId}_${requestCounter}`;
```

Unfortunately, a random value in a payload means the HAR feature of PlayWright
treats all requests as unique, and it will fail to load and serve a saved HAR
from file.

We're reluctant to change the way these `id`s are calculated because we have a
micro-frontend architecture. This means multiple apps could, in the same page,
call the same back-end APIs, and we'd like to ensure responses get routed to
the right requesters.

## Proposition

To either:

1. Permit the use of both `routeFromHAR` and `page.route` together.

2. To extend the `options` object of `routeFromHAR` with a handler in a similar
   way to `page.route` works.

Either solution would allow requests to be modified before the HAR files are
saved, and responses to also be modified after they have been loaded from file.
