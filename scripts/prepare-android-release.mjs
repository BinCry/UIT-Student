import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const credentialsPath = path.join(projectRoot, 'credentials.json');
const buildGradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');
const keyPropertiesPath = path.join(projectRoot, 'android', 'key.properties');

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(credentialsPath)) {
  fail('Missing credentials.json. Download Android credentials from EAS before building locally.');
}

if (!fs.existsSync(buildGradlePath)) {
  fail('Missing android/app/build.gradle. Run expo prebuild before preparing a release build.');
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const keystore = credentials?.android?.keystore;

if (!keystore?.keystorePath || !keystore.keystorePassword || !keystore.keyAlias || !keystore.keyPassword) {
  fail('credentials.json is missing required Android keystore fields.');
}

const keystoreAbsolutePath = path.resolve(projectRoot, keystore.keystorePath);
if (!fs.existsSync(keystoreAbsolutePath)) {
  fail(`Keystore file not found: ${keystoreAbsolutePath}`);
}

const relativeKeystorePath = path.relative(path.join(projectRoot, 'android'), keystoreAbsolutePath).replace(/\\/g, '/');

const keyPropertiesContent = [
  `storeFile=${relativeKeystorePath}`,
  `storePassword=${keystore.keystorePassword}`,
  `keyAlias=${keystore.keyAlias}`,
  `keyPassword=${keystore.keyPassword}`,
  '',
].join('\n');

fs.writeFileSync(keyPropertiesPath, keyPropertiesContent);

let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

const keystoreBootstrap = `apply plugin: "com.facebook.react"

def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

`;

if (!buildGradle.includes('def keystorePropertiesFile = rootProject.file("key.properties")')) {
  buildGradle = buildGradle.replace('apply plugin: "com.facebook.react"\n\n', keystoreBootstrap);
}

if (!buildGradle.includes('signingConfigs.release')) {
  buildGradle = buildGradle.replace(
    `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`,
    `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile rootProject.file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }`
  );
}

buildGradle = buildGradle.replace(
  /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?^\s*)signingConfig\s+.*$/m,
  `$1signingConfig keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug`
);

fs.writeFileSync(buildGradlePath, buildGradle);

console.log('Prepared Android release signing.');
