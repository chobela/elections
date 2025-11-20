# Election Results Data Format

This document describes how to structure your election results data.

## Data Structure

The application expects a JSON file at `public/election_results.json` with the following structure:

```json
{
  "CONSTITUENCY_NUMBER": {
    "winner": "PARTY_NAME",
    "votes": 12345,
    "margin": 15.5,
    "totalVotes": 50000,
    "results": [
      {
        "party": "PARTY_NAME",
        "votes": 12345,
        "percentage": 24.69
      },
      {
        "party": "ANOTHER_PARTY",
        "votes": 10000,
        "percentage": 20.00
      }
    ]
  }
}
```

## Field Descriptions

- **CONSTITUENCY_NUMBER**: String - The constituency number from the shapefile (ConstNo field)
- **winner**: String - The name of the winning party
- **votes**: Number - Number of votes the winning party received
- **margin**: Number - Victory margin as a percentage
- **totalVotes**: Number - Total votes cast in this constituency
- **results**: Array - Detailed results for all parties, sorted by votes (descending)
  - **party**: String - Party name
  - **votes**: Number - Votes received
  - **percentage**: Number - Percentage of total votes

## Example Real Data Entry

```json
{
  "1010001": {
    "winner": "UPND",
    "votes": 15234,
    "margin": 23.5,
    "totalVotes": 28500,
    "results": [
      {
        "party": "UPND",
        "votes": 15234,
        "percentage": 53.45
      },
      {
        "party": "PF",
        "votes": 8534,
        "percentage": 29.95
      },
      {
        "party": "INDEPENDENT",
        "votes": 3200,
        "percentage": 11.23
      },
      {
        "party": "OTHER",
        "votes": 1532,
        "percentage": 5.37
      }
    ]
  }
}
```

## How to Import Real Data

### From CSV

If you have election results in CSV format with columns like:
- `constituency_number`
- `party`
- `votes`

You can convert it using the Python script:

```python
import pandas as pd
import json

# Read CSV
df = pd.read_csv('your_election_results.csv')

# Group by constituency
results = {}
for const_no, group in df.groupby('constituency_number'):
    total_votes = group['votes'].sum()
    sorted_results = group.sort_values('votes', ascending=False)

    winner = sorted_results.iloc[0]
    second = sorted_results.iloc[1] if len(sorted_results) > 1 else None

    margin = ((winner['votes'] - second['votes']) / total_votes * 100) if second else 100

    results[str(const_no)] = {
        'winner': winner['party'],
        'votes': int(winner['votes']),
        'margin': round(margin, 2),
        'totalVotes': int(total_votes),
        'results': [
            {
                'party': row['party'],
                'votes': int(row['votes']),
                'percentage': round((row['votes'] / total_votes * 100), 2)
            }
            for _, row in sorted_results.iterrows()
        ]
    }

# Save to JSON
with open('public/election_results.json', 'w') as f:
    json.dump(results, f, indent=2)
```

### From Electoral Commission Data

1. Download official results from the Electoral Commission of Zambia
2. Match constituency names to the shapefile using the `ConstNo` or `ConstName` fields
3. Structure the data according to the format above
4. Save as `public/election_results.json`

## Constituency Mapping

To see all constituency numbers and names in your shapefile:

```python
import geopandas as gpd

gdf = gpd.read_file('zambia_constituencies_simplified.geojson')
constituencies = gdf[['ConstNo', 'ConstName', 'DistName', 'PovName']]
constituencies.to_csv('constituency_reference.csv', index=False)
```

This creates a reference file you can use to match your election data.

## Party Colors

The application uses these default colors:
- UPND: Red (#e74c3c)
- PF: Blue (#3498db)
- INDEPENDENT: Gray (#95a5a6)
- OTHER: Orange (#f39c12)

To customize colors, edit `src/components/ElectionMap.js` and `src/components/ResultsSummary.js` and update the `partyColors` object.
