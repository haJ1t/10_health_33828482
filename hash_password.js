const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = 'smiths';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password: smiths');
    console.log('Hash:', hash);
    
    const password2 = 'smiths123ABC$';
    const hash2 = await bcrypt.hash(password2, 10);
    console.log('\nPassword: smiths123ABC$');
    console.log('Hash:', hash2);
}

hashPassword();
