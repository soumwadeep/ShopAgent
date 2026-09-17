export const feedStores = {
  jiomart: { name: "JioMart", home: "https://www.jiomart.com/", host: "jiomart.com", pinRequired: true },
  croma: { name: "Croma", home: "https://www.croma.com/", host: "croma.com", pinRequired: false },
  reliance_digital: { name: "Reliance Digital", home: "https://www.reliancedigital.in/", host: "reliancedigital.in", pinRequired: false },
  bigbasket: { name: "BigBasket", home: "https://www.bigbasket.com/", host: "bigbasket.com", pinRequired: true },
  blinkit: { name: "Blinkit", home: "https://blinkit.com/", host: "blinkit.com", pinRequired: true },
  zepto: { name: "Zepto", home: "https://www.zeptonow.com/", host: "zeptonow.com", pinRequired: true },
} as const;

export type FeedStoreId = keyof typeof feedStores;
export const feedStoreIds = Object.keys(feedStores) as FeedStoreId[];
