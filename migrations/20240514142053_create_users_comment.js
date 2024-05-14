exports.up = function(knex) {
    return knex.schema.dropTableIfExists('commernt')
      .then(function() {
        return knex.schema.createTable('commernt', table => {
          table.increments('id');
          table.string('user');
          table.string('postId');
          table.string('text');
        });
      });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('commernt');
  };
  