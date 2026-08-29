/**
 * Centralized Validation Utilities for A_S Commerce
 * Provides consistent validation across Account, Checkout, and Product pages.
 */

// 6-digit Indian PIN code regex (does not start with 0)
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// 10-digit Indian mobile number regex (starts with 6, 7, 8, or 9)
export const PHONE_REGEX = /^[6-9]\d{9}$/;

// Email regex for standard email validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a 6-digit Indian PIN code.
 * @param {string|number} pincode 
 * @returns {boolean}
 */
export const isValidIndianPincode = (pincode) => {
  if (!pincode) return false;
  return PINCODE_REGEX.test(String(pincode).trim());
};

/**
 * Validates a 10-digit Indian phone number.
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidIndianPhone = (phone) => {
  if (!phone) return false;
  const cleanPhone = String(phone).replace(/\D/g, '');
  return PHONE_REGEX.test(cleanPhone) || cleanPhone.length === 10;
};

/**
 * Validates an email address.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return EMAIL_REGEX.test(String(email).trim().toLowerCase());
};

/**
 * Centralized validation for user shipping & billing addresses.
 * Used by AccountPage, CheckoutPage, and Address modals.
 * @param {object} address 
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateAddressForm = (address) => {
  if (!address) {
    return { isValid: false, error: 'Address data is missing' };
  }

  const name = address.name ? String(address.name).trim() : '';
  const phone = address.phone ? String(address.phone).trim() : '';
  const street = address.street ? String(address.street).trim() : '';
  const city = address.city ? String(address.city).trim() : '';
  const state = address.state ? String(address.state).trim() : '';
  const pincode = address.pincode ? String(address.pincode).trim() : '';

  if (!name) {
    return { isValid: false, error: 'Please enter recipient full name' };
  }
  if (!phone || phone.length < 10) {
    return { isValid: false, error: 'Please enter a valid 10-digit contact number' };
  }
  if (!street) {
    return { isValid: false, error: 'Please enter complete street address / building details' };
  }
  if (!city) {
    return { isValid: false, error: 'City is required' };
  }
  if (!state) {
    return { isValid: false, error: 'State / Region is required' };
  }
  if (!isValidIndianPincode(pincode)) {
    return { isValid: false, error: 'Please enter a valid 6-digit Indian PIN code' };
  }

  return { isValid: true };
};
