
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('scoreboards').del()
    .then(() =>
      // Inserts seed entries
      knex('scoreboards').insert(
        Array
          .from(Array(10).keys())
          .map((i) => ({
            topic: `scoreboard${i}`,
            name: `Placar ${i}`,
          })),

      ));
};
