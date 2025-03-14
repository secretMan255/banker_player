import { Server } from 'socket.io'

const drawCard = () => Math.floor(Math.random() * 13) + 1

const generateGameRound = (io: Server) => {
     const newPlayerHand = [drawCard(), drawCard()]
     const newBankerHand = [drawCard(), drawCard()]
     let playerTotal: number = newPlayerHand.reduce((sum, card) => sum + Math.min(card, 10), 0)
     let bankerTotal: number = newBankerHand.reduce((sum, card) => sum + Math.min(card, 10), 0)

     if (playerTotal > 10) {
          playerTotal = playerTotal - 10
     }

     if (bankerTotal > 10) {
          bankerTotal = bankerTotal - 10
     }

     const gameResult = playerTotal > bankerTotal ? 'Player Wins!' : bankerTotal > playerTotal ? 'Banker Wins!' : "It's a Tie!"

     const gameData = { playerHand: newPlayerHand, bankerHand: newBankerHand, result: gameResult, bankerTotal: bankerTotal, playerTotal: playerTotal }

     io.emit('gameUpdate', gameData) // Broadcast to all clients
}

const ioHandler = (req: any, res: any) => {
     if (!res.socket.server.io) {
          console.log('Initializing WebSocket Server...')
          const io = new Server(res.socket.server, {
               path: '/api/socket',
               addTrailingSlash: false,
          })

          io.on('connection', (socket) => {
               console.log('New player connected:', socket.id)

               // Send empty game state when a new player joins
               socket.emit('gameUpdate', {
                    playerHand: [],
                    bankerHand: [],
                    result: null,
               })

               // When a client manually requests a game
               socket.on('requestGame', () => {
                    generateGameRound(io)
               })

               socket.on('disconnect', () => {
                    console.log('Player disconnected:', socket.id)
               })
          })

          // ✅ Auto-start the game every 5 seconds
          setInterval(() => {
               generateGameRound(io)
          }, 5000)

          res.socket.server.io = io
     }
     res.end()
}

export default ioHandler
