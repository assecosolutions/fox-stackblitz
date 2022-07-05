const { execSync } = require('child_process');
const { writeFileSync, appendFileSync, readFileSync } = require('fs');

const updateFoxPackages = () => {
  execSync('rm -f errors/*.log');
  execSync('rm -f src/main.fox.ts');
  execSync('rm -f package-lock.json');

  const packages = JSON.parse(
    execSync(
      'npm search --searchlimit=100 @assecosolutions/fox- --json'
    ).toString()
  )
    .map((pkg) => pkg.name)
    .sort();

  packages.forEach((pkg) => {
    console.log('installing / updating: ' + pkg);
    const pkgInfo = JSON.parse(execSync(`npm view ${pkg} --json`));
    const versions = Object.keys(pkgInfo.time);
    const lastPublishedVersion = versions[versions.length - 1];

    if (pkgInfo.deprecated) {
      console.log('Skipping deprecated package: ', pkg);
      return;
    }

    try {
      execSync(`npm install --save -E ${pkg}@${lastPublishedVersion}`);
    } catch (error) {
      execSync(`npm install --save -E --force ${pkg}@${lastPublishedVersion}`);
      writeFileSync(`errors/${pkg.split('/')[1]}.log`, error.stderr.toString());
    }

    appendFileSync('src/main.fox.ts', `import \'${pkg}\';\n`);
  });
};

const removeFoxPackages = () => {
  const packageJson = JSON.parse(readFileSync('package.json').toString());

  Object.keys(packageJson.dependencies).forEach((p) => {
    if (p.startsWith('@assecosolutions/fox')) {
      delete packageJson.dependencies[p];
    }
  });

  writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
};

removeFoxPackages();
updateFoxPackages();
