
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('scoreboards').del()
    .then(function () {
      // Inserts seed entries
      return knex('scoreboards').insert([
        {
          id: 1,
          name: 'Placar 1',
          match_id: 1
        },
        {
          id: 2,
          name: 'Placar 2',
        }
      ]);
    });
};
