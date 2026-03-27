import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../configs/imageKit.js"

const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const parseJsonSafely = (value) => {
    try {
        return JSON.parse(value)
    } catch {
        return null
    }
}

const normalizeGeminiPayload = (payload) => Array.isArray(payload) ? payload[0] : payload

const createGeminiError = (status, payload, fallbackMessage) => {
    const normalizedPayload = normalizeGeminiPayload(payload)
    const message =
        normalizedPayload?.error?.message ||
        normalizedPayload?.message ||
        fallbackMessage ||
        `Gemini request failed with status ${status}`

    const error = new Error(message)
    error.status = status
    error.payload = normalizedPayload
    return error
}

const createGeminiChatCompletion = async (messages) => {
    if (!process.env.GEMINI_API_KEY) {
        throw createGeminiError(500, null, "GEMINI_API_KEY is missing on the server")
    }

    const response = await fetch(`${GEMINI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
            model: GEMINI_MODEL,
            messages,
        }),
    })

    const rawBody = await response.text()
    const payload = parseJsonSafely(rawBody)

    if (!response.ok) {
        throw createGeminiError(response.status, payload, rawBody)
    }

    const completion = normalizeGeminiPayload(payload)
    if (!completion?.choices?.[0]?.message) {
        throw createGeminiError(502, completion, "Gemini returned an unexpected response shape")
    }

    return completion
}

// Text-based AI chat message controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id

        // check credits
        if (req.user.credits < 1) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature" })
        }


        const { chatId, prompt } = req.body

        const chat = await Chat.findOne({ userId, _id: chatId })
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" })
        }
        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false })

        // Build conversation history for context, limit to last 10 messages to reduce token usage
        const MAX_CONTEXT_MESSAGES = 10;
        const conversationHistory = chat.messages
            .filter(m => !m.isImage)
            .slice(-MAX_CONTEXT_MESSAGES)
            .map(m => ({ role: m.role, content: m.content }))

        const { choices } = await createGeminiChatCompletion(conversationHistory)

        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false }
        res.json({ success: true, reply })

        chat.messages.push(reply)
        await chat.save()
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } })



    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Image Generation Message Controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        // check credits
        if (req.user.credits < 2) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature" })
        }
        const { prompt, chatId, isPublished } = req.body
        // Find chat
        const chat = await Chat.findOne({ userId, _id: chatId })
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" })
        }

        //push user message
        chat.messages.push({
            role: "user",
            content: prompt, timestamp: Date.now(), isImage: false
        });

        // Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        // construct Imgkit AI generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/Jarvis/${Date.now()}.png?tr=w-800,h-800`;

        // Trigger generation by fetching from Imgkit
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" })

        // convert to Base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`;

        // upload to imagkit media library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "Jarvis"
        })

        const reply = { role: 'assistant', content: uploadResponse.url, timestamp: Date.now(), isImage: true, isPublished }
        res.json({ success: true, reply })

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } })


    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
