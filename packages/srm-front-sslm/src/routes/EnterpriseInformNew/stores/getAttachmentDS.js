/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { HZERO_PLATFORM } from 'utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM, PRIVATE_BUCKET, SRM_PLATFORM } from '_utils/config';

import { getReadTransport } from '../utils';

const organizationId = getCurrentOrganizationId();

export const getAttachmentDS = ({
  isAllPlatform = false,
  partnerTenantId,
  readOnlyFlag = false,
  code = '',
  ...rest
} = {}) => ({
  paging: false,
  forceValidate: true,
  // dataKey: readOnlyFlag ? 'newAttachments' : null,
  fields: [
    {
      name: 'attachmentFileType',
      required: true,
      label: intl.get('sslm.enterpriseInform.view.model.attachment.type').d('附件类型'),
      options: optionDs({ isAllPlatform, partnerTenantId }),
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
      label: intl.get('sslm.common.model.attachment.longEffective').d('长期有效'),
      name: 'longEffectiveFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      label: intl.get('sslm.enterpriseInform.view.model.attachment.uploadDate').d('最后上传时间'),
      name: 'uploadDate',
      type: 'date',
    },
    {
      label: intl.get('sslm.enterpriseInform.view.model.attachment.upload').d('附件上传'),
      name: 'attachmentUuid',
      required: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-comp',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
    {
      name: 'objectFlag',
      ignore: 'always',
      label: intl.get('sslm.common.model.common.changeType').d('变更类型'),
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'longEffectiveFlag':
          record.set({ endDate: null });
          break;
        default:
          break;
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (+record.get('supplierAttFlag')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      // 只读页面标红用readUrlProps这个接口
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/no-basic`
        : `${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs/no-basic`;
      return !readOnlyFlag
        ? {
            url,
            method: 'GET',
            params: {},
            data: {
              changeReqId,
              companyId,
              supplierFlag: isAllPlatform ? 0 : 1,
              supplierCompanyId,
              dataSource: 1,
              customizeUnitCode: isAllPlatform ? null : code,
              customizeTenantId: isAllPlatform ? null : partnerTenantId,
            },
          }
        : readUrlProps;
    },
    destroy: ({ data }) => {
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/delete`
        : `${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs/delete`;
      return {
        url,
        method: 'DELETE',
        data,
      };
    },
    submit: ({ dataSet, data }) => {
      const { changeReqId, companyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs`
        : `${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs`;
      return {
        url,
        method: 'POST',
        data: {
          changeReqId,
          companyId,
          supplierFlag: isAllPlatform ? 0 : 1,
          dataSource: 1,
          comAttachmentReqs: data,
        },
        params: {
          dataSource: 1,
          customizeUnitCode: isAllPlatform ? null : code,
          customizeTenantId: isAllPlatform ? null : partnerTenantId,
        },
      };
    },
  },
});

const optionDs = ({ isAllPlatform = false, partnerTenantId }) =>
  new DataSet({
    autoQuery: true,
    childrenField: 'children',
    transport: {
      read: {
        url: `${HZERO_PLATFORM}/v1/${
          isAllPlatform ? organizationId : partnerTenantId
        }/lovs/value/tree`,
        method: 'GET',
        params: {
          tenantId: isAllPlatform ? organizationId : partnerTenantId,
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
