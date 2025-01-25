import geoip from "geoip-lite";

export const getGeolocation = (ip: string) => {
  const geo = geoip.lookup(ip);
  return geo
    ? {
        country: geo.country || "Unknown",
        region: geo.region || "Unknown",
        city: geo.city || "Unknown",
      }
    : { country: "Unknown", region: "Unknown", city: "Unknown" };
};
