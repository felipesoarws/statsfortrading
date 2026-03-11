async function testPast() {
  const LAYBACK_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Accept': 'application/json, text/plain, */*',
  };

  const MEXCHANGE_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Accept': 'application/json',
    'Origin': 'https://mexchange2.bolsadeaposta.bet.br',
    'Referer': 'https://mexchange2.bolsadeaposta.bet.br/',
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedDate = yesterday.toISOString().split('T')[0];
  
  const listUrl = `https://data-center-bolsa-statistics-api.layback.trade/api/past-events?startDate=${formattedDate}&perPage=10&page=1&groupedByLeague=true`;
  const listRes = await fetch(listUrl, { headers: LAYBACK_HEADERS });
  const listData = await listRes.json();
  const events = Array.isArray(listData) ? listData : (listData.matches || []);
  let match = null;
  if (events.length > 0) {
    if (events[0].events) match = events[0].events[0];
    else match = events[0];
  }

  if (!match) return;

  const id = match.eventId;
  console.log(`Match ID: ${id}`);

  const mexUrl = `https://mexchange-api.bolsadeaposta.bet.br/api/events/${id}?popular-count=10`;
  const mexRes = await fetch(mexUrl, { headers: MEXCHANGE_HEADERS });
  console.log(`MExchange Status: ${mexRes.status}`);
  const mexText = await mexRes.text();
  console.log(`MExchange Body: ${mexText.substring(0, 500)}`);
}

testPast();
