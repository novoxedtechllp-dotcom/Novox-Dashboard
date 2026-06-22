import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/v1/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Arjun",
      phone: "9087678965",
      email: "arjun@gmail.com",
      source_name: "MERN Stack",
      stage: "NEW",
      course_id: "",
      assigned_sales_id: "",
      owner: "Sajad",
      note: "High probablity to be converted"
    })
  });
  
  const text = await res.text();
  console.log(res.status, text);
}
test();
