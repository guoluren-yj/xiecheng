import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const ExectDataSet = () => ({
  autoQuery: false,
  pageSize: 10,
  selection: false,
  fields: [
    {
      label: intl.get(`sinv.common.model.common.importStatus`).d('导入状态'),
      name: 'importStatusMeaning',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.async`).d('同步执行'),
      name: 'sync',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.mmodel.closeSyncResponseMsg`).d('反馈信息'),
      name: 'importMessage',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.exSystemName`).d('外部系统'),
      name: 'sourceCode',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.mportType`).d('接口代码'),
      name: 'importType',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.interName`).d('接口名称'),
      name: 'interName',
      width: 150,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-inter-record`,
        method: 'GET',
      };
    },
  },
});

export { ExectDataSet };
