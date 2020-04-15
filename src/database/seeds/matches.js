
exports.seed = (knex) => knex('Match').del()
  .then(() => knex('Match').insert([
    {
      player1: 'Federer',
      player2: 'Nadal',
      tieBreakType: 'REGULAR',
      hasAdvantage: true,
      scoreType: 'BASIC',
    },
    {
      player1: 'Federer',
      player2: 'Djokovic',
      tieBreakType: 'REGULAR',
      hasAdvantage: false,
      scoreType: 'BASIC',
    },
    {
      player1: 'Foo',
      player2: 'Bar',
      tieBreakType: 'TEN_POINTS',
      hasAdvantage: false,
      scoreType: 'BASIC',
    },
  ]));
