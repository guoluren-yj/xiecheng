/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2023-08-31 16:34:46
 * @LastEditors: yiping.liu
 */
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';
import { noop } from 'lodash';

import CombineComponent from '@/routes/components/CombineComponent';
import { BID, BID_LOWERCASE } from '@/utils/globalVariable';

import { DetailComponent } from './index';

// 引用类型函数
const hocComponent = (Com = {}) => {
  return CombineComponent({
    sourceKeyLowerCase: BID_LOWERCASE,
    sourceKey: BID,
  })(
    WithCustomizeC7N({
      unitCode: [
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SUPPLIER', // 供应商
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER', // 对供应商要求 -> 批量添加供应商
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.TIMEADJUST', // 时间调整
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.PREQUALIFICATION', // 资格预审
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.BASE_INFO', //
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF', // 采购组织及人员
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.ITEMLINE', // 标的物
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE', // 专家不区分
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF', // 专家区分
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_NONE', // 评分要素-商务或者不区分
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_TECHNOLOFY', // 评分要素技术
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN', // 评分要素分配专家
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_V2', // 评分要素专家分配
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER_QUERY', // 添加供应商查询条件
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM', // 附件表单
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.HEADER_CARD', // 标题卡片
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.INTIALREVIEW_TABLE', // 符合性检查
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SUPPLIER_BUTTONS', // 批量添加供应商表格按钮
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM', // 对供应商要求-分配物料
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_INDICS_TECHNOLOGY_BTN', // 评分要素技术按钮组
        `SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_INDICS_BTN`, // 评分要素-商务或者不区分按钮组
        `SSRC.BID_QUOTATION_CONTROLLER_DETAIL.EXPERT_SCORE_BUTTONS`, // 专家表格按钮组
        `SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_DETAIL_TEMPLATE_FORM`, // 要素选择模板
        'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.HEADER_BUTTONS_NEW', // HEADER BUTTONS
      ],
    })(
      formatterCollections({
        code: [
          'ssrc.quoController',
          'ssrc.inquiryHall',
          'ssrc.common',
          'scux.ssrc',
          'ssrc.score',
          'ssrc.biddingHall',
        ],
      })(
        remote(
          {
            code: 'SSRC_QUOTATION_CONTROLLER_UPDATE',
            name: 'remote',
          },
          {
            events: {
              handleScoreFormulaRender(props = {}) {
                const {
                  evaluateIndicDetail = {},
                  scoreFormula = noop,
                  customizeRenderFn = noop,
                } = props;
                const params = {
                  ...evaluateIndicDetail,
                  customizeRenderFn,
                };
                scoreFormula(params);
              },
              handleSaveScoreWeight(props = {}) {
                const { sureScoreWeightEvent = noop } = props || {};
                sureScoreWeightEvent(props);
              },
              // 清空价格要素ds
              clearPriceScoringDS() {},
              // 价格要素处理数据
              remoteFetchScoreDetail(props = {}) {
                const { remoteFetchScoreDetail = noop, businessIndicList = [] } = props || {};
                remoteFetchScoreDetail(businessIndicList);
              },
              // 价格
              priceSetQueryParameter() {},
              priceScoreClearDS() {},
              // 要素表格保存
              createFunc(props) {
                const { createFunc = noop } = props || {};
                createFunc();
              },
              // 清空商务附件技术附件UUID
              clearAttachmentUUid(eventProps) {
                const { AttachmentDS } = eventProps || {};
                if (AttachmentDS) {
                  AttachmentDS.submit();
                }
              },
              // 提交
              handleRemoteSubmit(eventProps) {
                const { doSubmit = noop } = eventProps || {};
                doSubmit();
              },
              rfxDemandFormCuxInit() {},
              remoteRfxDemandFormCuxInitPage() {},
            },
          }
        )(Com)
      )
    )
  );
};

export default hocComponent(DetailComponent);

export { hocComponent };
