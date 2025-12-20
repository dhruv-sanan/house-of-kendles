// generate-hash.js

const bcrypt = require('bcrypt');

// ---- ❗️ IMPORTANT ❗️ ----
// Put the password you want to use here.
const password = 'abc'; 
// -------------------------

const saltRounds = 12; // The cost factor

console.log('Attempting to generate hash for password...');

if (!password) {
  console.error('Error: Password is not set in the script. Please edit the file and add a password.');
  process.exit(1);
}

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }

  console.log('\n✅ Hash generated successfully!');
  console.log('------------------------------------------------------');
  console.log('Your password is:', password);
  console.log('Your bcrypt hash is:', hash);
  console.log('------------------------------------------------------');
  console.log('👉 Copy the hash and paste it into your .env.local file as ADMIN_HASH');
});