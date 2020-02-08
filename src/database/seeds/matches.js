
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('matches').del()
    .then(function () {
      // Inserts seed entries
      return knex('matches').insert([
        {
          player1_name: 'Federer',
          player2_name: 'Nadal',
          tiebreak_type: 'REGULAR',
          advantage: true,
          score_type: 'BASIC'
        },
        {
          player1_name: 'Federer',
          player2_name: 'Djokovic',
          tiebreak_type: 'REGULAR',
          advantage: false,
          score_type: 'BASIC'
        },
        {
          player1_name: 'Foo',
          player2_name: 'Bar',
          tiebreak_type: 'TEN_POINTS',
          advantage: false,
          score_type: 'BASIC'
        },
      ]);
    });
};
