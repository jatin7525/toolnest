import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { HfInference } from '@huggingface/inference';
import { Request, Response } from 'express';
import { XMLParser } from 'fast-xml-parser';
import * as Utils from '../utils';
import path from 'path';
import 'dotenv/config';

// configure a Genkit instance
const ai = genkit({
    plugins: [googleAI({
        apiKey: process.env.GEMINI_API_KEY  // or just googleAI()
    })],
    model: googleAI.model('gemini-2.5-flash'), // set default model
    promptDir: path.resolve(__dirname, '../prompts'), // directory for prompts
});

const hf = new HfInference(process.env.HF_TOKEN!);

export const orchestratedChat = async (prompt: string) => {
    const run = await ai.prompt('orchestratedChat');
    const { text } = await run({ prompt });
    const parser = new XMLParser();
    const parsed = parser.parse(`<root>${text}</root>`);
    const { search, reply } = parsed.root as any;

    if (reply) return { mode: 'reply', payload: reply };
    if (search) return { mode: 'search', payload: search };
    return { mode: 'reply', payload: text };
};


export const geminiChat = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { prompt } = req.body;
    try {
        const { mode, payload } = await orchestratedChat(prompt);
        if (mode === 'reply') {
            res.json({ result: payload });
            return;
        }

        if (mode === 'search') {
            const hits = await Utils.duckSearch(payload);
            const followupPrompt = hits.map(h => `${h.title}: ${h.url}`).join('\n');
            const { text } = await ai.generate({
                model: gemini15Flash,
                prompt: followupPrompt
            });
            res.json({ result: text });
            return;
        }

        res.json({ result: payload });
    } catch (e) {
        console.error('Chat generation error:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const geminiImage = async (
    req: Request,
    res: Response
) => {
    try {
        const { prompt } = req.body;
        const dataUrl = await Utils.generateImage(
            'runwayml/stable-diffusion-v1-5',
            prompt,
            {
                model: 'flux-realism',
                seed: Date.now() % 1e9,
                nologo: true,
                enhance: true,
                width: 360,
                height: 640,
            }
        );
        let imgPath = Utils.saveBase64ToPngSync(dataUrl);
        if (!imgPath) {
            res.status(500).json({ error: 'Failed to save image' });
            return;
        }
        // res.json({ image: imgPath });
        res.download(imgPath, (err) => {
            if (err) {
                console.error('Download error:', err);
                const statusCode = typeof err === 'object' && err !== null && 'status' in err ? (err as any).status : 500;
                res.status(statusCode).send('Error downloading file');
            } else {
                console.log(`${imgPath} downloaded`);
            }
        });
        return;
    } catch (e) {
        console.error('Image generation error:', e);
        res.status(500).json({ error: 'Image generation failed' });
    }
};

