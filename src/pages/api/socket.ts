import { Server } from 'socket.io'

const drawCard = () => Math.floor(Math.random() * 13) + 1

// Store game history across rounds
let loadMapResult: Array<'Player Wins' | 'Banker Wins' | "It's a Tie!"> = []

const generateGameRound = (io: Server) => {
     const newPlayerHand: [number, number] = [drawCard(), drawCard()]
     const newBankerHand: [number, number] = [drawCard(), drawCard()]
     let playerTotal: number = newPlayerHand.reduce((sum, card) => sum + Math.min(card, 10), 0)
     let bankerTotal: number = newBankerHand.reduce((sum, card) => sum + Math.min(card, 10), 0)

     if (playerTotal > 10) playerTotal -= 10
     if (bankerTotal > 10) bankerTotal -= 10

     const gameResult: 'Player Wins' | 'Banker Wins' | "It's a Tie!" = playerTotal > bankerTotal ? 'Player Wins' : bankerTotal > playerTotal ? 'Banker Wins' : "It's a Tie!"

     if (!Array.isArray(loadMapResult)) {
          loadMapResult = []
     }

     if (loadMapResult.length >= 80) {
          loadMapResult.shift()
     }
     loadMapResult.push(gameResult)

     const newGrid = Array(6)
          .fill(null)
          .map(() => Array(30).fill(''))
     let currentCol = 0
     let currentRow = 0
     let lastResult: 'Player Wins' | 'Banker Wins' | null = null
     let streakCount = 0

     loadMapResult.forEach((result) => {
          // Skip ties for column progression
          if (result === "It's a Tie!") {
               // Place tie marker at current position
               if (currentCol < 30 && currentRow < 6) {
                    newGrid[currentRow][currentCol] = result
               }
               return
          }

          // Check if we need to start a new column
          if (lastResult !== null && result !== lastResult) {
               currentCol++
               currentRow = 0
               streakCount = 0
          }

          // Ensure we don't exceed grid boundaries
          if (currentCol >= 30) return

          // Place the marker
          newGrid[currentRow][currentCol] = result

          // Update tracking variables
          lastResult = result
          streakCount++
          currentRow++

          // If we reach the bottom of a column, move to the next column
          if (currentRow >= 6) {
               currentCol++
               currentRow = 0
          }
     })

     const gameData = {
          playerHand: newPlayerHand,
          bankerHand: newBankerHand,
          result: gameResult,
          bankerTotal,
          playerTotal,
          loadMapResult: [...loadMapResult], // Send raw history
          grid: newGrid, // Send formatted grid
     }

     io.emit('gameUpdate', gameData)
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

               socket.emit('gameUpdate', {
                    playerHand: [],
                    bankerHand: [],
                    result: null,
                    loadMapResult: [],
                    grid: Array(6)
                         .fill(null)
                         .map(() => Array(30).fill('')),
               })

               socket.on('requestGame', () => {
                    generateGameRound(io)
               })

               socket.on('disconnect', () => {
                    console.log('Player disconnected:', socket.id)
               })
          })

          setInterval(() => {
               generateGameRound(io)
          }, 5000)

          res.socket.server.io = io
     }
     res.end()
}

export default ioHandler
