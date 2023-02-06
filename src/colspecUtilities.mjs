/**
 * Column Specicifation Utilities
 * 
 * These are functions for manipulating the colspec
 * 
 * @module
 */

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
