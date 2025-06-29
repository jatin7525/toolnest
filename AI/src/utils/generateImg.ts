import 'dotenv/config';
import fetch from 'node-fetch';

/**
 * Generate an image from a prompt using Hugging Face Inference API.
 * Returns a data URL (Base64-encoded PNG).
 */
export const generateImage = async (
    model: string,
    prompt: string,
    opts: {
        model?: string;
        seed?: number;
        width?: number;
        height?: number;
        nologo?: boolean;
        enhance?: boolean;
    } = {}
): Promise<string> => {
    try {
        const params = new URLSearchParams({
            ...(opts.model && { model: opts.model }),
            ...(opts.seed != null && { seed: String(opts.seed) }),
            ...(opts.nologo && { nologo: 'true' }),
            ...(opts.enhance && { enhance: 'true' }),
            ...(opts.width && { width: String(opts.width) }),
            ...(opts.height && { height: String(opts.height) }),
        });
        console.log(`Generating image with model: ${model} and prompt: ${prompt}`);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
        const url2 = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?${params}`;
        const resp = await fetch(url2);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        const buf = Buffer.from(await blob.arrayBuffer());
        const b64 = buf.toString('base64');
        return b64.startsWith('data:image')
            ? b64
            : `data:image/png;base64,${b64}`;
    } catch (error) {
        console.error('Image generation error:', error);
        throw new Error('Failed to generate image');
    }
}