/**
 * Column Specification Utilities
 * 
 * These are functions for manipulating the column specification objects.
 * 
 * @module colspecUtilities
 */

import { pipe } from 'ramda'

/**
 * Converts the col spec into an array of column names
 * 
 * @param   {array} colSpec An array of objects representing column specifications
 * @returns {array}         An array of strings of column names
 */
export const getColNames = colSpec => colSpec.map(col => col.name)

/**
 * Filters a col spec to just the required columns
 * 
 * @param   {array} colspec An array of objects representing column specifications
 * @returns {array}         An array of colspec objects that are required
 */
export const getRequiredCols = colspec => colspec.filter(col => !col.optional)

/**
 * Filters a col spec to just the optional columns
 * 
 * @param   {array} colspec An array of objects representing column specifications
 * @returns {array}         An array of colspec objects that are optional
 */
export const getOptionalCols = colspec => colspec.filter(col => col.optional)

/**
 * Filters a col spec to just the columns with float values
 * 
 * @param   {array} colspec An array of objects representing column specifications
 * @returns {array}         An array of colspec objects that have floats for values
 */
export const getFloatCols = colspec => colspec.filter(col => col.dec && col.dec > 0)

/**
 * Filters a col spec to just the columns with name variants
 * 
 * @param   {array} colspec An array of objects representing column specifications
 * @returns {array}         An array of colspec objects that have name variants
 */
export const getColsWithNameVariants = colspec => colspec.filter(col => col.variants && col.variants.length > 0)

/**
 * Filters a col spec to just the columns with date values
 * 
 * @param   {array} colspec An array of objects representing column specifications
 * @returns {array}         An array of colspec objects that have date values
 */
export const getDateCols = colspec => colspec.filter(col => col.cat === 'date')

/**
 * Filters a col spec to just the columns with lat/lon values
 * 
 * @param   {array} colspec An array of objects representing column specifications
 * @returns {array}         An array of colspec objects that have lat/lon values
 */
export const getGeoCols = colspec => colspec.filter(col => ['latitude', 'longitude'].includes(col.type))

/**
 * Returns the colspec list selected by the user
 * 
 * @param   {boolean} opts    A boolean indicating whether optional columns should be included
 * @param   {array}   colspec An array of objects representing column specifications
 * @returns {array}           The array of colspec objects selected by the user
 */
export const getSelectedCols = (opts, colspec) => opts ? colspec : getRequiredCols(colspec)

/**
 * Adds the "None" choice to the beginning of `choices` lists for checkbox questions
 * 
 * @param   {array} colNames An array of column names
 * @returns {array}          The array of column names with "None" added to the beginning
 */
export const addNone = colNames => ['None', ...colNames]

/**
 * Returns an array of column names that are candidates for being mangled in TARGET
 * 
 * @param   {boolean} opts    A boolean indicating whether optional columns should be included
 * @param   {array}   colspec An array of objects representing column specifications
 * @returns {array}           The array of mangleable column names
 */
export const getColsToMangleChoices = (opts, colspec) => pipe(getSelectedCols, getColsWithNameVariants, getColNames, addNone)(opts, colspec)

/**
 * Returns an array of column names for columns containing floats that are candidates for
 * being changed in TARGET
 * 
 * @param   {boolean} opts    A boolean indicating whether optional columns should be included
 * @param   {array}   colspec An array of objects representing column specifications
 * @returns {array}           The array of column names that contain floats to change
 */
export const getFloatColsChoices = (opts, colspec) => pipe(getSelectedCols, getFloatCols, getColNames, addNone)(opts, colspec)

/**
 * Returns an array of column names for columns containing dates that are candidates for
 * being changed in TARGET
 * 
 * @param   {boolean} opts    A boolean indicating whether optional columns should be included
 * @param   {array}   colspec An array of objects representing column specifications
 * @returns {array}           The array of column names that contain dates to change
 */
export const getDateColsChoices = (opts, colspec) => pipe(getSelectedCols, getDateCols, getColNames, addNone)(opts, colspec)

/**
 * Returns an array of column names for columns containing lat/lon that are candidates for
 * being changed in TARGET
 * 
 * @param   {boolean} opts    A boolean indicating whether optional columns should be included
 * @param   {array}   colspec An array of objects representing column specifications
 * @returns {array}           The array of column names that contain lat/lon to change
 */
export const getGeoColsChoices = (opts, colspec) => pipe(getSelectedCols, getGeoCols, getColNames, addNone)(opts, colspec)
