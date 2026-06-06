const fetch = require('node-fetch');

const run = async () => {
  try {
    // Need to login first or somehow bypass auth if we don't have a token.
    // Let's just send the request, maybe auth is not enforced or we'll see the error.
    const res = await fetch('http://localhost:8000/api/v1/courses/7a44fbc7-d3eb-4603-9118-2e06170d70eb/auto-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics_per_day: 3 })
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch (err) {
    console.error(err);
  }
};
run();
