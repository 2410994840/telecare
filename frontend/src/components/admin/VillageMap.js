import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Default center: central India
const DEFAULT_CENTER = [22.9734, 78.6569];

export default function VillageMap({ villageStats }) {
  const located = villageStats.filter(v => v.lat && v.lng);
  const maxCount = Math.max(...located.map(v => v.count), 1);

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={DEFAULT_CENTER} zoom={5} style={{ height: '450px', width: '100%', borderRadius: '8px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {located.map(v => (
          <CircleMarker
            key={v._id}
            center={[v.lat, v.lng]}
            radius={6 + (v.count / maxCount) * 20}
            pathOptions={{
              fillColor: v.critical > 0 ? '#ef4444' : '#3b82f6',
              fillOpacity: 0.7,
              color: v.critical > 0 ? '#b91c1c' : '#1d4ed8',
              weight: 1.5
            }}
          >
            <Tooltip>
              <div>
                <p className="font-semibold">{v._id || 'Unknown Village'}</p>
                <p>Total: {v.count} appointments</p>
                {v.critical > 0 && <p className="text-red-600">Critical: {v.critical}</p>}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      {located.length === 0 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1000, background: 'white', padding: '12px', borderRadius: '8px' }}>
          No village coordinates available yet
        </div>
      )}
    </div>
  );
}
