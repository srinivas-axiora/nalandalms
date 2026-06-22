// Module: AI — Acharya course generation (streaming + single-shot) and Copilot chat.
// All Acharya-specific helpers are module-scoped here; shared state/foundation
// helpers are injected via ctx. Handlers moved verbatim from server.js.
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { GoogleGenAI } from "@google/genai";

export function registerAI(app, ctx) {
  const {
    authenticate, requireRole, aiRateLimit, audit, now,
    courses, chapters, assessments,
    acharyaFeedbackMemory, saveAcharyaFeedbackMemory, getRelevantAcharyaFeedback,
    buildFeedbackGuidance, parseGeminiJson, geminiErrorMessage, withTimeout,
    getGeminiApiKey, GEMINI_MODEL, nextCourseId, sanitizeHtmlServer,
  } = ctx;

app.get("/api/ai/generation-feedback", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  res.json({ data: acharyaFeedbackMemory.slice(0, 25) });
});

app.post("/api/ai/generation-feedback", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const schema = z.object({
    skillName: z.string().min(1).default("General"),
    courseLevel: z.string().min(1).default("Beginner"),
    feedbackType: z.enum(["Course", "Chapter", "Assessment", "Overall"]).default("Overall"),
    rating: z.number().min(1).max(5).default(3),
    comment: z.string().min(10).max(1200),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = {
    id: uuid(),
    ...parsed.data,
    createdBy: req.user.id,
    createdAt: now(),
  };
  acharyaFeedbackMemory.unshift(item);
  if (acharyaFeedbackMemory.length > 100) acharyaFeedbackMemory.length = 100;
  saveAcharyaFeedbackMemory();
  audit(req.user.id, "ACHARYA_FEEDBACK", "ACHARYA", item.id, { feedbackType: item.feedbackType, rating: item.rating });
  return res.status(201).json({ data: item });
});


// ── AI Copilot Endpoint ──────────────────────────────────────────────────────

const SOFTWARE_EXPERT_SYSTEM_PROMPT = `You are **Nalanda AI Copilot** — a world-class Software Engineering expert and senior technical mentor embedded inside the Nalanda Learning & Development Platform.

Your expertise spans the FULL software development lifecycle:
- **Languages:** JavaScript, TypeScript, Python, Java, C#, Go, Rust, C++, SQL, Bash
- **Frontend:** React, Vue, Angular, HTML5, CSS3, Tailwind, Web APIs, Performance, Accessibility
- **Backend:** Node.js, Express, Django, Spring Boot, REST APIs, GraphQL, gRPC, Microservices
- **Databases:** PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, database design and optimization
- **DevOps & Cloud:** Docker, Kubernetes, CI/CD, GitHub Actions, AWS, GCP, Azure, Terraform, Nginx
- **Architecture:** System Design, DDD, CQRS, Event Sourcing, Clean Architecture, SOLID principles
- **Security:** OWASP Top 10, Auth (OAuth2/JWT/SSO), Secure Coding, Threat Modeling, Pen Testing
- **Testing:** Unit, Integration, E2E, TDD, BDD, Jest, Playwright, Cypress, JUnit
- **Data & AI:** Machine Learning basics, Data Structures, Algorithms, Big O, LLM integrations
- **Soft Skills for Engineers:** Code Reviews, Technical Documentation, System Design Interviews

### How you respond:
- Keep every normal answer under 30 words.
- Answer clearly and directly within that limit.
- Do not use code blocks, tables, or long lists unless the user explicitly asks for a longer answer.
- Only exceed 30 words when the user clearly asks for detail, elaboration, a long answer, step-by-step guidance, full explanation, or more than 30 words.
- Provide **accurate, expert-level** answers suitable for learners from Beginner to Expert.
- When explaining concepts, adapt to the learner's implied level based on their question.
- Use **concrete code examples** with proper syntax highlighting markers (\`\`\`language).
- Structure complex answers with numbered steps, bullet points, and clear headings.
- If the user is studying a specific chapter, ground your answer in that chapter's context.
- Be concise but complete. Avoid fluff. Prioritize correctness over brevity.
- For architecture/design questions, mention trade-offs clearly.
- Always encourage best practices (typing, testing, security, readability).
- If you don't know something, say so honestly rather than hallucinating.

You are available 24/7 to help learners master software engineering. Be an encouraging, knowledgeable mentor.`;

const allowsLongCopilotReply = (message = "") => /\b(more than 30 words|long answer|detailed|detail|elaborate|explain fully|full explanation|step[-\s]?by[-\s]?step|in depth|comprehensive|with code|code example)\b/i.test(message);

// Enforce the product rule that short Copilot answers are the default.
// The prompt asks Gemini to comply, and this guard catches any overlong response.
const capCopilotReply = (reply = "", maxWords = 30) => {
  const words = String(reply).trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return String(reply).trim();
  return `${words.slice(0, maxWords).join(" ").replace(/[.,;:!?-]+$/, "")}.`;
};

app.post("/api/ai/chat", authenticate, aiRateLimit, async (req, res) => {
  const { message, history = [], context } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (message.length > 4000) {
    return res.status(400).json({ error: "Message too long (max 4000 characters)." });
  }

  let systemPrompt = SOFTWARE_EXPERT_SYSTEM_PROMPT;
  if (context?.chapterTitle || context?.chapterBody || context?.courseTitle) {
    systemPrompt += `\n\n### Current Learning Context:\n`;
    if (context.courseTitle) systemPrompt += `- **Course:** ${context.courseTitle}\n`;
    if (context.chapterTitle) systemPrompt += `- **Chapter:** ${context.chapterTitle}\n`;
    if (context.chapterBody) {
      const trimmedBody = context.chapterBody.slice(0, 1200);
      systemPrompt += `- **Chapter Content Summary:** ${trimmedBody}${context.chapterBody.length > 1200 ? "..." : ""}\n`;
    }
    systemPrompt += `\nThe learner may be asking questions specifically about this chapter. Try to relate your answer to the chapter content when relevant.`;
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: "GEMINI_API_KEY is required for Nalanda AI Copilot." });
  }

  const chatPrompt = [
    systemPrompt,
    "\n### Recent Conversation:",
    ...(history || []).slice(-10).map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`),
    `User: ${message.trim()}`,
  ].join("\n");

  try {
    const model = GEMINI_MODEL;
    const ai = new GoogleGenAI({ apiKey });
    const response = await withTimeout(ai.models.generateContent({
      model,
      contents: chatPrompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    }), 25000, "AI chat");
    // Longer replies are allowed only when the learner explicitly asks for detail.
    const reply = allowsLongCopilotReply(message) ? (response.text || "").trim() : capCopilotReply(response.text || "");
    if (!reply.trim()) throw new Error("Empty response from Gemini");

    audit(req.user.id, "AI_CHAT", "AI_COPILOT", "session", { model, contextProvided: !!context?.chapterTitle });
    return res.json({ reply, model, source: "gemini" });
  } catch (err) {
    console.error("[AI Copilot] Gemini error:", err?.message || err);
    return res.status(err?.status === 429 ? 429 : 502).json({ error: geminiErrorMessage(err) });
  }
});

// ── Text-to-Course Agent Endpoint ──────────────────────────────────────────────

const acharyaCategories = ["ProblemSolving", "Technical", "CourseDepth", "BeyondCourse", "AnalyticalAbility"];
const acharyaTypePlan = [...Array(10).fill("MCQ"), ...Array(5).fill("Rating"), ...Array(5).fill("YesNo"), ...Array(5).fill("ShortAnswer"), ...Array(5).fill("LongAnswer")];
const normalizeAcharyaQuestion = (question, index, chapterTitle, skillName) => {
  const type = acharyaTypePlan[index];
  const category = acharyaCategories[Math.floor(index / 6)] || "CourseDepth";
  const base = { id: question?.id || `Q${index + 1}`, type, category, prompt: question?.prompt || `${category} ${type} question for ${chapterTitle} in ${skillName}.`, points: Number(question?.points || 10) };
  if (type === "MCQ") return { ...base, options: Array.isArray(question?.options) && question.options.length >= 4 ? question.options.slice(0, 4) : ["Option A", "Option B", "Option C", "Option D"], answer: Number.isInteger(question?.answer) ? question.answer : 0 };
  if (type === "Rating") return { ...base, ratingScale: Number(question?.ratingScale || 5) };
  if (type === "YesNo") return { ...base, options: ["Yes", "No"], answer: Number.isInteger(question?.answer) ? question.answer : 0 };
  return { ...base, expectedAnswer: question?.expectedAnswer || question?.rubric || "Evaluate the learner response against course accuracy, reasoning, and completeness.", rubric: question?.rubric || question?.expectedAnswer || "Check relevance, correctness, clarity, and applied understanding." };
};
const stripHtml = (html = "") => String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const wordCount = (html = "") => stripHtml(html).split(/\s+/).filter(Boolean).length;
const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const buildTrainingChapterBody = ({ topic, skillName, courseLevel, chunk }) => {
  const safeTopic = escapeHtml(topic || "Core Concepts");
  const safeSkillName = escapeHtml(skillName || "General");
  const safeCourseLevel = escapeHtml(courseLevel || "Beginner");
  const source = escapeHtml(chunk || "Use the course brief to connect this topic to practical workplace decisions, examples, and measurable learning outcomes.");
  return `<h2>Learning Outcomes</h2>
<ul>
  <li>Explain ${safeTopic} in the context of ${safeSkillName} work.</li>
  <li>Apply ${safeTopic} through a realistic workplace scenario.</li>
  <li>Identify common mistakes, risks, and quality checks.</li>
  <li>Use a simple decision framework to convert the lesson into an action plan.</li>
</ul>
<h2>Concept Overview</h2>
<p>${source}</p>
<p>This chapter is written for ${safeCourseLevel.toLowerCase()} learners who need more than a definition. The goal is to make the idea usable: what it means, when it matters, how it changes a decision, and how a learner can practice it without waiting for a perfect real-world situation.</p>
<p>Think of ${safeTopic} as a working habit rather than a theory. A good learner should be able to notice the situation, ask sharper questions, choose a response, and explain why that response is appropriate. That is what separates passive learning from professional performance.</p>
<blockquote><strong>Instructor note:</strong> Keep the lesson grounded in observable behavior. Learners should leave this chapter with phrases they can say, checks they can perform, and evidence they can show.</blockquote>
<h2>Step-by-Step Method</h2>
<ol>
  <li><strong>Frame the situation:</strong> identify the learner, customer, stakeholder, system, or process affected by the decision. Write the problem in one clear sentence before acting.</li>
  <li><strong>Separate facts from assumptions:</strong> list what is known, what is unknown, and what must be confirmed. This prevents the learner from solving the wrong problem quickly.</li>
  <li><strong>Select the response:</strong> use the principle from this chapter to decide what to say, do, document, improve, or escalate. Match the response to the risk and urgency.</li>
  <li><strong>Communicate clearly:</strong> explain the next action in simple language, confirm ownership, and set a timeline that another person can follow.</li>
  <li><strong>Check the outcome:</strong> verify whether the response solved the need, created new risks, or requires follow-up evidence.</li>
</ol>
<h2>Workplace Example</h2>
<p>Imagine a learner handling a client conversation where expectations are unclear. The client says the current process is too slow, but does not explain whether the delay is caused by approval time, unclear inputs, rework, or system performance. A shallow response would be to promise speed immediately. A professional response starts by clarifying the real friction.</p>
<p>The learner might say: "Let me confirm the part that is slowing you down. Are we talking about the time to collect information, the approval handoff, or the final delivery step?" That question turns a vague complaint into a useful diagnosis. Once the cause is known, the learner can propose a realistic action: simplify the input checklist, assign a single approver, automate a status update, or escalate a blocker.</p>
<p>This example shows why ${safeTopic} matters. The learner is not simply being polite or knowledgeable. They are creating clarity, reducing rework, and giving the client confidence that the next step is controlled.</p>
<h2>Key Takeaways</h2>
<ul>
  <li>Good learning content should lead to visible workplace behavior.</li>
  <li>Strong responses begin with context, not assumptions.</li>
  <li>Examples should show the learner what to say, decide, document, and verify.</li>
  <li>Professional judgment improves when learners practice with realistic constraints.</li>
</ul>
<h2>Practice Activity</h2>
<p>Write a short response, checklist, or action plan for a realistic case involving ${safeTopic}. Use the five-step method above. First, state the situation in one sentence. Second, list the facts and assumptions. Third, choose a response and explain why it fits. Fourth, write the message you would send to a stakeholder. Fifth, define how you will verify success.</p>
<p>After drafting the response, revise it for clarity. Remove vague phrases such as "as soon as possible" or "we will look into it." Replace them with specific commitments, owners, and checkpoints. This makes the output easier to assess and easier to use at work.</p>
<h2>Common Mistakes</h2>
<ul>
  <li>Giving a generic answer without understanding the learner or client context.</li>
  <li>Skipping examples, practice, or verification steps.</li>
  <li>Using unclear language that cannot be acted on or assessed.</li>
  <li>Explaining concepts without showing how they change day-to-day decisions.</li>
  <li>Repeating the same advice in different words instead of adding depth, contrast, or examples.</li>
</ul>
<h2>Reflection Prompt</h2>
<p>Before moving on, ask yourself: where would this lesson fail in a real workplace? Would a new learner know what to do next? Would a manager be able to observe the behavior? Would a client or stakeholder experience a clearer result? If the answer is no, strengthen the example or practice task until the learning becomes visible.</p>
<h2>Quick Knowledge Check</h2>
<p>What is the most important decision in this chapter, and how would you apply it during a real ${safeSkillName} task? Write your answer in three parts: the situation, the action, and the evidence that the action worked.</p>
<h2>Summary</h2>
<p>${safeTopic} becomes useful when the learner can explain it, practice it, avoid common mistakes, and apply it consistently in workplace situations. A premium learning page should feel practical, structured, and human. It should guide the learner from understanding to action, then from action to reflection. That is the standard to use before moving to the next chapter.</p>`;
};
const acharyaStopWords = new Set([
  "training", "complete", "freshers", "improve", "cover", "basic", "basics", "course", "chapter",
  "learn", "learning", "skills", "skill", "experience", "clearly", "politely", "realistic",
  "workplace", "development", "introduction", "foundation", "foundations"
]);
const titleCase = (value = "") => value.split(/\s+/).filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
const extractTopicWords = (text, skillName) => {
  const words = String(text)
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z-]/g, "").toLowerCase())
    .filter((word) => word.length > 4 && !acharyaStopWords.has(word));
  const counts = new Map();
  words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([word]) => titleCase(word));
  return ranked.length ? ranked.slice(0, 8) : [skillName || "Core Concepts"];
};
const buildMockAcharyaDraft = ({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs }) => {
  const sentences = text.split(/[.!?]+/).map((item) => item.trim()).filter((item) => item.length > 10);
  const topicWords = extractTopicWords(text, skillName);
  const chunkSize = Math.max(1, Math.ceil((sentences.length || 1) / chapterCount));
  const chapters = Array.from({ length: chapterCount }, (_, index) => {
    const chunk = sentences.slice(index * chunkSize, (index + 1) * chunkSize).join(". ") || text.slice(0, 700);
    const topic = topicWords[index % Math.max(1, topicWords.length)] || skillName;
    return { title: `${index + 1}. ${topic} in Practice`, description: `A ${courseLevel.toLowerCase()} level chapter covering ${topic} through explanation, workplace examples, practice, and checks for understanding.`, contentType: "Rich Text", body: buildTrainingChapterBody({ topic, skillName, courseLevel, chunk }), durationMinutes: Math.max(25, Math.min(60, Math.ceil(chunk.length / 70))), minimumTimeMinutes: Math.max(18, Math.min(45, Math.ceil(chunk.length / 100))) };
  });
  const assessments = chapters.map((chapter, chapterIndex) => ({ title: `${chapter.title.replace(/^\d+\.\s*/, "")} Assessment`, type: "Mixed", chapterIndex, durationMinutes: 45, passScore: 70, questionLimit: 30, questions: acharyaTypePlan.map((type, index) => normalizeAcharyaQuestion({ prompt: `${acharyaCategories[Math.floor(index / 6)]}: ${type} item ${index + 1} for "${chapter.title}" in the ${skillName} course.`, options: ["Strongly aligned", "Partially aligned", "Weakly aligned", "Not aligned"], answer: 0 }, index, chapter.title, skillName)) }));
  return { course: { title: topicWords.length ? `${courseLevel} ${skillName}: ${topicWords.slice(0, 3).join(", ")}` : `${courseLevel} ${skillName} Course`, description: `An Acharya-generated ${courseLevel.toLowerCase()} course for ${skillName}, built from the provided source material with chapter-aligned assessments.`, skill: skillName, skillId, targetLevel: courseLevel, difficulty: courseLevel === "Expert" ? "Advanced" : courseLevel, category: skillName, tags: ["Acharya", skillName, courseLevel], prerequisites: [], thumbnailColor: "#22d3ee", estimatedHours: Math.max(1, Math.ceil(chapters.reduce((sum, chapter) => sum + chapter.durationMinutes, 0) / 60)) }, chapters, assessments, generationDurationMs };
};

const acharyaRequiredChapterSections = [
  "Learning Outcomes",
  "Concept Overview",
  "Step-by-Step Method",
  "Workplace Example",
  "Key Takeaways",
  "Practice Activity",
  "Common Mistakes",
  "Quick Knowledge Check",
  "Summary",
];

// Quality gate for each generated chapter before the pipeline moves forward.
// It checks length, instructional structure, examples, formatting, and repetition.
const validateAcharyaChapter = (chapter) => {
  const body = String(chapter?.body || "");
  const text = stripHtml(body);
  const count = wordCount(body);
  const missingSections = acharyaRequiredChapterSections.filter((section) => !body.toLowerCase().includes(section.toLowerCase()));
  const failures = [];
  if (count < 500) failures.push(`Minimum word count not met (${count}/500 words).`);
  if (missingSections.length) failures.push(`Missing sections: ${missingSections.join(", ")}.`);
  if (!/<(ul|ol)[\s>]/i.test(body)) failures.push("Needs bullet points or numbered lists.");
  if (!/<(blockquote|aside|strong)[\s>]/i.test(body)) failures.push("Needs a highlighted note or key takeaway emphasis.");
  if (!/example|scenario|imagine|case/i.test(text)) failures.push("Needs a practical example or scenario.");
  const sentences = text.split(/[.!?]+/).map((sentence) => sentence.trim().toLowerCase()).filter((sentence) => sentence.length > 40);
  if (new Set(sentences).size < Math.max(1, Math.floor(sentences.length * 0.8))) failures.push("Potential repetitive wording detected.");
  return {
    passed: failures.length === 0,
    wordCount: count,
    missingSections,
    failures,
  };
};

// Merge provider output with a deterministic fallback so every chapter has the fields
// the frontend expects, even if the provider returns partial JSON.
const normalizeAcharyaChapter = (chapter, fallback, index) => ({
  ...fallback,
  ...(chapter || {}),
  title: chapter?.title || fallback.title || `Chapter ${index + 1}`,
  description: chapter?.description || fallback.description || "",
  contentType: "Rich Text",
  body: chapter?.body || fallback.body,
  durationMinutes: Number(chapter?.durationMinutes || fallback.durationMinutes || 35),
  minimumTimeMinutes: Number(chapter?.minimumTimeMinutes || fallback.minimumTimeMinutes || 25),
});

// The first generation step creates only the course map. Full content is written
// later one chapter at a time so the output does not become shallow.
const normalizeAcharyaOutline = ({ parsed, fallback, skillName, skillId, courseLevel, chapterCount }) => {
  const fallbackCourse = fallback.course;
  const parsedCourse = parsed?.course || {};
  const parsedChapters = Array.isArray(parsed?.chapters) ? parsed.chapters : [];
  return {
    course: {
      ...fallbackCourse,
      ...parsedCourse,
      skill: skillName,
      skillId,
      targetLevel: courseLevel,
      difficulty: courseLevel === "Expert" ? "Advanced" : courseLevel,
      tags: Array.isArray(parsedCourse.tags) && parsedCourse.tags.length ? parsedCourse.tags : fallbackCourse.tags,
    },
    chapters: Array.from({ length: chapterCount }, (_, index) => ({
      title: parsedChapters[index]?.title || fallback.chapters[index]?.title || `Chapter ${index + 1}`,
      description: parsedChapters[index]?.description || fallback.chapters[index]?.description || "",
      learningGoal: parsedChapters[index]?.learningGoal || parsedChapters[index]?.goal || `Apply ${skillName} in a realistic workplace situation.`,
      topic: parsedChapters[index]?.topic || extractTopicWords(`${parsedChapters[index]?.title || ""} ${parsedChapters[index]?.description || ""}`, skillName)[0] || skillName,
    })),
  };
};

// Assessments are intentionally normalized after all chapters are complete,
// preserving the required sequence: outline -> chapters -> validation -> assessments.
const normalizeAcharyaAssessments = (assessments, chapters, fallbackAssessments, skillName) => chapters.map((chapter, chapterIndex) => {
  const raw = Array.isArray(assessments) ? assessments[chapterIndex] : null;
  const fallback = fallbackAssessments[chapterIndex] || {};
  const rawQuestions = Array.isArray(raw?.questions) ? raw.questions : fallback.questions;
  return {
    ...fallback,
    ...(raw || {}),
    title: raw?.title || fallback.title || `${chapter.title.replace(/^\d+\.\s*/, "")} Assessment`,
    type: "Mixed",
    chapterIndex,
    durationMinutes: Number(raw?.durationMinutes || fallback.durationMinutes || 45),
    passScore: Number(raw?.passScore || fallback.passScore || 70),
    questionLimit: 30,
    questions: acharyaTypePlan.map((type, index) => normalizeAcharyaQuestion(rawQuestions?.[index], index, chapter.title, skillName)),
  };
});

// Newline-delimited JSON lets the frontend show live progress without waiting
// for the entire course draft to finish.
const writeNdjson = (res, event) => {
  res.write(`${JSON.stringify({ at: now(), ...event })}\n`);
};

app.post("/api/ai/generate-course-stream", authenticate, requireRole("Admin", "Manager"), aiRateLimit, async (req, res) => {
  const startedAt = Date.now();
  const { text, skillId = "", skillName = "General", courseLevel = "Beginner" } = req.body;
  const chapterCount = Math.max(1, Math.min(20, Number(req.body.chapterCount || 3)));
  if (!text || text.trim().length < 50) return res.status(400).json({ error: "Please provide sufficient educational text (min 50 characters) to generate a course." });

  res.writeHead(200, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const fallback = buildMockAcharyaDraft({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs: 0 });
  const relevantFeedback = getRelevantAcharyaFeedback({ text, skillName, courseLevel });
  const feedbackGuidance = buildFeedbackGuidance(relevantFeedback);
  const apiKey = getGeminiApiKey();
  // Provider generation is opt-in here. The default path is deterministic and fast,
  // while still following the same staged pipeline and validation rules.
  const ai = apiKey && req.body?.useProviderGeneration === true ? new GoogleGenAI({ apiKey }) : null;
  let usedFallback = !ai;
  let repairedSections = 0;

  // Prevent a slow provider call from freezing the course creation experience.
  const withTimeout = (promise, ms, label) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms)),
  ]);

  const generateJson = async (prompt, maxOutputTokens = 8192, timeoutMs = 20000) => {
    if (!ai) throw new Error("Gemini API key is not configured.");
    const response = await withTimeout(ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.25, maxOutputTokens },
    }), timeoutMs, "Acharya generation step");
    return parseGeminiJson(response.text);
  };

  try {
    writeNdjson(res, { type: "status", stage: "reading", message: "Reading the source material and generation requirements." });
    writeNdjson(res, { type: "status", stage: "outline", message: `Creating the complete ${chapterCount}-chapter structure before writing content.` });

    let outline = normalizeAcharyaOutline({ parsed: null, fallback, skillName, skillId, courseLevel, chapterCount });
    if (ai) {
      try {
        const parsed = await generateJson(`You are Acharya, Nalanda's senior instructional designer. Return strict JSON only.

First create only the course structure. Do not write full chapter content and do not write assessments yet.

Course rules:
- Build exactly ${chapterCount} chapters/modules.
- Sequence chapters from foundation to applied practice.
- Each chapter plan must have title, description, topic, and learningGoal.
- The course should feel premium, practical, and specific to "${skillName}" at "${courseLevel}" level.

Prior feedback memory:
${feedbackGuidance}

Output JSON:
{
  "course": { "title": "...", "description": "...", "tags": ["..."], "difficulty": "${courseLevel}" },
  "chapters": [
    { "title": "...", "description": "...", "topic": "...", "learningGoal": "..." }
  ]
}

Source material:
${text}`, 4096);
        outline = normalizeAcharyaOutline({ parsed, fallback, skillName, skillId, courseLevel, chapterCount });
      } catch (err) {
        usedFallback = true;
        writeNdjson(res, { type: "status", stage: "outline", message: "Outline generation needed the structured fallback, so Acharya is continuing with a deterministic course plan." });
      }
    }

    writeNdjson(res, { type: "outline", message: `Course structure created with ${chapterCount} chapters.`, course: outline.course, chapters: outline.chapters });

    const chapters = [];
    for (let index = 0; index < chapterCount; index += 1) {
      const plan = outline.chapters[index];
      const fallbackChapter = fallback.chapters[index];
      writeNdjson(res, { type: "chapter_start", index, total: chapterCount, message: `Creating Chapter ${index + 1} of ${chapterCount}: ${plan.title}` });

      let chapter = fallbackChapter;
      if (ai) {
        try {
          const parsed = await generateJson(`You are Acharya, writing one premium LMS chapter. Return strict JSON only.

Write only Chapter ${index + 1} of ${chapterCount}. Do not write other chapters. Do not write assessments.

Quality rules:
- Minimum 500 words in the body.
- Use clean HTML, not Markdown.
- Include these sections: ${acharyaRequiredChapterSections.join(", ")}.
- Use proper headings, subheadings, paragraphs, bullet lists, numbered lists, highlighted notes, examples, practical explanations, and key takeaways.
- Sound like a professional educator, technical blogger, and instructional designer.
- Avoid generic AI phrasing, repetition, filler, and continuous plain paragraphs.
- Include a workplace example and an activity the learner can complete.
- Keep the chapter specific to "${skillName}" and "${courseLevel}" learners.

Course title: ${outline.course.title}
Chapter plan: ${JSON.stringify(plan)}
Previously completed chapters: ${chapters.map((item) => item.title).join(", ") || "None"}
Prior feedback memory:
${feedbackGuidance}

Output JSON:
{ "title": "...", "description": "...", "contentType": "Rich Text", "body": "<h2>Learning Outcomes</h2>...", "durationMinutes": 35, "minimumTimeMinutes": 25 }

Source material:
${text}`, 8192);
          chapter = normalizeAcharyaChapter(parsed, fallbackChapter, index);
        } catch (err) {
          usedFallback = true;
          chapter = fallbackChapter;
        }
      }

      let validation = validateAcharyaChapter(chapter);
      if (!validation.passed && ai) {
        repairedSections += 1;
        writeNdjson(res, { type: "chapter_repair", index, total: chapterCount, message: `Chapter ${index + 1} needs a focused quality repair before moving on.`, validation });
        try {
          const repaired = await generateJson(`Repair only the failed parts of this chapter and return the full corrected chapter JSON.

Validation failures:
${validation.failures.join("\n")}

Repair rules:
- Keep the title unless it is unclear.
- Body must be at least 500 words.
- Preserve good existing content and improve missing or weak sections.
- Use clean HTML with headings, lists, highlighted notes, examples, practical explanations, and key takeaways.
- Do not write assessments.

Course: ${outline.course.title}
Skill: ${skillName}
Level: ${courseLevel}
Chapter JSON:
${JSON.stringify(chapter)}`, 8192);
          chapter = normalizeAcharyaChapter(repaired, fallbackChapter, index);
          validation = validateAcharyaChapter(chapter);
        } catch (err) {
          usedFallback = true;
        }
      }

      if (!validation.passed) {
        chapter = fallbackChapter;
        validation = validateAcharyaChapter(chapter);
        usedFallback = true;
      }

      chapters.push(chapter);
      writeNdjson(res, {
        type: "chapter_done",
        index,
        total: chapterCount,
        message: `Chapter ${index + 1} of ${chapterCount} Created`,
        chapter,
        validation,
      });
    }

    writeNdjson(res, { type: "assessment_start", message: "All chapters are complete. Creating assessments, quizzes, MCQs, assignments, and descriptive questions now." });

    let assessments = fallback.assessments;
    if (ai) {
      try {
        const parsed = await generateJson(`You are Acharya, creating assessments only after all chapters are complete. Return strict JSON only.

Create one mixed assessment per chapter. Each assessment must include 30 questions in this order:
- 10 MCQ
- 5 Rating
- 5 YesNo
- 5 ShortAnswer
- 5 LongAnswer

Questions must test problem solving, technical understanding, course depth, beyond-course application, and analytical ability. Use the finished chapters as the source of truth.

Output JSON:
{ "assessments": [
  { "title": "...", "durationMinutes": 45, "passScore": 70, "questions": [{ "prompt": "...", "options": ["...", "...", "...", "..."], "answer": 0, "points": 10 }] }
] }

Skill: ${skillName}
Level: ${courseLevel}
Chapters:
${JSON.stringify(chapters.map((chapter, i) => ({ index: i, title: chapter.title, description: chapter.description, bodyPreview: stripHtml(chapter.body).slice(0, 1200) })))}`, 8192);
        assessments = normalizeAcharyaAssessments(parsed.assessments, chapters, fallback.assessments, skillName);
      } catch (err) {
        usedFallback = true;
        assessments = normalizeAcharyaAssessments(null, chapters, fallback.assessments, skillName);
      }
    } else {
      assessments = normalizeAcharyaAssessments(null, chapters, fallback.assessments, skillName);
    }

    writeNdjson(res, { type: "assessment_done", message: `Assessments created for ${chapters.length} chapters.`, assessments });

    const generationDurationMs = Date.now() - startedAt;
    const draft = {
      course: {
        ...outline.course,
        estimatedHours: Math.max(1, Math.ceil(chapters.reduce((sum, chapter) => sum + Number(chapter.durationMinutes || 35), 0) / 60)),
      },
      chapters,
      assessments,
      generationDurationMs,
      usedFallback,
      usedFeedbackCount: relevantFeedback.length,
      repairedSections,
    };

    audit(req.user.id, "ACHARYA_GENERATE_DRAFT_STREAM", "ACHARYA", "draft", { skillName, courseLevel, chapterCount, repairedSections });
    writeNdjson(res, { type: "final", message: "Acharya draft completed and ready for review.", draft });
  } catch (err) {
    console.error("[Acharya Stream Error]", err?.message || err);
    writeNdjson(res, { type: "error", message: geminiErrorMessage(err), detail: err?.message || "Unknown error" });
  } finally {
    res.end();
  }
});

app.post("/api/ai/generate-course", authenticate, requireRole("Admin", "Manager"), aiRateLimit, async (req, res, next) => {
  if (req.body?.skillId || req.body?.chapterCount || req.body?.courseLevel) {
    const startedAt = Date.now();
    const { text, skillId = "", skillName = "General", courseLevel = "Beginner" } = req.body;
    const chapterCount = Math.max(1, Math.min(20, Number(req.body.chapterCount || 3)));
    if (!text || text.trim().length < 50) return res.status(400).json({ error: "Please provide sufficient educational text (min 50 characters) to generate a course." });
    const relevantFeedback = getRelevantAcharyaFeedback({ text, skillName, courseLevel });
    const feedbackGuidance = buildFeedbackGuidance(relevantFeedback);
    const prompt = `You are Acharya, Nalanda's course generation specialist for employee skill training and development. Return strict JSON only.

Build exactly ${chapterCount} chapters. The application will generate assessments separately, so focus on excellent chapter teaching content.

Chapter generation rules:
- Each chapter must be detailed enough for a 25-60 minute self-paced training session.
- Each chapter body must be clean HTML, not Markdown, with these sections in order: <h2>Learning Outcomes</h2>, <h2>Concept Overview</h2>, <h2>Step-by-Step Method</h2>, <h2>Workplace Example</h2>, <h2>Practice Activity</h2>, <h2>Common Mistakes</h2>, <h2>Quick Knowledge Check</h2>, <h2>Summary</h2>.
- Learning outcomes must be specific, observable, and aligned to skill "${skillName}".
- Include realistic workplace examples, especially client handling, communication, decision-making, escalation, or task execution when relevant.
- Do not create shallow one-paragraph chapters. Expand brief source material into a complete lesson using safe, practical training assumptions.
- Do not wrap the HTML in code fences. Do not escape HTML tags.

Prior feedback memory to improve this generation:
${feedbackGuidance}

Output JSON shape:
{
  "course": { "title": "...", "description": "...", "tags": ["..."], "difficulty": "${courseLevel}" },
  "chapters": [
    { "title": "...", "description": "...", "contentType": "Rich Text", "body": "<h2>Learning Outcomes</h2>...", "durationMinutes": 35, "minimumTimeMinutes": 25 }
  ]
}

Use skill "${skillName}" and course level "${courseLevel}". Source text: ${text}`;
    try {
      let draft = null;
      const apiKey = getGeminiApiKey();
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        try {
          const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 8192 },
          });
          const parsed = parseGeminiJson(response.text);
          const generationDurationMs = Date.now() - startedAt;
          const mock = buildMockAcharyaDraft({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs });
          draft = {
            ...mock,
            course: { ...mock.course, ...(parsed.course || {}), skill: skillName, skillId, targetLevel: courseLevel, difficulty: courseLevel === "Expert" ? "Advanced" : courseLevel },
            chapters: Array.from({ length: chapterCount }, (_, index) => ({ ...mock.chapters[index], ...(parsed.chapters || [])[index] })),
            assessments: mock.assessments,
            generationDurationMs,
            usedFeedbackCount: relevantFeedback.length,
          };
        } catch (err) {
          console.warn("[Acharya Gemini Draft Warning] Using structured fallback:", err?.message || err);
          draft = { ...buildMockAcharyaDraft({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs: Date.now() - startedAt }), usedFallback: true, usedFeedbackCount: relevantFeedback.length };
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        draft = { ...buildMockAcharyaDraft({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs: Date.now() - startedAt }), usedFallback: true, usedFeedbackCount: relevantFeedback.length };
      }
      audit(req.user.id, "ACHARYA_GENERATE_DRAFT", "ACHARYA", "draft", { skillName, courseLevel, chapterCount });
      return res.status(201).json({ draft });
    } catch (err) {
      console.error("[Acharya Draft Error]", err);
      return res.status(err?.status === 429 ? 429 : 500).json({ error: geminiErrorMessage(err) });
    }
  }
  return next();
});

app.post("/api/ai/generate-course", authenticate, requireRole("Admin", "Manager"), aiRateLimit, async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: "Please provide sufficient educational text (min 50 characters) to generate a course." });
  }

  const prompt = `You are the Nalanda Text-to-Course Preparation Agent, an autonomous specialist responsible for converting raw educational content into fully structured, pedagogically optimized, multimedia-ready course chapters.

OBJECTIVE:
Transform the provided unstructured text into a complete, interactive, LMS-ready course structure in strict JSON format.

CHAPTER GENERATION GUIDELINES:
- Each chapter must be detailed enough for a 25-60 minute self-paced training session, not a short note.
- Each chapter body must be clean HTML, not Markdown, with these sections in order:
  <h2>Learning Outcomes</h2>
  <h2>Concept Overview</h2>
  <h2>Step-by-Step Method</h2>
  <h2>Workplace Example</h2>
  <h2>Practice Activity</h2>
  <h2>Common Mistakes</h2>
  <h2>Quick Knowledge Check</h2>
  <h2>Summary</h2>
- Use paragraphs, ordered lists, unordered lists, and scenario-based examples.
- Expand brief source notes into complete training content using safe, practical assumptions.
- Keep the course focused on skill training and development.
- Do not wrap HTML in code fences. Do not escape HTML tags.

REQUIREMENTS:
- Understand & segment text into logical learning units (create multiple chapters when content is substantial).
- Identify topic hierarchy from context, not formatting.
- Rewrite content in a clear, student-friendly voice.
- Generate chapter-level & topic-level learning objectives.
- Summarize and simplify complex parts.
- Detect missing concepts & fill gaps.
- Auto-recommend images with text-to-image prompts inside the chapter body (e.g., [Suggested Image: ...]).
- Generate pre-assessment & post-assessment questions.
- Auto-generate a glossary section in each chapter.
- Keep language neutral, non-biased, and educational.
- Each question must have a unique "id" field like "Q1", "Q2", etc.

OUTPUT FORMAT (Strict JSON):
{
  "course": {
    "title": "Catchy, professional title",
    "description": "Comprehensive course description (2-3 sentences)",
    "skill": "Main subject area (e.g., Leadership, Security, Data Science)",
    "tags": ["tag1", "tag2", "tag3"],
    "difficulty": "Beginner | Intermediate | Advanced"
  },
  "chapters": [
    {
      "title": "Chapter title",
      "description": "Short chapter description",
      "body": "Full clean HTML content with all required chapter sections. Use paragraphs, <ol>, <ul>, workplace examples, practice activities, common mistakes, and a summary.",
      "durationMinutes": 35
    }
  ],
  "assessments": [
    {
      "title": "Pre-Assessment or Post-Assessment title",
      "type": "MCQ",
      "durationMinutes": 10,
      "passScore": 80,
      "questions": [
        {
          "id": "Q1",
          "type": "MCQ",
          "prompt": "Question text",
          "options": ["A", "B", "C", "D"],
          "answer": 0,
          "points": 10
        }
      ]
    }
  ]
}

RAW TEXT TO PROCESS:
${text}
`;

  try {
    const apiKey = getGeminiApiKey();
    let parsedResult = null;

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      parsedResult = JSON.parse(response.text);
    } else {
      console.warn("[Text-to-Course] GEMINI_API_KEY not found. Using robust mock generator fallback.");
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Build a richer multi-chapter mock based on content length
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const chunkSize = Math.max(3, Math.ceil(sentences.length / 3));
      const chapterTexts = [];
      for (let i = 0; i < sentences.length; i += chunkSize) {
        chapterTexts.push(sentences.slice(i, i + chunkSize).join(". ").trim());
      }
      if (chapterTexts.length === 0) chapterTexts.push(text.slice(0, 800));

      const topicWords = extractTopicWords(text, "General");
      const courseTitle = topicWords.length >= 2
        ? "Mastering " + topicWords.slice(0, 3).join(", ")
        : "Introduction to " + (text.split(" ").slice(0, 5).join(" ") || "the Topic");

      parsedResult = {
        course: {
          title: courseTitle,
          description: "An auto-generated course based on the provided text. This course breaks down complex topics into easily digestible learning modules with assessments and glossaries.",
          skill: "General",
          tags: ["Auto-Generated", "AI", ...topicWords.slice(0, 2)],
          difficulty: text.length > 3000 ? "Intermediate" : "Beginner"
        },
        chapters: chapterTexts.map((ct, i) => {
          const topic = topicWords[i % Math.max(1, topicWords.length)] || "Core Concepts";
          return {
            title: i === 0 ? "Foundations & Core Concepts" : i === chapterTexts.length - 1 ? "Advanced Topics & Synthesis" : "Deep Dive: Key Principles " + (i + 1),
            description: "Chapter " + (i + 1) + " builds practical understanding through concepts, examples, practice, and checks for application.",
            body: buildTrainingChapterBody({ topic, skillName: parsedResult?.course?.skill || "General", courseLevel: text.length > 3000 ? "Intermediate" : "Beginner", chunk: ct }),
            durationMinutes: Math.max(25, Math.min(60, Math.ceil(ct.length / 70)))
          };
        }),
        assessments: [
          {
            title: "Pre-Assessment: Baseline Knowledge",
            type: "MCQ",
            durationMinutes: 10,
            passScore: 60,
            questions: [
              { id: "Q1", type: "MCQ", prompt: "Which best describes the primary subject of this course?", options: ["An unrelated topic", "The core subject covered in the text", "A historical overview only", "None of the above"], answer: 1, points: 25 },
              { id: "Q2", type: "MCQ", prompt: "What is a key objective of the first chapter?", options: ["Memorize dates", "Understand foundational concepts", "Skip to advanced topics", "Review unrelated material"], answer: 1, points: 25 },
            ]
          },
          {
            title: "Post-Assessment: Comprehensive Review",
            type: "MCQ",
            durationMinutes: 15,
            passScore: 70,
            questions: [
              { id: "Q1", type: "MCQ", prompt: "What is the primary focus of the first chapter?", options: ["Advanced implementation", "Core concepts and fundamentals", "Historical overview", "Conclusion"], answer: 1, points: 25 },
              { id: "Q2", type: "MCQ", prompt: "Which learning approach is emphasized throughout the course?", options: ["Rote memorization", "Practical application", "Passive reading", "Speed reading"], answer: 1, points: 25 },
              { id: "Q3", type: "MCQ", prompt: "What should you do after completing all chapters?", options: ["Nothing", "Review key concepts and attempt the assessment", "Delete the course", "Skip the summary"], answer: 1, points: 25 },
              { id: "Q4", type: "Descriptive", prompt: "In your own words, summarize the most important concept you learned from this course and describe how you would apply it.", points: 25 },
            ]
          }
        ]
      };
    }

    // Ensure every question has an id
    (parsedResult.assessments || []).forEach(a => {
      (a.questions || []).forEach((q, qi) => {
        if (!q.id) q.id = "Q" + (qi + 1);
      });
    });

    const newCourse = {
      id: nextCourseId(parsedResult.course?.skill || "GN"),
      title: parsedResult.course?.title || "Untitled Course",
      description: parsedResult.course?.description || "No description provided",
      skill: parsedResult.course?.skill || "General",
      tags: parsedResult.course?.tags || [],
      contentTypes: ["Rich Text"],
      approval: req.user.role === "Admin" ? "Approved" : "Pending",
      status: "Active",
      ownerId: req.user.id,
      version: 1,
      createdAt: now(),
      updatedAt: now()
    };

    const newChapters = (parsedResult.chapters || []).map((ch, idx) => ({
      id: `CH-${Math.floor(1000 + Math.random() * 9000)}`,
      courseId: newCourse.id,
      sequence: idx + 1,
      title: ch.title || "Untitled Chapter",
      description: ch.description || "",
      contentType: "Rich Text",
      body: sanitizeHtmlServer(ch.body || ""),
      durationMinutes: ch.durationMinutes || 10,
      minimumTimeMinutes: Math.floor((ch.durationMinutes || 10) * 0.7),
      createdAt: now(),
      updatedAt: now()
    }));

    // Map each assessment to its corresponding chapter when possible
    const newAssessments = (parsedResult.assessments || []).map((a, ai) => ({
      id: `ASM-${Math.floor(1000 + Math.random() * 9000)}`,
      title: a.title || "Knowledge Check",
      courseId: newCourse.id,
      chapterId: newChapters.length > 0 ? newChapters[Math.min(ai, newChapters.length - 1)].id : null,
      type: a.type || "MCQ",
      strictMode: true,
      questions: (a.questions || []).map((q, qi) => ({ ...q, id: q.id || ("Q" + (qi + 1)) })),
      durationMinutes: a.durationMinutes || 15,
      passScore: a.passScore || 80,
      ownerId: req.user.id,
      approval: "Approved",
      status: "Active",
      createdAt: now(),
      updatedAt: now()
    }));

    courses.unshift(newCourse);
    chapters.push(...newChapters);
    assessments.unshift(...newAssessments);

    audit(req.user.id, "AI_GENERATE_COURSE", "COURSE", newCourse.id, { title: newCourse.title, chapters: newChapters.length, assessments: newAssessments.length });

    return res.status(201).json({
      data: newCourse,
      chapters: newChapters,
      assessments: newAssessments,
      chaptersCount: newChapters.length,
      assessmentsCount: newAssessments.length
    });

  } catch (err) {
    console.error("[Text-to-Course Error]", err);
    return res.status(err?.status === 429 ? 429 : 500).json({ error: geminiErrorMessage(err) });
  }
});
}
