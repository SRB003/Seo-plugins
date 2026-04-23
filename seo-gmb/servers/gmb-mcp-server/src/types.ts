export interface GbpProfileData {
  name: string;
  address: string;
  phone: string;
  website: string;
  category: string;
  rating: number;
  reviewCount: number;
  hours: string;
  description: string;
  attributes: string[];
  photoCount: number;
  lastPostDate: string | null;
}

export interface ReviewData {
  reviewerName: string;
  rating: number;
  text: string;
  date: string;
  responded: boolean;
  responseText: string | null;
}

export interface CitationResult {
  directory: string;
  url: string;
  tier: 1 | 2 | 3;
  listedName: string | null;
  listedAddress: string | null;
  listedPhone: string | null;
  nameMatch: boolean;
  addressMatch: boolean;
  phoneMatch: boolean;
  overallStatus: "consistent" | "partial" | "inconsistent" | "not_found";
}

export interface LocalPackResult {
  keyword: string;
  city: string;
  inPack: boolean;
  position: number | null;
  packResults: { position: number; name: string; rating: number; reviewCount: number }[];
}

export const GMB_CONSTANTS = {
  REQUEST_TIMEOUT_MS: 15000,
  CRAWL_DELAY_MS: 400,
  TIER1_DIRECTORIES: [
    { name: "Google Business Profile", domain: "google.com" },
    { name: "Bing Places", domain: "bingplaces.com" },
    { name: "Apple Maps", domain: "mapsconnect.apple.com" },
    { name: "Facebook", domain: "facebook.com" },
    { name: "Yelp", domain: "yelp.com" },
  ],
  TIER2_DIRECTORIES: [
    { name: "Yellow Pages", domain: "yellowpages.com" },
    { name: "BBB", domain: "bbb.org" },
    { name: "Foursquare", domain: "foursquare.com" },
    { name: "Justdial", domain: "justdial.com" },
    { name: "Sulekha", domain: "sulekha.com" },
    { name: "IndiaMart", domain: "indiamart.com" },
  ],
} as const;
