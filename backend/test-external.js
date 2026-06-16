import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://novox-blogs.onrender.com/api/blogs');
    console.log('Status:', res.status);
    console.log('Headers:', res.headers.raw());
    const text = await res.text();
    console.log('Body:', text.substring(0, 500));
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
