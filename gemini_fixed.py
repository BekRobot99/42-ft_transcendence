#!/home/ali/42-ft_transcendence/.venv/bin/python

import os
import sys
import argparse
import subprocess
import re
import google.generativeai as genai

def execute_command(command, cwd=None):
    """Execute a shell command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            cwd=cwd or os.getcwd(),
            timeout=60
        )
        return {
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode,
            'success': result.returncode == 0
        }
    except subprocess.TimeoutExpired:
        return {
            'stdout': '',
            'stderr': 'Command timed out after 60 seconds',
            'returncode': 124,
            'success': False
        }
    except Exception as e:
        return {
            'stdout': '',
            'stderr': str(e),
            'returncode': 1,
            'success': False
        }

def create_system_prompt():
    """Create the system prompt for terminal assistance"""
    return f"""You are a helpful AI assistant with the ability to execute terminal commands to help users fix issues and perform tasks.

When a user asks you to do something that requires terminal commands, you should:
1. Briefly explain what you're going to do
2. Execute the command(s) by writing them in a code block with ```bash
3. The system will automatically execute any commands in ```bash blocks
4. Analyze the results and provide next steps

IMPORTANT: 
- Always wrap executable commands in ```bash code blocks
- Only put ONE command per code block
- Be direct and execute commands immediately when asked
- Don't just explain - DO the task

Current working directory: {os.getcwd()}
Current user: {os.getenv('USER', 'unknown')}
System: Linux (WSL)

Example:
User: "Install nodejs"
Assistant: I'll install Node.js for you using the package manager.

```bash
sudo apt update && sudo apt install -y nodejs npm
```

Now I'll verify the installation:

```bash
node --version
```

Format your responses to be helpful and execute the requested tasks directly."""

def extract_commands_from_response(response_text):
    """Extract bash commands from AI response"""
    commands = []
    
    # Find all ```bash code blocks
    bash_pattern = r'```bash\s*\n(.*?)\n```'
    bash_matches = re.findall(bash_pattern, response_text, re.DOTALL)
    
    for match in bash_matches:
        # Clean up the command
        command = match.strip()
        if command and not command.startswith('#'):  # Skip empty lines and comments
            commands.append(command)
    
    # Also look for ```sh blocks
    sh_pattern = r'```sh\s*\n(.*?)\n```'
    sh_matches = re.findall(sh_pattern, response_text, re.DOTALL)
    
    for match in sh_matches:
        command = match.strip()
        if command and not command.startswith('#'):
            commands.append(command)
    
    return commands

def main():
    parser = argparse.ArgumentParser(description='Enhanced Gemini CLI with Terminal Access')
    parser.add_argument('--api-key', help='Google AI API key (or set GOOGLE_API_KEY env var)')
    parser.add_argument('--model', default='gemini-1.5-flash', help='Model to use (default: gemini-1.5-flash)')
    parser.add_argument('prompt', nargs='*', help='Text prompt to send to Gemini')
    parser.add_argument('--interactive', '-i', action='store_true', help='Start interactive mode')
    parser.add_argument('--set-key', help='Set API key in environment')
    parser.add_argument('--execute', '-e', action='store_true', help='Allow automatic command execution')
    parser.add_argument('--safe-mode', action='store_true', help='Ask for confirmation before executing commands')
    
    args = parser.parse_args()
    
    # Handle API key setting
    if args.set_key:
        with open(os.path.expanduser('~/.gemini_api_key'), 'w') as f:
            f.write(args.set_key)
        print("API key saved to ~/.gemini_api_key")
        return
    
    # Get API key
    api_key = args.api_key or os.getenv('GOOGLE_API_KEY')
    if not api_key:
        try:
            with open(os.path.expanduser('~/.gemini_api_key'), 'r') as f:
                api_key = f.read().strip()
        except FileNotFoundError:
            pass
    
    if not api_key:
        print("Error: No API key provided. Use --api-key, set GOOGLE_API_KEY env var, or use --set-key to save one.")
        print("Get your API key from: https://makersuite.google.com/app/apikey")
        sys.exit(1)
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(args.model)
    
    # Interactive mode
    if args.interactive:
        print(f"🤖 Enhanced Gemini CLI with Terminal Access (model: {args.model})")
        if args.execute:
            print("⚡ Command execution enabled")
        if args.safe_mode:
            print("🛡️  Safe mode: Will ask before running commands")
        print("Type 'exit' or 'quit' to leave")
        print("Ask me to install, fix, or do anything in the terminal!")
        print("-" * 60)
        
        while True:
            try:
                user_input = input("\n💬 You: ").strip()
                if user_input.lower() in ['exit', 'quit']:
                    break
                elif user_input.lower() == 'clear':
                    os.system('clear')
                    continue
                elif not user_input:
                    continue
                
                # Generate response
                full_prompt = create_system_prompt() + f"\n\nUser: {user_input}\n\nAssistant:"
                print("\n🤔 Thinking...")
                response = model.generate_content(full_prompt)
                response_text = response.text
                
                print(f"\n🤖 Gemini: {response_text}")
                
                # Extract and execute commands if --execute is enabled
                if args.execute:
                    commands = extract_commands_from_response(response_text)
                    for command in commands:
                        if args.safe_mode:
                            confirm = input(f"\n⚠️  Execute: '{command}'? (y/n): ").lower()
                            if confirm not in ['y', 'yes']:
                                print("Skipped.")
                                continue
                        
                        print(f"\n💻 Executing: {command}")
                        result = execute_command(command)
                        
                        if result['success']:
                            print(f"✅ Success!")
                            if result['stdout'].strip():
                                print(f"📤 Output:\n{result['stdout']}")
                        else:
                            print(f"❌ Failed (exit code: {result['returncode']})")
                            if result['stderr'].strip():
                                print(f"🚨 Error:\n{result['stderr']}")
                
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
    
    # Single prompt mode
    elif args.prompt:
        prompt = ' '.join(args.prompt)
        full_prompt = create_system_prompt() + f"\n\nUser: {prompt}\n\nAssistant:"
        
        try:
            response = model.generate_content(full_prompt)
            response_text = response.text
            print(response_text)
            
            # Extract and execute commands if --execute is enabled
            if args.execute:
                commands = extract_commands_from_response(response_text)
                for command in commands:
                    if args.safe_mode:
                        confirm = input(f"\nExecute: '{command}'? (y/n): ").lower()
                        if confirm not in ['y', 'yes']:
                            continue
                    
                    print(f"\nExecuting: {command}")
                    result = execute_command(command)
                    
                    if result['success']:
                        print("✅ Success!")
                        if result['stdout'].strip():
                            print(f"Output:\n{result['stdout']}")
                    else:
                        print(f"❌ Failed (exit code: {result['returncode']})")
                        if result['stderr'].strip():
                            print(f"Error:\n{result['stderr']}")
                            
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
