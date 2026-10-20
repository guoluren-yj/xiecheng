/*
 * @Date: 2023-10-24 15:23:43
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';

const organizationId = getCurrentOrganizationId();

// 附件信息
const getAttachmentDS = ({ isEdit }) => ({
  primaryKey: 'attId',
  cacheSelection: true,
  selection: isEdit ? 'multiple' : false,
  pageSize: 20,
  autoQuery: false,
  fields: [
    {
      label: intl.get('sslm.common.view.attachment.name').d('附件名称'),
      name: 'attachmentDesc',
    },
    {
      label: intl.get('sslm.common.view.attachment.size').d('附件大小(MB)'),
      name: 'attachmentSize',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.realName`).d('上传人'),
      name: 'uploadUserName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间'),
      name: 'uploadDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型'),
      name: 'attachmentType',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.maturityDate`).d('文件到期日'),
      name: 'dueDate',
      type: 'date',
      transformRequest: val => val && moment(val).format(DEFAULT_DATETIME_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATETIME_FORMAT),
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'option',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParam, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-line-att-lns`,
        method: 'GET',
        data: {
          ...other,
          ...queryParam,
        },
      };
    },
    destroy: ({ data }) => {
      const attIdList = data.map(record => record.attId) || [];
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-line-att-lns`,
        method: 'DELETE',
        data: {
          supplyAbilityLineAttLnIds: attIdList,
          optional: true,
        },
        params: {
          customizeUnitCode: '',
        },
      };
    },
  },
});

export { getAttachmentDS };
