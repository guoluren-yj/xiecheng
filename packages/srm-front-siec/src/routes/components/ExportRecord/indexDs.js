import intl from 'utils/intl';
import { SRM_SIEC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const importModalDS = () => ({
  primaryKey: 'recordId',
  selection: false,
  modifiedCheck: false,
  fields: [
    {
      type: 'string',
      name: 'importTypeMeaning',
      label: intl.get(`sinv.common.model.common.importTypeMeaning`).d('导出类型'),
    },
    {
      type: 'string',
      name: 'importStatusMeaning',
      label: intl.get(`sinv.common.model.common.importStatusMeaning`).d('导出状态'),
    },
    {
      type: 'string',
      name: 'externalSystemCode',
      label: intl.get(`sinv.common.model.common.externalSystemCode`).d('外部系统编码'),
    },
    {
      type: 'string',
      name: 'importMessage',
      label: intl.get(`sinv.common.model.common.exectMessage`).d('导出消息'),
    },
    {
      type: 'date',
      name: 'lastUpdateDate',
      label: intl.get(`sinv.common.model.common.lastUpdateDates`).d('操作日期'),
    },
    {
      type: 'string',
      name: 'lastUpdatedName',
      label: intl.get(`sinv.common.model.common.lastUpdatedName`).d('操作人'),
    },
    {
      type: 'string',
      name: 'button',
      label: intl.get(`sinv.common.model.common.button`).d('按钮'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const query = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/pcn-export-records/${params.pcnHeaderId}/${params.pcnLineId}`,
        method: 'GET',
        data: query,
      };
    },
  },
});

export default importModalDS;
