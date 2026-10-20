// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const commonPrompt = 'sprm.forecastMgt.model.common';
const organizationId = getCurrentOrganizationId();

const wholeDs = () => ({
  pageSize: 20,
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'templateStatus',
      lookupCode: `SFCS.FCST_TEMPLATE_STATUS`,
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'templateCode',
      label: intl.get(`${commonPrompt}.templateCode`).d('模板编码'),
    },
    {
      name: 'templateName',
      label: intl.get(`${commonPrompt}.templateName`).d('模板名称'),
    },
    {
      name: 'createdByName',
      label: intl.get(`${commonPrompt}.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`${commonPrompt}.enabledFlag`).d('启用'),
    },

    {
      name: 'operation',
      label: intl.get(`${commonPrompt}.operate`).d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { templateStatus } = data;
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/fcst-template-headers`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          templateStatus: templateStatus === 'DISABLED' ? undefined : templateStatus,
          enabledFlag: ['UNRELEASED', 'RELEASED', undefined, null].includes(templateStatus)
            ? undefined
            : 0,
          customizeUnitCode: 'SPRM.FORECAST_LIB.SEARCHBAR',
        }),
      };
    },
  },
});

const operateRecordDs = () => ({
  paging: false,
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'processTypeCode',
      lookupCode: `SFCS.FCST_TEMPLATE_STATUS`,
      label: intl.get(`hzero.common.oprate`).d('操作'),
    },
    {
      name: 'processTypeCode',
      label: intl.get(`${commonPrompt}.processTypeCode`).d('操作描述'),
    },
    {
      name: 'processUserName',
      label: intl.get(`${commonPrompt}.processUserName`).d('操作人'),
    },
    {
      name: 'processDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.processDate`).d('创建时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { templateHeaderId } = data;
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/fcst-template-actions/${templateHeaderId}`,
        method: 'GET',
      };
    },
  },
});

export { wholeDs, operateRecordDs };
