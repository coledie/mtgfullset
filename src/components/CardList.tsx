import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Search } from '@phosphor-icons/react'

interface MTGCard {
  id: string
  name: string
  collector_number: string
  set: string
  rarity: string
  prices?: {
    usd?: string
  }
}

interface CardListProps {
  cards: MTGCard[]
}

export default function CardList({ cards }: CardListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Sort cards by collector number (handle both numeric and alphanumeric)
  const sortByCollectorNumber = (a: MTGCard, b: MTGCard) => {
    const aNum = parseInt(a.collector_number) || 0
    const bNum = parseInt(b.collector_number) || 0
    
    // If both are numeric, sort numerically
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum
    }
    
    // Otherwise, sort alphabetically
    return a.collector_number.localeCompare(b.collector_number)
  }

  const sortedCards = [...cards].sort(sortByCollectorNumber)
  
  const filteredCards = sortedCards.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800'
      case 'uncommon': return 'bg-blue-100 text-blue-800'  
      case 'rare': return 'bg-yellow-100 text-yellow-800'
      case 'mythic': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const rarityStats = cards.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Define rarity order: common, uncommon, rare, mythic, then everything else
  const rarityOrder = ['common', 'uncommon', 'rare', 'mythic']
  const orderedRarityStats = Object.entries(rarityStats).sort(([a], [b]) => {
    const aIndex = rarityOrder.indexOf(a)
    const bIndex = rarityOrder.indexOf(b)
    
    // If both rarities are in the defined order, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    
    // If only one is in the defined order, it comes first
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    // If neither is in the defined order, sort alphabetically
    return a.localeCompare(b)
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Card List Preview</CardTitle>
          <div className="flex gap-2">
            {orderedRarityStats.map(([rarity, count]) => (
              <Badge key={rarity} className={getRarityColor(rarity)} variant="secondary">
                {count} {rarity}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-64 w-full rounded-md border">
          <div className="p-4 space-y-1">
            {filteredCards.map((card) => (
              <div 
                key={card.id}
                className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground w-8">
                    #{card.collector_number}
                  </span>
                  <span className="text-sm">{card.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {card.prices?.usd && (
                    <span className="text-xs text-muted-foreground">
                      ${card.prices.usd}
                    </span>
                  )}
                  <Badge 
                    className={`text-xs ${getRarityColor(card.rarity)}`}
                    variant="secondary"
                  >
                    {card.rarity[0].toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
            
            {filteredCards.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                No cards found matching "{searchQuery}"
              </div>
            )}
          </div>
        </ScrollArea>
        
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredCards.length} of {cards.length} unique cards (basic lands excluded)
        </p>
      </CardContent>
    </Card>
  )
}