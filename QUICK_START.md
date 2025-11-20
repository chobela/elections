# Quick Start Guide

Get your Zambia election map running in 5 minutes!

## Step 1: Get a Mapbox Token (2 minutes)

1. Go to https://account.mapbox.com/
2. Sign up for a free account (or log in)
3. Click "Create a token" or copy your default public token
4. Copy the token (starts with `pk.`)

## Step 2: Set Up the Project (1 minute)

```bash
# Create .env file
cp .env.example .env

# Edit .env and paste your Mapbox token
# Replace YOUR_MAPBOX_TOKEN with your actual token
nano .env
# or
code .env
```

Your `.env` file should look like:
```
REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsYWJjZGVmMTIzNDU2N30.AbCdEfGhIjKlMnOpQrStUv
```

## Step 3: Start the Application (30 seconds)

```bash
npm start
```

The app will automatically open at http://localhost:3000

## What You'll See

- **Interactive map** with all 156 Zambian constituencies
- **Color-coded** by winning party
- **Hover** over constituencies to see basic info
- **Click** constituencies for detailed results
- Switch to **Summary view** to see overall statistics

## Next Steps

### Use Real Election Data

1. Get your election results CSV/Excel file
2. Convert it to JSON format (see `ELECTION_DATA_FORMAT.md`)
3. Replace `public/election_results.json`
4. Refresh the app

### Customize Colors

Edit `src/components/ElectionMap.js` to change party colors:
```javascript
const partyColors = {
  'UPND': '#e74c3c',      // Change to your party colors
  'PF': '#3498db',
  // Add more parties as needed
};
```

### Deploy Your App

**Fastest:** Netlify (3 clicks)
1. Push to GitHub
2. Connect to Netlify
3. Add your Mapbox token in settings

**Or use:** Vercel, GitHub Pages, or any static hosting

## Troubleshooting

**Map shows but no colors?**
- Check that `public/election_results.json` exists
- Verify constituency numbers match the GeoJSON

**Map doesn't load at all?**
- Check your Mapbox token in `.env`
- Restart the dev server: `npm start`

**Need help?**
- Read the full README.md
- Check ELECTION_DATA_FORMAT.md for data issues
- Open an issue on GitHub

## File Structure Quick Reference

```
public/
├── election_results.json          ← Replace with real data
├── zambia_constituencies_simplified.geojson  ← Map boundaries
└── constituency_reference.csv     ← Reference list

src/components/
├── ElectionMap.js        ← Map component (customize here)
└── ResultsSummary.js     ← Summary dashboard

.env                      ← Your Mapbox token (create this!)
```

Happy mapping! 🗺️
