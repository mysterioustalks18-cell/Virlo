/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withJsonHandler, requireMethod, getBearerToken } from '../../_lib/http';
import { findUserByToken, getSavedTopics, saveSavedTopics } from '../../_lib/store';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['DELETE'])) return;

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Missing saved topic id' });
    return;
  }

  const token = getBearerToken(req);
  const user = token ? await findUserByToken(token) : null;

  const saved = await getSavedTopics();
  const index = saved.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Saved topic not found' });
    return;
  }

  const item = saved[index];
  if (user && item.userId !== user.id) {
    res.status(403).json({ error: 'Unauthorized to delete this saved topic' });
    return;
  }
  if (!user && item.userId !== null) {
    res.status(403).json({ error: 'Unauthorized to delete this saved topic' });
    return;
  }

  saved.splice(index, 1);
  await saveSavedTopics(saved);

  res.status(200).json({ success: true, message: 'Saved topic deleted' });
});
