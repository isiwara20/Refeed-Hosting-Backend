// src/utils/geo.service.js
import axios from "axios";

// Reverse geocode: lat/lng -> human readable address
export async function reverseGeocode(lat, lng) {
  const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
    params: { lat, lon: lng, format: "json" },
    headers: { "User-Agent": "ReFeed/1.0 (student project)" }, // Nominatim requires UA
  });

  return res.data?.display_name || null;
}

// Nearby NGOs: simple OSM search around a rough bounding box
export async function getNearbyNGOs(lat, lng) {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: "NGO",
      format: "json",
      limit: 10,
      viewbox: `${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}`,
      bounded: 1,
    },
    headers: { "User-Agent": "ReFeed/1.0 (student project)" },
  });

  return res.data;
}


/*


This utility module provides geolocation-related services
by integrating with the OpenStreetMap (Nominatim) API using axios.

Purpose:
Convert geographic coordinates into readable addresses
and find nearby NGOs based on latitude and longitude.

Functions:

1. reverseGeocode(lat, lng):
   - Sends a request to Nominatim's reverse geocoding endpoint.
   - Converts latitude and longitude into a human-readable address.
   - Returns the display_name (formatted address) or null if not found.
   - Includes a required User-Agent header as mandated by Nominatim API policy.

2. getNearbyNGOs(lat, lng):
   - Searches for "NGO" within a small bounding box around the given coordinates.
   - Uses viewbox to define a geographic search area.
   - Limits results to 10 entries.
   - Returns an array of matching location objects from OpenStreetMap.

Data Flow:
Service Layer → geo.service → OpenStreetMap API → Response Data → Controller → Client

This module:
- Contains no business logic.
- Does not interact with the database.
- Acts purely as an external API integration utility.
- Keeps location-based logic modular and reusable.
*/