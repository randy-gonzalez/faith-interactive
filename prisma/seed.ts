/**
 * Database Seed Script
 *
 * Creates initial data for development and testing.
 *
 * USAGE:
 * pnpm db:seed
 *
 * CREATES:
 * - 1 demo church (slug: "demo")
 * - 3 demo users (admin, editor, viewer)
 * - Sample content for all content types
 *
 * NOTE: This is for development only. In production, churches and users
 * should be created through proper onboarding flows.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  const admin = await prisma.user.upsert({
    where: {
      churchId_email: {
        churchId: church.id,
        email: "admin@example.com",
      },
    },
    update: {},
    create: {
      churchId: church.id,
      email: "admin@example.com",
      passwordHash,
      name: "Sarah Johnson",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`✓ Admin user created: ${admin.email}`);

  const editor = await prisma.user.upsert({
    where: {
      churchId_email: {
        churchId: church.id,
        email: "editor@example.com",
      },
    },
    update: {},
    create: {
      churchId: church.id,
      email: "editor@example.com",
      passwordHash,
      name: "Michael Chen",
      role: "EDITOR",
      isActive: true,
    },
  });
  console.log(`✓ Editor user created: ${editor.email}`);

  const viewer = await prisma.user.upsert({
    where: {
      churchId_email: {
        churchId: church.id,
        email: "viewer@example.com",
      },
    },
    update: {},
    create: {
      churchId: church.id,
      email: "viewer@example.com",
      passwordHash,
      name: "Emily Davis",
      role: "VIEWER",
      isActive: true,
    },
  });
  console.log(`✓ Viewer user created: ${viewer.email}`);

  // Create sample pages
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
      body: `<h2>Welcome to Grace Community Church</h2>
<p>We are a vibrant community of believers committed to loving God and serving others. Founded in 1985, our church has been a cornerstone of the community for nearly four decades.</p>
<h3>Our Mission</h3>
<p>To make disciples of Jesus Christ who will transform their communities and the world.</p>
<h3>Our Vision</h3>
<p>To be a church where everyone belongs, believes, and becomes all God created them to be.</p>`,
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
      body: `<h2>We Can't Wait to Meet You!</h2>
<p>Visiting a new church can feel overwhelming. We want to make your first visit as comfortable as possible.</p>
<h3>What to Expect</h3>
<ul>
<li>Friendly greeters to welcome you</li>
<li>Contemporary worship music</li>
<li>Practical, Bible-based teaching</li>
<li>Excellent children's programs</li>
</ul>
<h3>Service Times</h3>
<p>Sunday: 9:00 AM & 11:00 AM</p>
<p>Wednesday: 7:00 PM</p>`,
      urlPath: "visit",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ Page created: ${visitPage.title}`);

  // Create sample sermons
  const sermon1 = await prisma.sermon.create({
    data: {
      churchId: church.id,
      title: "Finding Peace in Uncertain Times",
      date: new Date("2024-12-22"),
      speaker: "Pastor David Williams",
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
      speaker: "Pastor David Williams",
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
      speaker: "Pastor Maria Rodriguez",
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

  console.log("\n📋 Test credentials (all use password: password123):");
  console.log("   ─────────────────────────────────────────────");
  console.log("   Admin:  admin@example.com  (full access)");
  console.log("   Editor: editor@example.com (can edit content)");
  console.log("   Viewer: viewer@example.com (read-only access)");

  console.log("\n🌐 Access the app:");
  console.log("   URL: http://demo.localhost:3000");

  console.log("\n💡 Don't forget to add to /etc/hosts:");
  console.log("   127.0.0.1 demo.localhost");

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
