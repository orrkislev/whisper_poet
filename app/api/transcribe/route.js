export async function POST(req) {
  if (req.method === 'POST') {
    const body = await req.formData();
    const fetchRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      method: "POST",
      body: body,
    });
    const json = await fetchRes.json();
    console.log(json);
    return new Response(JSON.stringify(json), {
      status: 200,
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  }
}