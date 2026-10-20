import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { SRM_SSRC } from '_utils/config';
// import { formatTreeData } from './utils';

// const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  autoQuery: false,
  selection: false,
  paging: true,
  pageSize: 5,
  // table表单显示的字段
  fields: [
    {
      name: 'rfxTitle',
      label: intl.get('ssrc.findBusiness.model.common.rfxTitle').d('标题'),
    },
    {
      name: 'companyName',
      label: intl.get('ssrc.findBusiness.model.common.companyName').d('招标单位'),
    },
    {
      name: 'prequalEndDate',
      label: intl.get('ssrc.findBusiness.model.common.prequalEndDate').d('资格预审截止时间'),
    },
    {
      name: 'quotationEndDate',
      label: intl.get('ssrc.findBusiness.model.common.quotationEndDate').d('报价截止时间'),
    },
    {
      name: 'bidFileExpense',
      type: 'number',
      label: intl.get('ssrc.findBusiness.model.common.bidFileExpense').d('招标文件费'),
    },
    {
      name: 'bidBond',
      type: 'number',
      label: intl.get('ssrc.findBusiness.model.common.bidBond').d('保证金'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { releasedDate, bidFileExpense, bidBond, ...others } = data || {};
      const rangeParams = {
        bidBond_range: bidBond,
        releasedDate_range: releasedDate,
        bidFileExpense_range: bidFileExpense,
      };
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx-header-vips/list`,
        method: 'POST',
        data: {
          ...others,
          ...rangeParams,
        },
      };
    },
  },
});

const searchDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'searchText',
      type: 'string',
      // label: intl.get('ssrc.findBusiness.view.placeholder.KeywordSearch').d('请输入您要查询的内容'),
    },
  ],
});

export { tableDS, searchDS };
