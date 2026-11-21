#!/usr/bin/env node
// The hook Claude Code runs on each event (in the background). It works out which notification
// the event means and shows it, if that kind is on. "Replied, still working" waits a moment
// first: if Claude stops right after the message, "finished" is shown instead, not both.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { noteFor, type HookInput } from './events.js';
import { notify } from './notify.js';
import { readSettings } from './settings.js';

const WAIT_MS = 2500;
const stampFile = (session: string) => join(tmpdir(), 'notify-me-claude', `${session.replace(/[^\w-]/g, '')}.stop`);

async function main() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  const e = JSON.parse(raw || '{}') as HookInput;
  const session = e.session_id ?? 'session';
  if (e.hook_event_name === 'Stop') {
    mkdirSync(join(tmpdir(), 'notify-me-claude'), { recursive: true });
    writeFileSync(stampFile(session), String(Date.now()));
  }
  const note = noteFor(e);
  const settings = readSettings();
  if (!note || !settings.on[note.kind]) return;
  if (note.kind === 'replied') {
    const at = Date.now();
    await new Promise(r => setTimeout(r, WAIT_MS));
    try {
      if (Number(readFileSync(stampFile(session), 'utf8')) >= at) return; // It finished instead.
    } catch {
      // Not stopped yet.
    }
  }
  await notify(note.title, note.body, settings.sound);
}

main().catch(() => {
  // Never get in Claude's way.
});
