import * as admin from 'firebase-admin'
import * as EventResponse from '../event-response'
import 'jest'

jest.setTimeout(20000)
beforeAll(() => {
  const serviceAccount = require('../../sandbox-329fc-firebase-adminsdk.json')
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
  EventResponse.initialize(admin.firestore())
})

const errorID = 'id'
const errorError = 'error'
const collectionPath = 'version/1/failure'
let user: FirebaseFirestore.DocumentReference

beforeEach(async () => {
  user = await admin.firestore().collection('user').add({ name: 'test' })
})

const expectOK = async (result: EventResponse.IResult, ref: FirebaseFirestore.DocumentReference, id?: string) => {
  expect(result.status).toEqual(EventResponse.Status.OK)
  expect(result.id).toBe(id)
  expect(result.message).toBeUndefined()

  const updatedUser = await admin.firestore().doc(ref.path).get().then(s => s.data()!.result) as EventResponse.IResult
  expect(updatedUser.status).toBe(EventResponse.Status.OK)
  expect(updatedUser.id).toBe(id)
  expect(updatedUser.message).toBeUndefined()
}

const expectError = async (status: EventResponse.Status, result: EventResponse.IResult, ref: FirebaseFirestore.DocumentReference, id?: string, error?: string) => {
  expect(result.status).toEqual(status)
  expect(result.id).toBe(id)
  expect(result.message).toBe(error)

  const updatedUser = await admin.firestore().doc(ref.path).get().then(s => s.data()!.result) as EventResponse.IResult
  expect(updatedUser.status).toBe(status)
  expect(updatedUser.id).toBe(id)
  expect(updatedUser.message).toBe(error)
}

describe('setOK', async () => {
  describe('id is undefined', () => {
    test('result: ok and id is undefined', async () => {
      const result = await new EventResponse.Result(user).setOK()
      await expectOK(result, user)
    })
  })

  describe('id is set', () => {
    test('result: ok and id is set', async () => {
      const result = await new EventResponse.Result(user).setOK('success')
      await expectOK(result, user, 'success')
    })
  })
})

/**
 * Bad Request and Internal Error use same internal function.
 * Because setBadRequest test is small.
 */
describe('setBadRequest', async () => {
  describe('error is undefined', () => {
    test('set Bad Request', async () => {
      const result = await new EventResponse.Result(user).setBadRequest(errorID)
      await expectError(EventResponse.Status.BadRequest, result, user, errorID, undefined)
    })
  })
})

describe('setInternalError', async () => {
  describe('error is undefined', () => {
    test('set Internal Error', async () => {
      const result = await new EventResponse.Result(user).setInternalError(errorID)
      await expectError(EventResponse.Status.InternalError, result, user, errorID, undefined)
    })
  })

  test('set Internal Error', async () => {
    const result = await new EventResponse.Result(user).setInternalError(errorID, errorError)
    await expectError(EventResponse.Status.InternalError, result, user, errorID, errorError)
  })
})
