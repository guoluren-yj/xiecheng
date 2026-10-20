import intl from 'utils/intl';

import { isTenantRoleLevel } from 'utils/utils';

export const colOptions = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
];

export function getFieldCodeAlias(type) {
  switch (type) {
    case 'TABPANE':
      return intl.get('hpfm.customize.common.tabsCode').d('标签页编码');
    case 'COLLAPSE':
      return intl.get('hpfm.customize.common.collapseCode').d('折叠面板编码');
    case 'BTNGROUP':
      return intl.get('hpfm.customize.common.btnGroupCode').d('按钮编码');
    case 'SECTION':
      return intl.get('hpfm.customize.common.sectionCode').d('卡片编码');
    default:
      return intl.get('hpfm.customize.common.fieldCode').d('字段编码');
  }
}
export function getFieldNameAlias(type) {
  switch (type) {
    case 'TABPANE':
      return intl.get('hpfm.customize.common.tabsName').d('标签页名称');
    case 'COLLAPSE':
      return intl.get('hpfm.customize.common.collapseName').d('折叠面板名称');
    case 'BTNGROUP':
      return intl.get('hpfm.customize.common.btnGroupName').d('按钮名称');
    case 'SECTION':
      return intl.get('hpfm.customize.common.sectionName').d('卡片名称');
    default:
      return intl.get('hpfm.customize.common.fieldName').d('字段名称');
  }
}
export function getFieldConfigAlias(type) {
  switch (type) {
    case 'TABPANE':
      return intl.get('hpfm.customize.common.tabsConfig').d('标签页配置');
    case 'COLLAPSE':
      return intl.get('hpfm.customize.common.collapseConfig').d('折叠面板配置');
    case 'BTNGROUP':
      return intl.get('hpfm.customize.common.btnGroupConfig').d('按钮组配置');
    case 'SECTION':
      return intl.get('hpfm.customize.common.sectionConfig').d('卡片配置');
    default:
      return intl.get('hpfm.customize.common.fieldConfig').d('字段配置');
  }
}
export function getAddFieldAlias(type) {
  switch (type) {
    case 'TABPANE':
      return intl.get('hpfm.customize.common.addTabPane').d('添加标签页');
    case 'COLLAPSE':
      return intl.get('hpfm.customize.common.addCollapse').d('添加折叠面板');
    case 'BTNGROUP':
      return intl.get('hpfm.customize.common.addBtn').d('添加按钮');
    case 'SECTION':
      return intl.get('hpfm.customize.common.addSection').d('添加卡片');
    default:
      return intl.get('hpfm.customize.common.addField').d('添加字段');
  }
}
export function getEditFieldAlias(type) {
  switch (type) {
    case 'TABPANE':
      return intl.get('hpfm.customize.common.editTabPane').d('编辑标签页');
    case 'COLLAPSE':
      return intl.get('hpfm.customize.common.editCollapse').d('编辑折叠面板');
    case 'BTNGROUP':
      return intl.get('hpfm.customize.common.editBtn').d('编辑按钮');
    case 'SECTION':
      return intl.get('hpfm.customize.common.editSection').d('编辑卡片');
    default:
      return intl.get('hpfm.customize.common.editField').d('编辑字段');
  }
}
export function getDefaultActiveAlias(type) {
  switch (type) {
    case 'COLLAPSE':
      return intl.get('hpfm.customize.common.defaultExpand').d('默认展开');
    default:
      return intl.get('hpfm.customize.common.defaultActive').d('默认激活');
  }
}
export function getSingleTenantValueCode(code = '') {
  return `${code}${isTenantRoleLevel() ? '.ORG' : ''}`;
}
export function getSingleTenantValueCodeSite(isSelect) {
  if (isTenantRoleLevel()) {
    return isSelect ? 'HPFM.LOV.LOV_DETAIL_CODE.ORG' : 'HPFM.LOV_VIEW.ORG';
  } else {
    return isSelect ? "HPFM.LOV.LOV_DETAIL.ONLY.PLATFORM" : "HPFM.LOV.VIEW.ONLY.PLATFORM";
  }
}
export function getWidgetAlias(type) {
  switch (type) {
    case 'SECTION':
    case 'COLLAPSE':
      return intl.get('hpfm.customize.common.componentType.cardType').d('卡片类型');
    default:
      return intl.get('hpfm.individual.model.config.componentType').d('组件类型');
  }
}

export function getParamsBtnName(type) {
  switch (type) {
    case 'LOV':
    case 'SELECT':
      return intl.get('hpfm.individual.common.setLovParams').d('设置值集参数');
    default:
      return intl.get('hpfm.customize.common.setParams').d('设置参数');
  }
}
export const EditType = {
  CREATE: 'create',
  UPDATE: 'update',
  COPY: 'copy',
};

export const FilterComponentList = ['INPUT', 'INPUT_NUMBER', 'SELECT', 'LOV', 'DATE_PICKER'];

// 筛选器-支持多选组件类型
export const SEARCHBAR_MUTLIPLE_COMPONENT = [
  'INPUT',
  'INPUT_NUMBER',
  'LOV',
  'SELECT',
  // 'DATE_PICKER',
];
// 筛选器-支持范围组件类型
export const SEARCHBAR_RANGE_COMPONENT = ['INPUT_NUMBER', 'DATE_PICKER'];

export const filterFxUnitType = ["COLLAPSE", "BTNGROUP", "FILTER", "QUERYFORM", "SECTION"];

export const isCreate = 0b010;
export const isUpdate = 0b001;

export const unitTypeColorMap = {
  "FORM": 'red',
  "QUERYFORM": 'pink',
  "FILTER": 'pink',
  "GRID": 'yellow',
  "SECTION": 'blue',
  "BTNGROUP": 'cyan',
  "TABPANE": 'yellow',
  "COLLAPSE": 'green',
  "SEARCHBAR": 'purple',
  "COMMON": "blue",
  "WORKFLOW": "geekblue", 
};

export const fields = {
}

export const unit = {
  "AF-BASIC": {
    hasFx: true,
    coverData: {
      renderOptions: "TEXT",
    }
  },
  "AF-EXTRA": {
    aggregationFlag: true,
    aggregationCode: true,
    hasFx: true,
    colSpan: true,
    coverData: {
      renderOptions: "TEXT",
    }
  }
}

/** 通用型单元类型特有单元标签 */
export const commonTypeUnitTags = ["AF-BASIC", "AF-EXTRA"];
export const getSpecialConfig = (tag) => {
  switch (tag) {
    case "AF-BASIC":
      return {
        default: "AF-B-NOR",
        /** 互斥 */
        exclusion: true,
        list: [
          { value: "AF-B-TITLE", meaning: intl.get("hpfm.customize.common.afbTitle").d("标题"), unique: true },
          { value: "AF-B-TAG", meaning: intl.get("hpfm.customize.common.afbTag").d("标签") },
          { value: "AF-B-NOR", meaning: intl.get("hpfm.customize.common.afbNormal").d("普通字段") },
        ],
      };
    default: return null;
  }

}

// 空数组表示不限制
export function limitWidgetTypeByColumnType(type) {
  switch(type) {
    case "varchar":
    case "tinytext":
    case "text":
    case "mediumtext":
    case "longtext":
    case "enum":
    case "set": return [
      "INPUT", "TEXT_AREA", "TL_EDITOR", "UPLOAD", "LINK",
      "SELECT", "LOV", "CHECKBOX", "RADIOGROUP", "SWITCH",
      'CURRENCY', "INPUT_NUMBER", "RATE",
      "DATE_PICKER", "EMPTY", "TEL_FIELD", 'EMAIL_FIELD'
    ];
    case "bit":
    case "binary":
    case "varbinary":
    case "blob":
    case "mediumblob":
    case "longblob":
    case "bigint":
    case "int":
    case "mediumint":
    case "tinyint":
    case "smallint":
    case "integer":
    case "decimal":
    case "numeric":
    case "float":
    case "double": return [
      "SELECT", "LOV", "CHECKBOX", "RADIOGROUP", "SWITCH",
      'CURRENCY', "INPUT_NUMBER", "RATE", "EMPTY", "TEL_FIELD",
    ];
    case "date":
    case "datetime":
    case "time": return ["DATE_PICKER"];
    case "timestamp": return ["INPUT", "TEXT_AREA"];
    default: return [];
  }
}
// 空数组表示不限制
export function limitDateFormatByColumnType(type) {
  switch(type) {
    case "date": return ["YYYY/MM/DD", "YYYY-MM-DD", "YYYY-MM", "YYYY/MM", "DD-MM-YYYY", "YYYYMMDD"];
    case "datetime": return []
    case "time": return ["YYYY/MM/DD HH:mm:ss", "YYYY/MM/DD hh:mm:ss", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD hh:mm:ss"];
    default: return [];
  }
}

// 限制工作流一些个性化单元添加扩展字段、编辑组合属性
export const READONLY_SEARCHBAR_UNIT_CODES = [
  'HWFP.APPROVAL_WORKBENCH_LIST.TASK.FILTER'
];

// 限制工作流一些表格单元最大分页数
export const SPECIAL_TABLE_MAX_PAGE_SIZE = {
  'HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED': 50,
};

export const FIX_DATE_RANGES = [
  'PAST_ONE_MONTH',
  'PAST_TWO_MONTH',
  'PAST_THREE_MONTH',
  'PAST_SIX_MONTH',
  'PAST_ONE_YEAR',
  'RANGE',
];