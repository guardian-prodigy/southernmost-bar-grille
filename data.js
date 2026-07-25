const SOUTHERNMOST = {
  site: {
    name: "Southernmost Bar & Grille",
    shortName: "Southernmost",
    tagline: "Coastal Kitchen · Bar · Island Vibes",
    address: "4449 Okeechobee Blvd",
    city: "West Palm Beach, FL 33417",
    intersection: "Okeechobee × Military Trail",
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=4449+Okeechobee+Blvd+West+Palm+Beach+FL+33417",
    deliveryUrl: "https://www.ubereats.com/",
    instagramHandle: "@southernmosteats",
    hours: [
      { label: "Monday–Thursday", value: "11 AM–11 PM" },
      { label: "Friday–Sunday", value: "11 AM–2 AM" }
    ],
    happyHour: {
      label: "Monday–Friday",
      time: "3–6 PM",
      specials: ["$1 off draft beer", "$2 off cocktails", "$5 house wine", "$10 wings & fries"]
    }
  },
  servers: {
    dining: ["Maya", "Jordan"],
    bar: ["Alex", "Casey"],
    patio: ["Riley", "Morgan"],
    lounge: ["Taylor", "Avery"]
  },
  events: [
    { day: "Friday", title: "Live Music Fridays", description: "Local artists, coastal plates and a late-night bar crowd.", time: "Evening", badge: "Live" },
    { day: "Saturday", title: "Southernmost Saturdays", description: "Live entertainment, cocktails and weekend energy.", time: "Evening", badge: "Weekend" },
    { day: "Sunday", title: "Acoustic Brunch", description: "A laid-back Sunday set with island-inspired brunch energy.", time: "Brunch", badge: "Acoustic" },
    { day: "Nightly", title: "Billiards Lounge", description: "Tournament-grade tables and friendly competition every night.", time: "Open late", badge: "Play" },
    { day: "Game day", title: "Watch Parties", description: "Big screens, cold drinks and shareable plates for the whole table.", time: "Schedule varies", badge: "Sports" }
  ],
  experiencePillars: [
    { icon: "🍽", title: "Coastal kitchen", copy: "Seafood, island signatures, burgers, wings and shareable plates." },
    { icon: "🎱", title: "Play all night", copy: "A dedicated billiards lounge built for groups, leagues and casual games." },
    { icon: "🎸", title: "Live energy", copy: "Friday and Saturday music, Sunday acoustic sets and game-day gatherings." }
  ],
  menu: [
    {
      id: "starters", name: "Starters", subtitle: "Island bites made for sharing", image: "assets/wings.webp",
      items: [
        { id: "conch-fritters", name: "Conch Fritters", description: "Island-style conch fritters served with Key lime aioli.", price: 14, badge: "Local favorite" },
        { id: "smoked-fish-dip", name: "Smoked Fish Dip", description: "Fresh smoked fish dip, crackers and pickled vegetables.", price: 15 },
        { id: "coconut-shrimp", name: "Coconut Shrimp", description: "Golden fried shrimp with sweet chili sauce.", price: 15 },
        { id: "loaded-fries", name: "Loaded Southernmost Fries", description: "Bacon, cheddar cheese, scallions and ranch drizzle.", price: 12 },
        { id: "fried-pickles", name: "Fried Pickles", description: "Crispy pickle chips with house ranch.", price: 10 },
        { id: "pretzel-bites", name: "Pretzel Bites", description: "Warm salted pretzel bites with beer cheese.", price: 11 }
      ]
    },
    {
      id: "salads", name: "Island Salads", subtitle: "Fresh greens with tropical flavor", image: "assets/seafood.webp",
      items: [
        { id: "house-salad", name: "Southernmost House Salad", description: "Mixed greens, tomatoes, cucumbers, red onions, carrots and croutons.", price: 12, modifiers: ["saladProtein", "dressings"] },
        { id: "key-west-cobb", name: "Key West Cobb Salad", description: "Mixed greens, grilled chicken, bacon, avocado, tomatoes, egg and bleu cheese crumbles.", price: 16, modifiers: ["dressings"] },
        { id: "tropical-shrimp-salad", name: "Tropical Shrimp Salad", description: "Grilled shrimp, mixed greens, mango, pineapple, red onion and cucumbers.", price: 18, modifiers: ["dressings"] },
        { id: "jerk-chicken-salad", name: "Caribbean Jerk Chicken Salad", description: "Jerk-marinated chicken breast, mixed greens, tomatoes, cucumbers and shredded cheese.", price: 17, modifiers: ["dressings"] },
        { id: "blackened-mahi-salad", name: "Blackened Mahi Salad", description: "Fresh blackened mahi over mixed greens with tomatoes and cucumbers.", price: 19, modifiers: ["dressings"] },
        { id: "caesar-salad", name: "Caesar Salad", description: "Romaine lettuce, parmesan cheese, croutons and Caesar dressing.", price: 11, modifiers: ["saladProtein"] },
        { id: "sunset-salad", name: "Southernmost Sunset Salad", description: "Mixed greens, grilled shrimp, pineapple, mango, avocado, candied pecans and feta.", price: 20, badge: "House favorite", modifiers: ["dressings"] }
      ]
    },
    {
      id: "wings", name: "World-Famous Wings", subtitle: "Choose a size, flavor and finish", image: "assets/wings.webp",
      items: [
        { id: "wings-order", name: "Southernmost Wings", description: "Tossed to order in one of twelve signature flavors.", price: 15, badge: "10 / 20 / 50 wings", modifiers: ["wingSize", "wingFlavor", "wingExtras"] }
      ]
    },
    {
      id: "burgers", name: "Burgers & Sandwiches", subtitle: "Served with fries", image: "assets/burger.webp",
      items: [
        { id: "southernmost-burger", name: "Southernmost Burger", description: "8 oz Angus beef, lettuce, tomato, onion and American cheese.", price: 16, modifiers: ["burgerTemp", "burgerExtras"] },
        { id: "island-burger", name: "Island Burger", description: "Pepper jack cheese, grilled pineapple, bacon and island sauce.", price: 18, modifiers: ["burgerTemp", "burgerExtras"] },
        { id: "smokehouse-burger", name: "Smokehouse Burger", description: "BBQ sauce, bacon, cheddar cheese and onion rings.", price: 18, modifiers: ["burgerTemp", "burgerExtras"] },
        { id: "mahi-sandwich", name: "Blackened Mahi Sandwich", description: "Fresh mahi, lettuce, tomato and Key lime aioli.", price: 18 },
        { id: "crispy-chicken-sandwich", name: "Crispy Chicken Sandwich", description: "Hand-breaded chicken breast, pickles and spicy mayo.", price: 16 },
        { id: "cuban-sandwich", name: "Cuban Sandwich", description: "Roast pork, ham, Swiss cheese, pickles and mustard.", price: 15 }
      ]
    },
    {
      id: "seafood", name: "Seafood Favorites", subtitle: "Florida-inspired plates", image: "assets/mahi.webp",
      items: [
        { id: "blackened-mahi", name: "Blackened Mahi Mahi", description: "Served with coconut rice and grilled vegetables.", price: 24, badge: "Fresh catch" },
        { id: "fried-shrimp-basket", name: "Fried Shrimp Basket", description: "Golden fried shrimp, fries and coleslaw.", price: 19 },
        { id: "fish-and-chips", name: "Fish & Chips", description: "Beer-battered fish, fries and tartar sauce.", price: 18 },
        { id: "coconut-shrimp-platter", name: "Coconut Shrimp Platter", description: "Served with rice, vegetables and sweet chili sauce.", price: 22 },
        { id: "seafood-pasta", name: "Seafood Pasta", description: "Shrimp, scallops and creamy garlic sauce.", price: 26 },
        { id: "crab-cake-dinner", name: "Crab Cake Dinner", description: "House-made crab cakes, rice and vegetables.", price: 25 }
      ]
    },
    {
      id: "signatures", name: "Island Signatures", subtitle: "The plates worth crossing town for", image: "assets/lamb.webp",
      items: [
        { id: "jerk-lamb-chops", name: "Jerk Lamb Chops", description: "House-marinated Caribbean jerk lamb chops, guava rum glaze, coconut rice, grilled vegetables and fried plantains.", price: 34, badge: "Chef's signature" },
        { id: "surf-and-turf", name: "Southernmost Surf & Turf", description: "Jerk lamb chops paired with grilled shrimp, coconut rice and vegetables.", price: 39 },
        { id: "jerk-chicken-platter", name: "Jerk Chicken Platter", description: "Caribbean jerk chicken, rice and fried plantains.", price: 19 },
        { id: "key-west-chicken", name: "Key West Chicken", description: "Grilled chicken topped with tropical mango salsa.", price: 18 },
        { id: "southernmost-steak", name: "Southernmost Steak", description: "10 oz grilled steak, mashed potatoes and vegetables.", price: 29, modifiers: ["steakTemp"] },
        { id: "bbq-ribs", name: "BBQ Baby Back Ribs", description: "Slow-smoked ribs served with fries and coleslaw.", price: 25 },
        { id: "chicken-alfredo", name: "Chicken Alfredo", description: "Creamy parmesan Alfredo over fettuccine pasta.", price: 18 }
      ]
    },
    {
      id: "tacos", name: "Island Tacos", subtitle: "Three tacos per order", image: "assets/tacos.webp",
      items: [
        { id: "mahi-tacos", name: "Blackened Mahi Tacos", description: "Cabbage slaw and Key lime crema.", price: 16 },
        { id: "shrimp-tacos", name: "Shrimp Tacos", description: "Three grilled shrimp tacos with mango salsa.", price: 16 },
        { id: "jerk-chicken-tacos", name: "Jerk Chicken Tacos", description: "Three tacos topped with pineapple slaw.", price: 15 }
      ]
    },
    {
      id: "flatbreads", name: "Flatbreads", subtitle: "Stone-baked bar favorites", image: "assets/tacos.webp",
      items: [
        { id: "island-bbq-flatbread", name: "Island BBQ Chicken", description: "BBQ chicken, red onion and mozzarella.", price: 15 },
        { id: "margherita-flatbread", name: "Margherita", description: "Fresh mozzarella, basil and tomatoes.", price: 14 },
        { id: "seafood-flatbread", name: "Seafood Flatbread", description: "Shrimp, garlic butter and mozzarella blend.", price: 18 }
      ]
    },
    {
      id: "sides", name: "Sides", subtitle: "Complete the plate", image: "assets/burger.webp",
      items: [
        { id: "fries", name: "French Fries", description: "Crispy and sea-salted.", price: 5 },
        { id: "sweet-potato-fries", name: "Sweet Potato Fries", description: "Crisp and lightly seasoned.", price: 6 },
        { id: "onion-rings", name: "Onion Rings", description: "Golden and beer-battered.", price: 7 },
        { id: "coleslaw", name: "Coleslaw", description: "House-made slaw.", price: 4 },
        { id: "coconut-rice", name: "Coconut Rice", description: "Fragrant island-style rice.", price: 5 },
        { id: "rice-and-beans", name: "Rice & Beans", description: "Slow-simmered island staple.", price: 5 },
        { id: "fried-plantains", name: "Fried Plantains", description: "Sweet and caramelized.", price: 5 },
        { id: "side-salad", name: "Side Salad", description: "Mixed greens with choice of dressing.", price: 6, modifiers: ["dressings"] },
        { id: "seasonal-vegetables", name: "Seasonal Vegetables", description: "Chef's seasonal selection.", price: 5 }
      ]
    },
    {
      id: "desserts", name: "Desserts", subtitle: "Finish in the Keys", image: "assets/key-lime.webp",
      items: [
        { id: "key-lime-pie", name: "Key Lime Pie", description: "A Florida Keys classic.", price: 9, badge: "Classic" },
        { id: "coconut-cheesecake", name: "Coconut Cheesecake", description: "Creamy cheesecake topped with toasted coconut.", price: 10 },
        { id: "chocolate-lava-cake", name: "Chocolate Lava Cake", description: "Warm chocolate cake served with vanilla ice cream.", price: 10 }
      ]
    },
    {
      id: "cocktails", name: "Tropical Cocktails", subtitle: "Shaken, stirred and poured", image: "assets/cocktails.webp",
      items: [
        { id: "southernmost-sunset", name: "Southernmost Sunset", description: "Rum, pineapple juice, orange juice and grenadine.", price: 12, alcoholic: true, badge: "Signature" },
        { id: "key-lime-margarita", name: "Key Lime Margarita", description: "Fresh lime, tequila and orange liqueur.", price: 13, alcoholic: true },
        { id: "guava-breeze", name: "Guava Breeze", description: "Vodka, guava nectar and cranberry lime.", price: 12, alcoholic: true },
        { id: "island-mojito", name: "Island Mojito", description: "Rum, mint, lime, soda and water.", price: 12, alcoholic: true },
        { id: "frozen-pina-colada", name: "Frozen Piña Colada", description: "The island favorite.", price: 13, alcoholic: true },
        { id: "rum-runner", name: "Rum Runner", description: "A true Florida Keys classic.", price: 13, alcoholic: true }
      ]
    }
  ],
  modifiers: {
    wingSize: {
      label: "Wing size",
      required: true,
      type: "single",
      options: [
        { label: "10 wings", value: "10 wings", price: 0 },
        { label: "20 wings", value: "20 wings", price: 13 },
        { label: "50 wings", value: "50 wings", price: 50 }
      ]
    },
    wingFlavor: {
      label: "Signature flavor",
      required: true,
      type: "single",
      options: ["Guava Heatwave", "Southernmost Buffalo", "Mango Habanero", "Caribbean Jerk", "Key Lime Pepper", "Garlic Parmesan", "Honey Sriracha", "Sweet Island BBQ", "Nashville Hot", "Lemon Pepper Dry Rub", "Cajun Dry Rub", "Pineapple Teriyaki"].map(label => ({ label, value: label, price: 0 }))
    },
    wingExtras: {
      label: "Add-ons",
      type: "multi",
      options: [
        { label: "Add fries", value: "Add fries", price: 4 },
        { label: "Extra ranch", value: "Extra ranch", price: 1 },
        { label: "Extra bleu cheese", value: "Extra bleu cheese", price: 1 }
      ]
    },
    saladProtein: {
      label: "Add protein",
      type: "single-optional",
      options: [
        { label: "No added protein", value: "No added protein", price: 0 },
        { label: "Grilled chicken", value: "Grilled chicken", price: 6 },
        { label: "Jerk chicken", value: "Jerk chicken", price: 7 },
        { label: "Blackened shrimp", value: "Blackened shrimp", price: 8 },
        { label: "Blackened mahi", value: "Blackened mahi", price: 9 },
        { label: "Lamb chop", value: "Lamb chop", price: 10 }
      ]
    },
    dressings: {
      label: "Dressing",
      type: "single",
      required: true,
      options: ["Key Lime Vinaigrette", "Mango Vinaigrette", "Ranch", "Bleu Cheese", "Caesar", "Balsamic Vinaigrette", "Honey Mustard"].map(label => ({ label, value: label, price: 0 }))
    },
    burgerTemp: {
      label: "Temperature",
      type: "single",
      required: true,
      options: ["Medium rare", "Medium", "Medium well", "Well done"].map(label => ({ label, value: label, price: 0 }))
    },
    steakTemp: {
      label: "Temperature",
      type: "single",
      required: true,
      options: ["Rare", "Medium rare", "Medium", "Medium well", "Well done"].map(label => ({ label, value: label, price: 0 }))
    },
    burgerExtras: {
      label: "Add-ons",
      type: "multi",
      options: [
        { label: "Bacon", value: "Bacon", price: 2 },
        { label: "Extra cheese", value: "Extra cheese", price: 1.5 },
        { label: "Fried egg", value: "Fried egg", price: 2 },
        { label: "Avocado", value: "Avocado", price: 2 }
      ]
    }
  }
};

window.SOUTHERNMOST = SOUTHERNMOST;
