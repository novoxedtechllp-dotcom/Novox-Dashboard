import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/v1/blogs');
    console.log('Status:', res.status);
    console.log('Headers:', res.headers.raw());
    const text = await res.text();
    console.log('Body:', text.substring(0, 100));
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
