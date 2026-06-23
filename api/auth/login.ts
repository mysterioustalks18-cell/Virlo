/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withJsonHandler, requireMethod } from '../_lib/http';
import { getUsers, saveUsers } from '../_lib/store';
import { verifyPassword } from '../_lib/password';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['POST'])) return;

  const body = req.body || {};
  const { email, password } = body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    res.status(400).json({ error: 'Missing log-in credentials' });
    return;
  }

  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password combination' });
    return;
  }

  const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  user.token = token;
  await saveUsers(users);

  res.status(200).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});
