/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Deterministic fallback generators used when no Gemini API key is
 * configured (or when a live call fails). Ported verbatim from the
 * original server.ts — logic and copy are unchanged.
 */

export function generateFallbackTopics(query: string, filters: any): any[] {
  const key = query ? query.trim() : "YouTube Science";
  const capKey = key.charAt(0).toUpperCase() + key.slice(1);
  const country = filters.country || 'Worldwide';
  const language = filters.language || 'English';
  const isShortValue = filters.formFactor === 'Shorts';
  const skillLevel = filters.level || 'Beginner';
  const categoryTone = filters.category || 'Educational';
  
  const formattedLength = isShortValue ? '45 seconds' : '12-15 minutes';
  const uploadTimes = [
    'Monday, 3:00 PM EST',
    'Tuesday, 5:00 PM EST',
    'Wednesday, 12:00 PM EST',
    'Thursday, 4:00 PM EST',
    'Friday, 2:00 PM EST',
    'Saturday, 11:00 AM EST',
    'Sunday, 1:00 PM EST'
  ];

  const templates = [
    {
      title: `The Insane Rise of ${capKey} (And Why It’s Stopping)`,
      hook: `Everyone is talking about ${capKey}, but they are completely missing the real story. This is what actually happened...`,
      reason: `Leverages the high curiosity gap of an elite documentary style. Perfect for audiences looking for deeper context. Outperforms generic tags.`,
      competition: 'Medium',
      viralityScore: 92,
      searchIntent: `High query search traffic centered around ${capKey} development in ${country}.`,
      audienceType: `${skillLevel} consumers seeking highly relevant deep-dive ${categoryTone} explanations in ${language}.`,
      thumbnail: `Splitscreen representation showing dark neon graph plummeting with dramatic orange lighting and sharp product labels.`,
      followUps: [
        `How to profit from the aftermath of ${capKey}`,
        `We exposed the secret founders of ${capKey}`,
        `The exact hour ${capKey} changed forever`
      ]
    },
    {
      title: `How to Master ${capKey} in Exactly 24 Hours`,
      hook: `Most people spend years trying to learn ${capKey} and fail. In this video, I will break down the 3 rules to master it in just 24 hours.`,
      reason: `Extremely practical and highly clickable hack matching search traffic for skill-acquisition. Compels immediate commitment.`,
      competition: 'High',
      viralityScore: 88,
      searchIntent: `Core tutorial and step-by-step keyword queries on ${capKey}.`,
      audienceType: `${skillLevel} users looking for fast, structured ${categoryTone} insights.`,
      thumbnail: `A physical 24-hour stopwatch countdown counter on the left reflecting a glowing screen with ${capKey} cheatsheets.`,
      followUps: [
        `I tried keeping up with ${capKey} for 30 days`,
        `The exact 5 templates to bypass ${capKey} fatigue`,
        `Why traditional training for ${capKey} is a scam`
      ]
    },
    {
      title: `The Dark Truth Behind ${capKey} They Don’t Want You to Know`,
      hook: `If you think ${capKey} is just about what you see on the surface, you are being lied to. Here is the hidden truth.`,
      reason: `Leverages trust, conspiracy and curiosity hooks. Perfect for high engagement and long-term analytics.`,
      competition: 'Low',
      viralityScore: 95,
      searchIntent: `Search intent looking for reviews, warnings, or detailed analysis of ${capKey}.`,
      audienceType: `Mainstream viewers looking for sensationalist structural exposes in ${language}.`,
      thumbnail: `A silhouette of a hooded figure next to a blurred glowing laptop with a massive red warning sign overlay.`,
      followUps: [
        `Exposing the top 3 lies about ${capKey}`,
        `How we almost got banned for revealing ${capKey}`,
        `The mystery of ${capKey} solved once and for all`
      ]
    },
    {
      title: `I Spent 100 Hours Studying ${capKey} (Here’s What I Found)`,
      hook: `I spent the last 100 hours locked in a room studying nothing but ${capKey}, so you don't have to. Here is what I learned.`,
      reason: `High authority signal. Shows massive user-effort which viewers love to consume effortlessly in their free time.`,
      competition: 'Medium',
      viralityScore: 91,
      searchIntent: `Comprehensive and consolidated guides on ${capKey} trends.`,
      audienceType: `Curious individuals wanting quick expert summaries of ${capKey}.`,
      thumbnail: `A human face looking extremely exhausted with dark circles, surrounded by complex chalkboard notes on ${capKey}.`,
      followUps: [
        `The next 100 hours of ${capKey} testing results`,
        `I built a business using ${capKey} in 4 days`,
        `Is ${capKey} worth your time in 2026?`
      ]
    },
    {
      title: `Why 99% of People Fail at ${capKey} (And How to Be Simple)`,
      hook: `Almost everyone who starts trying to use ${capKey} fails immediately. But if you do this 1 simple step, you skip the line.`,
      reason: `Classic contrast framework showing audience pitfalls and how to avoid them easily. Highly relatable.`,
      competition: 'Low',
      viralityScore: 86,
      searchIntent: `Fail-safe guides, mistakes to avoid, and optimizations for ${capKey}.`,
      audienceType: `Determined practitioners looking to save wasted hours.`,
      thumbnail: `Two pathways: one red with a 99% fail label, and one golden glowing road labeled with 1% success.`,
      followUps: [
        `The exact moment I failed at ${capKey}`,
        `How to recover your lost progress with ${capKey}`,
        `The secret routine of the top 1% ${capKey} masterminds`
      ]
    },
    {
      title: `The Ultimate ${capKey} Guide for ${skillLevel}s`,
      hook: `This is the absolute last video you will ever have to watch on ${capKey}. No filler, just raw blueprint details.`,
      reason: `Provides ultimate evergreen content value. Builds massive channel authority and subscription growth.`,
      competition: 'High',
      viralityScore: 89,
      searchIntent: `Comprehensive, indexable resource queries on ${capKey}.`,
      audienceType: `${skillLevel} users looking for general complete step-step masterclass courses.`,
      thumbnail: `A big textbook or document with a glowing title "${capKey} Bible" in high-contrast cyan with golden light rays.`,
      followUps: [
        `The advanced follow-on chapter of ${capKey}`,
        `I downloaded every public resource on ${capKey}`,
        `Mistakes I made in my first year of ${capKey}`
      ]
    },
    {
      title: `Is ${capKey} Actually Dead in 2026?`,
      hook: `Many experts claim ${capKey} is completely over. But the truth is, it's actually changing. Here is what's next.`,
      reason: `Leverages urgency and fear of missing out (FOMO) to capture current active search interest.`,
      competition: 'Medium',
      viralityScore: 94,
      searchIntent: `Active evaluation of latest news updates or alternative options in ${capKey}.`,
      audienceType: `Savvy watchers keeping an eye out to stay ahead of the curve.`,
      thumbnail: `A headstone with the words "RIP ${capKey}" next to a bright green shoot emerging from the soil.`,
      followUps: [
        `What is replacing ancient forms of ${capKey}`,
        `The emergency backup plan for ${capKey} creators`,
        `Why I’m doubling down on ${capKey} right now`
      ]
    },
    {
      title: `How This 1 Simple ${capKey} Trick Saved Me 30 Hours`,
      hook: `If you are still doing ${capKey} the old way, you are wasting massive amounts of time. Let me show you this 3-second shortcut.`,
      reason: `High efficiency appeal, simple utility focus, great clickability ratio.`,
      competition: 'Low',
      viralityScore: 87,
      searchIntent: `Productivity hacks, optimization tutorials, and automated routines.`,
      audienceType: `Busy creators and professionals utilizing ${capKey} in their workflows.`,
      thumbnail: `A massive green "30 Hours Saved" stamp in high contrast, with a before/after visual demonstration.`,
      followUps: [
        `Testing 5 other popular ${capKey} hacks`,
        `The worst advice I received about ${capKey}`,
        `How to automate your entire ${capKey} workflow`
      ]
    },
    {
      title: `What ${capKey} Will Look Like 10 Years From Now`,
      hook: `The future of ${capKey} is coming faster than anyone realizes. In this video, we forecast the exact stages of change.`,
      reason: `Forward-looking optimistic or dystopian predictive content with high evergreen potential.`,
      competition: 'Medium',
      viralityScore: 90,
      searchIntent: `Hypothetical developments, technological roadmap reviews, and futuristic commentary.`,
      audienceType: `Forward-thinking visionaries and enthusiasts in the ${capKey} arena.`,
      thumbnail: `A high-tech cyberpunk city display with glowing holographic projection panels showcasing advanced ${capKey}.`,
      followUps: [
        `The secret timeline of ${capKey} developers`,
        `How to prepare your career for the automated ${capKey}`,
        `What happens if ${capKey} gets outlawed`
      ]
    },
    {
      title: `5 Crucial ${capKey} Mistakes Everyone Is Making`,
      hook: `Look at your current ${capKey} setup right now. If you are doing any of these five things, stop immediately.`,
      reason: `Correction-style hooks that force viewers to self-reflect and check their own execution.`,
      competition: 'High',
      viralityScore: 85,
      searchIntent: `Self-help, troubleshooting checklists, and audit support for ${capKey}.`,
      audienceType: `Practitioners who want to ensure they are on the right path.`,
      thumbnail: `Five bright red circles highlighting areas on the screen with a giant yellow exclamation mark.`,
      followUps: [
        `My biggest ${capKey} disaster story`,
        `How we fixed our worst performing ${capKey}`,
        `The single correct way to audit your ${capKey}`
      ]
    },
    {
      title: `The Hidden Psychology of ${capKey}`,
      hook: `Why is ${capKey} so incredibly addictive? The secret isn’t what you think. It stretches back to an ancient mind trick.`,
      reason: `Fascinating psychological exposition linking high-level science to simple niche patterns.`,
      competition: 'Low',
      viralityScore: 93,
      searchIntent: `Mind hacking, social engineering, review studies, and educational research on ${capKey}.`,
      audienceType: `Intellectually curious viewers who appreciate storytelling content and educational insights.`,
      thumbnail: `An elegant anatomical blueprint overlay of a brain glowing with neon purple neural connections.`,
      followUps: [
        `How to exploit high-dopamine triggers in ${capKey}`,
        `The psychological reason why we are obsessed with ${capKey}`,
        `How to break free from negative ${capKey} loops`
      ]
    },
    {
      title: `How to Start in ${capKey} with Exactly $0`,
      hook: `No budget? No connections? No equipment? No problem. Here is how to launch your ${capKey} journey from scratch with nothing.`,
      reason: `Zero-barrier entry appeal. Extremely viral topic template for startup content.`,
      competition: 'High',
      viralityScore: 96,
      searchIntent: `Low cost entry methods, free tools, and bootstrapping strategies.`,
      audienceType: `Aspirational rookies striving to enter the ${capKey} workspace on a budget.`,
      thumbnail: `A wallet showing literal cobwebs on one side, and a sparkling gold bar labeled "Success" on the other.`,
      followUps: [
        `I made my first $100 using this free ${capKey} trick`,
        `Top 5 free tools for ${capKey} in 2026`,
        `The best side hustle using ${capKey}`
      ]
    },
    {
      title: `I Secretly Tested Every ${capKey} Hack. Here are the Results.`,
      hook: `I spent 30 days secretly testing every single legendary cheat-code for ${capKey} on the internet. Only 2 of them are real.`,
      reason: `Tension, experiment-based storytelling structure with incredibly high review retention.`,
      competition: 'Medium',
      viralityScore: 98,
      searchIntent: `Hacks, cheat codes, shortcuts, and mythbuster reviews.`,
      audienceType: `Spectators who enjoy entertainment coupled with scientific experimentation.`,
      thumbnail: `The creator holding up a glowing clipboard next to checkboxes: 3 green checkmarks and a giant red cross.`,
      followUps: [
        `The illegal ${capKey} trick that actually works`,
        `Why I got blacklisted for testing this ${capKey} trick`,
        `The ultimate cheat guide we found in deep forums`
      ]
    },
    {
      title: `Why You Should Stop Caring About ${capKey}`,
      hook: `It sounds crazy, but the moment I stopped optimizing for ${capKey}, my results actually skyrocketed. Let me explain.`,
      reason: `Counter-intuitive, contrarian take that disrupts default expectations, causing a high scroll-stop rate.`,
      competition: 'Low',
      viralityScore: 84,
      searchIntent: `Alternative trends, focus optimization techniques, and niche news views.`,
      audienceType: `Burned-out creators looking for fresh perspectives.`,
      thumbnail: `A person happily throwing a giant pile of reports labeled "Traditional ${capKey}" in the trash bin.`,
      followUps: [
        `The counter-intuitive secret to ${capKey} growth`,
        `Why your checklist is ruining your progress`,
        `What happens when we ignore standard rules`
      ]
    },
    {
      title: `This 1 Minute of ${capKey} Will Save Your Entire Week`,
      hook: `If you only have one minute today, give it to this video. This small tweak changes how you see ${capKey} forever.`,
      reason: `High interest efficiency hook, perfect for Shorts or compact executive summaries.`,
      competition: 'Medium',
      viralityScore: 89,
      searchIntent: `Easy guidelines, quick start blueprints, and summary explanations.`,
      audienceType: `Time-poor general consumers looking for fast reference guidelines.`,
      thumbnail: `An hourglass with shimmering golden sands on a clean slate background.`,
      followUps: [
        `The 60-second follow-on trick`,
        `How I plan my whole year of ${capKey} in 15 minutes`,
        `The lazy creator’s guide to master ${capKey}`
      ]
    },
    {
      title: `An Elite Expert Explains: The Secrets of ${capKey}`,
      hook: `I brought in one of the world's leading experts on ${capKey} to answer the questions they normally charge thousands for.`,
      reason: `Massive credibility and collaborative energy. High educational authority.`,
      competition: 'Low',
      viralityScore: 91,
      searchIntent: `Professional reviews, consulting tips, and academic research on ${capKey}.`,
      audienceType: `${skillLevel} listeners who want maximum structural advice.`,
      thumbnail: `A high-end recording studio podcast setup with two micro-phones and an expert with a neon blazer.`,
      followUps: [
        `What we discussed after host cameras stopped recording`,
        `The top secret files on ${capKey} revealed`,
        `Consulting advice we got for free`
      ]
    },
    {
      title: `The Forgotten History of ${capKey}`,
      hook: `Long before the internet, the core principles of ${capKey} were already being used in secret guilds. This is the origin story.`,
      reason: `Fascinating historical research combining drama with modern utility.`,
      competition: 'Low',
      viralityScore: 85,
      searchIntent: `Historical context, origins of the trends, and ancient blueprints.`,
      audienceType: `History and lore buffs who love deep, ambient storytelling.`,
      thumbnail: `An ancient leather-scrolled manuscript with glowing neon ink symbols matching ${capKey}.`,
      followUps: [
        `The secret society that invented ${capKey}`,
        `We decyphered the oldest text on ${capKey}`,
        `How ancient emperors mastered these exact visual rules`
      ]
    },
    {
      title: `Why Everyone Is Wrong About ${capKey}!`,
      hook: `If you read any blog or watch any YouTuber talking about ${capKey}, they all give the same advice. And they are all dead wrong.`,
      reason: `Polarizing contrarian hook. Guaranteed to spark a massive comments-section war, pushing algorithmic views.`,
      competition: 'Medium',
      viralityScore: 93,
      searchIntent: `Debates, controversial takes, and forum arguments on ${capKey}.`,
      audienceType: `Highly opinionated fans who want to see traditional templates tested.`,
      thumbnail: `A giant red "X" covering a collage of famous content icons, signifying a fresh paradigm shift.`,
      followUps: [
        `Apologizing to the community about our stance`,
        `Why my controversial theory was 100% correct`,
        `The forum fight that proved our strategy`
      ]
    },
    {
      title: `We Need to Talk About ${capKey}...`,
      hook: `I didn't want to make this video, but the situation with ${capKey} has reached a breaking point. We have to address this now.`,
      reason: `Emotive call-out styling with high social capital. Extremely high click rate.`,
      competition: 'Medium',
      viralityScore: 97,
      searchIntent: `Opinions, latest breaking announcements, and updates on ${capKey}.`,
      audienceType: `Active community fans wanting raw, direct transparency from hosts.`,
      thumbnail: `A close-up of a human eye with a single glowing tear, overlayed with a small text badge "Confessions".`,
      followUps: [
        `How we are resolving the crisis with ${capKey}`,
        `The community backlash we received`,
        `What follows next in the future`
      ]
    },
    {
      title: `From Scratch: How I Decoded ${capKey} in 4 Steps`,
      hook: `If I lost my channel, my money, and my resources tomorrow, this is the exact 4-step checklist I would use to rebuild ${capKey} from absolute zero.`,
      reason: `Proven checklist blueprint format that is highly actionable and provides excellent viewer satisfaction.`,
      competition: 'High',
      viralityScore: 90,
      searchIntent: `Detailed blueprints, starting templates, and workflow protocols.`,
      audienceType: `Pragmatic viewers looking for a step-by-step roadmap.`,
      thumbnail: `A clean minimalist bento board listing step 1, 2, 3, 4 with glowing completion badges.`,
      followUps: [
        `The hardest step of the four-phase protocol`,
        `My daily schedule tracking these 4 steps`,
        `Rebuilding our server using this same guideline`
      ]
    }
  ];

  return templates.slice(0, 20).map((t, idx) => {
    const randomTime = uploadTimes[idx % uploadTimes.length];
    return {
      id: `fallback_topic_${idx}_${Date.now().toString(36)}`,
      title: t.title,
      hook: t.hook,
      reason: t.reason,
      viralityScore: t.viralityScore,
      competition: t.competition as any,
      searchIntent: t.searchIntent,
      audienceType: t.audienceType,
      suggestedThumbnail: t.thumbnail,
      uploadTime: randomTime,
      videoLength: formattedLength,
      followUps: t.followUps,
      originalityScore: Math.floor(Math.random() * 20) + 75,
      evergreenScore: Math.floor(Math.random() * 30) + 65,
      whyViewersClick: `${t.reason} This triggers an immediate chemical click response by creating a direct tension or curiosity gap in their subscription feed.`,
      whyCreatorsMake: "Offers extreme high-CPM potential coupled with long-term evergreen organic discovery. It builds massive authority in this specific niche with low production overhead.",
      publishingFormat: isShortValue ? 'YouTube Shorts' : 'Standard 16:9 Video'
    };
  });
}

export function generateFallbackTitleOptimization(title: string, category: string): any {
  // Format neat, robust variables based on input
  const capTitle = title.charAt(0).toUpperCase() + title.slice(1);
  const words = baseCleanWords(title);
  const keyword = words.length > 0 ? words[0] : 'Video';
  const keyword2 = words.length > 1 ? words[1] : 'Secrets';

  const baseScore = Math.floor(Math.random() * 25) + 50; // 50 to 75
  const emotional = Math.floor(Math.random() * 20) + 45;
  const clarity = Math.floor(Math.random() * 20) + 60;
  const seo = Math.floor(Math.random() * 15) + 55;

  const isLowConfidence = words.length < 3 || title.toLowerCase().includes('abc') || title.toLowerCase().includes('hello');
  const warningMsg = isLowConfidence 
    ? 'Concept input lacks topical indicators or contextual definitions. Dynamic keyword extraction shows extremely low query density.'
    : '';

  const groups = [
    {
      type: 'Curiosity Gap',
      titles: [
        `The Hidden Truth Behind ${capTitle} (Wait...)`,
        `Why Everyone is Quietly Ignoring ${capTitle}`,
        `What Happens to Your Channel If You Do ${capTitle}?`,
        `The Accidental Discovery of ${capTitle} Secrets`
      ],
      score: 95,
      uplift: '+4.5% Click Uplift',
      desc: 'Locks viewers into an open story loop that is emotionally impossible to ignore on active recommendation feeds.'
    },
    {
      type: 'High Stakes',
      titles: [
        `Stop Doing ${capTitle}! Do This in 2026 Instead`,
        `I Tried ${capTitle} for 30 Days (And Regret It)`,
        `The Fatal Mistake Everyone Makes with ${capTitle}`,
        `Is ${capTitle} Killing Your Future Growth?`
      ],
      score: 93,
      uplift: '+3.9% Click Uplift',
      desc: 'Taps into fear of wasted effort combined with loss-aversion biases, demanding instant correction checks.'
    },
    {
      type: 'Value Promise',
      titles: [
        `How I Mastered ${capTitle} in Exactly 24 Hours (Step-by-Step)`,
        `The Perfect Blueprint to Automate ${capTitle}`,
        `Mastering ${capTitle}: The Lazy Creator’s Playbook`,
        `How to Code ${capTitle} with Zero Budget (Guaranteed)`
      ],
      score: 91,
      uplift: '+2.8% Click Uplift',
      desc: 'Promises maximum speed-skill acquisition with zero initial resources, establishing immense evergreen authority.'
    },
    {
      type: 'Contrarian / Threat',
      titles: [
        `Why 99% of People Fail at ${capTitle} (And How to Be the 1%)`,
        `Traditional Advice on ${capTitle} is Completely Dead`,
        `The Scam Behind Popular ${capTitle} Tutorials`,
        `Stop Practicing ${capTitle}! Do This Instead`
      ],
      score: 94,
      uplift: '+4.8% Click Uplift',
      desc: 'Dramatizes default pitfalls to break the usual visual pattern while outlining simple, actionable escape paths.'
    },
    {
      type: 'Ultra-Short Focus',
      titles: [
        `${keyword} Secret Exposed! 🤫`,
        `No More ${keyword}!`,
        `${keyword2} is the Future.`,
        `${keyword}: 100x Growth Cheat`
      ],
      score: 88,
      uplift: '+2.2% Click Uplift',
      desc: 'Strictly formatted under 40 spaces to completely prevent mobile title truncation on any layout viewports.'
    }
  ];

  const suggestions: any[] = [];
  groups.forEach((g) => {
    g.titles.forEach((t, index) => {
      suggestions.push({
        id: `fallback_title_${g.type.toLowerCase().replace(/[^a-z]/g, '')}_${index}_${Date.now().toString(36)}`,
        title: t,
        score: g.score - index,
        triggerType: g.type,
        ctrUplift: g.uplift,
        explanation: g.desc
      });
    });
  });

  const bestT = {
    title: suggestions[0].title,
    triggerType: suggestions[0].triggerType,
    strategicExplanation: `This title establishes a massive curiosity gap and addresses raw psychological loss-aversion. By targeting ${keyword}, it isolates high search-intent keywords and maximizes CTR potential across mobile feeds.`
  };

  return {
    score: baseScore,
    ctrPrediction: baseScore > 75 ? 'High Breakthrough Potential' : baseScore > 55 ? 'Moderate Standings' : 'Low Coverage',
    emotionalScore: emotional,
    clarityScore: clarity,
    seoScore: seo,
    analysis: `The raw concept "${title}" has adequate readability but lacks intense biological triggers. It functions as a direct topic label rather than a compelling story, resulting in lower recommended distribution.`,
    lowConfidence: isLowConfidence,
    confidenceWarning: warningMsg,
    bestTitle: bestT,
    suggestions
  };
}

function baseCleanWords(str: string): string[] {
  return str
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1));
}


