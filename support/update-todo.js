const fs = require('fs')
const { resolve } = require('path')
const outdent = require('outdent')

const fsp = fs.promises

const usesCallbackAsync = string => /from "async.*/.test(string)

const getImplementedNumber = filesUsingCallbacksAsync =>
filesUsingCallbacksAsync.reduce((previusValue, currentValue, currentIndex) =>
  currentValue.usesCallbackAsync
  ? previusValue
  : previusValue + 1
, 0) / filesUsingCallbacksAsync.length

const getImplementedPercentage = filesUsingCallbacksAsync =>
  Math.round(getImplementedNumber(filesUsingCallbacksAsync) * 100)

async function main() {
  const elements = await fsp.readdir(resolve(__dirname, '../lib'))
  const scripts = elements.filter(filename => /.*.ts/.test(filename))
  const filesUsingCallbacksAsync = scripts
    .map(filename => ({
      filename,
      content: fs.readFileSync(resolve(__dirname, '../lib', filename))
    }))
    .map(({ filename, content }) => ({
      filename,
      usesCallbackAsync: usesCallbackAsync(content)
    }))

  const todoContent = renderTodo(filesUsingCallbacksAsync)
  await fsp.writeFile(resolve(__dirname, '../TODO.md'), todoContent)
}

function renderTodo(filesUsingCallbacksAsync) {
  return outdent`
    # Methods that needs to be implemented

    > This file is generated, can be updated using ${'`'}update-todo${'`'}

    Current implement status: ${getImplementedPercentage(filesUsingCallbacksAsync)}%

    ${filesUsingCallbacksAsync.map(renderImplemented).join('\n')}
  `
}

function renderImplemented({ filename, usesCallbackAsync }) {
  return `* [${usesCallbackAsync ? ' ' : 'x'}] ${filename}`
}

main()
  .then(() => console.log('Done'))
  .catch(err => console.error(err))
