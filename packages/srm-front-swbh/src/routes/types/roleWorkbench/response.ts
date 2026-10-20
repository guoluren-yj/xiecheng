/**
 * 角色工作台卡片查询
 */
export interface ICardSettingLayout {
  // "全部卡片"
  readonly allCard: ICardData;
  // 卡片分类列表
  readonly cardList: ICardData[];
}



/**
 * 卡片数据
 */
export interface ICardData {
  // 卡片名称
  readonly cardName: string;
  // 卡片code
  readonly cardCode: string;
  // 快速发起业务
  readonly cardDocFastDTOList: object[];
  // 快速入口
  readonly cardQuickLinkDTOList: object[];
  // 卡片里包含的单据类型 对象数组
  readonly docList: object[];
  // 卡片里包含的单据类型 纯code字符串数组
  readonly docTypeList:String[];
  // 卡片内单据类型下拉值集数据源
  readonly docTypeSource:object[];
  // 排序
  readonly orderSeq: Number;
  // 预加载模块path
  readonly preloadingRouteList: string[];
  readonly tenantId:Number;
}

/**
 *  角色工作台卡片total
 */
export interface ICardTotal {
  // 全部-需关注数量
  readonly attentionTotalElements: Number;
  // 全部-待处理数量
  readonly todoTotalElements: Number;
  readonly tenantId: Number;
  // 全部-数量
  readonly allCard: IDocTypeDTO;
  // 分类单据数量列表
  readonly cardDataDocTypeDTOList:IDocTypeDTO[];

}

export interface IDocTypeDTO {
  readonly cardCode: string;
  readonly cardName: string;
  // 左侧menu大类和普通条目
  readonly cardDataEntryTypeDTOList: ICardDataEntryTypeDTO[];
  // 需关注数量
  readonly attentionTotalElements: Number;
  // 草稿箱数量
  readonly draftTotalElements: Number;
  readonly orderSeq:Number;
  // 进行中数量
  readonly processTotalElements: Number;
  // 待办数量
  readonly todoTotalElements: Number;
  // 待转单数量（新版ui已删）
  readonly transferTotalElements:Number;
}




/**
 * 左侧菜单数据结构
 */
export interface ICardDataEntryTypeDTO {
   // 子菜单数据列表
   readonly cardDataEntryDTOList: ICardDataEntryDTO[];
   // 排序
   readonly orderSeq: Number;
   // SubMenu 菜单数量
   readonly totalElements: Number;
   // SubMenu 菜单code
   readonly typeCode: string;
   // SubMenu 菜单name
   readonly typeName: string;
}

/**
 * 子菜单数据结构
 */
export interface ICardDataEntryDTO {
   // 子菜单code
   readonly entryCode: string;
   // 子菜单menu
   readonly entryName: string;
   // 排序
   readonly orderSeq: Number;
   // 子菜单数量
   readonly totalElements: Number;

}

