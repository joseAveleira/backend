
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('matches').del()
    .then(function () {
      // Inserts seed entries
      return knex('matches').insert([
        {
          id: 1,
          player1_name: 'Federer',
          player2_name: 'Nadal',
          tiebreak_type: 'REGULAR',
          advantage: true,
          score_type: 'BASIC'
        },
        {
          id: 2,
          player1_name: 'Federer',
          player2_name: 'Djokovic',
          tiebreak_type: 'REGULAR',
          advantage: false,
          score_type: 'BASIC'
        },
        {
          id: 3,
          player1_name: 'Foo',
          player2_name: 'Bar',
          tiebreak_type: 'TEN_POINTS',
          advantage: false,
          score_type: 'BASIC'
        },
      ]);
    });
};
