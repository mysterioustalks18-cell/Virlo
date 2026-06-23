/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withJsonHandler, requireMethod, getBearerToken } from '../../_lib/http';
import { findUserByToken, getReports, saveReports } from '../../_lib/store';

export default withJsonHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireMethod(req, res, ['DELETE'])) return;

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Missing report id' });
    return;
  }

  const token = getBearerToken(req);
  const user = token ? await findUserByToken(token) : null;

  const reports = await getReports();
  const reportIndex = reports.findIndex((r) => r.id === id);
  if (reportIndex === -1) {
    res.status(404).json({ error: 'Analysis log report not found' });
    return;
  }

  const report = reports[reportIndex];

  if (report.id.startsWith('seed-report-')) {
    res.status(403).json({ error: 'Protected system templates cannot be deleted.' });
    return;
  }

  if (user && report.userId !== user.id) {
    res.status(403).json({ error: 'Unauthorized to delete this report' });
    return;
  }

  reports.splice(reportIndex, 1);
  await saveReports(reports);

  res.status(200).json({ success: true, message: 'Report removed successfully' });
});
