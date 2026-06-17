import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing category fetch...');
  // Assuming the user is using the first website returned
  const websitesRes = await fetch('http://localhost:3000/api/gallery/websites');
  const websitesData = await websitesRes.json();
  const websiteId = websitesData.data[0].id;
  console.log('Website ID:', websiteId);
  
  const catRes = await fetch(`http://localhost:3000/api/gallery/categories?website_id=${websiteId}`);
  const catData = await catRes.json();
  console.log('Categories:', JSON.stringify(catData, null, 2));
}
test();
