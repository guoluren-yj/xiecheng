/**
 * inquiryHall - 寻源服务/寻源大厅-明细查看
 * @date: 2020-04-08
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Tabs, Spin } from 'hzero-ui';
import { isEmpty, isNil } from 'lodash';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
} from 'utils/constants';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import MatterDetail from '@/routes/components/MatterDetail/MatterDetail';
import { numberSeparatorRender } from '@/utils/renderer';
import ItemLineTable from '../../components/Detail/ItemLineTable';
import ProfessionalTable from '../../components/Detail/ProfessionalTable';
import ScoringElementsTable from '../../components/Detail/ScoringElementsTable';
import SupplierLineTable from '../../components/Detail/SupplierLineTable';
import TenderNoticeForm from '../../components/Detail/TenderNoticeForm';
import History from '../../BidEventQuery/Detail/History';

const FormItem = Form.Item;

export default class ReleasePrepare extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  /**
   * 格式化金额
   * @param {number|string} value - 金额
   */
  amountRender(value) {
    const { promptCode } = this.props;
    if (!isNil(value) && value !== '' && Number(value) === 0) {
      return intl.get(`${promptCode}.model.bidHall.free`).d('免费');
    }
    return numberSeparatorRender(value);
  }

  /**
   * 表单头
   */
  renderHeaderForm() {
    const {
      organizationId,
      customizeForm,
      promptCode,
      header,
      editBidMembers,
      clarificationView,
      form: { getFieldDecorator },
    } = this.props;
    const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };

    return customizeForm(
      {
        code: 'SSRC.BID_HALL_DETAIL.HEADER',
        form: this.props.form,
        dataSource: header,
      },
      <Form className="writable-row-custom">
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidNum.`).d('招标编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidNum', {
                initialValue: header.bidNum,
              })(<span>{header.bidNum}</span>)}
            </FormItem>
          </Col>
          <Col span={16}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidTitle`).d('招标事项')}
              {...formsLayouts}
            >
              {getFieldDecorator('bidTitle', {
                initialValue: header.bidTitle,
              })(<span>{header.bidTitle}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.sourcingTemplate`).d('寻源模板')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateName', {
                initialValue: header.templateName,
              })(<span>{header.templateName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.quotationType`).d('报价方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationTypeMeaning', {
                initialValue: header.quotationTypeMeaning,
              })(<span>{header.quotationTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.purceOrgName`).d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationName', {
                initialValue: header.purOrganizationName,
              })(<span>{header.purOrganizationName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: header.companyName,
              })(<span>{header.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidType`).d('招标类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidTypeMeaning', {
                initialValue: header.bidTypeMeaning,
              })(<span>{header.bidTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.sourceMethod`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethodMeaning', {
                initialValue: header.sourceMethodMeaning,
              })(<span>{header.sourceMethodMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.subjectMatterRule`).d('标的规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('subjectMatterRuleMeaning', {
                initialValue: header.subjectMatterRuleMeaning,
              })(<span>{header.subjectMatterRuleMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.sourceStage`).d('招标阶段')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceStageMeaning', {
                initialValue: header.sourceStageMeaning,
              })(<span>{header.sourceStageMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.maxBidNumber`).d('最大中标数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('maxBidNumber', {
                initialValue: header.maxBidNumber,
              })(<span>{header.maxBidNumber}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.quotationStartDate`).d('投标开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: header.quotationStartDate,
              })(<span>{header.quotationStartDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.quotationEndDate`).d('投标截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: header.quotationEndDate,
              })(<span>{header.quotationEndDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidOpenDate`).d('开标时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenDate', {
                initialValue: header.bidOpenDate,
              })(<span>{header.bidOpenDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.clarifyEndTime`).d('澄清截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('clarifyEndTime', {
                initialValue: header.clarifyEndTime,
              })(<span>{header.clarifyEndTime}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaserName', {
                initialValue: header.purchaserName,
              })(<span>{header.purchaserName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidMembers`).d('招标小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidMembers')(
                <a onClick={editBidMembers}>{intl.get(`hzero.common.button.view`).d('查看')}</a>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidTechFile`).d('招标技术文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('techAttachmentUuid', {
                initialValue: header.techAttachmentUuid,
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={
                    isEmpty(header.techAttachmentUuid) ? undefined : header.techAttachmentUuid
                  }
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                  filePreview
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidBusinessFile`).d('招标商务文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('businessAttachmentUuid', {
                initialValue: header.businessAttachmentUuid,
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={
                    isEmpty(header.businessAttachmentUuid)
                      ? undefined
                      : header.businessAttachmentUuid
                  }
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                  filePreview
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.totalBudget`).d('预算金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalBudget', {
                initialValue: header.totalBudget,
              })(<span>{numberSeparatorRender(header.totalBudget)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.clarification`).d('澄清答疑')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('clarifyAndAnswer')(
                <a onClick={clarificationView}>{intl.get(`hzero.common.button.view`).d('查看')}</a>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 其他信息
   */
  renderOtherInfosForm() {
    const {
      header = {},
      customizeForm,
      promptCode,
      form,
      form: { getFieldDecorator },
    } = this.props;

    return customizeForm(
      { code: 'SSRC.BID_HALL_DETAIL.OTHER.INFO', form, dataSource: header },
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidPlanName`).d('寻源计划')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidPlanLineName', {
                initialValue: header.bidPlanLineName,
              })(<span>{header.bidPlanLineName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.projectCode`).d('项目编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectNum', {
                initialValue: header.projectNum,
              })(<span>{header.projectNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.projectName`).d('项目名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectName', {
                initialValue: header.projectName,
              })(<span>{header.projectName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidLocation`).d('项目地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidLocation', {
                initialValue: header.bidLocation,
              })(<span>{header.bidLocation}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.currencyType`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: header.currencyCode,
              })(<span>{header.currencyCode}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.allowMuitiCurQuo').d('允许多币种报价')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Checkbox
                checked={header.multiCurrencyFlag}
                checkedValue={1}
                unCheckedValue={0}
                disabled
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.roundNumber`).d('轮次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('roundNumber', {
                initialValue: header.roundNumber,
              })(<span>{header.roundNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hzero.common.components.dataAudit.version`).d('版本')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('versionNumber', {
                initialValue: header.versionNumber,
              })(<span>{header.versionNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hzero.common.date.creation`).d('创建时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', {
                initialValue: header.creationDate,
              })(<span>{header.creationDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidFileExpense`).d('招标文件费')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidFileExpense', {
                initialValue: header.bidFileExpense,
              })(<span>{this.amountRender(header.bidFileExpense)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidBond`).d('保证金')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidBond', {
                initialValue: header.bidBond,
              })(<span>{this.amountRender(header.bidBond)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.paymentType`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeName', {
                initialValue: header.paymentTypeName,
              })(<span>{header.paymentTypeName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.paymentTerm`).d('付款条款')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTerm', {
                initialValue: header.paymentTerm,
              })(<span>{header.paymentTerm}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidOpenLocation`).d('开标地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenLocation', {
                initialValue: header.bidOpenLocation,
              })(<span>{header.bidOpenLocation}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.purchasingContact`).d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchasingContact', {
                initialValue: header.purName,
              })(<span>{header.purName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.contactPhone`).d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contactPhone', {
                initialValue: header.purPhone,
              })(<span>{header.purPhone}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.contactMail`).d('联系人邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contactMail', {
                initialValue: header.purEmail,
              })(<span>{header.purEmail}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.common.explorationFlag`).d('是否需要现场踏勘')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('explorationFlag', {
                initialValue: header.explorationFlag,
              })(<span>{yesOrNoRender(header.explorationFlag)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          {header.explorationFlag ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.common.explorationDate`).d('踏勘时间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('explorationDate', {
                  initialValue: header.explorationDate,
                })(<span>{header.explorationDate}</span>)}
              </FormItem>
            </Col>
          ) : (
            ''
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.common.model.common.allowChangePayWayFlag`)
                .d('是否允许供应商修改付款条款&方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('allowChangePayWayFlag', {
                initialValue: header.paymentTermFlag,
              })(<span>{yesOrNoRender(header.paymentTermFlag)}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 资格预审
   */
  renderQualificationForm() {
    const {
      organizationId,
      header = {},
      UEDDisplayFormItem,
      promptCode,
      showScoringElement,
      showPretrialPanel,
    } = this.props;
    return (
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalEndDate`).d('预审截止时间')}
              value={header.prequalEndDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.reviewMethod`).d('审查方式')}
              value={header.reviewMethodMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.qualifiedLimit`).d('合格上限')}
              value={header.qualifiedLimit}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalFileExpense`).d('预审文件费')}
              value={header.prequalFileExpense}
            />
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalLocation`).d('申请提交地点')}
              value={header.prequalLocation}
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.enableScoreFlag`).d('启用评分细项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={showScoringElement}>{intl.get('hzero.common.button.view').d('查看')}</a>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalFile`).d('资格预审文件')}
              value={
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-prequal"
                  attachmentUUID={header.prequalAttachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                  filePreview
                />
              }
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.common.pretrialPanel`).d('预审小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={() => showPretrialPanel(true)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.common.qualRequirements`).d('资质要求')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              <span style={{ marginLeft: '-6px' }}>{header.prequalRemark}</span>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      fetchbidHallUpdateLoading,
      promptCode,
      header = {},
      ProfessionalTableProps = [],
      ScoringElementsTableProps = [],
      SupplierLineTableProps = {},
      ItemLineTableProps = {},
      MatterDetailProps = {},
      TenderNoticeProps = {},
      historyRecordProps = {},
    } = this.props;

    return (
      <React.Fragment>
        <Spin spinning={fetchbidHallUpdateLoading}>
          <Tabs defaultActiveKey="baseInfos" animated={false}>
            <Tabs.TabPane
              tab={intl.get(`${promptCode}.view.tab.baseInfos`).d('基本信息')}
              key="baseInfos"
            >
              {this.renderHeaderForm()}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`${promptCode}.view.tab.otherInfos`).d('其他信息')}
              key="otherInfos"
              forceRender
            >
              {this.renderOtherInfosForm()}
            </Tabs.TabPane>
            {['PRE', 'PRE_POST'].includes(header.qualificationType) ? (
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.tab.preQualification`).d('资格预审')}
                key="preQualification"
                forceRender
              >
                {this.renderQualificationForm()}
              </Tabs.TabPane>
            ) : (
              ''
            )}
            {header.expertScoreType === 'ONLINE' ? (
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.tab.professional`).d('专家')}
                key="professional"
                forceRender
              >
                <ProfessionalTable {...ProfessionalTableProps} />
              </Tabs.TabPane>
            ) : (
              ''
            )}
            {header.expertScoreType === 'ONLINE' ? (
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.tab.scoringElements`).d('评分要素')}
                key="scoringElements"
                forceRender
              >
                <ScoringElementsTable {...ScoringElementsTableProps} />
              </Tabs.TabPane>
            ) : (
              ''
            )}
            <Tabs.TabPane
              tab={intl.get(`${promptCode}.view.tab.supplierList`).d('供应商列表')}
              key="supplierList"
              forceRender
            >
              <SupplierLineTable {...SupplierLineTableProps} />
            </Tabs.TabPane>
            {header.matterRequireFlag === 1 && (
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tab.matterDetail`).d('寻源事项说明')}
                key="matterDetail"
                forceRender
              >
                <MatterDetail {...MatterDetailProps} />
              </Tabs.TabPane>
            )}
            {(header.sourceMethod && header.sourceMethod === 'OPEN') ||
            header.sourceMethod === 'ALL_OPEN' ? (
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.tab.tenderNotice`).d('招标公告')}
                key="tenderNotice"
                forceRender
              >
                <TenderNoticeForm {...TenderNoticeProps} />
              </Tabs.TabPane>
            ) : (
              ''
            )}
          </Tabs>
          <ItemLineTable {...ItemLineTableProps} />
          <History {...historyRecordProps} />
        </Spin>
      </React.Fragment>
    );
  }
}
