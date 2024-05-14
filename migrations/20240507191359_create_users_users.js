exports.up = function(knex) {
    return knex.schema.dropTableIfExists('users')
      .then(function() {
        return knex.schema.createTable('users', table => {
          table.increments('id');
          table.string('name');
          table.string('password');
          table.string('mail');
        });
      });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('users');
  };
  