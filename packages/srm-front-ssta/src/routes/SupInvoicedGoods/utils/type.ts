export enum ActiveKey
{
  Info = 'info',
  Mapping = 'mapping',
};

// 表格个性化单元
export const GridCustCode = {
  [ActiveKey.Info]: 'SDIM.SUP_INVED_GOODS_LIST.GRID_INFO',
  [ActiveKey.Mapping]: 'SDIM.SUP_INVED_GOODS_LIST.GRID_MAPPING',
};

export const SearchCustCode = {
  [ActiveKey.Info]: 'SDIM.SUP_INVED_GOODS_LIST.SEARCH_INFO',
  [ActiveKey.Mapping]: 'SDIM.SUP_INVED_GOODS_LIST.SEARCH_MAPPING',
};

export const ListTabsCustCode = 'SDIM.SUP_INVED_GOODS_LIST.TABS';

export const ListBtnsCustCode = 'SDIM.SUP_INVED_GOODS_LIST.BTNS';
