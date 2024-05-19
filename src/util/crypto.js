import sha1 from 'crypto-js/sha1';
// import sha1 from './sha1';

// function sha1(msg) {
//   return crypto.createHash('sha1').update(msg, 'utf8').digest('hex');
// }

function sign(r, secret) {
  let R = '';

  const signTime = Math.trunc(Date.now() - Date.parse('2000/01/01'));
  // const signTime = parseInt(new Date().getTime());
  R = Object.keys(r)
    .sort()
    .map(k => `${k}=${r[k]}`)
    .join('&');
  R += `&SignTime=${signTime}`;
  r.SignTime = signTime;
  r.Sign = sha1(`${R}${secret}`).toString().toUpperCase();
  R += `&Sign=${r.Sign}`;

  console.log(`sign r:${JSON.stringify(r)} secret:${secret} R:${R}`);

  return R;
}

export {sha1, sign};
