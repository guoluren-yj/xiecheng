import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

const prefix = `${SRM_SSRC}/v1`;

const tableDS = (config = {}) => {
  const { quotationName = '' } = config || {};
  return {
    paging: false,
    selection: false,
    primaryKey: 'supOptExtInfoId',
    fields: [
      // {
      //   name: 'quotationRoundNumber',
      //   type: 'string',
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次'),
      // },
      // {
      //   name: 'quotationCount',
      //   type: 'string',
      //   label: intl
      //     .get(`ssrc.common.view.quotationNumber`, {
      //       quotationName,
      //     })
      //     .d('{quotationName}次数'),
      // },
      {
        label: intl.get('ssrc.common.view.operateIpNodes').d('操作IP节点'),
        name: 'operateNode',
        showType: 'string',
      },
      {
        label: intl.get('ssrc.common.view.ipSubmittedTime').d('IP获取时间'),
        name: 'submittedDate',
        showType: 'dateTime',
      },
      {
        name: 'supplierCompanyIp',
        type: 'string',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonSupplierCompanyIp`, {
            quotationName,
          })
          .d('{quotationName}IP'),
      },
      {
        name: 'supplierIpAttribution',
        type: 'string',
        label: intl.get(`ssrc.common.view.IPSourceAddress`).d('IP地址属地'),
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const { organizationId, ...others } = dataSet.getQueryParameter('QUERY') || {};
        if (!organizationId) {
          return;
        }

        return {
          url: `${prefix}/${organizationId}/rfx-sup-opt-ext-infos`,
          method: 'GET',
          data: {
            ...others,
            page: -1, // 查询所有
          },
        };
      },
    },
  };
};
export { tableDS };
