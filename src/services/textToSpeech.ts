import http from 'http';
import https from 'https';
import { PassThrough } from 'stream';

const GOOGLE_TTS_HOST = 'https://translate.google.com';
const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;

const getTextToSpeechUrl = (text: string, lang = 'en', slow = false): string => {
  if (text.length === 0) {
    throw new Error('Text-to-speech text cannot be empty.');
  }

  if (text.length > 200) {
    throw new Error('Text-to-speech text must be 200 characters or less.');
  }

  const params = new URLSearchParams({
    ie: 'UTF-8',
    q: text,
    tl: lang,
    total: '1',
    idx: '0',
    textlen: String(text.length),
    client: 'tw-ob',
    prev: 'input',
    ttsspeed: slow ? '0.24' : '1'
  });

  return `${GOOGLE_TTS_HOST}/translate_tts?${params.toString()}`;
};

const fetchAudioStream = async (url: string, redirectsRemaining = MAX_REDIRECTS): Promise<PassThrough> =>
  await new Promise((resolve, reject) => {
    const transport = url.startsWith('https://') ? https : http;

    const request = transport.get(
      url,
      {
        headers: {
          Accept: 'audio/mpeg,*/*',
          'User-Agent': 'Mozilla/5.0'
        }
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;

        if (
          REDIRECT_STATUS_CODES.has(statusCode) &&
          response.headers.location &&
          redirectsRemaining > 0
        ) {
          response.resume();
          resolve(fetchAudioStream(new URL(response.headers.location, url).toString(), redirectsRemaining - 1));
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          reject(new Error(`Text-to-speech request failed with status ${statusCode}.`));
          return;
        }

        const stream = new PassThrough();
        response.on('error', (error) => stream.destroy(error));
        response.pipe(stream);
        resolve(stream);
      }
    );

    request.on('error', reject);
  });

export const getTextToSpeechStream = async (
  text: string,
  options?: {
    lang?: string;
    slow?: boolean;
  }
): Promise<PassThrough> => {
  const url = getTextToSpeechUrl(text, options?.lang, options?.slow);
  return await fetchAudioStream(url);
};
