export enum ActiveKey {
  Order = 'order',
  PoLine = 'poLine',
  Contract = 'contract',
  PcStage = 'pcStage',
  PcSubject = 'pcSubject',
};

const {
  Order,
  PoLine,
  Contract,
  PcStage,
  PcSubject,
} = ActiveKey;

// 列表页-表格个性化单元
export const GridCustCode = {
  [Order]: 'SSTA.SUPPLY_SETTLE_NEWPRE.GRID_ORDER',
  [PoLine]: 'SSTA.SUPPLY_SETTLE_NEWPRE.GRID_PO_LINE',
  [Contract]: 'SSTA.SUPPLY_SETTLE_NEWPRE.GRID_CONTRACT',
  [PcStage]: 'SSTA.SUPPLY_SETTLE_NEWPRE.GRID_PC_STAGE',
  [PcSubject]: 'SSTA.SUPPLY_SETTLE_NEWPRE.GRID_PC_SUBJECT',
};

// 列表页-筛选器个性化单元
export const SearchCustCode = {
  [Order]: 'SSTA.SUPPLY_SETTLE_NEWPRE.SEARCH_ORDER',
  [PoLine]: 'SSTA.SUPPLY_SETTLE_NEWPRE.SEARCH_PO_LINE',
  [Contract]: 'SSTA.SUPPLY_SETTLE_NEWPRE.SEARCH_CONTRACT',
  [PcStage]: 'SSTA.SUPPLY_SETTLE_NEWPRE.SEARCH_PC_STAGE',
  [PcSubject]: 'SSTA.SUPPLY_SETTLE_NEWPRE.SEARCH_PC_SUBJECT',
};

// 列表页-标签组个性化单元
export const ListTabsCustCode = 'SSTA.SUPPLY_SETTLE_NEWPRE.TABS';