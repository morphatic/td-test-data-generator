/**
 * Main Module
 * 
 * This is where the CLI tool is configured that calls all of the
 * subordinate functions.
 * 
 * @module
 */

import fs from 'fs'
import inquirer from 'inquirer'
import { generate, generateCsv } from './src/generators.mjs'
import {
  shouldOptionalColumnsBeIncluded,
  howManyRowsShouldBeInSource,
  howManyRowsShouldTargetBeRelativeToSource,
  shouldColumnOrderBeAltered,
  whichColumnsShouldHaveDifferentNames,
  whichColumnsShouldHaveFloatsAltered,
  whichColumnsShouldHaveDatesAltered,
  whichColumnsShouldHaveLatLonAltered,
} from './src/questions.mjs'
import colspec from './colspec.json' assert { type: 'json' }

/**
 * This function starts the CLI tool's Q&A process and then
 * processes and writes the results to the `output/` directory.
 */
inquirer
  .prompt([
    shouldOptionalColumnsBeIncluded,
    howManyRowsShouldBeInSource,
    howManyRowsShouldTargetBeRelativeToSource,
    shouldColumnOrderBeAltered,
    whichColumnsShouldHaveDifferentNames,
    whichColumnsShouldHaveFloatsAltered,
    whichColumnsShouldHaveDatesAltered,
    whichColumnsShouldHaveLatLonAltered,
  ])
  .then((answers) => {
    const output = generate(answers, colspec)
    const csvs = generateCsv(output)
    try {
      fs.writeFileSync(csvs.source.path, csvs.source.content)
      fs.writeFileSync(csvs.target.path, csvs.target.content)
    } catch (e) {
      console.log(e)
    }
    })
  .catch(error => {
    if (error.isTtyError) {
      // prompt could not be rendered in current environment
    } else {
      // something else went wrong
    }
    console.log(error)
  })
