// Serverless handler for Vercel deployment
const storedResponses: Record<string, unknown>[] = [];

export default function handler(
  req: { method?: string; body?: unknown },
  res: { status: (code: number) => { json: (data: unknown) => void } }
) {
  if (req.method === 'GET') {
    return res.status(200).json(storedResponses);
  }

  if (req.method === 'POST') {
    const entry =
      typeof req.body === 'string'
        ? (JSON.parse(req.body) as Record<string, unknown>)
        : (req.body as Record<string, unknown>);

    storedResponses.unshift({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...entry,
    });
    return res.status(200).json({ success: true, count: storedResponses.length });
  }

  if (req.method === 'DELETE') {
    storedResponses.length = 0;
    return res.status(200).json({ success: true, count: 0 });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
