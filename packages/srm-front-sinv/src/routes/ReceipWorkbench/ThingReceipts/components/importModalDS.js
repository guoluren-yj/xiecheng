/**
 * @author biao.zhu@going-link.com
 * @since 2021-07-15 16:41:25
 * @lastTime 2021-07-15 16:44:33
 * @description 收货工作台-导出状态Modal
 * @copyright Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const importModalDS = () => ({
  primaryKey: 'recordId',
  selection: false,
  modifiedCheck: false,
  pageSize: 20,
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
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-change-records/${query.headerId}/${query.id}`,
        method: 'GET',
        data: query,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      const data = dataSet?.map((item) => item.toData()) || [];
      const arr = data?.filter((item) => item?.importType === 'SINV_TO_SLOD') || [];
      const slodImportStatus = arr[0]?.importStatus || null;
      dataSet.forEach((record) => {
        record.set({ slodImportStatus });
      });
    },
  },
});

export { importModalDS };
