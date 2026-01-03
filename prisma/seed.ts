/**
 * Database Seed Script
 *
 * Creates initial data for development and testing.
 *
 * USAGE:
 * npm run db:seed
 *
 * CREATES:
 * - 1 platform admin user (for /platform access)
 * - 2 demo churches (slugs: "demo", "hope-community")
 * - Users with ChurchMembership records (new model)
 * - Sample content for all content types
 * - Marketing pages and settings
 *
 * NEW MODEL:
 * - Users have globally unique emails
 * - Users connect to churches via ChurchMembership
 * - Role is on membership, not user
 * - Users can have multiple memberships
 *
 * NOTE: This is for development only. In production, churches and users
 * should be created through proper onboarding flows.
 */

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createDefaultFormsData } from "../lib/forms/default-forms";
import { DEFAULT_HEADER_CONFIG, DEFAULT_FOOTER_CONFIG } from "../types/template";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Create demo church
  const church = await prisma.church.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      slug: "demo",
      name: "Grace Community Church",
    },
  });
  console.log(`✓ Church created: ${church.name} (${church.slug})`);

  // Create demo users with different roles
  const passwordHash = await bcrypt.hash("password123", 12);

  // Admin user (also platform admin)
  const admin = await prisma.user.upsert({
    where: { email: "randy@shiftagency.com" },
    update: {},
    create: {
      email: "randy@shiftagency.com",
      passwordHash,
      name: "Randy Gonzalez",
      platformRole: "PLATFORM_ADMIN",
      isActive: true,
    },
  });
  console.log(`✓ Admin user created: ${admin.email}`);

  // Create membership for admin
  await prisma.churchMembership.upsert({
    where: {
      userId_churchId: {
        userId: admin.id,
        churchId: church.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      churchId: church.id,
      role: "ADMIN",
      isPrimary: true,
      isActive: true,
    },
  });
  console.log(`✓ Admin membership created for ${church.name}`);

  // Editor user
  const editor = await prisma.user.upsert({
    where: { email: "editor@example.com" },
    update: {},
    create: {
      email: "editor@example.com",
      passwordHash,
      name: "Michael Chen",
      isActive: true,
    },
  });
  console.log(`✓ Editor user created: ${editor.email}`);

  // Create membership for editor
  await prisma.churchMembership.upsert({
    where: {
      userId_churchId: {
        userId: editor.id,
        churchId: church.id,
      },
    },
    update: {},
    create: {
      userId: editor.id,
      churchId: church.id,
      role: "EDITOR",
      isPrimary: true,
      isActive: true,
    },
  });
  console.log(`✓ Editor membership created for ${church.name}`);

  // Viewer user
  const viewer = await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {},
    create: {
      email: "viewer@example.com",
      passwordHash,
      name: "Emily Davis",
      isActive: true,
    },
  });
  console.log(`✓ Viewer user created: ${viewer.email}`);

  // Create membership for viewer
  await prisma.churchMembership.upsert({
    where: {
      userId_churchId: {
        userId: viewer.id,
        churchId: church.id,
      },
    },
    update: {},
    create: {
      userId: viewer.id,
      churchId: church.id,
      role: "VIEWER",
      isPrimary: true,
      isActive: true,
    },
  });
  console.log(`✓ Viewer membership created for ${church.name}`);

  // ============================================
  // DEFAULT FORMS FOR GRACE COMMUNITY
  // ============================================
  console.log("\n--- Creating default forms ---");

  const defaultForms = createDefaultFormsData(church.id);
  for (const formData of defaultForms) {
    await prisma.form.upsert({
      where: {
        churchId_slug: {
          churchId: church.id,
          slug: formData.slug,
        },
      },
      update: {},
      create: {
        churchId: formData.churchId,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        type: formData.type,
        fields: formData.fields as unknown as Prisma.InputJsonValue,
        settings: formData.settings as unknown as Prisma.InputJsonValue,
        notifyEmails: formData.notifyEmails,
        isActive: formData.isActive,
      },
    });
    console.log(`✓ Form created: ${formData.name}`);
  }

  // Create sample pages (need them before site settings for navigation)
  const aboutPage = await prisma.page.upsert({
    where: {
      churchId_urlPath: {
        churchId: church.id,
        urlPath: "about",
      },
    },
    update: {},
    create: {
      churchId: church.id,
      title: "About Our Church",
      blocks: [],
      urlPath: "about",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Page created: ${aboutPage.title}`);

  const visitPage = await prisma.page.upsert({
    where: {
      churchId_urlPath: {
        churchId: church.id,
        urlPath: "visit",
      },
    },
    update: {},
    create: {
      churchId: church.id,
      title: "Plan Your Visit",
      blocks: [],
      urlPath: "visit",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Page created: ${visitPage.title}`);

  // ============================================
  // SITE SETTINGS WITH TEMPLATE DEFAULTS
  // ============================================
  console.log("\n--- Creating site settings with template defaults ---");

  await prisma.siteSettings.upsert({
    where: { churchId: church.id },
    update: {},
    create: {
      churchId: church.id,
      serviceTimes: "Sunday Worship: 9:00 AM & 11:00 AM\nWednesday Prayer: 7:00 PM",
      address: "123 Faith Avenue, Springfield, IL 62701",
      phone: "(555) 123-4567",
      contactEmail: "info@gracecc.example.com",
      facebookUrl: "https://facebook.com/gracecommunitychurch",
      instagramUrl: "https://instagram.com/gracecc",
      youtubeUrl: "https://youtube.com/@gracecommunitychurch",
      footerText: `© ${new Date().getFullYear()} Grace Community Church. All rights reserved.`,
      // Template settings with defaults
      headerTemplate: "classic",
      headerConfig: DEFAULT_HEADER_CONFIG as unknown as Prisma.InputJsonValue,
      footerTemplate: "4-column",
      footerConfig: DEFAULT_FOOTER_CONFIG as unknown as Prisma.InputJsonValue,
      // Navigation using the new extended format
      headerNavigation: [
        { id: "nav-about", label: "About", href: "/about", isExternal: false, order: 0 },
        { id: "nav-visit", label: "Visit", href: "/visit", isExternal: false, order: 1 },
        { id: "nav-sermons", label: "Sermons", href: "/sermons", isExternal: false, order: 2 },
        { id: "nav-events", label: "Events", href: "/events", isExternal: false, order: 3 },
      ] as unknown as Prisma.InputJsonValue,
      footerNavigation: [
        { id: "footer-about", label: "About Us", href: "/about", isExternal: false, order: 0 },
        { id: "footer-sermons", label: "Sermons", href: "/sermons", isExternal: false, order: 1 },
        { id: "footer-events", label: "Events", href: "/events", isExternal: false, order: 2 },
        { id: "footer-contact", label: "Contact", href: "/contact", isExternal: false, order: 3 },
      ] as unknown as Prisma.InputJsonValue,
    },
  });
  console.log(`✓ Site settings created with template defaults`);

  // Create sample sermons
  const sermon1 = await prisma.sermon.create({
    data: {
      churchId: church.id,
      title: "Finding Peace in Uncertain Times",
      date: new Date("2024-12-22"),
      speakerName: "Pastor David Williams",
      scripture: "Philippians 4:6-7",
      description:
        "In this message, we explore how to find lasting peace even when life feels chaotic and uncertain.",
      videoUrl: "https://youtube.com/watch?v=example1",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Sermon created: ${sermon1.title}`);

  const sermon2 = await prisma.sermon.create({
    data: {
      churchId: church.id,
      title: "The Gift of Grace",
      date: new Date("2024-12-15"),
      speakerName: "Pastor David Williams",
      scripture: "Ephesians 2:8-9",
      description:
        "Understanding the incredible gift of grace that God offers to each of us.",
      videoUrl: "https://youtube.com/watch?v=example2",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Sermon created: ${sermon2.title}`);

  const sermon3 = await prisma.sermon.create({
    data: {
      churchId: church.id,
      title: "Walking in Faith",
      date: new Date("2024-12-08"),
      speakerName: "Pastor Maria Rodriguez",
      scripture: "Hebrews 11:1-6",
      description: "What does it mean to truly walk by faith and not by sight?",
      status: "DRAFT",
    },
  });
  console.log(`✓ Sermon created: ${sermon3.title} (draft)`);

  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      churchId: church.id,
      title: "Christmas Eve Candlelight Service",
      startDate: new Date("2024-12-24T18:00:00"),
      endDate: new Date("2024-12-24T19:30:00"),
      location: "Main Sanctuary",
      description:
        "Join us for a beautiful evening of carols, scripture readings, and candlelight as we celebrate the birth of Christ.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Event created: ${event1.title}`);

  const event2 = await prisma.event.create({
    data: {
      churchId: church.id,
      title: "New Year's Prayer Gathering",
      startDate: new Date("2025-01-01T10:00:00"),
      endDate: new Date("2025-01-01T11:30:00"),
      location: "Chapel",
      description:
        "Start the new year in prayer as we seek God's guidance and blessing for the year ahead.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Event created: ${event2.title}`);

  const event3 = await prisma.event.create({
    data: {
      churchId: church.id,
      title: "Youth Winter Retreat",
      startDate: new Date("2025-01-17T17:00:00"),
      endDate: new Date("2025-01-19T14:00:00"),
      location: "Camp Ponderosa",
      description:
        "A weekend of fun, fellowship, and spiritual growth for middle and high school students.",
      registrationUrl: "https://example.com/register",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Event created: ${event3.title}`);

  // Create sample announcements
  const announcement1 = await prisma.announcement.create({
    data: {
      churchId: church.id,
      title: "Church Office Hours",
      body: "The church office will be closed December 24-26 for Christmas. We will reopen on Friday, December 27th at 9:00 AM. For emergencies, please call Pastor David directly.",
      expiresAt: new Date("2024-12-27"),
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Announcement created: ${announcement1.title}`);

  const announcement2 = await prisma.announcement.create({
    data: {
      churchId: church.id,
      title: "Volunteers Needed",
      body: "We're looking for volunteers to help with our children's ministry on Sunday mornings. If you have a heart for kids and can commit to one Sunday per month, please contact the church office.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Announcement created: ${announcement2.title}`);

  // Create sample leadership profiles
  const leader1 = await prisma.leadershipProfile.create({
    data: {
      churchId: church.id,
      name: "Pastor David Williams",
      title: "Senior Pastor",
      bio: "Pastor David has been serving at Grace Community Church since 2010. He holds a Master of Divinity from Fuller Seminary and is passionate about expository preaching and discipleship.",
      email: "pastor.david@gracecc.example.com",
      sortOrder: 1,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Leadership profile created: ${leader1.name}`);

  const leader2 = await prisma.leadershipProfile.create({
    data: {
      churchId: church.id,
      name: "Pastor Maria Rodriguez",
      title: "Associate Pastor",
      bio: "Pastor Maria oversees our small groups ministry and women's ministry. She joined our team in 2018 and brings a wealth of experience in pastoral care and spiritual formation.",
      email: "pastor.maria@gracecc.example.com",
      sortOrder: 2,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Leadership profile created: ${leader2.name}`);

  const leader3 = await prisma.leadershipProfile.create({
    data: {
      churchId: church.id,
      name: "James Thompson",
      title: "Worship Director",
      bio: "James leads our worship ministry with a heart for authentic, Christ-centered worship. He has been leading worship for over 15 years and joined our team in 2020.",
      email: "james@gracecc.example.com",
      sortOrder: 3,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Leadership profile created: ${leader3.name}`);

  const leader4 = await prisma.leadershipProfile.create({
    data: {
      churchId: church.id,
      name: "Rachel Kim",
      title: "Children's Ministry Director",
      bio: "Rachel is passionate about helping children discover and grow in their faith. She holds a degree in Early Childhood Education and has been serving in children's ministry for 10 years.",
      sortOrder: 4,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Leadership profile created: ${leader4.name}`);

  // ============================================
  // SECOND DEMO CHURCH: Hope Community
  // ============================================
  console.log("\n--- Creating second demo church ---");

  const church2 = await prisma.church.upsert({
    where: { slug: "hope-community" },
    update: {},
    create: {
      slug: "hope-community",
      name: "Hope Community Church",
      primaryContactEmail: "admin@hopecommunity.example.com",
    },
  });
  console.log(`✓ Church created: ${church2.name} (${church2.slug})`);

  // Create users for second church
  const hopeAdmin = await prisma.user.upsert({
    where: { email: "admin@hopecommunity.example.com" },
    update: {},
    create: {
      email: "admin@hopecommunity.example.com",
      passwordHash,
      name: "John Martinez",
      isActive: true,
    },
  });
  console.log(`✓ Hope Community admin: ${hopeAdmin.email}`);

  // Create membership for Hope Community admin
  await prisma.churchMembership.upsert({
    where: {
      userId_churchId: {
        userId: hopeAdmin.id,
        churchId: church2.id,
      },
    },
    update: {},
    create: {
      userId: hopeAdmin.id,
      churchId: church2.id,
      role: "ADMIN",
      isPrimary: true,
      isActive: true,
    },
  });

  const hopeEditor = await prisma.user.upsert({
    where: { email: "editor@hopecommunity.example.com" },
    update: {},
    create: {
      email: "editor@hopecommunity.example.com",
      passwordHash,
      name: "Lisa Wong",
      isActive: true,
    },
  });
  console.log(`✓ Hope Community editor: ${hopeEditor.email}`);

  // Create membership for Hope Community editor
  await prisma.churchMembership.upsert({
    where: {
      userId_churchId: {
        userId: hopeEditor.id,
        churchId: church2.id,
      },
    },
    update: {},
    create: {
      userId: hopeEditor.id,
      churchId: church2.id,
      role: "EDITOR",
      isPrimary: true,
      isActive: true,
    },
  });

  // Create default forms for Hope Community
  const hopeForms = createDefaultFormsData(church2.id);
  for (const formData of hopeForms) {
    await prisma.form.upsert({
      where: {
        churchId_slug: {
          churchId: church2.id,
          slug: formData.slug,
        },
      },
      update: {},
      create: {
        churchId: formData.churchId,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        type: formData.type,
        fields: formData.fields as unknown as Prisma.InputJsonValue,
        settings: formData.settings as unknown as Prisma.InputJsonValue,
        notifyEmails: formData.notifyEmails,
        isActive: formData.isActive,
      },
    });
  }
  console.log(`✓ Default forms created for ${church2.name}`);

  // Site settings for Hope Community with different template
  await prisma.siteSettings.upsert({
    where: { churchId: church2.id },
    update: {},
    create: {
      churchId: church2.id,
      serviceTimes: "Sunday Service: 10:30 AM\nBible Study: Tuesday 7:00 PM",
      address: "456 Hope Street, Springfield, IL 62702",
      phone: "(555) 987-6543",
      contactEmail: "hello@hopecommunity.example.com",
      facebookUrl: "https://facebook.com/hopecommunity",
      footerText: `© ${new Date().getFullYear()} Hope Community Church. All rights reserved.`,
      // Use centered header template for variety
      headerTemplate: "centered",
      headerConfig: {
        ...DEFAULT_HEADER_CONFIG,
        logoPosition: "center",
        navAlignment: "center",
        mobileMenuStyle: "fullscreen",
      } as unknown as Prisma.InputJsonValue,
      footerTemplate: "3-column",
      footerConfig: DEFAULT_FOOTER_CONFIG as unknown as Prisma.InputJsonValue,
      headerNavigation: [
        { id: "nav-about", label: "About", href: "/about", isExternal: false, order: 0 },
        { id: "nav-sermons", label: "Messages", href: "/sermons", isExternal: false, order: 1 },
        { id: "nav-events", label: "Events", href: "/events", isExternal: false, order: 2 },
      ] as unknown as Prisma.InputJsonValue,
      footerNavigation: [
        { id: "footer-about", label: "About", href: "/about", isExternal: false, order: 0 },
        { id: "footer-contact", label: "Contact", href: "/contact", isExternal: false, order: 1 },
      ] as unknown as Prisma.InputJsonValue,
    },
  });
  console.log(`✓ Site settings created for ${church2.name}`);

  // ============================================
  // MULTI-CHURCH USER (IT Contractor example)
  // ============================================
  console.log("\n--- Creating multi-church user ---");

  const multiChurchUser = await prisma.user.upsert({
    where: { email: "contractor@agency.com" },
    update: {},
    create: {
      email: "contractor@agency.com",
      passwordHash,
      name: "Alex IT Contractor",
      isActive: true,
    },
  });
  console.log(`✓ Multi-church user created: ${multiChurchUser.email}`);

  // Add to both churches with different roles
  await prisma.churchMembership.upsert({
    where: {
      userId_churchId: {
        userId: multiChurchUser.id,
        churchId: church.id,
      },
    },
    update: {},
    create: {
      userId: multiChurchUser.id,
      churchId: church.id,
      role: "ADMIN",
      isPrimary: true,
      isActive: true,
    },
  });
  console.log(`✓ Contractor added to ${church.name} as ADMIN`);

  await prisma.churchMembership.upsert({
    where: {
      userId_churchId: {
        userId: multiChurchUser.id,
        churchId: church2.id,
      },
    },
    update: {},
    create: {
      userId: multiChurchUser.id,
      churchId: church2.id,
      role: "EDITOR",
      isPrimary: false,
      isActive: true,
    },
  });
  console.log(`✓ Contractor added to ${church2.name} as EDITOR`);

  // Create sample content for Hope Community
  await prisma.page.upsert({
    where: {
      churchId_urlPath: {
        churchId: church2.id,
        urlPath: "about",
      },
    },
    update: {},
    create: {
      churchId: church2.id,
      title: "About Hope Community",
      blocks: [],
      urlPath: "about",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Hope Community page created: About`);

  // ============================================
  // MARKETING SITE CONTENT
  // ============================================
  console.log("\n--- Creating marketing site content ---");

  // Marketing site settings
  await prisma.marketingSiteSettings.upsert({
    where: { id: "default-settings" },
    update: {},
    create: {
      id: "default-settings",
      siteName: "Faith Interactive",
      defaultMetaTitle: "Faith Interactive - Church Websites Made Easy",
      defaultMetaDescription:
        "Beautiful, easy-to-manage websites for churches of all sizes. Focus on ministry while we handle the technology.",
      headerNavigation: [
        { label: "Features", url: "/features", order: 1 },
        { label: "Pricing", url: "/pricing", order: 2 },
        { label: "Contact", url: "/contact", order: 3 },
      ],
      footerText: `© ${new Date().getFullYear()} Faith Interactive. All rights reserved.`,
      footerLinks: [
        { label: "Privacy Policy", url: "/privacy" },
        { label: "Terms of Service", url: "/terms" },
      ],
      homePageSlug: "home",
    },
  });
  console.log(`✓ Marketing site settings created`);

  // Marketing pages
  const homePage = await prisma.marketingPage.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      title: "Faith Interactive - Church Websites Made Easy",
      slug: "home",
      blocks: [],
      status: "PUBLISHED",
      publishedAt: new Date(),
      metaTitle: "Faith Interactive - Church Websites Made Easy",
      metaDescription:
        "Beautiful, easy-to-manage websites for churches of all sizes. Focus on ministry while we handle the technology.",
    },
  });
  console.log(`✓ Marketing page created: ${homePage.title}`);

  const pricingPage = await prisma.marketingPage.upsert({
    where: { slug: "pricing" },
    update: {},
    create: {
      title: "Simple, Transparent Pricing",
      slug: "pricing",
      blocks: [],
      status: "PUBLISHED",
      publishedAt: new Date(),
      metaTitle: "Pricing - Faith Interactive",
      metaDescription:
        "Simple, transparent pricing for church websites. Plans starting at $49/month with no hidden fees.",
    },
  });
  console.log(`✓ Marketing page created: ${pricingPage.title}`);

  const contactPage = await prisma.marketingPage.upsert({
    where: { slug: "contact" },
    update: {},
    create: {
      title: "Contact Us",
      slug: "contact",
      blocks: [],
      status: "PUBLISHED",
      publishedAt: new Date(),
      metaTitle: "Contact Us - Faith Interactive",
      metaDescription:
        "Get in touch with Faith Interactive. Schedule a demo or ask questions about our church website platform.",
    },
  });
  console.log(`✓ Marketing page created: ${contactPage.title}`);

  const featuresPage = await prisma.marketingPage.upsert({
    where: { slug: "features" },
    update: {},
    create: {
      title: "Features",
      slug: "features",
      blocks: [],
      status: "PUBLISHED",
      publishedAt: new Date(),
      metaTitle: "Features - Faith Interactive",
      metaDescription:
        "Explore Faith Interactive features: content management, sermon library, event calendar, and more tools built for churches.",
    },
  });
  console.log(`✓ Marketing page created: ${featuresPage.title}`);

  // ============================================
  // SCRIPTURE BOOKS (Global Reference Data)
  // ============================================
  console.log("\n--- Seeding Scripture Books ---");

  const scriptureBooks = [
    // Old Testament
    { name: "Genesis", abbreviation: "Gen", testament: "OT", sortOrder: 1, chapterCount: 50 },
    { name: "Exodus", abbreviation: "Exod", testament: "OT", sortOrder: 2, chapterCount: 40 },
    { name: "Leviticus", abbreviation: "Lev", testament: "OT", sortOrder: 3, chapterCount: 27 },
    { name: "Numbers", abbreviation: "Num", testament: "OT", sortOrder: 4, chapterCount: 36 },
    { name: "Deuteronomy", abbreviation: "Deut", testament: "OT", sortOrder: 5, chapterCount: 34 },
    { name: "Joshua", abbreviation: "Josh", testament: "OT", sortOrder: 6, chapterCount: 24 },
    { name: "Judges", abbreviation: "Judg", testament: "OT", sortOrder: 7, chapterCount: 21 },
    { name: "Ruth", abbreviation: "Ruth", testament: "OT", sortOrder: 8, chapterCount: 4 },
    { name: "1 Samuel", abbreviation: "1 Sam", testament: "OT", sortOrder: 9, chapterCount: 31 },
    { name: "2 Samuel", abbreviation: "2 Sam", testament: "OT", sortOrder: 10, chapterCount: 24 },
    { name: "1 Kings", abbreviation: "1 Kgs", testament: "OT", sortOrder: 11, chapterCount: 22 },
    { name: "2 Kings", abbreviation: "2 Kgs", testament: "OT", sortOrder: 12, chapterCount: 25 },
    { name: "1 Chronicles", abbreviation: "1 Chr", testament: "OT", sortOrder: 13, chapterCount: 29 },
    { name: "2 Chronicles", abbreviation: "2 Chr", testament: "OT", sortOrder: 14, chapterCount: 36 },
    { name: "Ezra", abbreviation: "Ezra", testament: "OT", sortOrder: 15, chapterCount: 10 },
    { name: "Nehemiah", abbreviation: "Neh", testament: "OT", sortOrder: 16, chapterCount: 13 },
    { name: "Esther", abbreviation: "Esth", testament: "OT", sortOrder: 17, chapterCount: 10 },
    { name: "Job", abbreviation: "Job", testament: "OT", sortOrder: 18, chapterCount: 42 },
    { name: "Psalms", abbreviation: "Ps", testament: "OT", sortOrder: 19, chapterCount: 150 },
    { name: "Proverbs", abbreviation: "Prov", testament: "OT", sortOrder: 20, chapterCount: 31 },
    { name: "Ecclesiastes", abbreviation: "Eccl", testament: "OT", sortOrder: 21, chapterCount: 12 },
    { name: "Song of Solomon", abbreviation: "Song", testament: "OT", sortOrder: 22, chapterCount: 8 },
    { name: "Isaiah", abbreviation: "Isa", testament: "OT", sortOrder: 23, chapterCount: 66 },
    { name: "Jeremiah", abbreviation: "Jer", testament: "OT", sortOrder: 24, chapterCount: 52 },
    { name: "Lamentations", abbreviation: "Lam", testament: "OT", sortOrder: 25, chapterCount: 5 },
    { name: "Ezekiel", abbreviation: "Ezek", testament: "OT", sortOrder: 26, chapterCount: 48 },
    { name: "Daniel", abbreviation: "Dan", testament: "OT", sortOrder: 27, chapterCount: 12 },
    { name: "Hosea", abbreviation: "Hos", testament: "OT", sortOrder: 28, chapterCount: 14 },
    { name: "Joel", abbreviation: "Joel", testament: "OT", sortOrder: 29, chapterCount: 3 },
    { name: "Amos", abbreviation: "Amos", testament: "OT", sortOrder: 30, chapterCount: 9 },
    { name: "Obadiah", abbreviation: "Obad", testament: "OT", sortOrder: 31, chapterCount: 1 },
    { name: "Jonah", abbreviation: "Jonah", testament: "OT", sortOrder: 32, chapterCount: 4 },
    { name: "Micah", abbreviation: "Mic", testament: "OT", sortOrder: 33, chapterCount: 7 },
    { name: "Nahum", abbreviation: "Nah", testament: "OT", sortOrder: 34, chapterCount: 3 },
    { name: "Habakkuk", abbreviation: "Hab", testament: "OT", sortOrder: 35, chapterCount: 3 },
    { name: "Zephaniah", abbreviation: "Zeph", testament: "OT", sortOrder: 36, chapterCount: 3 },
    { name: "Haggai", abbreviation: "Hag", testament: "OT", sortOrder: 37, chapterCount: 2 },
    { name: "Zechariah", abbreviation: "Zech", testament: "OT", sortOrder: 38, chapterCount: 14 },
    { name: "Malachi", abbreviation: "Mal", testament: "OT", sortOrder: 39, chapterCount: 4 },
    // New Testament
    { name: "Matthew", abbreviation: "Matt", testament: "NT", sortOrder: 40, chapterCount: 28 },
    { name: "Mark", abbreviation: "Mark", testament: "NT", sortOrder: 41, chapterCount: 16 },
    { name: "Luke", abbreviation: "Luke", testament: "NT", sortOrder: 42, chapterCount: 24 },
    { name: "John", abbreviation: "John", testament: "NT", sortOrder: 43, chapterCount: 21 },
    { name: "Acts", abbreviation: "Acts", testament: "NT", sortOrder: 44, chapterCount: 28 },
    { name: "Romans", abbreviation: "Rom", testament: "NT", sortOrder: 45, chapterCount: 16 },
    { name: "1 Corinthians", abbreviation: "1 Cor", testament: "NT", sortOrder: 46, chapterCount: 16 },
    { name: "2 Corinthians", abbreviation: "2 Cor", testament: "NT", sortOrder: 47, chapterCount: 13 },
    { name: "Galatians", abbreviation: "Gal", testament: "NT", sortOrder: 48, chapterCount: 6 },
    { name: "Ephesians", abbreviation: "Eph", testament: "NT", sortOrder: 49, chapterCount: 6 },
    { name: "Philippians", abbreviation: "Phil", testament: "NT", sortOrder: 50, chapterCount: 4 },
    { name: "Colossians", abbreviation: "Col", testament: "NT", sortOrder: 51, chapterCount: 4 },
    { name: "1 Thessalonians", abbreviation: "1 Thess", testament: "NT", sortOrder: 52, chapterCount: 5 },
    { name: "2 Thessalonians", abbreviation: "2 Thess", testament: "NT", sortOrder: 53, chapterCount: 3 },
    { name: "1 Timothy", abbreviation: "1 Tim", testament: "NT", sortOrder: 54, chapterCount: 6 },
    { name: "2 Timothy", abbreviation: "2 Tim", testament: "NT", sortOrder: 55, chapterCount: 4 },
    { name: "Titus", abbreviation: "Titus", testament: "NT", sortOrder: 56, chapterCount: 3 },
    { name: "Philemon", abbreviation: "Phlm", testament: "NT", sortOrder: 57, chapterCount: 1 },
    { name: "Hebrews", abbreviation: "Heb", testament: "NT", sortOrder: 58, chapterCount: 13 },
    { name: "James", abbreviation: "Jas", testament: "NT", sortOrder: 59, chapterCount: 5 },
    { name: "1 Peter", abbreviation: "1 Pet", testament: "NT", sortOrder: 60, chapterCount: 5 },
    { name: "2 Peter", abbreviation: "2 Pet", testament: "NT", sortOrder: 61, chapterCount: 3 },
    { name: "1 John", abbreviation: "1 John", testament: "NT", sortOrder: 62, chapterCount: 5 },
    { name: "2 John", abbreviation: "2 John", testament: "NT", sortOrder: 63, chapterCount: 1 },
    { name: "3 John", abbreviation: "3 John", testament: "NT", sortOrder: 64, chapterCount: 1 },
    { name: "Jude", abbreviation: "Jude", testament: "NT", sortOrder: 65, chapterCount: 1 },
    { name: "Revelation", abbreviation: "Rev", testament: "NT", sortOrder: 66, chapterCount: 22 },
  ];

  for (const book of scriptureBooks) {
    await prisma.scriptureBook.upsert({
      where: { sortOrder: book.sortOrder },
      update: {},
      create: book,
    });
  }
  console.log(`✓ Scripture books seeded: ${scriptureBooks.length} books`);

  // ============================================
  // SERMON SYSTEM DATA FOR GRACE COMMUNITY
  // ============================================
  console.log("\n--- Creating sermon system demo data ---");

  // Create speakers
  const speakerDavid = await prisma.speaker.upsert({
    where: {
      id: "speaker-david-williams",
    },
    update: {},
    create: {
      id: "speaker-david-williams",
      churchId: church.id,
      name: "Pastor David Williams",
      title: "Senior Pastor",
      bio: "Pastor David has been serving at Grace Community Church since 2010. He holds a Master of Divinity from Fuller Seminary and is passionate about expository preaching.",
      email: "pastor.david@gracecc.example.com",
      sortOrder: 1,
      isGuest: false,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Speaker created: ${speakerDavid.name}`);

  const speakerMaria = await prisma.speaker.upsert({
    where: {
      id: "speaker-maria-rodriguez",
    },
    update: {},
    create: {
      id: "speaker-maria-rodriguez",
      churchId: church.id,
      name: "Pastor Maria Rodriguez",
      title: "Associate Pastor",
      bio: "Pastor Maria oversees small groups and women's ministry. She joined our team in 2018.",
      email: "pastor.maria@gracecc.example.com",
      sortOrder: 2,
      isGuest: false,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Speaker created: ${speakerMaria.name}`);

  const speakerGuest = await prisma.speaker.upsert({
    where: {
      id: "speaker-guest-john",
    },
    update: {},
    create: {
      id: "speaker-guest-john",
      churchId: church.id,
      name: "Dr. John Maxwell",
      title: "Guest Speaker",
      bio: "Leadership author and speaker.",
      sortOrder: 10,
      isGuest: true,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Speaker created: ${speakerGuest.name} (guest)`);

  // Create sermon series
  const seriesJohn = await prisma.sermonSeries.upsert({
    where: {
      id: "series-gospel-of-john",
    },
    update: {},
    create: {
      id: "series-gospel-of-john",
      churchId: church.id,
      name: "The Gospel of John",
      description: "A verse-by-verse journey through the fourth Gospel, exploring the life and teachings of Jesus Christ.",
      startDate: new Date("2024-09-01"),
      sortOrder: 1,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Series created: ${seriesJohn.name}`);

  const seriesFaith = await prisma.sermonSeries.upsert({
    where: {
      id: "series-foundations-of-faith",
    },
    update: {},
    create: {
      id: "series-foundations-of-faith",
      churchId: church.id,
      name: "Foundations of Faith",
      description: "Core doctrines every believer should understand.",
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-08-25"),
      sortOrder: 2,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Series created: ${seriesFaith.name}`);

  // Create sermon topics
  const topicFaith = await prisma.sermonTopic.upsert({
    where: {
      churchId_slug: {
        churchId: church.id,
        slug: "faith",
      },
    },
    update: {},
    create: {
      churchId: church.id,
      name: "Faith",
      slug: "faith",
      description: "Sermons about trusting God",
    },
  });
  console.log(`✓ Topic created: ${topicFaith.name}`);

  const topicPrayer = await prisma.sermonTopic.upsert({
    where: {
      churchId_slug: {
        churchId: church.id,
        slug: "prayer",
      },
    },
    update: {},
    create: {
      churchId: church.id,
      name: "Prayer",
      slug: "prayer",
      description: "Sermons about communicating with God",
    },
  });
  console.log(`✓ Topic created: ${topicPrayer.name}`);

  const topicGrace = await prisma.sermonTopic.upsert({
    where: {
      churchId_slug: {
        churchId: church.id,
        slug: "grace",
      },
    },
    update: {},
    create: {
      churchId: church.id,
      name: "Grace",
      slug: "grace",
      description: "Sermons about God's unmerited favor",
    },
  });
  console.log(`✓ Topic created: ${topicGrace.name}`);

  const topicHope = await prisma.sermonTopic.upsert({
    where: {
      churchId_slug: {
        churchId: church.id,
        slug: "hope",
      },
    },
    update: {},
    create: {
      churchId: church.id,
      name: "Hope",
      slug: "hope",
      description: "Sermons about finding hope in Christ",
    },
  });
  console.log(`✓ Topic created: ${topicHope.name}`);

  // Get Philippians book for scripture reference
  const philippians = await prisma.scriptureBook.findFirst({
    where: { name: "Philippians" },
  });

  // Update existing sermons with new fields and link to speakers/series/topics
  if (philippians) {
    // Update sermon1 (Finding Peace in Uncertain Times)
    await prisma.sermon.updateMany({
      where: {
        churchId: church.id,
        title: "Finding Peace in Uncertain Times",
      },
      data: {
        speakerId: speakerDavid.id,
        speakerName: "Pastor David Williams",
        notes: "<h2>Key Points</h2><ul><li>Don't worry about anything</li><li>Pray about everything</li><li>God's peace guards your heart</li></ul>",
      },
    });

    // Add scripture reference
    const sermon1 = await prisma.sermon.findFirst({
      where: {
        churchId: church.id,
        title: "Finding Peace in Uncertain Times",
      },
    });
    if (sermon1) {
      await prisma.scriptureReference.upsert({
        where: { id: "ref-sermon1-phil" },
        update: {},
        create: {
          id: "ref-sermon1-phil",
          sermonId: sermon1.id,
          bookId: philippians.id,
          startChapter: 4,
          startVerse: 6,
          endVerse: 7,
          sortOrder: 0,
        },
      });

      // Link to topics
      await prisma.sermonTopicLink.upsert({
        where: {
          sermonId_topicId: {
            sermonId: sermon1.id,
            topicId: topicPrayer.id,
          },
        },
        update: {},
        create: {
          sermonId: sermon1.id,
          topicId: topicPrayer.id,
        },
      });
      await prisma.sermonTopicLink.upsert({
        where: {
          sermonId_topicId: {
            sermonId: sermon1.id,
            topicId: topicHope.id,
          },
        },
        update: {},
        create: {
          sermonId: sermon1.id,
          topicId: topicHope.id,
        },
      });
    }
    console.log(`✓ Updated sermon with speaker, scripture, and topics`);
  }

  // Update sermon2 (The Gift of Grace)
  await prisma.sermon.updateMany({
    where: {
      churchId: church.id,
      title: "The Gift of Grace",
    },
    data: {
      speakerId: speakerDavid.id,
      speakerName: "Pastor David Williams",
      seriesId: seriesFaith.id,
      seriesOrder: 1,
    },
  });

  const graceSermon = await prisma.sermon.findFirst({
    where: {
      churchId: church.id,
      title: "The Gift of Grace",
    },
  });
  if (graceSermon) {
    await prisma.sermonTopicLink.upsert({
      where: {
        sermonId_topicId: {
          sermonId: graceSermon.id,
          topicId: topicGrace.id,
        },
      },
      update: {},
      create: {
        sermonId: graceSermon.id,
        topicId: topicGrace.id,
      },
    });
    await prisma.sermonTopicLink.upsert({
      where: {
        sermonId_topicId: {
          sermonId: graceSermon.id,
          topicId: topicFaith.id,
        },
      },
      update: {},
      create: {
        sermonId: graceSermon.id,
        topicId: topicFaith.id,
      },
    });
  }
  console.log(`✓ Updated sermon with series and topics`);

  // Update sermon3 (Walking in Faith)
  await prisma.sermon.updateMany({
    where: {
      churchId: church.id,
      title: "Walking in Faith",
    },
    data: {
      speakerId: speakerMaria.id,
      speakerName: "Pastor Maria Rodriguez",
      seriesId: seriesFaith.id,
      seriesOrder: 2,
    },
  });

  const faithSermon = await prisma.sermon.findFirst({
    where: {
      churchId: church.id,
      title: "Walking in Faith",
    },
  });
  if (faithSermon) {
    await prisma.sermonTopicLink.upsert({
      where: {
        sermonId_topicId: {
          sermonId: faithSermon.id,
          topicId: topicFaith.id,
        },
      },
      update: {},
      create: {
        sermonId: faithSermon.id,
        topicId: topicFaith.id,
      },
    });
  }
  console.log(`✓ Updated sermon with speaker and series`);

  console.log("\n📋 Test credentials (all use password: password123):");
  console.log("   ─────────────────────────────────────────────");
  console.log("   Grace Community Church (demo.localhost:3000):");
  console.log("     Admin:  randy@shiftagency.com  (PLATFORM_ADMIN + church ADMIN)");
  console.log("     Editor: editor@example.com");
  console.log("     Viewer: viewer@example.com");
  console.log("");
  console.log("   Hope Community Church (hope-community.localhost:3000):");
  console.log("     Admin:  admin@hopecommunity.example.com");
  console.log("     Editor: editor@hopecommunity.example.com");
  console.log("");
  console.log("   Multi-church user (has access to BOTH churches):");
  console.log("     contractor@agency.com - ADMIN in Grace, EDITOR in Hope");

  console.log("\n🌐 Access the app:");
  console.log("   Unified Login (works for all users):");
  console.log("     http://localhost:3000/login");
  console.log("");
  console.log("   Church sites:");
  console.log("     http://demo.localhost:3000");
  console.log("     http://hope-community.localhost:3000");
  console.log("");
  console.log("   Platform Admin (requires PLATFORM_ADMIN role):");
  console.log("     http://localhost:3000/platform");

  console.log("\n💡 Don't forget to add to /etc/hosts:");
  console.log("   127.0.0.1 demo.localhost");
  console.log("   127.0.0.1 hope-community.localhost");

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
