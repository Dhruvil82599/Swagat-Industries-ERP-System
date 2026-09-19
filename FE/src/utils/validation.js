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
 * Supports 10-digit mobile numbers with optional country prefix (+91 / 0), spaces, and hyphens.
 * @param {string} value 
 * @param {boolean} isOptional 
 * @returns {{ isValid: boolean | null, message: string }}
 */
export function getMobileValidationStatus(value, isOptional = false) {
  if (!value || String(value).trim() === '') {
    if (isOptional) return { isValid: null, message: '' };
    return { isValid: false, message: '✕ Mobile number is required' };
  }

  const raw = String(value).trim();

  // Check if string contains alphabetic letters
  if (/[a-zA-Z]/.test(raw)) {
    return {
      isValid: false,
      message: '✕ Mobile number cannot contain letters'
    };
  }

  // Extract digits only
  const digitsOnly = raw.replace(/\D/g, '');
  let mobileDigits = digitsOnly;

  // Handle standard prefixes: +91 / 91 (12 digits) or leading 0 (11 digits)
  if (mobileDigits.length === 12 && mobileDigits.startsWith('91')) {
    mobileDigits = mobileDigits.slice(2);
  } else if (mobileDigits.length === 11 && mobileDigits.startsWith('0')) {
    mobileDigits = mobileDigits.slice(1);
  }

  if (mobileDigits.length < 10) {
    return {
      isValid: false,
      message: `✕ Enter 10-digit mobile number (${mobileDigits.length}/10)`
    };
  }

  if (mobileDigits.length > 10) {
    return {
      isValid: false,
      message: `✕ Mobile number must contain 10 digits (${mobileDigits.length}/10)`
    };
  }

  return {
    isValid: true,
    message: '✓ Valid 10-digit mobile number'
  };
}

/**
 * Real-time Bank Account Number validation status reporter
 * Account numbers must contain only numeric digits (typically 9 to 18 digits).
 * @param {string} value 
 * @returns {{ isValid: boolean | null, message: string }}
 */
export function getAccountNoValidationStatus(value) {
  if (!value || String(value).trim() === '') {
    return { isValid: null, message: '' };
  }

  const raw = String(value).trim();

  if (/[^\d]/.test(raw)) {
    return {
      isValid: false,
      message: '✕ Account number cannot contain letters or special characters'
    };
  }

  if (raw.length < 9) {
    return {
      isValid: false,
      message: `✕ Account number is too short (${raw.length}/9-18 digits)`
    };
  }

  if (raw.length > 18) {
    return {
      isValid: false,
      message: `✕ Account number cannot exceed 18 digits (${raw.length}/18)`
    };
  }

  return {
    isValid: true,
    message: '✓ Valid Bank Account Number'
  };
}

