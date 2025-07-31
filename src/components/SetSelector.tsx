import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Calendar, Hash } from '@phosphor-icons/react'

interface MTGSet {
  id: string
  code: string
  name: string
  released_at: string
  card_count: number
  set_type: string
}

interface SetSelectorProps {
  onSetSelect: (set: MTGSet) => void
}

export default function SetSelector({ onSetSelect }: SetSelectorProps) {
  const [allSets, setAllSets] = useState<MTGSet[]>([]) // Store all sets unfiltered
  const [sets, setSets] = useState<MTGSet[]>([]) // Store filtered sets for default display
  const [filteredSets, setFilteredSets] = useState<MTGSet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch('https://api.scryfall.com/sets')
        const data = await response.json()
        
        // Store all sets
        const allSetsData = data.data
          .filter((set: MTGSet) => set.card_count > 0)
          .sort((a: MTGSet, b: MTGSet) => 
            new Date(b.released_at).getTime() - new Date(a.released_at).getTime()
          )
        setAllSets(allSetsData)
        
        // Create default filtered sets (excluding art series, masterpiece, promo, box sets, and small sets)
        const validSets = allSetsData.filter((set: MTGSet) => {
          const setNameLower = set.name.toLowerCase()
          
          // Filter out sets with 10 or fewer cards
          if (set.card_count <= 10) {
            return false
          }
          
          // Filter out art series and memorabilia
          if (set.set_type === 'memorabilia' || setNameLower.includes('art series')) {
            return false
          }
          
          // Filter out masterpiece series and special releases
          if (setNameLower.includes('masterpiece') || setNameLower.includes('invention') || 
              setNameLower.includes('invocation') || setNameLower.includes('expedition') ||
              setNameLower.includes('showcase') || setNameLower.includes('timeshifted') ||
              setNameLower.includes('mythic edition') || setNameLower.includes('special guest') ||
              setNameLower.includes('list') || setNameLower.includes('secret lair') ||
              set.set_type === 'masterpiece') {
            return false
          }
          
          // Filter out promo sets
          if (set.set_type === 'promo' || setNameLower.includes('promo')) {
            return false
          }
          
          // Filter out box sets and special compilations
          if (set.set_type === 'box' || setNameLower.includes('box') || 
              setNameLower.includes('anthology') || setNameLower.includes('collection') ||
              setNameLower.includes('premium deck') || setNameLower.includes('from the vault')) {
            return false
          }
          
          return true
        })
        
        setSets(validSets)
        setFilteredSets(validSets)
      } catch (error) {
        console.error('Failed to fetch sets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSets()
  }, [])

  useEffect(() => {
    const searchLower = searchQuery.toLowerCase()
    
    // Determine which set pool to search from
    const searchPool = (searchLower.includes('art') || searchLower.includes('masterpiece') || 
                       searchLower.includes('promo') || searchLower.includes('box')) ? allSets : sets
    
    const filtered = searchPool.filter(set => {
      const matchesSearch = set.name.toLowerCase().includes(searchLower) ||
        set.code.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
      
      // If searching in allSets (because special keywords were in query), still apply basic filters
      if (searchLower.includes('art') || searchLower.includes('masterpiece') || 
          searchLower.includes('promo') || searchLower.includes('box')) {
        const setNameLower = set.name.toLowerCase()
        
        // Always filter out sets with 10 or fewer cards
        if (set.card_count <= 10) {
          return false
        }
        
        // Only filter out other special sets if not specifically searching for them
        if (!searchLower.includes('masterpiece') && !searchLower.includes('promo') && 
            !searchLower.includes('art') && !searchLower.includes('box')) {
          if (setNameLower.includes('masterpiece') || setNameLower.includes('invention') || 
              setNameLower.includes('invocation') || setNameLower.includes('expedition') ||
              setNameLower.includes('showcase') || setNameLower.includes('timeshifted') ||
              setNameLower.includes('mythic edition') || setNameLower.includes('special guest') ||
              setNameLower.includes('list') || setNameLower.includes('secret lair') ||
              set.set_type === 'masterpiece' || set.set_type === 'promo' || setNameLower.includes('promo') || 
              set.set_type === 'memorabilia' || setNameLower.includes('art series') ||
              set.set_type === 'box' || setNameLower.includes('box') ||
              setNameLower.includes('anthology') || setNameLower.includes('collection') ||
              setNameLower.includes('premium deck') || setNameLower.includes('from the vault')) {
            return false
          }
        }
      }
      
      return true
    })
    
    setFilteredSets(filtered)
  }, [searchQuery, sets, allSets])

  const getSetTypeColor = (setType: string) => {
    switch (setType) {
      case 'core': return 'bg-blue-100 text-blue-800'
      case 'expansion': return 'bg-green-100 text-green-800'
      case 'masters': return 'bg-purple-100 text-purple-800'
      case 'draft_innovation': return 'bg-orange-100 text-orange-800'
      case 'commander': return 'bg-red-100 text-red-800'
      case 'memorabilia': return 'bg-pink-100 text-pink-800'
      case 'promo': return 'bg-yellow-100 text-yellow-800'
      case 'box': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading MTG sets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sets by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-96 w-full rounded-md border">
        <div className="p-4 space-y-2">
          {filteredSets.map((set) => (
            <Card 
              key={set.id} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSetSelect(set)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{set.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {set.code.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(set.released_at).getFullYear()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {set.card_count} cards
                      </div>
                    </div>
                  </div>
                  
                  <Badge 
                    className={`text-xs ${getSetTypeColor(set.set_type)}`}
                    variant="secondary"
                  >
                    {set.set_type.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredSets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sets found matching "{searchQuery}"
            </div>
          )}
        </div>
      </ScrollArea>
      
      <p className="text-xs text-muted-foreground text-center">
        Showing {filteredSets.length} of {(searchQuery.toLowerCase().includes('art') || searchQuery.toLowerCase().includes('masterpiece') || searchQuery.toLowerCase().includes('promo') || searchQuery.toLowerCase().includes('box')) ? allSets.length : sets.length} available sets
        {(searchQuery.toLowerCase().includes('art') || searchQuery.toLowerCase().includes('masterpiece') || searchQuery.toLowerCase().includes('promo') || searchQuery.toLowerCase().includes('box')) && (
          <span className="ml-2 text-accent">• Including special series in search</span>
        )}
      </p>
    </div>
  )
}
