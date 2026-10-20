/**
 * listDS.js
 * EDI的供应商接口配置
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';

export default function () {
  return {
    autoQuery: false,
    selection: 'multiple',
    fields: [
      {
        name: 'authTypeCode',
        type: 'string',
        textField: 'value',
        lookupCode: 'SPFM.SUPPLIER_ITF_AUTH_TYPE',
        required: true,
        label: intl.get('spfm.ediAuth.model.view.authTypeCode').d('类型编码'),
      },
      {
        name: 'authTypeCodeMeaning',
        type: 'string',
        ignore: 'always',
        label: intl.get('spfm.ediAuth.model.view.authTypeMeaning').d('类型描述'),
      },
    ],
    queryFields: [
      {
        name: 'authTypeCode',
        type: 'string',
        width: 200,
        textField: 'value',
        lookupCode: 'SPFM.SUPPLIER_ITF_AUTH_TYPE',
        // lookupCode: 'SPFM.SUPPLIER_ITF_AUTH_TYPE',
        label: intl.get('spfm.ediAuth.model.view.authTypeCode').d('类型编码'),
      },
      // {
      //   name: 'authTypeCodeMeaning',
      //   type: 'string',
      //   label: intl.get('spfm.ediAuth.model.view.authTypeMeaning').d('类型描述'),
      // },
    ],
  };
}
