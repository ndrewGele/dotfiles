source /usr/share/cachyos-fish-config/cachyos-config.fish

# Load local environment variables (secrets, etc.)
if test -f ~/projects/misc/dotfiles/dotfiles/env.local
    source ~/projects/misc/dotfiles/dotfiles/env.local
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
