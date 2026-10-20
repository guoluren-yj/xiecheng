import intl from 'utils/intl';

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
    default:
      return intl.get('hpfm.customize.common.fieldCode').d('字段编码');
  }
}
export function getFieldNameAlias(type) {
  switch (type) {
    case 'TABPANE':
      return intl.get('hpfm.customize.common.tabsName').d('标签页名称');
    default:
      return intl.get('hpfm.customize.common.fieldName').d('字段名称');
  }
}
export function getFieldConfigAlias(type) {
  switch (type) {
    case 'TABPANE':
      return intl.get('hpfm.customize.common.tabsConfig').d('标签页配置');
    default:
      return intl.get('hpfm.customize.common.fieldConfig').d('字段配置');
  }
}
export function getAddFieldAlias(type) {
  switch (type) {
    case 'TABPANE':
      return intl.get('hpfm.customize.common.addTabPane').d('添加标签页');
    default:
      return intl.get('hpfm.customize.common.addField').d('添加字段');
  }
}
export function getEditFieldAlias(type) {
  switch (type) {
    case 'TABPANE':
      return intl.get('hpfm.customize.common.editTabPane').d('编辑标签页');
    default:
      return intl.get('hpfm.customize.common.editField').d('编辑字段');
  }
}

export const extReg = /(.+)Lov$/;

export const helpNodeStyle = {
  pointerEvents: 'auto',
  position: 'relative',
  opacity: 0.65,
  marginLeft: '8px',
  marginRight: 0,
  fontSize: '14px',
  verticalAlign: 'text-top',
  lineHeight: 1,
};
