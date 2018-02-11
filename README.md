<p align="center">
    <img src="https://raw.githubusercontent.com/starhoshi/event-response/master/docs/logo.png" />
</p>

# event-response

[![npm version](https://badge.fury.io/js/event-response.svg)](https://badge.fury.io/js/event-response)
[![Build Status](https://travis-ci.org/starhoshi/event-response.svg?branch=master)](https://travis-ci.org/starhoshi/event-response)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9ff0f9753f4c4217b20c5eec7b25f7af)](https://www.codacy.com/app/kensuke1751/event-response?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=starhoshi/event-response&amp;utm_campaign=Badge_Grade)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

When you use Cloud Functions's [Background Functions](https://cloud.google.com/functions/docs/writing/background), have you ever wanted to record success / failure respond to the client side that it succeeded?

event-response is easy to understand like success status of HTTP and can record success / failure. It is also possible to handle it on the client side using the recorded status.

## Install

```
yarn install event-response
```

## Overview

### OK

When Cloud Functions completes successfully, call `setOK()`.

It is 200 in http.

```ts
new EventResponse.Response(user).setOK()
```

<img src="https://raw.githubusercontent.com/starhoshi/event-response/master/docs/ok.png" width='70%' />

### Bad Request

When Cloud Functions fails on client side problems such as invalid parameters, call `setBadRequest()`. And you can set `id`, `error`.

It is 400 in http.

```ts
new EventResponse.Response(user).setBadRequest('error_id', 'error reason')
```

<img src="https://raw.githubusercontent.com/starhoshi/event-response/master/docs/badrequest.png" width='70%' />

### Inernal Error

If an error occurs on the server side, call `setInternalError`. And you can set `id`, `error`.

It is 500 in http.

```ts
new EventResponse.Response(user).setInternalError('error_id', 'error reason')
```

<img src="https://raw.githubusercontent.com/starhoshi/event-response/master/docs/internal.png" width='70%' />


## Usage

This sample is written in TypeScript.

### 1. Initialize

Initialize event-response in your index.ts.

```ts
import * as EventResponse from 'event-response'
import * as functions from 'firebase-functions'

EventResponse.initialize(functions.config().firebase)
```

### 2. Call set method

You can set 3 pattens.

* OK
* BadRequest
* InternalError

```ts
exports.updateUser = functions.firestore.document('users/{userId}')
  .onCreate(async event => {
    if (!event.data.data().name) {
      return new EventResponse.Response(user).setBadRequest('NameNotFound', 'User.name not found')
    }

    try {
      await event.data.ref.update({name: 'new name'})
      await new EventResponse.Response(order.reference).setOK()
    } catch (error) {
      await new EventResponse.Response(user).setInternalError('NameUpdateFailed', error.toString())
      return Promise.reject(error)
    }

    return undefined
})
```

The result can be got as follows.

```ts
admin.firestore().doc('user/1000').get().then(s => {
  const user = s.data())
  const status = user.response.status
  const id = user.response.id
  const error = user.response.error
}
```

## Advanced

### Failure

TODO
