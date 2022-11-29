// --------------------------------------------------------------------------------------------------------------------
function normalConsole(data,title="Chalk Log") {
  console.log(chalk.red(`_________START ${title}____________\n`))
  var log =console.log(data);
  console.log(chalk.red(`__________END___________\n`))
  return log
}// --------------------------------------------------------------------------------------------------------------------
function normalConsole(data) {
  var log =console.log(data)
  return log
}

module.exports.normalConsole = normalConsole

module.exports={
    normalConsole
}
