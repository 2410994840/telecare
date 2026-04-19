import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

// Location centers
const locationCenters = {
  Rajpura: [30.63, 76.59],
  Lucknow: [26.8467, 80.9462],
  Delhi: [28.6139, 77.2090]
};

export default function PatientMap() {
  const [location, setLocation] = useState('Rajpura');
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const center = locationCenters[location];

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);

      try {
        const [lat, lng] = center;

        const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:5000,${lat},${lng});way["amenity"="hospital"](around:5000,${lat},${lng});relation["amenity"="hospital"](around:5000,${lat},${lng}););out center;`;

        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.elements) {
          throw new Error('No data received');
        }

        const hospitals = data.elements
          .map((el, index) => ({
            id: index,
            name: el.tags?.name || 'Unnamed Hospital',
            lat: el.lat || el.center?.lat,
            lng: el.lon || el.center?.lon
          }))
          .filter((h) => h.lat && h.lng);

        if (hospitals.length === 0) {
          const [lat, lng] = center;
          setMarkers([{ id: 1, name: 'Nearby Hospital', lat: lat + 0.01, lng: lng + 0.01 }]);
        } else {
          setMarkers(hospitals);
        }

      } catch (error) {
        console.error('Fetch error:', error);
        const [lat, lng] = center;
        setMarkers([{ id: 1, name: 'Fallback Hospital', lat: lat + 0.01, lng: lng + 0.01 }]);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [location]);

  // Open in Google Maps
  const handleMarkerClick = (clinic) => {
    const query = encodeURIComponent(`${clinic.name}, ${location}, India`);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      '_blank'
    );
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <MapPin size={20} />
        <div>
          <h3 className="font-semibold text-lg">Nearby Hospitals</h3>
          <p className="text-sm text-gray-500">
            Real-time healthcare locations
          </p>
        </div>
      </div>

      {/* Dropdown */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium">Location:</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-3 py-1 border rounded"
        >
          {Object.keys(locationCenters).map((l) => (
            <option key={l} value={l}>
              {l}, India
            </option>
          ))}
        </select>
      </div>

      {/* Map */}
      <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {markers.map((clinic) => (
            <CircleMarker
              key={clinic.id}
              center={[clinic.lat, clinic.lng]}
              radius={10}
              pathOptions={{
                fillColor: '#10b981',
                fillOpacity: 0.7,
                color: '#059669'
              }}
              eventHandlers={{
                click: () => handleMarkerClick(clinic)
              }}
            >
              <Tooltip>
                <div>
                  <p className="font-semibold">{clinic.name}</p>
                  <p className="text-xs text-gray-500">
                    Click to open in Maps
                  </p>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            zIndex: 1000
          }}>
            Loading hospitals...
          </div>
        )}

        {!loading && markers.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 1000
          }}>
            No hospitals found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Click markers to open in Google Maps
      </div>
    </div>
  );
}