import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMBL } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 广域寻源列表 - DS
 * @returns
 */
const WideAreaListDS = () => ({
  autoQuery: false,
  pageSize: 20,
  selection: false,
  fields: [
    {
      label: intl.get(`smbl.wideAreaSourcing.modal.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.wideAreaSourcing.modal.legalRepName`).d('法定代表人'),
      name: 'legalRepName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.wideAreaSourcing.modal.localArea`).d('所在地区'),
      name: 'first_level_name',
      type: 'string',
    },
    {
      label: intl.get(`smbl.wideAreaSourcing.modal.registeredCapitalWithUnit`).d('注册资本'),
      name: 'registeredCapital',
      type: 'string',
    },
    {
      label: intl.get(`smbl.wideAreaSourcing.modal.creationDate`).d('成立日期'),
      name: 'buildDate',
      type: 'string',
    },
  ],

  transport: {
    read: ({ data, params }) => {
      const newData = { ...data, ...params };
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/source/search`,
        method: 'post',
        data: newData,
      };
    },
  },
  events: {},
});

export { WideAreaListDS };
