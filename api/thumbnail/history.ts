/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withJsonHandler, requireMethod, getBearerToken } from '../_lib/http';
import { findUserByToken, getReports } from '../_lib/store';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['GET'])) return;

  const token = getBearerToken(req);
  const user = token ? await findUserByToken(token) : null;

  const reports = await getReports();
  let list = reports;
  if (user) {
    list = reports.filter((r) => r.userId === user.id || r.userId === null);
  } else {
    list = reports.filter((r) => r.userId === null);
  }

  list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.status(200).json({ reports: list });
});
