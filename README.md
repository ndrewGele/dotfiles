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

## Adding a new file

```bash
dotdrop import --dkey f_newfile -p macbook ~/.newfile
```

Then add it to the other profile in `config.yaml` if it should be shared.

> **Never `dotdrop import` `~/.env.local`.** `dotpath` is `dotfiles/`, so the import would
> store it as `dotfiles/env.local` and commit your secrets. Keep it out of the dotpath —
> `.gitignore` blocks that path as a backstop.

## Profiles

| Profile | Notes |
|---------|-------|
| macbook | All files including zprofile |
| linux | Everything except zprofile |

## Secrets

Secrets live in `~/.env.local` — outside the `dotpath`, so they are never tracked.
`env.local.example` at the repo root is the tracked template; copy it and fill in real values.

`$DOTFILES_QUIET=1` silences the missing-file warning (set it in `~/.zprofile` or your
terminal's environment — not in `~/.env.local`, since that file is what triggers the warning).
