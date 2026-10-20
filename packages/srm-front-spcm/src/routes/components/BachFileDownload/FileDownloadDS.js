/*
 * @Description:
 * @Date: 2022-08-17 14:56:49
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 附件下载
const fileDownloadDS = (pcHeaderIds = [], attachTypeList = []) => {
  return {
    selection: false,
    autoCreate: true,
    primaryKey: 'id',
    fields: [
      {
        label: intl.get('spcm.common.model.contentName').d('自定义文件夹名'),
        name: 'contentName',
        required: true,
        defaultValue: intl.get('spcm.common.view.msg.contractAttachment').d('协议附件'),
      },
      {
        label: intl.get('spcm.common.model.exportType').d('导出类型'),
        name: 'exportType',
        defaultValue: 'zip',
      },
      {
        label: intl.get('spcm.common.model.maxCapacity').d('文件最大容量'),
        name: 'maxCapacity',
        defaultValue: '1GB',
      },
      {
        label: intl.get('spcm.common.model.isAsync').d('异步'),
        name: 'isAsync',
        lookupCode: 'HPFM.FLAG',
        defaultValue: 1,
      },
      {
        label: intl.get('spcm.common.model.downloadDimension').d('下载维度'),
        name: 'downloadDimension',
        defaultValue: '2',
      },
      {
        label: intl.get(`spcm.common.model.attachmentType`).d('附件类型'),
        name: 'attachmentTypes',
      },
    ],
    transport: {
      submit: ({ data }) => {
        const fieldNames = attachTypeList.map((type) => type.value);
        const newData = data[0];
        const attachmentTypes = fieldNames.filter((field) => {
          if (newData[field]) {
            delete newData[field];
            return true;
          }
          return false;
        });
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-download`,
          method: 'POST',
          data: { ...newData, attachmentTypes, pcHeaderIds },
        };
      },
    },
  };
};

export { fileDownloadDS };
