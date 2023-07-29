export async function POST(request) {
    console.log('aaa')
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      method: "POST",
      body: request.body,
    });
    const json = await res.json();   
    return {
        body: json.text,
    };
}