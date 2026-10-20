import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { BID } from '@/utils/globalVariable';
import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import remote from 'hzero-front/lib/utils/remote';
import { noop } from 'lodash';

import { WrapContent } from './WrapContent';

const hocComponent = (Com) => {
  return WithCustomizeC7N({
    unitCode: [
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ONLYRED', // 当前-供应商
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SUPPLIER_HIS', // 历史-供应商
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.TIMEADJUST_READ', // 当前-时间调整
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.TIMEADJUST_HIS', // 历史-时间调整
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.PRE_ONLYREAD', // 当前-资格预审
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.BASE_INFO_READONLY', // 当前-基础信息
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.BASE_INFO_HIS', // 历史-基础信息
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF_READO_NLY', // 当前-采购组织与人员
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF_READONLY_HIS', // 历史-采购组织与人员
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.ITEMLINE_ONLYRED', // 当前标的物
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.ITEMLINE_HIS', // 历史-标的物
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE_READ', // 专家不区分商务技术
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF_READ', // 专家区分
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE_HIS', // 专家不区分商务技术历史
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF_HIS', // 专家区分历史
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_NONE_READ', // 评分要素-商务或者不区分商务技术
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_TECH_READ', // 评分要素技术
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_NONE_HIS', // 评分要素-商务或者不区分商务技术-历史
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_TECH_HIS', // 评分要素技术历史
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_READ', // 评分要素分配专家
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_HIS', //  评分要素分配专家-历史
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM_READ', // 当前-附件表单
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM_HIS', // 历史-附件表单
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.INTIALREVIEW_TABLE_READ', // 当前-符合性检查
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.INTIALREVIEW_TABLE_HIS', // 历史-符合性检查
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM_READ', // 对供应商要求-分配物料
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM_HIS', // 对供应商要求-分配物料-历史
    ],
  })(
    formatterCollections({
      code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common', 'scux.ssrc', "ssrc.biddingHall"],
    })(
      remote(
        {
          code: 'SSRC_QUOTATION_CONTROLLER_APPROVAL',
          name: 'remote',
        },
        {
          events: {
            // 组件卸载清空埋点事件
            remoteClearDSEvent() {},
            // load Business Data
            remoteLoadBusinessData(props) {
              const { loadBusinessData = noop } = props || {};
              loadBusinessData(props);
            },
            // 初始化ds event
            remoteInitDSEvent() {},
          },
        }
      )(Com)
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(hocComponent(WrapContent));
