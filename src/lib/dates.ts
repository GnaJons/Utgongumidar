const months=['janúar','febrúar','mars','apríl','maí','júní','júlí','ágúst','september','október','nóvember','desember'];

// Reykjavík uses UTC. Explicit month names also work in browsers without Icelandic ICU data.
export function dateIs(value:string):string {
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return 'Óþekkt dagsetning';
 return `${date.getUTCDate()}. ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
