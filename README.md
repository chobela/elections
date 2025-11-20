# Zambia Election Results Map

An interactive web application displaying Zambian constituency election results with an interactive map, similar to CNN's election results interface.

## Features

- 🗺️ **Interactive Map**: Explore all 156 Zambian constituencies with color-coded results
- 📊 **Data Visualization**: View summary statistics and charts
- 🎯 **Constituency Details**: Click on any constituency to see detailed results
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Party Color Coding**: Visual representation of winning parties

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Mapbox account (free tier is sufficient)

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd zambia-election-map
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Mapbox token**
   - Create a free account at [Mapbox](https://account.mapbox.com/)
   - Copy your access token
   - Create a `.env` file in the project root:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your token:
     ```
     REACT_APP_MAPBOX_TOKEN=your_actual_token_here
     ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
zambia-election-map/
├── public/
│   ├── election_results.json           # Election results data
│   ├── zambia_constituencies_simplified.geojson  # Constituency boundaries
│   └── constituency_reference.csv      # Reference list of all constituencies
├── src/
│   ├── components/
│   │   ├── ElectionMap.js             # Interactive map component
│   │   └── ResultsSummary.js          # Summary dashboard component
│   ├── App.js                         # Main application
│   └── App.css
├── .env.example                       # Environment variables template
├── ELECTION_DATA_FORMAT.md            # Data format documentation
└── README.md
```

## Using Real Election Data

The application currently uses sample data. To use real election results:

1. Prepare your data in the correct JSON format (see `ELECTION_DATA_FORMAT.md`)
2. Replace `public/election_results.json` with your real data
3. Ensure constituency numbers match those in the GeoJSON file

### Data Format

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
      }
    ]
  }
}
```

See `ELECTION_DATA_FORMAT.md` for detailed documentation and conversion scripts.

## Features Overview

### Map View
- **Color-coded constituencies**: Each constituency is colored by winning party
- **Hover tooltips**: See basic information by hovering over constituencies
- **Click for details**: Click to see full election results for a constituency
- **Interactive legend**: Shows party colors and meanings

### Summary View
- **Overall statistics**: Total constituencies, votes cast, and party seats
- **Charts**: Visual representation of results
- **Detailed table**: Complete breakdown of all party performances

## Customization

### Party Colors

Edit `src/components/ElectionMap.js` and `src/components/ResultsSummary.js`:

```javascript
const partyColors = {
  'UPND': '#e74c3c',      // Red
  'PF': '#3498db',        // Blue
  'INDEPENDENT': '#95a5a6', // Gray
  'OTHER': '#f39c12'      // Orange
};
```

### Map Styling

Change the Mapbox style in `src/components/ElectionMap.js`:

```javascript
mapStyle="mapbox://styles/mapbox/light-v11"
// Options: light-v11, dark-v11, streets-v12, satellite-v9
```

### Initial Map Position

Adjust the center and zoom in `src/components/ElectionMap.js`:

```javascript
const [viewState, setViewState] = useState({
  longitude: 28.3,    // Zambia center
  latitude: -13.5,
  zoom: 5.5
});
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to [Netlify](https://www.netlify.com/)
3. Add environment variable: `REACT_APP_MAPBOX_TOKEN`
4. Deploy!

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your Mapbox token as an environment variable in the Vercel dashboard.

### Deploy to GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/zambia-election-map",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

## Data Sources

- **Constituency Boundaries**: Zambian constituency shapefiles (2020)
- **Election Results**: Sample data generated for demonstration (replace with real data)

## Technologies Used

- React
- Mapbox GL JS / react-map-gl
- Recharts (for data visualization)
- GeoPandas (for data processing)

## Performance Optimization

The GeoJSON file has been simplified to reduce file size from 36MB to 2.5MB while maintaining visual quality. For even better performance, consider:

1. Using vector tiles instead of GeoJSON
2. Implementing progressive loading
3. Adding a CDN for static assets

## Troubleshooting

### Map not loading
- Check that your Mapbox token is correctly set in `.env`
- Ensure the file is named `.env` (not `.env.txt`)
- Restart the development server after adding the token

### GeoJSON not displaying
- Verify the file exists at `public/zambia_constituencies_simplified.geojson`
- Check browser console for loading errors
- Ensure the GeoJSON is valid using a validator

### Election results not showing
- Verify `public/election_results.json` exists
- Check that constituency numbers match the GeoJSON
- Look for errors in the browser console

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
