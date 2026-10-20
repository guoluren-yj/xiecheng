/**
 * addressDS.js - 地址DS
 * @date: 2020-09-09
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';

function addressDS() {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'companyAddressId',
      },
      {
        name: 'countryObj',
        type: 'object',
        required: true,
        lovCode: 'HPFM.COUNTRY',
        lovPara: { enabledFlag: 1 },
        label: intl.get(`spfm.address.model.address.countryId`).d('国家'),
      },
      {
        name: 'countryId',
        type: 'string',
        bind: 'countryObj.countryId',
        required: true,
      },
      {
        name: 'countryCode',
        type: 'string',
        bind: 'countryObj.countryCode',
      },
      {
        name: 'countryName',
        type: 'string',
        bind: 'countryObj.countryName',
      },
      {
        name: 'quickIndex',
        bind: 'countryObj.quickIndex',
      },
      {
        name: 'regionId',
        type: 'string',
        label: intl.get(`spfm.address.model.address.regionId`).d('省/市/区'),
      },
      {
        name: 'regionPathName',
        readOnly: true,
        type: 'string',
        validator: (value, name, record) => {
          const { countryCode, quickIndex, isLeaf = true, regionId } = record.get([
            'countryCode',
            'quickIndex',
            'isLeaf',
            'regionId',
          ]);
          if (countryCode === 'CN' || quickIndex === 'CN') {
            if (!isLeaf && regionId) {
              return intl.get('sslm.common.view.message.lastRegion').d('须选择填写至最末级地区');
            }
            return true;
          }
          return true;
        },
      },
      {
        name: 'addressDetail',
        type: 'intl',
        required: true,
        label: intl.get(`spfm.address.model.address.businessAddress`).d('经营地址'),
      },
      {
        name: 'quickIndex',
        bind: 'countryObj.quickIndex',
      },
      {
        name: 'postCode',
        type: 'string',
        label: intl.get(`spfm.address.model.address.postCode`).d('邮政编码'),
        dynamicProps: {
          pattern: ({ record }) =>
            record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN'
              ? /^[0-9]*$/
              : false,
          minLength: ({ record }) =>
            record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN' ? 6 : null,
          maxLength: ({ record }) =>
            record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN' ? 6 : null,
          defaultValidationMessages: ({ record }) => {
            return record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN'
              ? {
                  tooShort: intl
                    .get(`spfm.address.model.address.validate.postCode`)
                    .d('请输入6位数字'),
                }
              : {};
          },
        },
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get(`spfm.address.model.address.description`).d('地址备注'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        label: intl.get('hzero.common.status.enable').d('启用'),
      },
      {
        name: 'option',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
  };
}

export default addressDS;
