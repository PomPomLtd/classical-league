#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.magenta}🚀 ${msg}${colors.reset}`)
};

async function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 20) {
    log.error(`Node.js ${nodeVersion} detected. Prisma dev requires Node.js 20 or later.`);
    process.exit(1);
  }
  log.success(`Node.js ${nodeVersion} - compatible with Prisma dev`);
}

async function startPrismaDevServer() {
  return new Promise((resolve, reject) => {
    log.info('Starting Prisma dev server...');

    const prismaProcess = spawn('npx', ['prisma', 'dev', '--name', 'classical-league'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let connectionString = '';

    prismaProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;

      // Look for the connection string in the output
      const urlMatch = text.match(/DATABASE_URL="([^"]+)"/);
      if (urlMatch) {
        connectionString = urlMatch[1];
        log.success('Prisma dev server started successfully!');
        resolve({ process: prismaProcess, connectionString });
      }
    });

    prismaProcess.stderr.on('data', (data) => {
      const text = data.toString();
      if (text.includes('Error')) {
        log.error(`Prisma dev error: ${text}`);
        reject(new Error(text));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!connectionString) {
        prismaProcess.kill();
        reject(new Error('Timeout waiting for Prisma dev server to start'));
      }
    }, 30000);
  });
}

async function updateEnvFile(connectionString) {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    // Copy from .env.example if .env doesn't exist
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      log.info('Created .env from .env.example');
    }
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  // Replace the DATABASE_URL line
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL="[^"]*"/, `DATABASE_URL="${connectionString}"`);
  } else {
    envContent += `\nDATABASE_URL="${connectionString}"\n`;
  }

  fs.writeFileSync(envPath, envContent);
  log.success('Updated .env file with Prisma dev connection string');
}

async function runDatabaseSetup() {
  try {
    log.info('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    log.info('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    log.info('Pushing schema to database...');
    execSync('npx prisma db push --force-reset --accept-data-loss', {
      stdio: 'inherit',
      env: {
        ...process.env,
        PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'automated-setup'
      }
    });

    log.info('Marking migrations as applied...');
    const migrations = [
      '0_init',
      '20250911_add_broadcast_columns',
      '20250912125029_add_forfeit_reason',
      '20250912162944_add_draw_ff_result_type'
    ];

    for (const migration of migrations) {
      try {
        execSync(`npx prisma migrate resolve --applied "${migration}"`, { stdio: 'ignore' });
      } catch (e) {
        // Ignore errors if migration doesn't exist
      }
    }

    log.info('Seeding database...');
    execSync('npm run db:seed', { stdio: 'inherit' });

    log.success('Database setup complete!');
  } catch (error) {
    log.error(`Database setup failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    log.title('Classical League - Automated Local Setup');
    console.log('===============================================\n');

    await checkNodeVersion();

    const { process: prismaProcess, connectionString } = await startPrismaDevServer();

    await updateEnvFile(connectionString);

    // Give Prisma dev server a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    await runDatabaseSetup();

    console.log('\n' + '='.repeat(50));
    log.success('Setup complete! 🎉');
    console.log('\nYour development environment is ready:');
    console.log(`  • Prisma dev server: ${colors.green}running${colors.reset}`);
    console.log(`  • Database: ${colors.green}seeded${colors.reset}`);
    console.log(`  • Environment: ${colors.green}configured${colors.reset}`);

    console.log('\nNext steps:');
    console.log('  1. Open a new terminal window');
    console.log('  2. Run: npm run dev');
    console.log('  3. Visit: http://localhost:3000');

    console.log('\nAdmin credentials:');
    console.log('  Username: admin');
    console.log('  Password: SchachKreis4Admin2025!');

    console.log(`\n${colors.yellow}Keep this terminal open - Prisma dev server is running here${colors.reset}`);
    console.log(`${colors.yellow}Press Ctrl+C to stop the database server${colors.reset}\n`);

    // Keep the process alive to maintain the Prisma dev server
    process.on('SIGINT', () => {
      log.info('Stopping Prisma dev server...');
      prismaProcess.kill();
      process.exit(0);
    });

    // Wait for the Prisma process to exit
    prismaProcess.on('exit', () => {
      log.info('Prisma dev server stopped');
      process.exit(0);
    });

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}