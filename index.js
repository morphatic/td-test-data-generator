/**
 * Main Module
 * 
 * This is where the CLI tool is configured that calls all of the
 * subordinate functions.
 * 
 * @module
 */

import inquirer from 'inquirer'
import {
  getColNames,
  getOptionalCols,
  getColsToMangleChoices,
  getFloatColsChoices,
  getDateColsChoices,
  getGeoColsChoices,
} from './src/colspecUtilities.mjs'

import colspec from './colspec.json' assert { type: 'json' }

const optionalColNames = getColNames(getOptionalCols(colspec)).join(', ')

inquirer
  .prompt([
    {
      type: 'confirm',
      name: 'includeOptional',
      message: `Include optional colunns (${optionalColNames})`,
      default: false,
    },
    {
      type: 'input',
      name: 'sourceCount',
      message: 'How many rows should be in the SOURCE data set?',
      default: 100,
      validate: val => !isNaN(parseInt(val)) && val > 0 || 'Please enter a positive integer'
    },
    {
      type: 'input',
      name: 'rowDiff',
      message: 'How many fewer/additinal rows should be in the TARGET data set?',
      default: 0,
      validate: (val, { sourceCount: sc }) =>
           !isNaN(parseInt(val)) 
        && parseInt(sc) - parseInt(val) >= 0
        || `Please enter an integer that will not result in <=0 rows in TARGET: ${sc}`
    },
    {
      type: 'confirm',
      name: 'colsRandomized',
      message: 'Should columns in SOURCE and TARGET be in a different order?',
      default: false,
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ])
  .then(({
    includeOptional,
    sourceCount,
    rowDiff,
    colsRandomized,
    mangleColNames,
    floatColsToTweak,
    dateColsToMangle,
    geoColsToMangle
  } = {
    includeOptional: false,
    sourceCount: 100,
    rowDiff: 15,
    colsRandomized: false,
    mangleColNames: [],
    floatColsToTweak: [],
    dateColsToMangle: [],
    geoColsToMangle: []
  }) => {
    // do something with answers
    console.log('\nOutput')
    console.log(includeOptional,
      sourceCount,
      rowDiff,
      colsRandomized,
      mangleColNames,
      floatColsToTweak,
      dateColsToMangle,
      geoColsToMangle)
  })
  .catch(error => {
    if (error.isTtyError) {
      // prompt could not be rendered in current environment
    } else {
      // something else went wrong
    }
    console.log(error)
  })
