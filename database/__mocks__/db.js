// database/__mocks__/db.js
const db = {
    query: jest.fn((sql, values, callback) => {
      // on simule un résultat vide
      callback(null, [], []);
    }),

    // Mock de la méthode connect
    connect: jest.fn(callback => {
      // Simule une connexion réussie
      callback(null);
    }),
    // s’il y a d’autres méthodes (connect, end, etc.), mockez-les
  };
  
  module.exports = db;
  