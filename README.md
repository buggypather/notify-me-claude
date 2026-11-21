# notify-me-claude

Desktop notifications from Claude Code, so you can do something else while it works. It tells you when Claude:

| Notification | When |
|---|---|
| **Claude is working** | it starts on a message you sent |
| **Claude needs your permission** | it's waiting for you to allow something, and says what (`Run: npm test`, `Edit: app.ts`) |
| **Claude replied, still working** | it wrote a message and carries on (not shown if it stopped right after; you get "finished" instead) |
| **Claude is waiting for you** | it's asked you a question or has been idle |
| **Claude finished** | it's done, with the first line of its last reply |

Each notification's title includes the project folder, so you can tell sessions apart.

It works on **Windows 10 and 11** (the usual toasts in the notification area), macOS (Notification Center) and Linux (`notify-send`, part of most desktops). There's nothing else to install.

## Install

You need [Node.js](https://nodejs.org) 18 or newer. If you installed Claude Code with npm, you already have it.

**As a Claude Code plugin (recommended).** In Claude Code:

```
/plugin marketplace add buggypather/notify-me-claude
/plugin install notify-me-claude@notify-me-claude
```

Then restart Claude Code.

**By hand.** Clone the repo, run `npm install`, and copy the hooks from `hooks/hooks.json` into `~/.claude/settings.json`, replacing `${CLAUDE_PLUGIN_ROOT}` with the folder you cloned to.

## Choosing which ones

```
npx notify-me-claude status            which notifications are on
npx notify-me-claude off started       turn one off: started, permission, replied, finished, input, or all
npx notify-me-claude on all            turn them back on
npx notify-me-claude sound off         quiet notifications
npx notify-me-claude test              show a test notification
```

If `npx notify-me-claude` isn't found, run `node <plugin folder>/dist/cli.js` with the same words. Settings live in `~/.notify-me-claude.json`.

## If you don't see them

- **Windows:**
  - Open Settings → System → Notifications and check that notifications are on.
  - Check that **Windows PowerShell** is allowed to show them, since the toasts come through it.
  - Turn off Focus (Do not disturb) if it's on.
- **macOS:** the first time, allow notifications for **Script Editor** in System Settings → Notifications.
- **Linux:** check that `notify-send` works on its own: `notify-send hello`.

`npx notify-me-claude test` is the quickest check.

## Contributing

Updates are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md). Ideas that would fit well:

- Clicking a notification to bring the terminal or VS Code to the front
- A separate sound for each kind
- Per-project settings

MIT licensed.
