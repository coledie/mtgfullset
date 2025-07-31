# MTG Set Card List Generator

A specialized tool for Magic: The Gathering collectors to download complete card sets from Scryfall API and generate formatted lists for bulk purchasing on TCGPlayer or Card Kingdom.

**Experience Qualities**: 
1. **Efficient** - Streamlined workflow from set selection to formatted output with minimal clicks
2. **Reliable** - Accurate card data fetching with clear progress indicators and error handling
3. **Professional** - Clean interface that feels like a serious collector's tool, not a casual app

**Complexity Level**: Light Application (multiple features with basic state)
- Combines API integration, data processing, and file generation while maintaining focused functionality for MTG collectors

## Essential Features

**Set Selection Interface**
- Functionality: Browse and select MTG sets from Scryfall's complete catalog
- Purpose: Allows users to choose exactly which set they want to purchase
- Trigger: User opens application
- Progression: Load sets list → Browse/search sets → Select target set → Confirm selection
- Success criteria: User can easily find and select any MTG set from the complete catalog

**Card Data Fetching**
- Functionality: Download complete card list for selected set from Scryfall API
- Purpose: Ensures users get every card in the set with accurate names and details
- Trigger: User confirms set selection
- Progression: API call initiated → Progress indicator → Card data processed → Results displayed
- Success criteria: All cards retrieved with proper names, collector numbers, and variants

**Format Generation**
- Functionality: Generate properly formatted mass entry lists for TCGPlayer and Card Kingdom
- Purpose: Enables bulk purchasing without manual entry of hundreds of card names
- Trigger: User selects desired platform after card data is loaded
- Progression: Choose platform → Process card data → Generate formatted list → Display/download results
- Success criteria: Generated lists work perfectly in target platform's mass entry systems

**Export Options**
- Functionality: Copy to clipboard or download as text file
- Purpose: Flexible options for getting the list into purchasing platforms
- Trigger: User completes format generation
- Progression: Format selected → Choose export method → Copy/download → Confirmation
- Success criteria: Lists can be immediately pasted into TCGPlayer/Card Kingdom mass entry

## Edge Case Handling

- **API Failures**: Retry mechanism with clear error messages and manual refresh option
- **Large Sets**: Progress indicators and potential chunking for sets with 400+ cards
- **Missing Card Data**: Skip problematic cards with notification rather than failing entirely
- **Network Issues**: Graceful degradation with offline retry capabilities
- **Invalid Set Selection**: Clear validation and helpful error messages

## Design Direction

The design should feel professional and utilitarian - like a serious collector's tool rather than a game. Clean, data-focused interface with excellent typography for card names and clear visual hierarchy for the multi-step process.

## Color Selection

Triadic color scheme using MTG's traditional colors to feel familiar to players while maintaining professional appearance.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 240)) - Communicates trust and reliability, reminiscent of MTG blue mana
- **Secondary Colors**: Warm Gray (oklch(0.85 0.02 60)) for backgrounds and Steel Blue (oklch(0.65 0.08 220)) for secondary actions
- **Accent Color**: Warm Orange (oklch(0.75 0.15 45)) for call-to-action buttons and progress indicators
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 16.8:1 ✓
  - Card (Light Gray oklch(0.97 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 15.8:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 240)): White text (oklch(1 0 0)) - Ratio 7.2:1 ✓
  - Accent (Warm Orange oklch(0.75 0.15 45)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓

## Font Selection

Typography should prioritize excellent readability for card names and data while feeling modern and professional.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Card Set Names): Inter Medium/18px/normal spacing
  - Body (Card Names): Inter Regular/16px/relaxed spacing for scanning
  - Caption (Metadata): Inter Regular/14px/tight spacing

## Animations

Subtle and functional animations that communicate progress and state changes without distracting from the data-focused workflow.

- **Purposeful Meaning**: Loading states and progress indicators should feel reliable and informative, button interactions should provide satisfying feedback
- **Hierarchy of Movement**: Progress bars and data loading get primary animation focus, secondary interactions use subtle hover/press states

## Component Selection

- **Components**: Cards for set display, Select dropdowns for filtering, Progress bars for API calls, Buttons for actions, Tabs for TCGPlayer/Card Kingdom switching
- **Customizations**: Custom progress component for API fetching, specialized card list display component
- **States**: Loading states for API calls, success/error states for operations, disabled states during processing
- **Icon Selection**: Download icons for export, external link icons for platform links, search icons for filtering
- **Spacing**: Consistent 4-unit (16px) spacing for major sections, 2-unit (8px) for related elements
- **Mobile**: Stack layout on mobile with simplified set selection, maintain full functionality with touch-friendly targets