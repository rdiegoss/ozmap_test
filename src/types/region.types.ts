export type RegionRequestBody = {
  name: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  user: string;
};
