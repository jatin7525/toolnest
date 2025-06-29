import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { HfInference } from '@huggingface/inference';
import { Request, Response } from 'express';
import { XMLParser } from 'fast-xml-parser';
import * as Utils from '../utils';
import * as Constants from '../constants';
import 'dotenv/config';
import * as fs from 'fs';

// configure a Genkit instance
const ai = genkit({
    plugins: [googleAI({
        apiKey: process.env.GEMINI_API_KEY  // or just googleAI()
    })],
    model: googleAI.model('gemini-2.5-flash'), // set default model
});

const hf = new HfInference(process.env.HF_TOKEN!);

export const orchestratedChat = async (prompt: string) => {
    let promptInput = Constants.PROMPTINPUT.replace('{{prompt}}', prompt);

    const { text } = await ai.generate({ prompt: promptInput });

    const parser = new XMLParser({ ignoreAttributes: false });

    try {
        const parsed = parser.parse(`<root>${text}</root>`);
        const root = parsed?.root || {};

        if (root.reply) return { mode: 'reply', payload: root.reply };
        if (root.search) return { mode: 'search', payload: root.search };
        if (root.error) return { mode: 'error', payload: `Error: ${root.error}` };

        // If neither tag is detected, fallback with raw
        return { mode: 'reply', payload: text.trim() || '[Empty reply]' };
    } catch (err) {
        console.error('⚠️ XML parsing failed:', err);
        return {
            mode: 'error',
            payload: err instanceof Error ? err.message : 'Unknown error',
        };
    }
};

export const geminiChat = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { prompt } = req.body;
    try {
        const { mode, payload } = await orchestratedChat(prompt);
        console.log('Mode:', mode);
        console.log('Payload:', payload);
        if (mode === 'error') {
            res.status(500).json({ error: payload });
            return;
        }
        if (mode === 'reply') {
            res.json({ result: payload });
            return;
        }

        if (mode === 'search') {
            const cacheKey = Utils.caching.SearchCache.generateKey(payload);
            const cached = Utils.caching.SearchCache.get(cacheKey);

            if (cached) {
                res.json({ result: cached });
                return;
            }

            const data = await Utils.Scraper.smartSearch(payload);

            if (!data) {
                res.status(404).json({ error: 'something went wrong' });
                return;
            }

            const followupPrompt = Constants.FOLLOEUPPROMPT
                .replace('{{prompt}}', prompt)
                .replace('{{data}}', data);

            const { text } = await ai.generate({
                model: gemini15Flash,
                prompt: followupPrompt
            });

            if (!text) {
                res.status(500).json({ error: 'something went wrong' });
                return;
            }

            Utils.caching.SearchCache.set(cacheKey, text);
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
        res.status(500).json({ error: 'something went wrong' });
    }
};

