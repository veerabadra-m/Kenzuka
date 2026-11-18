import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from './models/Product.js'

dotenv.config()

const selectedIds = [
  '6afb2596f7164639006c4898',
  '6afb2551f7164639006c4885',
  '6afb24e3f7164639006c4860',
  '6af86c0c8a7ac6232278c4a2',
  '6af86b918a7ac6232278c49b',
  '6af86afe8a7ac6232278c494',
  '6af869758a7ac6232278c48d',
]

const excludedId = '6af869178a7ac6232278c486'
const allTargetIds = [...selectedIds, excludedId]

async function migrate() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from server/.env')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB.')

    const targets = await Product.find({
      _id: { $in: allTargetIds },
    }).select('_id name isActive showIn3D')

    if (targets.length !== 8) {
      throw new Error(`Expected 8 products, but found ${targets.length}. No updates made.`)
    }

    const foundIds = new Set(targets.map(product => product._id.toString()))

    for (const id of allTargetIds) {
      if (!foundIds.has(id)) {
        throw new Error(`Product ${id} was not found. No updates made.`)
      }
    }

    const inactive = targets.filter(product => !product.isActive)
    if (inactive.length) {
      throw new Error(
        `Some target products are inactive: ${inactive.map(p => p.name).join(', ')}. No updates made.`
      )
    }

    const unexpected = await Product.find({
      showIn3D: true,
      _id: { $nin: allTargetIds },
    }).select('_id name')

    if (unexpected.length) {
      throw new Error(
        `Other products are already selected for 3D: ${unexpected.map(p => p.name).join(', ')}. No updates made.`
      )
    }

    console.log('\nProducts verified before migration:')
    for (const product of targets) {
      console.log(`- ${product.name} | ${product._id}`)
    }

    const selectedResult = await Product.updateMany(
      { _id: { $in: selectedIds } },
      { $set: { showIn3D: true } }
    )

    const excludedResult = await Product.updateOne(
      { _id: excludedId },
      { $set: { showIn3D: false } }
    )

    const verified = await Product.find({
      _id: { $in: allTargetIds },
    }).select('_id name showIn3D')

    const selectedCount = verified.filter(p => p.showIn3D).length
    const excluded = verified.find(p => p._id.toString() === excludedId)

    console.log('\n--- MIGRATION RESULT ---')
    console.log('Seven-product update matched:', selectedResult.matchedCount)
    console.log('Seven-product update modified:', selectedResult.modifiedCount)
    console.log('Panther update matched:', excludedResult.matchedCount)

    for (const product of verified) {
      console.log(`${product.showIn3D ? '[3D YES]' : '[3D NO]'} ${product.name}`)
    }

    if (selectedCount !== 7 || !excluded || excluded.showIn3D) {
      throw new Error('Final verification failed. Please inspect the database.')
    }

    console.log('\nSUCCESS: Exactly the seven intended products are selected.')
  } catch (error) {
    console.error('\nMIGRATION ERROR:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

migrate()
