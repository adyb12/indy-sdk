var test = require('ava')
var indy = require('../')
var cuid = require('cuid')
var initTestPool = require('./helpers/initTestPool')

test('pairwise', async function (t) {
  var pool = await initTestPool()
  var wName = 'wallet-' + cuid()
  await indy.createWallet(pool.name, wName, 'default', null, null)
  var wh = await indy.openWallet(wName, null, null)

  var [theirDid, theirVerkey] = await indy.createAndStoreMyDid(wh, {})
  var [myDid] = await indy.createAndStoreMyDid(wh, {})
  await indy.storeTheirDid(wh, {did: theirDid, verkey: theirVerkey})

  t.deepEqual(await indy.listPairwise(wh), [])

  t.false(await indy.isPairwiseExists(wh, theirDid))

  await indy.createPairwise(wh, theirDid, myDid, 'wat')

  t.true(await indy.isPairwiseExists(wh, theirDid))

  t.deepEqual(await indy.listPairwise(wh), [
    {my_did: myDid, their_did: theirDid, metadata: 'wat'}
  ])

  t.deepEqual(await indy.getPairwise(wh, theirDid), {
    my_did: myDid,
    metadata: 'wat'
  })

  await indy.setPairwiseMetadata(wh, theirDid, 'hello new metadata')

  t.deepEqual(await indy.getPairwise(wh, theirDid), {
    my_did: myDid,
    metadata: 'hello new metadata'
  })

  await indy.closeWallet(wh)
  await indy.deleteWallet(wName, null)
  pool.cleanup()
})
