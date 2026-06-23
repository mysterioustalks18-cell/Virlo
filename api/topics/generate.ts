/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { withJsonHandler, requireMethod } from '../_lib/http';
import { getGoogleAI, runWithGeminiFallback, parseCleanJSON } from '../_lib/gemini';
import { generateFallbackTopics } from '../_lib/fallback-generators';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['POST'])) return;

  const body = req.body || {};
  const { query, filters } = body;
  const { country, language, formFactor, level, category } = filters || {};

  const querySubject = query ? query.trim() : 'YouTube Content Strategy';

  const activeAi = getGoogleAI(req);

  if (!activeAi) {
    console.warn('[ThumbScore AI] Falling back to dynamic topic generator simulation.');
    const simulatedResponse = generateFallbackTopics(querySubject, filters || {});
    res.status(200).json({ topics: simulatedResponse });
    return;
  }

  try {
    const promptText = `You are an elite, multi-million follower YouTube Growth Consultant, viral psychologist, and mastermind content engineer.
Your goal is to perform a deep semantic search extraction first on the subject/query: "${querySubject}".

Before formulating any results, perform the following internal multi-stage reasoning pipeline:
Stage 1: Deeply understand the user's niche (${querySubject}).
Stage 2: Identify the precise target audience and their core sub-groups.
Stage 3: Determine likely viewer psychology, unconscious desires, and anxiety vectors.
Stage 4: Estimate biological and psychological click triggers.
Stage 5: Estimate watch intent, satisfaction levels, and potential high-retention payoff points.
Stage 6: Generate multiple candidate response arrays internally.
Stage 7: Compare the candidates against real-world top performed viral layouts.
Stage 8: Refine and select ONLY the absolute 20 strongest concepts. Never keep initial generic drafts.

Return exactly 20 highly viral, hyper-clickable, and non-repetitive video concepts designed to command maximum Click-Through-Rate (CTR) and high Average View Duration (AVD).
Consider:
- Country target context: "${country || 'Worldwide'}"
- Language target language: "${language || 'English'}"
- Visual format style: "${formFactor || 'Long-form'}"
- Target audience depth skill level: "${level || 'Beginner'}"
- Video tone/focus category: "${category || 'Educational'}"

Each of the 20 ideas must represent a unique angle across these balanced programming archetypes:
1. Deep Exposes & Curiosities (Unmasking hidden industries, history, or systems)
2. Speed-Skill Acquisition (Mastery frameworks, e.g., "Learn X in 24 hours")
3. Contrarian / Pattern Interrupts (Why traditional advice/methods fail completely)
4. Absolute Mastery Series / Complete Bible series (Massive, indexable evergreen resource)
5. Time & Cost Optimization hacks ("From $0 Setup", "Saved 30 Hours")
6. Psychological Hooking (Neural dopamine loops, high stakes, narrative suspense)

Your output must be structurally perfect. No markdown formatting outside the JSON, no commentary.

Required format properties for each entry:
- "title": Extremely clickable, powerful title using psychological levers (Curiosity Gap, High Stakes, Specificity, or Pattern Interrupt).
- "hook": A complete, arresting 2-sentence script preview that immediately arrests attention and breaks the viewer's scroll pattern. It must feel suspenseful and professional.
- "reason": High-level strategic and tactical analysis detailing WHY this topic is trending, what psychological human cognitive bias/lever it triggers, and why it commands organic YouTube Search and Recommendation algorithms.
- "searchIntent": The precise search queries and burning questions that viewers input on search engines that this video answers beautifully.
- "audienceType": A highly granular, tailored psychographic descriptor of the target viewer cohort.
- "suggestedThumbnail": Expert-level pixel composition instructions for a thumbnail designer - detailing color palette contrast, facial expressions, foreground focal elements, text overlays (maximum 3 words), lighting sources, and background depth.
- "uploadTime": Optimal upload scheduling window.
- "videoLength": Tailored video length matched to complexity.
- "followUps": Exactly 3 consecutive video sequels/prequels to build a highly engaging binge-worthy playlist.
- "originalityScore": Integer (0 to 100) on how unique the creative angle is compared to typical industry content.
- "evergreenScore": Integer (0 to 100) representing how long-term stable the search intent and demand will be (e.g., 90+ means high everlasting value, 30 means ultra short-term trend/fidget-spinner peak).
- "whyViewersClick": Psychological and visual explanation of why a viewer would feel irresistible biological urge to click this specific title/thumbnail combination over all else.
- "whyCreatorsMake": ROI and value explanation for the creator (CPC/CPM potentials, authority building, easy production workflows, newsletter opt-in relevance, etc.).
- "publishingFormat": The best recommended video style format (e.g. "YouTube Shorts", "10-Minute Explainer", "30-Minute Premium Documentary", "Bingeable 3-part playlist series").

JSON Schema format:
{
  "topics": [
    {
      "id": "topic_unique_string",
      "title": "A highly clickable title",
      "hook": "An attention-grabbing intro hook line linking this concept to the star of the video",
      "reason": "Clear explanation of why this topic is trending, what psychological human levers it pulls, and why it fits this niche",
      "viralityScore": number (integer between 0 and 100),
      "competition": "Low" | "Medium" | "High",
      "searchIntent": "Search intent description representing keyword demand",
      "audienceType": "Detailed target demographic description",
      "suggestedThumbnail": "Compelling visual mockup concept for the thumbnail, describing subjects, facial expressions, background, text overlays",
      "uploadTime": "Best day & hour to publish (e.g., 'Tuesday, 3:00 PM EST')",
      "videoLength": "E.g., '12 minutes' or '45 seconds'",
      "followUps": [
        "First related follow-up video topic/idea inside this context thread",
        "Second related follow-up video topic/idea inside this context thread",
        "Third related follow-up video topic/idea inside this context thread"
      ],
      "originalityScore": 88,
      "evergreenScore": 95,
      "whyViewersClick": "Explain the biological and immediate dopamine curiosity response of the viewer",
      "whyCreatorsMake": "Reasoning based on CPC values and authority generation",
      "publishingFormat": "Best publication configuration style"
    }
  ]
}`;

    const response = await runWithGeminiFallback(req, (client) =>
      client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ text: promptText }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Unique string ID' },
                    title: { type: Type.STRING, description: 'Perfect YouTube title' },
                    hook: { type: Type.STRING, description: 'Awesome hook lines' },
                    reason: { type: Type.STRING, description: 'Why this holds immense algorithmic potential' },
                    viralityScore: { type: Type.INTEGER, description: 'Virality score 0 to 100' },
                    competition: { type: Type.STRING, description: 'One of: Low, Medium, High' },
                    searchIntent: { type: Type.STRING, description: 'Core search motivation' },
                    audienceType: { type: Type.STRING, description: 'Exact demographic match' },
                    suggestedThumbnail: { type: Type.STRING, description: 'Describe direct imagery and captions to design' },
                    uploadTime: { type: Type.STRING, description: 'Day and time suggestion' },
                    videoLength: { type: Type.STRING, description: 'Suitable video duration' },
                    followUps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Exactly 3 related, consecutive follow up video ideas',
                    },
                    originalityScore: { type: Type.INTEGER, description: 'Originality score 0 to 100' },
                    evergreenScore: { type: Type.INTEGER, description: 'Evergreen score 0 to 100' },
                    whyViewersClick: { type: Type.STRING, description: 'Biological/psychological trigger of clicking' },
                    whyCreatorsMake: { type: Type.STRING, description: 'ROI/creator metrics' },
                    publishingFormat: { type: Type.STRING, description: 'Formatting recommended' },
                  },
                  required: [
                    'title', 'hook', 'reason', 'viralityScore', 'competition',
                    'searchIntent', 'audienceType', 'suggestedThumbnail', 'uploadTime', 'videoLength', 'followUps',
                    'originalityScore', 'evergreenScore', 'whyViewersClick', 'whyCreatorsMake', 'publishingFormat',
                  ],
                },
              },
            },
            required: ['topics'],
          },
        },
      })
    );

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Empty response received from Gemini API');
    }

    const data = parseCleanJSON(outputText);
    if (!data.topics || !Array.isArray(data.topics)) {
      throw new Error('Gemini model output did not return an array of topics');
    }

    const topics = data.topics.slice(0, 20).map((t: any, i: number) => ({
      ...t,
      id: t.id || `gemini_topic_${i}_${Math.random().toString(36).substring(2)}`,
    }));

    res.status(200).json({ topics });
  } catch (err: any) {
    console.error('[ThumbScore AI] Gemini topic generation failure, falling back to simulation:', err);
    const simulatedResponse = generateFallbackTopics(querySubject, filters || {});
    res.status(200).json({ topics: simulatedResponse });
  }
});
