/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withJsonHandler, requireMethod, getBearerToken } from '../_lib/http';
import { findUserByToken } from '../_lib/store';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['GET'])) return;

  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await findUserByToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.status(200).json({ user: { id: user.id, email: user.email, name: user.name } });
});
