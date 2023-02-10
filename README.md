# Test Data Generator

Test data generator for generating dummy data for data quality engineering projects.

## Quick Start

From the terminal,

1. Clone this repo
2. `cd test-data-generator`
3. `npm install`
4. `npm -s start`
5. Answer the questions
6. Test data will be in the `output/` directory

## How To Use the Generator

Here are instructions for using the generator to create test data that conforms to your own specifications.

### What can the generator do?

The generator generates TWO tables in `.csv` format: a `SOURCE` and a `TARGET` table. You have control over:

1. The number of records generated in the SOURCE file
2. Whether or not to include optional columns?
3. The modifications made to the TARGET dataset:
   1. How many greater/fewer rows in `TARGET` vs. `SOURCE`
   2. Should column order be randomized?
   3. Should column names use similar but different formats between the tables?
   4. Should small amounts be added to floats in some columns?
   5. Should dates be modified to include some different or invalid values?
   6. Should lat/lon values be modified to include some invalid values?

### The `colspec.json` Column Specifications File

The structure of the generated tables is determined by a file called `colspec.json` that is stored in the root directory of the project. (There's another `colspec.json` in the `test/` directory, but ignore that one.) This file is an array of JSON objects, where each object represents one column in the generated tables. Here's what a column specification looks like:

```js
[
   {
      "name": "Txn Amount", // default name of the column
      "variants": [         // alternative names for the column
         "Txn Amt",
         "Amount of Txn"
      ],
      "cat": "finance",     // category of data generator from the @faker-js/faker library
      "type": "amount",     // @faker-js/faker generator function name
      "convert": true,      // `true` if the value generated needs to be converted to a number,
                            //    otherwise this can be omitted
      "min": 100,           // list of parameters values to be submitted to the faker function
      "max": 99999,
      "dec": 2,
      "optional": true      // columns marked as "optional" don't have to be generated
   },
   {
      "name": "id",
      "cat": "datatype",
      "type": "number",
      "opts": true,         // some faker functions require parameters to be submitted as an
                            //   `options` object. setting `"opts": true` is indicates this
      "unique": true,       // setting `unique` to `true` makes the generated values globally
                            //   uniquewithin the scope of the table
      "min": 100001,
      "max": 999999,
      "precision": 1
   },
   // ...other column specs here
]
```

### The `@faker-js/faker` Library

[`@faker-js/faker`](https://www.npmjs.com/package/@faker-js/faker) is a JavaScript library for generating fake data. It has [quite excellent documentation](https://fakerjs.dev/api/). This project is basically just a CLI wrapper around Faker. In theory, you can use *any* of the Faker functions in your column specifications by specifying the appropriate category and function name in the `cat` and `type` fields for the column specs. In practice, only the generators used in the provided `colspec.json` have been tested.

## Tests and Coverage

This project is fully unit tested. e2e tests have been planned but not implemented yet (see issues: [#1](https://github.com//morphatic/test-data-generator/issues/1) and [#2](https://github.com//morphatic/test-data-generator/issues/2)). Tests can be run from the command line using `npm test`. Running `npm run coverage` will run the tests and produce a coverage report both a summary in the terminal, and a full analysis in `coverage/lcov-report/index.html`.

## Questions

Questions about this library should be directed to morgan.benton@gmail.com, or if you work with me, to my work email.
