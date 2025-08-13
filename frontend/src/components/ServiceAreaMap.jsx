import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function ServiceAreaMap({ value, onChange }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const polygonRef = useRef(null);
  const pointMarkersRef = useRef([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [hasDrawnPolygon, setHasDrawnPolygon] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Determine initial center and zoom based on existing polygon
    let initialCenter = [19.076, 72.8777];
    let initialZoom = 11;
    
    if (value && value.type === 'Polygon' && Array.isArray(value.coordinates)) {
      let latlngs = value.coordinates[0].map(([lng, lat]) => [lat, lng]);
      // Remove the last point if it's the same as the first (closed polygon)
      if (latlngs.length > 3) {
        const firstPoint = latlngs[0];
        const lastPoint = latlngs[latlngs.length - 1];
        if (firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]) {
          latlngs = latlngs.slice(0, -1); // Remove duplicate closing point
        }
      }
      
      if (latlngs.length > 0) {
        // Calculate center of polygon
        const lats = latlngs.map(([lat]) => lat);
        const lngs = latlngs.map(([, lng]) => lng);
        initialCenter = [
          (Math.min(...lats) + Math.max(...lats)) / 2,
          (Math.min(...lngs) + Math.max(...lngs)) / 2
        ];
        initialZoom = 13;
        setHasDrawnPolygon(true);
      }
    }

    // Initialize map
    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true
    });
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    // Load existing polygon if provided
    if (value && value.type === 'Polygon' && Array.isArray(value.coordinates)) {
      const latlngs = value.coordinates[0].map(([lng, lat]) => [lat, lng]);
      // Remove the last point if it's the same as the first (closed polygon)
      if (latlngs.length > 3) {
        const firstPoint = latlngs[0];
        const lastPoint = latlngs[latlngs.length - 1];
        if (firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]) {
          latlngs.pop(); // Remove duplicate closing point for display
        }
      }
      
      const polygon = L.polygon(latlngs, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
        weight: 3
      }).addTo(map);
      polygonRef.current = polygon;
      map.fitBounds(polygon.getBounds(), { padding: [20, 20] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle drawing mode changes
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    const handleMapClick = (e) => {
      if (!isDrawing) return;
      e.originalEvent.preventDefault();
      
      const newPoint = [e.latlng.lat, e.latlng.lng];
      
      // Add to undo stack before updating
      setUndoStack(prev => [...prev, [...drawingPoints]]);
      setDrawingPoints(prev => [...prev, newPoint]);
    };

    if (isDrawing) {
      map.getContainer().style.cursor = 'crosshair';
      map.on('click', handleMapClick);
    } else {
      map.getContainer().style.cursor = '';
      map.off('click', handleMapClick);
    }

    return () => {
      map.off('click', handleMapClick);
      map.getContainer().style.cursor = '';
    };
  }, [isDrawing, drawingPoints]);

  // Update visual representation when drawing points change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing point markers
    pointMarkersRef.current.forEach(marker => map.removeLayer(marker));
    pointMarkersRef.current = [];

    // Clear temporary polygon
    if (polygonRef.current && isDrawing) {
      map.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    // Add point markers
    drawingPoints.forEach((point, index) => {
      const marker = L.circleMarker(point, {
        radius: 8,
        color: '#3b82f6',
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 3
      }).addTo(map);
      
      marker.bindTooltip(`Point ${index + 1}`, { permanent: false });
      pointMarkersRef.current.push(marker);
    });

    // Create temporary polygon if enough points
    if (drawingPoints.length >= 3) {
      const polygon = L.polygon(drawingPoints, {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);
      polygonRef.current = polygon;
    }
  }, [drawingPoints, isDrawing]);

  const startDrawing = () => {
    if (!mapRef.current) return;
    
    setIsDrawing(true);
    setDrawingPoints([]);
    setUndoStack([]);
    setHasDrawnPolygon(false);
    
    // Clear existing polygon
    if (polygonRef.current) {
      mapRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }
    
    // Clear existing markers
    pointMarkersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
    pointMarkersRef.current = [];
  };

  const undoLastPoint = () => {
    if (undoStack.length === 0) return;
    
    const previousPoints = undoStack[undoStack.length - 1];
    setDrawingPoints(previousPoints);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const finishDrawing = () => {
    if (drawingPoints.length < 3) return;
    
    // Convert to GeoJSON format with closed loop (first point = last point)
    const closedPoints = [...drawingPoints];
    // Check if the polygon is already closed
    const firstPoint = closedPoints[0];
    const lastPoint = closedPoints[closedPoints.length - 1];
    
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      // Close the polygon by adding the first point at the end
      closedPoints.push(firstPoint);
    }
    
    const coordinates = [closedPoints.map(([lat, lng]) => [lng, lat])];
    const geoJson = { type: 'Polygon', coordinates };
    onChange?.(geoJson);
    
    setIsDrawing(false);
    setHasDrawnPolygon(true);
    
    // Clear temporary markers
    pointMarkersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
    pointMarkersRef.current = [];
    
    // Create final polygon
    if (mapRef.current) {
      if (polygonRef.current) {
        mapRef.current.removeLayer(polygonRef.current);
      }
      
      const finalPolygon = L.polygon(drawingPoints, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
        weight: 3
      }).addTo(mapRef.current);
      polygonRef.current = finalPolygon;
    }
    
    setDrawingPoints([]);
    setUndoStack([]);
  };

  const clearPolygon = () => {
    if (!mapRef.current) return;
    
    // Clear polygon
    if (polygonRef.current) {
      mapRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }
    
    // Clear markers
    pointMarkersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
    pointMarkersRef.current = [];
    
    setDrawingPoints([]);
    setUndoStack([]);
    setIsDrawing(false);
    setHasDrawnPolygon(false);
    onChange?.(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startDrawing}
          disabled={isDrawing}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isDrawing 
              ? 'bg-blue-800 text-blue-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isDrawing ? '🎯 Drawing Mode Active' : hasDrawnPolygon ? '✏️ Draw Again' : '📍 Draw Service Area'}
        </button>
        
        {isDrawing && (
          <>
            <button
              type="button"
              onClick={undoLastPoint}
              disabled={undoStack.length === 0}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ↩️ Undo Last Point
            </button>
            
            <button
              type="button"
              onClick={finishDrawing}
              disabled={drawingPoints.length < 3}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✅ Finish ({drawingPoints.length}/3+ points)
            </button>
          </>
        )}
        
        {(hasDrawnPolygon || drawingPoints.length > 0) && (
          <button
            type="button"
            onClick={clearPolygon}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            🗑️ Clear Area
          </button>
        )}
      </div>
      
      {isDrawing && (
        <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
          <p className="font-medium mb-2">🎯 Drawing Mode Active</p>
          <ul className="space-y-1 text-xs">
            <li>• Click anywhere on the map to add a point</li>
            <li>• Need at least 3 points to create a service area</li>
            <li>• Use "Undo Last Point" to remove the most recent point</li>
            <li>• Click "Finish" when your area is complete</li>
          </ul>
        </div>
      )}
      
      {hasDrawnPolygon && !isDrawing && (
        <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
          ✅ Service area defined! Patients within this area will see you in search results.
        </div>
      )}
      
      <div
        ref={containerRef}
        style={{ height: '24rem', width: '100%' }}
        className="rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-lg"
      />
    </div>
  );
}
