import * as admin from 'firebase-admin'
import * as EventResponse from '../event-response'
import 'jest'

jest.setTimeout(20000)
beforeAll(() => {
  const serviceAccount = require('../../sandbox-329fc-firebase-adminsdk.json')
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
  EventResponse.initialize(
    {
      projectId: 'sandbox-329fc',
      keyFilename: './sandbox-329fc-firebase-adminsdk.json'
    }
  )
})

const errorID = 'id'
const errorError = 'error'
const collectionPath = 'version/1/failure'
let user: FirebaseFirestore.DocumentReference

beforeEach(async () => {
  user = await admin.firestore().collection('user').add({ name: 'test' })
})
beforeAll(async () => {
  EventResponse.configure({ collectionPath: collectionPath })
})

const expectOK = async (response: EventResponse.IResponse, ref: FirebaseFirestore.DocumentReference, id?: string) => {
  expect(response.status).toEqual(EventResponse.Status.OK)
  expect(response.id).toBe(id)
  expect(response.error).toBeUndefined()

  const updatedUser = await admin.firestore().doc(ref.path).get().then(s => s.data())
  expect(updatedUser!.response.status).toBe(EventResponse.Status.OK)
  expect(updatedUser!.response.id).toBe(id)
  expect(updatedUser!.response.error).toBeUndefined()
}

const expectError = async (status: EventResponse.Status, response: EventResponse.IResponse, ref: FirebaseFirestore.DocumentReference, id?: string, error?: any) => {
  expect(response.status).toEqual(status)
  expect(response.id).toBe(id)
  expect(response.error).toBe(error)

  const updatedUser = await admin.firestore().doc(ref.path).get().then(s => s.data())
  expect(updatedUser!.response.status).toBe(status)
  expect(updatedUser!.response.id).toBe(id)
  expect(updatedUser!.response.error).toBe(error)
}

const expectFailureIsEmpty = async (ref: FirebaseFirestore.DocumentReference) => {
  const querySnapshot = await admin.firestore().collection(collectionPath).where('refPath', '==', ref.path).get()
  expect(querySnapshot.docs.length).toBe(0)
}

describe('setOK', async () => {
  describe('id is undefined', () => {
    test('response: ok and id is undefined', async () => {
      const response = await new EventResponse.Response(user).setOK()
      await expectOK(response, user)
    })
  })

  describe('id is set', () => {
    test('response: ok and id is set', async () => {
      const response = await new EventResponse.Response(user).setOK('success')
      await expectOK(response, user, 'success')
    })
  })

  describe('EventResponse.collectionPath exist', async () => {
    test('failure is empty', async () => {
      let response = await new EventResponse.Response(user).setBadRequest(errorID)
      response = await new EventResponse.Response(user).setOK()
      await expectOK(response, user)
      await expectFailureIsEmpty(user)
    })
  })

  describe('EventResponse.collectionPath is undefined', async () => {
    beforeAll(() => {
      EventResponse.configure({collectionPath: undefined})
    })
    afterAll(() => {
      EventResponse.configure({collectionPath: collectionPath})
    })

    test('failure is empty', async () => {
      let response = await new EventResponse.Response(user).setBadRequest(errorID)
      response = await new EventResponse.Response(user).setOK()
      await expectOK(response, user)
      await expectFailureIsEmpty(user)
    })
  })
})

/**
 * Bad Request and Internal Error use same internal function.
 * Because setBadRequest test is small.
 */
describe('setBadRequest', async () => {
  describe('error is undefined', () => {
    test('set Bad Request and created Failure', async () => {
      const response = await new EventResponse.Response(user).setBadRequest(errorID)
      await expectError(EventResponse.Status.BadRequest, response, user, errorID, undefined)

      const querySnapshot = await admin.firestore().collection(collectionPath).where('refPath', '==', user.path).get()
      expect(querySnapshot.docs.length).toBe(1)
      const failure = querySnapshot.docs[0].data() as EventResponse.IFailure
      expect(failure.createdAt).toBeDefined()
      expect(failure.refPath).toBe(user.path)
      expect(failure.errors[0].createdAt).toBeDefined()
      expect(failure.errors[0].response).toEqual(response)
    })
  })
})

describe('setInternalError', async () => {
  describe('error is undefined', () => {
    test('set Internal Error and created Failure', async () => {
      const response = await new EventResponse.Response(user).setInternalError(errorID)
      await expectError(EventResponse.Status.InternalError, response, user, errorID, undefined)

      const querySnapshot = await admin.firestore().collection(collectionPath).where('refPath', '==', user.path).get()
      expect(querySnapshot.docs.length).toBe(1)
      const failure = querySnapshot.docs[0].data() as EventResponse.IFailure
      expect(failure.createdAt).toBeDefined()
      expect(failure.refPath).toBe(user.path)
      expect(failure.errors[0].createdAt).toBeDefined()
      expect(failure.errors[0].response).toEqual(response)
    })
  })

  describe('EventResponse.collectionPath exist', async () => {
    test('set Internal Error and created Failure', async () => {
      const response = await new EventResponse.Response(user).setInternalError(errorID, errorError)
      await expectError(EventResponse.Status.InternalError, response, user, errorID, errorError)

      const querySnapshot = await admin.firestore().collection(collectionPath).where('refPath', '==', user.path).get()
      expect(querySnapshot.docs.length).toBe(1)
      const failure = querySnapshot.docs[0].data() as EventResponse.IFailure
      expect(failure.createdAt).toBeDefined()
      expect(failure.refPath).toBe(user.path)
      expect(failure.errors[0].createdAt).toBeDefined()
      expect(failure.errors[0].response).toEqual(response)
    })

    describe('multiple set error', async () => {
      test('error count is 3', async () => {
        let response = await new EventResponse.Response(user).setInternalError(errorID, errorError)
        response = await new EventResponse.Response(user).setInternalError(errorID, errorError)
        response = await new EventResponse.Response(user).setInternalError(errorID, errorError)
        await expectError(EventResponse.Status.InternalError, response, user, errorID, errorError)

        const querySnapshot = await admin.firestore().collection(collectionPath).where('refPath', '==', user.path).get()
        expect(querySnapshot.docs.length).toBe(1)
        const failure = querySnapshot.docs[0].data() as EventResponse.IFailure
        expect(failure.createdAt).toBeDefined()
        expect(failure.refPath).toBe(user.path)
        expect(failure.errors.length).toBe(3)
      })
    })
  })

  describe('EventResponse.collectionPath does not exist', async () => {
    beforeAll(() => {
      EventResponse.configure({collectionPath: undefined})
    })
    afterAll(() => {
      EventResponse.configure({collectionPath: collectionPath})
    })

    test('set Internal Error but not created Failure', async () => {
      const response = await new EventResponse.Response(user).setInternalError(errorID, errorError)
      await expectError(EventResponse.Status.InternalError, response, user, errorID, errorError)
      await expectFailureIsEmpty(user)
    })
  })
})
