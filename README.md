# dotfiles

Managed with [dotdrop](https://github.com/deadc0de6/dotdrop).

## Setup (new machine)

```bash
# Clone
git clone https://github.com/ndrewGele/dotfiles.git ~/projects/misc/dotfiles
cd ~/projects/misc/dotfiles

# Install dotdrop (macOS)
brew install dotdrop

# Install dotfiles for this machine
dotdrop install -p macbook   # or -p linux
```

Then create your secrets file — it lives in `$HOME`, outside the repo, so git can never see it:
```bash
cp env.local.example ~/.env.local
$EDITOR ~/.env.local    # replace the placeholder values
chmod 600 ~/.env.local
```
The templated `.zshrc` sources it on every shell startup, and prints a hint if the file is missing.

## Common commands

```bash
# Install all dotfiles for a profile (overwrites existing)
dotdrop install -p macbook

# Update a file after editing it locally
dotdrop update -p macbook ~/.zshrc

# Compare local files against managed versions
dotdrop compare -p macbook

# See what's in a profile
dotdrop files -p macbook
```

## Command direction

Easy to mix up — commands run in two directions:

| Command | Direction | Use it when |
|---------|-----------|-------------|
| `dotdrop install` | repo → live | repo is right, live has drifted |
| `dotdrop update` | live → repo | you edited the live file |
| `dotdrop import` | live → repo | adding a brand-new file |
| `dotdrop compare` | read-only | see what differs before choosing |

`install` overwrites local edits. If you changed a file live, `update` it first or
the next `install` throws that change away.

Only `install` writes backups — `update` and `import` replace the repo copy in place.
(See [Backups](#backups).)

## Profile resolution

dotdrop picks a profile in this order:

1. `-p <profile>` — always wins
2. `$DOTDROP_PROFILE` — set in your shell rc (`~/.zshrc` on macbook, `~/.config/fish/config.fish` on linux)
3. hostname — **the fallback**

Step 3 is why every example here passes `-p`. On a fresh machine the hostname
(`Jelly-Air.local`) matches no profile, so nothing installs:

```
[WARN] no dotfile to install for this profile ("Jelly-Air.local")   # exit 1
```

A missing profile also gets *created*: `dotdrop import ~/.foo` with no `-p` adds a
junk profile named after your hostname to `config.yaml`.

Because step 2 lives in your shell rc, it only applies to interactive shells — scripts
and `ssh host dotdrop ...` should pass `-p` explicitly.

## Adding a new file

```bash
dotdrop import --dkey f_newfile -p macbook ~/.newfile
```

Then add it to the other profile in `config.yaml` if it should be shared.

> **Never `dotdrop import` `~/.env.local`.** `dotpath` is `dotfiles/`, so the import would
> store it as `dotfiles/env.local` and commit your secrets. Keep it out of the dotpath —
> `.gitignore` blocks that path as a backstop.

## Changing a shared file

Listing a file under both profiles only makes it *available* to both machines — a
change still has to be installed on each one:

```bash
# Mac: you edited the live file
dotdrop update  -p macbook ~/.pi/agent/settings.json   # live → repo
git commit -am "settings: bump default model"

# Linux box: pick up the same change
git pull
dotdrop install -p linux ~/.pi/agent/settings.json     # repo → live
```

Shared files can still render per machine — `{{@@ ghostty_theme @@}}` resolves from
that profile's `variables:` block in `config.yaml`.

## Profiles

| Profile | Shell | Exclusive files | Dotfiles |
|---------|-------|-----------------|----------|
| macbook | zsh | `zshrc`, `p10k.zsh`, `zprofile`, `condarc` | 10 |
| linux | fish | `config/fish/config.fish` | 7 |

Six dotfiles are shared by both profiles: `gitconfig`, `config/ghostty/config`,
and the four `pi/agent/*` entries.

`config.yaml` is the source of truth — run `dotdrop files -p <profile>` if this table
looks out of date.

## Backups

`install` saves the file it's about to replace as `<file>.dotdropbak` alongside it.
`update` and `import` do **not** — they overwrite the repo copy in place, so commit
before running them. `.dotdropbak` files are untracked, local-only, and safe to
delete once you've confirmed the new version is right.

## Secrets

Secrets live in `~/.env.local` — outside the `dotpath`, so they are never tracked.
`env.local.example` at the repo root is the tracked template; copy it and fill in real values.

`$DOTFILES_QUIET=1` silences the missing-file warning (set it in `~/.zprofile` or your
terminal's environment — not in `~/.env.local`, since that file is what triggers the warning).
