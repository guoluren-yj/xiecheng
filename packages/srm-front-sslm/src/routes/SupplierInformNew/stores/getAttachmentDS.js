/*
 * @Date: 2023-04-11 11:18:34
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { HZERO_PLATFORM } from 'utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM, PRIVATE_BUCKET } from '_utils/config';

import { bucketDirectory } from '@/routes/utils/utils';

const organizationId = getCurrentOrganizationId();

const optionDs = new DataSet({
  autoQuery: true,
  childrenField: 'children',
  transport: {
    read: {
      url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/value/tree`,
      method: 'GET',
      params: {
        tenantId: organizationId,
        'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
        'SPFM.COMPANY.SUB_ATTACHMENT': 2,
      },
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          const { children, parentValue } = record.get(['children', 'parentValue']);
          if (!children && !parentValue) {
            record.set('disabled', true);
          }
        });
      }
    },
  },
});

export const getAttachmentDS = ({ isEdit = true } = {}) => ({
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'attachmentFileType',
      required: isEdit,
      label: intl.get('sslm.enterpriseInform.view.model.attachment.type').d('附件类型'),
      options: optionDs,
      textField: 'meaning',
      valueField: 'value',
      transformResponse: (value, record) => {
        const { attachmentType, subAttachment } = record;
        if (attachmentType && subAttachment) {
          return [attachmentType, subAttachment];
        } else if (subAttachment) {
          return [subAttachment];
        } else {
          return value;
        }
      },
    },
    {
      name: 'attachmentType',
    },
    {
      name: 'subAttachment',
    },
    {
      label: intl.get('sslm.enterpriseInform.view.model.attachment.description').d('附件描述'),
      name: 'description',
    },
    {
      label: intl.get('sslm.enterpriseInform.view.model.attachment.endDate').d('文件到期日'),
      name: 'endDate',
      type: 'date',
      dynamicProps: {
        disabled: ({ record }) => record.get('longEffectiveFlag'),
        required: ({ record }) => !record.get('longEffectiveFlag'),
        min: ({ record }) => {
          const uploadDate = record.get('uploadDate');
          if (uploadDate) {
            const newUploadDate = record.get('uploadDate').format(DEFAULT_DATE_FORMAT);
            const minUploadDate = moment(newUploadDate).add(1, 'days');
            return minUploadDate;
          }
        },
      },
      transformRequest: value => value && value.format(DEFAULT_DATE_FORMAT),
    },
    {
      label: intl.get('sslm.supplierInform.model.attachment.longEffective').d('是否长期有效'),
      name: 'longEffectiveFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get('sslm.enterpriseInform.view.model.attachment.uploadDate').d('最后上传时间'),
      name: 'uploadDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sslm.enterpriseInform.view.model.attachment.upload').d('附件上传'),
      name: 'attachmentUuid',
      required: isEdit,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.supplierInfo,
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'longEffectiveFlag':
        case 'attachmentUuid':
          record.set({ endDate: null });
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs/no-basic`,
        method: 'GET',
        params: {},
        data: {
          companyId,
          changeReqId,
          dataSource: 2,
          supplierFlag: 1,
          supplierCompanyId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT',
        },
      };
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs/delete`,
      method: 'DELETE',
      params: { customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT' },
    },
  },
});
