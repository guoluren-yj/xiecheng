// 根据双单位配置开启返回显示名称 开启:基本单位，基本数量, 不开启:单位,数量
export function getDynamicLabel(config = 0, field) {
  switch (field) {
    case 'quantity':
      return !config
        ? intl.get(`spcm.common.model.common.quantity`).d('数量')
        : intl.get(`spcm.common.model.common.base.quantity`).d('基本数量');
    case 'taxIncludedUnitPrice':
      return !config
        ? intl.get(`spcm.common.model.common.inculdeTaxUnitPrice`).d('原币单价(含税)')
        : intl.get(`spcm.common.model.common.base.inculdeTaxUnitPrice`).d('基本原币单价(含税)');
    case 'unitPrice':
      return !config
        ? intl.get(`spcm.common.model.common.unitPrice`).d('原币单价(不含税)')
        : intl.get(`spcm.common.model.common.base.unitPrice`).d('基本原币单价(不含税)');
    case 'ladderFrom':
      return !config
        ? intl.get('spcm.common.model.common.quantityFrom').d('数量从(>=)')
        : intl.get('spcm.common.model.common.base.quantityFrom').d('基本数量从(>=)');
    case 'ladderTo':
      return !config
        ? intl.get('spcm.common.model.common.quantityTo').d('数量至(<=)')
        : intl.get('spcm.common.model.common.base.quantityTo').d('基本数量至(<=)');
    case 'validLadderPrice':
      return !config
        ? intl.get('spcm.common.model.new.price').d('单价(含税)')
        : intl.get('spcm.common.model.new.base.price').d('基本单价(含税)');
    case 'validNetLadderPrice':
      return !config
        ? intl.get('spcm.common.model.ladderNetPrice').d('单价(不含税)')
        : intl.get('spcm.common.model.base.ladderNetPrice').d('基本单价(不含税)');
    default:
      return !config
        ? intl.get(`spcm.common.model.common.unit`).d('单位')
        : intl.get(`spcm.common.model.common.base.unit`).d('基本单位');
  }
};