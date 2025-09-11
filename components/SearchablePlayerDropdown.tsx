'use client'

import { useState, useEffect, useRef } from 'react'

interface Player {
  id: string
  firstName: string
  nickname: string
  lastInitial: string
}

interface SearchablePlayerDropdownProps {
  players: Player[]
  selectedPlayerId: string
  onPlayerSelect: (playerId: string) => void
  label: string
  placeholder: string
  required?: boolean
  helpText?: string
}

export default function SearchablePlayerDropdown({
  players,
  selectedPlayerId,
  onPlayerSelect,
  label,
  placeholder,
  required = false,
  helpText
}: SearchablePlayerDropdownProps) {
  const [playerSearch, setPlayerSearch] = useState('')
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update display text when selected player changes
  useEffect(() => {
    if (selectedPlayerId) {
      const selectedPlayer = players.find(p => p.id === selectedPlayerId)
      if (selectedPlayer) {
        setPlayerSearch(`${selectedPlayer.firstName} "${selectedPlayer.nickname}" ${selectedPlayer.lastInitial}`)
      }
    } else {
      setPlayerSearch('')
    }
  }, [selectedPlayerId, players])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPlayerDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter players for search
  const filteredPlayers = players.filter(player => {
    if (!playerSearch.trim()) return true
    const searchLower = playerSearch.toLowerCase().trim()
    return (
      player.firstName.toLowerCase().includes(searchLower) ||
      player.nickname.toLowerCase().includes(searchLower) ||
      player.lastInitial.toLowerCase().includes(searchLower)
    )
  })

  const handlePlayerSelect = (player: Player) => {
    onPlayerSelect(player.id)
    setPlayerSearch(`${player.firstName} "${player.nickname}" ${player.lastInitial}`)
    setShowPlayerDropdown(false)
  }

  return (
    <div>
      <label htmlFor="player-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && '*'}
      </label>
      <div className="mt-1 relative" ref={dropdownRef}>
        <input
          type="text"
          id="player-search"
          value={playerSearch}
          onChange={(e) => {
            setPlayerSearch(e.target.value)
            setShowPlayerDropdown(true)
            if (!e.target.value) {
              onPlayerSelect('')
            }
          }}
          onFocus={() => setShowPlayerDropdown(true)}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder={placeholder}
          required={required}
        />
        
        {/* Dropdown */}
        {showPlayerDropdown && players.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {filteredPlayers.slice(0, 10).map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => handlePlayerSelect(player)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              >
                {player.firstName} <span className="font-syne-tactile italic">&quot;{player.nickname}&quot;</span> {player.lastInitial}
              </button>
            ))}
            {filteredPlayers.length === 0 && playerSearch.trim() && (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                No players found matching &quot;{playerSearch}&quot;
              </div>
            )}
          </div>
        )}
      </div>
      {helpText && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  )
}