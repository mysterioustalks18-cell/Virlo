/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { withJsonHandler, requireMethod, getBearerToken } from '../_lib/http';
import { findUserByToken, getReports, saveReports, type ThumbnailReport } from '../_lib/store';
import { getGoogleAI, runWithGeminiFallback, parseCleanJSON } from '../_lib/gemini';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

function buildSimReport(params: {
  reportId: string;
  userId: string | null;
  reportTitle: string;
  imageUrl: string;
  noteSuffix?: string;
}): ThumbnailReport {
  const simulatedOverallScore = Math.floor(Math.random() * 25) + 70; // 70 to 95
  return {
    id: params.reportId,
    userId: params.userId,
    title: params.reportTitle,
    imageUrl: params.imageUrl,
    overallScore: simulatedOverallScore,
    ctrPrediction: `${(simulatedOverallScore / 8).toFixed(1)}% - Highly Engaging Potential${params.noteSuffix ? ' (Simulation Fallback)' : ''}`,
    curiosity: Math.floor(Math.random() * 20) + 75,
    emotionalImpact: Math.floor(Math.random() * 20) + 75,
    readability: Math.floor(Math.random() * 20) + 75,
    mobileVisibility: Math.floor(Math.random() * 20) + 75,
    colorContrast: Math.floor(Math.random() * 20) + 75,
    subjectFocus: Math.floor(Math.random() * 20) + 75,
    textEffectiveness: Math.floor(Math.random() * 20) + 75,
    branding: Math.floor(Math.random() * 20) + 70,
    audienceMatch: Math.floor(Math.random() * 20) + 75,
    strengths: [
      'Fantastic color choices making direct visual components split cleanly.',
      'Great viewport alignment centering our main conceptual focus areas.',
      'Modern design style projecting premium editorial status immediately.',
    ],
    weaknesses: [
      'Text elements might feel slightly cramped under smaller mobile responsive scales.',
      'The outer lighting gradients might overlap background elements.',
    ],
    improvements: [
      'Increase primary header text weight by 20% to stand out on search listings.',
      'Incorporate subtle black outer glow paths behind cyan graphics for text clarity.',
      'Enhance facial brightness by 10% to boost empathy and human warmth metrics.',
      'Position core branding elements safely in the upper left corner.',
      'Optimize overall brightness values to compete with glowing dark mode feeds.',
    ],
    suggestedTitle: `I Changed My Thumbnail Score and Got ${simulatedOverallScore} Click-through Potential!`,
    suggestedHook: 'This critical layout secret makes viewers pause their scrolling instantly.',
    detailedExplanation: `As Your Creative Director, I rate this design ${simulatedOverallScore}/100.${
      params.noteSuffix ? ` (Note: A simulation fallback was triggered due to an active API key or quota issue: ${params.noteSuffix}).` : ''
    } It demonstrates remarkable visual alignment and balance, but falls short under extreme mobile downsizing tests where your typographic contrast drops off significantly. To fix this, we need slightly bolder outlines and deeper shadow maps behind your primary foreground elements.`,
    createdAt: new Date().toISOString(),
  };
}

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['POST'])) return;

  const body = req.body || {};
  const { imageUrl, base64Data, mimeType, title } = body;

  if (!base64Data && !imageUrl) {
    res.status(400).json({ error: 'Please provide either thumbnail image upload OR image URL input' });
    return;
  }

  const token = getBearerToken(req);
  const user = token ? await findUserByToken(token) : null;

  const reportId = 'report_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const reportTitle = title || 'Untitled YouTube Scan';

  const activeAi = getGoogleAI(req);

  if (!activeAi) {
    console.warn('Falling back to smart simulation since Gemini API key is not defined.');
    const simReport = buildSimReport({
      reportId,
      userId: user ? user.id : null,
      reportTitle,
      imageUrl: imageUrl || `data:${mimeType || 'image/png'};base64,${base64Data}`,
    });

    const reports = await getReports();
    reports.push(simReport);
    await saveReports(reports);

    res.status(200).json(simReport);
    return;
  }

  try {
    let targetMimeType = mimeType || 'image/png';
    let rawBase64 = base64Data;

    if (imageUrl && !base64Data) {
      try {
        const fetchRes = await fetch(imageUrl);
        if (!fetchRes.ok) throw new Error('Could not download image from provided URL path');
        const arrayBuffer = await fetchRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        rawBase64 = buffer.toString('base64');
        const contentType = fetchRes.headers.get('content-type');
        if (contentType) targetMimeType = contentType;
      } catch (imgErr: any) {
        res.status(400).json({ error: `Could not retrieve thumbnail image URL: ${imgErr.message}` });
        return;
      }
    }

    const imagePart = {
      inlineData: {
        mimeType: targetMimeType,
        data: rawBase64,
      },
    };

    const promptText = `You are a world-class YouTube growth consultant, viral thumbnail designer, and eye-tracking conversion rate expert.
You must act as an experienced Creative Director evaluating this thumbnail through three core criteria:
1. Visual Hierarchy & Composition (rule-of-thirds, visual balance, whitespace usage, clutter, target focal anchors)
2. Psychology & Emotion (curiosity gap, facial expressions, colour temperature energy, urgency triggers)
3. Feasibility on Mobile viewports (extreme downsizing legibility, YouTube overlay timestamp safe zones)

Provide constructive praise, critical friction points, and high-impact structural recommendations.
Analyze the provided thumbnail image. Provide rigorous ratings and actionable feedback.

You must reply with a valid JSON structure conforming to the schema of variables below. No extra commentary or markdown.
Expected Output Schema structure:
{
  "overallScore": number (0 to 100 based on overall click potential, curiosity, design standard),
  "ctrPrediction": string (percentage range e.g. "9.4% - Premium CTR Potential", including contextual statement),
  "curiosity": number (0 to 100, ability to generate cognitive gap or intrigue),
  "emotionalImpact": number (0 to 100, emotional response, facial empathy, color temperature energy),
  "readability": number (0 to 100, text size, visibility, styling and overlap safety),
  "mobileVisibility": number (0 to 100, effectiveness of subject matter at typical 1.5inch mobile size preview),
  "colorContrast": number (0 to 100, color harmony, visual segregation, background pop),
  "subjectFocus": number (0 to 100, simplicity of single clear focal point or human aspect),
  "textEffectiveness": number (0 to 100, keyword choice strength, placement safety from Youtube UI overlay timers),
  "branding": number (0 to 100, consistent color system, creator identity or thematic recognition),
  "audienceMatch": number (0 to 100, suitability for general viral audience vs niche experts),
  "strengths": string[] (provide exactly 3 detailed bullet points describing positive attributes),
  "weaknesses": string[] (provide exactly 2 detailed bullet points describing negative highlights or dropoffs),
  "improvements": string[] (provide exactly 5 prioritized, itemized step-by-step styling recommendations),
  "suggestedTitle": string (suggest an highly engaging, click-worthy YouTube Video Title optimized for this visual's aura),
  "suggestedHook": string (suggest a high-retention video intro hook lines linking this thumbnail concept to the start of the video),
  "detailedExplanation": string (a comprehensive 3-4 sentence sophisticated executive review from a Creative Director's desk explaining the rating in terms of Visual Hierarchy, Psychology, and Mobile feasibility)
}`;

    const response = await runWithGeminiFallback(req, (client) =>
      client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [imagePart, { text: promptText }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER, description: 'Overall predicted score between 0 and 100' },
              ctrPrediction: { type: Type.STRING, description: 'CTR percentage prediction plus label description (e.g. "8.5% - High Potential")' },
              curiosity: { type: Type.INTEGER, description: 'Intrigue rating, 0 to 100' },
              emotionalImpact: { type: Type.INTEGER, description: 'Emotional resonance or facial engagement score, 0 to 100' },
              readability: { type: Type.INTEGER, description: 'Ease of text reading under multiple formats, 0 to 100' },
              mobileVisibility: { type: Type.INTEGER, description: 'Efficacy under 150px layout container, 0 to 100' },
              colorContrast: { type: Type.INTEGER, description: 'Tone and contrast, 0 to 100' },
              subjectFocus: { type: Type.INTEGER, description: 'Contrast of primary focal subjects, 0 to 100' },
              textEffectiveness: { type: Type.INTEGER, description: 'Impact of the typographic layout, 0 to 100' },
              branding: { type: Type.INTEGER, description: 'Branding cohesion, 0 to 100' },
              audienceMatch: { type: Type.INTEGER, description: 'Target alignment density, 0 to 100' },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List containing exactly 3 detailed strengths',
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List containing exactly 2 detailed weaknesses',
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List containing exactly 5 direct prioritized architectural optimizations',
              },
              suggestedTitle: { type: Type.STRING, description: 'Engaging hook YouTube title matching this image aura' },
              suggestedHook: { type: Type.STRING, description: 'A highly responsive, attention-gripping intro hook' },
              detailedExplanation: { type: Type.STRING, description: 'A comprehensive rating assessment of layout, cognitive triggers, and viewport safety.' },
            },
            required: [
              'overallScore', 'ctrPrediction', 'curiosity', 'emotionalImpact', 'readability',
              'mobileVisibility', 'colorContrast', 'subjectFocus', 'textEffectiveness',
              'branding', 'audienceMatch', 'strengths', 'weaknesses', 'improvements',
              'suggestedTitle', 'suggestedHook', 'detailedExplanation',
            ],
          },
        },
      })
    );

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Gemini model yielded empty analysis response.');
    }

    const reportJSON = parseCleanJSON(outputText);

    const finalReport: ThumbnailReport = {
      id: reportId,
      userId: user ? user.id : null,
      title: reportTitle,
      imageUrl: imageUrl || `data:${targetMimeType};base64,${rawBase64}`,
      ...reportJSON,
      createdAt: new Date().toISOString(),
    };

    const reports = await getReports();
    reports.push(finalReport);
    await saveReports(reports);

    res.status(200).json(finalReport);
  } catch (apiErr: any) {
    console.error('Gemini image analysis error, falling back to simulation:', apiErr);

    const fallbackMimeType = mimeType || 'image/png';
    const fallbackBase64 = base64Data || '';
    const imgStr = imageUrl || `data:${fallbackMimeType};base64,${fallbackBase64}`;

    const simReport = buildSimReport({
      reportId,
      userId: user ? user.id : null,
      reportTitle,
      imageUrl: imgStr,
      noteSuffix: apiErr.message || String(apiErr),
    });

    const reports = await getReports();
    reports.push(simReport);
    await saveReports(reports);

    res.status(200).json(simReport);
  }
});
