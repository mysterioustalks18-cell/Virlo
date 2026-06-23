/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withJsonHandler, requireMethod } from '../_lib/http';
import { getUsers, saveUsers, type LocalUser } from '../_lib/store';
import { hashPassword } from '../_lib/password';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['POST'])) return;

  const body = req.body || {};
  const { email, password, name } = body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string' || !name || typeof name !== 'string') {
    res.status(400).json({ error: 'Missing required registration parameters' });
    return;
  }

  const users = await getUsers();
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    res.status(400).json({ error: 'An account with this email already exists' });
    return;
  }

  const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const newUser: LocalUser = {
    id: 'user_' + Math.random().toString(36).substring(2),
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    name,
    token,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  res.status(201).json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  });
});
