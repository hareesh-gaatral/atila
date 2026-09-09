/**
 * ATILA CMS seed / migration script.
 *
 * Reads the static JSON content in src/data/json and imports it into MongoDB
 * as Section documents so the public site can be fully CMS-driven.
 *
 *   npm run seed
 *
 * The script is idempotent and duplicate-safe:
 *   - Sections are upserted by (pageSlug + sectionType); duplicate docs with
 *     the same key are removed (the first one is kept so _id references stay
 *     stable).
 *   - Settings are upserted by key.
 *   - The admin user is upserted by email (password from ADMIN_EMAIL /
 *     ADMIN_PASSWORD env vars, hashed with bcrypt — never plain text).
 *
 * Re-running it simply restores content to the JSON baseline.
 */
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load .env.local (Mongo URI, admin credentials) so the script works with the
// same environment as the Next.js app.
(function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    });
  } catch {
    // .env.local missing — rely on process.env + defaults below.
  }
})();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/atila_website';
const JSON_DIR = path.resolve(__dirname, '..', 'src', 'data', 'json');
const SETTINGS_FILE = path.resolve(__dirname, '..', 'src', 'data', 'settings.json');

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Section mappings: which JSON file becomes which Section document.
// Home page sections drive the homepage; "global" content blocks drive shared
// site chrome (navbar / footer / marquee / wheel).
const SECTION_MAP = [
  { file: 'hero', pageSlug: 'home', pageTitle: 'Home', sectionType: 'hero', order: 10 },
  { file: 'about', pageSlug: 'home', pageTitle: 'Home', sectionType: 'about', order: 20 },
  { file: 'services', pageSlug: 'home', pageTitle: 'Home', sectionType: 'services', order: 30 },
  { file: 'features', pageSlug: 'home', pageTitle: 'Home', sectionType: 'features', order: 40 },
  { file: 'testimonials', pageSlug: 'home', pageTitle: 'Home', sectionType: 'testimonials', order: 50 },
  { file: 'faq', pageSlug: 'home', pageTitle: 'Home', sectionType: 'faq', order: 60 },
  { file: 'cta', pageSlug: 'home', pageTitle: 'Home', sectionType: 'cta', order: 70 },
  { file: 'contact', pageSlug: 'home', pageTitle: 'Home', sectionType: 'contact', order: 80 },
  { file: 'navbar', pageSlug: 'global', pageTitle: 'Global', sectionType: 'navbar', order: 1 },
  { file: 'footer', pageSlug: 'global', pageTitle: 'Global', sectionType: 'footer', order: 2 },
  { file: 'marquee', pageSlug: 'global', pageTitle: 'Global', sectionType: 'marquee', order: 3 },
  { file: 'procurement-wheel', pageSlug: 'global', pageTitle: 'Global', sectionType: 'procurement-wheel', order: 4 },
];

function readJson(file) {
  const filePath = path.join(JSON_DIR, `${file}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Normalize section content for storage. Some JSON files (the marquee logo
 * strip) keep image arrays as plain URL strings; MongoDB stores them as
 * { url } rows so the CMS repeatable item editor and the front-end
 * toImageUrls() helper both consume the same object shape.
 */
function normalizeSectionContent(mapping, content) {
  if (mapping.sectionType === 'marquee' && Array.isArray(content.images)) {
    return {
      ...content,
      images: content.images.map((img) => (typeof img === 'string' ? { url: img } : img)),
    };
  }
  return content;
}

async function upsertSection(db, mapping) {
  const coll = db.collection('sections');
  const content = normalizeSectionContent(mapping, readJson(mapping.file));
  const filter = { pageSlug: mapping.pageSlug, sectionType: mapping.sectionType };
  const existing = await coll.find(filter).sort({ order: 1, createdAt: 1 }).toArray();

  const doc = {
    ...content,
    pageTitle: mapping.pageTitle,
    pageSlug: mapping.pageSlug,
    sectionType: mapping.sectionType,
    order: mapping.order,
    isActive: true,
  };

  if (existing.length > 0) {
    const keepId = existing[0]._id;
    // Remove duplicates for the same (pageSlug, sectionType).
    if (existing.length > 1) {
      await coll.deleteMany({ _id: { $nin: [keepId] }, ...filter });
    }
    await coll.updateOne(
      { _id: new ObjectId(keepId) },
      {
        $set: { ...doc, updatedAt: new Date() },
        $setOnInsert: { createdAt: existing[0].createdAt || new Date() },
      }
    );
    return 'updated';
  }

  await coll.insertOne({ ...doc, createdAt: new Date(), updatedAt: new Date() });
  return 'created';
}

async function seedSettings(db) {
  const coll = db.collection('settings');
  const settings = readJsonPath(SETTINGS_FILE);
  let count = 0;
  for (const [key, value] of Object.entries(settings)) {
    await coll.updateOne(
      { key },
      { $set: { key, value: String(value), type: 'text', updatedAt: new Date() } },
      { upsert: true }
    );
    count += 1;
  }
  return count;
}

function readJsonPath(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function ensureHomePage(db) {
  const coll = db.collection('pages');
  const existing = await coll.findOne({ slug: 'home' });
  const payload = {
    title: 'Home',
    slug: 'home',
    description: 'ATILA - Intelligent Procurement for Modern Enterprises',
    metaTitle: 'ATILA - Intelligent Procurement for Modern Enterprises',
    metaDescription:
      'Built by Aatral Technologies, ATILA reflects real-world enterprise procurement challenges and best practices delivered through a modern, secure SaaS platform.',
    sections: SECTION_MAP.filter((s) => s.pageSlug === 'home').map((s) => s.sectionType),
    isPublished: true,
    updatedAt: new Date(),
  };
  if (existing) {
    await coll.updateOne({ _id: existing._id }, { $set: payload });
    return 'updated';
  }
  await coll.insertOne({ ...payload, createdAt: new Date() });
  return 'created';
}

async function ensureAdminUser(db) {
  const coll = db.collection('users');
  const email = (process.env.ADMIN_EMAIL ).toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const hashed = await bcrypt.hash(password, 12);

  const existing = await coll.findOne({ email });
  if (existing) {
    await coll.updateOne(
      { _id: existing._id },
      { $set: { name: existing.name || 'Admin', role: 'admin', password: hashed, updatedAt: new Date() } }
    );
    return 'updated';
  }
  await coll.insertOne({
    name: 'Admin',
    email,
    password: hashed,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return 'created';
}

/**
 * Seed the dynamic Services mini-CMS from src/data/json/services-catalog.json.
 *
 * Each catalog entry becomes one Service document (card + detail page). The
 * home-page card list also lives in src/data/json/services.json; we use its
 * matching short description as the Service `shortDescription`. Documents are
 * upserted by slug so admin-created services (new slugs) are never touched.
 */
async function seedServices(db) {
  const coll = db.collection('services');
  const catalog = readJson('services-catalog').services || [];
  const homeItems = (readJson('services').items || []).map((it) => ({
    slug: slugify(it.title),
    description: it.description,
  }));
  let created = 0;
  let updated = 0;

  for (let i = 0; i < catalog.length; i++) {
    const item = catalog[i];
    const slug = slugify(item.slug || item.title);
    const homeItem = homeItems.find((h) => h.slug === slug);
    const existing = await coll.find({ slug }).toArray();

    const steps = (item.sections || []).map((sec) => ({
      num: sec.num,
      title: sec.title,
      description: sec.description,
      points: sec.points || [],
      result: sec.result || '',
      image: sec.image || '',
    }));

    const doc = {
      title: item.title,
      slug,
      tagline: item.tagline || '',
      shortDescription: homeItem?.description || item.description || '',
      description: item.description || '',
      icon: item.icon || '🧩',
      image: item.image || '',
      showInMenu: item.showInMenu !== false,
      menuOrder: typeof item.menuOrder === 'number' ? item.menuOrder : i + 1,
      order: typeof item.order === 'number' ? item.order : i + 1,
      isPublished: item.isPublished !== false,
      isArchived: false,
      metaTitle: item.metaTitle || `${item.title} | ATILA Procurement Platform`,
      metaDescription: item.metaDescription || item.description || '',
      ogImage: item.ogImage || '',
      page: {
        sections: ['steps', 'cta'],
        steps,
        keyPoints: item.keyPoints || [],
        benefits: item.benefits || [],
        features: item.features || [],
        howItWorks: item.howItWorks || [],
        cta: item.cta || {},
      },
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      const keepId = existing[0]._id;
      if (existing.length > 1) {
        await coll.deleteMany({ _id: { $nin: [keepId] }, slug });
      }
      await coll.updateOne(
        { _id: keepId },
        { $set: doc, $setOnInsert: { createdAt: existing[0].createdAt || new Date() } }
      );
      updated += 1;
    } else {
      await coll.insertOne({ ...doc, createdAt: new Date() });
      created += 1;
    }
  }
  return { created, updated, total: catalog.length };
}

async function seed() {
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  let summary = [];
  try {
    await client.connect();
    const db = client.db();

    console.log('Connected to MongoDB\n');

    for (const mapping of SECTION_MAP) {
      const action = await upsertSection(db, mapping);
      summary.push(`${mapping.sectionType}: ${action}`);
      console.log(`${mapping.sectionType.padEnd(18)} ${action}`);
    }

    const settingCount = await seedSettings(db);
    console.log(`${'settings'.padEnd(18)} ${settingCount} imported`);
    summary.push(`settings: ${settingCount} imported`);

    const serviceResult = await seedServices(db);
    console.log(`${'services'.padEnd(18)} ${serviceResult.created} created, ${serviceResult.updated} updated`);
    summary.push(`services: ${serviceResult.created} created, ${serviceResult.updated} updated`);

    const pageAction = await ensureHomePage(db);
    console.log(`home page (pages)      ${pageAction}`);
    summary.push(`home page: ${pageAction}`);

    const adminAction = await ensureAdminUser(db);
    console.log(`admin user             ${adminAction}`);
    summary.push(`admin user: ${adminAction}`);

    console.log('\nSeed completed successfully.');
    console.log('\nSummary:');
    summary.forEach((line) => console.log(`  - ${line}`));
  } finally {
    await client.close();
  }
}

seed().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
