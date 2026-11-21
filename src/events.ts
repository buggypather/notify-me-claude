// From a Claude Code hook event to the notification to show (or none).
import { basename } from 'node:path';
import type { Kind } from './settings.js';

export interface HookInput {
  hook_event_name?: string;
  session_id?: string;
  cwd?: string;
  prompt?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  message?: string;
  notification_type?: string;
  last_assistant_message?: string;
  final?: boolean;
  delta?: string;
  message_id?: string;
}
export interface Note {
  kind: Kind;
  title: string;
  body: string;
}

/** The first line of some text, cut to fit a notification. */
export function short(text: string | undefined, max = 140): string {
  const line = (text ?? '').replace(/[#*_`>]/g, '').split(/\r?\n/).map(l => l.trim()).find(Boolean) ?? '';
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}

/** What a permission request is for: "Run: npm test", "Edit: src/app.ts". */
export function describeRequest(tool?: string, input?: Record<string, unknown>): string {
  const i = input ?? {};
  if (typeof i.command === 'string') return `Run: ${short(i.command, 100)}`;
  if (typeof i.file_path === 'string') return `${tool ?? 'Change'}: ${basename(i.file_path)}`;
  if (typeof i.url === 'string') return `${tool}: ${i.url}`;
  return tool ? `Use ${tool}` : 'A request';
}

export function noteFor(e: HookInput): Note | null {
  const project = e.cwd ? basename(e.cwd) : '';
  const t = (s: string) => (project ? `${s} · ${project}` : s);
  switch (e.hook_event_name) {
    case 'UserPromptSubmit':
      return { kind: 'started', title: t('Claude is working'), body: short(e.prompt) || 'On your message' };
    case 'PermissionRequest':
      return { kind: 'permission', title: t('Claude needs your permission'), body: describeRequest(e.tool_name, e.tool_input) };
    case 'Stop':
      return { kind: 'finished', title: t('Claude finished'), body: short(e.last_assistant_message) || 'Done' };
    case 'MessageDisplay':
      // Only once a message is complete; the hook then waits to see whether Claude stopped.
      return e.final ? { kind: 'replied', title: t('Claude replied, still working'), body: short(e.delta) || 'New message' } : null;
    case 'Notification':
      // Permission prompts come as PermissionRequest (with what's asked), so they aren't shown twice.
      if (e.notification_type === 'permission_prompt') return null;
      if (e.notification_type === 'idle_prompt' || e.notification_type === 'agent_needs_input' || e.notification_type?.startsWith('elicitation_dialog') || e.notification_type === 'elicitation_url_dialog')
        return { kind: 'input', title: t('Claude is waiting for you'), body: short(e.message) || 'Your answer is needed' };
      return null;
    default:
      return null;
  }
}
