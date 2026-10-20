/**
 * inquiryHall - 寻源服务/寻源大厅-初审查看
 * @date: 2020-08-06
 * @author: lzj <zhijian.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Collapse, Icon, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload';
import CPopover from '@/routes/components/CPopover/';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { fetchInquiryHeaderDetail } from '@/services/inquiryHallService';

const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
export default class Pretrial extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      collapseKeys: ['basicInfo', 'costComment', 'details'],
      header: {},
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const { rfxHeaderId: prevRfxHeaderId = null } = prevProps || {};
    const { rfxHeaderId = null } = this.props;
    const RefreshFlag = rfxHeaderId && prevRfxHeaderId && prevRfxHeaderId !== rfxHeaderId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchInquiryHeaderDetail();
    }
  }

  componentDidMount() {
    this.fetchInquiryHeaderDetail();
  }

  // 查询头
  async fetchInquiryHeaderDetail() {
    const {
      path,
      organizationId,
      rfxHeaderId,
      routerParam,
      rfx = {},
      onFormLoaded,
      pubRouterAddParams = () => {},
    } = this.props;
    const { unitCodeSymbol } = rfx;

    try {
      let result = await fetchInquiryHeaderDetail({
        routerParam,
        organizationId,
        rfxHeaderId,
        path,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.PRETRIAL_INFO_HEADER`,
        ...pubRouterAddParams(),
      });
      result = getResponse(result);
      if (!result) {
        return;
      }
      this.setState({
        header: result,
      });
    } catch (e) {
      throw e;
    } finally {
      if (onFormLoaded && typeof onFormLoaded === 'function') {
        onFormLoaded(true);
      }
    }
  }

  @Bind()
  setCollapseByKey(keys = '', values = []) {
    this.setState({
      [keys]: values,
    });
  }

  rfxTitleForm() {
    const {
      organizationId,
      // header = {},
      form = {},
      customizeForm = () => {},
      FormItem,
      rfx = {},
    } = this.props;
    const { header = {} } = this.state;
    const { getFieldDecorator = () => {} } = form;
    const { unitCodeSymbol } = rfx;

    return customizeForm(
      {
        code: `SSRC.${unitCodeSymbol}_DETAIL.PRETRIAL_INFO_HEADER`,
        form,
        dataSource: header,
      },
      <Form className="read-row-custom">
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: header.companyName,
              })(<CPopover>{header.companyName}</CPopover>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCategory', {
                initialValue: header.sourceCategory,
              })(<span>{header.sourceCategoryMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethod', {
                initialValue: header.sourceMethod,
              })(<span>{header.sourceMethodMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.pretrailAttachment`)
                .d('初审附件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pretrialUuid', {
                initialValue: header.pretrialUuid,
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-pretrial"
                  attachmentUUID={header.pretrialUuid ? header.pretrialUuid : undefined}
                  tenantId={organizationId}
                  filePreview
                  viewOnly
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailRemark`).d('初审备注')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pretrailRemark', {
                initialValue: header.pretrailRemark,
              })(<CPopover content={header.pretrailRemark}>{header.pretrailRemark}</CPopover>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  renderHeaderTitle(header = {}) {
    return (
      <h3>
        {header.rfxNum}-{header.rfxTitle}
        <Tag style={{ marginLeft: '15px', width: '65px' }}>
          <span style={{ marginLeft: '-17px' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}：{header.roundNumber}
          </span>
        </Tag>
      </h3>
    );
  }

  /**
   * 渲染成本备注折叠
   */
  rfxCostRemarkForm() {
    const { form = {}, customizeForm = () => {}, FormItem, rfx = {} } = this.props;
    const { header = {} } = this.state;
    const { unitCodeSymbol, checkPriceName } = rfx;
    const { getFieldDecorator } = form;

    return customizeForm(
      {
        code: `SSRC.${unitCodeSymbol}_DETAIL.PRETRIAL_COST.REMARK`,
        form,
        dataSource: header,
      },
      <Form className="read-row-custom">
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalCost', {
                initialValue: header.totalCost,
              })(<span>{numberSeparatorRender(header.totalCost)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.totalPriceRfxBid`, { checkPriceName })
                .d('{checkPriceName}总金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalPrice', {
                initialValue: header.totalPrice,
              })(<span>{numberSeparatorRender(header.totalPrice)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostFlag`).d('是否超成本')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('overCostFlag', {
                initialValue: header.overCostFlag,
              })(<span>{yesOrNoRender(header.overCostFlag)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostPrice`).d('超成本金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('overCostPrice', {
                initialValue: header.overCostPrice,
              })(<span>{numberSeparatorRender(header.overCostPrice)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostScale`).d('超成本百分比')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('overCostScale', {
                initialValue: header.overCostScale,
              })(<span>{header.overCostScale}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.costRemark`).d('成本备注')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('costRemark', {
                initialValue: header.costRemark,
              })(<span>{header.costRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { header = {}, collapseKeys = [] } = this.state;

    return (
      <div>
        <Collapse
          onChange={(keys) => this.setCollapseByKey('collapseKeys', keys)}
          className="form-collapse"
          defaultActiveKey={collapseKeys}
        >
          <Panel
            showArrow={false}
            header={
              <React.Fragment>
                {this.renderHeaderTitle(header)}
                <a>
                  {collapseKeys.includes('basicInfo')
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                <Icon type={collapseKeys.includes('basicInfo') ? 'up' : 'down'} />
              </React.Fragment>
            }
            key="basicInfo"
          >
            {this.rfxTitleForm()}
          </Panel>
        </Collapse>
        <Collapse
          onChange={(keys) => this.setCollapseByKey('collapseKeys', keys)}
          className="form-collapse"
          defaultActiveKey={collapseKeys}
        >
          <Panel
            showArrow={false}
            header={
              <React.Fragment>
                <h3>
                  {intl.get(`ssrc.inquiryHall.view.message.panel.costComments`).d('成本备注')}
                </h3>
                <a>
                  {collapseKeys.includes('costComment')
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                <Icon type={collapseKeys.includes('costComment') ? 'up' : 'down'} />
              </React.Fragment>
            }
            key="costComment"
          >
            {this.rfxCostRemarkForm()}
          </Panel>
        </Collapse>
      </div>
    );
  }
}
