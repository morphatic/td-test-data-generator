/**
 * A custom Jest matcher.
 * 
 * @module
 */

import { printExpected, printReceived } from 'jest-matcher-utils'

/**
 * A custom Jest matcher to determine if an expected value is between a
 * given minimum and maximum value.
 * 
 * @param {number} actual The actual value to be evaluated
 * @param {number} floor The minimum value expected for the actual value
 * @param {number} ceiling The maximum value expected for the actual value
 * @returns {boolean}
 */
export const toBeBetween = (actual, floor, ceiling) => {
  if (
    typeof actual !== 'number' ||
    typeof floor !== 'number' ||
    typeof ceiling !== 'number'
  ) {
    throw new Error('These must be of type number!');
  }

  const pass = actual >= floor && actual <= ceiling;

  if (pass) {
    return {
      message: () =>
        `expected ${printReceived(actual)} not to be within range ${printExpected(`${floor} - ${ceiling}`)}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `expected ${printReceived(actual)} to be within range ${printExpected(`${floor} - ${ceiling}`)}`,
      pass: false,
    }
  }
}
