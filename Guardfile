# Guardfile to notify Firefox of changed files to reload them
# More info at https://github.com/guard/guard#readme

# Add files and commands to this file, like the example:
#   watch(%r{file/path}) { `command(s)` }
guard 'shell' do
  # For any changed js/html/css file, tell Firefox to reload the opened page
  # via the Remote Control plugin (https://addons.mozilla.org/en-US/firefox/addon/remote-control/)
  # ('reload' is a shortcut for window.location.reload(); you can send any javascript
  # See README.md for more info
  watch(%r{.*\.(js|html|css)$}) {|m| `echo "Reloading #{m[0]}"; echo reload | nc -c localhost 32000`}
  # To include the file name: #{m[0]}
end
