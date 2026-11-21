#!/usr/bin/env node
// notify-me-claude status              which notifications are on
// notify-me-claude off <kind>          turn one off (started, permission, replied, finished, input, or all)
// notify-me-claude on <kind>           turn one on
// notify-me-claude sound on|off        a sound with them, or quiet
// notify-me-claude test                show a test notification
import { notify } from './notify.js';
import { KIND_INFO, KINDS, readSettings, SETTINGS, writeSettings, type Kind } from './settings.js';

const [cmd, arg] = process.argv.slice(2);
const s = readSettings();
function status() {
  for (const k of KINDS) console.log(`${s.on[k] ? 'on ' : 'off'}  ${k.padEnd(10)} ${KIND_INFO[k]}`);
  console.log(`sound ${s.sound ? 'on' : 'off'}  (settings in ${SETTINGS})`);
}
if (cmd === 'on' || cmd === 'off') {
  const which = arg === 'all' ? [...KINDS] : KINDS.includes(arg as Kind) ? [arg as Kind] : null;
  if (!which) {
    console.log(`Which? One of: ${KINDS.join(', ')}, or all.`);
    process.exit(1);
  }
  for (const k of which) s.on[k] = cmd === 'on';
  writeSettings(s);
  status();
} else if (cmd === 'sound') {
  s.sound = arg !== 'off';
  writeSettings(s);
  status();
} else if (cmd === 'test') {
  await notify('Claude finished · test', 'If you can see this, notify-me-claude works.', s.sound);
  console.log('Sent a test notification.');
} else if (cmd === 'status') status();
else console.log('notify-me-claude status | on <kind> | off <kind> | sound on|off | test\nKinds: ' + KINDS.join(', ') + ', or all');
