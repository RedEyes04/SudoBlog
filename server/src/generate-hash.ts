import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.log('Usage: npx tsx src/generate-hash.ts <password>')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)
console.log(`Password hash: ${hash}`)
console.log(`\nSet this in your .env file:`)
console.log(`ADMIN_PASSWORD_HASH=${hash}`)
