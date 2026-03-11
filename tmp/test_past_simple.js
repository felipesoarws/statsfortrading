async function testPast() {
  const LAYBACK_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Accept': 'application/json, text/plain, */*',
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedDate = yesterday.toISOString().split('T')[0];
  
  console.log(`Checking past events for ${formattedDate}...`);
  const listUrl = `https://data-center-bolsa-statistics-api.layback.trade/api/past-events?startDate=${formattedDate}&perPage=10&page=1&groupedByLeague=true`;
  
  const listRes = await fetch(listUrl, { headers: LAYBACK_HEADERS });
  if (!listRes.ok) {
    console.log(`Failed to fetch list: ${listRes.status}`);
    return;
  }
  
  const listData = await listRes.json();
  const events = Array.isArray(listData) ? listData : (listData.matches || []);
  let match = null;
  if (events.length > 0) {
    if (events[0].events) match = events[0].events[0];
    else match = events[0];
  }

  if (!match) {
    console.log("No past matches found.");
    return;
  }

  const id = match.eventId;
  console.log(`Found past match: ${match.homeTeamName} vs ${match.awayTeamName} (ID: ${id})`);

  const infoUrl = `https://data-center-bolsa-statistics-api.layback.trade/api/event/${id}/info`;
  const infoRes = await fetch(infoUrl, { headers: LAYBACK_HEADERS });
  console.log(`INFO Status: ${infoRes.status}`);
  if (infoRes.ok) {
    const text = await infoRes.text();
    console.log(`INFO Body: ${text.substring(0, 500)}`);
  } else {
    console.log(`INFO error body: ${await infoRes.text()}`);
  }

  const historyUrl = `https://data-center-bolsa-statistics-api.layback.trade/api/event/${id}/history?matches=20&sameSide=true`;
  const historyRes = await fetch(historyUrl, { headers: LAYBACK_HEADERS });
  console.log(`HISTORY Status: ${historyRes.status}`);
  if (historyRes.ok) {
    const text = await historyRes.text();
    console.log(`HISTORY Body: ${text.substring(0, 500)}`);
  }
}

testPast();
