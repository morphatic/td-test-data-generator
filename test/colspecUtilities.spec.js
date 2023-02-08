import {
  getColNames,
  getRequiredCols,
  getOptionalCols,
  getFloatCols,
  getColsWithNameVariants,
  getDateCols,
  getGeoCols,
  getSelectedCols,
  getColsToMangleChoices,
  getFloatColsChoices,
  getDateColsChoices,
  getGeoColsChoices,
} from '../src/colspecUtilities.mjs'

// using a standard set of column specificatins for testing
import baseColSpec from './colspec.json' assert { type: 'json' }

describe('Column Specification Helpers', () => {

  let colspec

  beforeEach(() => {
    // initialize `colspec` with a deep copy of `baseColSpec`
    colspec = JSON.parse(JSON.stringify(baseColSpec))
  })  


  it('can extract the column names', () => {
    const colNames = getColNames(colspec)

    expect(Array.isArray(colNames)).toBe(true)
    expect(colNames.every(n => typeof n === 'string')).toBe(true)
  })

  it('can get optional columns', () => {
    const optionalCols = getOptionalCols(colspec)

    expect(optionalCols.every(c => c.optional)).toBe(true)
  })

  it('can get required columns', () => {
    const requiredCols = getRequiredCols(colspec)

    expect(requiredCols.every(c => !c.optional)).toBe(true)
  })

  it('can get columns with float values', () => {
    const floatCols = getFloatCols(colspec)

    expect(floatCols.every(c => c.dec && c.dec > 0)).toBe(true)
  })

  it('can get columns with name variants', () => {
    const variantCols = getColsWithNameVariants(colspec)

    expect(variantCols.every(c => c.variants && c.variants.length > 0)).toBe(true)
  })

  it('can get columns with date values', () => {
    const dateCols = getDateCols(colspec)

    expect(dateCols.every(c => c.cat === 'date')).toBe(true)
  })

  it('can get columns with lat/lon values', () => {
    const geoCols = getGeoCols(colspec)

    expect(geoCols.every(c => ['latitude', 'longitude'].includes(c.type))).toBe(true)
  })

  it('can get columns with lat/lon values', () => {
    const withOpts = getSelectedCols(true, colspec)
    const withoutOpts = getSelectedCols(false, colspec)

    expect(withOpts.length > withoutOpts.length).toBe(true)
  })

  it('can create a list of column names whose names can be mangled', () => {
    const includeOpts = true
    const colsWithVariants = getColsWithNameVariants(colspec)
    const requiredColsWithVariants = getColsWithNameVariants(getRequiredCols(colspec))
    const allColNames = getColsToMangleChoices(includeOpts, colspec)
    const requiredColNames = getColsToMangleChoices(!includeOpts, colspec)

    expect(allColNames[0]).toBe('None')
    expect(allColNames.length).toBe(colsWithVariants.length + 1)
    expect(requiredColNames[0]).toBe('None')
    expect(requiredColNames.length).toBe(requiredColsWithVariants.length + 1)
  })

  it('can create a list of column names whose floats can be changed', () => {
    const includeOpts = true
    const colsWithFloats = getFloatCols(colspec)
    const requiredColsWithFloats = getFloatCols(getRequiredCols(colspec))
    const allColNames = getFloatColsChoices(includeOpts, colspec)
    const requiredColNames = getFloatColsChoices(!includeOpts, colspec)

    expect(allColNames[0]).toBe('None')
    expect(allColNames.length).toBe(colsWithFloats.length + 1)
    expect(requiredColNames[0]).toBe('None')
    expect(requiredColNames.length).toBe(requiredColsWithFloats.length + 1)
  })

  it('can create a list of column names whose dates can be changed', () => {
    const includeOpts = true
    const colsWithDates = getDateCols(colspec)
    const requiredColsWithDates = getDateCols(getRequiredCols(colspec))
    const allColNames = getDateColsChoices(includeOpts, colspec)
    const requiredColNames = getDateColsChoices(!includeOpts, colspec)

    expect(allColNames[0]).toBe('None')
    expect(allColNames.length).toBe(colsWithDates.length + 1)
    expect(requiredColNames[0]).toBe('None')
    expect(requiredColNames.length).toBe(requiredColsWithDates.length + 1)
  })

  it('can create a list of column names whose lat/lon can be changed', () => {
    const includeOpts = true
    const colsWithGeo = getGeoCols(colspec)
    const requiredColsWithGeo = getGeoCols(getRequiredCols(colspec))
    const allColNames = getGeoColsChoices(includeOpts, colspec)
    const requiredColNames = getGeoColsChoices(!includeOpts, colspec)

    expect(allColNames[0]).toBe('None')
    expect(allColNames.length).toBe(colsWithGeo.length + 1)
    expect(requiredColNames[0]).toBe('None')
    expect(requiredColNames.length).toBe(requiredColsWithGeo.length + 1)
  })
})
