export type UserRequestBody = {
  name: string;
  email: string;
  address?: UserAddress;
  coordinates?: {
    lng: number;
    lat: number;
  };
};

export type UserAddress = {
  street: string;
  neighborhood: string;
  number?: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
};

export type NewUser = {
  name: string;
  email: string;
  address?: string;
  coordinates?: [number, number];
};
