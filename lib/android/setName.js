const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');

module.exports = async function rename (argv) {
  const { androidSearchPath, name } = argv;

  const androidPath = path.resolve(process.cwd(), androidSearchPath);

  const appNameRegex = /<string name="app_name">(.*)<\/string>/;
  const stringsPath = `${androidPath}/app/src/main/res/values/strings.xml`;
  const strings = fs.readFileSync(`${androidPath}/app/src/main/res/values/strings.xml`, 'utf8');
  const result = appNameRegex.exec(strings);

  console.log('Android: Updating app name from %s to %s', result[1], name);

  const changes = await replace({
    files: [
      stringsPath,
    ],
    from: appNameRegex,
    to: `<string name="app_name">${name}</string>`,
  });


  if (changes.length) {
    console.log('Android: Changed app name from %s to %s in the following files:\n%s', result[1], name, changes.join('\n'))
  } else {
    console.log('Android: App name was already set to %s', name);
  }
}
