
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('scoreboards').del()
    .then(function () {
      // Inserts seed entries
      return knex('scoreboards').insert(
        Array
          .from(Array(10).keys())
          .map(i => ({
            topic: `scoreboard${i}`,
            name: `Placar ${i}`
          }))

      );
    });
};
