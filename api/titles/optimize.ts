/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { withJsonHandler, requireMethod } from '../_lib/http';
import { getGoogleAI, runWithGeminiFallback, parseCleanJSON } from '../_lib/gemini';
import { generateFallbackTitleOptimization } from '../_lib/fallback-generators';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['POST'])) return;

  const body = req.body || {};
  const { title, category } = body;
  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Please enter a title to optimize' });
    return;
  }

  const baseTitle = title.trim();
  const selectedCategory = category || 'Educational';

  const activeAi = getGoogleAI(req);

  if (!activeAi) {
    console.warn('[ThumbScore AI] Falling back to Title Optimizer simulator.');
    const simulatedResponse = generateFallbackTitleOptimization(baseTitle, selectedCategory);
    res.status(200).json(simulatedResponse);
    return;
  }

  try {
    const promptText = `You are a world-class YouTube growth consultant, viral psychologist, and mastermind SEO copywriter.
Analyze this raw video title: "${baseTitle}" in the content category "${selectedCategory}".

Before writing any optimizations, perform the following internal multi-stage reasoning pipeline:
Stage 1: Deeply understand the core topic and search intent of raw concept: "${baseTitle}".
Stage 2: Identify the demographic sub-segments of "${selectedCategory}".
Stage 3: Map the core viewer emotions (curiosity, fear, desire for dominance, loss aversion).
Stage 4: Evaluate potential Click triggers.
Stage 5: Assess whether the raw concept is too vague, generic, or incoherent (fewer than 4 descriptive words or nonsensical queries like "abc" or "hello"). If vague, set "lowConfidence" to true, and explain why.
Stage 6: Draft at least 30 candidate titles in your internal scratchpad.
Stage 7: Compare candidate titles, sorting them into the 5 mandatory trigger categories, and pick the best 4 of each category (totaling exactly 20 titles).
Stage 8: Pick a single absolute masterpiece as the overall "Best" title and construct a 2-3 sentence sophisticated psychological explanation of why it out-performs all other 19 titles.

Perform a deep semantic evaluation of the raw input:
1. Calculate the raw title's Current Clickability Score (0-100)
2. Determine its emotional intensity score (0-100), visual clarity score (0-100), and SEO keyword score (0-100)
3. Predict CTR Potential Label (e.g. "Low Coverage", "Moderate Standings", "High Breakthrough Potential")
4. Write a balanced 2-sentence critique ("analysis") detailing strengths and fatal flaws that hold back this title.
5. Create exactly 20 premium optimized alternative titles (exactly 4 per trigger category below):
   - "Curiosity Gap": Create high curiosity loops (leave a suspenseful query open).
   - "High Stakes": Tap into urgency, FOMO, extreme consequences, or survival.
   - "Value Promise": Leverage rapid skill acquisition, step-by-step blueprints, or effortless outcomes.
   - "Contrarian / Threat": Rebel against mainstream assumptions or call out traditional mistakes.
   - "Ultra-Short Focus": High mobile CTR focus, under 42 characters, punchy and visible on any list view.

Your output must be structurally perfect. No markdown formatting outside the JSON, no commentary.

Return your response as a valid JSON object matching the exact structure below:
{
  "score": number (integer between 20 and 85),
  "ctrPrediction": "Low Coverage" | "Moderate Standings" | "High Breakthrough Potential",
  "emotionalScore": number (integer 0-100),
  "clarityScore": number (integer 0-100),
  "seoScore": number (integer 0-100),
  "analysis": "A detailed 2-sentence psychological critique of the raw title.",
  "lowConfidence": boolean,
  "confidenceWarning": "Vague feedback warning explanation if lowConfidence is true, otherwise empty",
  "bestTitle": {
    "title": "Copy of the single best title from the suggestions list",
    "triggerType": "Curiosity Gap" | "High Stakes" | "Value Promise" | "Contrarian / Threat" | "Ultra-Short Focus",
    "strategicExplanation": "2-3 sentences detailing precisely why this headline reigns supreme psychologically."
  },
  "suggestions": [
    {
      "id": "unique_string_id",
      "title": "Optimized clickable alternative title",
      "score": number (integer between 80 and 99),
      "triggerType": "Curiosity Gap" | "High Stakes" | "Value Promise" | "Contrarian / Threat" | "Ultra-Short Focus",
      "ctrUplift": "A string like '+3.8% Click Uplift' or '+4.5% Viral Uplift'",
      "explanation": "A powerful 1-sentence psychological strategy summary explaining why this copy works."
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
              score: { type: Type.INTEGER, description: 'Score of original title' },
              ctrPrediction: { type: Type.STRING, description: 'CTR bracket prediction' },
              emotionalScore: { type: Type.INTEGER },
              clarityScore: { type: Type.INTEGER },
              seoScore: { type: Type.INTEGER },
              analysis: { type: Type.STRING },
              lowConfidence: { type: Type.BOOLEAN },
              confidenceWarning: { type: Type.STRING },
              bestTitle: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  triggerType: { type: Type.STRING },
                  strategicExplanation: { type: Type.STRING },
                },
                required: ['title', 'triggerType', 'strategicExplanation'],
              },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING, description: 'Highly clickable optimized title' },
                    score: { type: Type.INTEGER, description: 'Score of optimized title 80-100' },
                    triggerType: { type: Type.STRING },
                    ctrUplift: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['title', 'score', 'triggerType', 'ctrUplift', 'explanation'],
                },
              },
            },
            required: ['score', 'ctrPrediction', 'emotionalScore', 'clarityScore', 'seoScore', 'analysis', 'lowConfidence', 'bestTitle', 'suggestions'],
          },
        },
      })
    );

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Empty response received from Gemini API');
    }

    const data = parseCleanJSON(outputText);

    const suggestions = data.suggestions.map((s: any, idx: number) => ({
      ...s,
      id: s.id || `optimized_title_gen_${idx}_${Date.now().toString(36)}`,
    }));

    res.status(200).json({
      score: data.score,
      ctrPrediction: data.ctrPrediction,
      emotionalScore: data.emotionalScore,
      clarityScore: data.clarityScore,
      seoScore: data.seoScore,
      analysis: data.analysis,
      lowConfidence: data.lowConfidence,
      confidenceWarning: data.confidenceWarning || '',
      bestTitle: data.bestTitle,
      suggestions,
    });
  } catch (err: any) {
    console.error('[ThumbScore AI] Title optimization failure, falling back to simulator:', err);
    const simulatedResponse = generateFallbackTitleOptimization(baseTitle, selectedCategory);
    res.status(200).json(simulatedResponse);
  }
});
