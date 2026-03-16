import { envs } from "../../config/envs";

export const generateMapboxImage = (lat: number, lon: number): string => {
    const accessToken = envs.MAPBOX_TOKEN;
    const zoom = 11;
    const width = 800;
    const height = 400;
    return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s-l+000(${lon},${lat})/${lon},${lat},${zoom}/${width}x${height}?access_token=${accessToken}`;
}

export const generateTwoPointsMapboxImage = (
    lostLat: number,
    lostLon: number,
    foundLat: number,
    foundLon: number
  ): string => {
    const accessToken = envs.MAPBOX_TOKEN;
    const zoom = 14;
    const width = 800;
    const height = 400;
    const centerLon = (lostLon + foundLon) / 2;
    const centerLat = (lostLat + foundLat) / 2;
  
    return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
      `pin-s-l+000(${lostLon},${lostLat}),` +
      `pin-s-f+f00(${foundLon},${foundLat})/` +
      `${centerLon},${centerLat},${zoom}/${width}x${height}?access_token=${accessToken}`;
  };
