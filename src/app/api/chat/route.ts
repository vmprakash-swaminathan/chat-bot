import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
      return NextResponse.json(
        { reply: "Groq API key is missing. Please configure GROQ_API_KEY in .env.local and restart the server." },
        { status: 500 }
      );
    }

    const messages = history.map((msg: any) => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.content
    }));

    messages.push({ role: "user", content: message });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", // Found in user's active model list
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", data);
      throw new Error(data.error?.message || "Failed to fetch from Groq");
    }

    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
