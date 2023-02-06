import {
  getColNames,
  getRequiredCols,
  getOptionalCols,
  getFloatCols,
  getColsWithNameVariants,
  getDateCols,
  getGeoCols,
  getSelectedCols,
} from '../src/colspecUtilities.mjs'


describe('Column Specification Helpers', () => {

  let colspec

  beforeEach(() => {
    colspec = [
      {
        name: 'id',
        cat: 'datatype',
        type: 'number',
        unique: true,
        precision: 1,
        min: 10001,
        max: 99999
      },
      {
        name: 'Transaction Date',
        variants: [
          'Txn Date',
          'Date of Transaction'
        ],
        cat: 'date',
        type: 'past',
        refDate: 'now',
        years: 3
      },
      {
        name: 'Verification Date',
        variants: [
          'Verified Date',
          'Date Verified'
        ],
        cat: 'date',
        type: 'soon',
        refDate: 'Transaction Date',
        days: 7
      },
      {
        name: 'Transaction Amount',
        variants: [
          'Txn Amt',
          'Amount of Transaction'
        ],
        cat: 'finance',
        type: 'amount',
        dec: 2,
        min: 100,
        max: 99999
      },
      {
        name: 'Transaction Fee',
        variants: [
          'Txn Fee',
          'Fee for Transaction'
        ],
        type: 'number',
        ref: 'Transaction Amount',
        pct: 2,
        dec: 2
      },
      {
        name: 'From',
        variants: [
          'Sender',
          'Origin'
        ],
        cat: 'finance',
        type: 'account'
      },
      {
        name: 'To',
        variants: [
          'Receiver',
          'Destination'
        ],
        cat: 'finance',
        type: 'account'
      },
      {
        name: 'Sender Name',
        variants: [
          'From Name',
          'Origin Name'
        ],
        cat: 'company',
        type: 'name'
      },
      {
        name: 'Receiver Name',
        variants: [
          'To Name',
          'Destination Name'
        ],
        cat: 'company',
        type: 'name'
      },
      {
        name: 'Account Type',
        variants: [
          'Acct Type',
          'Type of Account'
        ],
        cat: 'commerce',
        type: 'department'
      },
      {
        name: 'From Latitude',
        variants: [
          'From Lat',
          'Sender Lat'
        ],
        cat: 'address',
        type: 'latitude',
        optional: true
      },
      {
        name: 'From Longitude',
        variants: [
          'From Long',
          'Sender Lon'
        ],
        cat: 'address',
        type: 'longitude',
        optional: true
      },
      {
        name: 'To Latitude',
        variants: [
          'To Lat',
          'Receiver Lat'
        ],
        cat: 'address',
        type: 'latitude',
        optional: true
      },
      {
        name: 'To Longitude',
        variants: [
          'To Long',
          'Receiver Lon'
        ],
        cat: 'address',
        type: 'longitude',
        optional: true
      }
    ]
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
})
