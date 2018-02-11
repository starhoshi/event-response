# event-response

[![npm version](https://badge.fury.io/js/event-response.svg)](https://badge.fury.io/js/event-response)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9ff0f9753f4c4217b20c5eec7b25f7af)](https://www.codacy.com/app/kensuke1751/event-response?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=starhoshi/event-response&amp;utm_campaign=Badge_Grade)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Background Functions の
[Background Functions](https://cloud.google.com/functions/docs/writing/background) の成功/失敗を記録したり、クライアント側に処理がどうなったか伝えたくないですか？

event-response は HTTP の status のようにわかりやすく成功/失敗を記録することができます。記録されたステータスを見てクライアント側で適切に対処することも可能です。

# Install

```
yarn install event-response
```

## succeeded

If Cound Functions succedded, set response.status = 'OK'.
HTTP say 200.

```ts
new EventResponse.Response(user).setOK()
```

TODO: image

## Bad Request

Cloud Functions failed Because parameter is invalid. Set response.status = 'BadRequest'. And you can set `id`, `error`.
HTTP say 400.

```ts
new EventResponse.Response(user).setBadRequest('error_id', 'error reason')
```

TODO: image

## Inernal Error

If , set response.status = 'BadRequest'. And you can set `id`, `error`.
HTTP say 400.

```ts
new EventResponse.Response(user).setInternalError('error_id', 'error reason')
```

TODO: image


## Usage

### 1. Initialize

Initialize event-response in your index.ts.

```ts
import * as EventResponse from 'event-response'
import * as functions from 'firebase-functions'

EventResponse.initialize(functions.config().firebase)
```

### 2. Call set method

* OK
    * HTTP でいう 200(正常に処理が終了)
* BadRequest
    * HTTP でいう 400(クライアント側で修正が必要な場合)
* InternalError
    * HTTP でいう 500(サーバ側でのエラー)

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

結果はこのように取得できます。

```ts
admin.firestore().doc('user/1000').get().then(s => {
  const user = s.data())
  const status = user.response.status
  const id = user.response.id
  const error = user.response.error
}
```
