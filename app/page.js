"use client"
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [loading, setLoading] = useState("")
  const [streamResponse, setStreamResponse] = useState("")

  const handleChat = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      })
      const data = await response.json()
      setResponse(data.response)
    } catch (error) {
      setResponse("Error: " + error.message)
    }
    setLoading(false)
  }

  const handleStream = async () => {

    setStreaming(true)
    setStreamResponse("")
    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()


      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        const lines = chunk.split('\n')

        for (const line of lines) {

          if (line.startsWith("data: ")) {
            console.log("line", line);
            const dataStr = line.slice(6).trim()
            if (dataStr === "[DONE]") {
              return // Handle stream end
            }

            const data = JSON.parse(dataStr)

            console.log("line", line);

            console.log(data);
            setStreamResponse((prev) => prev + data.content)


          }
        }
      }
    }

    catch (error) {
      console.error("Stream error:", error)
      setStreamResponse("Error: " + error.message)
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 style={{ backgroundColor: "#d66835ff", border: "solid white 1px", padding: "10px 20px" }}>Get started with chaicode nextjs and AI</h1>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your awesome message"
          rows={6}
          style={{ width: "700px", marginBottom: "10px", border: "solid white 1px" }} />
      </div>
      <div>
        <button
          onClick={handleChat} style={{ padding: "10px 20px", backgroundColor: "rgba(227, 130, 61, 1)" }}>{loading ? "Loading..." : "Chat"}</button>


        <button
          onClick={handleStream} style={{ padding: "10px 20px", backgroundColor: "rgba(53, 92, 62, 1)" }}>{streaming ? "Streaming..." : "ChatStream"}</button>
      </div>
      <div style={{
        border: "1px solid #ccc",
        padding: " 10px",
        whiteSpace: "pre-wrap",
        fontSize: " 15px",
        width: "700px"
      }}>

        {response}
      </div>
      <div style={{
        border: "1px solid #ccc",
        padding: " 10px",
        whiteSpace: "pre-wrap",
        fontSize: " 15px",
        width: "700px"
      }}>

        {streamResponse}
      </div>
    </div>
  )
}
