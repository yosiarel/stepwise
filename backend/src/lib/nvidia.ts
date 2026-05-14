import OpenAI from 'openai';

const nvidiaApiKey = process.env.NVIDIA_API_KEY;

export const nvidiaClient = new OpenAI({
  apiKey:   nvidiaApiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export const NVIDIA_CV_MODEL = 'meta/llama-3.1-8b-instruct';
export const NVIDIA_ROADMAP_MODEL = 'openai/gpt-oss-120b';
