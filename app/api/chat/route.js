import 'dotenv/config'
import { OpenAI } from "openai";




const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request) {

    try {
        const { message } = await request.json()

        const completion = await openai.chat.completions.create(({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: message
            }]
        }))
        return Response.json({
            response: completion.choices[0].message.content
        })
    } catch (error) {
        return Response.json({
            error: "Failed to process the request"
        },
            {
                status: 500
            })
    }
}