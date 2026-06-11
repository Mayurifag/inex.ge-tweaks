export const STORAGE_KEY = 'inex_enhanced_parcels_enabled';
export const FILTER_STORAGE_KEY = 'parcels_filter_open';
export const ROOT_CLASS = 'inex-enhanced-parcels';
export const HIDDEN_CLASS = 'inex-enhanced-hidden';
export const CONTENTS_CLASS = 'inex-enhanced-parcels__contents';
export const SECTION_CLASS = 'inex-enhanced-parcels__section';
export const SECTION_COLLAPSED_CLASS = 'inex-enhanced-parcels__row--section-collapsed';
export const SIDE_CLASS = 'inex-enhanced-parcels__side';
export const ACTIONS_CLASS = 'inex-enhanced-parcels__actions';
export const TRACKING_CODE_ATTRIBUTE = 'data-inex-tracking-code';
export const DESCRIPTION_ATTRIBUTE = 'data-inex-description';
export const ORIGIN_ATTRIBUTE = 'data-inex-origin';
export const DETAIL_USER_FIELD_ATTRIBUTE = 'data-inex-user-detail-hidden';
export const TAKEOUT_STATUS = '5';
export const TAKEOUT_RE = /^(?:Takeout|Taken\s*Out|გატანილი|Забрано|Выдано)$/i;
export const ARRIVED_RE = /^(?:Arrived|ჩამოსულ(?:ია|ი)?|Прибыл|Прибыло)$/i;
export const BATUMI_RE = /batumi|ბათუმ|батуми/i;
export const USER_DETAIL_LABEL_RE =
  /^(?:User|Customer|Receiver Client|Subuser|Trustee|მომხმარებელი|მიმღები მომხმარებელი|ქვემომხმარებელი|მინდობილი პირი)(?:\s*[/|]\s*(?:User|Customer|Receiver Client|Subuser|Trustee|მომხმარებელი|მიმღები მომხმარებელი|ქვემომხმარებელი|მინდობილი პირი))*:?$/i;
export const SYSTEM_USER_RE =
  /^(?:System|System user|Current user|სისტემა|სისტემური მომხმარებელი|მიმდინარე მომხმარებელი)$/i;
export const ROW_SELECTOR =
  'div[class*="cursor-pointer"][class*="bg-additional-background-2"][class*="p-4"][class*="lg:flex-row"]';
export const GROUP_SELECTOR = 'div[class*="mt-2"][class*="px-2.5"]';
export const OBSERVED_ATTRIBUTES = [
  'class',
  'style',
  'disabled',
  'aria-disabled',
  'data-state',
  'hidden',
];
export const DECLARATION_MODAL_RE =
  /add declaration|update declaration|upload invoice|ai declaration|by hand|დეკლარ|ინვოის|деклар|инвойс/i;
export const DECLARATION_ACTION_RE = /declaration|declare\b|დეკლარ|деклар/i;
export const DECLARATION_STATUS_RE = /^(?:Not Declared|არ არის დეკლარირებული|Не декларировано)$/i;
export const PARCEL_DETAILS_MODAL_RE =
  /details|processes|parcel content|additional information|დეტალ|პროცეს|ამანათ|детал|процесс|посыл/i;
