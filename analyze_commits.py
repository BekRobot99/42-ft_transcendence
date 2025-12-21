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

def get_commit_stats():
    """Get commit statistics for each author"""
    # Get all commits with author name
    result = subprocess.run(
        ['git', 'log', '--all', '--pretty=format:%an'],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print("Error running git log")
        return None
    
    authors = result.stdout.strip().split('\n')
    
    # Count commits per author (with normalization)
    commit_counts = defaultdict(int)
    for author in authors:
        if author:
            normalized = normalize_author(author)
            commit_counts[normalized] += 1
    
    return dict(commit_counts)

def plot_commits(commit_counts):
    """Create a bar chart of commits per author with percentages"""
    # Sort by commits descending
    sorted_data = sorted(commit_counts.items(), key=lambda x: x[1], reverse=True)
    authors = [x[0] for x in sorted_data]
    commits = [x[1] for x in sorted_data]
    
    total_commits = sum(commits)
    percentages = [(c / total_commits * 100) for c in commits]
    
    plt.figure(figsize=(12, 6))
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#96CEB4']
    bars = plt.bar(authors, commits, color=colors[:len(authors)])
    
    plt.xlabel('Author', fontsize=12, fontweight='bold')
    plt.ylabel('Number of Commits', fontsize=12, fontweight='bold')
    plt.title('Commit Statistics by Author', fontsize=14, fontweight='bold')
    plt.xticks(rotation=45, ha='right')
    
    # Add value labels with percentages on bars
    for bar, pct in zip(bars, percentages):
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}\n({pct:.1f}%)',
                ha='center', va='bottom', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('commit_statistics.png', dpi=300, bbox_inches='tight')
    print("✅ Chart saved as 'commit_statistics.png'")
    plt.show()

if __name__ == "__main__":
    print("📊 Analyzing commit statistics...")
    commit_counts = get_commit_stats()
    
    if commit_counts:
        total = sum(commit_counts.values())
        print("\nCommit counts:")
        for author, count in sorted(commit_counts.items(), key=lambda x: x[1], reverse=True):
            pct = (count / total * 100)
            print(f"  {author}: {count} commits ({pct:.1f}%)")
        print(f"\nTotal: {total} commits")
        
        plot_commits(commit_counts)
    else:
        print("❌ Failed to get commit statistics")
