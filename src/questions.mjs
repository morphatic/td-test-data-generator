/**
 * These are the collection of JSON objects representing the questions to
 * be included in the CLI tool. The format is defined by the Inquirer library.
 * See: https://www.npmjs.com/package/inquirer
 * 
 * @module
 */

import {
  getColNames,
  getOptionalCols,
  getColsToMangleChoices,
  getFloatColsChoices,
  getDateColsChoices,
  getGeoColsChoices,
} from './colspecUtilities.mjs'

import colspec from '../colspec.json' assert { type: 'json' }

const optionalColNames = getColNames(getOptionalCols(colspec)).join(', ')

export const shouldOptionalColumnsBeIncluded = {
  type: 'confirm',
  name: 'includeOptional',
  message: `Include optional colunns (${optionalColNames})`,
  default: false,
}

export const howManyRowsShouldBeInSource = {
  type: 'number',
  name: 'sourceCount',
  message: 'How many rows should be in the SOURCE data set?',
  default: 100,
  validate: val => !isNaN(parseInt(val)) && val > 0 || 'Please enter a positive integer',
}

export const howManyRowsShouldTargetBeRelativeToSource = {
  type: 'number',
  name: 'rowDiff',
  message: 'How many fewer/additional rows should be in the TARGET data set?',
  default: 0,
  validate: (val, { sourceCount: sc }) =>
       !isNaN(parseInt(val)) 
    && parseInt(sc) + parseInt(val) >= 0
    || `Please enter an integer that will not result in <=0 rows in TARGET: ${sc}`,
}

export const shouldColumnOrderBeAltered = {
  type: 'confirm',
  name: 'colsRandomized',
  message: 'Should columns in SOURCE and TARGET be in a different order?',
  default: false,
}

export const whichColumnsShouldHaveDifferentNames = {
  type: 'checkbox',
  name: 'mangleColNames',
  message: 'Select which columns should have their names altered between SOURCE and TARGET',
  choices: ({ includeOptional }) => getColsToMangleChoices(includeOptional, colspec),
  default: ['None'],
  validate: val => {
    const valid = (val.includes('None') && val.length === 1) || val.length > 0
    return valid || 'Please select one or more columns OR "None"'
  },
  when: ({ includeOptional }) => getColsToMangleChoices(includeOptional, colspec).length > 1,
}

export const whichColumnsShouldHaveFloatsAltered = {
  type: 'checkbox',
  name: 'floatColsToTweak',
  message: 'Select which float columns should have their values altered between SOURCE and TARGET',
  choices: ({ includeOptional }) => getFloatColsChoices(includeOptional, colspec),
  default: ['None'],
  validate: val => {
    const valid = val.includes('None') && val.length === 1 || val.length > 0
    return valid || 'Please select one or more columns OR "None"'
  },
  when: ({ includeOptional }) => getFloatColsChoices(includeOptional, colspec).length > 1,
}

export const whichColumnsShouldHaveDatesAltered = {
  type: 'checkbox',
  name: 'dateColsToMangle',
  message: 'Select which date columns should have their values altered between SOURCE and TARGET',
  choices: ({ includeOptional }) => getDateColsChoices(includeOptional, colspec),
  default: ['None'],
  validate: val => {
    const valid = val.includes('None') && val.length === 1 || val.length > 0
    return valid || 'Please select one or more columns OR "None"'
  },
  when: ({ includeOptional }) => getDateColsChoices(includeOptional, colspec).length > 1,
}

export const whichColumnsShouldHaveLatLonAltered = {
  type: 'checkbox',
  name: 'geoColsToMangle',
  message: 'Select which lat/lon columns should have their values altered between SOURCE and TARGET',
  choices: ({ includeOptional }) => getGeoColsChoices(includeOptional, colspec),
  default: ['None'],
  validate: val => {
    const valid = val.includes('None') && val.length === 1 || val.length > 0
    return valid || 'Please select one or more columns OR "None"'
  },
  when: ({ includeOptional }) => getGeoColsChoices(includeOptional, colspec).length > 1,
}

