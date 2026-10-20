import intl from 'srm-front-boot/lib/utils/intl';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (businessObjectCode) =>
  ({
    autoCreate: true,
    paging: true,
    pageSize: 10,
    selection: false,
    queryFields: [
      {
        name: 'keyword',
        label: intl.get('hmde.bo.field.associateCodeOrName').d('关系编码或名称'),
        merge: true,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hzero.common.model.status.enabledFlag').d('状态'),
        display: true,
        optionsData: [
          {
            value: true,
            meaning: intl.get('hzero.common.model.status.enable').d('启用'),
          },
          {
            value: false,
            meaning: intl.get('hzero.common.model.status.disable').d('禁用'),
          },
        ],
      },
      {
        name: 'associateType',
        label: intl.get('hmde.bo.field.associateType').d('关系'),
        display: true,
        optionsData: [
          {
            value: 'LINK',
            meaning: intl.get('hmde.bo.view.messages.link').d('关联'),
          },
          {
            value: 'SLAVE_MASTER',
            meaning: intl.get('hmde.bo.view.messages.salve_master').d('从主'),
          },
        ],
      },
      {
        name: 'onlySingleFieldFlag',
        label: intl.get('hzero.common.model.type').d('类型'),
        display: true,
        optionsData: [
          {
            value: true,
            meaning: intl.get('hzero.common.model.singleFieldRelation').d('单字段关系'),
          },
          {
            value: false,
            meaning: intl.get('hmde.bo.view.messages.moreFieldRelation').d('多字段关系'),
          },
        ],
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-associates/page?masterBusinessObjectCode=${businessObjectCode}`,
          method: 'GET',
        };
      },
    },
  } as any);
