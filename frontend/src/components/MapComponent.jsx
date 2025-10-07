import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const doctorIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const patientIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C19.4036 0 25 5.59644 25 12.5C25 19.4036 19.4036 25 12.5 25C5.59644 25 0 19.4036 0 12.5C0 5.59644 5.59644 0 12.5 0Z" fill="#000000"/>
      <path d="M12.5 41L0 25H25L12.5 41Z" fill="#000000"/>
      <circle cx="12.5" cy="12.5" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper function to get centroid from service area centroid field
const getCentroidFromServiceArea = (serviceAreaCentroid) => {
  if (serviceAreaCentroid && serviceAreaCentroid.coordinates && serviceAreaCentroid.coordinates.length >= 2) {
    return {
      lat: serviceAreaCentroid.coordinates[1], // latitude
      lng: serviceAreaCentroid.coordinates[0]  // longitude
    };
  }
  return null;
};

// Helper function to calculate the centroid of a polygon (fallback method)
const calculatePolygonCentroid = (coordinates) => {
  let totalLat = 0;
  let totalLng = 0;
  let totalPoints = 0;

  // coordinates is an array of [lng, lat] pairs
  for (const coord of coordinates) {
    if (coord && coord.length >= 2) {
      totalLng += coord[0]; // longitude
      totalLat += coord[1]; // latitude
      totalPoints++;
    }
  }

  return {
    lat: totalLat / totalPoints,
    lng: totalLng / totalPoints,
  };
};

// Component to handle map view updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  if (center) {
    map.setView(center, zoom);
  }
  
  return null;
};

const MapComponent = ({ doctors, userLocation, filteredByLocation = false }) => {
  const [patientLocation, setPatientLocation] = useState(null);
  
  // Fetch patient's location from their profile
  useEffect(() => {
    const fetchPatientLocation = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const profile = await response.json();
          if (profile.location && profile.location.coordinates && profile.location.coordinates.length >= 2) {
            setPatientLocation({
              lat: profile.location.coordinates[1], // latitude
              lng: profile.location.coordinates[0]  // longitude
            });
          }
        }
      } catch (error) {
        console.error('Error fetching patient location:', error);
      }
    };
    
    fetchPatientLocation();
  }, []);

  // Default center (India)
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;
  
  // Determine map center and zoom
  let mapCenter = defaultCenter;
  let mapZoom = defaultZoom;
  
  if (patientLocation) {
    mapCenter = [patientLocation.lat, patientLocation.lng];
    mapZoom = 11;
  } else if (userLocation) {
    mapCenter = [userLocation.lat, userLocation.lng];
    mapZoom = 11;
  } else if (doctors && doctors.length > 0) {
    // Find center of all doctors using service area centroids when available
    const validDoctors = [];
    
    doctors.forEach(doctor => {
      if (doctor.serviceArea && doctor.serviceArea.coordinates && doctor.serviceArea.coordinates[0] && doctor.serviceArea.coordinates[0].length > 0) {
        try {
          const centroid = calculatePolygonCentroid(doctor.serviceArea.coordinates[0]);
          validDoctors.push({ lat: centroid.lat, lng: centroid.lng });
        } catch {
          // Fallback to location coordinates
          if (doctor.location && doctor.location.coordinates && doctor.location.coordinates.length === 2) {
            validDoctors.push({ lat: doctor.location.coordinates[1], lng: doctor.location.coordinates[0] });
          }
        }
      } else if (doctor.location && doctor.location.coordinates && doctor.location.coordinates.length === 2) {
        validDoctors.push({ lat: doctor.location.coordinates[1], lng: doctor.location.coordinates[0] });
      }
    });
    
    if (validDoctors.length > 0) {
      const avgLat = validDoctors.reduce((sum, doctor) => sum + doctor.lat, 0) / validDoctors.length;
      const avgLng = validDoctors.reduce((sum, doctor) => sum + doctor.lng, 0) / validDoctors.length;
      mapCenter = [avgLat, avgLng];
      mapZoom = 10;
    }
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={patientIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
                <p className="text-sm text-gray-600">
                  You are here
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Doctor markers */}
        {doctors && doctors.map(doctor => {
          // Get centroid from last coordinate pair, otherwise calculate or fall back to location
          let lat, lng;
          let usingServiceAreaCentroid = false;
          
          // Try to get centroid from serviceAreaCentroid field first
          const centroid = getCentroidFromServiceArea(doctor.serviceAreaCentroid);
          
          if (centroid) {
            lat = centroid.lat;
            lng = centroid.lng;
            usingServiceAreaCentroid = true;
          } else if (doctor.serviceArea && doctor.serviceArea.coordinates && doctor.serviceArea.coordinates[0] && doctor.serviceArea.coordinates[0].length > 0) {
            // Fallback: Calculate centroid from service area coordinates
            try {
              const calculatedCentroid = calculatePolygonCentroid(doctor.serviceArea.coordinates[0]);
              lat = calculatedCentroid.lat;
              lng = calculatedCentroid.lng;
              usingServiceAreaCentroid = true;
            } catch (error) {
              console.error('Error calculating centroid for doctor:', doctor.name, error);
              // Fallback to location coordinates if centroid calculation fails
              if (doctor.location && doctor.location.coordinates && doctor.location.coordinates.length === 2) {
                [lng, lat] = doctor.location.coordinates;
              } else {
                return null; // Skip this doctor if no valid coordinates
              }
            }
          } else if (doctor.location && doctor.location.coordinates && doctor.location.coordinates.length === 2) {
            // Fallback to location coordinates if no service area
            [lng, lat] = doctor.location.coordinates;
          } else {
            // Skip this doctor if no valid coordinates
            return null;
          }
          
          return (
            <Marker 
              key={doctor._id} 
              position={[lat, lng]} 
              icon={doctorIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg text-gray-800">{doctor.name}</h3>
                  {doctor.subscriptionTier === "pro" && (
                    <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                      ⭐ PRO
                    </span>
                  )}
                  <p className="text-blue-600 font-semibold">{doctor.specialty}</p>
                  <p className="text-gray-600 text-sm">{doctor.city}</p>
                  
                  <div className="my-2">
                    <p className="text-sm">
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                        {doctor.experience} Yrs Exp
                      </span>
                    </p>
                    <p className="text-sm text-yellow-600">
                      {doctor.averageRating ? doctor.averageRating.toFixed(1) : "0.0"} ★ 
                      ({doctor.numReviews || 0} reviews)
                    </p>
                  </div>
                  
                  {filteredByLocation && (
                    <p className="text-green-600 text-sm font-semibold">
                      📍 Within search area
                      <span className="block text-xs text-gray-500">
                        {usingServiceAreaCentroid ? '(service area center)' : '(office location)'}
                      </span>
                    </p>
                  )}
                  
                  <div className="mt-3">
                    <Link 
                      to={`/doctors/${doctor._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm block text-center"
                    >
                      View Profile & Book
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Show patient's stored location if available */}
        {patientLocation && (
          <Marker 
            position={[patientLocation.lat, patientLocation.lng]} 
            icon={patientIcon}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="font-bold text-lg text-black">Your Location</h3>
                <p className="text-sm text-gray-600">Stored position</p>
                <p className="text-xs text-gray-500 mt-1">
                  Lat: {patientLocation.lat.toFixed(4)}, Lng: {patientLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;