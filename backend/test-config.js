import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://novox-blogs.onrender.com/api/config');
    const data = await res.json();
    console.log(JSON.stringify(data.novox_edtech.categories, null, 2));
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
