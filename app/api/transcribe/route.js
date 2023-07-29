export async function POST(request) {
    const body = await request.formData();
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      method: "POST",
      body: body,
    });
    const json = await res.json();   
    return {
        body: json.text,
    };
}