/**
 * Utility functions used to generate the test data.
 * 
 * @module generatorUtilities
 */

import { pascalCase, snakeCase } from 'change-case'

/**
 * Randomly select an item from an array of items
 * 
 * @param   {array} items Any array of items
 * @returns {*}           A single item from the array chosen randomly
 */
export const randomItem = items => items[Math.floor(Math.random() * items.length)]

/**
 * Returns a snake cased variant from the column names submitted
 *
 * @param   {array}  variants Array of plausible name variants
 * @returns {string}          The snake cased variant selected
 */
export const mangleName = variants => snakeCase(randomItem(variants))

/**
 * Transposes a 2D array, convert rows into columns or vice versa
 * source: https://stackoverflow.com/a/52746426/296725
 * 
 * @param   {array} table The 2D array to be transposed, any number of rows/columns okay
 * @returns {array}       The transposed array
 */
export const transpose = table => table.reduce((r, a) => a.map((v, i) => [...(r[i] || []), v]), [])

/**
 * Takes a number and adds a small decimal amount to it by generating a random 
 * number [0, 1), multiplies it by 1000, rounds it, then multiplies by .0000001,
 * to get, e.g. 0.0000342
 * 
 * @param   {number} number The number to which a small amount will be added
 * @returns                 A number with a small amount added to it
 */
export const addSmallValue = number => number + (Math.round(Math.random() * 1000) * .0000001)

/**
 * Maybe adds a small amount to a float. Generates a random number [0, 1), multiplies
 * it by 1000, rounds it, then multiplies by .0000001, to get, e.g. 0.0000342
 * 
 * @param   {number} number The number to which a small value will be added
 * @returns {number}        The original number with a small amount maybe added
 */
export const maybeAddSmallValue = number => Math.random() < 0.8 ? number : addSmallValue(number)

/**
 * Maybe mangles a date by converting it into a different format than expected
 * 
 * @param   {string} dt Date string in ISO8601 format
 * @returns {string}    Date string in either ISO8601, JS timestamp, or locale string
 */
export const maybeMangleDate = dt => {
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
export const maybeMangleGeo = coord => {
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
export const shuffleColumns = (original) => {
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
export const convertToCsv = tableArray => tableArray.reduce((content, record) => {
  content += record.reduce((csv, val, i, row) => {
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
export const removeRandomRows = (table, num)   => {
  const header = table[0]
  const dataRows = table.slice(1)
  
  Array.from({ length: num })
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
export const mangleColumns = (table, colsToMangle, type) => {
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
        default:
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
export const mangleColumnNames = (table, columnsToMangle, columnSpec) => {
  // clone the table
  table = JSON.parse(JSON.stringify(table))
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
