# TD Test Data Generator

Test data generator for the TD project.

## Quick Start

1. Clone this repo
2. `cd` into the project directory and run `npm install`
3. Run the code with `npm run`. Test data will be written to the `

## How it Works

This generates TWO tables in `.csv` format: a `SOURCE` and a `TARGET` table.

1. Basic definitions of columns in SOURCE to be generated read in from `colspec.json`.
   1. Base number of records
   2. Include optional columns?
2. Modifications to TARGET can be selected:
   1. How many greater/fewer rows in `TARGET`?
   2. Randomize column order?
   3. Similar but different column names?
   4. Maybe add small amounts to floats in some columns?
   5. Maybe mangle dates?
   6. Maybe mangle lat/lon?
