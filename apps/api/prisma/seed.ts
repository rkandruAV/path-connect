import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Users ─────────────────────────────────────────────
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.chen@example.com' },
    update: {},
    create: {
      firebaseUid: 'firebase-seed-001',
      email: 'sarah.chen@example.com',
      displayName: 'Sarah Chen',
      role: 'MENTOR',
      currentPosition: 'Product Director at TechCorp',
      bio: 'Experienced product leader passionate about helping others transition into PM roles.',
      weekStreak: 12,
    },
  });

  const michael = await prisma.user.upsert({
    where: { email: 'michael.park@example.com' },
    update: {},
    create: {
      firebaseUid: 'firebase-seed-002',
      email: 'michael.park@example.com',
      displayName: 'Michael Park',
      role: 'MENTOR',
      currentPosition: 'Engineering Manager at StartupXYZ',
      bio: 'Software engineering leader with 15 years of experience in system design and team building.',
      weekStreak: 8,
    },
  });

  const alex = await prisma.user.upsert({
    where: { email: 'alex.rivera@example.com' },
    update: {},
    create: {
      firebaseUid: 'firebase-seed-003',
      email: 'alex.rivera@example.com',
      displayName: 'Alex Rivera',
      role: 'MENTEE',
      currentPosition: 'Marketing Manager with 5 years experience',
      targetRole: 'Product Manager',
      bio: 'Marketing professional looking to transition into product management.',
      weekStreak: 3,
    },
  });

  const jordan = await prisma.user.upsert({
    where: { email: 'jordan.lee@example.com' },
    update: {},
    create: {
      firebaseUid: 'firebase-seed-004',
      email: 'jordan.lee@example.com',
      displayName: 'Jordan Lee',
      role: 'MENTEE',
      currentPosition: 'Junior Developer at WebAgency',
      targetRole: 'Senior Software Engineer',
      bio: 'Full-stack developer aiming for senior engineering roles.',
      weekStreak: 5,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pathconnect.com' },
    update: {},
    create: {
      firebaseUid: 'firebase-seed-005',
      email: 'admin@pathconnect.com',
      displayName: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log(`Created users: ${sarah.displayName}, ${michael.displayName}, ${alex.displayName}, ${jordan.displayName}, ${admin.displayName}`);

  // ─── Mentor Profiles ──────────────────────────────────
  await prisma.mentorProfile.upsert({
    where: { userId: sarah.id },
    update: {},
    create: {
      userId: sarah.id,
      expertise: ['career transitions', 'product management', 'resume optimization', 'interview prep'],
      industry: 'Technology',
      yearsExperience: 12,
      availability: ['Monday 9-12', 'Wednesday 14-17', 'Friday 10-12'],
      bio: 'I specialize in helping professionals transition into product management roles.',
    },
  });

  await prisma.mentorProfile.upsert({
    where: { userId: michael.id },
    update: {},
    create: {
      userId: michael.id,
      expertise: ['software engineering', 'system design', 'leadership', 'technical interviews'],
      industry: 'Technology',
      yearsExperience: 15,
      availability: ['Tuesday 10-13', 'Thursday 14-16'],
      bio: 'Passionate about growing engineers from junior to senior and beyond.',
    },
  });

  console.log('Created mentor profiles');

  // ─── Matches ───────────────────────────────────────────
  const matchAlexSarah = await prisma.match.upsert({
    where: { menteeId_mentorId: { menteeId: alex.id, mentorId: sarah.id } },
    update: {},
    create: {
      menteeId: alex.id,
      mentorId: sarah.id,
      score: 92,
      reason: 'Strong alignment in career transition goals. Sarah has helped 15+ professionals move into PM roles.',
      status: 'ACTIVE',
    },
  });

  const matchJordanMichael = await prisma.match.upsert({
    where: { menteeId_mentorId: { menteeId: jordan.id, mentorId: michael.id } },
    update: {},
    create: {
      menteeId: jordan.id,
      mentorId: michael.id,
      score: 88,
      reason: 'Michael\'s engineering leadership experience is a great fit for Jordan\'s growth goals.',
      status: 'ACTIVE',
    },
  });

  console.log('Created matches');

  // ─── Sessions ──────────────────────────────────────────
  const session1 = await prisma.session.create({
    data: {
      menteeId: alex.id,
      mentorId: sarah.id,
      matchId: matchAlexSarah.id,
      scheduledAt: new Date('2026-02-01T14:00:00Z'),
      duration: 45,
      type: 'VIDEO',
      status: 'COMPLETED',
    },
  });

  const session2 = await prisma.session.create({
    data: {
      menteeId: alex.id,
      mentorId: sarah.id,
      matchId: matchAlexSarah.id,
      scheduledAt: new Date('2026-02-08T14:00:00Z'),
      duration: 45,
      type: 'VIDEO',
      status: 'COMPLETED',
    },
  });

  const session3 = await prisma.session.create({
    data: {
      menteeId: alex.id,
      mentorId: sarah.id,
      matchId: matchAlexSarah.id,
      scheduledAt: new Date('2026-02-15T14:00:00Z'),
      duration: 45,
      type: 'VIDEO',
      status: 'SCHEDULED',
    },
  });

  const session4 = await prisma.session.create({
    data: {
      menteeId: jordan.id,
      mentorId: michael.id,
      matchId: matchJordanMichael.id,
      scheduledAt: new Date('2026-02-05T15:00:00Z'),
      duration: 30,
      type: 'VIDEO',
      status: 'COMPLETED',
    },
  });

  console.log('Created sessions');

  // ─── Session Summaries ─────────────────────────────────
  await prisma.sessionSummary.create({
    data: {
      sessionId: session1.id,
      conversationSummary: 'We discussed Alex\'s Product Manager transition strategy and reviewed the updated resume. Sarah provided insights on how to reframe marketing experience as product skills. We also talked about networking strategies within the PM community.',
      keyTopics: ['Career Transition Strategy', 'Resume Review', 'PM Skills Gap Analysis', 'Networking'],
      keyInsights: [
        'Reframe marketing analytics experience as "data-driven product decisions" in resume',
        'Focus on cross-functional collaboration stories for PM interviews',
        'Join local Product Management meetups for networking',
      ],
    },
  });

  await prisma.sessionSummary.create({
    data: {
      sessionId: session2.id,
      conversationSummary: 'Follow-up session focused on interview preparation and product case studies. Sarah walked through a sample product case study and Alex practiced structuring responses. Discussed metrics frameworks for PM interviews.',
      keyTopics: ['Interview Prep', 'Product Case Studies', 'Metrics Frameworks', 'Mock Interview'],
      keyInsights: [
        'Use the CIRCLES framework for product design questions',
        'Always tie product decisions back to business metrics',
        'Practice 3 case studies per week until the first interview',
      ],
    },
  });

  await prisma.sessionSummary.create({
    data: {
      sessionId: session4.id,
      conversationSummary: 'Introductory session covering Jordan\'s current skill set and career goals. Discussed the gap between junior and senior engineering roles, focusing on system design and code review skills.',
      keyTopics: ['Career Goals', 'System Design', 'Code Review', 'Technical Growth'],
      keyInsights: [
        'Start contributing to open-source projects to build system design experience',
        'Request to lead code reviews on the current team',
        'Read "Designing Data-Intensive Applications" as a foundation for system design interviews',
      ],
    },
  });

  console.log('Created session summaries');

  // ─── Action Items ──────────────────────────────────────
  await prisma.actionItem.createMany({
    data: [
      {
        sessionId: session1.id,
        assigneeId: alex.id,
        description: 'Revise resume bullets to emphasize product outcomes and metrics',
        dueDate: new Date('2026-02-15'),
        status: 'COMPLETED',
      },
      {
        sessionId: session1.id,
        assigneeId: alex.id,
        description: 'Complete online course on product metrics and analytics',
        dueDate: new Date('2026-02-22'),
        status: 'PENDING',
      },
      {
        sessionId: session1.id,
        assigneeId: sarah.id,
        description: 'Share sample product case studies for practice',
        dueDate: new Date('2026-02-10'),
        status: 'COMPLETED',
      },
      {
        sessionId: session2.id,
        assigneeId: alex.id,
        description: 'Practice 3 product case studies using CIRCLES framework',
        dueDate: new Date('2026-02-20'),
        status: 'PENDING',
      },
      {
        sessionId: session2.id,
        assigneeId: alex.id,
        description: 'Send intro email to Sarah\'s contact at TechCorp',
        dueDate: new Date('2026-02-12'),
        status: 'COMPLETED',
      },
      {
        sessionId: session2.id,
        assigneeId: sarah.id,
        description: 'Send TechCorp PM job description for review',
        dueDate: new Date('2026-02-10'),
        status: 'COMPLETED',
      },
      {
        sessionId: session4.id,
        assigneeId: jordan.id,
        description: 'Find 2 open-source projects to contribute to',
        dueDate: new Date('2026-02-12'),
        status: 'PENDING',
      },
      {
        sessionId: session4.id,
        assigneeId: michael.id,
        description: 'Share system design study resources and reading list',
        dueDate: new Date('2026-02-08'),
        status: 'COMPLETED',
      },
    ],
  });

  console.log('Created action items');

  // ─── Session Notes ─────────────────────────────────────
  await prisma.sessionNote.create({
    data: {
      sessionId: session1.id,
      userId: alex.id,
      content: 'Great first session! Sarah really understands the PM transition path. Need to work on reframing my marketing experience. Key takeaway: focus on data-driven stories.',
    },
  });

  await prisma.sessionNote.create({
    data: {
      sessionId: session2.id,
      userId: alex.id,
      content: 'The CIRCLES framework is really helpful. Need to practice more case studies. Sarah\'s contact at TechCorp could be a great opportunity.',
    },
  });

  console.log('Created session notes');

  // ─── Ninety Day Plan ───────────────────────────────────
  const plan = await prisma.ninetyDayPlan.create({
    data: {
      userId: alex.id,
      title: 'PM Career Transition Plan',
      startDate: new Date('2026-01-15'),
      status: 'ACTIVE',
    },
  });

  await prisma.goal.createMany({
    data: [
      // 30-day goals
      { planId: plan.id, userId: alex.id, title: 'Complete PM fundamentals course', period: 'THIRTY_DAY', status: 'ACHIEVED', isAiSuggested: true },
      { planId: plan.id, userId: alex.id, title: 'Rewrite resume for PM roles', period: 'THIRTY_DAY', status: 'ACHIEVED', isAiSuggested: true },
      { planId: plan.id, userId: alex.id, title: 'Join 2 PM communities', period: 'THIRTY_DAY', status: 'ACHIEVED', isAiSuggested: false },
      { planId: plan.id, userId: alex.id, title: 'Set up informational interviews with 3 PMs', period: 'THIRTY_DAY', status: 'ACHIEVED', isAiSuggested: true },
      // 60-day goals
      { planId: plan.id, userId: alex.id, title: 'Complete 10 product case studies', period: 'SIXTY_DAY', status: 'ON_TRACK', isAiSuggested: true },
      { planId: plan.id, userId: alex.id, title: 'Build a product portfolio with 2 case studies', period: 'SIXTY_DAY', status: 'ON_TRACK', isAiSuggested: true },
      { planId: plan.id, userId: alex.id, title: 'Apply to 5 PM positions', period: 'SIXTY_DAY', status: 'ACHIEVED', isAiSuggested: false },
      { planId: plan.id, userId: alex.id, title: 'Practice mock interviews weekly', period: 'SIXTY_DAY', status: 'ACHIEVED', isAiSuggested: true },
      // 90-day goals
      { planId: plan.id, userId: alex.id, title: 'Land first PM interview', period: 'NINETY_DAY', status: 'PENDING', isAiSuggested: true },
      { planId: plan.id, userId: alex.id, title: 'Complete system design for PMs course', period: 'NINETY_DAY', status: 'PENDING', isAiSuggested: true },
      { planId: plan.id, userId: alex.id, title: 'Get referral from networking contacts', period: 'NINETY_DAY', status: 'PENDING', isAiSuggested: false },
      { planId: plan.id, userId: alex.id, title: 'Receive PM job offer', period: 'NINETY_DAY', status: 'PENDING', isAiSuggested: true },
    ],
  });

  console.log('Created 90-day plan with goals');

  // ─── Milestones ────────────────────────────────────────
  await prisma.milestone.createMany({
    data: [
      { userId: alex.id, title: 'First mentoring session completed', achievedAt: new Date('2026-02-01') },
      { userId: alex.id, title: 'Resume rewritten for PM roles', achievedAt: new Date('2026-02-10') },
      { userId: alex.id, title: 'Completed PM fundamentals course', achievedAt: new Date('2026-02-14') },
      { userId: jordan.id, title: 'First mentoring session completed', achievedAt: new Date('2026-02-05') },
    ],
  });

  console.log('Created milestones');

  // ─── Sounding Board ────────────────────────────────────
  const board = await prisma.soundingBoard.create({
    data: { ownerId: alex.id },
  });

  await prisma.soundingBoardMember.createMany({
    data: [
      { boardId: board.id, userId: jordan.id, status: 'ACTIVE', relationship: 'Peer mentor' },
      { boardId: board.id, userId: michael.id, status: 'INVITED', relationship: 'Industry contact' },
    ],
  });

  console.log('Created sounding board');

  console.log('Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
