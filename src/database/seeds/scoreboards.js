
exports.seed = (knex) => knex('Scoreboard').del()
  .then(() => knex('Scoreboard').insert(
    Array
      .from(Array(10).keys())
      .map((i) => ({
        topic: `scoreboard${i}`,
        name: `Placar ${i}`,
        staticToken: 'mqtt1234',
      })),
  ));
