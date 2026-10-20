import { compose } from 'lodash';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';
import Index from '../newDetail/Page';

const unitCode = [
  `SSRC.SUPPLIER_REPLY_RFI.HEADER_BUTTONS`, // 头部按钮组
  `SSRC.SUPPLIER_REPLY.RFI_HISTORY.BASE_HEADER`, // 基本信息
  `SSRC.SUPPLIER_REPLY.RFI_HISTORY.BASE_FORM`, // 征询内容
  `SSRC.SUPPLIER_REPLY.RFI_HISTORY.QUOTATION_FORM`, // 供应商回复
  'SSRC.SUPPLIER_REPLY.RFI_HISTORY.QUOTATION_LINE', // 报价行
  'SSRC.SUPPLIER_REPLY_RFI.BASE_HEADER_CARD', // 基本信息-CARD
  // 'SSRC.SUPPLIER_REPLY_RFI.REPLY_HEADER_CARD', // 供应商回复头-CARD
];

export default compose(
  WithCustomizeC7N({
    unitCode,
  }),
  formatterCollections({
    code: ['ssrc.rf', 'ssrc.supplierQuotation', 'ssrc.inquiryHall'],
  }),
  remote(
    {
      code: 'SSRC_SUPPLIER_RF_QUOTATION',
      name: 'remote',
    },
    {
      events: {
        // 供应商回复保存后的回调事件
        remoteSaveUpdateCallBackEvent() {},
      },
    }
  )
)(Index);
