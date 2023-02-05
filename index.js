/**
 * Main Module
 * 
 * This is where the CLI tool is configured that calls all of the
 * subordinate functions.
 * 
 * @module
 */

import inquirer from 'inquirer'

inquirer
  .prompt([
    {
      type: 'confirm',
      name: 'isWorking',
      message: 'Does this thing work?',
      default: true,
    },
  ])
  .then(answers => {
    // do something with answers
    console.log('\nOutput')
    console.log(JSON.stringify(answers))
  })
  .catch(error => {
    if (error.isTtyError) {
      // prompt could not be rendered in current environment
    } else {
      // something else went wrong
    }
  })
