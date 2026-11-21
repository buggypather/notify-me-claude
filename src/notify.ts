// Showing a notification in the system's notification area, with nothing to install:
// Windows: a toast through PowerShell (Windows 10 and 11); macOS: osascript; Linux: notify-send.
import { spawn } from 'node:child_process';

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The PowerShell that shows a Windows toast (under PowerShell's own app id, which every Windows has). */
export function windowsScript(title: string, body: string, sound: boolean): string {
  const toast = `<toast><visual><binding template="ToastGeneric"><text>${xml(title)}</text><text>${xml(body)}</text></binding></visual>${sound ? '' : '<audio silent="true"/>'}</toast>`;
  return [
    '[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null',
    '[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null',
    '$x = New-Object Windows.Data.Xml.Dom.XmlDocument',
    `$x.LoadXml('${toast.replace(/'/g, "''")}')`,
    "$id = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe'",
    '[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($id).Show([Windows.UI.Notifications.ToastNotification]::new($x))',
  ].join('\n');
}

/** The AppleScript for macOS. */
export function macScript(title: string, body: string, sound: boolean): string {
  const q = (s: string) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  return `display notification ${q(body)} with title ${q(title)}${sound ? ' sound name "Glass"' : ''}`;
}

export function notify(title: string, body: string, sound = true): Promise<void> {
  return new Promise(resolve => {
    let child;
    if (process.platform === 'win32') {
      // Encoded, so quotes and line breaks can't break the command.
      const encoded = Buffer.from(windowsScript(title, body, sound), 'utf16le').toString('base64');
      child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-EncodedCommand', encoded], { windowsHide: true, stdio: 'ignore' });
    } else if (process.platform === 'darwin') child = spawn('osascript', ['-e', macScript(title, body, sound)], { stdio: 'ignore' });
    else child = spawn('notify-send', ['--app-name=Claude', title, body], { stdio: 'ignore' });
    child.on('error', () => resolve());
    child.on('exit', () => resolve());
  });
}
