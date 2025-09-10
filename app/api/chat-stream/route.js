import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})



export async function POST(request) {
    try {
        const { message } = await request.json()
        console.log("Received message:", message)

        const stream = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: message
            }],
            stream: true
        })

        const encoder = new TextEncoder()

        const readable = new ReadableStream({
            async start(controller) {

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || ""


                    if (content) {
                        // Send as simple JSON string
                        const data = `data: ${JSON.stringify({ content })}\n\n`
                        controller.enqueue(encoder.encode(data))
                    }
                }
                // Send done signal
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
                controller.close()

            }
        })

        return new Response(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                // "Access-Control-Allow-Origin": "*",
                // "Access-Control-Allow-Methods": "POST",
                // "Access-Control-Allow-Headers": "Content-Type"
            }
        })
    } catch (error) {
        console.error("API Error:", error)
        return Response.json({
            error: "Failed to process request",
            details: error.message
        }, {
            status: 500
        })
    }
}