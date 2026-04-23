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
    packResults: {
        position: number;
        name: string;
        rating: number;
        reviewCount: number;
    }[];
}
export declare const GMB_CONSTANTS: {
    readonly REQUEST_TIMEOUT_MS: 15000;
    readonly CRAWL_DELAY_MS: 400;
    readonly TIER1_DIRECTORIES: readonly [{
        readonly name: "Google Business Profile";
        readonly domain: "google.com";
    }, {
        readonly name: "Bing Places";
        readonly domain: "bingplaces.com";
    }, {
        readonly name: "Apple Maps";
        readonly domain: "mapsconnect.apple.com";
    }, {
        readonly name: "Facebook";
        readonly domain: "facebook.com";
    }, {
        readonly name: "Yelp";
        readonly domain: "yelp.com";
    }];
    readonly TIER2_DIRECTORIES: readonly [{
        readonly name: "Yellow Pages";
        readonly domain: "yellowpages.com";
    }, {
        readonly name: "BBB";
        readonly domain: "bbb.org";
    }, {
        readonly name: "Foursquare";
        readonly domain: "foursquare.com";
    }, {
        readonly name: "Justdial";
        readonly domain: "justdial.com";
    }, {
        readonly name: "Sulekha";
        readonly domain: "sulekha.com";
    }, {
        readonly name: "IndiaMart";
        readonly domain: "indiamart.com";
    }];
};
