import { Player, Session } from '../../data/connectors';

function shortName (name) {
    let parts = name.split(' ');
    return parts[parts.length - 1];
}

const SessionPair = {};
SessionPair.getAll = function (session) {
  return session
        .getSessionPlayers({ include: [Player] })
        .then(sessionPlayers => SessionPair.fromSessionPlayers(session, sessionPlayers));
};

SessionPair.getPairById = function (id) {
  let parts = id.split('-');
  return Session
    .findById(parts[0])
    .then(session => SessionPair.getPair(session, parts[1], parts[2]))
  ;
};

SessionPair.getPair = function (session, direction, table) {
  const q = { table, seat: { $in: Array.from(direction) } };
  return session
        .getSessionPlayers({ where: q, include: [Player] })
        .then(sessionPlayers => SessionPair.fromSessionPlayers(session, sessionPlayers))
        .then(pairs => pairs[0])
    ;
};

SessionPair.fromSessionPlayers = function (session, sessionPlayers) {
  const map = {};
  sessionPlayers.forEach((sp) => {
    const direction = sp.seat === 'N' || sp.seat === 'S' ? 'NS' : 'EW';
    const name = direction + sp.table;
    const pair = map[name] || {
      id: `${session.id}-${direction}-${sp.table}`,
      session,
      direction,
      name,
      table: sp.table,
      players: [] };
    const player = sp.player;
    pair.players.push(player);
    pair.title = pair.title ? `${pair.title} / ${player.name}` : player.name;
    pair.shortTitle = pair.shortTitle ? `${pair.shortTitle}/${shortName(player.name)}` : shortName(player.name);
    map[name] = pair;
  });
  return Object.getOwnPropertyNames(map).map(val => map[val]);
};

export default SessionPair;
