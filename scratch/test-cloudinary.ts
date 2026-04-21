// Mock multiple configs
process.env.CLOUDINARY_URLS = 'cloudinary://111:aaa@cloud1,cloudinary://222:bbb@cloud2'

import { getRandomizedUrl, cloudinaryConfigs } from '../lib/cloudinary'

console.log('Configs:', cloudinaryConfigs)

const testUrls = [
    '/uploads/1765647365266_WhatsApp_Image.jpg',
    'https://res.cloudinary.com/drrp9ew1d/image/upload/v1774547096/greenvalleyseeds/1774547096279_IMG_20260326_224337.jpg',
    'https://res.cloudinary.com/drrp9ew1d/image/upload/v1/test.jpg',
    'https://res.cloudinary.com/drrp9ew1d/image/upload/v1234/greenvalleyseeds/greenvalleyseeds/another.jpg',
    null,
    'http://othersite.com/img.jpg'
]

console.log('--- Testing getRandomizedUrl ---')
testUrls.forEach(url => {
    console.log(`Original: ${url}`)
    console.log(`Randomized: ${getRandomizedUrl(url)}`)
    console.log('---')
})
