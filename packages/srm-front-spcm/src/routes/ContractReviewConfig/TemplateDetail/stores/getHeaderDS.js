import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { getUnitCodes } from "../utils/utils";

const organizationId = getCurrentOrganizationId();

// 审查模版ds
const getHeaderDs = ({ reviewTemplateId } = {}) => ({
  paging: false,
  forceValidate: true,
  primaryKey: 'reviewTemplateId',
  fields: [
    {
      name: 'reviewTemplateCode',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.templateCode').d('审查模板编码'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'reviewTemplateName',
      type: 'intl',
      label: intl.get('spcm.contractReview.model.contractReview.templateName').d('审查模板名称'),
      dynamicProps: {
        required: () => true,
      },
    },
    {
      name: 'templateStatus',
      // SPCM_REVIEW_TEMPLATE_STATUS
      label: intl.get('hzero.common.common.status').d('状态'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'versionNumber',
      label: intl.get('spcm.common.view.common.version').d('版本'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'createdByName',
      label: intl.get('hzero.common.creationName').d('创建人'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'creationDate',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'reviewTemplateDesc',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.templateDesc').d('审查模板说明'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/check-template-headers/${reviewTemplateId}/detail`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode: getUnitCodes.headerCode,
        },
        data: {},
      };
    },
  },
});

export { getHeaderDs };
