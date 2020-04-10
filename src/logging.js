const knex = require('./database');

function getScoreMessage(playerName, scoreType) {
  if (scoreType === 'SCORE') {
    return `${playerName} fez ponto!`;
  }

  if (scoreType === 'ACE') {
    return `${playerName} fez um Ace!`;
  }

  if (scoreType === 'WINNER') {
    return `${playerName} fez um Winner!`;
  }

  if (scoreType === 'DOUBLE_FAULT') {
    return `${playerName} pontuou por uma Dupla Falta do oponente.`;
  }

  return '';
}

async function publishAndStoreLog(broker, scoreboardTopic, matchId, payload) {
  const [id] = await knex('logs')
    .insert({
      match_id: matchId,
      log_type: payload.log_type,
      message: payload.message,
    })
    .returning('id');

  await broker.publish({
    topic: `${scoreboardTopic}/log`,
    payload: JSON.stringify({ ...payload, id }),
    qos: 1,
  });
}

async function addLog(broker, topic, data) {
  const [scoreboardTopic, field] = topic.split('/');

  const scoreboardData = await knex('scoreboards')
    .select('matches.player1_name', 'matches.player2_name', { matchId: 'matches.id' })
    .where('scoreboards.topic', '=', scoreboardTopic)
    .join('matches', 'scoreboards.match_id', '=', 'matches.id')
    .first();

  if (!scoreboardData) return;

  scoreboardData.player1_name = scoreboardData.player1_name || 'Jogador 1';
  scoreboardData.player2_name = scoreboardData.player2_name || 'Jogador 2';

  const payload = {
    message: '',
    log_type: '',
  };

  switch (field) {
    case 'Score_A':
      if (!data.extras || !data.extras.score_type) break;
      if (data.payload === '0') break;

      payload.message = getScoreMessage(scoreboardData.player1_name, data.extras.score_type);
      payload.log_type = data.extras.score_type;

      break;

    case 'Score_B':
      if (!data.extras || !data.extras.score_type) break;
      if (data.payload === '0') break;

      payload.message = getScoreMessage(scoreboardData.player2_name, data.extras.score_type);
      payload.log_type = data.extras.score_type;

      break;

    case 'Set1_A':
    case 'Set2_A':
    case 'Set3_A':
      if (data.extras && data.extras.score_type) {
        await publishAndStoreLog(broker, scoreboardTopic, scoreboardData.matchId, {
          message: getScoreMessage(scoreboardData.player1_name, data.extras.score_type),
          log_type: data.extras.score_type,
        });
      }

      payload.message = `${scoreboardData.player1_name} ganhou o game!`;
      payload.log_type = 'GAME';

      break;

    case 'Set1_B':
    case 'Set2_B':
    case 'Set3_B':
      if (data.extras && data.extras.score_type) {
        await publishAndStoreLog(broker, scoreboardTopic, scoreboardData.matchId, {
          message: getScoreMessage(scoreboardData.player2_name, data.extras.score_type),
          log_type: data.extras.score_type,
        });
      }

      payload.message = `${scoreboardData.player2_name} ganhou o game!`;
      payload.log_type = 'GAME';

      break;

    case 'Current_Set':
      payload.message = 'O set terminou!';
      payload.log_type = 'SET';

      break;

    case 'Match_Winner':
      payload.message = `${data.payload === '0' ? scoreboardData.player1_name : scoreboardData.player2_name} venceu a partida!`;
      payload.log_type = 'MATCH';

      break;

    default:
      break;
  }

  if (payload.message) {
    await publishAndStoreLog(broker, scoreboardTopic, scoreboardData.matchId, payload);
  }
}

module.exports = { addLog };
