'use client'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type GameData = {
     playerHand: number[]
     bankerHand: number[]
     result: string
}

export default function Home() {
     const [playerHand, setPlayerHand] = useState<number[]>([])
     const [bankerHand, setBankerHand] = useState<number[]>([])
     const [result, setResult] = useState<string | null>(null)
     const [socket, setSocket] = useState<Socket | null>(null)

     useEffect(() => {
          if (typeof window === 'undefined') return // Prevent SSR issues

          const newSocket = io({ path: '/api/socket' })
          setSocket(newSocket)

          const gameUpdateHandler = (gameData: GameData) => {
               setPlayerHand(gameData.playerHand)
               setBankerHand(gameData.bankerHand)
               setResult(gameData.result)
          }

          newSocket.on('gameUpdate', gameUpdateHandler)

          return () => {
               newSocket.off('gameUpdate', gameUpdateHandler)
               newSocket.disconnect()
          }
     }, [])

     const playGame = () => {
          if (!socket) return
          socket.emit('requestGame') // Request game from the server
     }

     return (
          <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
               <main className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold">Multiplayer Baccarat Game</h1>
                    <p className="mt-4">Player Hand: {playerHand.join(', ')}</p>
                    <p>Banker Hand: {bankerHand.join(', ')}</p>
                    {result && <h2 className="mt-4 text-xl font-semibold">{result}</h2>}
                    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={playGame}>
                         Reveal Winner
                    </button>
               </main>
               <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
          </div>
     )
}
