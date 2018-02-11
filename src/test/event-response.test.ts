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
    },
    {
      collectionPath: 'version/1/failure'
    }
  )
})

let user: FirebaseFirestore.DocumentReference
beforeEach(async () => {
  user = await admin.firestore().collection('user').add({ name: 'test' })
})

const step = 'step'

// describe('clearCompleted', () => {
//   test('clear', async () => {
//     let order = new Model.SampleOrder()
//     const neoTask = new Retrycf.NeoTask()
//     const completed = { [step]: true }
//     neoTask.completed = completed
//     order.neoTask = neoTask.rawValue()
//     await order.save()

//     expect(order.neoTask!.completed![step]).toEqual(true)

//     // chack callback order
//     order = await Retrycf.NeoTask.clearCompleted(order)
//     expect(order.neoTask!.completed).toBeUndefined()

//     const fetchedOrder = await Model.SampleOrder.get(order.id) as Model.SampleOrder
//     expect(fetchedOrder.neoTask!.completed).toBeUndefined()
//   })
// })

// describe('isCompleted', async () => {
//   let order: Model.SampleOrder
//   beforeEach(async () => {
//     order = new Model.SampleOrder()
//   })
//   describe('when neoTask is undefined', () => {
//     test('false', async () => {
//       order.neoTask = undefined
//       expect(Retrycf.NeoTask.isCompleted(order, 'step')).toEqual(false)
//     })
//   })

//   describe('when step is not completed', () => {
//     test('false', async () => {
//       const completed = { 'other': true }
//       const neoTask = new Retrycf.NeoTask()
//       neoTask.completed = completed
//       order.neoTask = neoTask.rawValue()

//       expect(Retrycf.NeoTask.isCompleted(order, 'step')).toEqual(false)
//     })
//   })

//   describe('when step is completed', () => {
//     test('true', async () => {
//       const completed = { [step]: true }
//       const neoTask = new Retrycf.NeoTask()
//       neoTask.completed = completed
//       order.neoTask = neoTask.rawValue()

//       expect(Retrycf.NeoTask.isCompleted(order, 'step')).toEqual(true)
//     })
//   })
// })

// describe('setRetry', async () => {
//   let order: Model.SampleOrder
//   beforeEach(async () => {
//     order = new Model.SampleOrder()
//     await order.save()
//   })

//   describe('when retry count is undefined', () => {
//     test('retry added and count is 1', async () => {
//       order.neoTask = undefined
//       const updatedOrder = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//       expect(updatedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//       expect(updatedOrder.neoTask!.retry!.error).toEqual(['error'])
//       expect(updatedOrder.neoTask!.retry!.count).toEqual(1)

//       const fetchedOrder = await Model.SampleOrder.get(order.id) as Model.SampleOrder
//       expect(fetchedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//       expect(fetchedOrder.neoTask!.retry!.error).toEqual(['error'])
//       expect(fetchedOrder.neoTask!.retry!.count).toEqual(1)

//       // check Failure
//       const failures = await Retrycf.Failure.querySnapshot(fetchedOrder.reference.path)
//       expect(failures.docs.length).toEqual(1)
//       const failure = new Retrycf.Failure()
//       failure.init(failures.docs[0])
//       expect(failure.refPath).toEqual(fetchedOrder.reference.path)
//       expect(failure.neoTask.status).toEqual(fetchedOrder.neoTask!.status)
//     })
//   })

//   describe('when retry count is already exist', () => {
//     test('count is 2', async () => {
//       order.neoTask = undefined
//       const updated1Order = await Retrycf.NeoTask.setRetry(order, 'step', 'error1')
//       const updated2Order = await Retrycf.NeoTask.setRetry(order, 'step', 'error2')
//       expect(updated2Order.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//       expect(updated2Order.neoTask!.retry!.error).toEqual(['error1', 'error2'])
//       expect(updated2Order.neoTask!.retry!.count).toEqual(2)

//       const fetchedOrder = await Model.SampleOrder.get(order.id) as Model.SampleOrder
//       expect(fetchedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//       expect(fetchedOrder.neoTask!.retry!.error).toEqual(['error1', 'error2'])
//       expect(fetchedOrder.neoTask!.retry!.count).toEqual(2)

//       // check Failure
//       const failures = await Retrycf.Failure.querySnapshot(fetchedOrder.reference.path)
//       expect(failures.docs.length).toEqual(1)
//       const failure = new Retrycf.Failure()
//       failure.init(failures.docs[0])
//       expect(failure.refPath).toEqual(fetchedOrder.reference.path)
//       expect(failure.neoTask.status).toEqual(fetchedOrder.neoTask!.status)
//     })
//   })
// })

// describe('setInvalid', async () => {
//   let order: Model.SampleOrder
//   beforeEach(async () => {
//     order = new Model.SampleOrder()
//     await order.save()
//   })

//   test('set invalid', async () => {
//     order.neoTask = undefined

//     const validationError = new Retrycf.ValidationError('errortype', 'reason')
//     const updatedOrder = await Retrycf.NeoTask.setInvalid(order, validationError)
//     expect(updatedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//     expect(updatedOrder.neoTask!.invalid!.validationError).toEqual('errortype')
//     expect(updatedOrder.neoTask!.invalid!.reason).toEqual('reason')

//     const fetchedOrder = await Model.SampleOrder.get(order.id) as Model.SampleOrder
//     expect(updatedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//     expect(updatedOrder.neoTask!.invalid!.validationError).toEqual('errortype')
//     expect(updatedOrder.neoTask!.invalid!.reason).toEqual('reason')
//   })
// })

// describe('setFatal', async () => {
//   let order: Model.SampleOrder
//   beforeEach(async () => {
//     order = new Model.SampleOrder()
//     await order.save()
//   })

//   test('set fatal', async () => {
//     order.neoTask = undefined
//     const updatedOrder = await Retrycf.NeoTask.setFatal(order, 'step', 'error')
//     expect(updatedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//     expect(updatedOrder.neoTask!.fatal!.error).toEqual('error')
//     expect(updatedOrder.neoTask!.fatal!.step).toEqual('step')

//     const fetchedOrder = await Model.SampleOrder.get(order.id) as Model.SampleOrder
//     expect(fetchedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//     expect(fetchedOrder.neoTask!.fatal!.error).toEqual('error')
//     expect(fetchedOrder.neoTask!.fatal!.step).toEqual('step')

//     // check Failure
//     const failures = await Retrycf.Failure.querySnapshot(fetchedOrder.reference.path)
//     expect(failures.docs.length).toEqual(1)
//     const failure = new Retrycf.Failure()
//     failure.init(failures.docs[0])
//     expect(failure.refPath).toEqual(fetchedOrder.reference.path)
//     expect(failure.neoTask.status).toEqual(fetchedOrder.neoTask!.status)
//   })
// })

// describe('setFatal', async () => {
//   let order: Model.SampleOrder
//   beforeEach(async () => {
//     order = new Model.SampleOrder()
//     await order.save()
//   })

//   test('set fatal', async () => {
//     order.neoTask = undefined
//     const updatedOrder = await Retrycf.NeoTask.setFatal(order, 'step', 'error')
//     expect(updatedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//     expect(updatedOrder.neoTask!.fatal!.error).toEqual('error')
//     expect(updatedOrder.neoTask!.fatal!.step).toEqual('step')

//     const fetchedOrder = await Model.SampleOrder.get(order.id) as Model.SampleOrder
//     expect(fetchedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.failure)
//     expect(fetchedOrder.neoTask!.fatal!.error).toEqual('error')
//     expect(fetchedOrder.neoTask!.fatal!.step).toEqual('step')

//     // check Failure
//     const failures = await Retrycf.Failure.querySnapshot(fetchedOrder.reference.path)
//     expect(failures.docs.length).toEqual(1)
//     const failure = new Retrycf.Failure()
//     failure.init(failures.docs[0])
//     expect(failure.refPath).toEqual(fetchedOrder.reference.path)
//     expect(failure.neoTask.status).toEqual(fetchedOrder.neoTask!.status)
//   })
// })

// describe('getRetryCount', async () => {
//   let order: Model.SampleOrder
//   beforeEach(async () => {
//     order = new Model.SampleOrder()
//     await order.save()
//   })

//   describe('when neotask is undefined', () => {
//     test('undefined', async () => {
//       order.neoTask = undefined
//       expect(Retrycf.NeoTask.getRetryCount(order)).toBeUndefined()
//     })
//   })

//   describe('when retry set', () => {
//     test('one', async () => {
//       order.neoTask = undefined
//       const updatedOrder = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//       expect(Retrycf.NeoTask.getRetryCount(order)).toEqual(1)
//     })
//   })
// })

// describe('getRetryCount', async () => {
//   let order: Model.SampleOrder
//   let preOrder: Model.SampleOrder
//   beforeEach(async () => {
//     order = new Model.SampleOrder()
//     preOrder = new Model.SampleOrder()
//     await order.save()
//     await preOrder.save()
//   })

//   describe('current order retry count is undefined', () => {
//     test('false', async () => {
//       order.neoTask = undefined

//       expect(Retrycf.NeoTask.shouldRetry(order, undefined)).toEqual(false)
//     })
//   })

//   describe('current order retry count is over 3', () => {
//     test('false', async () => {
//       order.neoTask = undefined
//       order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//       order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//       order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')

//       expect(Retrycf.NeoTask.shouldRetry(order, undefined)).toEqual(false)
//     })
//   })

//   describe('current order retry count is under 2 and previous count is undefined', () => {
//     test('true', async () => {
//       order.neoTask = undefined
//       order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//       order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')

//       expect(Retrycf.NeoTask.shouldRetry(order, undefined)).toEqual(true)
//     })
//   })

//   describe('current order retry count is 2 and previous count is 1', () => {
//     test('true', async () => {
//       order.neoTask = undefined
//       order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//       order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')

//       preOrder.neoTask = undefined
//       preOrder = await Retrycf.NeoTask.setRetry(preOrder, 'step', 'error')

//       expect(Retrycf.NeoTask.shouldRetry(order, preOrder)).toEqual(true)
//     })
//   })

//   describe('current order retry count is 1 and previous count is 2', () => {
//     test('false', async () => {
//       order.neoTask = undefined
//       order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')

//       preOrder.neoTask = undefined
//       preOrder = await Retrycf.NeoTask.setRetry(preOrder, 'step', 'error')
//       preOrder = await Retrycf.NeoTask.setRetry(preOrder, 'step', 'error')

//       expect(Retrycf.NeoTask.shouldRetry(order, preOrder)).toEqual(false)
//     })
//   })
// })

// describe('setFatalIfRetryCountIsMax', async () => {
//   let order: Model.SampleOrder
//   let preOrder: Model.SampleOrder
//   beforeEach(async () => {
//     order = new Model.SampleOrder()
//     preOrder = new Model.SampleOrder()
//     await order.save()
//     await preOrder.save()
//   })

//   describe('current retry count is undefined', () => {
//     test('failure not set', async () => {
//       order.neoTask = undefined

//       await Retrycf.NeoTask.setFatalIfRetryCountIsMax(order, undefined)
//       const failures = await Retrycf.Failure.querySnapshot(order.reference.path)
//       expect(failures.docs.length).toEqual(0)
//     })
//   })

//   describe('current and previous retry count is undefined', () => {
//     test('failure not set', async () => {
//       order.neoTask = undefined
//       preOrder.neoTask = undefined

//       await Retrycf.NeoTask.setFatalIfRetryCountIsMax(order, preOrder)
//       const failures = await Retrycf.Failure.querySnapshot(order.reference.path)
//       expect(failures.docs.length).toEqual(0)
//     })
//   })

//   describe('only previous retry count is undefined', () => {
//     test('fatal not set', async () => {
//       order.neoTask = undefined
//       order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//       preOrder.neoTask = undefined

//       await Retrycf.NeoTask.setFatalIfRetryCountIsMax(order, preOrder)

//       const failures = await Retrycf.Failure.querySnapshot(order.reference.path)
//       const failure = new Retrycf.Failure()
//       failure.init(failures.docs[0])
//       expect(failure.neoTask.fatal).toBeUndefined()
//     })
//   })

//   describe('both current and previous are not undefined', () => {
//     describe('current retry count is over MAX', () => {
//       describe('current retry count > prevous retry count', () => {
//         test('fatal set', async () => {
//           order.neoTask = undefined
//           order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//           order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//           order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//           order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//           preOrder.neoTask = undefined
//           preOrder = await Retrycf.NeoTask.setRetry(preOrder, 'step', 'error')
//           preOrder = await Retrycf.NeoTask.setRetry(preOrder, 'step', 'error')
//           preOrder = await Retrycf.NeoTask.setRetry(preOrder, 'step', 'error')

//           order = await Retrycf.NeoTask.setFatalIfRetryCountIsMax(order, preOrder)
//           expect(order.neoTask!.fatal!.step).toEqual('retry_failed')
//           expect(order.neoTask!.fatal!.error).toEqual('retry failed')

//           const failures = await Retrycf.Failure.querySnapshot(order.reference.path)
//           const failure = new Retrycf.Failure()
//           failure.init(failures.docs[0])

//           expect(failure.neoTask.fatal!.step).toEqual('retry_failed')
//           expect(failure.neoTask.fatal!.error).toEqual('retry failed')
//         })
//       })

//       describe('current retry count < prevous retry count', () => {
//         test('fatal not set', async () => {
//           order.neoTask = undefined
//           order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//           preOrder.neoTask = undefined
//           preOrder = await Retrycf.NeoTask.setRetry(preOrder, 'step', 'error')
//           preOrder = await Retrycf.NeoTask.setRetry(preOrder, 'step', 'error')

//           await Retrycf.NeoTask.setFatalIfRetryCountIsMax(order, preOrder)

//           const failures = await Retrycf.Failure.querySnapshot(order.reference.path)
//           const failure = new Retrycf.Failure()
//           failure.init(failures.docs[0])
//           expect(failure.neoTask.fatal).toBeUndefined()
//         })
//       })
//     })

//     describe('current retry count is under MAX', () => {
//       test('fatal not set', async () => {
//         order.neoTask = undefined
//         order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//         order = await Retrycf.NeoTask.setRetry(order, 'step', 'error')
//         preOrder.neoTask = undefined
//         preOrder = await Retrycf.NeoTask.setRetry(preOrder, 'step', 'error')

//         await Retrycf.NeoTask.setFatalIfRetryCountIsMax(order, preOrder)

//         const failures = await Retrycf.Failure.querySnapshot(order.reference.path)
//         const failure = new Retrycf.Failure()
//         failure.init(failures.docs[0])
//         expect(failure.neoTask.fatal).toBeUndefined()
//       })
//     })
//   })
// })

describe('setOK', async () => {
  describe('id is undefined', () => {
    test('response: ok', async () => {
      const response = await new EventResponse.Response(user).setOK()
      expect(response.status).toEqual(EventResponse.Status.OK)

      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data())
      expect(updatedUser!.response.status).toBe(EventResponse.Status.OK)
      expect(updatedUser!.response.id).toBeUndefined()
      expect(updatedUser!.response.errors).toBeUndefined()
    })
  })
})

describe('setFailure', async () => {
    test('response: error and failure was set', async () => {
      const response = await new EventResponse.Response(user).setInternalError('id', 'error')
      expect(response.status).toEqual(EventResponse.Status.InternalError)

      const updatedUser = await admin.firestore().doc(user.path).get().then(s => s.data())
      expect(updatedUser!.response.status).toBe(EventResponse.Status.InternalError)
      expect(updatedUser!.response.id).toBe('id')
      expect(updatedUser!.response.error).toBe('error')
    })
})

//   describe('failure not exists', () => {
//     test('success', async () => {
//       order.neoTask = undefined
//       order = await Retrycf.NeoTask.setSuccess(order)
//       expect(order.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.success)

//       const fetchedOrder = await Model.SampleOrder.get(order.id) as Model.SampleOrder
//       expect(fetchedOrder.neoTask!.status).toEqual(Retrycf.NeoTaskStatus.success)
//     })
//   })
// })
