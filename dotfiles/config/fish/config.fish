source /usr/share/cachyos-fish-config/cachyos-config.fish

set -gx DOTDROP_PROFILE "{{@@ profile @@}}"

# Set to 1 to silence the missing-env-file warning below
set -q DOTFILES_QUIET; or set -g DOTFILES_QUIET 0

# Load local environment variables (secrets, etc.)
if test -f ~/.env.local
    source ~/.env.local
else if test "$DOTFILES_QUIET" != 1
    echo "dotfiles: ~/.env.local missing - cp env.local.example ~/.env.local" >&2
end

# overwrite greeting
# potentially disabling fastfetch
#function fish_greeting
#    # smth smth
#end

if status --is-interactive
    alias ssh="kitten ssh"
end

# Backspace keybindings
function fish_user_key_bindings
    # Ctrl+Backspace: delete previous word (same as Alt+Backspace)
    bind ctrl-h backward-kill-word
end
