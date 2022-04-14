const { execSync } = require('child_process');
const { writeFileSync, appendFileSync } = require('fs');

const updateFoxPackages = () => {
  execSync('rm -f errors/*.log');
  execSync('rm -f src/main.fox.ts');

  const packages = JSON.parse(
    execSync(
      'npm search --searchlimit=100 @assecosolutions/fox- --json'
    ).toString()
  )
    .map((pkg) => pkg.name)
    .sort();

  packages.forEach((pkg) => {
    const pkgInfo = JSON.parse(execSync(`npm view ${pkg} --json`));
    const versions = Object.keys(pkgInfo.time);
    const lastPublishedVersion = versions[versions.length - 1];

    try {
      execSync(`npm install --save -E ${pkg}@${lastPublishedVersion}`);
    } catch (error) {
      execSync(`npm install --save -E --force ${pkg}@${lastPublishedVersion}`);
      writeFileSync(`errors/${pkg.split('/')[1]}.log`, error.stderr.toString());
    }

    appendFileSync('src/main.fox.ts', `import \'${pkg}\';\n`);
  });
};

updateFoxPackages();
