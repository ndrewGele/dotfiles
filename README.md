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

Then create `~/.env.local` with secrets:
```bash
export BRAVE_API_KEY="your-key-here"
```

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

## Profiles

| Profile | Notes |
|---------|-------|
| macbook | All files including zprofile |
| linux | Everything except zprofile |

## Secrets

Secrets live in `~/.env.local` (not tracked). The templated `.zshrc` sources it automatically.
