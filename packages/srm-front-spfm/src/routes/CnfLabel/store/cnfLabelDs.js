/**
 * cnfLabelDs.js - 业务规则定义标签DS
 * @date: 2020-09-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

function getCnfLabelDs() {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'labelCode',
        type: 'string',
        required: true,
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelCode').d('标签编码'),
      },
      {
        name: 'labelName',
        type: 'intl',
        required: true,
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelName').d('标签名称'),
      },
      {
        name: 'serviceList',
        type: 'object',
        label: intl.get('spfm.cnfLabel.model.cnfLabel.service').d('对应服务'),
        lovCode: 'SPFM.CNF_SERVICE_VIEW',
        multiple: true,
        required: true,
        textField: 'serviceName',
        valueField: 'serviceCode',
      },
    ],
    queryFields: [
      {
        name: 'labelCode',
        type: 'string',
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelCode').d('标签编码'),
      },
      {
        name: 'labelName',
        type: 'string',
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelName').d('标签名称'),
      },
      {
        name: 'serviceList',
        type: 'object',
        label: intl.get('spfm.cnfLabel.model.cnfLabel.service').d('对应服务'),
        lovCode: 'SPFM.CNF_SERVICE_VIEW',
        textField: 'serviceName',
        valueField: 'serviceCode',
        ignore: 'always',
      },
      {
        name: 'serviceCode',
        type: 'string',
        bind: 'serviceList.serviceCode',
      },
    ],
    transport: {
      read: {
        url: `${SRM_PLATFORM}/v1/cnf-labels`,
        method: 'GET',
      },
    },
  };
}

export default getCnfLabelDs;
