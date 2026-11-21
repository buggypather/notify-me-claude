// Which notifications are on (all, to start with), kept in ~/.notify-me-claude.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const KINDS = ['started', 'permission', 'replied', 'finished', 'input'] as const;
export type Kind = (typeof KINDS)[number];
export const KIND_INFO: Record<Kind, string> = {
  started: 'Claude started working on your message',
  permission: 'Claude needs your permission for something',
  replied: 'Claude replied and is still working',
  finished: 'Claude finished',
  input: 'Claude is waiting for your answer',
};
export interface Settings {
  on: Record<Kind, boolean>;
  sound: boolean;
}
export const SETTINGS = join(homedir(), '.notify-me-claude.json');
const DEFAULTS: Settings = { on: { started: true, permission: true, replied: true, finished: true, input: true }, sound: true };

export function readSettings(): Settings {
  try {
    const s = JSON.parse(readFileSync(SETTINGS, 'utf8')) as Partial<Settings>;
    return { on: { ...DEFAULTS.on, ...s.on }, sound: s.sound ?? DEFAULTS.sound };
  } catch {
    return structuredClone(DEFAULTS);
  }
}
export function writeSettings(s: Settings) {
  writeFileSync(SETTINGS, JSON.stringify(s, null, 2));
}
