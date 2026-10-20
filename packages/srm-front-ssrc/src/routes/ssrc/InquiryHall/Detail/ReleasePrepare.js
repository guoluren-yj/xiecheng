/**
 * inquiryHall - 寻源服务/寻源大厅-明细查看
 * @date: 2020-04-08
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Tabs, Collapse, Icon, Tooltip } from 'hzero-ui';
import { isNull, isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_3_LAYOUT,
} from 'utils/constants';
import Upload from 'srm-front-boot/lib/components/Upload';
import Checkbox from 'components/Checkbox';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { phoneRender } from '@/utils/renderer';

import { PRIVATE_BUCKET, PUBLIC_BUCKET } from '_utils/config';
import ProfessionalTable from '@/routes/ssrc/InquiryHall/Detail/ProfessionalTable';
import ScoringElementsTable from '@/routes/ssrc/InquiryHall/Detail/ScoringElementsTable';
import QuotationDirectLable from '@/routes/ssrc/components/QuotationDirectLable';
import CPopover from '@/routes/components/CPopover';
import MatterDetail from '@/routes/components/MatterDetail/MatterDetail';
import Attachment from '../../components/Attachment';
import SupplierListTable from './SupplierListTable';
import ItemDetailsTable from './ItemDetailsTable';

const { Panel } = Collapse;
const LONG_LABEL_FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};

@Form.create({ fieldNameProp: null })
export default class ReleasePrepare extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  // 获取初始化值
  @Bind()
  getInitialValue(value, key = 'name') {
    if (isEmpty(value)) {
      return null;
    }

    let result = [];
    const parseValue = value ? JSON.parse(value) : [];
    parseValue.forEach((item = {}) => {
      result.push(item?.[key]);
    });

    result = result.join(',');
    return <Tooltip title={result}>{result || '-'}</Tooltip>;
  }

  componentDidMount() {
    const { onFormLoaded } = this.props;
    if (onFormLoaded && typeof onFormLoaded === 'function') {
      onFormLoaded(true);
    }
  }

  /**
   * 规则文案描述
   */
  biddingRuleForm = (type) => {
    let defaultTitle;
    let title;
    switch (type) {
      // 报价次序
      case 'quotationOrderType':
        defaultTitle = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationOrderType`)
          .d('报价次序')}`;
        title = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingOrderRule`)
          .d(
            '在竞价寻源类别中，用于配置每个物料行的竞价次序。“并行“表示所有物料行同时开始和结束竞价；“序列”表示所有物料行按照行号依次开始竞价，待上一物料行结束之后，下一物料行再开始；“交错”表示所有物料行同时开始竞价，然后按照间隔时间依次结束竞价。'
          )}`;
        break;
      // 密封报价
      case 'sealedQuotation':
        defaultTitle = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`)
          .d('密封报价')}`;
        title = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.informationControl`)
          .d(
            '用于控制在报价期间内，所有报价信息是否对采购员密封保密。勾选表示采购员在报价期间内看不到任何报价信息；不勾选则采购员在报价期间内可以查看所有的'
          )}`;
        break;
      // 最少报价供应商数
      case 'minQuotedSupplier':
        defaultTitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.minQuotedSupplier')
          .d('最少报价供应商数');
        title = intl
          .get('ssrc.inquiryHall.model.inquiryHall.minQuotedSupplierTitle')
          .d('“当报价供应商数量”小于“最少报价供应商数”时，报价截止后需人工决定询价是否继续进行');
        break;
      default:
        break;
    }
    return (
      <Tooltip title={title} placement="right">
        {defaultTitle}
      </Tooltip>
    );
  };

  /**
   * 表单头
   */
  renderHeaderForm(dataSource = {}) {
    const { form, FormItem, customizeForm = () => {}, openInquiryGroup, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;
    const { getFieldDecorator } = form;

    const day = Math.floor(dataSource.startQuotationRunningDuration / 1440);
    const hour =
      day > 0
        ? Math.floor((dataSource.startQuotationRunningDuration - day * 1440) / 60)
        : Math.floor(dataSource.startQuotationRunningDuration / 60);
    const minute =
      hour > 0 || day > 0
        ? dataSource.startQuotationRunningDuration - day * 1440 - hour * 60
        : Math.floor(dataSource.startQuotationRunningDuration);

    return customizeForm(
      { code: `SSRC.${unitCodeSymbol}_DETAIL.HEADER_DETAIL`, form, dataSource, readOnly: true },
      <Form className="read-row-custom">
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXNo.`).d('RFX单号')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('rfxNum', {
                initialValue: dataSource.rfxNum,
              })(<span>{dataSource.rfxNum}</span>)}
            </FormItem>
          </Col>
          <Col span={16}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitle`).d('询价单标题')}
            >
              {getFieldDecorator('rfxTitle', {
                initialValue: dataSource.rfxTitle,
              })(<CPopover content={dataSource.rfxTitle}>{dataSource.rfxTitle}</CPopover>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              label={intl
                .get('ssrc.common.company', {
                  initialValue: dataSource.companyName,
                })
                .d('公司')}
            >
              {getFieldDecorator('companyName')(<span>{dataSource.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('purOrganizationName', {
                initialValue: dataSource.purOrganizationName,
              })(<span>{dataSource.purOrganizationName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门')}
            >
              {getFieldDecorator('unitName', {
                initialValue: dataSource.unitName,
              })(<span>{dataSource.unitName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`).d('创建人部门')}
            >
              {getFieldDecorator('createdUnitName', {
                initialValue: dataSource.createdUnitName,
              })(<span>{dataSource.createdUnitName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额')}
            >
              {getFieldDecorator('budgetAmount', {
                initialValue: dataSource.budgetAmount,
              })(<span>{dataSource.budgetAmount}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: dataSource.currencyCode,
              })(<span>{dataSource.currencyCode}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('purchaserName', {
                initialValue: dataSource.purchaserName,
              })(<span>{dataSource.purchaserName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingType`).d('寻源类型')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('sourceType', {
                initialValue: dataSource.sourceType,
              })(<span>{dataSource.sourceTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('paymentTypeName', {
                initialValue: dataSource.paymentTypeName,
              })(<span>{dataSource.paymentTypeName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('paymentTermName', {
                initialValue: dataSource.paymentTermName,
              })(<span>{dataSource.paymentTermName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('startFlag', {
                initialValue: dataSource.startFlag,
              })(<span>{yesOrNoRender(dataSource.startFlag)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTime`)
                .d('报价开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: dataSource.quotationStartDate,
              })(<span>{dataSource.quotationStartDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadline`)
                .d('报价截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: dataSource.quotationEndDate,
              })(<span>{dataSource.quotationEndDate}</span>)}
            </FormItem>
          </Col>
          {isNull(dataSource.startQuotationRunningDuration) ||
          isUndefined(dataSource.startQuotationRunningDuration) ? (
            <Col span={8}>
              <FormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotRunningDuration`)
                  .d('报价运行时间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('quotationRunningDuration', {
                  initialValue: dataSource.quotationRunningDuration,
                })(
                  <span>
                    {intl.get('ssrc.inquiryHall.model.inquiryHall.unlimitedTime').d('不限时')}
                  </span>
                )}
              </FormItem>
            </Col>
          ) : (
            <Col span={8}>
              <FormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotRunningDuration`)
                  .d('报价运行时间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('quotationRunningDuration', {
                  initialValue: dataSource.quotationRunningDuration,
                })(
                  <span>
                    {day}
                    {intl.get('hzero.common.date.unit.day').d('天')}
                    {hour}
                    {intl.get('hzero.common.date.unit.hours').d('小时')}
                    {minute}
                    {intl.get('hzero.common.date.unit.minutes').d('分钟')}
                  </span>
                )}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCategory`).d('价格类型')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('priceCategoryMeaning', {
                initialValue: dataSource.priceCategoryMeaning,
              })(<span>{dataSource.priceCategoryMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('roundNumber', {
                initialValue: dataSource.roundNumber,
              })(<span>{dataSource.roundNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('bidBond', {
                initialValue: dataSource.bidBond,
              })(
                <span>
                  {dataSource.bidBond
                    ? dataSource.bidBond
                    : intl.get('ssrc.common.view.gratis').d('免费')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryGroup`).d('寻源小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('inquiryGroup')(
                <a onClick={openInquiryGroup}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.isCentralPurchase').d('是否集采')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('centralPurchaseFlag', {
                initialValue: dataSource.centralPurchaseFlag,
              })(<span>{yesOrNoRender(dataSource.centralPurchaseFlag)}</span>)}
            </FormItem>
          </Col>
        </Row>

        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注')}
            >
              {getFieldDecorator('rfxRemark', {
                initialValue: dataSource.rfxRemark,
              })(<CPopover content={dataSource.rfxRemark}>{dataSource.rfxRemark}</CPopover>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`).d('备注(内部)')}
            >
              {getFieldDecorator('internalRemark', {
                initialValue: dataSource.internalRemark,
              })(
                <CPopover content={dataSource.internalRemark}>{dataSource.internalRemark}</CPopover>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 寻源规则
   * */
  renderBiddingOtherInfo(dataSource) {
    const { UEDDisplayFormItem, openBidholder, FormItem } = this.props;

    return (
      <Form className="read-row-custom">
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板')}
              value={dataSource.templateName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
              value={dataSource.sourceCategoryMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式')}
              value={dataSource.sourceMethodMeaning}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.sourceTemplate.model.template.qualificationType').d('资格审查')}
              value={dataSource.qualificationTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.sourceTemplate.model.template.expertEvaluation').d('专家评分')}
              value={dataSource.expertScoreTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.sourceTemplate.model.template.openBidOrder').d('评标步制')}
              value={dataSource.openBidOrderMeaning}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.sourceTemplate.model.template.bidRuleType').d('标书规则')}
              value={dataSource.bidRuleTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式')}
              value={dataSource.quotationTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationScope`).d('报价范围')}
              value={dataSource.quotationScopeMeaning}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={<QuotationDirectLable />}
              value={dataSource.auctionDirectionMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.quotationValidityFrom')
                .d('报价有效期')}
              value={dataSource.validDateInputTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.taxChangeFlag')
                .d('允许供应商修改税率')}
              {...LONG_LABEL_FORM_ITEM_LAYOUT}
            >
              <Checkbox disabled checked={dataSource.taxChangeFlag} />
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.quantityChangeFlag')
                .d('允许供应商修改可供数量')}
              {...LONG_LABEL_FORM_ITEM_LAYOUT}
            >
              <Checkbox disabled checked={dataSource.quantityChangeFlag} />
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.continuousQuotationFlag')
                .d('允许供应商连续报价')}
              {...LONG_LABEL_FORM_ITEM_LAYOUT}
            >
              <Checkbox disabled checked={dataSource.continuousQuotationFlag} />
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.diyLadderQuotationFlags')
                .d('允许供应商自定义阶梯报价')}
              {...LONG_LABEL_FORM_ITEM_LAYOUT}
            >
              <Checkbox disabled checked={dataSource.diyLadderQuotationFlag} />
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.allowMuitiCurQuo`)
                .d('允许多币种报价')}
              value={<Checkbox checked={dataSource.multiCurrencyFlag} disabled />}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.common.model.common.allowChangePayWayFlag')
                .d('是否允许供应商修改付款条款&方式')}
              value={<Checkbox checked={dataSource.paymentTermFlag} disabled />}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={this.biddingRuleForm('minQuotedSupplier')}
              {...LONG_LABEL_FORM_ITEM_LAYOUT}
            >
              {dataSource.minQuotedSupplier}
            </FormItem>
          </Col>
        </Row>
        {['OPEN', 'ALL_OPEN'].includes(dataSource.sourceMethod) ? (
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <UEDDisplayFormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.organizationType`)
                  .d('境内外关系')}
                value={dataSource.organizationTypeMeaning}
              />
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <UEDDisplayFormItem
                label={intl.get(`ssrc.inquiryHall.model.inquiryHall.industryData`).d('行业类型')}
                value={this.getInitialValue(dataSource.industryData, 'industryName')}
              />
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <UEDDisplayFormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.industryCategoryData`)
                  .d('主营品类')}
                value={this.getInitialValue(dataSource.industryCategoryData, 'categoryName')}
              />
            </Col>
          </Row>
        ) : null}
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              label={this.biddingRuleForm('sealedQuotation')}
            >
              {yesOrNoRender(dataSource.sealedQuotationFlag)}
              {dataSource.openerFlag && dataSource.sealedQuotationFlag ? (
                <a onClick={openBidholder} style={{ marginLeft: '8px' }}>
                  {intl.get(`ssrc.inquiryHall.view.message.button.viewOpener`).d('查看开标人')}
                </a>
              ) : (
                ''
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  // 寻源公告
  renderRfxNotice(tenderNoticeInfo = {}) {
    const { organizationId, FormItem, previewNotice = () => {} } = this.props;

    return (
      <Form className="read-row-custom">
        <Row {...EDIT_FORM_ROW_LAYOUT} type="flex" justify="start">
          <Col {...FORM_COL_2_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.noticeTitle').d('公告标题')}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 20 }}
            >
              <span style={{ marginLeft: '5.5%' }}>{tenderNoticeInfo.noticeTitle}</span>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticeInfo.noticeDays}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.purchasingContact`).d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticeInfo.purName}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.contactPhone`).d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticeInfo.purPhone}
              {phoneRender(tenderNoticeInfo.internationalTelCodeMeaning, tenderNoticeInfo.purPhone)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.contactMail`).d('联系人邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticeInfo.purEmail}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Upload
                filePreview
                viewOnly
                bucketName={PUBLIC_BUCKET}
                bucketDirectory="ssrc-rfx-tender-notice"
                attachmentUUID={tenderNoticeInfo.noticeAttachmentUuid}
                tenantId={organizationId}
              />
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.noticePreview').d('公告预览')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticeInfo.noticeId ? (
                <a onClick={previewNotice}>{intl.get('hzero.common.button.preview').d('预览')}</a>
              ) : null}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 资格预审
   */
  renderPreQualificationForm(header = {}) {
    const {
      organizationId,
      FormItem,
      showScoringElement,
      showPretrialPanel = () => {},
      customizeForm = () => {},
      form = {},
      rfx = {},
    } = this.props;
    const { getFieldDecorator } = form;
    const { unitCodeSymbol } = rfx;
    return (
      <React.Fragment>
        {customizeForm(
          {
            code: `SSRC.${unitCodeSymbol}_DETAIL.HEADER_PREQUAL`,
            form,
            dataSource: header,
            readOnly: true,
          },
          <Form className="writable-row-custom">
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                    .d('预审截止时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalEndDate', {
                    initialValue: header.prequalEndDate,
                  })(<span>{header.prequalEndDate}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.reviewMethod`).d('审查方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('reviewMethod', {
                    initialValue: header.reviewMethod,
                  })(<span>{header.reviewMethodMeaning}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.qualifiedLimit`)
                    .d('合格上限')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('qualifiedLimit', {
                    initialValue: header.qualifiedLimit,
                  })(<span>{header.qualifiedLimit}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalUser`).d('审查员')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('realName', {
                    initialValue: header.realName,
                  })(<span>{header.realName}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.prequalLocation`)
                    .d('申请提交地点')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalLocation', {
                    initialValue: header.prequalLocation,
                  })(<span>{header.prequalLocation}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.enableScoreFlag`)
                    .d('启用评分细项')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('enableScoreFlag', {
                    initialValue: header.enableScoreFlag,
                  })(
                    <span>
                      {yesOrNoRender(header.enableScoreFlag)}
                      {header.enableScoreFlag ? (
                        <span style={{ marginLeft: 10 }}>
                          <a onClick={() => showScoringElement(header)}>
                            {intl.get('hzero.common.button.view').d('查看')}
                          </a>
                        </span>
                      ) : null}
                    </span>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.qualiExam.model.qualiExam.prequalAttachmentUuid`)
                    .d('资格预审文件')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalAttachmentUuid', {
                    initialValue: header.prequalAttachmentUuid,
                  })(
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-prequal"
                      attachmentUUID={
                        header.prequalAttachmentUuid ? header.prequalAttachmentUuid : undefined
                      }
                      tenantId={organizationId}
                      viewOnly
                      icon="download"
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.common.pretrialPanel`).d('预审小组')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('pretrialPanel', {
                    initialValue: header.pretrialPanel,
                  })(
                    <a onClick={() => showPretrialPanel(true)}>
                      {intl.get('hzero.common.button.view').d('查看')}
                    </a>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.prequalRemark`)
                    .d('资格预审备注')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalRemark', {
                    initialValue: header.prequalRemark,
                  })(<span>{header.prequalRemark}</span>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }

  /**
   * 竞价规则
   */
  renderBiddingRulesForm(tempRfxHeaderDetails = null) {
    const { UEDDisplayFormItem, FormItem } = this.props;
    const dataSource = tempRfxHeaderDetails;
    const day = Math.floor(tempRfxHeaderDetails.quotationRunningDuration / 1440);
    const hour =
      day > 0
        ? Math.floor((tempRfxHeaderDetails.quotationRunningDuration - day * 1440) / 60)
        : Math.floor(tempRfxHeaderDetails.quotationRunningDuration / 60);
    const minute =
      hour > 0 || day > 0
        ? Math.floor(tempRfxHeaderDetails.quotationRunningDuration - day * 1440 - hour * 60)
        : tempRfxHeaderDetails.quotationRunningDuration;

    return (
      <Form className="writable-row-custom">
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={this.biddingRuleForm('quotationOrderType')}
              value={dataSource.quotationOrderTypeMeaning}
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationRunningDuration`)
                .d('竞价运行时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {day}
              {intl.get('hzero.common.date.unit.day').d('天')}
              {hour}
              {intl.get('hzero.common.date.unit.hours').d('小时')}
              {minute}
              {intl.get('hzero.common.date.unit.minutes').d('分钟')}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationInterval`)
                .d('报价间隔时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {dataSource.quotationInterval}
              {intl.get('hzero.common.date.unit.minutes').d('分钟')}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.auctionRule`).d('竞价规则')}
              value={dataSource.auctionRuleMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.rankRule').d('排名规则')}
              value={dataSource.rankRuleMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.openRule`).d('公开规则')}
              value={dataSource.openRuleMeaning}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferFlag`).d('启用自动延时')}
              value={yesOrNoRender(dataSource.autoDeferFlag)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferType`).d('延时触发规则')}
              value={dataSource.autoDeferTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.sourceTemplate.model.inquiryHall.autoDeferPeriod')
                .d('延时触发时间段')}
              value={dataSource.autoDeferPeriod}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.sourceTemplate.model.template.maxDeferCount`).d('最大延时次数')}
              value={dataSource.maxDeferCount}
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`).d('延时时长')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {dataSource.autoDeferDuration}
              {intl.get('hzero.common.date.unit.minutes').d('分钟')}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  generateCollapsePanel(options = {}) {
    const {
      title = '',
      key,
      PrepareCollapseKeys = [],
      renderComponent = null,
      isShow = true,
    } = options;

    if (!isShow) {
      return;
    }

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{title}</h3>
            <a>
              {PrepareCollapseKeys.includes(key)
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={PrepareCollapseKeys.includes(key) ? 'up' : 'down'} />
          </React.Fragment>
        }
        key={key}
      >
        {renderComponent}
      </Panel>
    );
  }

  render() {
    const {
      isHorizontal = true,
      PrepareCollapseKeys = [],
      validHeader = {},
      header = {},
      tenderNoticeInfo = {},
      ProfessionalTableProps = {},
      ScoringElementsTableProps = {},
      itemDetailsTableProps = {},
      supplierListTableProps = {},
      AttachmentsProps = {},
      changeRfxDetailVertical,
    } = this.props;

    const {
      preQualificationFlag = 0,
      expertScoreType = null,
      sourceCategory = null,
      sourceMethod = null,
    } = header;

    const MatterDetailProps = {
      matterDetail: header.matterDetail || '',
    };

    const rfxReviewMessage = (
      <Tabs>
        {preQualificationFlag ? (
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.preQualification`).d('资格预审')}
            key="preQualification"
            forceRender
          >
            {this.renderPreQualificationForm(validHeader)}
          </Tabs.TabPane>
        ) : (
          ''
        )}
        {expertScoreType && expertScoreType === 'ONLINE' ? (
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.reviewProfessional`).d('评审专家')}
            key="professional"
            forceRender
          >
            <ProfessionalTable {...ProfessionalTableProps} />
          </Tabs.TabPane>
        ) : (
          ''
        )}
        {expertScoreType && expertScoreType === 'ONLINE' ? (
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}
            key="scoringElements"
            forceRender
          >
            <ScoringElementsTable {...ScoringElementsTableProps} />
          </Tabs.TabPane>
        ) : (
          ''
        )}
      </Tabs>
    );
    const rfxDetal = (
      <Tabs defaultActiveKey="itemDetails" animated={false}>
        <Tabs.TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemDetails`).d('物品明细')}
          key="itemDetails"
        >
          <ItemDetailsTable {...itemDetailsTableProps} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表')}
          key="supplierList"
        >
          <SupplierListTable {...supplierListTableProps} />
        </Tabs.TabPane>
        {header.matterRequireFlag === 1 && (
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.matterDetail`).d('寻源事项说明')}
            key="matterDetail"
            forceRender
          >
            <MatterDetail {...MatterDetailProps} />
          </Tabs.TabPane>
        )}
        <Tabs.TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.attachmentList`).d('附件列表')}
          key="attachmentList"
        >
          <Attachment {...AttachmentsProps} />
        </Tabs.TabPane>
      </Tabs>
    );

    if (!isHorizontal) {
      return (
        <React.Fragment>
          <Collapse
            onChange={changeRfxDetailVertical}
            className="form-collapse"
            defaultActiveKey={PrepareCollapseKeys}
          >
            {this.generateCollapsePanel({
              title: intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息'),
              key: 'baseInfos',
              PrepareCollapseKeys,
              renderComponent: this.renderHeaderForm(validHeader),
            })}
            {this.generateCollapsePanel({
              title: intl.get(`ssrc.inquiryHall.view.message.panel.rfxRules`).d('寻源规则'),
              key: 'otherInfos',
              PrepareCollapseKeys,
              renderComponent: this.renderBiddingOtherInfo(validHeader),
            })}
            {this.generateCollapsePanel({
              title: intl.get('ssrc.inquiryHall.view.message.panel.rfxNotice').d('寻源公告'),
              key: 'rfxNotice',
              isShow: sourceMethod !== 'INVITE',
              PrepareCollapseKeys,
              renderComponent: this.renderRfxNotice(tenderNoticeInfo),
            })}
            {this.generateCollapsePanel({
              title: intl.get(`ssrc.inquiryHall.view.message.panel.biddingRules`).d('竞价规则'),
              key: 'biddingRules',
              isShow: sourceCategory && sourceCategory === 'RFA',
              PrepareCollapseKeys,
              renderComponent: this.renderBiddingRulesForm(validHeader),
            })}
            {this.generateCollapsePanel({
              title: intl.get(`ssrc.inquiryHall.view.message.panel.reviewMessage`).d('评审信息'),
              key: 'reviewMessage',
              PrepareCollapseKeys,
              isShow:
                preQualificationFlag ||
                (expertScoreType && expertScoreType === 'ONLINE') ||
                (expertScoreType && expertScoreType === 'ONLINE'),
              renderComponent: rfxReviewMessage,
            })}
            {this.generateCollapsePanel({
              title: intl.get(`ssrc.inquiryHall.view.message.panel.rfxDetals`).d('寻源明细'),
              key: 'rfxDetals',
              PrepareCollapseKeys,
              renderComponent: rfxDetal,
            })}
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Tabs defaultActiveKey="baseInfos" animated={false}>
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息')}
            key="baseInfos"
            forceRender
          >
            {this.renderHeaderForm(validHeader)}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.panel.rfxRules`).d('寻源规则')}
            key="otherInfos"
            forceRender
          >
            {this.renderBiddingOtherInfo(validHeader)}
          </Tabs.TabPane>
          {sourceMethod !== 'INVITE' ? (
            <Tabs.TabPane
              tab={intl.get('ssrc.inquiryHall.view.message.panel.rfxNotice').d('寻源公告')}
              key="rfxNotice"
              forceRender
            >
              {this.renderRfxNotice(tenderNoticeInfo)}
            </Tabs.TabPane>
          ) : (
            ''
          )}
          {sourceCategory && sourceCategory === 'RFA' ? (
            <Tabs.TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.panel.biddingRules`).d('竞价规则')}
              key="biddingRules"
              forceRender
            >
              {this.renderBiddingRulesForm(validHeader)}
            </Tabs.TabPane>
          ) : (
            ''
          )}
          {preQualificationFlag ? (
            <Tabs.TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.preQualification`).d('资格预审')}
              key="preQualification"
              forceRender
            >
              {this.renderPreQualificationForm(validHeader)}
            </Tabs.TabPane>
          ) : (
            ''
          )}
          {expertScoreType && expertScoreType === 'ONLINE' ? (
            <Tabs.TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.reviewProfessional`).d('评审专家')}
              key="professional"
              forceRender
            >
              <ProfessionalTable {...ProfessionalTableProps} />
            </Tabs.TabPane>
          ) : (
            ''
          )}
          {expertScoreType && expertScoreType === 'ONLINE' ? (
            <Tabs.TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}
              key="scoringElements"
              forceRender
            >
              <ScoringElementsTable {...ScoringElementsTableProps} />
            </Tabs.TabPane>
          ) : (
            ''
          )}
        </Tabs>
        {rfxDetal}
      </React.Fragment>
    );
  }
}
