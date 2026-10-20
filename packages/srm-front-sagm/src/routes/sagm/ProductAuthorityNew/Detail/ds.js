import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const excludeUserTableDS = (readOnly) => ({
  selection: readOnly ? false : 'multiple',
  paging: false,
  fields: [
    {
      label: intl.get('sagm.common.view.account').d('账户'),
      name: 'loginName',
    },
    {
      label: intl.get('sagm.common.view.name').d('名称'),
      name: 'realName',
    },
  ],
});

const excludeSkuTableDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    { name: 'skuCode', label: intl.get('sagm.common.model.productCode').d('商品编码') },
    { name: 'skuName', label: intl.get('sagm.common.model.productName').d('商品名称') },
    { name: 'categoryName', label: intl.get('sagm.common.model.plateformCategory').d('平台分类') },
    { name: 'catalogName', label: intl.get('sagm.common.model.catalog').d('目录') },
    {
      name: 'agreementPrice',
      type: 'number',
      label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
    },
    {
      name: 'nakedPrice',
      type: 'number',
      label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
    },
    { name: 'uomName', label: intl.get('sagm.common.model.uom').d('单位') },
    { name: 'agreementNumber', label: intl.get('sagm.common.model.agreementNum').d('协议号') },
    {
      name: 'agreementLineNumber',
      label: intl.get('sagm.common.model.lineNumber').d('行号'),
      type: 'number',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/sagm/v1/${organizationId}/auth-exclude-sku-details`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

export { excludeUserTableDS, excludeSkuTableDS };
