import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { API } from '../api';
import toast from 'react-hot-toast';

const DemandHotspotPage = () => {
    const { user } = useAuth();
    const mapRef = useRef(null);
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDemandData();
    }, []);

    const fetchDemandData = async () => {
        try {
            setLoading(true);
            const response = await API.get('/demand-insights');
            setHeatmapData(response.data.data);
        } catch (err) {
            console.error('Error fetching demand data:', err);
            setError('Failed to load demand insights');
            toast.error('Failed to load demand insights');
        } finally {
            setLoading(false);
        }
    };

    const initializeMap = useCallback(() => {
        if (!mapRef.current) return;

        // Default center on India
        const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Prepare heatmap data: [[lat, lng, intensity], ...]
        const heatData = heatmapData.map(point => [
            point.lat,
            point.lng,
            point.intensity
        ]);

        // Add heatmap layer
        L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            max: Math.max(...heatData.map(d => d[2])) || 1,
            gradient: {
                0.2: 'blue',
                0.4: 'lime',
                0.6: 'yellow',
                0.8: 'orange',
                1.0: 'red'
            }
        }).addTo(map);

        // Add markers for each data point with popup
        heatmapData.forEach(point => {
            L.circleMarker([point.lat, point.lng], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: Math.min(point.intensity / 2, 20) // Size based on intensity
            }).addTo(map).bindPopup(`
                <strong>${point.area}, ${point.city}</strong><br>
                Specialty: ${point.specialty}<br>
                Searches: ${point.intensity}
            `);
        });

        // Fit map to data bounds
        if (heatData.length > 0) {
            const bounds = L.latLngBounds(heatData.map(d => [d[0], d[1]]));
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [heatmapData]);

    useEffect(() => {
        if (!loading && !error && mapRef.current && heatmapData.length > 0) {
            initializeMap();
        }
    }, [loading, error, heatmapData, initializeMap]);

    // Redirect if not Pro user
    if (!user || user.subscriptionTier !== 'pro') {
        return <Navigate to="/upgrade-pro" />;
    }

    return (
        <div className="min-h-screen bg-accent-cream dark:bg-primary-dark py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            📊 Demand Insights
                        </h1>
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold">
                            PRO FEATURE
                        </span>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Analyze patient search patterns and identify high-demand areas for your services.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg text-center">
                        <div className="text-3xl font-bold text-blue-600">{heatmapData.length}</div>
                        <div className="text-gray-600 dark:text-gray-300">Active Areas</div>
                    </div>
                    <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg text-center">
                        <div className="text-3xl font-bold text-red-600">
                            {heatmapData.filter(d => d.intensity > 10).length}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">High Demand Zones</div>
                    </div>
                    <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {heatmapData.reduce((sum, d) => sum + d.intensity, 0)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">Total Searches</div>
                    </div>
                    <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg shadow-lg text-center">
                        <div className="text-3xl font-bold text-purple-600">
                            {heatmapData.length > 0 ? Math.max(...heatmapData.map(d => d.intensity)) : 0}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">Peak Searches</div>
                    </div>
                </div>

                {/* Map */}
                <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Patient Search Heatmap</h2>
                    {loading ? (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-300">Loading demand insights...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">⚠️</div>
                                <p className="text-xl text-red-600 mb-2">{error}</p>
                                <button
                                    onClick={fetchDemandData}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : heatmapData.length === 0 ? (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📊</div>
                                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">No demand data available</p>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Data will appear after patient searches are logged and aggregated.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div ref={mapRef} className="h-96 rounded-lg"></div>
                    )}
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>Legend:</strong> Blue (low demand) → Red (high demand)</p>
                        <p>Click on markers for detailed information about each area.</p>
                    </div>
                </div>

                {/* Top Areas Table */}
                <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Demand Areas</h2>
                        <p className="text-gray-600 dark:text-gray-300">Areas with highest patient search activity</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Area
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Specialty
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Searches
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Demand Level
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {heatmapData
                                    .sort((a, b) => b.intensity - a.intensity)
                                    .slice(0, 10)
                                    .map((point, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {point.area}, {point.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                            {point.specialty}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {point.intensity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                point.intensity > 20 ? 'text-red-500 bg-red-100 dark:bg-red-900' :
                                                point.intensity > 10 ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900' :
                                                'text-green-500 bg-green-100 dark:bg-green-900'
                                            }`}>
                                                {point.intensity > 20 ? 'High' : point.intensity > 10 ? 'Medium' : 'Low'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandHotspotPage;
