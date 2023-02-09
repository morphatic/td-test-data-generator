/**
 * Generators
 * 
 * This module accepts a completed `answers` array and processes it to produce
 * the test data sets based on a `colspec`.
 * 
 * @module
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { faker } from '@faker-js/faker'
import { omit } from 'ramda'
import { pascalCase, snakeCase } from 'change-case'
import { getRequiredCols } from './colspecUtilities.mjs'

// extract this commonly-used helper function
const { unique } = faker.helpers
// list of props to omit from column specs before value generation
const nonParams = ['name', 'variants', 'cat', 'type', 'unique', 'convert', 'opts']

Date.prototype.toString = Date.prototype.toISOString

/**
 * 
 * @param   {array}  answers The array of answers to CLI questions
 * @param   {array}  colspec The array of column specifications
 * @returns {object}         A JSON object containing SOURCE and TARGET data arrays
 */
export const generate = (answers, colspec) => {
  const {
    includeOptional,
    sourceCount: rows,
    rowDiff: diff,
    colsRandomized,
    mangleColNames,
    floatColsToTweak,
    dateColsToMangle,
    geoColsToMangle
  } = answers

  // Remove optional columns if not being generated
  colspec = includeOptional ? colspec : getRequiredCols(colspec)

  // Generate the base SOURCE table with standard headers, column order
  // and rowCount === max(SOURCE, TARGET) so rows can be removed from one later
  let source = colspec.reduce((src, c, i, cs) => {
    // generate all headers on the first iteration
    if (i === 0) {
      src[0] = generateHeaders(cs, false)
    }
    const params = c.opts ? omit(nonParams, c) : Object.values(omit(nonParams, c))
    const rowCount = diff > 0 ? rows + diff : rows
    src.push(generateValues(c, params, rowCount))
    if (c.convert) {
      src[i+1] = src[i+1].map(Number)
    }
    return src
  }, [])

  // deep clone SOURCE into TARGET
  let target = JSON.parse(JSON.stringify(source))
  
  if (floatColsToTweak && floatColsToTweak[0] !== 'None') {
    target = mangleColumns(target, floatColsToTweak, 'float')
  }
  
  if (dateColsToMangle && dateColsToMangle[0] !== 'None') {
    target = mangleColumns(target, dateColsToMangle, 'date')
  }
  
  if (geoColsToMangle && geoColsToMangle[0] !== 'None') {
    target = mangleColumns(target, geoColsToMangle, 'geo')
  }

  if (mangleColNames && mangleColNames[0] !== 'None') {
    target = mangleColumnNames(target, mangleColNames, colspec)
  }

  /**
   * Randomize column order in TARGET, if requested
   */
  if (colsRandomized) {
    target = shuffleColumns(target)
  }

  // transpose both tables
  source = [source[0], ...transpose(source.slice(1))]
  target = [target[0], ...transpose(target.slice(1))]

  // remove `diff` rows from the shorter table at random
  if (diff > 0) {
    source = removeRandomRows(source, diff)
  } else if (diff < 0) {
    target = removeRandomRows(target, Math.abs(diff))
  }

  return { source, target }
}

export const generateCsv = data => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const sourcePath = `${__dirname.replace('src', 'output')}${path.sep}source_${new Date().getTime()}.csv`
  const targetPath = `${__dirname.replace('src', 'output')}${path.sep}target_${new Date().getTime()}.csv`
  const sourceContent = convertToCsv(data.source)
  const targetContent = convertToCsv(data.target)
  try {
    fs.writeFileSync(sourcePath, sourceContent)
    fs.writeFileSync(targetPath, targetContent)
  } catch (e) {
    console.log(e)
  }
}

/**
 * Generates (possibly mangled) headers from a colspec
 * 
 * @param   {array}   colspec The array of column specifications
 * @param   {boolean} mangle  Should colnames be mangled
 * @returns {array}           An array of column headers
 */
const generateHeaders = (colspec, mangle) =>
  colspec.map(cs => mangle ? mangleName(cs.variants) : pascalCase(cs.name))

/**
 * Generate all of the values for given column specification
 * 
 * @param   {object}       col    The column specification from which to generate values
 * @param   {object|array} params The parameters for the Faker function
 * @param   {number}       num    The number of values to generate
 * @returns {array}               An array of randomly generated values
 */
const generateValues = (col, params, num) => {
  const f = faker[col.cat][col.type]
  let gen
  if (col.unique) {
    gen = () => col.opts ? unique(() => f(params)) : unique(() => f(...params))
  } else {
    gen = () => col.opts ? f(params) : f(...params)
  }
  let output
  try {
    output = Array.from({ length: num }).map(gen)
  } catch (e) {
    console.log('generateValues failed:', col, params, num)
    console.log(e)
  }
  return output
}

/**
 * Returns a snake cased variant from the column names submitted
 *
 * @param   {array}  variants Array of plausible name variants
 * @returns {string}          The snake cased variant selected
 */
const mangleName = variants => snakeCase(randomItem(variants))

/**
 * Randomly select an item from an array of items
 * 
 * @param   {array} items Any array of items
 * @returns {*}           A single item from the array chosen randomly
 */
const randomItem = items => items[Math.floor(Math.random() * items.length)]

/**
 * Transposes a 2D array, convert rows into columns or vice versa
 * source: https://stackoverflow.com/a/52746426/296725
 * 
 * @param   {array} table The 2D array to be transposed, any number of rows/columns okay
 * @returns {array}       The transposed array
 */
const transpose = table => table.reduce((r, a) => a.map((v, i) => [...(r[i] || []), v]), [])

/**
 * Takes a number and adds a small decimal amount to it by generating a random 
 * number [0, 1), multiplies it by 1000, rounds it, then multiplies by .0000001,
 * to get, e.g. 0.0000342
 * 
 * @param   {number} number The number to which a small amount will be added
 * @returns                 A number with a small amount added to it
 */
const addSmallValue = number => number + (Math.round(Math.random() * 1000) * .0000001)

/**
 * Maybe adds a small amount to a float. Generates a random number [0, 1), multiplies
 * it by 1000, rounds it, then multiplies by .0000001, to get, e.g. 0.0000342
 * 
 * @param   {number} number The number to which a small value will be added
 * @returns {number}        The original number with a small amount maybe added
 */
const maybeAddSmallValue = number => Math.random() < 0.8 ? number : addSmallValue(number)

/**
 * Maybe mangles a date by converting it into a different format than expected
 * 
 * @param   {string} dt Date string in ISO8601 format
 * @returns {string}    Date string in either ISO8601, JS timestamp, or locale string
 */
const maybeMangleDate = dt => {
  const rand = Math.random()
  if (rand < 0.1) {
    return new Date(dt).getTime()
  } else if (rand >= .1 && rand < .2) {
    return new Date(dt).toLocaleString()
  } else {
    return dt
  }
}

/**
 * Takes a latitude or longitude coordinate in decimal form. About 10% of the time it will
 * add a small decimal amount to it. About 5% of the time it will add a very large amount
 * to it putting it out of range for a valid lat/lon coordinate.
 * 
 * @param {number} coord A latitude or longitude in decimal format
 * @returns {number}       The coordinate maybe changed a very small amount or A LOT
 */
const maybeMangleGeo = coord => {
  const rand = Math.random()
  if (rand < 0.1) {
    return addSmallValue(coord)
  } else if (rand >= .1 && rand < .15) {
    return coord < 0 ? coord - 180 : coord + 180
  } else {
    return coord
  }
}

/**
 * Takes the original table and randomly reorders the columns. Keeps the ID column
 * as the first columnn.
 * 
 * @param   {array} original The original table whose columns are to be shuffled
 * @returns {array}          The shuffled table
 */
const shuffleColumns = (original) => {
  const headers = JSON.parse(JSON.stringify(original[0]))
  const newHeaders = [headers[0], ...headers.slice(1).sort(() => 0.5 - Math.random())]
  const newOrder = original[0].map(h => newHeaders.findIndex(h2 => h === h2) + 1)
  newOrder.unshift(undefined) // add a dummy element to the beginning of newOrder
  const shuffled = newOrder.reduce((no, o, i) => {
    if (i === 0) {
      no[0] = newHeaders
    } else {
      no[o] = original[i]
    }
    return no
  }, Array.from({ length: original.length }))
  return shuffled
}

/**
 * Takes a 2D array (array of rows) and converts it into CSV string format
 * 
 * @param   {array}  tableArray The 2D array to be converted to CSV
 * @returns {string}            A CSV-formatted string representing the table
 */
const convertToCsv = tableArray => tableArray.reduce((content, row) => {
  content += row.reduce((csv, val, i, row) => {
    csv += typeof val === 'number' ? `,${val}` : `,"${val}"`
    if (i === 0) {
      csv = csv.replace(',', '')
    }
    if (i === row.length - 1) {
      csv += '\n'
    }
    return csv
  }, '')
  return content
}, '')

/**
 * Removes some number of random rows from a table. It will NOT remove the header row.
 * 
 * @param   {array}  table The table from which rows are to be removed
 * @param   {number} num   The number of rows to remove
 * @returns {array}        The resulting table with rows removed
 */
const removeRandomRows = (table, num)   => {
  const header = table[0]
  const dataRows = table.slice(1)
  const _ = Array.from({ length: num })
    .map(() => Math.floor(Math.random() * dataRows.length))
    .sort((a, b) => b - a) // descending order
    .map(n => dataRows.splice(n, 1))
  return [header, ...dataRows]
}

/**
 * Takes a table as a 2D array, a list of columns to maybe mangle and the
 * type of columns to be mangled. Returns the updated table with approximately
 * 20% of the values in the mangled columns having new values.
 * 
 * @param   {array}  table       The table whose columns are to be mangled
 * @param   {array}  colsToTweak The columns to be mangled
 * @param   {string} type        The type of mangling to do
 * @returns {array}              The table with mangled columns
 */
const mangleColumns = (table, colsToMangle, type) => {
  const tweakedFloatCols = colsToMangle.map(pascalCase)
  const indices = tweakedFloatCols.reduce((idc, col) => {
    const i = table[0].findIndex(el => el === col)
    if (i !== -1) {
      idc.push(i + 1) // +1 accounts for existence of header row
    }
    return idc
  }, [])
  return table.reduce((t, _, i) => {
    if (indices.includes(i)) {
      switch (type) {
        case 'float':
          t[i] = table[i].map(maybeAddSmallValue)
          break
        case 'date':
          t[i] = table[i].map(maybeMangleDate)
          break
        case 'geo':
          t[i] = table[i].map(maybeMangleGeo)
          break
      }
    } else {
      t[i] = table[i]
    }
    return t
  }, [])
}

/**
 * Takes a table as a 2D array, a list of columns to mangle and the specifications by
 * which the columns were created (which contains column name variants). For each of the
 * specified columns, a variant is chosen at random and converted to snake case. Then
 * the whole table is returned.
 * 
 * @param   {array} table           The table to have its column names mangled
 * @param   {array} columnsToMangle The list of columns to mangle the names of
 * @param   {array} columnSpec      The column specifications
 * @returns {array}                 The table with column names mangled
 */
const mangleColumnNames = (table, columnsToMangle, columnSpec) => {
  const colNamesToMangle = columnsToMangle.map(pascalCase)
  table[0] = table[0].map(h => {
    if (colNamesToMangle.includes(h)) {
      const spec = columnSpec.find(s => pascalCase(s.name) === h)
      const variants = [spec.name, ...spec.variants]
      return snakeCase(variants[Math.floor(Math.random() * variants.length)])
    }
    return h
  })
  return table
}
