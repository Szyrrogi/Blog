exports.up = function(knex) {
    return knex.schema.createTable('post', table => {
      table.increments('id');
      table.string('title');
      table.date('date');
      table.string('descritopn');
      table.string('contents');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('post');
  };