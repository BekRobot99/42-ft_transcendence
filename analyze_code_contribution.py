#!/usr/bin/env python3
"""
Code Contribution Analyzer - Shows both commits AND lines of code
"""

import subprocess
import matplotlib.pyplot as plt
import numpy as np

# Get commit data
commit_result = subprocess.run(
    ['git', 'shortlog', '-sn', 'test'],
    capture_output=True,
    text=True,
    cwd='/home/ali/Documents/42-ft_transcendence'
)

commits = {}
for line in commit_result.stdout.strip().split('\n'):
    parts = line.strip().split('\t')
    if len(parts) == 2:
        count = int(parts[0])
        author = parts[1]
        commits[author] = count

# Get lines of code by author (excluding package-lock.json and binary files)
lines_result = subprocess.run(
    ['git', 'log', 'test', '--no-merges', '--pretty=format:%an', '--numstat', '--',
     ':(exclude)package-lock.json', ':(exclude)*.sqlite', ':(exclude)*.png', 
     ':(exclude)*.jpg', ':(exclude)*.crt', ':(exclude)*.key'],
    capture_output=True,
    text=True,
    cwd='/home/ali/Documents/42-ft_transcendence'
)

lines = {}
current_author = None
for line in lines_result.stdout.split('\n'):
    line = line.strip()
    if not line:
        continue
    parts = line.split('\t')
    if len(parts) == 1:  # Author line
        current_author = parts[0]
        if current_author not in lines:
            lines[current_author] = {'added': 0, 'deleted': 0}
    elif len(parts) == 3 and current_author:  # numstat line
        added, deleted, filename = parts
        if added != '-' and deleted != '-':
            lines[current_author]['added'] += int(added)
            lines[current_author]['deleted'] += int(deleted)

# Map names to team members
name_mapping = {
    'BekRobot99': 'Ayman',
    'abekri': 'Ayman',
    'Ali': 'Ali',
    'alhlbx5': 'Ali',
    'theeunsu': 'Eunsu',
    'Eunsu': 'Eunsu',
    'Eunsu Ahn': 'Eunsu',
    'xylo-o': 'Adrian',
    'Xylo-o': 'Adrian',
    'Mila': 'Mila',
}

# Merge data
team_commits = {}
team_lines = {}

for author, count in commits.items():
    team_name = name_mapping.get(author, author)
    team_commits[team_name] = team_commits.get(team_name, 0) + count

for author, stats in lines.items():
    team_name = name_mapping.get(author, author)
    if team_name not in team_lines:
        team_lines[team_name] = {'added': 0, 'deleted': 0}
    team_lines[team_name]['added'] += stats['added']
    team_lines[team_name]['deleted'] += stats['deleted']

# Calculate totals
total_commits = sum(team_commits.values())
total_lines = sum(team_lines[m]['added'] + team_lines[m]['deleted'] for m in team_lines)

# Sort by lines of code
sorted_members = sorted(team_lines.keys(), 
                       key=lambda x: team_lines[x]['added'] + team_lines[x]['deleted'], 
                       reverse=True)

# Print statistics
print("\n" + "=" * 90)
print("CODE CONTRIBUTION STATISTICS - ft_transcendence (test branch)")
print("=" * 90)
print(f"\nTotal commits: {total_commits}")
print(f"Total line changes: {total_lines:,}")
print(f"Team size: 5 members\n")
print(f"{'Member':<12} {'Commits':<8} {'%':<7} {'Lines+':<10} {'Lines-':<10} {'Total':<10} {'%':<7}")
print("-" * 90)

for member in sorted_members:
    commits_count = team_commits.get(member, 0)
    commits_pct = (commits_count / total_commits) * 100
    added = team_lines[member]['added']
    deleted = team_lines[member]['deleted']
    total_member_lines = added + deleted
    lines_pct = (total_member_lines / total_lines) * 100
    print(f"{member:<12} {commits_count:<8} {commits_pct:>5.1f}%  {added:<10,} {deleted:<10,} {total_member_lines:<10,} {lines_pct:>5.1f}%")

print("=" * 90 + "\n")

# Create visualization comparing commits vs lines
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
fig.suptitle('Commits vs Lines of Code Contribution', fontsize=18, fontweight='bold')

colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

# Commits bar chart
commits_data = [team_commits.get(m, 0) for m in sorted_members]
commits_pcts = [(c / total_commits) * 100 for c in commits_data]
bars1 = ax1.barh(sorted_members, commits_data, color=colors, edgecolor='black', linewidth=2)
ax1.set_xlabel('Number of Commits', fontsize=12, fontweight='bold')
ax1.set_title('Commits', fontsize=14, fontweight='bold')
ax1.invert_yaxis()
ax1.grid(axis='x', alpha=0.3, linestyle='--')

for i, (bar, pct) in enumerate(zip(bars1, commits_pcts)):
    width = bar.get_width()
    ax1.text(width + 1, bar.get_y() + bar.get_height()/2.,
            f'{int(width)} ({pct:.1f}%)',
            ha='left', va='center', fontweight='bold', fontsize=11)

# Lines of code bar chart
lines_data = [team_lines[m]['added'] + team_lines[m]['deleted'] for m in sorted_members]
lines_pcts = [(l / total_lines) * 100 for l in lines_data]
bars2 = ax2.barh(sorted_members, lines_data, color=colors, edgecolor='black', linewidth=2)
ax2.set_xlabel('Lines of Code Changed', fontsize=12, fontweight='bold')
ax2.set_title('Lines of Code (Added + Deleted)', fontsize=14, fontweight='bold')
ax2.invert_yaxis()
ax2.grid(axis='x', alpha=0.3, linestyle='--')

for i, (bar, pct) in enumerate(zip(bars2, lines_pcts)):
    width = bar.get_width()
    ax2.text(width + width*0.02, bar.get_y() + bar.get_height()/2.,
            f'{int(width):,} ({pct:.1f}%)',
            ha='left', va='center', fontweight='bold', fontsize=11)

plt.tight_layout()
plt.savefig('code_contribution_comparison.png', dpi=300, bbox_inches='tight')
print("📊 Visualization saved as: code_contribution_comparison.png\n")
plt.show()
