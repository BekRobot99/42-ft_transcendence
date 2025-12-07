# Evaluation Tool - Quick Start Guide

## Accessing the Evaluation Tool

1. **Navigate to the evaluation page:**
   - URL: `https://localhost/evaluation`
   - Must be authenticated (login first)

2. **Dashboard Overview:**
   - **OVERALL SCORE**: Current score out of 125 points
   - **COMPLETION**: Percentage of tests executed
   - **PASSED**: Number of passing tests (✓)
   - **FAILED**: Number of failing tests (✗)

## Running Tests

### Option 1: Run Individual Tests
1. Find test in the list
2. Click "Run" button next to test name
3. Wait for result (automated tests are fast, semi-automated show manual instructions)
4. Check recommendations for failed tests

### Option 2: Run All Tests
1. Click "Run All Tests" button in controls
2. System automatically runs all automated tests
3. Score updates in real-time
4. Progress bar shows completion percentage

### Option 3: System Health Check
1. Use the `/api/evaluation/system-health` endpoint
2. Get top 5 critical issues
3. Quick overview of system status

## Viewing Results

### Test Result Details
- **Status**: Pass (✓), Fail (✗), Warning (⚠), Pending (⏳)
- **Execution Time**: How long test took (ms)
- **Details**: What was tested and result
- **Logs**: Debug information
- **Recommendations**: Fixes if test failed

### Score Information
- Tests are organized by category:
  - **Mandatory**: General, Security, Basic, Game (~300 tests)
  - **Modules**: Backend, Frontend, Database, etc. (~600 tests)
  - **Bonus**: Advanced features (~100 tests)

## Filtering Tests

### By Status
- **All Tests**: Show everything
- **Passed ✓**: Show only passing tests
- **Failed ✗**: Show only failing tests
- **Pending ⏳**: Show tests not yet run

### By Keyword
- Search for test names, categories, or descriptions
- Case-insensitive search
- Updates results in real-time

### By Category
- Click category header to expand/collapse
- View all tests in that category

## Using Recommendations

Each failed test includes recommendations:

### What's Included
1. **Issue**: What went wrong
2. **Fix**: How to solve it
3. **Affected Files**: Files that need changes
4. **Code Snippet**: Example code
5. **Effort**: Time estimate (minutes/hours/days)
6. **Next Steps**: Detailed action items

### Using Code Snippets
- Copy-paste snippets into your code
- Customize for your implementation
- Run test again to verify fix

## Exporting Results

### Export Formats
1. **JSON**: Structured data for processing
2. **Markdown**: Human-readable report with formatting

### Export Steps
1. Click "Export as JSON" or "Export as Markdown"
2. File automatically downloads
3. Share or archive report

### Report Contents
- Summary with score and grade
- Score breakdown by category
- List of all passed tests
- List of failed tests with reasons
- Recommendations prioritized by urgency
- Missing features identified

## Progress Tracking

### Automatic Persistence
- Progress automatically saved to browser localStorage
- Survives page refresh
- Survives closing browser (within same profile)

### Manual Reset
- Click "Reset Progress" button
- Confirms before clearing
- Starts evaluation from scratch

### Session Comparison
- Each export includes timestamp
- Download multiple reports to compare
- Track improvements over time

## Scoring System

### How Points Are Calculated

```
Mandatory Tests:
- Must pass ALL to get points
- If any fail: 0 points for this category
- If all pass: Get full mandatory points

Module Tests:
- Each test: 5 or 10 points
- Get points only if test passes
- Can pass partial modules

Bonus Tests:
- Only available if mandatory = 100%
- Each test: 5 or 10 points
- Adds to final score

Final Score = Mandatory + Modules + Bonus (max 125)
```

### Grading Scale
- **A+**: 120-125 points (Excellent)
- **A**: 105-119 points (Very Good)
- **B**: 90-104 points (Good)
- **C**: 75-89 points (Satisfactory)
- **D**: 60-74 points (Passing)
- **F**: <60 points (Failing)

## Troubleshooting

### Test Not Running
- Check browser console for errors
- Ensure backend is running
- Verify authentication token is valid
- Refresh page and try again

### No Results Shown
- Ensure at least one test has been run
- Check filter settings
- Clear search query
- Try resetting filters

### Export Not Working
- Check if browser allows downloads
- Try different export format
- Check browser console errors
- Ensure sufficient disk space

### Score Not Updating
- Refresh page to reload from localStorage
- Try running tests individually first
- Clear browser cache if persistent
- Check network tab for failed requests

## Tips & Tricks

1. **Start with mandatory tests** - These are critical
2. **Check recommendations first** - Know what to fix before running
3. **Export incrementally** - Track progress with multiple exports
4. **Use filters** - Focus on failed tests first
5. **Check system health** - Quick overview of biggest issues
6. **Read code snippets** - Recommendations include implementation examples

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Tests won't run | Check backend is started and API is accessible |
| Score stays 0 | Ensure mandatory tests pass first (all-or-nothing) |
| Recommendations missing | Failed tests have recommendations, passed tests don't |
| LocalStorage full | Browser storage limit reached, reset progress |
| Export not downloading | Check browser download settings |

## Next Steps After Evaluation

1. **Review Failed Tests**: Check list of failing tests
2. **Read Recommendations**: Understand what needs fixing
3. **Check Priority**: Start with critical (red) issues
4. **Implement Fixes**: Use code snippets as guide
5. **Run Tests Again**: Verify fixes work
6. **Export Final Report**: Document completion

## API Integration

### For Backend Integration

```bash
# Get test cases
curl https://localhost/api/evaluation/test-cases

# Run all tests
curl -X POST https://localhost/api/evaluation/run-all-tests

# Get system health
curl https://localhost/api/evaluation/system-health
```

### For Custom Workflows

Evaluation service methods available in `EvaluationService`:
- `fetchTestCases()` - Get all tests
- `runTest(testId)` - Run specific test
- `calculateScore()` - Compute current score
- `generateReport()` - Create full report
- `generateRecommendations()` - Get fixes

---

**Last Updated**: December 7, 2025
**Version**: 1.0
