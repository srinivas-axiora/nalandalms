import { v4 as uuid } from "uuid";
import {
  now,
  users,
  skills,
  targetSkills,
  skillRatings,
  courses,
  chapters,
  assessments,
  assignments,
  attempts,
  attendanceLogs,
  performanceReviews,
  communications,
  persist
} from "../../core.js";

// Global general questions for fallback quiz
const GENERAL_QUIZ_QUESTIONS = [
  {
    prompt: "What is the primary objective of a Software Threat Model?",
    options: ["To write code faster", "To identify assets, actors, trust boundaries, and potential threats", "To test the user interface design", "To configure cloud server memory"],
    answer: 1
  },
  {
    prompt: "Which OWASP Top 10 category is directly mitigated by input sanitization and database parameterization?",
    options: ["A01 Broken Access Control", "A03 Injection", "A05 Security Misconfiguration", "A09 Security Logging and Monitoring Failures"],
    answer: 1
  },
  {
    prompt: "What does the GROW coaching model stand for?",
    options: ["Growth, Reality, Operations, Will", "Goal, Reality, Options, Will", "Guide, Reflect, Observe, Write", "Gain, Resource, Objectives, Win"],
    answer: 1
  },
  {
    prompt: "In the SBI feedback model, what does 'Impact' refer to?",
    options: ["The physical force of the feedback", "The observable actions of the employee", "The logical effect of the behavior on the team or business", "The future goals set for the employee"],
    answer: 2
  },
  {
    prompt: "Which practice is a key requirement for secure release pipelines?",
    options: ["Keeping credentials in source code", "Automated secret scanning and static code analysis", "Skipping regression testing", "Manual deployment from developer laptops"],
    answer: 1
  }
];

export async function handleLocalChat(user, message, history = [], context = {}) {
  const msg = message.trim().toLowerCase();
  const todayDate = new Date().toISOString().split("T")[0];

  // 1. Check if the user is in the middle of a quiz session by looking at the last assistant reply.
  const lastAssistantMsg = history.filter(m => m.role === "assistant").pop()?.content;
  if (lastAssistantMsg && lastAssistantMsg.includes("<!-- QUIZ_STATE:")) {
    const match = lastAssistantMsg.match(/<!-- QUIZ_STATE:(\{.*?\}) -->/);
    if (match) {
      try {
        const quizState = JSON.parse(match[1]);
        const { qIndex, score, questions } = quizState;
        
        // Try to extract an answer number 1, 2, 3, 4 from user's message
        const choiceMatch = msg.match(/\b([1-4])\b/);
        if (!choiceMatch) {
          return {
            reply: `⚠️ **Invalid choice.** Please respond with a number from **1 to 4** representing your choice.\n\n*Current question repeats:*\n\n**Question:** ${questions[qIndex].prompt}\n` +
                   questions[qIndex].options.map((opt, i) => `${i + 1}️⃣ ${opt}`).join("\n") +
                   `\n\n<!-- QUIZ_STATE:${JSON.stringify(quizState)} -->`,
            model: "Nalanda Copilot (Local)",
            source: "local"
          };
        }

        const choice = parseInt(choiceMatch[1], 10) - 1;
        const currentQuestion = questions[qIndex];
        const isCorrect = choice === currentQuestion.answer;
        const nextScore = score + (isCorrect ? 1 : 0);
        const nextIndex = qIndex + 1;

        let resultPrefix = isCorrect 
          ? `✅ **Correct!** Outstanding work.` 
          : `❌ **Incorrect.** The correct answer was: **${currentQuestion.options[currentQuestion.answer]}**`;

        if (nextIndex < questions.length) {
          const nextQuestion = questions[nextIndex];
          const nextState = { qIndex: nextIndex, score: nextScore, questions };
          
          return {
            reply: `${resultPrefix}\n\n---\n\n### 📝 Interactive Quiz: Question ${nextIndex + 1} of ${questions.length}\n` +
                   `**Question:** ${nextQuestion.prompt}\n\n` +
                   nextQuestion.options.map((opt, i) => `${i + 1}️⃣ ${opt}`).join("\n") +
                   `\n\n*Please reply with the number of your answer (1, 2, 3, or 4).*` +
                   `\n\n<!-- QUIZ_STATE:${JSON.stringify(nextState)} -->`,
            model: "Nalanda Copilot (Local)",
            source: "local"
          };
        } else {
          const finalPercentage = Math.round((nextScore / questions.length) * 100);
          let performanceReview = "";
          if (finalPercentage === 100) performanceReview = "🏆 Perfect Score! You have fully mastered these concepts.";
          else if (finalPercentage >= 70) performanceReview = "🎉 Passed! Great job applying this knowledge.";
          else performanceReview = "📚 Review Needed. We recommend checking the chapter body and trying again.";

          return {
            reply: `${resultPrefix}\n\n---\n\n### 🏆 Quiz Complete!\n` +
                   `**Your Score:** ${nextScore} / ${questions.length} (${finalPercentage}%)\n\n` +
                   `${performanceReview}\n\n` +
                   `*Tip: Type \`recommend\` to see target training courses for your skills.*`,
            model: "Nalanda Copilot (Local)",
            source: "local"
          };
        }
      } catch (e) {
        console.error("Error parsing quiz state", e);
      }
    }
  }

  // 2. Help / Menu
  if (msg === "help" || msg === "menu" || msg === "/menu" || msg === "guide" || msg.includes("what can you do")) {
    return {
      reply: `## 🤖 Nalanda Institute Copilot Menu

I am your local code-driven training assistant. Here are the categories of tasks you can perform with me:

### 📅 Attendance Tracking
*   Type **\`check in\`** to clock in for today's training.
*   Type **\`check out\`** to clock out at the end of the day.
*   Type **\`attendance log\`** or **\`attendance status\`** to view your attendance history and rate.

### 🎓 Training & Courses
*   Type **\`my courses\`** to see your current enrolled courses and learning progress.
*   Type **\`recommend\`** to analyze your skill gaps and suggest relevant courses.
*   Type **\`all courses\`** to see all training courses available in the institute.

### 📈 Performance Review
*   Type **\`performance review\`** or **\`appraisal\`** to view your active targets, manager feedback, and career goals.
*   Type **\`submit appraisal: [your comment]\`** to record your self-appraisal notes.

### 💬 Internal Communication
*   Type **\`announcements\`** to view latest institute notices.
*   Type **\`inbox\`** to read personal messages sent to you.
*   Type **\`send message to [Employee Name]: [Message Content]\`** to simulate sending messages to managers or trainers (e.g. \`send message to Kabir Sethi: I finished the test\`).

### ❓ Learning Quiz
*   Type **\`quiz me\`** to start an interactive multiple-choice quiz based on the current chapter context or general software engineering principles!`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  // 3. Attendance Commands
  if (msg.includes("check in") || msg.includes("clock in")) {
    const existing = attendanceLogs.find(log => log.userId === user.id && log.date === todayDate);
    if (existing) {
      return {
        reply: `⚠️ You are already checked in for today (**${todayDate}**) at **${existing.checkInTime}**.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }
    const newLog = {
      id: "ATT-L-" + uuid().slice(0, 8),
      userId: user.id,
      date: todayDate,
      checkInTime: new Date().toLocaleTimeString(),
      checkOutTime: null,
      status: "Present"
    };
    attendanceLogs.push(newLog);
    persist();
    return {
      reply: `### 📅 Attendance Clock In\n` +
             `*   **Status:** ✅ Present\n` +
             `*   **Date:** ${todayDate}\n` +
             `*   **Clock In Time:** ${newLog.checkInTime}\n\n` +
             `Have a great day of learning!`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.includes("check out") || msg.includes("clock out")) {
    const existingIndex = attendanceLogs.findIndex(log => log.userId === user.id && log.date === todayDate);
    if (existingIndex === -1) {
      return {
        reply: `⚠️ You cannot check out because you haven't checked in today yet. Type **\`check in\`** first.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }
    const log = attendanceLogs[existingIndex];
    if (log.checkOutTime) {
      return {
        reply: `⚠️ You have already checked out today at **${log.checkOutTime}**.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }
    log.checkOutTime = new Date().toLocaleTimeString();
    attendanceLogs[existingIndex] = log;
    persist();
    return {
      reply: `### 📅 Attendance Clock Out\n` +
             `*   **Status:** ⏸️ Checked Out\n` +
             `*   **Date:** ${todayDate}\n` +
             `*   **Clock Out Time:** ${log.checkOutTime}\n\n` +
             `Great job completing your training hours today!`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.includes("attendance log") || msg.includes("attendance history") || msg === "attendance") {
    const userLogs = attendanceLogs.filter(log => log.userId === user.id).slice(-10);
    if (userLogs.length === 0) {
      return {
        reply: `📅 No attendance logs found for you. Type **\`check in\`** to create your first attendance record!`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const tableRows = userLogs.map(log => `| ${log.date} | ${log.checkInTime} | ${log.checkOutTime || "Active"} | ${log.status} |`).join("\n");
    
    // Calculate percentage
    const presentCount = userLogs.filter(log => log.status === "Present").length;
    const rate = Math.round((presentCount / userLogs.length) * 100);

    return {
      reply: `### 📊 Your Attendance History (Last 10 Records)\n\n` +
             `| Date | Clock In | Clock Out | Status |\n` +
             `| :--- | :--- | :--- | :--- |\n` +
             `${tableRows}\n\n` +
             `- **Attendance Rate:** **${rate}%** (${presentCount} present out of ${userLogs.length} days checked)\n` +
             `- **Current Status:** 🟢 Active Student`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.includes("attendance status") || msg.includes("attendance percentage") || msg.includes("attendance stats")) {
    const userLogs = attendanceLogs.filter(log => log.userId === user.id);
    const presentCount = userLogs.filter(log => log.status === "Present").length;
    const rate = userLogs.length > 0 ? Math.round((presentCount / userLogs.length) * 100) : 0;

    return {
      reply: `### 📊 Attendance Performance Summary\n` +
             `*   **Student:** **${user.name}**\n` +
             `*   **Designation:** ${user.designation}\n` +
             `*   **Present Days:** ${presentCount} / ${userLogs.length}\n` +
             `*   **Overall Rate:** **${rate}%**\n` +
             `*   **GTM Status:** ${rate >= 75 ? "✅ Compliance Cleared" : "❌ Below Threshold (Requires 75%+)"}`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  // 4. Training / Course Commands
  if (msg === "my courses" || msg.includes("enrolled courses") || msg.includes("list courses")) {
    const myAssignments = assignments.filter(a => a.userId === user.id);
    if (myAssignments.length === 0) {
      return {
        reply: `🎓 You are not currently assigned to any courses. Contact your manager (**${user.managerId || "L&D Admin"}**) to request course assignments.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const courseDetails = myAssignments.map(a => {
      const course = courses.find(c => c.id === a.courseId);
      const prog = a.progress || 0;
      const statusIcon = prog === 100 ? "✅" : "⏳";
      return `*   **${course?.title || a.courseId}**\n` +
             `    - ID: \`${a.courseId}\` | Progress: ${statusIcon} **${prog}%**\n` +
             `    - Priority: \`${a.priority}\` | Mandatory: ${a.mandatory ? "Yes" : "No"}\n` +
             `    - Due Date: \`${a.dueAt || "No deadline"}\``;
    }).join("\n\n");

    return {
      reply: `### 📚 Enrolled Training Courses for ${user.name}\n\n${courseDetails}`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg === "all courses") {
    const list = courses.map(c => `*   **${c.title}** (\`${c.id}\`)\n` +
                                   `    - Category: \`${c.category}\` | Skill: \`${c.skill}\` | Level: \`${c.targetLevel}\`\n` +
                                   `    - Duration: ~${c.estimatedHours} hours | Difficulty: \`${c.difficulty}\``).join("\n\n");
    return {
      reply: `### 🏛️ Complete Training Institute Course Catalog\n\n${list}`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg === "recommend" || msg.includes("recommend courses") || msg.includes("suggest courses") || msg.includes("course recommend")) {
    // Look up target skills for user department, team or designation
    const targets = targetSkills.filter(t => 
      t.scope === "Organization" ||
      (t.scope === "Department" && t.department === user.department) ||
      (t.scope === "Department" && t.department === `Team:${user.team}`) ||
      (t.scope === "Role" && t.designation === user.designation) ||
      (t.scope === "Employee" && t.userId === user.id)
    );

    if (targets.length === 0) {
      return {
        reply: `💡 No target competency expectations are set for your department/role. Here is a general recommendation:\n\n*   **Secure Coding for Cloud Teams** (\`CRS-001\`) - High Priority for Engineering.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const gapRecommendations = [];
    for (const target of targets) {
      const skillName = skills.find(s => s.id === target.skillId)?.name || target.skillId;
      const userRating = skillRatings.find(r => r.userId === user.id && r.skill === skillName);
      const score = userRating?.score || 0;

      if (score < target.targetScore) {
        // Recommend course targeting this skill
        const matchingCourse = courses.find(c => c.skillIds.includes(target.skillId));
        gapRecommendations.push({
          skill: skillName,
          score,
          targetScore: target.targetScore,
          priority: target.priority,
          course: matchingCourse
        });
      }
    }

    if (gapRecommendations.length === 0) {
      return {
        reply: `🌟 **Excellent Job!** You have met or exceeded all target skill levels for your department and role.\n\n*   Your current skill profile matches 100% of institute requirements.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const recoList = gapRecommendations.map(r => 
      `*   **Skill: ${r.skill}**\n` +
      `    - Your Score: \`${r.score}\` | Target: \`${r.targetScore}\` (Gap of \`${r.targetScore - r.score}\`)\n` +
      `    - Recommended Course: ${r.course ? `**${r.course.title}** (\`${r.course.id}\`)` : "N/A"}\n` +
      `    - Priority: \`${r.priority}\``
    ).join("\n\n");

    return {
      reply: `### 🎯 Training Recommendations (Skill-Gap Analysis)\n\n` +
             `Based on competency expectations for **${user.designation}** in **${user.department}**:\n\n` +
             `${recoList}`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.startsWith("course details") || msg.startsWith("course detail")) {
    const term = message.replace(/course details|course detail/i, "").trim().toLowerCase();
    if (!term) {
      return {
        reply: `⚠️ Please specify a course ID or part of the title. Example: \`course detail CRS-001\``,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }
    const course = courses.find(c => c.id.toLowerCase() === term || c.title.toLowerCase().includes(term));
    if (!course) {
      return {
        reply: `❌ Course matching "${term}" was not found in the catalog. Type **\`all courses\`** to view correct list.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const courseChapters = chapters.filter(ch => ch.courseId === course.id);
    const chapterList = courseChapters.length > 0 
      ? courseChapters.map(ch => `${ch.sequence}. **${ch.title}** - *${ch.description}* (${ch.durationMinutes} min)`).join("\n")
      : "*No chapters uploaded yet.*";

    return {
      reply: `### 📖 Course Outline: ${course.title} (\`${course.id}\`)\n` +
             `*   **Description:** ${course.description}\n` +
             `*   **Skill Focus:** ${course.skill}\n` +
             `*   **Category:** ${course.category} | Estimated Time: ${course.estimatedHours} hours\n\n` +
             `#### Syllabus:\n${chapterList}`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  // 5. Performance Reviews
  if (msg === "performance" || msg === "performance review" || msg === "appraisal" || msg === "goals") {
    const reviews = performanceReviews.filter(r => r.userId === user.id);
    if (reviews.length === 0) {
      return {
        reply: `📊 No performance review records found for employee **${user.name}**.\n\n*Self-appraisal can still be submitted by typing: \`submit appraisal: [comments]\`*`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const review = reviews[reviews.length - 1]; // Get latest
    const stars = "⭐".repeat(Math.floor(review.rating)) + (review.rating % 1 !== 0 ? "✨" : "") + "☆".repeat(5 - Math.ceil(review.rating));

    return {
      reply: `### 📈 Latest Performance Appraisal\n` +
             `*   **Employee:** **${user.name}**\n` +
             `*   **Reviewer:** **${review.reviewerName}** (${user.managerId ? "Direct Manager" : "Instructor"})\n` +
             `*   **Date Evaluated:** ${review.reviewDate}\n` +
             `*   **Rating:** ${stars} (**${review.rating}/5.0**)\n\n` +
             `#### Manager Comments:\n> "${review.comments}"\n\n` +
             `#### Assigned Action Goals:\n${review.goals.split("\n").map(g => `*   ${g.replace(/^\d+\.\s*/, "")}`).join("\n")}`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.startsWith("submit appraisal") || msg.startsWith("submit self-appraisal")) {
    const comment = message.substring(message.indexOf(":") + 1).trim();
    if (!message.includes(":") || !comment) {
      return {
        reply: `⚠️ To submit a self-appraisal comments, please use the format:\n\n\`submit appraisal: [Your rating and notes on your course achievements]\``,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    // Save as a message/communication record to maintain durability
    const newMsg = {
      id: "MSG-A-" + uuid().slice(0, 8),
      senderId: user.id,
      senderName: user.name,
      recipientId: user.managerId || "EMP-1001",
      content: `[SELF-APPRAISAL SUBMISSION]: ${comment}`,
      sentAt: now()
    };
    communications.push(newMsg);
    persist();

    return {
      reply: `### ✅ Self-Appraisal Recorded Successfully!\n` +
             `Your notes have been sent to your Manager (**${user.managerId || "L&D Admin"}**).\n\n` +
             `**Appraisal Snippet:**\n> "${comment}"\n\n` +
             `This will be reviewed in your next appraisal cycle. Thank you!`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  // 6. Communications / Announcements / Inbox
  if (msg === "announcements" || msg === "announcement") {
    const announceList = communications.filter(c => c.recipientId === "ALL");
    if (announceList.length === 0) {
      return {
        reply: `🔔 There are currently no institute announcements.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const notices = announceList.map(a => 
      `📢 **${a.senderName}** *at ${new Date(a.sentAt).toLocaleDateString()}*\n` +
      `> ${a.content}`
    ).join("\n\n---\n\n");

    return {
      reply: `### 📣 Institute Bulletin & Announcements\n\n${notices}`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg === "inbox" || msg === "messages" || msg === "message") {
    const inbox = communications.filter(c => c.recipientId === user.id);
    if (inbox.length === 0) {
      return {
        reply: `📨 Your inbox is empty. No messages from trainers or managers.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const items = inbox.map(m => 
      `✉️ **From:** ${m.senderName || m.senderId}\n` +
      `   - Received: \`${new Date(m.sentAt).toLocaleString()}\`\n` +
      `   - Message: "${m.content}"`
    ).join("\n\n");

    return {
      reply: `### 📨 Internal Inbox (Messages for ${user.name})\n\n${items}`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.startsWith("send message to")) {
    const cleanMsg = message.replace(/send message to/i, "").trim();
    const dividerIndex = cleanMsg.indexOf(":");
    if (dividerIndex === -1) {
      return {
        reply: `⚠️ Invalid format. To send a message, please write:\n\n\`send message to [Name]: [Message text]\` (e.g. \`send message to Kabir Sethi: Hello\`)`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }
    const namePart = cleanMsg.substring(0, dividerIndex).trim().toLowerCase();
    const contentPart = cleanMsg.substring(dividerIndex + 1).trim();

    if (!contentPart) {
      return {
        reply: `⚠️ Message content cannot be empty.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const recipient = users.find(u => u.name.toLowerCase().includes(namePart) && u.id !== user.id);
    if (!recipient) {
      return {
        reply: `❌ Recipient matching "${namePart}" was not found in the users list. Please double check the spelling.`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }

    const newMsg = {
      id: "MSG-U-" + uuid().slice(0, 8),
      senderId: user.id,
      senderName: user.name,
      recipientId: recipient.id,
      content: contentPart,
      sentAt: now()
    };
    communications.push(newMsg);
    persist();

    return {
      reply: `### ✉️ Message Outbox\n` +
             `*   **To:** **${recipient.name}** (${recipient.designation})\n` +
             `*   **Sent Time:** ${new Date().toLocaleTimeString()}\n` +
             `*   **Status:** 🚀 Dispatched successfully\n\n` +
             `**Message:**\n> "${contentPart}"`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  // 7. Interactive Quiz Request
  if (msg === "quiz" || msg === "quiz me" || msg.includes("test me")) {
    let quizQuestions = [...GENERAL_QUIZ_QUESTIONS];
    let sourceLabel = "General Software Development principles";

    // Attempt to build questions from active context chapter/assessment
    if (context.courseTitle && context.chapterTitle) {
      const course = courses.find(c => c.title === context.courseTitle);
      const chapter = chapters.find(ch => ch.title === context.chapterTitle && ch.courseId === course?.id);
      const assessment = assessments.find(asm => asm.chapterId === chapter?.id);
      
      if (assessment && assessment.questions && assessment.questions.length > 0) {
        // Find MCQ questions
        const mcqs = assessment.questions.filter(q => q.type === "MCQ");
        if (mcqs.length > 0) {
          quizQuestions = mcqs.slice(0, 3).map(q => ({
            prompt: q.prompt,
            options: q.options,
            answer: q.answer
          }));
          sourceLabel = `assessment for Chapter "${context.chapterTitle}"`;
        }
      }
    }

    const state = {
      qIndex: 0,
      score: 0,
      questions: quizQuestions
    };

    return {
      reply: `### 📝 Interactive Quiz Starter\n` +
             `Welcome! I have prepared **${quizQuestions.length} multiple-choice questions** based on **${sourceLabel}**.\n\n` +
             `---\n\n` +
             `### Question 1 of ${quizQuestions.length}\n` +
             `**Question:** ${quizQuestions[0].prompt}\n\n` +
             quizQuestions[0].options.map((opt, i) => `${i + 1}️⃣ ${opt}`).join("\n") +
             `\n\n*Please reply with the number of your answer (1, 2, 3, or 4).*` +
             `\n\n<!-- QUIZ_STATE:${JSON.stringify(state)} -->`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  // 8. Explain Context Concepts
  if (msg.includes("explain") || msg.includes("takeaway") || msg.includes("summary")) {
    if (context.chapterTitle && context.chapterBody) {
      return {
        reply: `### 📖 Study Coach: ${context.chapterTitle}\n\n` +
               `Here is a simplified overview of your active chapter content:\n\n` +
               `*   **Core Objective:** Learn practical application of ${context.chapterTitle} concepts.\n` +
               `*   **Takeaways:**\n` +
               `    1. Master the underlying definitions and boundaries.\n` +
               `    2. Ground engineering actions in concrete logs, checklists, and test evidence.\n` +
               `    3. Establish solid feedback loops with teams and code structures.\n\n` +
               `#### Original Concept:\n` +
               `> "${context.chapterBody.slice(0, 500)}${context.chapterBody.length > 500 ? "..." : ""}"\n\n` +
               `*Prompt: Type \`quiz me\` to test your understanding of this material!*`,
        model: "Nalanda Copilot (Local)",
        source: "local"
      };
    }
  }

  // 9. NLP Match Fallbacks (Common FAQS)
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return {
      reply: `👋 Hello **${user.name}**! How can I help you today?\n\n` +
             `I can assist with **Attendance**, **Trainings**, **Performance Reviews**, and **Messaging**.\n\n` +
             `*Type \`menu\` to see all available commands!*`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.includes("thank") || msg.includes("appreciate")) {
    return {
      reply: `✨ You are very welcome! If you need anything else, just type \`menu\` or ask me. Good luck with your study sessions!`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.includes("cert") || msg.includes("diploma")) {
    return {
      reply: `🎓 **Certificates Info**:\n\n` +
             `Certificates are automatically generated and issued once you complete all chapters of a course and pass its corresponding assessments with a score equal to or above the **passing threshold** (typically 70%).\n\n` +
             `- You can view issued certificates on the **Certificates** page.`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.includes("score") || msg.includes("pass") || msg.includes("threshold")) {
    return {
      reply: `📝 **Passing Requirements**:\n\n` +
             `- All chapter assessments require a minimum score of **70%** (some core compliance tests require **75%**).\n` +
             `- If you fail an attempt, you can retake the assessment. Only your highest passing score is used for your skill rating calculations.`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  if (msg.includes("proctor") || msg.includes("warning") || msg.includes("flag") || msg.includes("tab")) {
    return {
      reply: `🛡️ **Proctoring Regulations**:\n\n` +
             `During assessments, the platform monitors window integrity and device engagement:\n\n` +
             `- **Tab Switches:** Switching browser tabs or windows triggers a system flag. Depending on settings, multiple tab switches can result in auto-submitting your test automatically.\n` +
             `- **Audit Logs:** All violations are saved in audit databases and visible to managers/admins.`,
      model: "Nalanda Copilot (Local)",
      source: "local"
    };
  }

  // Generic FAQ fallback response
  return {
    reply: `🔍 **I parsed your message but did not match an exact command.**\n\n` +
           `- You typed: *"${message}"*\n` +
           `- To check attendance, type: **\`check in\`**\n` +
           `- To see courses, type: **\`my courses\`**\n` +
           `- To see your goals/ratings, type: **\`performance review\`**\n` +
           `- To start a practice quiz, type: **\`quiz me\`**\n\n` +
           `*Need more options? Type **\`menu\`** to see all available commands.*`,
    model: "Nalanda Copilot (Local)",
    source: "local"
  };
}
