import Radar from "radar-sdk-js";

const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY || "prj_test_pk_dd38bf146a5fd7d1e8f3eb909c54caa1005581ca";

// Helper: OpenStreetMap Fallback
const getAddressFromOpenStreetMap = async (lat: number, long: number) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`
        );
        const data = await response.json();
        return {
            description: data.display_name,
            street: data.address.road,
            city: data.address.city || data.address.town,
            state: data.address.state,
            country: data.address.country
        };
    } catch (e) { return null; }
};

export const initializeRadar = () => {
    if (typeof window !== "undefined" && !Radar.isInitialized) {
        try { Radar.initialize(RADAR_KEY); } catch (e) { }
    }
};

const getBrowserLocation = (): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject("Geolocation not supported");
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => reject(err),
            { timeout: 10000, enableHighAccuracy: false }
        );
    });
};

export const trackUserLocation = async (userId?: string) => {
    initializeRadar();
    if (userId) Radar.setUserId(userId);

    console.log("📍 Starting Dynamic Tracking...");

    try {
        // 1. Get GPS Coords (Browser)
        const coords = await getBrowserLocation();
        console.log("✅ GPS Found:", coords.latitude, coords.longitude);

        return new Promise(async (resolve) => {
            let resolved = false;

            // Final resolver function
            const finish = (contextData: any, source: string) => {
                if (resolved) return;
                resolved = true;
                resolve({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy,
                    locationContext: contextData,
                    source: source
                });
            };

            // 2. DYNAMIC FETCH: Ask Radar "What geofences are here?"
            // We do this in parallel with the Address lookup
            Radar.searchGeofences({
                radius: 1000, // Look within 1km
                limit: 1      // Just give me the closest one
            }, async (err: any, result: any) => {

                // A. Check if Radar found a Dynamic Geofence
                if (!err && result?.geofences && result.geofences.length > 0) {
                    const geofence = result.geofences[0];
                    console.log("🔥 Dynamic Geofence Found:", geofence.description);

                    // We found it! Combine it with address data if possible
                    finish({
                        description: geofence.description, // "Universal AI University"
                        geofenceId: geofence._id,
                        tag: geofence.tag
                    }, "radar-dynamic-geofence");
                }

                // B. If no Geofence found, Fallback to OpenStreetMap Address
                else {
                    console.warn("⚠️ No Dynamic Geofence found. Using Address...");
                    const osmData = await getAddressFromOpenStreetMap(coords.latitude, coords.longitude);
                    finish(osmData || { description: "Location captured" }, "browser-osm-fallback");
                }
            });

            // Safety Timer: If Radar API hangs for 3 seconds, just use OSM
            setTimeout(async () => {
                if (!resolved) {
                    console.warn("⚠️ Radar Search Timeout. Using OSM...");
                    const osmData = await getAddressFromOpenStreetMap(coords.latitude, coords.longitude);
                    finish(osmData || { description: "Location captured" }, "browser-osm-timeout");
                }
            }, 3000);
        });

    } catch (browserError) {
        console.error("❌ Location Failed:", browserError);
        return null;
    }
};