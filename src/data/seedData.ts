import { Story, Chapter, Review, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'user-current',
  email: 'tola@storynest.africa',
  username: 'toladaniels',
  displayName: 'Tola Daniels',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  bio: 'Afrofuturism enthusiast, speculative fiction binge-reader, and aspiring serial fiction writer in Lagos.',
  roles: ['reader', 'writer'],
  isVerifiedWriter: true,
  followingIds: ['auth-1', 'auth-2'],
  libraryStoryIds: ['story-1', 'story-3'],
  walletBalanceNGN: 1500,
  bankAccount: {
    bankName: 'Access Bank',
    accountNumber: '0124894920',
    accountName: 'Tola Daniels',
  },
  createdAt: Date.now() - 90 * 86400000,
};

export const SEED_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'The Lagos Alchemist',
    tagline: 'When ancient Yoruba spirits clash with high-speed tech monopolies in 2050.',
    synopsis: 'In the sprawling megacity of Neo-Lagos, Adeola is a junior neural technician who stumbles across an ancient bronze artifact that decodes genetic memories of pre-colonial orishas. When corporate mercenaries come knocking at her Eko Sky-Hub laboratory, her only choice is to awaken a magic thought extinct for centuries.',
    authorId: 'auth-1',
    authorName: 'Folake Adeleke',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    genres: ['Sci-Fi', 'Fantasy', 'Action'],
    tags: ['Afrofuturism', 'Yoruba Mythology', 'Cyberpunk', 'Lagos', 'High Stakes'],
    status: 'ongoing',
    contentWarnings: ['violence'],
    totalWords: 34500,
    chapterCount: 4,
    viewsCount: 14200,
    ratingAverage: 4.9,
    ratingCount: 184,
    isFeatured: true,
    isTrending: true,
    createdAt: Date.now() - 45 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'story-2',
    title: 'Whispers of the Sahel',
    tagline: 'A nomad girl, an exiled prince, and the sandstorms that swallow empires.',
    synopsis: 'Traversing the edge of the expanding Sahara, Amina discovers an emerald oasis guarded by subterranean sand-drakes. The wounded prince she rescues owes his royal crown to the very conspirators plotting her family’s demise in the capital.',
    authorId: 'auth-2',
    authorName: 'Tariq Al-Mansoor',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    genres: ['Adventure', 'Fantasy', 'Romance'],
    tags: ['Sahelian Empire', 'Dragons', 'Desert', 'Nomads', 'Royalty'],
    status: 'ongoing',
    contentWarnings: ['none'],
    totalWords: 21800,
    chapterCount: 3,
    viewsCount: 9400,
    ratingAverage: 4.8,
    ratingCount: 92,
    isTrending: true,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'story-3',
    title: 'Code of the Red Dust',
    tagline: 'A rural prodigy versus the international cyber syndicate.',
    synopsis: 'From a dusty cybercafé in Enugu, Obioma unmasks a billion-dollar offshore banking fraud engineered through fake agricultural loans. What begins as an ethical hack becomes a lethal cat-and-mouse hunt across West African financial nodes.',
    authorId: 'auth-3',
    authorName: 'Chidi Okonkwo',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    genres: ['Thriller', 'Mystery'],
    tags: ['Hacking', 'Enugu', 'Fintech', 'Suspense', 'Underdog'],
    status: 'completed',
    contentWarnings: ['strong_language'],
    totalWords: 48000,
    chapterCount: 6,
    viewsCount: 18200,
    ratingAverage: 4.7,
    ratingCount: 141,
    isNewAndUnderrated: true,
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'story-4',
    title: 'Song of the River Goddess',
    tagline: 'Echoes of the sacred Niger that can either drown a dynasty or crown a healer.',
    synopsis: 'When toxic runoff from an illegal offshore refinery pollutes the delta creeks, ancient aquatic deities wake up thirsty for retribution. Ebi, an apprentice herbalist with the mark of the water-serpent, must choose between avenging her village or saving humanity from tidal fury.',
    authorId: 'auth-4',
    authorName: 'Nneka Okafor',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    genres: ['Fantasy', 'Mystery', 'Drama'],
    tags: ['Niger Delta', 'Folklore', 'Ecology', 'Spirits'],
    status: 'ongoing',
    contentWarnings: ['mature_themes'],
    totalWords: 19500,
    chapterCount: 3,
    viewsCount: 6200,
    ratingAverage: 4.85,
    ratingCount: 68,
    isNewAndUnderrated: true,
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'story-5',
    title: 'Neon Nairobi Nights',
    tagline: 'Electric matatus, synthetic memories, and a detective with nothing to lose.',
    synopsis: 'Private investigator Kimani specializes in retrieving lost neural backups along the neon-lit corridors of Upper Hill. When a silicon mogul’s daughter goes missing along with the source code for East Africa’s unified biometric grid, Kimani is dragged into a conspiracy running all the way to the Great Rift Valley.',
    authorId: 'auth-5',
    authorName: 'Mwangi Kamau',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    genres: ['Sci-Fi', 'Thriller', 'Mystery'],
    tags: ['Nairobi', 'Cyberpunk', 'Matatu Culture', 'Investigation'],
    status: 'ongoing',
    contentWarnings: ['violence', 'strong_language'],
    totalWords: 27400,
    chapterCount: 4,
    viewsCount: 11500,
    ratingAverage: 4.65,
    ratingCount: 88,
    isTrending: false,
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  },
];

export const SEED_CHAPTERS: Chapter[] = [
  // Chapters for The Lagos Alchemist
  {
    id: 'ch-1',
    storyId: 'story-1',
    chapterNumber: 1,
    title: 'The Third Mainland Pulse',
    excerpt: 'The magnetic rails humming along the lagoon gave no warning before the pulse hit.',
    content: `The magnetic rails humming along the Third Mainland Lagoon gave no warning before the atmospheric pulse hit. Adeola tightened her grip on her diagnostics kit, her knuckles whitening beneath her cyber-weave gloves.

From the 40th floor of the Lekki Sky-Hub, the sunset painted Lagos in shades of molten amber and electric indigo. Below, autonomous water-barges glided through the waterways, oblivious to the spectral harmonics vibrating in the deep marine fibre cables.

"You're seeing the baseline drift again, aren't you?" murmured Kemi through her ear-link.

"It’s not drift," Adeola whispered. "The code has a heartbeat."

When she pressed her interface probe onto the core terminal, the bronze pendant hidden under her jumpsuit burned hot against her collarbone. Across her retinal heads-up display, lines of ancient Nsibidi script cascaded over the modern quantum algorithms. The system wasn't malfunctioning; it was remembering.

She stepped back, watching the amber waves ripple through the glass deck. For decades, the tech monopolies claimed they engineered the energy grid from clean synthetic fusion. But as the bronze talisman pulsed against her chest in rhythm with the oceanic tide, Adeola realized the horrifying truth: the city was running on trapped ancestral spirits. And the containment seals were beginning to fracture.`,
    wordCount: 1420,
    isPremium: false,
    priceNGN: 0,
    publishedAt: Date.now() - 45 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 45 * 86400000,
  },
  {
    id: 'ch-2',
    storyId: 'story-1',
    chapterNumber: 2,
    title: 'Echoes in the Copper Wire',
    excerpt: 'Nsibidi symbols do not belong in quantum neural nets. Yet there they were.',
    content: `Adeola spent forty minutes running hash validations, but the result never shifted. The bronze pendant she inherited from her grandmother in Osogbo was vibrating at exactly 432 Hertz.

"If the corporate security drones pick up this telemetry," Kemi warned, "they won't ask questions. They'll scrap the deck and liquidate everyone inside the wing."

Adeola didn't flinch. She severed the uplink to the external server, routing the entire feed directly through her custom rig. A holographic projection blossomed into the dim room—a lion composed of radiant green light, roaring in absolute digital silence.

"That's Ogun's sigil," Kemi gasped, her voice trembling through the earpiece. "Adeola, disconnect right now! That's pre-industrial military metallurgy!"

"I can't," Adeola whispered. The green light was sinking into her fingertips, weaving into her subdermal biometric veins. "He wants out."`,
    wordCount: 1380,
    isPremium: false,
    priceNGN: 0,
    publishedAt: Date.now() - 35 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 35 * 86400000,
  },
  {
    id: 'ch-3',
    storyId: 'story-1',
    chapterNumber: 3,
    title: 'The Iron Shrine Awakening',
    excerpt: 'When high voltage meets sacred soil, corporations crumble.',
    content: `[PREMIUM CHAPTER UNLOCKED]

The subterranean basement of the Victoria Island substation smelled of ozone and petrichor. Adeola knelt on the concrete, drawing a containment ring with crushed conductive graphite.

Footsteps echoed above. Heavy combat boots. Executive mercenaries from Eko-Dynamics.

"Adeola Balogun," a synthesized voice boomed down the service stairwell. "Surrender the artifact and your contract will simply be terminated. Refuse, and your biological markers will be erased from every database on Earth."

She looked down at her hands. Sparks of warm gold energy were already dancing between her fingertips. "My ancestors," she whispered, "wrote laws long before you built servers."

With a sudden thunderous snap, the entire substation's floodlights blew out. In the total darkness, the air grew searingly hot, and the molten copper wires overhead began to rearrange themselves into the shape of ancient battle spears.`,
    wordCount: 1890,
    isPremium: true,
    priceNGN: 200,
    publishedAt: Date.now() - 15 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 15 * 86400000,
  },
  {
    id: 'ch-4',
    storyId: 'story-1',
    chapterNumber: 4,
    title: 'The Storm Above Eko Atlantic',
    excerpt: 'The skies above the ocean turn violet as the celestial council convenes.',
    content: `[PREMIUM CHAPTER UNLOCKED]

The thunderclap shook the glass pinnacles of Eko Atlantic. Adeola stood on the precipice of the helipad, rain whipping across her visor in torrents.

From the clouds above, a colossal face shaped from ionized plasma looked down at the megalopolis. Sango had opened his eyes.

"Child of Osun," the storm rumbled directly into Adeola's skull. "The mortals have chained the lightning to power their hollow machines. Will you break their shackles, or will you command the tempest?"

Behind her, three combat gunships hovered, searchlights blinding. Adeola smiled, raised both hands toward the clouds, and let the lightning embrace her skin.`,
    wordCount: 2150,
    isPremium: true,
    priceNGN: 250,
    publishedAt: Date.now() - 2 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 2 * 86400000,
  },

  // Chapters for Whispers of the Sahel
  {
    id: 'ch-201',
    storyId: 'story-2',
    chapterNumber: 1,
    title: 'The Dunes of Agadez',
    excerpt: 'The desert winds carry secrets that kings would slaughter their heirs to possess.',
    content: `Amina pulled her indigo veil tighter across her nose as the sirocco howled across the crimson dunes of Agadez. Her riding camel, a hardy white beast named Zalika, grunted and refused to take another step forward.

Fifty cubits ahead, half-buried in the shifting quartz sand, was not a caravan ruin. It was the scaled wing of a juvenile sand-drake, its metallic emerald spines catching the dying sunlight.

And beneath the drake's dying ribcage lay a young man in silk tunics torn by obsidian daggers—breathing shallowly, clutching an ivory signet ring emblazoned with the royal sun-seal of the Songhai throne.`,
    wordCount: 1250,
    isPremium: false,
    priceNGN: 0,
    publishedAt: Date.now() - 30 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'ch-202',
    storyId: 'story-2',
    chapterNumber: 2,
    title: 'Water and Venom',
    excerpt: 'Healing a prince is easy; surviving his gratitude is deadly.',
    content: `The draught was bitter with desert mint and boiled cobra venom, but within moments of swallowing, the prince’s fever broke.

"Who sent you?" the boy croaked, his eyes snapping open. They were the color of polished amber, fierce and panicked.

"Nobody sends the Tuareg," Amina replied dryly, pouring cold water from her goatskin bag into a carved calabash. "Drink. Or let the vultures have your signet ring. It makes no difference to me."

He stared at her hands, taking in the tribal henna patterns winding up her wrists. "You know who I am?"

"Prince Faruq. The one whose funeral was celebrated in the capital three moons ago."`,
    wordCount: 1410,
    isPremium: false,
    priceNGN: 0,
    publishedAt: Date.now() - 18 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 18 * 86400000,
  },
  {
    id: 'ch-203',
    storyId: 'story-2',
    chapterNumber: 3,
    title: 'The Oasis of Emerald Scales',
    excerpt: 'When the deep drakes rise, even the sands turn to liquid glass.',
    content: `[PREMIUM CHAPTER UNLOCKED]

The oasis did not appear on any imperial map. Hidden beneath a horseshoe crater of sheer basalt cliffs, crystalline freshwater bubbled from a subterranean cavern carpeted with moss and glowing mushrooms.

And curled around the springs was a leviathan: the Mother of the Dunes, whose tail alone could crush a phalanx of imperial chariots.

"Do not draw your sword, Faruq," Amina whispered, grabbing the prince’s hilt. "She doesn't eat nomads. But she has tasted royal blood before—and she remembers the taste."`,
    wordCount: 1680,
    isPremium: true,
    priceNGN: 150,
    publishedAt: Date.now() - 5 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 5 * 86400000,
  },

  // Chapters for Code of the Red Dust
  {
    id: 'ch-301',
    storyId: 'story-3',
    chapterNumber: 1,
    title: 'Terminal 042: Coal City Uplink',
    excerpt: 'In Enugu, dusty CRT monitors whisper what the CBN registers try to hide.',
    content: `The ceiling fan in CyberZone Internet Café wobbled at a dizzying cadence, squeaking with every revolution. Obioma adjusted his taped glasses, his cursor hovering over an encrypted Swiss ledger linked to a ghost enterprise in Onitsha.

For six months, smallholder cassava farmers in Nsukka had been declared in default of agricultural grants they had never received. Three hundred million Naira, siphoned through five hundred proxy bank accounts.

With three keystrokes, Obioma injected a packet sniffer into the banking gateway. What popped onto his green terminal was not local fraudsters: it was the private cryptographic key of the state commissioner for finance.

Outside, the screech of tires on gravel announced visitors who were definitely not coming to buy airtime.`,
    wordCount: 1350,
    isPremium: false,
    priceNGN: 0,
    publishedAt: Date.now() - 60 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'ch-302',
    storyId: 'story-3',
    chapterNumber: 2,
    title: 'The Black Hilux',
    excerpt: 'When tinted glass rolls down in broad daylight, run first, compile later.',
    content: `Obioma threw the portable hard drive into his backpack, yanked the café's rear fuse box, and plunged the back alley into darkness just as the front glass door shattered under rifle butts.

He slid down the drainage ditch behind the stadium, red laterite dust caking his jeans and sneakers.

His phone buzzed in his pocket. A single SMS from an unknown satellite number:
'WE HAVE YOUR SISTER'S HOSTEL ADDRESS IN NSUKKA. DELETE THE LEDGER BEFORE MIDNIGHT.'`,
    wordCount: 1400,
    isPremium: false,
    priceNGN: 0,
    publishedAt: Date.now() - 40 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 40 * 86400000,
  },
  {
    id: 'ch-303',
    storyId: 'story-3',
    chapterNumber: 3,
    title: 'Broadcast Over the Airwaves',
    excerpt: 'When authorities are complicit, pirate radio is the only court of justice.',
    content: `[PREMIUM CHAPTER UNLOCKED]

Perched high on the transmission tower overlooking Milliken Hill, Obioma patched his mini transmitter into the state broadcasting antenna.

At exactly 7:00 PM, during the statewide evening news, the governor’s speech was interrupted by a crisp audio recording of the bank syndicate leaders dividing the farmer bailout funds.

Below the hill, police sirens wailed in confusion. The red dust of Enugu had spoken, and no bribe could erase the transmission.`,
    wordCount: 1720,
    isPremium: true,
    priceNGN: 150,
    publishedAt: Date.now() - 20 * 86400000,
    isDraft: false,
    updatedAt: Date.now() - 20 * 86400000,
  },
];

export const SEED_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    storyId: 'story-1',
    userId: 'user-zainab',
    userName: 'Zainab Mustapha',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    content: 'The blending of Yoruba orisha mythology and cyberpunk Lagos is utterly breathless! The imagery of Third Mainland Bridge humming with spirit frequencies gave me actual goosebumps. Can’t wait for Chapter 5!',
    helpfulCount: 42,
    helpfulUserIds: ['user-current'],
    authorReply: 'Thank you so much Zainab! Chapter 5 is currently in editing and drops next week!',
    createdAt: Date.now() - 3 * 86400000,
    formattedDate: '3 days ago',
  },
  {
    id: 'rev-2',
    storyId: 'story-1',
    userId: 'user-kofi',
    userName: 'Kofi Mensah',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    content: 'Unlocking chapter 3 via Paystack was instant. Adeola is such a well-crafted protagonist—clever, terrified, yet refusing to bend. Best ₦200 I’ve spent this month.',
    helpfulCount: 29,
    helpfulUserIds: [],
    createdAt: Date.now() - 6 * 86400000,
    formattedDate: '6 days ago',
  },
  {
    id: 'rev-3',
    storyId: 'story-2',
    userId: 'user-habiba',
    userName: 'Habiba Bello',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    content: 'The vivid description of the Sahara and Tuareg culture is so respectful and enchanting. Amina is fierce!',
    helpfulCount: 15,
    helpfulUserIds: [],
    createdAt: Date.now() - 4 * 86400000,
    formattedDate: '4 days ago',
  },
  {
    id: 'rev-4',
    storyId: 'story-3',
    userId: 'user-emeka',
    userName: 'Emeka Nwosu',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 4,
    content: 'Gripping Enugu noir thriller! The coding terminology is accurate and the pacing never lets up.',
    helpfulCount: 8,
    helpfulUserIds: [],
    createdAt: Date.now() - 12 * 86400000,
    formattedDate: '12 days ago',
  },
];
