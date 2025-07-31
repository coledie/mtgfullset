import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Download, Copy, ExternalLink } from '@phosphor-icons/react'
import { toast } from 'sonner'
import SetSelector from '@/components/SetSelector'
import CardList from '@/components/CardList'
import ExportOptions from '@/components/ExportOptions'

interface MTGSet {
  id: string
  code: string
  name: string
  released_at: string
  card_count: number
  set_type: string
}

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

export default function App() {
  const [selectedSet, setSelectedSet] = useKV<MTGSet | null>('selected-set', null)
  const [cards, setCards] = useKV<MTGCard[]>('set-cards', [])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState<'select' | 'loading' | 'export'>('select')
  const [actualCardCount, setActualCardCount] = useState<number | null>(null)

  const fetchSetCards = async (set: MTGSet) => {
    setLoading(true)
    setProgress(0)
    setStep('loading')
    
    try {
      const response = await fetch(`https://api.scryfall.com/cards/search?q=set:${set.code}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch cards')
      }
      
      let data = await response.json()
      let allCards: MTGCard[] = data.data || []
      setProgress(25)
      
      // Continue fetching pages while there are more
      while (data.has_more && data.next_page) {
        const nextResponse = await fetch(data.next_page)
        data = await nextResponse.json() // Update data variable to check has_more in next iteration
        allCards = [...allCards, ...data.data]
        
        // Calculate progress more conservatively since we'll filter cards
        const baseProgress = 25 + (allCards.length / (set.card_count * 1.2)) * 60
        setProgress(Math.min(baseProgress, 85))
      }
      
      // Filter out basic lands, masterpiece, and promo cards, and ensure unique cards only
      const basicLands = ['island', 'mountain', 'plains', 'forest', 'swamp', 'wastes']
      const uniqueCards = new Map<string, MTGCard>()
      
      allCards.forEach(card => {
        const cardName = card.name.toLowerCase()
        
        // Skip basic lands
        if (basicLands.includes(cardName)) {
          return
        }
        
        // Skip masterpiece cards (often have special frame effects or are from masterpiece series)
        if (cardName.includes('masterpiece') || cardName.includes('invention') || cardName.includes('invocation')) {
          return
        }
        
        // Skip promo cards (often marked with special collector numbers or have 'promo' in set data)
        if (card.collector_number && (card.collector_number.includes('p') || card.collector_number.includes('★'))) {
          return
        }
        
        // Keep only one of each unique card name
        if (!uniqueCards.has(card.name)) {
          uniqueCards.set(card.name, card)
        }
      })
      
      const filteredCards = Array.from(uniqueCards.values())
      setCards(filteredCards)
      setActualCardCount(filteredCards.length)
      setProgress(100)
      setTimeout(() => {
        setStep('export')
        setLoading(false)
      }, 500)
      
      toast.success(`Loaded ${filteredCards.length} unique cards from ${set.name} (filtered from ${allCards.length} total cards)`)
    } catch (error) {
      toast.error('Failed to fetch card data. Please try again.')
      setLoading(false)
      setStep('select')
    }
  }

  const handleSetSelect = (set: MTGSet) => {
    setSelectedSet(set)
    fetchSetCards(set)
  }

  const handleReset = () => {
    setSelectedSet(null)
    setCards([])
    setStep('select')
    setProgress(0)
    setActualCardCount(null)
  }

  return (
    <div className="min-h-screen bg-background font-['Inter']">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            MTG Set Card List Generator
          </h1>
          <p className="text-muted-foreground">
            Generate mass entry lists for TCGPlayer and Card Kingdom from any MTG set.
          </p>
        </div>

        {step === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Magic: The Gathering Set</CardTitle>
              <CardDescription>
                Choose any MTG set to download its complete card list for bulk purchasing (unique cards only, no basic lands)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SetSelector onSetSelect={handleSetSelect} />
            </CardContent>
          </Card>
        )}

        {step === 'loading' && selectedSet && (
          <Card>
            <CardHeader>
              <CardTitle>Fetching Cards from {selectedSet.name}</CardTitle>
              <CardDescription>
                Downloading complete card list from Scryfall API...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Progress: {progress}%</span>
                <div className="flex gap-2">
                  {actualCardCount && (
                    <Badge variant="default">
                      Actual: {actualCardCount} cards
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    Expected: {selectedSet.card_count} cards
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'export' && selectedSet && cards.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedSet.name}</CardTitle>
                    <CardDescription>
                      {cards.length} cards loaded • Released {selectedSet.released_at}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleReset}>
                    Select Different Set
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <CardList cards={cards} />

            <Tabs defaultValue="tcgplayer" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tcgplayer">TCGPlayer</TabsTrigger>
                <TabsTrigger value="cardkingdom">Card Kingdom</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tcgplayer">
                <ExportOptions 
                  cards={cards} 
                  format="tcgplayer"
                  setName={selectedSet.name}
                />
              </TabsContent>
              
              <TabsContent value="cardkingdom">
                <ExportOptions 
                  cards={cards} 
                  format="cardkingdom"
                  setName={selectedSet.name}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
