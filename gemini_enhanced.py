#!/home/ali/42-ft_transcendence/.venv/bin/python

import os
import sys
import argparse
import subprocess
import json
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
            timeout=30
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
            'stderr': 'Command timed out after 30 seconds',
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
    return """You are a helpful AI assistant with the ability to execute terminal commands to help users fix issues and perform tasks.

When a user asks you to do something that requires terminal commands, you should:
1. Explain what you're going to do
2. Show the command(s) you'll run
3. Execute the command(s) using the EXECUTE_COMMAND function
4. Explain the results

Available functions:
- EXECUTE_COMMAND(command): Execute a shell command and see the output

Guidelines:
- Always explain what each command does before running it
- Be cautious with destructive commands (rm, mv, etc.) - ask for confirmation
- For file editing, prefer using tools like sed, awk, or creating new files
- Show command output and explain what it means
- If a command fails, try alternative approaches
- Work step by step for complex tasks

Current working directory: """ + os.getcwd() + """

Format your responses clearly with:
- **Explanation**: What you're doing
- **Command**: The command you're running  
- **Output**: The result
- **Next Steps**: What to do next (if applicable)
"""

def parse_ai_response_for_commands(response_text):
    """Parse AI response to extract commands that should be executed"""
    commands = []
    lines = response_text.split('\n')
    
    in_command_block = False
    current_command = ""
    
    for line in lines:
        # Look for command indicators
        if 'EXECUTE_COMMAND(' in line:
            # Extract command from function call
            start = line.find('EXECUTE_COMMAND(') + 16
            end = line.rfind(')')
            if start < end:
                command = line[start:end].strip().strip('"').strip("'")
                commands.append(command)
        elif line.strip().startswith('```bash') or line.strip().startswith('```sh'):
            in_command_block = True
            continue
        elif line.strip() == '```' and in_command_block:
            if current_command.strip():
                commands.append(current_command.strip())
                current_command = ""
            in_command_block = False
        elif in_command_block:
            current_command += line + '\n'
    
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
            print("⚡ Auto-execution enabled")
        if args.safe_mode:
            print("🛡️  Safe mode: Will ask before running commands")
        print("Type 'exit' or 'quit' to leave, 'clear' to clear screen")
        print("Ask me to run commands, fix issues, or help with terminal tasks!")
        print("-" * 60)
        
        conversation_history = []
        
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
                
                # Build context with system prompt and conversation history
                full_prompt = create_system_prompt() + "\n\nConversation History:\n"
                for entry in conversation_history[-5:]:  # Keep last 5 exchanges
                    full_prompt += f"User: {entry['user']}\nAssistant: {entry['assistant']}\n\n"
                full_prompt += f"User: {user_input}\n\nAssistant:"
                
                print("\n🤔 Thinking...")
                response = model.generate_content(full_prompt)
                response_text = response.text
                
                print(f"\n🤖 Gemini: {response_text}")
                
                # Look for commands to execute
                if args.execute:
                    commands = parse_ai_response_for_commands(response_text)
                    for command in commands:
                        if args.safe_mode:
                            confirm = input(f"\n⚠️  Execute command: '{command}'? (y/n): ").lower()
                            if confirm != 'y':
                                continue
                        
                        print(f"\n💻 Executing: {command}")
                        result = execute_command(command)
                        
                        if result['success']:
                            print(f"✅ Success!")
                            if result['stdout']:
                                print(f"📤 Output:\n{result['stdout']}")
                        else:
                            print(f"❌ Failed (exit code: {result['returncode']})")
                            if result['stderr']:
                                print(f"🚨 Error:\n{result['stderr']}")
                
                # Add to conversation history
                conversation_history.append({
                    'user': user_input,
                    'assistant': response_text
                })
                
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
            
            # Look for commands to execute
            if args.execute:
                commands = parse_ai_response_for_commands(response_text)
                for command in commands:
                    if args.safe_mode:
                        confirm = input(f"\nExecute command: '{command}'? (y/n): ").lower()
                        if confirm != 'y':
                            continue
                    
                    print(f"\nExecuting: {command}")
                    result = execute_command(command)
                    
                    if result['success']:
                        print("Success!")
                        if result['stdout']:
                            print(f"Output:\n{result['stdout']}")
                    else:
                        print(f"Failed (exit code: {result['returncode']})")
                        if result['stderr']:
                            print(f"Error:\n{result['stderr']}")
                            
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Read from stdin if no prompt provided
        if not sys.stdin.isatty():
            prompt = sys.stdin.read().strip()
            if prompt:
                full_prompt = create_system_prompt() + f"\n\nUser: {prompt}\n\nAssistant:"
                try:
                    response = model.generate_content(full_prompt)
                    print(response.text)
                except Exception as e:
                    print(f"Error: {e}", file=sys.stderr)
                    sys.exit(1)
        else:
            parser.print_help()

if __name__ == '__main__':
    main()
