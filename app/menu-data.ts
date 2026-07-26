export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  categoryName: string;
  badge?: string;
  alcoholic?: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  items: MenuItem[];
};

type MenuRow = readonly [
  id: string,
  name: string,
  description: string,
  price: number,
  badge?: string,
];

const category = (
  id: string,
  name: string,
  subtitle: string,
  image: string,
  rows: readonly MenuRow[],
): MenuCategory => ({
  id,
  name,
  subtitle,
  image,
  items: rows.map(([itemId, itemName, description, price, badge]) => ({
    id: itemId,
    name: itemName,
    description,
    price,
    image,
    categoryId: id,
    categoryName: name,
    badge,
    alcoholic: id === "cocktails",
  })),
});

export const menuCategories: MenuCategory[] = [
  category(
    "starters",
    "Starters",
    "Island bites made for sharing",
    "/assets/wings.webp",
    [
      ["conch-fritters", "Conch Fritters", "Island-style fritters with Key lime aioli.", 14, "Local favorite"],
      ["smoked-fish-dip", "Smoked Fish Dip", "Fresh smoked fish dip, crackers and pickled vegetables.", 15],
      ["coconut-shrimp", "Coconut Shrimp", "Golden fried shrimp with sweet chili sauce.", 15],
      ["loaded-fries", "Loaded Southernmost Fries", "Bacon, cheddar, scallions and ranch drizzle.", 12],
      ["fried-pickles", "Fried Pickles", "Crispy pickle chips with house ranch.", 10],
      ["pretzel-bites", "Pretzel Bites", "Warm salted pretzel bites with beer cheese.", 11],
    ],
  ),
  category(
    "salads",
    "Island Salads",
    "Fresh greens with tropical flavor",
    "/assets/seafood.webp",
    [
      ["house-salad", "Southernmost House Salad", "Mixed greens, tomatoes, cucumbers, red onions, carrots and croutons.", 12],
      ["key-west-cobb", "Key West Cobb Salad", "Grilled chicken, bacon, avocado, tomatoes, egg and bleu cheese.", 16],
      ["tropical-shrimp-salad", "Tropical Shrimp Salad", "Grilled shrimp, mango, pineapple, red onion and cucumbers.", 18],
      ["jerk-chicken-salad", "Caribbean Jerk Chicken Salad", "Jerk chicken, mixed greens, tomatoes, cucumbers and cheese.", 17],
      ["blackened-mahi-salad", "Blackened Mahi Salad", "Fresh mahi over mixed greens with tomatoes and cucumbers.", 19],
      ["caesar-salad", "Caesar Salad", "Romaine, parmesan, croutons and Caesar dressing.", 11],
      ["sunset-salad", "Southernmost Sunset Salad", "Shrimp, pineapple, mango, avocado, candied pecans and feta.", 20, "House favorite"],
    ],
  ),
  category(
    "wings",
    "World-Famous Wings",
    "Choose a size, flavor and finish",
    "/assets/wings.webp",
    [
      ["wings-order", "Southernmost Wings", "Tossed to order in one of twelve signature flavors.", 15, "10 / 20 / 50 wings"],
    ],
  ),
  category(
    "burgers",
    "Burgers & Sandwiches",
    "Served with fries",
    "/assets/burger.webp",
    [
      ["southernmost-burger", "Southernmost Burger", "8 oz Angus beef, lettuce, tomato, onion and American cheese.", 16],
      ["island-burger", "Island Burger", "Pepper jack, grilled pineapple, bacon and island sauce.", 18],
      ["smokehouse-burger", "Smokehouse Burger", "BBQ sauce, bacon, cheddar and onion rings.", 18],
      ["mahi-sandwich", "Blackened Mahi Sandwich", "Fresh mahi, lettuce, tomato and Key lime aioli.", 18],
      ["crispy-chicken-sandwich", "Crispy Chicken Sandwich", "Hand-breaded chicken breast, pickles and spicy mayo.", 16],
      ["cuban-sandwich", "Cuban Sandwich", "Roast pork, ham, Swiss, pickles and mustard.", 15],
    ],
  ),
  category(
    "seafood",
    "Seafood Favorites",
    "Florida-inspired plates",
    "/assets/mahi.webp",
    [
      ["blackened-mahi", "Blackened Mahi Mahi", "Coconut rice and grilled vegetables.", 24, "Fresh catch"],
      ["fried-shrimp-basket", "Fried Shrimp Basket", "Golden fried shrimp, fries and coleslaw.", 19],
      ["fish-and-chips", "Fish & Chips", "Beer-battered fish, fries and tartar sauce.", 18],
      ["coconut-shrimp-platter", "Coconut Shrimp Platter", "Rice, vegetables and sweet chili sauce.", 22],
      ["seafood-pasta", "Seafood Pasta", "Shrimp, scallops and creamy garlic sauce.", 26],
      ["crab-cake-dinner", "Crab Cake Dinner", "House-made crab cakes, rice and vegetables.", 25],
    ],
  ),
  category(
    "signatures",
    "Island Signatures",
    "The plates worth crossing town for",
    "/assets/lamb.webp",
    [
      ["jerk-lamb-chops", "Jerk Lamb Chops", "Guava rum glaze, coconut rice, vegetables and plantains.", 34, "Chef's signature"],
      ["surf-and-turf", "Southernmost Surf & Turf", "Jerk lamb chops, grilled shrimp, coconut rice and vegetables.", 39],
      ["jerk-chicken-platter", "Jerk Chicken Platter", "Caribbean jerk chicken, rice and fried plantains.", 19],
      ["key-west-chicken", "Key West Chicken", "Grilled chicken topped with tropical mango salsa.", 18],
      ["southernmost-steak", "Southernmost Steak", "10 oz grilled steak, mashed potatoes and vegetables.", 29],
      ["bbq-ribs", "BBQ Baby Back Ribs", "Slow-smoked ribs with fries and coleslaw.", 25],
      ["chicken-alfredo", "Chicken Alfredo", "Creamy parmesan Alfredo over fettuccine.", 18],
    ],
  ),
  category(
    "tacos",
    "Island Tacos",
    "Three tacos per order",
    "/assets/tacos.webp",
    [
      ["mahi-tacos", "Blackened Mahi Tacos", "Cabbage slaw and Key lime crema.", 16],
      ["shrimp-tacos", "Shrimp Tacos", "Grilled shrimp with mango salsa.", 16],
      ["jerk-chicken-tacos", "Jerk Chicken Tacos", "Jerk chicken topped with pineapple slaw.", 15],
    ],
  ),
  category(
    "flatbreads",
    "Flatbreads",
    "Stone-baked bar favorites",
    "/assets/tacos.webp",
    [
      ["island-bbq-flatbread", "Island BBQ Chicken", "BBQ chicken, red onion and mozzarella.", 15],
      ["margherita-flatbread", "Margherita", "Fresh mozzarella, basil and tomatoes.", 14],
      ["seafood-flatbread", "Seafood Flatbread", "Shrimp, garlic butter and mozzarella blend.", 18],
    ],
  ),
  category(
    "sides",
    "Sides",
    "Complete the plate",
    "/assets/burger.webp",
    [
      ["fries", "French Fries", "Crispy and sea-salted.", 5],
      ["sweet-potato-fries", "Sweet Potato Fries", "Crisp and lightly seasoned.", 6],
      ["onion-rings", "Onion Rings", "Golden and beer-battered.", 7],
      ["coleslaw", "Coleslaw", "House-made slaw.", 4],
      ["coconut-rice", "Coconut Rice", "Fragrant island-style rice.", 5],
      ["rice-and-beans", "Rice & Beans", "A slow-simmered island staple.", 5],
      ["fried-plantains", "Fried Plantains", "Sweet and caramelized.", 5],
      ["side-salad", "Side Salad", "Mixed greens with choice of dressing.", 6],
      ["seasonal-vegetables", "Seasonal Vegetables", "Chef's seasonal selection.", 5],
    ],
  ),
  category(
    "desserts",
    "Desserts",
    "Finish in the Keys",
    "/assets/key-lime.webp",
    [
      ["key-lime-pie", "Key Lime Pie", "A Florida Keys classic.", 9, "Classic"],
      ["coconut-cheesecake", "Coconut Cheesecake", "Creamy cheesecake with toasted coconut.", 10],
      ["chocolate-lava-cake", "Chocolate Lava Cake", "Warm chocolate cake with vanilla ice cream.", 10],
    ],
  ),
  category(
    "cocktails",
    "Tropical Cocktails",
    "Shaken, stirred and poured",
    "/assets/cocktails.webp",
    [
      ["southernmost-sunset", "Southernmost Sunset", "Rum, pineapple, orange and grenadine.", 12, "Signature"],
      ["key-lime-margarita", "Key Lime Margarita", "Fresh lime, tequila and orange liqueur.", 13],
      ["guava-breeze", "Guava Breeze", "Vodka, guava nectar and cranberry lime.", 12],
      ["island-mojito", "Island Mojito", "Rum, mint, lime and soda.", 12],
      ["frozen-pina-colada", "Frozen Piña Colada", "The island favorite.", 13],
      ["rum-runner", "Rum Runner", "A true Florida Keys classic.", 13],
    ],
  ),
];

export const allMenuItems = menuCategories.flatMap((group) => group.items);

export const featuredMenuItems = [
  "jerk-lamb-chops",
  "blackened-mahi",
  "wings-order",
  "southernmost-burger",
  "southernmost-sunset",
  "key-lime-pie",
]
  .map((id) => allMenuItems.find((item) => item.id === id))
  .filter((item): item is MenuItem => Boolean(item));
