import type { Context } from "koa";
import { analyzeImage } from "../services/gemini";


export default {
  async analyze(ctx : Context) {
    const file = ctx.request.files?.image as any;
    if (!file) return ctx.badRequest('No image file provided');

    const filepath = file.filepath;

    try {
      const result = await analyzeImage(filepath);
      return ctx.send({success: true, data: result});
    } catch (error) {
      ctx.internalServerError('Failed to analyze image',{error: error.message});
    }
  }
}