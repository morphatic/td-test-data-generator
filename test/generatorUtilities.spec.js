/**
 * Unit tests for the utility functions used to support test data generation.
 * Because MANY of the functions below involve random value generation, the
 * general approach is to run them 1000 (or more) times and set our expectation
 * that the proportion of values with a given value is within an expected range,
 * e.g. when randomly selecting one value from a list of four values, each value
 * should be selected approximately 25% +/- 5% of the time, i.e. between 20% and
 * 30% of the time.
 * 
 * @module
 */

import { expect } from '@jest/globals'
import { toBeBetween } from './toBeBetween.mjs'
import {
  randomItem,
  mangleName,
  transpose,
  addSmallValue,
  maybeAddSmallValue,
  maybeMangleDate,
  maybeMangleGeo,
  shuffleColumns,
  convertToCsv,
  removeRandomRows,
  mangleColumns,
  mangleColumnNames,
} from '../src/generatorUtilities.mjs'
import testTable from './test_table.json' assert { type: 'json' }
import colspec from './colspec.json' assert { type: 'json' }


expect.extend({
  toBeBetween,
})

describe('Test Generation Utilities', () => {
  it('can select an item at random from an array', () => {
    // from a set of 4 items
    const items = ['A', 'B', 'C', 'D']
    
    // select a large number at random
    const selections = Array.from({ length: 1000 }).map(() => randomItem(items))

    // calculate the proportion of times each item was selected
    const a = selections.reduce((as, i) => { as += i === 'A' ? 1 : 0; return as}, 0) / 1000
    const b = selections.reduce((bs, i) => { bs += i === 'B' ? 1 : 0; return bs}, 0) / 1000
    const c = selections.reduce((cs, i) => { cs += i === 'C' ? 1 : 0; return cs}, 0) / 1000
    const d = selections.reduce((ds, i) => { ds += i === 'D' ? 1 : 0; return ds}, 0) / 1000
    
    // expect each to be selecte approximately 25% of the time
    expect(a).toBeBetween(0.2, 0.3)
    expect(b).toBeBetween(0.2, 0.3)
    expect(c).toBeBetween(0.2, 0.3)
    expect(d).toBeBetween(0.2, 0.3)
  })

  it('can generate a random variation on a column name', () => {
    const variants = [
      'Sale Date',
      'Date of Sale',
      'Sale Dt'
    ]
    const variations = Array.from({ length: 1000 }).map(() => mangleName(variants))
    const var1 = variations.reduce((v, i) => { v += i === 'sale_date' ? 1 : 0; return v}, 0) / 1000
    expect(var1).toBeBetween(0.28, 0.38)
  })

  it('can transpose a 2D array', () => {
    const input = [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
    ]
    const output = transpose(input)
    const expected = [
      [1, 1, 1],
      [2, 2, 2],
      [3, 3, 3],
      [4, 4, 4],
      [5, 5, 5],
    ]

    expect(output).toEqual(expected)
  })

  it('can add a small decimal fraction to a number', () => {
    expect(addSmallValue(5)).toBeBetween(5, 5.1)
  })

  it('can MAYBE add a small decimal fraction to a number', () => {
    const maybes = Array.from({ length: 1000 }).map(() => maybeAddSmallValue(5))
    const added = maybes.reduce((m, i) => { m += i > 5 ? 1 : 0; return m}, 0) / 1000
    // expecting about 20% to have had a small amount added to them
    expect(added).toBeBetween(0.15, 0.25)
  })

  it('can maybe mangle a date value', () => {
    const ds = '1974-02-17T23:30:00.000Z'
    const maybes = Array.from({ length: 1000 }).map(() => maybeMangleDate(ds))
    const ts = new Date(ds).getTime()
    const locale = new Date(ds).toLocaleString()
    const stamps = maybes.reduce((s, i) => { s += i === ts ? 1 : 0; return s}, 0) / 1000
    const locales = maybes.reduce((s, i) => { s += i === locale ? 1 : 0; return s}, 0) / 1000

    expect(stamps).toBeBetween(0.05, 0.15)
    // experimentally determined this sometimes needs a buffer as high
    // as 7% on the upper side
    expect(locales).toBeBetween(0, 0.12)
  })

  it('can maybe mangle a lat/lon value', () => {
    const lat = 38.4850022
    const maybes = Array.from({ length: 1000 }).map(() => maybeMangleGeo(lat))
    const tweaks = maybes.reduce((l, i) => { l += i > lat && i < lat + 1 ? 1 : 0; return l}, 0) / 1000
    const mangles = maybes.reduce((s, i) => { s += i === lat + 180 ? 1 : 0; return s}, 0) / 1000

    expect(tweaks).toBeBetween(0.05, 0.15)
    // experimentally determined this sometimes needs a buffer as high
    // as 7% on the upper side
    expect(mangles).toBeBetween(0, 0.12)
  })

  it('can reorder the columns in a table', () => {
    const original = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      [ 1 ,  2 ,  3 ,  4 ,  5 ,  6 ,  7 ],
      ['v', 'w', 'x', 'y', 'z', 'y', 'z'],
      [ 8 ,  7 ,  6 ,  5 ,  4 ,  3 ,  2 ],
      ['l', 'm', 'n', 'o', 'p', 'o', 'p'],
      [ 3 ,  4 ,  5 ,  6 ,  7 ,  8 ,  9 ],
      ['f', 'g', 'h', 'i', 'j', 'i', 'j'],
      [ 0 ,  9 ,  8 ,  7 ,  6 ,  5 ,  4 ],
    ]
    const shuffled = shuffleColumns(original)
    // the first column should still have the same elements
    const originalFirstColumn = original.reduce((ofc, el) => { ofc.push(el[0]); return ofc }, []).sort()
    const shuffledFirstColumn = shuffled.reduce((ofc, el) => { ofc.push(el[0]); return ofc }, []).sort()
    expect(shuffledFirstColumn).toEqual(originalFirstColumn)

    // the first row (headers) should be in a different order, but contain the same elements
    const firstRow = JSON.parse(JSON.stringify(shuffled[0])).sort()
    expect(firstRow).toEqual(original[0])
    expect(shuffled[0]).not.toEqual(original[0])

    // the 2nd row (IDs) should be the same between original and shuffled tables
    expect(shuffled[1]).toEqual(original[1])

    // the order of the rest of the rows should match the new header order
    const newOrder = shuffled[0].slice(1).map(h => original[0].slice(1).findIndex(h2 => h === h2) + 2)
    expect(shuffled[2]).toEqual(original[newOrder[0]])
    expect(shuffled[3]).toEqual(original[newOrder[1]])
    expect(shuffled[4]).toEqual(original[newOrder[2]])
    expect(shuffled[5]).toEqual(original[newOrder[3]])
    expect(shuffled[6]).toEqual(original[newOrder[4]])
    expect(shuffled[7]).toEqual(original[newOrder[5]])
  })

  it('can convert a 2D array into a CSV-formatted string', () => {
    const arrayFormat = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      [ 1 , 'v',  8 , 'l',  3 , 'f',  0 ],
      [ 2 , 'w',  7 , 'm',  4 , 'g',  9 ],
      [ 3 , 'x',  6 , 'n',  5 , 'h',  8 ],
      [ 4 , 'y',  4 , 'o',  6 , 'i',  7 ],
      [ 5 , 'z',  3 , 'p',  7 , 'j',  6 ],
      [ 6 , 'y',  2 , 'o',  8 , 'i',  5 ],
      [ 7 , 'z',  1 , 'p',  9 , 'j',  4 ],
    ]
    const csvFormat = 
      `"A","B","C","D","E","F","G"
        1,"v",8,"l",3,"f",0
        2,"w",7,"m",4,"g",9
        3,"x",6,"n",5,"h",8
        4,"y",4,"o",6,"i",7
        5,"z",3,"p",7,"j",6
        6,"y",2,"o",8,"i",5
        7,"z",1,"p",9,"j",4
      `.replace(/ +/g, '')
    
      const converted = convertToCsv(arrayFormat)
    expect(converted).toBe(csvFormat)
  })

  it('can remove a specified number of rows randomly chosen', () => {
    const fullTable = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      [ 1 , 'v',  8 , 'l',  3 , 'f',  0 ],
      [ 2 , 'w',  7 , 'm',  4 , 'g',  9 ],
      [ 3 , 'x',  6 , 'n',  5 , 'h',  8 ],
      [ 4 , 'y',  4 , 'o',  6 , 'i',  7 ],
      [ 5 , 'z',  3 , 'p',  7 , 'j',  6 ],
      [ 6 , 'y',  2 , 'o',  8 , 'i',  5 ],
      [ 7 , 'z',  1 , 'p',  9 , 'j',  4 ],
    ]

    const shortTable = removeRandomRows(fullTable, 3)

    expect(shortTable.length).toBe(5)
    expect(fullTable.includes(shortTable[0])).toBe(true)
    expect(fullTable.includes(shortTable[1])).toBe(true)
    expect(fullTable.includes(shortTable[2])).toBe(true)
    expect(fullTable.includes(shortTable[3])).toBe(true)
    expect(fullTable.includes(shortTable[4])).toBe(true)
  })

  it('can find and mangle a specified list of columns of a particular datatype', () => {
    /**
     * The `testTable` used here is the `SOURCE` table generated by the CLI with 100 rows
     * and optional (lat/lon) columns included. It's in JSON format BEFORE the rows have
     * been transposed, i.e. every sub array in the 2D array contains a collection of 
     * values of the same data type. Also, column names match the `test/colspec.json` file.
     */
    
    // Floats: mangled column index 4, not mangled 5
    let table = mangleColumns(testTable, ['Transaction Amount'], 'float')
    // Dates: mangled column index 2, not mangled 3
    table = mangleColumns(table, ['Transaction Date'], 'date')
    // Geo: not mangled column indices 11, 14, not mangled 13, 14
    table = mangleColumns(table, ['From Latitude', 'To Longitude'], 'geo')

    // some columns should have mismatches from the original float values
    expect(table[4].every((f, i) => f === testTable[4][i])).not.toBe(true) // mangled
    expect(table[5].every((f, i) => f === testTable[5][i])).toBe(true) // NOT mangled
    
    
    // some columns should NOT be ISO8601 dates, i.e. they are mangled
    const isoRE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
    expect(table[2].every(d => isoRE.test(d))).not.toBe(true) // mangled
    expect(table[3].every(d => isoRE.test(d))).toBe(true) // NOT mangled
    
    // some columns should have mismatches from the original date values
    expect(table[11].every((f, i) => f === testTable[11][i])).not.toBe(true) // mangled
    expect(table[12].every((f, i) => f === testTable[12][i])).toBe(true) // NOT mangled
    expect(table[13].every((f, i) => f === testTable[13][i])).toBe(true) // NOT mangled
    expect(table[14].every((f, i) => f === testTable[14][i])).not.toBe(true) // mangled
    
  })

  it('can mangle a specified list of column names', () => {
    const colNames = colspec.map(spec => spec.name).slice(1) // all but the ID column
    const mangledTable = mangleColumnNames(testTable, colNames, colspec)

    expect(mangledTable[0].slice(1).every((cn, i) => cn !== testTable[0].slice(1)[i])).toBe(true)
  })
})

