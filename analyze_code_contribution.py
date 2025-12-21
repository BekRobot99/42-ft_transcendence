#!/usr/bin/env python3
import subprocess
import matplotlib.pyplot as plt
from collections import defaultdict
import re

def normalize_author(author):
    """Merge duplicate accounts for the same person"""
    author_mapping = {
        'theeunsu': 'Eunsu',
        'Eunsu Ahn': 'Eunsu',
        'xylo-o': 'Xylo',
        'Xylo-o': 'Xylo',
        'abekri': 'Ali',
        'alhlbx5': 'Ali',
    }
    return author_mapping.get(author, author)

def get_code_contribution():
    """Get lines of code added/removed per author"""
    # Get detailed stats per author
    result = subprocess.run(
        ['git', 'log', '--all', '--numstat', '--pretty=format:%an'],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print("Error running git log")
        return None
    
    lines = result.stdout.strip().split('\n')
    
    author_stats = defaultdict(lambda: {'added': 0, 'removed': 0})
    current_author = None
    
    for line in lines:
        if not line:
            continue
        
        # Check if it's an author line (doesn't start with numbers or dashes)
        if not re.match(r'^\d+\s+\d+', line) and not line.startswith('-'):
            current_author = normalize_author(line.strip())
        elif current_author and re.match(r'^\d+\s+\d+', line):
            # Parse numstat line: added removed filename
            parts = line.split('\t')
            if len(parts) >= 2:
                try:
                    added = int(parts[0])
                    removed = int(parts[1])
                    author_stats[current_author]['added'] += added
                    author_stats[current_author]['removed'] += removed
                except ValueError:
                    # Skip binary files or invalid lines
                    continue
    
    return dict(author_stats)

def plot_code_contribution(author_stats):
    """Create a grouped bar chart of lines added/removed per author"""
    authors = list(author_stats.keys())
    added = [stats['added'] for stats in author_stats.values()]
    removed = [stats['removed'] for stats in author_stats.values()]
    net = [stats['added'] - stats['removed'] for stats in author_stats.values()]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
    
    # Chart 1: Added vs Removed
    x = range(len(authors))
    width = 0.35
    
    bars1 = ax1.bar([i - width/2 for i in x], added, width, label='Lines Added', color='#4ECDC4')
    bars2 = ax1.bar([i + width/2 for i in x], removed, width, label='Lines Removed', color='#FF6B6B')
    
    ax1.set_xlabel('Author', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Lines of Code', fontsize=12, fontweight='bold')
    ax1.set_title('Code Contribution: Added vs Removed', fontsize=14, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(authors, rotation=45, ha='right')
    ax1.legend()
    
    # Add value labels
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height):,}',
                    ha='center', va='bottom', fontsize=9)
    
    # Chart 2: Net Contribution
    colors = ['#45B7D1' if n >= 0 else '#FFA07A' for n in net]
    bars3 = ax2.bar(authors, net, color=colors)
    
    ax2.set_xlabel('Author', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Net Lines of Code', fontsize=12, fontweight='bold')
    ax2.set_title('Net Code Contribution (Added - Removed)', fontsize=14, fontweight='bold')
    ax2.set_xticklabels(authors, rotation=45, ha='right')
    ax2.axhline(y=0, color='black', linestyle='-', linewidth=0.5)
    
    # Add value labels
    for bar in bars3:
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height):,}',
                ha='center', va='bottom' if height >= 0 else 'top', fontsize=9)
    
    plt.tight_layout()
    plt.savefig('code_contribution_comparison.png', dpi=300, bbox_inches='tight')
    print("✅ Chart saved as 'code_contribution_comparison.png'")
    plt.show()

if __name__ == "__main__":
    print("📊 Analyzing code contributions...")
    author_stats = get_code_contribution()
    
    if author_stats:
        total_added = sum(stats['added'] for stats in author_stats.values())
        total_removed = sum(stats['removed'] for stats in author_stats.values())
        total_net = total_added - total_removed
        
        print("\nCode contribution statistics:")
        for author, stats in sorted(author_stats.items(), key=lambda x: x[1]['added'], reverse=True):
            net = stats['added'] - stats['removed']
            pct_added = (stats['added'] / total_added * 100) if total_added > 0 else 0
            pct_net = (net / total_net * 100) if total_net > 0 else 0
            print(f"  {author}:")
            print(f"    + {stats['added']:,} lines added ({pct_added:.1f}%)")
            print(f"    - {stats['removed']:,} lines removed")
            print(f"    = {net:,} net contribution ({pct_net:.1f}%)")
        
        print(f"\nTotals:")
        print(f"  + {total_added:,} lines added")
        print(f"  - {total_removed:,} lines removed")
        print(f"  = {total_net:,} net contribution")
        
        plot_code_contribution(author_stats)
    else:
        print("❌ Failed to get code contribution statistics")
