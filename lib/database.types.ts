/**
 * App-level type aliases over the generated Supabase schema.
 *
 * The generated schema lives in ./database.generated.ts and is overwritten by
 * `npm run types:gen`. Keep hand-written types HERE so regeneration never
 * clobbers them.
 */

import type { Tables, TablesInsert } from "./database.generated";

export type { Database, Json, Tables, TablesInsert, TablesUpdate } from "./database.generated";

export type Building = Tables<"buildings">
export type BuildingInsert = TablesInsert<"buildings">

export type Lead = Tables<"leads">
export type LeadInsert = TablesInsert<"leads">

// Precon / existing inventory
export type PreconMiami = Tables<"precon_miami">
export type PreconBroward = Tables<"precon_broward">
export type ExistingTower = Tables<"existing_towers">

// Companies / people
export type Company = Tables<"companies">
export type Person = Tables<"people">

// Content / cities
export type CityHub = Tables<"city_hubs">
export type Faq = Tables<"faq">
export type KeywordMap = Tables<"keyword_map">

// Reference
export type Statute = Tables<"statutes">
export type RecordsAccess = Tables<"records_access">
export type MarketStat = Tables<"market_stats">
export type Agency = Tables<"agencies">
export type LegalAid = Tables<"legal_aid">
export type AuthorityLink = Tables<"authority_links">
export type Form = Tables<"forms">

// Associations
export type ManagementFirm = Tables<"management_firms">
export type BuildingOfficial = Tables<"building_officials">
export type AssnRegistryEntry = Tables<"assn_registry">

/**
 * Gated: RLS with no policies, so these are only reachable with the secret
 * key. Read board contacts through BoardContactPublishable (the
 * board_contacts_publishable view) rather than the base table.
 */
export type BoardContact = Tables<"board_contacts">
export type BoardContactPublishable = Tables<"board_contacts_publishable">
export type CamLicensee = Tables<"cam_licensees">
