declare module 'discord-tts';

/* 

This library is JS only so it does not include any types. We must define it as a module so TypeScript knows to import it as an any type

If we wanted to add types on top of their library, we could revise the module as such:

declare module 'discord-tts' {
    export function getRandomNumber(): number
} 

*/
