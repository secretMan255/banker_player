import { Server } from 'socket.io'

const drawCard = () => Math.floor(Math.random() * 9) + 1

const ioHandler = (req: any, res: any) => {
     if (!res.socket.server.io) {
          console.log('Initializing WebSocket Server...')
          const io = new Server(res.socket.server, {
               path: '/api/socket',
               addTrailingSlash: false,
          })

          io.on('connection', (socket) => {
               console.log('New player connected:', socket.id)

               socket.on('requestGame', () => {
                    // Generate a new game round (server handles this now)
                    const newPlayerHand = [drawCard(), drawCard()]
                    const newBankerHand = [drawCard(), drawCard()]
                    const playerTotal = newPlayerHand.reduce((sum, card) => sum + card, 0) % 10
                    const bankerTotal = newBankerHand.reduce((sum, card) => sum + card, 0) % 10

                    const gameResult = playerTotal > bankerTotal ? 'Player Wins!' : bankerTotal > playerTotal ? 'Banker Wins!' : "It's a Tie!"

                    const gameData = { playerHand: newPlayerHand, bankerHand: newBankerHand, result: gameResult }

                    io.emit('gameUpdate', gameData) // Send same result to all clients
               })

               socket.on('disconnect', () => {
                    console.log('Player disconnected:', socket.id)
               })
          })

          res.socket.server.io = io
     }
     res.end()
}

export default ioHandler
