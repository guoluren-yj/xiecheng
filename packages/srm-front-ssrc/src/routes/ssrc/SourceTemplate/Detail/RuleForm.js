/**
 * RuleForm - 寻源规则配置表单
 * @date: 2018-12-23
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Select, Row, Col, Checkbox, Radio, InputNumber, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNull, isUndefined, map, isNil } from 'lodash';

import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getCurrentScoreType } from '@/utils/utils';
import { AutoDeferPeriod } from './Components';

import styles from './index.less';

const RadioGroup = Radio.Group;
const promptCode = 'ssrc.sourceTemplate';

export default class RuleForm extends PureComponent {
  /**
   * setValue - onChange 子集信息
   * @description 规则： 启动自动延时{0,1}
   * @description  改变值：[{'autoDeferDuration':'延时时长'},{'autoDeferPeriod':'延时时段'},
   */
  setValue = (e) => {
    const { form } = this.props;
    if (e.target.checked === 0) {
      form.setFieldsValue({
        autoDeferDuration: undefined,
        autoDeferPeriod: undefined,
        maxDeferCount: undefined,
        autoDeferType: undefined,
        autoDeferTimeRule: undefined,
      });
    } else {
      form.setFieldsValue({
        autoDeferType: 'NEW_OFFER',
        autoDeferTimeRule: 'NEW_QUOTE',
      });
    }
  };

  /**
   * 供应商能力清单匹配限制
   * 1,寻源方式只能选邀请
   * 0,寻源方式都可以选
   */
  @Bind()
  changeMatchRestrictFlag(e) {
    const { form } = this.props;
    if (e.target.checked && form.getFieldValue('sourceMethod') !== 'INVITE') {
      form.setFieldsValue({
        sourceMethod: undefined,
      });
    }
  }

  ruleForm = (type) => {
    let defaultTitle;
    let title;
    switch (type) {
      // 标的规则
      case 'subjectMatterRule':
        defaultTitle = intl.get(`${promptCode}.model.template.subjectMatterRule`).d('标的规则');
        title = intl
          .get(`${promptCode}.model.template.subjectMatterRuleTitle`)
          .d(
            '用于配置寻源业务的报价和核价/评定标是否要以标段/包为维度，“分标段/包”表示要以标段/包为整体进行报价和核价/评定标，“不区分”则表示以单行物料进行报价和核价/评定标。'
          );
        break;
      // 最多邀请供应商数量
      case 'maxVendorQuantity':
        defaultTitle = intl
          .get(`${promptCode}.model.template.maxVendorQuantity`)
          .d('最多邀请供应商数量');
        title = intl
          .get(`${promptCode}.model.template.maxVendorQuantityTitle`)
          .d('邀请的寻源方式下，能邀请的最大供应商数量。');
        break;
      // 最少邀请供应商数量
      case 'minVendorNumber':
        defaultTitle = intl
          .get(`${promptCode}.model.template.minVendorNumber`)
          .d('最少邀请供应商数量');
        title = intl
          .get(`${promptCode}.model.template.minVendorNumberTitle`)
          .d('在邀请的寻源方式下，能邀请的最少供应商数量。');
        break;
      // 设置报价截止时间
      case 'quotationEndDateFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.quotationEndDateFlag`)
          .d('设置报价截止时间');
        title = intl
          .get(`${promptCode}.model.template.newQuotationEndDateFlagTitle`)
          .d(
            '用于配置寻源单据是否存在报价截止时间，只有寻源才可以不勾选，竞价和招投标类别必须勾选'
          );
        break;
      // 报价方向跨轮次校验
      // case 'directCrossRoundFlag':
      //   defaultTitle = intl
      //     .get(`${promptCode}.model.template.directCrossRoundFlag`)
      //     .d('报价方向跨轮次校验');
      //   title = intl
      //     .get(`${promptCode}.model.template.directCrossRoundFlagTitle`)
      //     .d(
      //       '用于配置报价方向是否跨轮次进行校验，若勾选则每一轮的第一次报价受报价方向控制，必须大于/小于/无要求上一轮的最后一次有效报价；不勾选则每一轮的第一次报价不受报价方向控制。'
      //     );
      //   break;
      // 启用开标人
      case 'openerFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.openerFlag`).d('启用开标人');
        title = intl
          .get(`${promptCode}.model.template.openerFlagTitle`)
          .d('用于配置寻源业务是否需要启用开标人进行开标，勾选则表示可以设置开标人。');
        break;
      // 报价有效期
      case 'quotationValidityFrom':
        defaultTitle = intl
          .get(`${promptCode}.model.template.quotationValidityFrom`)
          .d('报价有效期');
        title = intl
          .get(`${promptCode}.model.template.qutValid`)
          .d('用于控制供应商在报价时对于报价有效期字段的必输性。');
        break;
      // 允许供应商连续报价
      case 'continuousQuotationFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.continuousQuotationFlag`)
          .d('允许供应商连续报价');
        title = intl
          .get(`${promptCode}.model.template.newConquotFlag`)
          .d(
            '在寻源寻源类别中，用于控制供应商能否对已报价状态的物料行再次报价。勾选表示可以进行对已报价状态的物料行再次报价，不勾选则表示不可以。'
          );
        break;
      // 允许供应商修改税率
      case 'taxChangeFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.taxChangeFlag`)
          .d('允许供应商修改税率');
        title = intl
          .get(`${promptCode}.model.template.taxChangeFlagTitle`)
          .d('用于控制供应商在报价时能否修改物料行的税率，勾选表示可以修改，不勾选则表示不可以。');
        break;
      // 允许供应商修改可供数量
      case 'quantityChangeFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.quantityChangeFlag`)
          .d('允许供应商修改可供数量');
        title = intl
          .get(`${promptCode}.model.template.quantityChangeFlagTitle`)
          .d('用于控制供应商在报价时能否修改可供数量，勾选表示可以修改，不勾选表示不可以。');
        break;
      // 允许供方自定义阶梯报价
      case 'diyLadderQuotationFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.diyLadderQuotationFlag`)
          .d('允许供方自定义阶梯报价');
        title = intl
          .get(`${promptCode}.model.template.diyLadderQuotTypeTitle`)
          .d(
            '在发布寻竞价单或招标书开启阶梯报价的情况下，用于控制是否允许供应商修改或自定义阶梯报价的阶梯数量。勾选代表供应商可以修改或自定义阶梯报价的阶梯，不勾选代表供应商只可按采购方定义的阶梯等级报价。'
          );
        break;
      // 允许多币种报价
      case 'allowMuitiCurQuo':
        defaultTitle = intl
          .get(`${promptCode}.model.template.allowMuitiCurQuo`)
          .d('允许多币种报价');
        title = intl
          .get(`${promptCode}.model.template.allowMuitiCurQuoTitle`)
          .d(
            '在发布巡检单或供应商报价中，用于控制是否允许供应商开启多币种报价。勾选代表允许供应商多币种报价，不勾选代表不允许供应商多币种报价。'
          );
        break;
      // 启用自动延时
      case 'autoDeferFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.autoDeferFlag`).d('启用自动延时');
        title = intl
          .get(`${promptCode}.model.template.autoDeferFlagTitle`)
          .d('在竞价寻源类别中，用于控制是否启用自动延时。勾选表示启用，不勾选表示不启用。');
        break;
      // 延时触发规则
      case 'autoDeferType':
        defaultTitle = intl.get(`${promptCode}.model.template.autoDeferType`).d('延时触发规则');
        title = intl
          .get(`${promptCode}.model.template.autoDeferTypeTitle`)
          .d(
            '用于配置自动延时触发的条件，“第1名价格发生变化时”表示只有当第1名的价格发生变化时会触发；“出现新的报价时触发”表示只要有新的供应商提交了报价就会触发自动延时。'
          );
        break;
      // 延时触发时间段
      case 'autoDeferPeriod':
        defaultTitle = intl.get(`${promptCode}.model.template.autoDeferPeriod`).d('延时触发时间段');
        title = intl
          .get(`${promptCode}.model.template.autoDeferPeriodTitle`)
          .d('用于配置延时触发的时间段，只有在这个时间段内满足延时触发规则才会触发自动延时。');
        break;
      // 延时时间规则
      case 'autoDeferTimeRule':
        defaultTitle = intl.get(`${promptCode}.model.template.deferTimeRule`).d('延时时间规则');
        title = intl
          .get(`${promptCode}.model.template.autoDeferTimeRuleTitle`)
          .d(
            '用于配置基于什么时间延时，满足延时条件后，系统基于配置的时间点延时，生成新的报价截止时间。'
          );
        break;
      // 最大延时次数
      case 'maxDeferCount':
        defaultTitle = intl.get(`${promptCode}.model.template.maxDeferCount`).d('最大延时次数');
        title = intl
          .get(`${promptCode}.model.template.maxDeferCountTitle`)
          .d(
            '用于配置物料行的最大延时次数，当延时次数已经用完之后，再在延时触发时间段内满足延时触发规则，将不再触发自动延时。最大延时次数为空则表示对延时次数没有限制。'
          );
        break;
      // 供应商能力清单匹配限制
      case 'matchRestrictFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.matchRestrictFlag`)
          .d('供应商能力清单匹配限制');
        title = intl
          .get(`${promptCode}.model.template.matchRestrictFlagTitle`)
          .d(
            '限定选择该模板的寻源单据做供应商选择时仅能选到物品明细中的物品是供应商可供产品范围内的供应商.'
          );
        break;
      case 'keyDisplayControl':
        defaultTitle = intl
          .get(`${promptCode}.model.template.keyDisplayControl`)
          .d('关键字段显示控制');
        title = intl
          .get(`${promptCode}.model.template.newKeyDisplayControlTitle`)
          .d(
            '在寻源和竞价的寻源类别中，用于配置存在资格预审节点的寻源单，供应商在资格预审通过前是否可以看到采购方上传的技术附件和商务附件'
          );
        break;
      case 'rankRule':
        defaultTitle = intl.get(`${promptCode}.model.template.RFARankRule`).d('竞价排名规则');
        break;
      case 'expertSource':
        defaultTitle = intl.get(`${promptCode}.model.template.expertSource`).d('专家来源');
        title = intl
          .get(`${promptCode}.model.template.expertSourceTitle`)
          .d(
            '用于配置专家的取值。当专家评分为线上专家评分时，专家来源为空且不可编辑。为专家库时，专家取自专家库；为子账户时，专家取自子账户'
          );
        break;
      case 'scoreMethod':
        defaultTitle = intl.get(`${promptCode}.model.template.scoreMethod`).d('评分方式');
        title = intl
          .get(`${promptCode}.model.template.matchScoreMethodTitle`)
          .d('限用于配置寻源单评分要素录入方式，可选择分值法、权重法。');
        break;
      case 'scoreIndicFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.scoreIndicFlag`)
          .d('允许寻源单维护时无专家&评分要素');
        title = intl
          .get(`${promptCode}.model.template.scoreIndicFlagDescription`)
          .d('单据维护时选定专家评分，可以不维护专家及评分要素');
        break;
      case 'openEliminateFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.openEliminateFlag`).d('启用逐轮淘汰');
        title = intl
          .get(`${promptCode}.model.template.openElFlagDescription`)
          .d('用于定义多轮报价环节是否可淘汰供应商报价。');
        break;
      case 'minExpertNum':
        defaultTitle = intl.get(`${promptCode}.model.template.minExpertNum`).d('最小专家组人数');
        title = intl
          .get(`${promptCode}.model.template.minExpertNumDescription`)
          .d('用于限制线上专家评分时维护的最少专家组人数');
        break;
      case 'tenderFeeFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.tenderFeeFlag`).d('招标文件费管控');
        title = intl
          .get(`${promptCode}.model.template.matchTenderFeeFlagTitle`)
          .d('用于控制是否根据供应商招标文件费缴纳情况限制供应商参与寻源。');
        break;
      case 'bidBondFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.bidBondFlag`).d('保证金管控');
        title = intl
          .get(`${promptCode}.model.template.matchBidBondFlagTitle`)
          .d('用于控制是否根据供应商保证金缴纳情况限制供应商报价。');
        break;
      case 'freightUpdatableFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.freightUpdatableFlag`)
          .d('允许供应商修改运费标识');
        title = intl
          .get(`${promptCode}.model.template.freightUpdatableFlagTitle`)
          .d(
            '用于配置供应商在报价时是否可以修改运费。勾选时，可以报价时可以修改运费；不勾选时，不可以修改运费。'
          );
        break;
      case 'budgetControlRule':
        defaultTitle = intl.get(`${promptCode}.model.template.budgetControlRule`).d('预算控制规则');
        title = intl
          .get(`${promptCode}.model.template.budgetControlRuleTooltip`)
          .d(
            '用于配置在核价/定标节点是否管控成交金额必须小于预算金额。当选择不管控时，成交金额大于预算金额可以提交成功；当选择强管控成交金额小于预算金额时，当成交金额大于预算金额时，提交失败；当选择成交金额超预算时仅提示时，当成交金额大于预算金额，提示超预算后继续提交可提交成功。'
          );
        break;
      // 允许评分负责人不参与打分
      case 'leaderNoScoreFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.leaderWithoutScoring`)
          .d('允许评分负责人不参与打分');
        title = intl
          .get(`${promptCode}.modle.template.leaderWithoutScoringTitle`)
          .d('用于配置是否为评分负责人默认分配评分要素，勾选表示不分配，不勾选表示分配。');
        break;
      // 评审结果附件上传管控
      case 'scoringReportGenerationCtrl':
        defaultTitle = intl
          .get(`${promptCode}.model.template.ScoringReportGenerationCtrlFlag`)
          .d('评审结果附件上传管控');
        title = intl
          .get(`${promptCode}.model.template.ScoringReportGenerationCtrlTooltip`)
          .d('用于配置推荐成交候选人节点是否需要上传评审结果附件');
        break;
      // 商务/技术标隐藏配置
      case 'businessTechSee':
        defaultTitle = intl
          .get(`${promptCode}.model.template.businessTechViewConfig`)
          .d('商务/技术标隐藏配置');
        title = intl
          .get(`${promptCode}.modle.template.businessTechViewConfigTitle`)
          .d(
            '用于控制标书规则为不区分，评标步制为同步评标时，专家在评分环节可查看的商务/技术标信息。比如，配置显示技术标/隐藏商务标，专家评分时，专家只能查看技术标信息，不能查看商务附件、单价等商务标信息。'
          );
        break;
      case 'onlyAllowAllWinBids':
        defaultTitle = intl
          .get(`${promptCode}.model.template.onlyAllowAllWinBids`)
          .d('仅允许整单中标');
        title = intl
          .get(`${promptCode}.model.template.onlyAllowAllWinBidsTooltip`)
          .d(
            '勾选后，报价范围为全部报价。勾选表示只能整单选择单个或多个供应商，不勾选表示可以区分物料选择供应商。'
          );
        break;
      case 'checkRecommendationStrategy':
        defaultTitle = intl.get(`${promptCode}.model.template.selectedStandard`).d('选用标准');
        title = intl
          .get(`${promptCode}.model.template.selectedStandardTooltip`)
          .d(
            '选用规则代表本次寻源核价/定标时的选用标准是按照价格优先还是评分优先。影响到核价/定标时自动推荐是按照价格还是按照评分推荐，且核价/定标时供应商排名会按照对应价格或分数排序。'
          );
        break;
      case 'checkSelectionDimension':
        defaultTitle = intl.get(`${promptCode}.model.template.selectedDimension`).d('选用维度');
        title = intl
          .get(`${promptCode}.model.template.selectedDimensionTooltip`)
          .d(
            '该选项代表核价/定标时，是否允许核价/定标员按每行物料分别选用供应商，或者仅允许按照供应商。'
          );
        break;
      case 'expertExtractFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.expertExtract`).d('专家抽取');
        title = intl
          .get(`${promptCode}.modle.template.expertExtractTooltip`)
          .d(
            '启用后，可在询价/招标维护、过程控制页面制定抽取条件，系统随机从专家库中抽取出满足条件的专家。'
          );
        break;
      case 'expertRequirementsRule':
        defaultTitle = intl
          .get(`${promptCode}.model.template.expertRequirementsRule`)
          .d('专家需求数量抽取规则');
        title = intl
          .get(`${promptCode}.model.template.expertRequirementsRuleTooltip`)
          .d(
            '用于配置启用专家抽取时，是否需要区分商务/技术组别分别设定需求的专家数量。为不区分时，只需设定抽取专家总人数；为区分商务/技术专家需求数量时，需分别设定所需技术/商务专家人数进行抽取'
          );
        break;
      case 'expertReplyFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.expertReply`).d('是否需要专家回复');
        title = intl
          .get(`${promptCode}.modle.template.expertReplyTooltip`)
          .d(
            '启用专家回复时，将抽取信息发送给专家后专家可在专家回复功能下回复是否出席评标活动；不启用时，无需专家进行回复，采购员决定抽取出的专家是否出席评标活动。'
          );
        break;
      case 'bidFileDownloadNode':
        defaultTitle = intl
          .get(`${promptCode}.model.template.bidingDocumentDownLoad`)
          .d('招标文件下载节点');
        break;
      case 'noneExpertFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.noneExpertFlag`)
          .d('允许编辑寻源单时无专家');
        title = intl
          .get(`${promptCode}.model.template.noneExpertFlagDescription`)
          .d(
            '用于配置含专家评分的寻源单据是否允许在单据发布时不维护专家信息；当单据的报价方式为密封报价，且启用了开标人，且勾选此配置项时，单据发布时不会进行专家的必填及相关校验；注：此配置项仅当【专家评分】为线上专家评分，且勾选了【启用开标人】时方可编辑'
          );
        break;
      case 'noneIndicateFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.noneIndicateFlag`)
          .d('允许编辑寻源单时无评分要素');
        title = intl
          .get(`${promptCode}.model.template.noneIndicateFlagDescription`)
          .d(
            '用于配置含专家评分的寻源单据是否允许在单据发布时不维护评分要素信息；当单据的报价方式为密封报价，且启用了开标人，且勾选此配置项时，单据发布时不会进行评分要素的必填及相关校验；注：此配置项仅当【专家评分】为线上专家评分，且勾选了【启用开标人】时方可编辑'
          );
        break;
      case 'noticeEndNodeCode':
        defaultTitle = intl.get(`${promptCode}.model.template.noticeEndNodeCode`).d('公告终止节点');
        title = intl
          .get(`${promptCode}.model.template.noticeEndNodeCodeDescription`)
          .d(
            '寻源的发布公告在公告天数到期前可以配置终止节点，如公告天数到期前寻源核价完成后可终止门户展示的发布公告信息。'
          );
        break;
      case 'scoreHideSupplierRule':
        defaultTitle = intl
          .get(`${promptCode}.model.template.scoreHideSupplierRule`)
          .d('评分中隐藏供应商信息');
        title = intl
          .get(`${promptCode}.model.template.scoreHideSupplierRuleDescription`)
          .d(
            '用于配置专家评分过程中是否需要隐藏供应商相关信息，为无需隐藏时，评分过程中供应商信息可见；为技术评分中隐藏时，在技术专家评分过程中供应商信息不可见'
          );
        break;
      case 'quotationDtlTotalPriceWriteFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.quotationDtlTotalPriceWriteFlag`)
          .d('报价明细总价写入行单价');
        title = intl
          .get(`${promptCode}.model.template.quotationDtlTotalPriceWriteFlagDescription`)
          .d(
            '用于配置是否自动将报价明细中的总价带到物料行单价中。注：报价明细总价=∑数量*单价，报价明细总价可计算的前提：报价模板中【数量】的编码是Quantity，【单价】的编码是Price。'
          );
        break;
      case 'autoScorePriceType':
        defaultTitle = intl
          .get(`${promptCode}.model.template.autoScorePriceType`)
          .d('自动评分价格取值');
        title = intl
          .get(`${promptCode}.model.template.autoScorePriceTypeHelp`)
          .d('用于配置在专家评分自动打分的评分要素计算时，取什么价来进行计算');
        break;
      case 'enableBidAnnouncementFlag':
        defaultTitle = intl
          .get(`ssrc.inquiryHall.model.inquiryHall.enableBidAnnouncementFlag`)
          .d('是否启用唱标');
        break;
      case 'bidAnnouncementType':
        defaultTitle = intl
          .get(`ssrc.inquiryHall.model.inquiryHall.bidAnnouncementType`)
          .d('唱标价格公开范围');
        break;
      case 'bidAnnouncementContent':
        defaultTitle = intl
          .get(`ssrc.inquiryHall.model.inquiryHall.bidAnnouncementContent`)
          .d('唱标内容选择');
        break;
      case 'bidAnnouncementTarget':
        defaultTitle = intl
          .get(`ssrc.inquiryHall.model.inquiryHall.bidAnnouncementTarget`)
          .d('接收对象选择');
        break;
      case 'showSupplierName':
        defaultTitle = intl
          .get(`ssrc.inquiryHall.model.inquiryHall.showSupplierName`)
          .d('是否显示供应商名称');
        break;
      case 'showHistoricalPriceVersion':
        defaultTitle = intl
          .get(`ssrc.inquiryHall.model.inquiryHall.showHistoricalPriceVersion`)
          .d('是否展示历史价格版本');
        break;
      case 'expandResultsFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.expandResults`).d('拓展寻源结果');
        title = intl
          .get(`${promptCode}.model.template.expandResultsTooltip`)
          .d(
            '启用拓展寻源结果，可以在单据发布时维护寻源结果需要拓展给其他公司或其他库存组织；不启用则无法拓展给其他组织。'
          );
        break;
      case 'reviewHidePrice':
        defaultTitle = intl
          .get('ssrc.sourceTemplate.model.template.reviewHidePrice')
          .d('符合性检查是否隐藏价格信息');
        title = intl
          .get(`ssrc.sourceTemplate.model.template.reviewHidePriceHelp`)
          .d(
            '用于配置专家评分符合性检查过程中是否需要隐藏价格相关信息，为无需隐藏时，价格信息对审查员可见；为隐藏时，价格信息对审查员不可见'
          );
        break;
      default:
        break;
    }
    return (
      <Tooltip title={title} placement="top">
        {defaultTitle}
      </Tooltip>
    );
  };

  @Bind()
  changeAutoDeferType(e) {
    const { form } = this.props;
    if (e === 'TOP_ONE_CHANGE') {
      form.setFieldsValue({
        autoDeferTimeRule: 'TOP_ONE_CHANGE',
      });
    } else if (e === 'NEW_OFFER') {
      form.setFieldsValue({
        autoDeferTimeRule: 'NEW_QUOTE',
      });
    }
  }

  // 整单中标
  handleOnlyAllowWinBids = (e) => {
    const { form = {}, checkPriceUiIsNew } = this.props;
    const { setFieldsValue = () => {} } = form;

    if (e.target.checked) {
      setFieldsValue(
        Object.assign(
          {},
          {
            quotationScope: 'ALL_QUOTATION',
            quantityChangeFlag: 0,
          },
          checkPriceUiIsNew && {
            checkSelectionDimension: 'ALL',
          }
        )
      );
    }
  };

  // 改变专家来源
  handleChangeExpertSource = (value) => {
    const { form = {} } = this.props;
    const { setFieldsValue = () => {} } = form;
    // 清空【专家抽取】【是否专家回复】
    if (value === 'SUB_ACCOUNT') {
      setFieldsValue({
        expertExtractFlag: 0,
        expertReplyFlag: 0,
      });
    }
  };

  // 改变专家分配
  handleChangeExpertExtract = (e) => {
    const { form = {} } = this.props;
    const { setFieldsValue = () => {} } = form;
    // 清空【是否专家回复】
    if (!e.target.checked) {
      setFieldsValue({
        expertReplyFlag: 0,
        expertRequirementsRule: null,
      });
      return;
    }
    setFieldsValue({
      expertRequirementsRule: 'NONE',
    });
  };

  @Bind()
  handleChangeQuantityChange(e) {
    const { form = {}, checkPriceUiIsNew } = this.props;
    const { setFieldsValue = () => {} } = form;

    if (e.target.checked && checkPriceUiIsNew) {
      setFieldsValue({
        checkSelectionDimension: 'ITEM',
      });
    }
  }

  @Bind()
  changeTenderFeeFlag(e) {
    const { form = {} } = this.props;
    const { setFieldsValue = () => {} } = form;

    if (e.target.checked === 0) {
      setFieldsValue({
        bidFileDownloadNode: 'NO_CONTROL',
      });
    } else {
      setFieldsValue({
        bidFileDownloadNode: '',
      });
    }
  }

  // 改变开标人
  @Bind()
  changeOpenerFlag(e) {
    const { form = {} } = this.props;
    const { setFieldsValue = () => {} } = form;
    // 取消开标人 清空【允许寻源单维护时无专家&评分要素】【允许编辑寻源单时无专家】【允许编辑寻源单时无评分要素】
    if (e.target.checked === 0) {
      setFieldsValue({
        scoreIndicFlag: 0,
        noneExpertFlag: 0,
        noneIndicateFlag: 0,
      });
    }
  }

  render() {
    const {
      isBid,
      form = {},
      validDateInput,
      autoDefer,
      subjectMater,
      budgetControlRules = [],
      dataSource,
      newFlag,
      rankRules = [],
      expertSources = [],
      scoreTemplateScoreType = [],
      customizeForm,
      defineKeyFieldVisibleRF,
      defineKeyFieldVisibleBID,
      isHistory,
      autoDeferTimeRuleDate = [],
      businessTechSees = [],
      scoringReportGenerationCtrl = [],
      checkPriceUiIsNew,
      checkRecommendationStrategys = [], // 选用标准
      checkSelectionDimensions = [], // 选用维度
      newQuotationFlag = 0,
      bidFileDownloadNodeData = [],
      serviceChargeFlag = false,
      noticeEndNodeCode = [],
      newScoreFlag = false,
      scoreHideSupplierRule = [],
      autoScorePriceTypeList = [],
      announcementTypeList = [],
      announcementContentList = [],
      expertRequirementsRule = [],
      reviewHidePriceOptions = [],
      remote,
    } = this.props;
    const { getFieldDecorator = (e) => e, getFieldValue } = form;
    const params = form.getFieldsValue();
    const bidFileDownloadNodeFilterData = bidFileDownloadNodeData.filter((item) => {
      if (params.tenderFeeFlag === 1) {
        return item.value !== 'NO_CONTROL';
      } else {
        return item;
      }
    });
    const autoDeferTimeRuleFilterDate = autoDeferTimeRuleDate.filter((item) => {
      if (params.autoDeferType) {
        if (params.autoDeferType === 'NEW_OFFER') {
          // 出现新的报价时触发
          return item.value !== 'TOP_ONE_CHANGE';
        } else if (params.autoDeferType === 'TOP_ONE_CHANGE') {
          // 第1名价格发生变化时触发
          return item.value !== 'NEW_QUOTE';
        }
      }
      return null;
    });
    const formLayoutM = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    };

    // 新分值法 ['SCORE_NEW', 'WEIGHT] 原分值法['SCORE', 'WEIGHT]
    let newScoreType = getCurrentScoreType({ scoreTemplateScoreType, newScoreFlag });
    newScoreType = remote
      ? remote.process('SSRC_SOURCE_TEMPLATE_PROCESS_RULE_FORM_NEW_SCORE_TYPE', newScoreType, {
          that: this,
          scoreTemplateScoreType,
          newScoreFlag,
        })
      : newScoreType;

    const quotationScope = getFieldValue('quotationScope');
    return customizeForm(
      {
        code: 'SOURCE.TEMPLATE.RULE',
        form,
        dataSource,
        isCreate: true,
      },
      <Form className={styles['form-label10']}>
        <Row gutter={48} className="writable-row">
          {(isBid
            ? form.getFieldValue('secondarySourceCategory')
            : form.getFieldValue('sourceCategory')) === 'BID' && (
            <Col span={8}>
              <Form.Item label={this.ruleForm('subjectMatterRule')} {...SEARCH_FORM_ITEM_LAYOUT}>
                {getFieldDecorator('subjectMatterRule', {
                  initialValue: dataSource.subjectMatterRule || 'NONE',
                })(
                  <RadioGroup disabled={isHistory}>
                    {subjectMater.map((item) => (
                      <Radio value={item.value} key={item.value}>
                        {item.meaning}
                      </Radio>
                    ))}
                  </RadioGroup>
                )}
              </Form.Item>
            </Col>
          )}
          <Col span={8}>
            <Form.Item label={this.ruleForm('maxVendorQuantity')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('maxVendorQuantity', {
                initialValue: dataSource.maxVendorQuantity,
              })(
                <InputNumber
                  min={1}
                  max={99999999999}
                  precision={0}
                  style={{ width: '100%' }}
                  disabled={isHistory}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('minVendorNumber')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('minVendorNumber', {
                initialValue: dataSource.minVendorNumber,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.template.minVendorNumber`)
                        .d('最少邀请供应商数量'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={1}
                  max={99999999999}
                  precision={0}
                  style={{ width: '100%' }}
                  disabled={isHistory}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8} className={styles.formCol12}>
            <Form.Item label={this.ruleForm('matchRestrictFlag')} {...formLayoutM}>
              {getFieldDecorator('matchRestrictFlag', {
                initialValue: dataSource.matchRestrictFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  onChange={this.changeMatchRestrictFlag}
                  disabled={isHistory}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('quotationEndDateFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('quotationEndDateFlag', {
                initialValue: newFlag ? 1 : dataSource.quotationEndDateFlag,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    (!isBid
                      ? params.sourceCategory !== 'RFQ'
                      : !['RFQ', 'NEW_BID'].includes(params.secondarySourceCategory)) || isHistory
                  }
                />
              )}
            </Form.Item>
          </Col>
          {/* <Col span={8}>
            <Form.Item label={this.ruleForm('directCrossRoundFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('directCrossRoundFlag', {
                initialValue: dataSource.directCrossRoundFlag || 0,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
            </Form.Item>
          </Col> */}
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.ruleForm('openerFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('openerFlag', {
                initialValue: dataSource.openerFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={isHistory}
                  onChange={this.changeOpenerFlag}
                />
              )}
            </Form.Item>
          </Col>
          {(isBid
            ? form.getFieldValue('secondarySourceCategory')
            : form.getFieldValue('sourceCategory')) === 'BID' ? null : (
              <Col span={8}>
                <Form.Item
                  label={this.ruleForm('quotationValidityFrom')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('validDateInputType', {
                  initialValue: dataSource.validDateInputType || 'NOT_REQUIRED',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.template.quotationValidityFrom`)
                          .d('报价有效期'),
                      }),
                    },
                  ],
                })(
                  <Select disabled={isHistory}>
                    {validDateInput.map((item) => (
                      <Select.Option value={item.value} key={String(item.value)}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                </Form.Item>
              </Col>
          )}
          <Col span={8}>
            <Form.Item
              label={this.ruleForm('continuousQuotationFlag')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('continuousQuotationFlag', {
                initialValue: dataSource.continuousQuotationFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    (isBid && params.secondarySourceCategory === 'RFA') ||
                    (!isBid && params.sourceCategory === 'RFA') ||
                    isHistory
                  }
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            {(isBid
              ? form.getFieldValue('secondarySourceCategory')
              : form.getFieldValue('sourceCategory')) === 'BID' ? null : (
                <Form.Item label={this.ruleForm('taxChangeFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
                  {getFieldDecorator('taxChangeFlag', {
                  initialValue: dataSource.taxChangeFlag || 0,
                })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
                </Form.Item>
            )}
          </Col>
          <Col span={8} className={styles.formCol12}>
            <Form.Item label={this.ruleForm('quantityChangeFlag')} {...formLayoutM}>
              {getFieldDecorator('quantityChangeFlag', {
                initialValue: dataSource.quantityChangeFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={isHistory || params.onlyAllowAllWinBids}
                  onChange={this.handleChangeQuantityChange}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8} className={styles.formCol12}>
            <Form.Item label={this.ruleForm('diyLadderQuotationFlag')} {...formLayoutM}>
              {getFieldDecorator('diyLadderQuotationFlag', {
                initialValue: dataSource.diyLadderQuotationFlag || 0,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.ruleForm('allowMuitiCurQuo')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('multiCurrencyFlag', {
                initialValue: dataSource.multiCurrencyFlag || 0,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
            </Form.Item>
          </Col>
          {!newQuotationFlag ? (
            <Col span={8} className={styles.formCol12}>
              <Form.Item label={this.ruleForm('freightUpdatableFlag')} {...formLayoutM}>
                {getFieldDecorator('freightUpdatableFlag', {
                  initialValue:
                    isNull(dataSource.freightUpdatableFlag) ||
                    isUndefined(dataSource.freightUpdatableFlag)
                      ? 1
                      : dataSource.freightUpdatableFlag,
                })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
              </Form.Item>
            </Col>
          ) : (
            ''
          )}
          <Col span={8}>
            <Form.Item label={this.ruleForm('tenderFeeFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('tenderFeeFlag', {
                initialValue: dataSource.tenderFeeFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={isHistory}
                  onChange={this.changeTenderFeeFlag}
                />
              )}
            </Form.Item>
          </Col>
          {serviceChargeFlag &&
            (isBid
              ? ['RFQ', 'NEW_BID', 'RFA'].includes(getFieldValue('secondarySourceCategory'))
              : ['RFQ', 'RFA'].includes(getFieldValue('sourceCategory'))) && (
              <Col span={8}>
                <Form.Item
                  label={this.ruleForm('bidFileDownloadNode')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('bidFileDownloadNode', {
                    initialValue:
                      dataSource.bidFileDownloadNode ||
                      (params.tenderFeeFlag === 1 ? '' : 'NO_CONTROL'),
                    rules: [
                      {
                        required: params.tenderFeeFlag === 1,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.template.bidingDocumentDownLoad`)
                            .d('招标文件下载节点'),
                        }),
                      },
                    ],
                  })(
                    <Select disabled={params.tenderFeeFlag !== 1}>
                      {bidFileDownloadNodeFilterData.map((item) => (
                        <Select.Option value={item.value} key={String(item.value)}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            )}
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.ruleForm('bidBondFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('bidBondFlag', {
                initialValue: dataSource.bidBondFlag || 0,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('autoDeferFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('autoDeferFlag', {
                initialValue: dataSource.autoDeferFlag || 0,
              })(
                <Checkbox
                  onChange={this.setValue}
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    (isBid && params.secondarySourceCategory !== 'RFA') ||
                    (!isBid && params.sourceCategory !== 'RFA') ||
                    isHistory
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('autoDeferType')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('autoDeferType', {
                initialValue: dataSource.autoDeferType,
                rules: [
                  {
                    required: params.autoDeferFlag === 1,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.template.autoDeferType`)
                        .d('延时触发规则'),
                    }),
                  },
                ],
              })(
                <Select
                  disabled={!params.autoDeferFlag || isHistory}
                  onChange={this.changeAutoDeferType}
                >
                  {autoDefer.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.ruleForm('autoDeferPeriod')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('autoDeferPeriod', {
                initialValue: dataSource.autoDeferPeriod,
              })(
                <AutoDeferPeriod
                  label={this.ruleForm('autoDeferPeriod')}
                  name="autoDeferPeriod"
                  dataSource={dataSource}
                  disabled={!params.autoDeferFlag || isHistory}
                  form={form}
                  required={params.autoDeferFlag === 1}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('autoDeferTimeRule')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('autoDeferTimeRule', {
                initialValue: dataSource.autoDeferTimeRule,
                rules: [
                  {
                    required: params.autoDeferFlag === 1,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.template.deferTimeRule`)
                        .d('延时时间规则'),
                    }),
                  },
                ],
              })(
                <Select disabled={!params.autoDeferFlag || isHistory}>
                  {autoDeferTimeRuleFilterDate.map((item) => (
                    <Select.Option value={item.value} key={String(item.value)}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('maxDeferCount')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('maxDeferCount', {
                initialValue: dataSource.maxDeferCount,
              })(
                <InputNumber
                  min={1}
                  max={99999999999}
                  precision={0}
                  style={{ width: '100%' }}
                  disabled={params.autoDeferFlag === 0 || isHistory}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('budgetControlRule')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('budgetControlRule', {
                initialValue: dataSource.budgetControlRule || 'NO_CONTROL',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.template.budgetControlRule`)
                        .d('预算控制规则'),
                    }),
                  },
                ],
              })(
                <Select allowClear disabled={isHistory}>
                  {budgetControlRules &&
                    budgetControlRules.map((item) => (
                      <Select.Option value={item.value} key={String(item.value)}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          {!newQuotationFlag ? (
            (
              isBid
                ? ['RFQ', 'NEW_BID', 'RFA'].includes(getFieldValue('secondarySourceCategory'))
                : ['RFQ', 'RFA'].includes(getFieldValue('sourceCategory'))
            ) ? (
              <Col span={8}>
                <Form.Item label={this.ruleForm('keyDisplayControl')} {...SEARCH_FORM_ITEM_LAYOUT}>
                  {getFieldDecorator('keyDisplayControl')(
                    <div>
                      <a
                        onClick={() => defineKeyFieldVisibleRF()}
                        // className={!isHistory ? styles.defineList : styles.defineListDisabled}
                      >
                        {intl.get(`${promptCode}.model.template.defineList`).d('定义列表')}
                      </a>
                    </div>
                  )}
                </Form.Item>
              </Col>
            ) : (
              <Col span={8}>
                <Form.Item label={this.ruleForm('keyDisplayControl')} {...SEARCH_FORM_ITEM_LAYOUT}>
                  {getFieldDecorator('keyDisplayControl')(
                    <div>
                      <a
                        onClick={() => defineKeyFieldVisibleBID()}
                        // className={!isHistory ? styles.defineList : styles.defineListDisabled}
                      >
                        {intl.get(`${promptCode}.model.template.defineList`).d('定义列表')}
                      </a>
                    </div>
                  )}
                </Form.Item>
              </Col>
            )
          ) : (
            ''
          )}
          {(isBid ? params.secondarySourceCategory === 'RFA' : params.sourceCategory === 'RFA') && (
            <Col span={8}>
              <Form.Item label={this.ruleForm('rankRule')} {...SEARCH_FORM_ITEM_LAYOUT}>
                {getFieldDecorator('rankRule', {
                  initialValue: dataSource.rankRule,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.template.RFARankRule`)
                          .d('竞价排名规则'),
                      }),
                    },
                  ],
                })(
                  <Select disabled={isHistory}>
                    {rankRules.map((item) => (
                      <Select.Option
                        value={item.value}
                        key={String(item.value)}
                        disabled={item.value === 'WEIGHT_PRICE' && params.sourceMethod !== 'INVITE'}
                      >
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          )}
          <Col span={8}>
            <Form.Item label={this.ruleForm('expertSource')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('expertSource', {
                initialValue: dataSource.expertSource,
                rules: [
                  {
                    required: form.getFieldValue('expertScoreType') !== 'NONE',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.expertSource`).d('专家来源'),
                    }),
                  },
                ],
              })(
                <Select
                  allowClear
                  disabled={form.getFieldValue('expertScoreType') === 'NONE' || isHistory}
                  onChange={this.handleChangeExpertSource}
                >
                  {expertSources.map((item) => (
                    <Select.Option value={item.value} key={String(item.value)}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.ruleForm('scoreMethod')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('templateScoreType', {
                initialValue: dataSource.templateScoreType,
                rules: [
                  {
                    required: form.getFieldValue('expertScoreType') === 'ONLINE',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.scoreMethod`).d('评分方式'),
                    }),
                  },
                ],
              })(
                <Select
                  allowClear
                  disabled={form.getFieldValue('expertScoreType') !== 'ONLINE' || isHistory}
                >
                  {newScoreType.map((item) => (
                    <Select.Option value={item.value} key={String(item.value)}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('scoreIndicFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('scoreIndicFlag', {
                initialValue: dataSource.scoreIndicFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    !(
                      (!isBid
                        ? ['RFQ', 'RFA'].includes(form.getFieldValue('sourceCategory'))
                        : ['RFQ', 'NEW_BID', 'RFA'].includes(
                            form.getFieldValue('secondarySourceCategory')
                          )) &&
                      form.getFieldValue('expertScoreType') === 'ONLINE' &&
                      form.getFieldValue('openerFlag')
                    ) || isHistory
                  }
                />
              )}
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label={this.ruleForm('openEliminateFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('openEliminateFlag', {
                initialValue: dataSource.openEliminateFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    form.getFieldValue('roundQuotationRule') === 'NONE' ||
                    form.getFieldValue('roundQuotationRule') === 'AUTO' ||
                    isHistory
                  }
                />
              )}
            </Form.Item>
          </Col>
          {checkPriceUiIsNew && (
            <Col span={8}>
              <Form.Item
                label={this.ruleForm('checkRecommendationStrategy')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('checkRecommendationStrategy', {
                  initialValue: dataSource.checkRecommendationStrategy || 'PRICE',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.template.selectedStandard`)
                          .d('选用标准'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear disabled={isHistory || params.expertScoreType === 'NONE'}>
                    {map(checkRecommendationStrategys, (item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          )}
          {checkPriceUiIsNew && (
            <Col span={8}>
              <Form.Item
                label={this.ruleForm('checkSelectionDimension')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('checkSelectionDimension', {
                  initialValue:
                    dataSource.checkSelectionDimension ||
                    (params.onlyAllowAllWinBids ? 'ALL' : undefined),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.template.selectedDimension`)
                          .d('选用维度'),
                      }),
                    },
                  ],
                })(
                  <Select
                    allowClear
                    disabled={
                      isHistory ||
                      params.onlyAllowAllWinBids ||
                      params.quantityChangeFlag ||
                      params.quotationScope !== 'ALL_QUOTATION' ||
                      (isBid
                        ? params.secondarySourceCategory === 'RFA'
                        : params.sourceCategory === 'RFA')
                    }
                  >
                    {map(checkSelectionDimensions, (item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          )}
          {/* <Col span={8}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.template.releaseNotBidNum`)
                .d('释放未中标申请数量')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('checkItemReleaseFlag', {
                initialValue: dataSource.checkItemReleaseFlag || 0,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
            </Form.Item>
          </Col> */}
          {(!isBid
            ? ['RFQ', 'RFA'].includes(params.sourceCategory)
            : ['RFQ', 'NEW_BID', 'RFA'].includes(params.secondarySourceCategory)) &&
            params.expertScoreType === 'ONLINE' && (
              <Col span={8}>
                <Form.Item label={this.ruleForm('leaderNoScoreFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
                  {getFieldDecorator('leaderNoScoreFlag', {
                    initialValue: dataSource.leaderNoScoreFlag || 0,
                  })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
                </Form.Item>
              </Col>
            )}
          {/* 只有在【寻源类别】为 非老招投标时 && 【专家评分】为线上专家评分  */}
          {(!isBid
            ? ['RFQ', 'RFA'].includes(params.sourceCategory)
            : ['RFQ', 'NEW_BID', 'RFA'].includes(params.secondarySourceCategory)) &&
            params.expertScoreType === 'ONLINE' && (
              <Col span={8}>
                <Form.Item
                  label={this.ruleForm('scoringReportGenerationCtrl')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('scoringReportGenerationCtrl', {
                    initialValue: dataSource.scoringReportGenerationCtrl,
                  })(
                    <Select allowClear disabled={isHistory}>
                      {map(scoringReportGenerationCtrl, (item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            )}
          {params.expertScoreType === 'ONLINE' &&
            params.bidRuleType === 'NONE' &&
            params.openBidOrder === 'SYNC' && (
              <Col span={8}>
                <Form.Item label={this.ruleForm('businessTechSee')} {...SEARCH_FORM_ITEM_LAYOUT}>
                  {getFieldDecorator('businessTechSee', {
                    initialValue: dataSource.businessTechSee || 'ALL',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.template.businessTechViewConfig`)
                            .d('商务/技术标隐藏配置'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear disabled={isHistory}>
                      {map(businessTechSees, (item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            )}
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.ruleForm('noneExpertFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('noneExpertFlag', {
                initialValue: dataSource.noneExpertFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    !(
                      (!isBid
                        ? ['RFQ', 'RFA'].includes(form.getFieldValue('sourceCategory'))
                        : ['RFQ', 'NEW_BID', 'RFA'].includes(
                            form.getFieldValue('secondarySourceCategory')
                          )) &&
                      form.getFieldValue('expertScoreType') === 'ONLINE' &&
                      form.getFieldValue('openerFlag')
                    ) || isHistory
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('noneIndicateFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('noneIndicateFlag', {
                initialValue: dataSource.noneIndicateFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    !(
                      (!isBid
                        ? ['RFQ', 'RFA'].includes(form.getFieldValue('sourceCategory'))
                        : ['RFQ', 'NEW_BID', 'RFA'].includes(
                            form.getFieldValue('secondarySourceCategory')
                          )) &&
                      form.getFieldValue('expertScoreType') === 'ONLINE' &&
                      form.getFieldValue('openerFlag')
                    ) || isHistory
                  }
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          {params.expertScoreType === 'ONLINE' && (
            <Col span={8}>
              <Form.Item label={this.ruleForm('minExpertNum')} {...SEARCH_FORM_ITEM_LAYOUT}>
                {getFieldDecorator('minExpertNum', {
                  initialValue:
                    dataSource.minExpertNum || dataSource.minExpertNum === 0
                      ? dataSource.minExpertNum
                      : 1,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.template.minExpertNum`)
                          .d('最小专家组人数'),
                      }),
                    },
                  ],
                })(<InputNumber disabled={isHistory} precision={0} step={1} defaultValue={1} />)}
              </Form.Item>
            </Col>
          )}
          <Col span={8}>
            {(!isBid
              ? ['RFQ', 'RFA'].includes(params.sourceCategory)
              : ['RFQ', 'NEW_BID', 'RFA'].includes(params.secondarySourceCategory)) && (
              <Form.Item label={this.ruleForm('onlyAllowAllWinBids')} {...SEARCH_FORM_ITEM_LAYOUT}>
                {getFieldDecorator('onlyAllowAllWinBids', {
                  initialValue: dataSource.onlyAllowAllWinBids || 0,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onClick={this.handleOnlyAllowWinBids}
                    disabled={isHistory}
                  />
                )}
              </Form.Item>
            )}
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('expertExtractFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('expertExtractFlag', {
                initialValue: dataSource.expertExtractFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  onClick={this.handleChangeExpertExtract}
                  disabled={
                    isHistory ||
                    params?.expertScoreType === 'NONE' ||
                    (params?.expertScoreType === 'ONLINE' && params?.expertSource === 'SUB_ACCOUNT')
                  }
                />
              )}
            </Form.Item>
          </Col>
          {form.getFieldValue('expertExtractFlag') === 1 && (
            <Col span={8}>
              <Form.Item
                label={this.ruleForm('expertRequirementsRule')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('expertRequirementsRule', {
                  initialValue: dataSource.expertRequirementsRule || 'NONE',
                })(
                  <Select disabled={isHistory}>
                    {map(expertRequirementsRule, (item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          )}
          <Col span={8}>
            <Form.Item label={this.ruleForm('expertReplyFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('expertReplyFlag', {
                initialValue: dataSource.expertReplyFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    isHistory ||
                    params?.expertScoreType === 'NONE' ||
                    (params?.expertScoreType === 'ONLINE' &&
                      params?.expertSource === 'SUB_ACCOUNT') ||
                    (params?.expertScoreType === 'ONLINE' &&
                      params?.expertSource === 'EXPERT_LIBRARY' &&
                      params?.expertExtractFlag === 0)
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.ruleForm('noticeEndNodeCode')} {...SEARCH_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('noticeEndNodeCode', {
                initialValue: dataSource.noticeEndNodeCode || '90',
              })(
                <Select
                  disabled={
                    (isBid && params.secondarySourceCategory === 'BID') ||
                    (!isBid && params.sourceCategory === 'BID') ||
                    isHistory
                  }
                >
                  {map(noticeEndNodeCode, (item) => (
                    <Select.Option value={`${item.value}`} key={`${item.value}`}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          {(!isBid
            ? ['RFQ', 'RFA'].includes(params.sourceCategory)
            : ['RFQ', 'NEW_BID', 'RFA'].includes(params.secondarySourceCategory)) &&
            params.expertScoreType === 'ONLINE' &&
            params.bidRuleType === 'DIFF' && (
              <Col span={8}>
                <Form.Item
                  label={this.ruleForm('scoreHideSupplierRule')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('scoreHideSupplierRule', {
                    initialValue: dataSource.scoreHideSupplierRule || 'NONE',
                  })(
                    <Select disabled={isHistory}>
                      {map(scoreHideSupplierRule, (item) => (
                        <Select.Option value={`${item.value}`} key={`${item.value}`}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            )}
        </Row>
        <Row>
          {(!isBid
            ? ['RFQ', 'RFA'].includes(params.sourceCategory)
            : ['RFQ', 'NEW_BID', 'RFA'].includes(params.secondarySourceCategory)) && (
            <Col span={8}>
              <Form.Item
                label={this.ruleForm('quotationDtlTotalPriceWriteFlag')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('quotationDtlTotalPriceWriteFlag', {
                  initialValue: dataSource.quotationDtlTotalPriceWriteFlag,
                })(<Checkbox disabled={isHistory} checkedValue={1} unCheckedValue={0} />)}
              </Form.Item>
            </Col>
          )}
          {(!isBid
            ? ['RFQ'].includes(form.getFieldValue('sourceCategory'))
            : ['RFQ', 'NEW_BID'].includes(form.getFieldValue('secondarySourceCategory'))) &&
            // 老招标、竞价均不显示，【线上专家】 【询价、招标-报价范围为全部】才显示
            quotationScope === 'ALL_QUOTATION' &&
            params.expertScoreType === 'ONLINE' && (
              <Col span={8}>
                <Form.Item label={this.ruleForm('autoScorePriceType')} {...SEARCH_FORM_ITEM_LAYOUT}>
                  {getFieldDecorator('autoScorePriceType', {
                    initialValue: dataSource.autoScorePriceType || 'BENCHMARK_PRICE',
                  })(
                    <Select disabled={isHistory}>
                      {autoScorePriceTypeList.map((item) => (
                        <Select.Option value={item.value} key={String(item.value)}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            )}
          <Col span={8}>
            <Form.Item
              label={this.ruleForm('enableBidAnnouncementFlag')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('enableBidAnnouncementFlag', {
                initialValue: isNil(dataSource.enableBidAnnouncementFlag)
                  ? 0
                  : dataSource.enableBidAnnouncementFlag,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
            </Form.Item>
          </Col>
          {form.getFieldValue('enableBidAnnouncementFlag') ? (
            <Col span={8}>
              <Form.Item label={this.ruleForm('bidAnnouncementType')} {...SEARCH_FORM_ITEM_LAYOUT}>
                {getFieldDecorator('bidAnnouncementType', {
                  initialValue: dataSource.bidAnnouncementType || 'TOTAL_PRICE',
                })(
                  <Select disabled={isHistory}>
                    {map(announcementTypeList, (item) => (
                      <Select.Option value={`${item.value}`} key={`${item.value}`}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          ) : null}
          {form.getFieldValue('enableBidAnnouncementFlag') ? (
            <Col span={8}>
              <Form.Item
                label={this.ruleForm('bidAnnouncementContent')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('bidAnnouncementContent', {
                  initialValue: dataSource.bidAnnouncementContent || 'ALL_SUPPLIER',
                })(
                  <Select disabled={isHistory}>
                    {map(announcementContentList, (item) => (
                      <Select.Option value={`${item.value}`} key={`${item.value}`}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          ) : null}
          {form.getFieldValue('enableBidAnnouncementFlag') ? (
            <Col span={8}>
              <Form.Item
                label={this.ruleForm('bidAnnouncementTarget')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('bidAnnouncementTarget', {
                  initialValue: dataSource.bidAnnouncementTarget || 'ALL_SUPPLIER',
                })(
                  <Select disabled={isHistory}>
                    {map(announcementContentList, (item) => (
                      <Select.Option value={`${item.value}`} key={`${item.value}`}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          ) : null}
          {form.getFieldValue('enableBidAnnouncementFlag') ? (
            <Col span={8}>
              <Form.Item label={this.ruleForm('showSupplierName')} {...SEARCH_FORM_ITEM_LAYOUT}>
                {getFieldDecorator('showSupplierName', {
                  initialValue: isNil(dataSource.showSupplierName)
                    ? 1
                    : dataSource.showSupplierName,
                })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
              </Form.Item>
            </Col>
          ) : null}
          {form.getFieldValue('enableBidAnnouncementFlag') ? (
            <Col span={8}>
              <Form.Item
                label={this.ruleForm('showHistoricalPriceVersion')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('showHistoricalPriceVersion', {
                  initialValue: isNil(dataSource.showHistoricalPriceVersion)
                    ? 0
                    : dataSource.showHistoricalPriceVersion,
                })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
              </Form.Item>
            </Col>
          ) : null}
          {(!isBid
            ? ['RFQ', 'RFA'].includes(params.sourceCategory)
            : ['RFQ', 'NEW_BID', 'RFA'].includes(params.secondarySourceCategory)) && (
            <Col span={8}>
              <Form.Item label={this.ruleForm('expandResultsFlag')} {...SEARCH_FORM_ITEM_LAYOUT}>
                {getFieldDecorator('expandResultsFlag', {
                  initialValue: dataSource.expandResultsFlag || 0,
                })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
              </Form.Item>
            </Col>
          )}
          {(!isBid
            ? ['RFQ', 'RFA'].includes(params.sourceCategory)
            : ['RFQ', 'NEW_BID', 'RFA'].includes(params.secondarySourceCategory)) &&
            (form.getFieldValue('initialReview') || dataSource.initialReview) === 'NEED' && (
              <Col span={8}>
                <Form.Item label={this.ruleForm('reviewHidePrice')} {...SEARCH_FORM_ITEM_LAYOUT}>
                  {getFieldDecorator('reviewHidePrice', {
                    initialValue: dataSource.reviewHidePrice || 'NO_HIDE',
                  })(
                    <Select disabled={isHistory}>
                      {map(reviewHidePriceOptions, (item) => (
                        <Select.Option value={`${item.value}`} key={`${item.value}`}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            )}
        </Row>
      </Form>
    );
  }
}
