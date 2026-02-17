process.env.UV_THREADPOOL_SIZE = 1;
const crypto = require('node:crypto');
const start = performance.now();
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
  console.log(performance.now() - start);
});
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
  console.log(performance.now() - start);
});
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
  console.log(performance.now() - start);
});
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
  console.log(performance.now() - start);
});
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
  console.log(performance.now() - start);
});
