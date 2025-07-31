import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Copy, ExternalLink } from '@phosphor-icons/react'
import { toast } from 'sonner'

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

interface ExportOptionsProps {
  cards: MTGCard[]
  format: 'tcgplayer' | 'cardkingdom'
  setName: string
}

export default function ExportOptions({ cards, format, setName }: ExportOptionsProps) {
  const [generatedList, setGeneratedList] = useState('')
  const [includeCollectorNumber, setIncludeCollectorNumber] = useState(true)
  const [quantities, setQuantities] = useState({
    common: '1',
    uncommon: '1',
    rare: '1',
    mythic: '1'
  })

  const getQuantityForRarity = (rarity: string) => {
    const normalizedRarity = rarity.toLowerCase()
    if (normalizedRarity === 'common') return quantities.common
    if (normalizedRarity === 'uncommon') return quantities.uncommon
    if (normalizedRarity === 'rare') return quantities.rare
    if (normalizedRarity === 'mythic') return quantities.mythic
    // Default to common quantity for other rarities
    return quantities.common
  }

  const generateTCGPlayerList = (cards: MTGCard[], includeCollectorNumber: boolean = true) => {
    // TCGPlayer format: "Quantity Card Name [Set Code] Collector Number" (collector number optional)
    // They require square brackets for set codes
    // For double-faced cards with "//" use only the front face name
    
    return cards
      .map(card => {
        const quantity = getQuantityForRarity(card.rarity)
        // Skip cards with quantity 0
        if (quantity === '0') return null
        
        let cardName = card.name
        // Handle double-faced cards - TCGPlayer typically uses just the front face name
        if (cardName.includes(' // ')) {
          cardName = cardName.split(' // ')[0]
        }
        const baseFormat = `${quantity} ${cardName} [${card.set.toUpperCase()}]`
        return includeCollectorNumber ? `${baseFormat} ${card.collector_number}` : baseFormat
      })
      .filter(line => line !== null)
      .join('\n')
  }

  const generateCardKingdomList = (cards: MTGCard[]) => {
    // Card Kingdom builder format: "Quantity Card Name" per line
    // Simple format that works with their Quick Add feature
    
    return cards
      .map(card => {
        const quantity = getQuantityForRarity(card.rarity)
        // Skip cards with quantity 0
        if (quantity === '0') return null
        
        let cardName = card.name
        // Handle double-faced cards - use only the front face name
        if (cardName.includes(' // ')) {
          cardName = cardName.split(' // ')[0]
        }
        return `${quantity} ${cardName}`
      })
      .filter(line => line !== null)
      .join('\n')
  }

  const generateList = () => {
    let list = ''
    if (format === 'tcgplayer') {
      list = generateTCGPlayerList(cards, includeCollectorNumber)
    } else if (format === 'cardkingdom') {
      list = generateCardKingdomList(cards)
    }
    
    setGeneratedList(list)
    const platformName = format === 'tcgplayer' ? 'TCGPlayer' : 'Card Kingdom'
    
    // Check if all quantities are 0
    const allQuantitiesZero = Object.values(quantities).every(q => q === '0')
    if (allQuantitiesZero) {
      toast.success(`Generated empty ${platformName} list (all quantities set to 0)`)
    } else {
      toast.success(`Generated ${platformName} list with custom quantities per rarity`)
    }
  }

  const copyToClipboard = async () => {
    if (!generatedList) return
    
    try {
      await navigator.clipboard.writeText(generatedList)
      toast.success('List copied to clipboard!')
    } catch (error) {
      // Fallback for older browsers or when clipboard API fails
      try {
        const textArea = document.createElement('textarea')
        textArea.value = generatedList
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast.success('List copied to clipboard!')
      } catch (fallbackError) {
        toast.error('Failed to copy to clipboard. Please copy manually.')
      }
    }
  }

  const downloadFile = () => {
    if (!generatedList) return
    
    const filename = `${setName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format}.txt`
    const blob = new Blob([generatedList], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('File downloaded!')
  }

  const openDirectMassEntry = () => {
    let list = ''
    let url = ''
    
    if (format === 'tcgplayer') {
      list = generateTCGPlayerList(cards, includeCollectorNumber)
      url = 'https://www.tcgplayer.com/massentry'
    } else if (format === 'cardkingdom') {
      list = generateCardKingdomList(cards)
      url = 'https://www.cardkingdom.com/builder'
    }
    
    // Check if all quantities are 0
    const allQuantitiesZero = Object.values(quantities).every(q => q === '0')
    if (allQuantitiesZero) {
      toast.info('All quantities are set to 0 - list will be empty')
      return
    }
    
    // Copy to clipboard with fallback
    const copyList = async () => {
      try {
        await navigator.clipboard.writeText(list)
        toast.success('List copied to clipboard! Paste it on the site that opens.')
      } catch (error) {
        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea')
          textArea.value = list
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          toast.success('List copied to clipboard! Paste it on the site that opens.')
        } catch (fallbackError) {
          toast.error('Failed to copy to clipboard. Please copy manually from the text area below.')
        }
      }
    }
    
    copyList()
    window.open(url, '_blank')
  }

  // Get counts by rarity for display
  const rarityCounts = cards.reduce((acc, card) => {
    const rarity = card.rarity.toLowerCase()
    acc[rarity] = (acc[rarity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const platformInfo = {
    tcgplayer: {
      name: 'TCGPlayer',
      description: includeCollectorNumber 
        ? `Format: "Quantity Card Name [SET] Collector#" per line for TCGPlayer Mass Entry`
        : `Format: "Quantity Card Name [SET]" per line for TCGPlayer Mass Entry`,
      url: 'https://www.tcgplayer.com/massentry',
      instructions: 'Click "Open TCGPlayer Mass Entry" to copy the list and open TCGPlayer\'s Mass Entry tool, then paste the list and add to card. Use TCGPlayer to optimize per your preferences.'
    },
    cardkingdom: {
      name: 'Card Kingdom',
      description: 'Format: "Quantity Card Name" per line for Card Kingdom Builder',
      url: 'https://www.cardkingdom.com/builder',
      instructions: 'Click "Open Card Kingdom Mass Entry" to copy the list and go to their Deck Builder page. Paste the list in the entry and validate.'
    }
  }

  const info = platformInfo[format]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {info.name} Export
              <ExternalLink 
                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                onClick={() => window.open(info.url, '_blank')}
              />
            </CardTitle>
            <CardDescription>{info.description}</CardDescription>
          </div>
          <Badge variant="secondary">
            {cards.length} unique cards (no basic lands)
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="common-quantity" className="text-sm font-medium">
              Common ({rarityCounts.common || 0})
            </Label>
            <Select value={quantities.common} onValueChange={(value) => setQuantities(prev => ({...prev, common: value}))}>
              <SelectTrigger className="w-full" id="common-quantity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="uncommon-quantity" className="text-sm font-medium">
              Uncommon ({rarityCounts.uncommon || 0})
            </Label>
            <Select value={quantities.uncommon} onValueChange={(value) => setQuantities(prev => ({...prev, uncommon: value}))}>
              <SelectTrigger className="w-full" id="uncommon-quantity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="rare-quantity" className="text-sm font-medium">
              Rare ({rarityCounts.rare || 0})
            </Label>
            <Select value={quantities.rare} onValueChange={(value) => setQuantities(prev => ({...prev, rare: value}))}>
              <SelectTrigger className="w-full" id="rare-quantity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="mythic-quantity" className="text-sm font-medium">
              Mythic ({rarityCounts.mythic || 0})
            </Label>
            <Select value={quantities.mythic} onValueChange={(value) => setQuantities(prev => ({...prev, mythic: value}))}>
              <SelectTrigger className="w-full" id="mythic-quantity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {format === 'tcgplayer' && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-collector-number" 
              checked={includeCollectorNumber}
              onCheckedChange={(checked) => setIncludeCollectorNumber(checked as boolean)}
            />
            <Label htmlFor="include-collector-number" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Include collector number
            </Label>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={openDirectMassEntry}
            className="flex items-center gap-2 flex-1"
            size="lg"
          >
            <ExternalLink className="h-4 w-4" />
            Open {info.name} Mass Entry
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={generateList} variant="outline" className="flex-1">
            Generate {info.name} List
          </Button>
        </div>

        {generatedList && (
          <div className="space-y-4">
            <Textarea
              value={generatedList}
              readOnly
              className="min-h-32 font-mono text-sm"
              placeholder="Generated list will appear here..."
            />
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
              
              <Button 
                variant="outline" 
                onClick={downloadFile}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download File
              </Button>
            </div>
            
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Instructions:</strong> {info.instructions}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
