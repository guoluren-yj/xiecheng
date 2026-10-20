import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const TableDS = (recordId) => ({
  primaryKey: 'callRecordId',
  autoQuery: true,
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'callResult',
      label: intl.get(`spc.advancedPricingRecord.model.callResult`).d('调用结果'),
    },
    {
      name: 'recordNum',
      label: intl.get(`spc.advancedPricingRecord.model.recordNum`).d('调用记录编码'),
    },
    {
      name: 'triggerMode',
      label: intl.get(`spc.advancedPricingRecord.model.triggerMode`).d('触发方式'),
      lookupCode: 'SPC.PRICE.ADJUST_TRIGGER_MODE',
    },
    {
      name: 'errorMsg',
      label: intl.get(`spc.advancedPricingRecord.model.errorMsg`).d('错误信息'),
    },
    {
      name: 'callTime',
      label: intl.get(`spc.advancedPricingRecord.model.callTime`).d('调用时间'),
      type: 'date',
    },
    {
      name: 'callByName',
      label: intl.get(`spc.advancedPricingRecord.model.callByName`).d('调用人'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-adjust-records/call-record/${recordId}`,
        method: 'GET',
        data,
      };
    },
  },
});


export { TableDS };
