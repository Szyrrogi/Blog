exports.seed = function(knex) {
  // Usunięcie WSZYSTKICH obecnych wpisów
  return knex('post').del()
    .then(function () {
      // Wstawienie przykładowych wpisów
      return knex('post').insert([
        {title: 'Pierwszy post', date: '2024-05-06', descritopn: 'To jest pierwszy post.', contents: 'Treść pierwszego posta.'},
        {title: 'Drugi post', date: '2024-05-07', descritopn: 'To jest drugi post.', contents: 'Treść drugiego posta.'}
      ]);
    });
};
