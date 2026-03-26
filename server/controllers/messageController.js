import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../configs/imageKit.js"
import openai from '../configs/openai.js'

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

        const { choices } = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: conversationHistory,
        });

        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false }
        res.json({ success: true, reply })

        chat.messages.push(reply)
        await chat.save()
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } })



    } catch (error) {
        const status = error?.status || error?.response?.status
        if (status === 429) {
            return res.json({ success: false, message: "AI rate limit reached. Please wait a moment and try again." })
        }
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