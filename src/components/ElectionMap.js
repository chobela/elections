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
    }
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
      UPND: "#d40d0d", // Red
      PF: "#009900", // Green
      INDEPENDENT: "#95a5a6", // Gray
      OTHER: "#f39c12", // Orange
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
        {enhancedGeojsonData && (
          <Source type="geojson" data={enhancedGeojsonData}>
            <Layer {...dataLayer} />
            <Layer {...outlineLayer} />
          </Source>
        )}
      </Map>

      {/* Hover Tooltip */}
      {hoveredConstituency && (
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
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Party</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "#e74c3c",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "12px" }}>UPND</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "#239e0aff",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "12px" }}>PF</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "#95a5a6",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "12px" }}>Independent</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "#e0e0e0",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "12px" }}>No Data</span>
          </div>
        </div>
      </div>

      {/* Selected Constituency Detail Panel */}
      {selectedConstituency && (
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
