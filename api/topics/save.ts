/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withJsonHandler, requireMethod, getBearerToken } from '../_lib/http';
import { findUserByToken, getSavedTopics, saveSavedTopics, type SavedTopicRecord } from '../_lib/store';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['POST'])) return;

  const body = req.body || {};
  const { topic } = body;
  if (!topic || typeof topic !== 'object' || !topic.title) {
    res.status(400).json({ error: 'Missing topic parameter' });
    return;
  }

  const token = getBearerToken(req);
  const user = token ? await findUserByToken(token) : null;

  const saved = await getSavedTopics();

  const isSavedIdx = saved.findIndex(
    (t) =>
      t.topic.title.toLowerCase() === topic.title.toLowerCase() &&
      (user ? t.userId === user.id : t.userId === null)
  );

  if (isSavedIdx !== -1) {
    res.status(200).json(saved[isSavedIdx]);
    return;
  }

  const savedItem: SavedTopicRecord = {
    id: 'saved_topic_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    userId: user ? user.id : null,
    topic: {
      ...topic,
      id: topic.id || 'topic_' + Math.random().toString(36).substring(2),
    },
    createdAt: new Date().toISOString(),
  };

  saved.push(savedItem);
  await saveSavedTopics(saved);

  res.status(201).json(savedItem);
});
