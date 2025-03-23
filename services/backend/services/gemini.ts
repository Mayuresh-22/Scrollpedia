// this class is like backbone of the application
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai"
import { Context } from "hono"
import { Variables } from "../src";

class GeminiService {
    genAI: GoogleGenerativeAI
    model: GenerativeModel | null
    constructor(c: Context<{ Bindings: CloudflareBindings; Variables: Variables }>) {
        this.genAI = new GoogleGenerativeAI(c.env.GEMINI_KEY);
        this.model = null;
    }

    /**
     * Get text embedding from Gemini AI
     * @param data any
     * @param model string (default: "gemini-embedding-exp-03-07" | "text-embedding-004")
     * @returns number[] embedding
     */
    async getTextEmbedding(data: any,
        model: string = "text-embedding-004",
    ): Promise<number[]> {
        const serializeText = JSON.stringify(data);
        this.model = this.genAI.getGenerativeModel({
            model
        });
        const result = await this.model.embedContent(serializeText);
        return result.embedding.values;
    }
}

export default GeminiService;
