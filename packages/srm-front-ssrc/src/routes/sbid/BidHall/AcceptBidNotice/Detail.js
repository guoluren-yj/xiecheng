/**
 * AcceptBidNotice - 中标公告（分标段／不分标段）
 * @date: 2019-09-11
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Divider, Row, Col, Form, Table, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import common from '@/routes/sbid/common.less';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

@formatterCollections({ code: ['ssrc.acceptBidNotice'] })
@connect(({ bidNotice, loading }) => ({
  bidNotice,
  queryAcceptLoading: loading.effects['bidNotice/queryAcceptNotice'],
  publishAcceptLoading: loading.effects['bidNotice/publishAcceptNotice'],
}))
export default class Detail extends Component {
  componentDidMount() {
    const { location } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { sourceHeaderId } = routerParams;
    this.handleAcceptNotice(sourceHeaderId);
  }

  componentDidUpdate(PrevProps) {
    const routerParams = querystring.parse(this.props.location.search.substr(1));
    const { sourceHeaderId } = routerParams;
    const PrevRouterParams = querystring.parse(PrevProps.location.search.substr(1));
    const PrevSourceHeaderId = PrevRouterParams.sourceHeaderId;
    if (sourceHeaderId !== PrevSourceHeaderId) {
      this.handleAcceptNotice(sourceHeaderId);
    }
  }

  /**
   * 查询中标公告
   */
  @Bind()
  handleAcceptNotice(sourceHeaderId) {
    const { dispatch } = this.props;
    // const routerParams = querystring.parse(location.search.substr(1));
    // const { sourceHeaderId } = routerParams;
    dispatch({
      type: 'bidNotice/queryAcceptNotice',
      payload: {
        sourceFrom: 'BID',
        sourceType: 'BR_ACCEPTED',
        sourceHeaderId,
      },
    });
  }

  /**
   * 公告信息
   */
  renderNoticInfor() {
    const {
      bidNotice: { acceptNoticeObj = {} },
    } = this.props;
    return (
      <div className={common['notice-item']}>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.bidNum').d('招标编号')}
              {...formLayout}
            >
              {acceptNoticeObj.bidNum}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.bidMatter').d('招标事项')}
              {...formLayout}
            >
              {acceptNoticeObj.bidTitle}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.bidType').d('招标类别')}
              {...formLayout}
            >
              {acceptNoticeObj.bidTypeMeaning}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.purchasUnit')
                .d('采购单位')}
              {...formLayout}
            >
              {acceptNoticeObj.companyName}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.bidNoticeDate')
                .d('招标公告日期')}
              {...formLayout}
            >
              {acceptNoticeObj.approvedDate && acceptNoticeObj.approvedDate.substr(0, 10)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.winBidDate')
                .d('中标日期')}
              {...formLayout}
            >
              {acceptNoticeObj.sourceAcceptedDate &&
                acceptNoticeObj.sourceAcceptedDate.substr(0, 10)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.allAcceptMoney')
                .d('总中标金额')}
              {...formLayout}
            >
              {acceptNoticeObj.sourceAcceptedTotalAmount}
            </FormItem>
          </Col>
          {acceptNoticeObj.expertNames && (
            <Col span={12}>
              <FormItem
                label={intl
                  .get('ssrc.acceptBidNotice.model.acceptBidNotice.expertList')
                  .d('评审专家名单')}
                {...formLayout}
              >
                {acceptNoticeObj.expertNames}
              </FormItem>
            </Col>
          )}
        </Row>
      </div>
    );
  }

  /**
   * 联系人及联系方式
   */
  renderContactMethod() {
    const {
      bidNotice: { acceptNoticeObj = {} },
    } = this.props;
    return (
      <div className={common['notice-item']}>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.purchaseContact')
                .d('采购联系人')}
              {...formLayout}
            >
              {acceptNoticeObj.purName}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.contactTel')
                .d('联系人电话')}
              {...formLayout}
            >
              {acceptNoticeObj.purPhone}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.contactEmail')
                .d('联系人邮箱')}
              {...formLayout}
            >
              {acceptNoticeObj.purEmail}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }

  /**
   * 中标信息（分标段／不分标段）
   */
  renderDiffSection() {
    const {
      bidNotice: { acceptNoticeObj = {} },
    } = this.props;
    const columns = [
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.num').d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.itemLinecode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.description').d('物品描述'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.classify').d('物品分类'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.quantityRequired').d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.unit').d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.supplierNum').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.supplierName').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.acceptNumber').d('中标数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: (val, record) => {
          return val === null ? record.validQuotationQuantityMeaning : val;
        },
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.acceptMoney').d('中标金额'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get('ssrc.acceptBidNotice.model.goods.acceptPercent').d('中标比例'),
        dataIndex: 'bidAcceptedRate',
        width: 100,
      },
    ];
    return (
      <Fragment>
        {acceptNoticeObj.subjectMatterRule === 'PACK' &&
          acceptNoticeObj.bidLineItemListPACK &&
          acceptNoticeObj.bidLineItemListPACK.map((n, i) => {
            return (
              <div className={common['purchase-demand']}>
                <div className={common['section-title']}>
                  {intl.get('ssrc.acceptBidNotice.model.goods.bidLines').d('标段')}
                  {`${i + 1}-${n.sectionName}`}
                </div>
                <Table bordered columns={columns} pagination={false} dataSource={n.lineItemList} />
              </div>
            );
          })}
        {acceptNoticeObj.subjectMatterRule === 'NONE' && (
          <div className={common['purchase-demand']}>
            <Table
              bordered
              columns={columns}
              pagination={false}
              dataSource={acceptNoticeObj.bidLineItemListNONE}
            />
          </div>
        )}
      </Fragment>
    );
  }

  render() {
    const {
      queryAcceptLoading,
      // publishAcceptLoading,
      bidNotice: { acceptNoticeObj = {} },
    } = this.props;
    return (
      <Fragment>
        <Header
          title={intl.get('ssrc.acceptBidNotice.model.title.acceptNoticePreview').d('中标公告预览')}
          // backPath={this.backJudge()}
        >
          {/* {!acceptNoticeObj.noticeId && (
            <Button
              type="primary"
              icon="rocket"
              onClick={this.handlePublish}
              loading={publishAcceptLoading}
            >
              {intl.get('hzero.common.button.release').d('发布')}
            </Button>
          )} */}
        </Header>
        <Spin spinning={queryAcceptLoading}>
          <Content className={common['accept-notice']}>
            <div className={common['notice-title']}>
              <div>
                {acceptNoticeObj.bidTitle && `${acceptNoticeObj.bidTitle}`}
                {intl.get('ssrc.acceptBidNotice.model.title.acceptNotice').d('中标公告')}
              </div>
              <div className={common['notice-time']}>
                {acceptNoticeObj.noticeDate &&
                  `${intl.get('ssrc.acceptBidNotice.model.title.releaseTime').d('发布时间')}：${
                    acceptNoticeObj.noticeDate
                  }`}
              </div>
            </div>
            <div className={common['notice-item-wrap']}>
              <Row className={common['notice-item-title']}>
                {intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.noticInfor').d('公告信息')}
              </Row>
              <Divider />
              {this.renderNoticInfor()}
              <Row className={common['notice-item-title']}>
                {intl
                  .get('ssrc.acceptBidNotice.model.acceptBidNotice.contactMethod')
                  .d('联系人及联系方式')}
              </Row>
              <Divider />
              {this.renderContactMethod()}
              <Row className={common['notice-item-title']}>
                {intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.acceptInfor').d('中标信息')}
              </Row>
              <Divider />
              {this.renderDiffSection()}
            </div>
          </Content>
        </Spin>
      </Fragment>
    );
  }
}
