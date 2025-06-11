module.exports = (io) => {
  const activeGames = {};
  
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      socket.userId = userId;
      io.emit('userOnline', userId);
    });

    socket.on('sendGameInvite', ({ senderId, receiverId, category }) => {
      io.to(receiverId).emit('receiveGameInvite', {
        from: { _id: senderId, username: 'FriendUsername' }, // You'd fetch this from DB
        category
      });
    });
    
    socket.on('game:invite', ({ from, to }) => {
      io.to(to).emit('game:invite:received', { from });
    });    

    socket.on('acceptInvite', ({ gameId, players }) => {
      activeGames[gameId] = {
        players,
        wordsUsed: [],
        currentPlayer: players[0],
        category: 'Animals' // Would come from invite
      };
      players.forEach(playerId => {
        io.to(playerId).emit('gameStarted', activeGames[gameId]);
      });
    });

    socket.on('submitWord', ({ gameId, word }) => {
      const game = activeGames[gameId];
      // Validate word logic here
      game.wordsUsed.push(word);
      // Switch turns
      game.currentPlayer = game.players.find(p => p !== game.currentPlayer);
      io.to(gameId).emit('gameUpdate', game);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        io.emit('userOffline', socket.userId);
      }
    });
  });
};