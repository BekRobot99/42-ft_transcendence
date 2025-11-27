#!/usr/bin/env python3
"""
Commit Statistics Analyzer for ft_transcendence project
Analyzes and visualizes commit contributions by 5 team members
"""

import matplotlib.pyplot as plt
import numpy as np

# Raw commit data from git shortlog
raw_commits = {
    'BekRobot99': 75,
    'Mila': 31,  # Updated from 26 to 31
    'Ali': 30,
    'theeunsu': 26,
    'xylo-o': 18,
    'Eunsu': 10,  # Updated from 7 to 10
    'abekri': 4,
    'Xylo-o': 2,
    'alhlbx5': 2,
    'Eunsu Ahn': 1
}

# Merge commits by actual team member (5 people)
team_commits = {
    'Ayman': 0,     # BekRobot99 + abekri
    'Ali': 0,       # Ali + alhlbx5
    'Eunsu': 0,     # theeunsu + Eunsu + Eunsu Ahn
    'Adrian': 0,    # xylo-o + Xylo-o
    'Mila': 0,      # Mila
}

# Map raw names to team members
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

# Merge commits
for raw_name, count in raw_commits.items():
    if raw_name in name_mapping:
        team_member = name_mapping[raw_name]
        team_commits[team_member] += count

# Calculate total and percentages
total_commits = sum(team_commits.values())
percentages = {member: (count / total_commits) * 100 for member, count in team_commits.items()}

# Sort by commit count
sorted_commits = dict(sorted(team_commits.items(), key=lambda x: x[1], reverse=True))
sorted_percentages = {member: percentages[member] for member in sorted_commits.keys()}

# Print statistics
print("=" * 70)
print("COMMIT STATISTICS - ft_transcendence (test branch)")
print("=" * 70)
print(f"\nTotal commits: {total_commits}")
print(f"Team size: 5 members\n")
print(f"{'Team Member':<25} {'Commits':<12} {'Percentage':<12} {'Bar':<20}")
print("-" * 70)
for member, count in sorted_commits.items():
    pct = sorted_percentages[member]
    bar_length = int(pct / 2.5)  # Scale bar
    bar = '█' * bar_length
    print(f"{member:<25} {count:<12} {pct:>6.2f}%       {bar}")
print("=" * 70)

# Create horizontal bar chart
fig, ax = plt.subplots(figsize=(12, 8))
fig.suptitle('Commit Distribution (test branch)', 
             fontsize=22, fontweight='bold', y=0.96)

# Color scheme - distinct colors for each team member
colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

members = list(sorted_commits.keys())
commits = list(sorted_commits.values())
pcts = [sorted_percentages[m] for m in members]

# Create horizontal bar chart
y_pos = np.arange(len(members))
bars = ax.barh(y_pos, commits, color=colors, edgecolor='black', linewidth=2, height=0.6)

# Add labels
ax.set_yticks(y_pos)
ax.set_yticklabels(members, fontsize=14, fontweight='bold')
ax.set_xlabel('Number of Commits', fontsize=14, fontweight='bold')
ax.invert_yaxis()  # Top to bottom
ax.grid(axis='x', alpha=0.3, linestyle='--')

# Add value labels on bars
for i, (bar, commit_count, pct) in enumerate(zip(bars, commits, pcts)):
    width = bar.get_width()
    ax.text(width + 2, bar.get_y() + bar.get_height()/2.,
            f'{commit_count} commits ({pct:.1f}%)',
            ha='left', va='center', fontweight='bold', fontsize=13)

plt.tight_layout()

# Save the plot
output_file = 'commit_statistics.png'
plt.savefig(output_file, dpi=300, bbox_inches='tight')
print(f"\n📊 Plot saved as: {output_file}")
print(f"🔍 Opening the visualization...\n")

plt.show()
