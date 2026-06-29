const NOTION_TOKEN = process.env.NOTION_TOKEN;
const FEEDBACK_LOG_DB = '2f3e69fb-b9e6-80b7-a5ee-ea8f3730f7ab';
const AZIENDE_DB = '1d5e69fb-b9e6-8001-ba04-eb705213fb30';
const FORMSPREE_1 = 'https://formspree.io/f/mjglzlqo';
const FORMSPREE_2 = 'https://formspree.io/f/mqenjjnb';

async function findAziendaId(hospitalName) {
  if (!hospitalName) return null;
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${AZIENDE_DB}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'Name',
          title: { contains: hospitalName },
        },
        page_size: 1,
      }),
    });
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].id;
    }
  } catch (_) {}
  return null;
}

async function createNotionTicket(payload) {
  const { subject, ticketType, message, hospital, department } = payload;

  const aziendaId = await findAziendaId(hospital);

  const title = subject;
  const feedbackValue = ticketType === 'Tecnico' ? 'Operations' : 'Support';
  const today = new Date().toISOString().split('T')[0];

  const properties = {
    'Support Event': { title: [{ text: { content: title } }] },
    'Descrizione problema': { rich_text: [{ text: { content: message } }] },
    'Feedback': { select: { name: feedbackValue } },
    'Category': { select: { name: 'Support' } },
    'Request type': { select: { name: 'inbound' } },
    'Data richiesta': { date: { start: today } },
  };

  if (department) {
    properties['Reparto'] = { select: { name: department } };
  }

  if (aziendaId) {
    properties['Aziende'] = { relation: [{ id: aziendaId }] };
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: FEEDBACK_LOG_DB },
      properties,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Notion error');
  }
}

async function sendFormspree(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, ticketType, message, user_name, hospital, department, patientType } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const formspreePayload = {
    subject,
    ticketType,
    message,
    user_name,
    hospital,
    department,
    patientType,
  };

  const [f1, f2, notionResult] = await Promise.allSettled([
    sendFormspree(FORMSPREE_1, formspreePayload),
    sendFormspree(FORMSPREE_2, formspreePayload),
    createNotionTicket({ subject, ticketType, message, hospital, department }),
  ]);

  const formspreeOk = f1.status === 'fulfilled' && f1.value && f2.status === 'fulfilled' && f2.value;
  const notionOk = notionResult.status === 'fulfilled';

  if (!formspreeOk && !notionOk) {
    return res.status(500).json({ error: 'All delivery methods failed' });
  }

  return res.status(200).json({ ok: true, formspree: formspreeOk, notion: notionOk });
}
