
import { PrismaClient } from '@prisma/client'
import { cloudinaryConfigs } from '../lib/cloudinary'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      images: {
        contains: 'cloudinary'
      }
    },
    take: 10
  })

  console.log('--- Sample Products and their Image URLs ---')
  products.forEach(p => {
    console.log(`Product: ${p.title} (${p.id})`)
    try {
      const images = JSON.parse(p.images)
      console.log(`Images:`, images)
    } catch (e) {
      console.log(`Images (raw): ${p.images}`)
    }
    console.log('---')
  })

  console.log('--- Cloudinary Configs ---')
  console.log(cloudinaryConfigs)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
