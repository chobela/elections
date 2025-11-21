import React, { useState, useEffect, useRef } from "react";
import Map from "react-map-gl/mapbox";
import { Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const ElectionMap = ({ electionResults }) => {
  const [viewState, setViewState] = useState({
    longitude: 28.3,
    latitude: -13.5,
    zoom: 5.5,
  });
  const [hoveredConstituency, setHoveredConstituency] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [wardData, setWardData] = useState(null);
  const [showWards, setShowWards] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    // Load GeoJSON data
    fetch("/zambia_constituencies_simplified.geojson")
      .then((response) => response.json())
      .then((data) => {
        // Merge election results into GeoJSON properties
        if (electionResults) {
          data.features = data.features.map((feature) => {
            const result = electionResults[feature.properties.ConstNo];
            return {
              ...feature,
              properties: {
                ...feature.properties,
                ...result,
              },
            };
          });
        }
        setGeojsonData(data);
      })
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, [electionResults]);

  const onClick = (event) => {
    const feature = event.features && event.features[0];
    if (feature) {
      setSelectedConstituency(feature.properties);

      // Load ward data for this constituency
      const constName = feature.properties.ConstName;
      const filename = constName.replace(/\s+/g, '_').replace(/\//g, '_').toUpperCase();

      fetch(`/wards/${filename}.geojson`)
        .then(response => response.json())
        .then(data => {
          setWardData(data);
          setShowWards(true);

          // Zoom to constituency bounds
          const bounds = feature.properties.bounds || calculateBounds(data);
          if (mapRef.current && bounds) {
            mapRef.current.fitBounds(bounds, {
              padding: 50,
              duration: 1000
            });
          }
        })
        .catch(error => {
          console.error(`No ward data found for ${constName}:`, error);
          setWardData(null);
          setShowWards(false);
        });
    }
  };

  const calculateBounds = (geojson) => {
    if (!geojson || !geojson.features || geojson.features.length === 0) return null;

    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

    geojson.features.forEach(feature => {
      const coords = feature.geometry.coordinates;
      const flatten = (arr) => {
        arr.forEach(item => {
          if (Array.isArray(item[0])) {
            flatten(item);
          } else {
            minLng = Math.min(minLng, item[0]);
            maxLng = Math.max(maxLng, item[0]);
            minLat = Math.min(minLat, item[1]);
            maxLat = Math.max(maxLat, item[1]);
          }
        });
      };
      flatten(coords);
    });

    return [[minLng, minLat], [maxLng, maxLat]];
  };

  const onMouseMove = (event) => {
    const feature = event.features && event.features[0];
    if (feature) {
      setHoveredConstituency(feature.properties);
    } else {
      setHoveredConstituency(null);
    }
  };

  // Color scale based on winning party
  const getColor = (properties) => {
    if (!properties.winner) return "#e0e0e0";

    const colors = {
      UPND: "#e74c3c", // Red
      PF: "#27ae60", // Green
      MMD: "#f39c12", // Orange
      UNIP: "#9b59b6", // Purple
      DP: "#3498db", // Blue
      SP: "#e67e22", // Carrot Orange
      PNUP: "#1abc9c", // Turquoise
      PAC: "#34495e", // Dark Gray
      NHP: "#16a085", // Green Sea
      NAREP: "#8e44ad", // Wisteria
      UPPZ: "#c0392b", // Pomegranate
      ZUSD: "#2c3e50", // Midnight Blue
      PEP: "#d35400", // Pumpkin
      EFF: "#7f8c8d", // Asbestos
      LM: "#2980b9", // Belize Hole
      "3RD LM": "#95a5a6", // Concrete
      INDEPENDENT: "#bdc3c7", // Silver
      OTHER: "#ecf0f1", // Clouds
    };

    return colors[properties.winner] || "#e0e0e0";
  };

  // Layer styling
  const dataLayer = {
    id: "constituencies",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["!=", ["get", "winner"], null],
        ["get", "fillColor"],
        "#e0e0e0",
      ],
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.8,
        0.6,
      ],
    },
  };

  const outlineLayer = {
    id: "constituency-outline",
    type: "line",
    paint: {
      "line-color": "#ffffff",
      "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        3,
        1,
      ],
    },
  };

  // Add colors to features
  const enhancedGeojsonData = geojsonData
    ? {
        ...geojsonData,
        features: geojsonData.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            fillColor: getColor(feature.properties),
          },
        })),
      }
    : null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={
          process.env.REACT_APP_MAPBOX_TOKEN || "YOUR_MAPBOX_TOKEN"
        }
        interactiveLayerIds={["constituencies"]}
        onClick={onClick}
        onMouseMove={onMouseMove}
      >
        {!showWards && enhancedGeojsonData && (
          <Source type="geojson" data={enhancedGeojsonData}>
            <Layer {...dataLayer} />
            <Layer {...outlineLayer} />
          </Source>
        )}

        {showWards && wardData && (
          <Source type="geojson" data={wardData}>
            <Layer
              id="wards"
              type="fill"
              paint={{
                "fill-color": "#3498db",
                "fill-opacity": 0.3,
              }}
            />
            <Layer
              id="ward-outline"
              type="line"
              paint={{
                "line-color": "#2c3e50",
                "line-width": 2,
              }}
            />
            <Layer
              id="ward-labels"
              type="symbol"
              layout={{
                "text-field": ["get", "wardName"],
                "text-size": 12,
                "text-anchor": "center",
              }}
              paint={{
                "text-color": "#2c3e50",
                "text-halo-color": "#ffffff",
                "text-halo-width": 2,
              }}
            />
          </Source>
        )}
      </Map>

      {/* Back to All Constituencies Button */}
      {showWards && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={() => {
              setShowWards(false);
              setWardData(null);
              setSelectedConstituency(null);
              setViewState({
                longitude: 28.3,
                latitude: -13.5,
                zoom: 5.5,
              });
            }}
            style={{
              background: "#2c3e50",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            ← Back to All Constituencies
          </button>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              padding: "12px 16px",
              borderRadius: "5px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: "#2c3e50" }}>
              <strong>{selectedConstituency?.ConstName}</strong>
            </p>
            <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
              {wardData?.features?.length || 0} Wards
            </p>
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredConstituency && !showWards && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(255, 255, 255, 0.95)",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            maxWidth: "300px",
            zIndex: 1,
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
            {hoveredConstituency.ConstName}
          </h3>
          <p style={{ margin: "5px 0", color: "#666" }}>
            <strong>District:</strong> {hoveredConstituency.DistName}
          </p>
          <p style={{ margin: "5px 0", color: "#666" }}>
            <strong>Province:</strong> {hoveredConstituency.PovName}
          </p>
          {hoveredConstituency.winner && (
            <>
              <hr
                style={{
                  margin: "10px 0",
                  border: "none",
                  borderTop: "1px solid #ddd",
                }}
              />
              <p style={{ margin: "5px 0", fontSize: "16px" }}>
                <strong>Winner:</strong>{" "}
                <span style={{ color: getColor(hoveredConstituency) }}>
                  {hoveredConstituency.winner}
                </span>
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Votes:</strong>{" "}
                {hoveredConstituency.votes?.toLocaleString()}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Margin:</strong> {hoveredConstituency.margin}%
              </p>
            </>
          )}
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 10,
          background: "rgba(255, 255, 255, 0.95)",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          zIndex: 1,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Parties</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { name: "UPND", color: "#e74c3c" },
            { name: "PF", color: "#27ae60" },
            { name: "MMD", color: "#f39c12" },
            { name: "UNIP", color: "#9b59b6" },
            { name: "DP", color: "#3498db" },
            { name: "SP", color: "#e67e22" },
            { name: "PNUP", color: "#1abc9c" },
            { name: "PAC", color: "#34495e" },
            { name: "NHP", color: "#16a085" },
            { name: "NAREP", color: "#8e44ad" },
            { name: "UPPZ", color: "#c0392b" },
            { name: "ZUSD", color: "#2c3e50" },
            { name: "PEP", color: "#d35400" },
            { name: "EFF", color: "#7f8c8d" },
            { name: "LM", color: "#2980b9" },
            { name: "3RD LM", color: "#95a5a6" },
            { name: "Independent", color: "#bdc3c7" },
            { name: "No Data", color: "#e0e0e0" },
          ].map(({ name, color }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  background: color,
                  borderRadius: "3px",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "11px" }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Constituency Detail Panel */}
      {selectedConstituency && !showWards && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            maxWidth: "400px",
            maxHeight: "80vh",
            overflowY: "auto",
            zIndex: 1,
          }}
        >
          <button
            onClick={() => setSelectedConstituency(null)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              border: "none",
              background: "#e74c3c",
              color: "white",
              borderRadius: "50%",
              width: "25px",
              height: "25px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ×
          </button>
          <h2 style={{ margin: "0 0 15px 0", fontSize: "20px" }}>
            {selectedConstituency.ConstName}
          </h2>
          <p>
            <strong>District:</strong> {selectedConstituency.DistName}
          </p>
          <p>
            <strong>Province:</strong> {selectedConstituency.PovName}
          </p>

          {selectedConstituency.winner && (
            <>
              <hr
                style={{
                  margin: "15px 0",
                  border: "none",
                  borderTop: "1px solid #ddd",
                }}
              />
              <p style={{ fontSize: "16px" }}>
                <strong>Winner:</strong>{" "}
                <span style={{ color: getColor(selectedConstituency) }}>
                  {selectedConstituency.winner}
                </span>
              </p>
              {selectedConstituency.votes && (
                <p>
                  <strong>Votes:</strong>{" "}
                  {selectedConstituency.votes.toLocaleString()}
                </p>
              )}
              {selectedConstituency.margin && (
                <p>
                  <strong>Margin:</strong> {selectedConstituency.margin}%
                </p>
              )}
              {selectedConstituency.totalVotes && (
                <p>
                  <strong>Total Votes:</strong>{" "}
                  {selectedConstituency.totalVotes.toLocaleString()}
                </p>
              )}
            </>
          )}

          {selectedConstituency.results &&
            Array.isArray(selectedConstituency.results) && (
              <>
                <h3 style={{ marginTop: "20px" }}>Results</h3>
                {selectedConstituency.results.map((result, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px",
                      margin: "5px 0",
                      background: "#f5f5f5",
                      borderRadius: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>{result.party}</strong>
                      <span>
                        {result.votes.toLocaleString()} ({result.percentage}%)
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: "5px",
                        height: "5px",
                        background: "#ddd",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${result.percentage}%`,
                          background: getColor({ winner: result.party }),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
        </div>
      )}
    </div>
  );
};

export default ElectionMap;
