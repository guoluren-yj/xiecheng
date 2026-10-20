import { compose } from 'lodash';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import { isOpenDoubleUnit } from '@/utils/utils';
import Index from './Page';

const unitCode = [
  `SSRC.SUPPLIER_REPLY_RFP.HEADER_BUTTONS`, // 头部按钮组
  `SSRC.SUPPLIER_REPLY_RFP.BASE_HEADER`, // 基本信息
  `SSRC.SUPPLIER_REPLY_RFP.BASE_FORM`, // 征询内容
  `SSRC.SUPPLIER_REPLY_RFP.QUOTATION_FORM`, // 供应商回复
  `SSRC.SUPPLIER_REPLY.RF_DETAIL.RFP_FORM_DETAIL`, // 供应商回复详情
  'SSRC.SUPPLIER_REPLY.RF_DETAIL.RFP_QUOTATION_LINE', // 报价行详情
  'SSRC.SUPPLIER_REPLY_RFP.QUOTATION_LINE', // 报价行
  'SSRC.SUPPLIER_REPLY_RFP.ITEM_LINE', // 物料行
  'SSRC.SUPPLIER_REPLY_RFP.ATTACHMENT', // 上传附件
  'SSRC.SUPPLIER_REPLY_RFP.REPLY_HEADER', // 供应商回复头
  'SSRC.SUPPLIER_REPLY_RFP.BASE_HEADER_CARD', // 基本信息-CARD
  'SSRC.SUPPLIER_REPLY_RFP.REPLY_HEADER_CARD', // 供应商回复头-CARD
];

export default compose(
  isOpenDoubleUnit({ businessModule: 'RFX' }),
  WithCustomizeC7N({
    unitCode,
  }),
  formatterCollections({
    code: [
      'ssrc.rf',
      'ssrc.supplierQuotation',
      'ssrc.inquiryHall',
      'ssrc.bidHall',
      'ssrc.rfDetail',
      'ssrc.common',
    ],
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
        // 供应商回复提交前校验事件
        async remoteHandleReleaseValidate() {
          return true;
        },
      },
    }
  )
)(Index);
