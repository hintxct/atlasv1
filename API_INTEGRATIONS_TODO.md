# ATLAS API / Manual Integration Checklist

This project is demo-ready with offline/mock fallbacks, but these production integrations should be added manually when you have credentials.

## Already using free/open sources

- **OpenStreetMap tile layer**: used in `frontend/src/pages/PublicMapPage.js` through Leaflet. No key required for demos. For production traffic, use your own tile server or a paid tile provider.
- **OpenWeatherMap-ready backend**: `backend/services/weatherService.js` supports `WEATHER_API_KEY` and falls back to demo weather if no key is configured.

## Add these manually later

1. **OpenWeatherMap API key**
   - Add to `backend/.env`:
     ```env
     WEATHER_API_KEY=your_real_openweathermap_key
     ```

2. **Production MongoDB**
   - Replace local MongoDB URI in `backend/.env`:
     ```env
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ne-logistics
     ```

3. **Real routing/navigation API**
   - Current `backend/services/routeEngine.js` generates demo route options and risk scores.
   - Production options: OSRM, GraphHopper, Mapbox Directions, Google Routes.
   - Add keys/config only if provider requires it.

4. **SMS / push notifications**
   - Needed for driver alerts, emergency broadcast and multilingual notifications.
   - Options: Firebase Cloud Messaging, Twilio, MSG91, NIC/government SMS gateway.
   - Add env keys and a notification service later.

5. **Government transport/road databases**
   - Integrate PWD/BRO/NHAI road status feeds if provided by organizers/department.

6. **APK packaging**
   - The mobile app page is currently a responsive web/mobile preview.
   - Package later using Capacitor or build a dedicated React Native app.

## Current fallback behavior

- If backend is unreachable, frontend login/register supports demo/localStorage accounts.
- Public map/statistics/dashboards render from `frontend/src/data/mockData.js`.
- Weather backend returns generated demo weather without an API key.