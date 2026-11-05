// Module: AI — Acharya course generation (streaming + single-shot) and Copilot chat.
// All Acharya-specific helpers are module-scoped here; shared state/foundation
// helpers are injected via ctx. Handlers moved verbatim from server.js.
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey, GEMINI_MODEL } from "../../config.js";
import { parseGeminiJson, geminiErrorMessage, withTimeout } from "../../lib.js";
import { now, acharyaFeedbackMemory } from "../../core.js";
import { audit, saveAcharyaFeedbackMemory, getRelevantAcharyaFeedback, buildFeedbackGuidance } from "../../domain.js";
import { authenticate, requireRole, aiRateLimit } from "../../middleware.js";
import { handleLocalChat } from "./localAgent.js";
import { aiFeedbackRepository } from "../../repositories/ai-feedback.repository.pg.js";

const USE_PG_COURSES = process.env.USE_PG_COURSES === "1";

const acharyaGenerationSchema = z.object({
  text: z.string().trim().min(50).max(50_000),
  skillId: z.string().trim().max(200).default(""),
  skillName: z.string().trim().min(1).max(200).default("General"),
  courseLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).default("Beginner"),
  chapterCount: z.coerce.number().int().min(1).max(20).default(3),
  useProviderGeneration: z.boolean().default(false),
}).strict();

const parseGenerationRequest = (req, res) => {
  const parsed = acharyaGenerationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return null;
  }
  return parsed.data;
};

export function registerAI(app) {
app.get("/api/ai/generation-feedback", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
  if (USE_PG_COURSES) return res.json({ data: await aiFeedbackRepository.list(req.user) });
  return res.json({ data: acharyaFeedbackMemory.slice(0, 25) });
});

app.post("/api/ai/generation-feedback", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
  const schema = z.object({
    skillName: z.string().trim().min(1).max(200).default("General"),
    courseLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).default("Beginner"),
    feedbackType: z.enum(["Course", "Chapter", "Assessment", "Overall"]).default("Overall"),
    rating: z.number().int().min(1).max(5).default(3),
    comment: z.string().trim().min(10).max(1200),
  }).strict();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  if (USE_PG_COURSES) {
    const item = await aiFeedbackRepository.create({ actor: req.user, feedback: parsed.data });
    return res.status(201).json({ data: item });
  }
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

const relevantFeedbackFor = ({ actor, text, skillName, courseLevel }) => USE_PG_COURSES
  ? aiFeedbackRepository.findRelevant({ actor, skillName, courseLevel })
  : Promise.resolve(getRelevantAcharyaFeedback({ text, skillName, courseLevel }));


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

  const apiKey = getGeminiApiKey();
  const useProvider = apiKey && req.body.useProvider === true;

  if (!useProvider) {
    try {
      const localResponse = await handleLocalChat(req.user, message, history, context);
      audit(req.user.id, "AI_CHAT", "AI_COPILOT", "session", { model: localResponse.model, contextProvided: !!context?.chapterTitle, source: "local" });
      return res.json(localResponse);
    } catch (localErr) {
      console.error("[AI Copilot] Local agent error:", localErr);
      return res.status(500).json({ error: "Local agent error processing message" });
    }
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

    audit(req.user.id, "AI_CHAT", "AI_COPILOT", "session", { model, contextProvided: !!context?.chapterTitle, source: "gemini" });
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
  const input = parseGenerationRequest(req, res);
  if (!input) return;
  const { text, skillId, skillName, courseLevel, chapterCount, useProviderGeneration } = input;

  res.writeHead(200, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const fallback = buildMockAcharyaDraft({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs: 0 });
  const relevantFeedback = await relevantFeedbackFor({ actor: req.user, text, skillName, courseLevel });
  const feedbackGuidance = buildFeedbackGuidance(relevantFeedback);
  const apiKey = getGeminiApiKey();
  // Provider generation is opt-in here. The default path is deterministic and fast,
  // while still following the same staged pipeline and validation rules.
  const ai = apiKey && useProviderGeneration ? new GoogleGenAI({ apiKey }) : null;
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

app.post("/api/ai/generate-course", authenticate, requireRole("Admin", "Manager"), aiRateLimit, async (req, res) => {
  const input = parseGenerationRequest(req, res);
  if (!input) return;
    const startedAt = Date.now();
    const { text, skillId, skillName, courseLevel, chapterCount, useProviderGeneration } = input;
    const relevantFeedback = await relevantFeedbackFor({ actor: req.user, text, skillName, courseLevel });
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
      if (apiKey && useProviderGeneration) {
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
});

}
