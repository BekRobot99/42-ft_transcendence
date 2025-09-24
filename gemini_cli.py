#!/usr/bin/env python3

import os
import sys
import argparse
import google.generativeai as genai

def main():
    parser = argparse.ArgumentParser(description='Gemini CLI - Interact with Google\'s Gemini AI')
    parser.add_argument('--api-key', help='Google AI API key (or set GOOGLE_API_KEY env var)')
    parser.add_argument('--model', default='gemini-pro', help='Model to use (default: gemini-pro)')
    parser.add_argument('prompt', nargs='*', help='Text prompt to send to Gemini')
    parser.add_argument('--interactive', '-i', action='store_true', help='Start interactive mode')
    parser.add_argument('--set-key', help='Set API key in environment')
    
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
        print(f"Gemini CLI Interactive Mode (model: {args.model})")
        print("Type 'exit' or 'quit' to leave, 'clear' to clear screen")
        print("-" * 50)
        
        while True:
            try:
                prompt = input("\n> ").strip()
                if prompt.lower() in ['exit', 'quit']:
                    break
                elif prompt.lower() == 'clear':
                    os.system('clear')
                    continue
                elif not prompt:
                    continue
                
                print("\nGenerating response...")
                response = model.generate_content(prompt)
                print(f"\n{response.text}")
                
            except KeyboardInterrupt:
                print("\nGoodbye!")
                break
            except Exception as e:
                print(f"Error: {e}")
    
    # Single prompt mode
    elif args.prompt:
        prompt = ' '.join(args.prompt)
        try:
            response = model.generate_content(prompt)
            print(response.text)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Read from stdin if no prompt provided
        if not sys.stdin.isatty():
            prompt = sys.stdin.read().strip()
            if prompt:
                try:
                    response = model.generate_content(prompt)
                    print(response.text)
                except Exception as e:
                    print(f"Error: {e}", file=sys.stderr)
                    sys.exit(1)
        else:
            parser.print_help()

if __name__ == '__main__':
    main()
