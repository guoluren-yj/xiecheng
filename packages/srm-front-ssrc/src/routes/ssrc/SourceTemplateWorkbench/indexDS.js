import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  primaryKey: 'templateId',
  autoQuery: false,
  dataToJSON: 'all',
  selection: 'multiple',
  pageSize: 20,
  cacheSelection: true,
  fields: [
    {
      name: 'templateStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'templateNum',
      label: intl.get(`ssrc.sourceTemplate.model.template.templateNum`).d('模板编码'),
    },
    {
      name: 'templateName',
      label: intl.get(`ssrc.sourceTemplate.model.template.templateName`).d('模板名称'),
    },
    {
      name: 'secondarySourceCategoryMeaning',
      label: intl.get(`ssrc.sourceTemplate.model.template.sourcingCategory`).d('寻源类别'),
    },
    {
      name: 'versionNumber',
      type: 'number',
      label: intl.get('ssrc.sourceTemplate.model.template.versionNumber').d('版本'),
    },
    {
      name: 'creationDate',
      label: intl.get(`ssrc.sourceTemplate.model.template.creationTime`).d('创建时间'),
    },
    {
      name: 'lastUpdateDate',
      label: intl.get(`ssrc.sourceTemplate.model.template.updateTime`).d('创建时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => ({
      url: `${SRM_SSRC}/v2/${organizationId}/source-templates/list`,
      method: 'POST',
      params: {
        ...params,
        customizeUnitCode: 'SSRC.SOURCE_TEMPLATE_WORKBENCH.FILTER_BAR',
      },
      data: {
        ...data,
        multiSTNumOrName:
          data.multiSTNumOrName && Array.isArray(data.multiSTNumOrName)
            ? data.multiSTNumOrName.join(',')
            : data.multiSTNumOrName,
      },
    }),
  },
});

export { tableDS };
