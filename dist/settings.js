// Which notifications are on (all, to start with), kept in ~/.notify-me-claude.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
export const KINDS = ['started', 'permission', 'replied', 'finished', 'input'];
export const KIND_INFO = {
    started: 'Claude started working on your message',
    permission: 'Claude needs your permission for something',
    replied: 'Claude replied and is still working',
    finished: 'Claude finished',
    input: 'Claude is waiting for your answer',
};
export const SETTINGS = join(homedir(), '.notify-me-claude.json');
const DEFAULTS = { on: { started: true, permission: true, replied: true, finished: true, input: true }, sound: true };
export function readSettings() {
    try {
        const s = JSON.parse(readFileSync(SETTINGS, 'utf8'));
        return { on: { ...DEFAULTS.on, ...s.on }, sound: s.sound ?? DEFAULTS.sound };
    }
    catch {
        return structuredClone(DEFAULTS);
    }
}
export function writeSettings(s) {
    writeFileSync(SETTINGS, JSON.stringify(s, null, 2));
}
