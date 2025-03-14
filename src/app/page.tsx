'use client'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { Card } from '@/components/ui/card'

type GameData = {
     playerHand: number[]
     bankerHand: number[]
     result: string
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

     useEffect(() => {
          if (typeof window === 'undefined') return // Prevent SSR issues

          const newSocket = io({ path: '/api/socket' })
          setSocket(newSocket)

          const gameUpdateHandler = (gameData: GameData) => {
               let playerTotal: number = gameData.playerHand.reduce((sum, card) => sum + Math.min(card, 10), 0)
               let bankerTotal: number = gameData.bankerHand.reduce((sum, card) => sum + Math.min(card, 10), 0)

               if (playerTotal > 10) {
                    playerTotal = playerTotal - 10
               }

               if (bankerTotal > 10) {
                    bankerTotal = bankerTotal - 10
               }

               setPlayerCardTotal(playerTotal)
               setBankerCardTotal(bankerTotal)

               setPlayerHand(gameData.playerHand)
               setBankerHand(gameData.bankerHand)
               setResult(gameData.result)

               setGameHistory((prevHistory) => [{ result: gameData.result, playerTotal, bankerTotal }, ...prevHistory.slice(0, 19)])
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
                              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">PLAYER</button>
                              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">BANK</button>
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
                                                  <div key={index} className="p-2 rounded-md">
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
               </main>
               <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
          </div>
     )
}
