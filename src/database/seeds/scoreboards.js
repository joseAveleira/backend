
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('scoreboards').del()
    .then(function () {
      // Inserts seed entries
      return knex('scoreboards').insert([
        {
          topic: 'scoreboard1',
          name: 'Placar 1',
          match_id: 1
        },
        {
          topic: 'scoreboard2',
          name: 'Placar 2',
        }
      ]);
    });
};
