import { describe, expect, it } from 'vitest';
import { describeRequest, noteFor, short } from '../src/events';
import { macScript, windowsScript } from '../src/notify';

describe('notify-me-claude', () => {
  it('turns events into the four notifications', () => {
    expect(noteFor({ hook_event_name: 'UserPromptSubmit', cwd: '/x/fm', prompt: 'Fix the bug\nplease' })).toEqual({ kind: 'started', title: 'Claude is working · fm', body: 'Fix the bug' });
    expect(noteFor({ hook_event_name: 'PermissionRequest', tool_name: 'Bash', tool_input: { command: 'rm -rf dist' } })?.body).toBe('Run: rm -rf dist');
    expect(noteFor({ hook_event_name: 'MessageDisplay', final: false, delta: 'a' })).toBeNull();
    expect(noteFor({ hook_event_name: 'MessageDisplay', final: true, delta: 'Here is the plan:\n' })?.kind).toBe('replied');
    expect(noteFor({ hook_event_name: 'Stop', last_assistant_message: '**Done.** All tests pass.' })).toEqual({ kind: 'finished', title: 'Claude finished', body: 'Done. All tests pass.' });
  });
  it('shows a permission prompt once, and waiting for input', () => {
    expect(noteFor({ hook_event_name: 'Notification', notification_type: 'permission_prompt', message: 'x' })).toBeNull();
    expect(noteFor({ hook_event_name: 'Notification', notification_type: 'idle_prompt', message: 'Claude is waiting for your input' })?.kind).toBe('input');
  });
  it('describes requests and shortens text', () => {
    expect(describeRequest('Edit', { file_path: '/home/a/src/b.ts' })).toBe('Edit: b.ts');
    expect(short('x'.repeat(200), 10)).toBe('xxxxxxxxx…');
  });
  it('builds safe Windows and macOS scripts', () => {
    const w = windowsScript(`It's <done> & "ok"`, 'body', false);
    expect(w).toContain("It''s &lt;done&gt; &amp; &quot;ok&quot;");
    expect(w).toContain('<audio silent="true"/>');
    expect(macScript('A "title"', 'b', true)).toBe('display notification "b" with title "A \\"title\\"" sound name "Glass"');
  });
});
