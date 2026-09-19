/**
 * Validation utilities for Swagat ERP System
 * Provides real-time status feedback for GSTIN and Mobile Number inputs.
 */

export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const MOBILE_REGEX = /^\d{10}$/;

/**
 * Real-time GSTIN validation status reporter
 * @param {string} value 
 * @returns {{ isValid: boolean | null, message: string }}
 */
export function getGstValidationStatus(value) {
  if (!value || value.trim() === '') {
    return { isValid: null, message: '' };
  }
  const clean = value.trim().toUpperCase();
  if (clean.length < 15) {
    return {
      isValid: false,
      message: `✕ GSTIN must be 15 characters (${clean.length}/15)`
    };
  }
  if (!GST_REGEX.test(clean)) {
    return {
      isValid: false,
      message: '✕ Invalid GSTIN format (e.g. 24ABCDE1234F1Z5)'
    };
  }
  return {
    isValid: true,
    message: '✓ Valid 15-character GSTIN'
  };
}

/**
 * Real-time Mobile Number validation status reporter
 * @param {string} value 
 * @param {boolean} isOptional 
 * @returns {{ isValid: boolean | null, message: string }}
 */
export function getMobileValidationStatus(value, isOptional = false) {
  if (!value || value.trim() === '') {
    if (isOptional) return { isValid: null, message: '' };
    return { isValid: false, message: '✕ Mobile number is required' };
  }
  const clean = value.trim();
  if (clean.length < 10) {
    return {
      isValid: false,
      message: `✕ Enter 10-digit mobile number (${clean.length}/10)`
    };
  }
  if (!MOBILE_REGEX.test(clean)) {
    return {
      isValid: false,
      message: '✕ Mobile number must contain exactly 10 digits'
    };
  }
  return {
    isValid: true,
    message: '✓ Valid 10-digit mobile number'
  };
}
