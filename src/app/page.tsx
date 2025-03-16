'use client'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { Card } from '@/components/ui/card'

type GameData = {
     playerHand: number[]
     bankerHand: number[]
     playerTotal: number
     bankerTotal: number
     result: string
     loadMapResult: ('Player Wins' | 'Banker Wins' | "It's a Tie!")[]
     grid: string[][]
}

export default function Home() {
     const [decision, setDecision] = useState<string | null>(null)
     const [gameHistory, setGameHistory] = useState<Array<{ result: string; playerTotal: number; bankerTotal: number }>>([])
     const [playerHand, setPlayerHand] = useState<number[]>([])
     const [bankerHand, setBankerHand] = useState<number[]>([])
     const [playerCardTotal, setPlayerCardTotal] = useState(0)
     const [bankerCardTotal, setBankerCardTotal] = useState(0)
     const [result, setResult] = useState<string | null>(null)
     const [socket, setSocket] = useState<Socket | null>(null)
     const [grid, setGrid] = useState<Array<Array<string>>>(
          Array(6)
               .fill(null)
               .map(() => Array(30).fill(''))
     )

     useEffect(() => {
          if (typeof window === 'undefined') return // Prevent SSR issues

          const newSocket = io({ path: '/api/socket' })
          setSocket(newSocket)

          const gameUpdateHandler = (gameData: GameData) => {
               setPlayerCardTotal(gameData.playerTotal)
               setBankerCardTotal(gameData.bankerTotal)

               setPlayerHand(gameData.playerHand)
               setBankerHand(gameData.bankerHand)
               setResult(gameData.result)

               if (gameData.result === decision) {
                    // transfer or deduct
               }
               console.log('grid: ', gameData.grid)
               if (gameData.grid) {
                    setGrid(gameData.grid)
               }

               setGameHistory((prevHistory) => [{ result: gameData.result, playerTotal: gameData.playerTotal, bankerTotal: gameData.bankerTotal }, ...prevHistory.slice(0, 19)])
          }
          newSocket.on('gameUpdate', gameUpdateHandler)

          return () => {
               newSocket.off('gameUpdate', gameUpdateHandler)
               newSocket.disconnect()
          }
     }, [])

     const playGame = () => {
          if (!socket) return
          socket.emit('requestGame')
     }

     function convertCard(card: number) {
          switch (card) {
               case 11:
                    return 'J'
               case 12:
                    return 'Q'
               case 13:
                    return 'K'
               default:
                    return card
          }
     }

     return (
          <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b ">
               <main className="flex flex-col items-center w-full max-w-md">
                    <h1 className="text-4xl font-bold text-white mb-8">Banker Player</h1>
                    <Card className="w-full p-6 mb-6">
                         <div className="grid grid-cols-2 gap-6">
                              <div className="flex flex-col items-center">
                                   <h2 className="text-xl font-semibold mb-2">PLAYER</h2>
                                   <div className="flex gap-2 h-20 items-center">
                                        {playerHand.length > 0 ? (
                                             playerHand.map((card, index) => (
                                                  <div key={index} className="flex items-center justify-center w-12 h-16 bg-white border-2 border-gray-300 rounded-md shadow-md">
                                                       <span className="text-xl font-bold">{convertCard(card)}</span>
                                                  </div>
                                             ))
                                        ) : (
                                             <div className="text-gray-400">No cards</div>
                                        )}
                                   </div>
                              </div>
                              <div className="flex flex-col items-center">
                                   <h2 className="text-xl font-semibold mb-2">BANKER</h2>
                                   <div className="flex gap-2 h-20 items-center">
                                        {bankerHand.length > 0 ? (
                                             bankerHand.map((card, index) => (
                                                  <div key={index} className="flex items-center justify-center w-12 h-16 bg-white border-2 border-gray-300 rounded-md shadow-md">
                                                       <span className="text-xl font-bold">{convertCard(card)}</span>
                                                  </div>
                                             ))
                                        ) : (
                                             <div className="text-gray-400">No cards</div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         <div className="flex justify-center mb-4">
                              <div className="flex flex-col items-center">
                                   {result && (
                                        <span className="mt-4 text-xl font-semibold text-center">
                                             {playerCardTotal} - {bankerCardTotal}
                                        </span>
                                   )}
                                   <strong className="text-xl font-semibold text-center">{result}</strong>
                              </div>
                         </div>

                         <div className="flex ... gap-4">
                              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={() => setDecision('Player Wins!')}>
                                   PLAYER
                              </button>
                              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={() => setDecision('Banker Wins!')}>
                                   BANK
                              </button>
                         </div>

                         {/* <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={playGame}>
                              Reveal Winner
                         </button> */}
                    </Card>

                    {gameHistory.length > 0 && (
                         <Card className="w-full p-6">
                              <h2 className="text-xl font-semibold mb-4">Game History</h2>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                   {gameHistory.map(
                                        (game, index) =>
                                             game.result && (
                                                  <div
                                                       key={index}
                                                       className={`p-2 rounded-md ${game.result === 'Player Wins' ? 'bg-green-100' : game.result === 'Banker Wins' ? 'bg-red-100' : 'bg-orange-100'}`}
                                                  >
                                                       <span>{game.result}</span>
                                                       <span className="ml-2 font-semibold">
                                                            Player {game.playerTotal} - Banker {game.bankerTotal}
                                                       </span>
                                                  </div>
                                             )
                                   )}
                              </div>
                         </Card>
                    )}

                    <Card className="w-full p-6">
                         <h2 className="text-xl font-semibold mb-4">Road Map</h2>
                         <div className="overflow-x-auto">
                              <div className="bg-black p-2 min-w-[600px]">
                                   <div className="grid grid-rows-6 gap-1" style={{ display: 'grid', gridTemplateRows: 'repeat(6, 1fr)', gridAutoFlow: 'column' }}>
                                        {Array(6)
                                             .fill(null)
                                             .map((_, rowIndex) => (
                                                  <div key={rowIndex} className="flex">
                                                       {Array(30)
                                                            .fill(null)
                                                            .map((_, colIndex) => {
                                                                 const cellValue = grid[rowIndex]?.[colIndex] || ''
                                                                 return (
                                                                      <div key={`${rowIndex}-${colIndex}`} className="w-6 h-6 flex items-center justify-center">
                                                                           {cellValue === 'Player Wins' && (
                                                                                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-blue-800 flex items-center justify-center">
                                                                                     <div className="w-1 h-1 rounded-full bg-blue-300"></div>
                                                                                </div>
                                                                           )}
                                                                           {cellValue === 'Banker Wins' && (
                                                                                <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-red-800 flex items-center justify-center">
                                                                                     <div className="w-1 h-1 rounded-full bg-red-300"></div>
                                                                                </div>
                                                                           )}
                                                                           {cellValue === "It's a Tie!" && (
                                                                                <div className="w-5 h-5 rounded-full bg-green-600 border-2 border-green-800 flex items-center justify-center">
                                                                                     <div className="w-1 h-1 rounded-full bg-green-300"></div>
                                                                                </div>
                                                                           )}
                                                                      </div>
                                                                 )
                                                            })}
                                                  </div>
                                             ))}
                                   </div>
                              </div>
                         </div>
                    </Card>
               </main>
               <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
          </div>
     )
}
