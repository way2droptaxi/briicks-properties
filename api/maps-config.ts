interface VercelRequestLike {
  method?: string;
}

interface VercelResponseLike {
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  res.status(200).json({
    apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
  });
}
