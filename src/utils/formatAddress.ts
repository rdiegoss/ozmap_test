import { UserAddress } from '../types/user.types';

const formatAddress = ({ city, country, neighborhood, state, street, zipCode, number }: UserAddress) => {
  if (number) {
    return `${street} - ${number} - ${neighborhood}, ${city} - ${state}, ${zipCode}, ${country}`;
  }

  return `${street} - ${neighborhood}, ${city} - ${state}, ${zipCode}, ${country}`;
};

export default formatAddress;
