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
  // BLOG CATEGORIES & TAGS
  // ============================================
  console.log("\n--- Creating blog categories and tags ---");

  const categoryChurchGrowth = await prisma.blogCategory.upsert({
    where: { slug: "church-growth" },
    update: {},
    create: {
      name: "Church Growth",
      slug: "church-growth",
      description: "Strategies and insights for growing your church",
      sortOrder: 1,
    },
  });
  console.log(`✓ Blog category: ${categoryChurchGrowth.name}`);

  const categoryWebDesign = await prisma.blogCategory.upsert({
    where: { slug: "web-design" },
    update: {},
    create: {
      name: "Web Design",
      slug: "web-design",
      description: "Tips for effective church website design",
      sortOrder: 2,
    },
  });
  console.log(`✓ Blog category: ${categoryWebDesign.name}`);

  const categorySEO = await prisma.blogCategory.upsert({
    where: { slug: "seo" },
    update: {},
    create: {
      name: "SEO",
      slug: "seo",
      description: "Search engine optimization for churches",
      sortOrder: 3,
    },
  });
  console.log(`✓ Blog category: ${categorySEO.name}`);

  const categoryMinistry = await prisma.blogCategory.upsert({
    where: { slug: "ministry" },
    update: {},
    create: {
      name: "Ministry",
      slug: "ministry",
      description: "Resources for effective ministry",
      sortOrder: 4,
    },
  });
  console.log(`✓ Blog category: ${categoryMinistry.name}`);

  // Blog tags
  const tagTips = await prisma.blogTag.upsert({
    where: { slug: "tips" },
    update: {},
    create: { name: "Tips", slug: "tips" },
  });
  const tagBestPractices = await prisma.blogTag.upsert({
    where: { slug: "best-practices" },
    update: {},
    create: { name: "Best Practices", slug: "best-practices" },
  });
  const tagGettingStarted = await prisma.blogTag.upsert({
    where: { slug: "getting-started" },
    update: {},
    create: { name: "Getting Started", slug: "getting-started" },
  });
  const tagCaseStudy = await prisma.blogTag.upsert({
    where: { slug: "case-study" },
    update: {},
    create: { name: "Case Study", slug: "case-study" },
  });
  const tagMobileFirst = await prisma.blogTag.upsert({
    where: { slug: "mobile-first" },
    update: {},
    create: { name: "Mobile First", slug: "mobile-first" },
  });
  console.log(`✓ Blog tags created`);

  // ============================================
  // BLOG POSTS
  // ============================================
  console.log("\n--- Creating blog posts ---");

  const blogPost1 = await prisma.blogPost.upsert({
    where: { slug: "5-ways-improve-church-website" },
    update: {},
    create: {
      title: "5 Ways to Improve Your Church Website Today",
      slug: "5-ways-improve-church-website",
      excerpt: "Simple, actionable tips to make your church website more effective at reaching your community.",
      blocks: [
        {
          id: "block-1",
          type: "text",
          content: {
            text: "<p>Your church website is often the first impression visitors have of your community. Here are five quick wins you can implement today to make it more effective.</p>",
          },
        },
        {
          id: "block-2",
          type: "text",
          content: {
            text: "<h2>1. Make Your Service Times Prominent</h2><p>Visitors should be able to find when you meet within seconds of landing on your site. Put this information front and center on your homepage.</p>",
          },
        },
        {
          id: "block-3",
          type: "text",
          content: {
            text: "<h2>2. Add a Clear Call to Action</h2><p>What do you want visitors to do? Plan a visit? Watch a sermon? Make it obvious with a prominent button.</p>",
          },
        },
        {
          id: "block-4",
          type: "text",
          content: {
            text: "<h2>3. Optimize for Mobile</h2><p>Over 60% of website visits now come from mobile devices. Ensure your site looks great on phones and tablets.</p>",
          },
        },
        {
          id: "block-5",
          type: "text",
          content: {
            text: "<h2>4. Update Your Photos</h2><p>Authentic, recent photos of your congregation help visitors see themselves as part of your community.</p>",
          },
        },
        {
          id: "block-6",
          type: "text",
          content: {
            text: "<h2>5. Simplify Your Navigation</h2><p>Less is more. Focus on the pages that matter most to first-time visitors.</p>",
          },
        },
      ],
      categoryId: categoryWebDesign.id,
      authorName: "Faith Interactive Team",
      status: "PUBLISHED",
      publishedAt: new Date("2024-12-15"),
      metaTitle: "5 Ways to Improve Your Church Website Today | Faith Interactive",
      metaDescription: "Simple, actionable tips to make your church website more effective at reaching your community and welcoming visitors.",
    },
  });
  await prisma.blogPostTag.upsert({
    where: { postId_tagId: { postId: blogPost1.id, tagId: tagTips.id } },
    update: {},
    create: { postId: blogPost1.id, tagId: tagTips.id },
  });
  await prisma.blogPostTag.upsert({
    where: { postId_tagId: { postId: blogPost1.id, tagId: tagBestPractices.id } },
    update: {},
    create: { postId: blogPost1.id, tagId: tagBestPractices.id },
  });
  console.log(`✓ Blog post: ${blogPost1.title}`);

  const blogPost2 = await prisma.blogPost.upsert({
    where: { slug: "seo-basics-for-churches" },
    update: {},
    create: {
      title: "SEO Basics Every Church Should Know",
      slug: "seo-basics-for-churches",
      excerpt: "Help your community find you online with these fundamental search engine optimization strategies.",
      blocks: [
        {
          id: "block-1",
          type: "text",
          content: {
            text: "<p>When someone in your community searches for 'churches near me,' will they find you? Search engine optimization (SEO) helps ensure they do.</p>",
          },
        },
        {
          id: "block-2",
          type: "text",
          content: {
            text: "<h2>Claim Your Google Business Profile</h2><p>This is the single most important thing you can do for local SEO. Your Google Business Profile appears in Maps and local search results.</p>",
          },
        },
        {
          id: "block-3",
          type: "text",
          content: {
            text: "<h2>Use Location Keywords</h2><p>Include your city and neighborhood names naturally throughout your website content.</p>",
          },
        },
        {
          id: "block-4",
          type: "text",
          content: {
            text: "<h2>Create Valuable Content</h2><p>Blog posts, sermon transcripts, and resource pages all help search engines understand what your church is about.</p>",
          },
        },
      ],
      categoryId: categorySEO.id,
      authorName: "Faith Interactive Team",
      status: "PUBLISHED",
      publishedAt: new Date("2024-12-01"),
      metaTitle: "SEO Basics Every Church Should Know | Faith Interactive",
      metaDescription: "Help your community find your church online with these fundamental search engine optimization strategies.",
    },
  });
  await prisma.blogPostTag.upsert({
    where: { postId_tagId: { postId: blogPost2.id, tagId: tagGettingStarted.id } },
    update: {},
    create: { postId: blogPost2.id, tagId: tagGettingStarted.id },
  });
  await prisma.blogPostTag.upsert({
    where: { postId_tagId: { postId: blogPost2.id, tagId: tagBestPractices.id } },
    update: {},
    create: { postId: blogPost2.id, tagId: tagBestPractices.id },
  });
  console.log(`✓ Blog post: ${blogPost2.title}`);

  const blogPost3 = await prisma.blogPost.upsert({
    where: { slug: "why-church-plants-need-websites" },
    update: {},
    create: {
      title: "Why Church Plants Need a Website From Day One",
      slug: "why-church-plants-need-websites",
      excerpt: "Starting a new church? Here is why establishing your online presence early matters.",
      blocks: [
        {
          id: "block-1",
          type: "text",
          content: {
            text: "<p>When you're launching a church plant, there are a million things competing for your attention. A website might seem like something that can wait. Here's why it shouldn't.</p>",
          },
        },
        {
          id: "block-2",
          type: "text",
          content: {
            text: "<h2>First Impressions Happen Online</h2><p>Before anyone visits your church in person, they'll visit your website. A professional online presence builds credibility from the start.</p>",
          },
        },
        {
          id: "block-3",
          type: "text",
          content: {
            text: "<h2>Collect Interest Early</h2><p>Even before your first service, a website with a simple email signup helps you build a launch team and generate buzz.</p>",
          },
        },
      ],
      categoryId: categoryChurchGrowth.id,
      authorName: "Faith Interactive Team",
      status: "PUBLISHED",
      publishedAt: new Date("2024-11-20"),
      metaTitle: "Why Church Plants Need a Website From Day One | Faith Interactive",
      metaDescription: "Starting a new church? Here is why establishing your online presence early matters for your church plant.",
    },
  });
  await prisma.blogPostTag.upsert({
    where: { postId_tagId: { postId: blogPost3.id, tagId: tagGettingStarted.id } },
    update: {},
    create: { postId: blogPost3.id, tagId: tagGettingStarted.id },
  });
  console.log(`✓ Blog post: ${blogPost3.title}`);

  // ============================================
  // CASE STUDIES (Real projects from Faith Interactive portfolio)
  // ============================================
  console.log("\n--- Creating case studies ---");

  // 1. The Sanctuary - New Castle, Indiana
  const caseStudySanctuary = await prisma.caseStudy.upsert({
    where: { slug: "the-sanctuary" },
    update: {},
    create: {
      churchName: "The Sanctuary",
      slug: "the-sanctuary",
      description:
        "The Sanctuary, located in New Castle, Indiana, is a vibrant faith community committed to discipleship, worship, and service. With a strong focus on nurturing spiritual growth, they sought a website makeover to strengthen their digital presence, engage their congregation, and extend their outreach online.",
      images: [],
      challenge:
        "The Sanctuary in New Castle, Indiana, is a thriving, faith-driven community deeply committed to fostering spiritual growth through discipleship, worship, and service. However, their online presence did not fully reflect the vibrancy of their congregation. Their existing website was functional but lacked the dynamic features needed to engage new visitors and support current members effectively. Navigation was difficult, making it challenging for users to find critical information like service times, ministries, and events. The site also struggled to rank well in search engine results, limiting their outreach efforts.",
      solution:
        "We implemented a complete website redesign with a streamlined interface where visitors can easily access vital information, from service schedules to ministry opportunities. The website was optimized for mobile devices, ensuring it works seamlessly across all platforms. Our SEO strategy integrated keywords like 'church in New Castle' and 'Christian community' with a local SEO focus. We developed a content strategy with refined messaging, weekly blog posts, sermon archives, and other resources. Social media integration linked the website to their accounts with live streaming services and easy-to-use event registration. We also provided content management training and ongoing technical support.",
      featured: true,
      sortOrder: 1,
      status: "PUBLISHED",
      publishedAt: new Date("2024-06-15"),
    },
  });
  console.log(`✓ Case study: ${caseStudySanctuary.churchName}`);

  // 2. The Recovery Lifestyle Podcast
  const caseStudyRecovery = await prisma.caseStudy.upsert({
    where: { slug: "the-recovery-lifestyle-podcast" },
    update: {},
    create: {
      churchName: "The Recovery Lifestyle Podcast",
      slug: "the-recovery-lifestyle-podcast",
      description:
        "The Recovery Lifestyle Podcast is a faith-driven platform supporting individuals in addiction recovery. The podcast combines personal transformation with spiritual growth, delivering messages guiding listeners toward sobriety and a Christ-centered life. Hosted by recovery professionals, it explores addiction recovery, spiritual development, and community involvement. Selected as the Fifth Revive Ministry Winner in April, the website revamp aimed to enhance accessibility and provide resources including episodes and practical recovery tools.",
      images: [],
      challenge:
        "Prior to the redesign, the podcast faced three main obstacles. First, users struggled with navigation, limiting access to episodes and recovery resources. Second, the site lacked visual appeal reflecting their compassionate mission. Third, poor search engine optimization meant their content wasn't reaching people seeking faith-based recovery support.",
      solution:
        "Faith Interactive implemented a custom website tailored specifically for The Recovery Lifestyle podcast with modern, intuitive design. The site was optimized for effortless navigation, ensuring that users of all ages and technical abilities can explore and listen to episodes with ease. We integrated enhanced SEO to boost online presence for Christian recovery seekers, created shareable visuals tailored for social platforms, set up advanced analytics for understanding listener behavior, and improved interactive elements for stronger audience connection.",
      featured: false,
      sortOrder: 2,
      status: "PUBLISHED",
      publishedAt: new Date("2024-05-01"),
    },
  });
  console.log(`✓ Case study: ${caseStudyRecovery.churchName}`);

  // 3. The Sending Church - Wilmington, NC
  const caseStudySending = await prisma.caseStudy.upsert({
    where: { slug: "the-sending-church" },
    update: {},
    create: {
      churchName: "The Sending Church",
      slug: "the-sending-church",
      description:
        "The Sending Church, a Christ-centered community in Wilmington, North Carolina, received Faith Interactive's Revive ministry to revitalize their online presence. Pastor Edwrin Sutton envisioned a website reflecting their welcoming spirit with seamless user experience.",
      images: [],
      challenge:
        "The key challenges with the previous website included limited functionality and an outdated design that didn't effectively communicate the church's identity, community and service information. The website had static content with missing updates on events and activities. Service times, ministries, and contact info were not readily available. The existing platform presented maintenance and update challenges.",
      solution:
        "Faith Interactive created a unique, visually striking website embodying the church's vibrant spirit with clear, intuitive user experience for effortless information discovery. We implemented strategic, location-based SEO to enhance online presence for greater discovery by potential visitors. Our team developed a compelling content strategy and provided a user-friendly CMS for easy updates and dynamic presence maintenance.",
      testimonialQuote:
        "We are extremely satisfied with the quality of the website design and functionality delivered by Faith Interactive. The new website not only meets but exceeds our expectations. It effectively captures the essence of our community and facilitates engagement seamlessly.",
      testimonialName: "Pastor Edwrin Sutton",
      testimonialTitle: "Lead Pastor",
      liveSiteUrl: "https://www.sendingchurchwilm.com/",
      featured: true,
      sortOrder: 3,
      status: "PUBLISHED",
      publishedAt: new Date("2024-04-15"),
    },
  });
  console.log(`✓ Case study: ${caseStudySending.churchName}`);

  // 4. Redeemer City Church - Washington D.C.
  const caseStudyRedeemer = await prisma.caseStudy.upsert({
    where: { slug: "redeemer-city-church" },
    update: {},
    create: {
      churchName: "Redeemer City Church",
      slug: "redeemer-city-church",
      description:
        "Redeemer City Church, established in Washington D.C. for nine years, engaged Faith Interactive to modernize their online presence and create a dynamic platform to showcase their message, strengthen congregational connections, and expand community reach.",
      images: [],
      challenge:
        "Our previous website was dated. It hadn't been updated in a while. People interact with websites differently now. The site had static website content with missing updates on current events and activities. Essential details like service times, location, and contact information were difficult to find. Managing website functionalities and updates required ongoing technical support.",
      solution:
        "The team created a modern, visually appealing design reflecting the church's character with improved user experience. We collaborated with leadership to develop engaging content and provided update solutions. We enhanced search engine ranking through SEO strategies and enabled church leadership to manage and update content effectively. Technical foundation and ongoing support ensured smooth operation.",
      testimonialQuote:
        "Working with the Faith Interactive team was great. They had good advice on getting traffic to your site and developed great designs using our existing branding. I would encourage others to consider Faith Interactive. Randy and his team did a great job with the design. Web design requires professional help to do it right.",
      testimonialName: "Pastor Stuart Saulters",
      testimonialTitle: "Lead Pastor",
      liveSiteUrl: "https://redeemerdc.org/",
      featured: true,
      sortOrder: 4,
      status: "PUBLISHED",
      publishedAt: new Date("2024-03-01"),
    },
  });
  console.log(`✓ Case study: ${caseStudyRedeemer.churchName}`);

  // 5. MBA Inventory
  const caseStudyMBA = await prisma.caseStudy.upsert({
    where: { slug: "mba-inventory" },
    update: {},
    create: {
      churchName: "MBA Inventory",
      slug: "mba-inventory",
      description:
        "Faith Interactive developed a comprehensive solution for MBA Inventory, an online platform based on 'The 5 Languages of Appreciation in the Workplace' that offers comprehensive assessment tools designed to enhance workplace relationships and employee engagement.",
      images: [],
      challenge:
        "The client faced three primary obstacles. Their existing site needed modernization to meet current web design and UX standards. The platform required infrastructure capable of handling growth and traffic fluctuations without performance degradation. They sought a first-class experience to maximize the value of their assessment tool.",
      solution:
        "Faith Interactive deployed a three-part strategy. WordPress Development delivered a modern, responsive website aligned with MBA Inventory's mission and branding, emphasizing intuitive navigation. Digital Ocean VPS Hosting provided a scalable Virtual Private Server with load balancing and auto-scaling capabilities to manage traffic spikes and platform growth. UX Enhancement streamlined assessment processes with responsive design ensuring accessibility across devices.",
      metrics: {
        userEngagement: "+24%",
        platformCapacity: "+100%",
        userSatisfaction: "+17%",
      },
      featured: false,
      sortOrder: 5,
      status: "PUBLISHED",
      publishedAt: new Date("2024-02-15"),
    },
  });
  console.log(`✓ Case study: ${caseStudyMBA.churchName}`);

  // 6. Calvary Boulder Valley - Boulder, Colorado
  const caseStudyBoulder = await prisma.caseStudy.upsert({
    where: { slug: "calvary-boulder-valley" },
    update: {},
    create: {
      churchName: "Calvary Boulder Valley",
      slug: "calvary-boulder-valley",
      description:
        "Calvary Boulder Valley is a thriving community church in Boulder, Colorado that sought to enhance their online presence, engage their congregation and community, and reach wider audiences through digital channels.",
      images: [],
      challenge:
        "The church had an outdated website that was difficult to navigate and didn't represent the church's vibrant community and events. They had limited online engagement and needed improvement in social media and email communication to connect with congregation and attract newcomers.",
      solution:
        "Faith Interactive implemented a SubSplash website redesign with modern, user-friendly, mobile-responsive design. We developed social media campaigns with a content calendar and strategic planning, plus paid advertising for increased brand visibility. We launched a weekly eBulletin with church updates, events, and inspirational content. The strategy included redesigning the site for better content organization, developing social media campaigns highlighting community events and sermon stories, and encouraging content sharing across platforms.",
      metrics: {
        websiteTraffic: "+74.6%",
        socialMediaTraffic: "+55%",
        searchTraffic: "+15%",
      },
      featured: true,
      sortOrder: 6,
      status: "PUBLISHED",
      publishedAt: new Date("2024-01-15"),
    },
  });
  console.log(`✓ Case study: ${caseStudyBoulder.churchName}`);

  // 7. El Roi Foster Ministries
  const caseStudyElRoi = await prisma.caseStudy.upsert({
    where: { slug: "el-roi-foster-ministries" },
    update: {},
    create: {
      churchName: "El Roi Foster Ministries",
      slug: "el-roi-foster-ministries",
      description:
        "El Roi Foster Ministries is a nonprofit organization dedicated to providing support, resources, and advocacy for foster children and families. They approached us with the need for a new website that would be responsive, deliver a clean user experience, and facilitate seamless online donations to further their mission.",
      images: [],
      challenge:
        "The existing website lacked responsiveness and did not effectively convey the organization's mission and activities. El Roi Foster Ministries required a website that offered a clean and intuitive user experience to engage visitors, donors, and potential partners effectively. The client needed guidance on selecting and integrating a donation platform that would meet their specific needs and offer a secure and straightforward donation process.",
      solution:
        "We designed and developed a new website that featured responsive design to ensure an optimal user experience on all devices. The site's content and structure was organized for clarity, making information easily accessible. We focused on creating a clean and intuitive user interface to facilitate navigation and encourage visitor engagement, incorporating visually appealing elements and a user-friendly layout. We collaborated with the client to understand their specific donation requirements and advised on the selection and integration of a donation platform that aligned with their mission and provided a seamless and secure donation process.",
      liveSiteUrl: "https://elroifosterministries.org/",
      featured: false,
      sortOrder: 7,
      status: "PUBLISHED",
      publishedAt: new Date("2023-11-01"),
    },
  });
  console.log(`✓ Case study: ${caseStudyElRoi.churchName}`);

  // 8. Cornerstone DPC
  const caseStudyCornerstone = await prisma.caseStudy.upsert({
    where: { slug: "cornerstone-dpc" },
    update: {},
    create: {
      churchName: "Cornerstone DPC",
      slug: "cornerstone-dpc",
      description:
        "Cornerstone DPC is a faith-based Direct Primary Care (DPC) clinic located near Sandpoint, Idaho. As a new healthcare provider, they sought to establish a robust online presence by developing a website that informed visitors about their services, enabled registration and appointment booking, and showcased their unique approach to healthcare.",
      images: [],
      challenge:
        "As a new DPC clinic, Cornerstone DPC needed to quickly establish an online presence to attract potential patients and inform them about the services they offer. The client required a website with clear and easy-to-use features for registration and appointment scheduling to streamline patient onboarding. Cornerstone DPC aimed to provide a first-class user experience to reflect their commitment to patient care.",
      solution:
        "We designed and developed a new WordPress website with focus on user-friendly navigation and responsiveness. We created detailed pages outlining the DPC plans offered, including information about costs and benefits, and integrated features for registration and appointment booking. We generated search engine optimized (SEO) content to improve website visibility on search engines, making it more discoverable to potential patients in the Sandpoint area. We implemented scalable Virtual Private Server (VPS) hosting on Digital Ocean to ensure optimal performance during high traffic periods, utilizing load balancing and auto-scaling to maintain site responsiveness.",
      liveSiteUrl: "https://hopehealthclinic.org/",
      featured: false,
      sortOrder: 8,
      status: "PUBLISHED",
      publishedAt: new Date("2023-09-15"),
    },
  });
  console.log(`✓ Case study: ${caseStudyCornerstone.churchName}`);

  // 9. Calvary Chapel Ascend - Whittier, California
  const caseStudyAscend = await prisma.caseStudy.upsert({
    where: { slug: "calvary-chapel-ascend" },
    update: {},
    create: {
      churchName: "Calvary Chapel Ascend",
      slug: "calvary-chapel-ascend",
      description:
        "Calvary Chapel Ascend is a newly established church plant located in Whittier, California. With a vision to serve the community and provide a welcoming space for worship, they sought assistance in developing their online presence and creating a user-friendly website to connect with potential attendees and convey their mission.",
      images: [],
      challenge:
        "As a new church plant, Calvary Chapel Ascend needed a website to introduce themselves to the community and provide essential information about services and events. They required a user-friendly website that would be easy for visitors to navigate, encouraging them to explore the church's offerings and get involved.",
      solution:
        "Our approach for Calvary Chapel Ascend centered around building a functional and welcoming website. We designed a modern, clean, and mobile-responsive website using the Squarespace platform to showcase the church's mission, services, and events. We ensured the website included intuitive navigation, making it easy for visitors to find relevant information. The website successfully introduced Calvary Chapel Ascend to the community with a user-friendly design that encourages visitors to explore the church's services, events, and mission.",
      liveSiteUrl: "https://www.calvaryascend.com/",
      featured: false,
      sortOrder: 9,
      status: "PUBLISHED",
      publishedAt: new Date("2023-08-01"),
    },
  });
  console.log(`✓ Case study: ${caseStudyAscend.churchName}`);

  // ============================================
  // TESTIMONIALS
  // ============================================
  console.log("\n--- Creating testimonials ---");

  await prisma.testimonial.upsert({
    where: { id: "testimonial-1" },
    update: {},
    create: {
      id: "testimonial-1",
      name: "Pastor David Williams",
      title: "Senior Pastor",
      company: "Grace Community Church",
      quote: "Faith Interactive transformed our online presence. We've seen a significant increase in first-time visitors who found us through our new website. The team truly understands the unique needs of churches.",
      featured: true,
      sortOrder: 1,
      isActive: true,
    },
  });
  console.log(`✓ Testimonial: Pastor David Williams`);

  await prisma.testimonial.upsert({
    where: { id: "testimonial-2" },
    update: {},
    create: {
      id: "testimonial-2",
      name: "Sarah Mitchell",
      title: "Communications Director",
      company: "Riverside Church",
      quote: "The ongoing support has been incredible. Whenever we need a change, the team responds quickly. It's like having a web department without the overhead.",
      featured: true,
      sortOrder: 2,
      isActive: true,
    },
  });
  console.log(`✓ Testimonial: Sarah Mitchell`);

  await prisma.testimonial.upsert({
    where: { id: "testimonial-3" },
    update: {},
    create: {
      id: "testimonial-3",
      name: "Pastor James Rodriguez",
      title: "Lead Pastor",
      company: "Hope Fellowship (Church Plant)",
      quote: "The free church plant program was a blessing. We launched with a professional website that gave us credibility from day one. Now that we've grown, we're happy to pay for the premium features.",
      featured: true,
      sortOrder: 3,
      isActive: true,
    },
  });
  console.log(`✓ Testimonial: Pastor James Rodriguez`);

  await prisma.testimonial.upsert({
    where: { id: "testimonial-4" },
    update: {},
    create: {
      id: "testimonial-4",
      name: "Linda Thompson",
      title: "Church Administrator",
      company: "First Baptist Springfield",
      quote: "Our old website was embarrassing. Now members are proud to share links to our sermons and events. The mobile experience is fantastic.",
      featured: false,
      sortOrder: 4,
      isActive: true,
    },
  });
  console.log(`✓ Testimonial: Linda Thompson`);

  await prisma.testimonial.upsert({
    where: { id: "testimonial-5" },
    update: {},
    create: {
      id: "testimonial-5",
      name: "Michael Chen",
      title: "Worship Pastor",
      company: "New Life Community",
      quote: "The sermon library feature alone is worth it. Our congregation loves being able to catch up on messages they missed, and sharing sermons has never been easier.",
      featured: false,
      sortOrder: 5,
      isActive: true,
    },
  });
  console.log(`✓ Testimonial: Michael Chen`);

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
  console.log("   Grace Community Church:");
  console.log("     Admin:  randy@shiftagency.com  (PLATFORM_ADMIN + church ADMIN)");
  console.log("     Editor: editor@example.com");
  console.log("     Viewer: viewer@example.com");
  console.log("");
  console.log("   Hope Community Church:");
  console.log("     Admin:  admin@hopecommunity.example.com");
  console.log("     Editor: editor@hopecommunity.example.com");
  console.log("");
  console.log("   Multi-church user (has access to BOTH churches):");
  console.log("     contractor@agency.com - ADMIN in Grace, EDITOR in Hope");

  console.log("\n🌐 Hostname-Based Access (no /etc/hosts needed!):");
  console.log("");
  console.log("   Marketing Site:");
  console.log("     http://localhost:3000");
  console.log("");
  console.log("   Church Admin Dashboard (login here):");
  console.log("     http://admin.localhost:3000");
  console.log("");
  console.log("   Platform Admin (requires PLATFORM_ADMIN role):");
  console.log("     http://platform.localhost:3000");
  console.log("");
  console.log("   Church Public Sites:");
  console.log("     http://demo.localhost:3000");
  console.log("     http://hope-community.localhost:3000");

  console.log("\n💡 Alternative: Use faith-interactive.local (requires /etc/hosts):");
  console.log("   127.0.0.1 faith-interactive.local admin.faith-interactive.local");
  console.log("   127.0.0.1 platform.faith-interactive.local demo.faith-interactive.local");

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
