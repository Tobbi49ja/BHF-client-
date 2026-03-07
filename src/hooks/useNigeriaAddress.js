import { useState, useCallback } from 'react';
import { STATES, getLGAs, getCities, getTowns } from '../data/nigeriaAddressData';

export function useNigeriaAddress(initial = {}) {
  const [address, setAddress] = useState({
    state:    initial.state    || '',
    lga:      initial.lga      || '',
    city:     initial.city     || '',
    town:     initial.town     || '',
    street:   initial.street   || '',
    street2:  initial.street2  || '',
    landmark: initial.landmark || '',
    postcode: initial.postcode || '',
  });

  const handleStateChange = useCallback((e) => {
    setAddress((prev) => ({ ...prev, state: e.target.value, lga: '', city: '', town: '' }));
  }, []);

  const handleLGAChange = useCallback((e) => {
    setAddress((prev) => ({ ...prev, lga: e.target.value, city: '', town: '' }));
  }, []);

  const handleCityChange = useCallback((e) => {
    setAddress((prev) => ({ ...prev, city: e.target.value, town: '' }));
  }, []);

  const handleTownChange = useCallback((e) => {
    setAddress((prev) => ({ ...prev, town: e.target.value }));
  }, []);

  const handleStreetChange   = useCallback((e) => setAddress((p) => ({ ...p, street:   e.target.value })), []);
  const handleStreet2Change  = useCallback((e) => setAddress((p) => ({ ...p, street2:  e.target.value })), []);
  const handleLandmarkChange = useCallback((e) => setAddress((p) => ({ ...p, landmark: e.target.value })), []);
  const handlePostcodeChange = useCallback((e) => setAddress((p) => ({ ...p, postcode: e.target.value })), []);

  const resetAddress    = useCallback(() => setAddress({ state:'', lga:'', city:'', town:'', street:'', street2:'', landmark:'', postcode:'' }), []);
  const setAddressValues = useCallback((v) => setAddress((p) => ({ ...p, ...v })), []);

  const lgas   = getLGAs(address.state);
  const cities = getCities(address.state, address.lga);
  const towns  = getTowns(address.state, address.lga, address.city);

  const fullAddress = [
    address.street,
    address.street2,
    address.town,
    address.city,
    address.lga,
    address.state,
    address.postcode,
    'Nigeria',
  ].filter(Boolean).join(', ');

  const isStreetValid    = address.street.trim().length >= 3;
  const isAddressComplete = Boolean(address.state && address.lga && address.city && isStreetValid);

  return {
    address,
    handlers: {
      handleStateChange, handleLGAChange, handleCityChange, handleTownChange,
      handleStreetChange, handleStreet2Change, handleLandmarkChange, handlePostcodeChange,
      resetAddress, setAddressValues,
    },
    derived: {
      states: STATES,
      lgas,
      cities,
      towns,
      fullAddress,
      isStateValid:   Boolean(address.state),
      isLGAValid:     Boolean(address.lga),
      isCityValid:    Boolean(address.city),
      isStreetValid,
      isAddressComplete,
    },
  };
}