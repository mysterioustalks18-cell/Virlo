/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withJsonHandler, requireMethod, getBearerToken } from '../_lib/http';
import { findUserByToken, getSavedTitles, saveSavedTitles, type SavedTitleRecord } from '../_lib/store';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['POST'])) return;

  const body = req.body || {};
  const { originalTitle, optimizedTitle, category, score, triggerType, ctrUplift, explanation } = body;

  if (!optimizedTitle || typeof optimizedTitle !== 'string') {
    res.status(400).json({ error: 'Missing optimized title' });
    return;
  }

  const token = getBearerToken(req);
  const user = token ? await findUserByToken(token) : null;

  const saved = await getSavedTitles();

  const isSavedIdx = saved.findIndex(
    (t) =>
      t.optimizedTitle.toLowerCase() === optimizedTitle.toLowerCase() &&
      (user ? t.userId === user.id : t.userId === null)
  );

  if (isSavedIdx !== -1) {
    res.status(200).json(saved[isSavedIdx]);
    return;
  }

  const savedItem: SavedTitleRecord = {
    id: 'saved_title_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    userId: user ? user.id : null,
    originalTitle: originalTitle || 'Raw Title',
    optimizedTitle,
    category: category || 'General',
    score: score || 85,
    triggerType: triggerType || 'Optimized',
    ctrUplift: ctrUplift || '+2.5% Potential',
    explanation: explanation || 'Custom high performance formula variant.',
    createdAt: new Date().toISOString(),
  };

  saved.push(savedItem);
  await saveSavedTitles(saved);

  res.status(201).json(savedItem);
});
