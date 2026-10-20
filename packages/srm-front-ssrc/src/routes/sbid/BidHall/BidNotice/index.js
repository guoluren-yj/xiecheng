/**
 * BidNotice - 招标公告（分标段／不分标段）
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
import { API_HOST } from 'utils/config';
import { dateRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { PUBLIC_BUCKET } from '_utils/config';

import common from '@/routes/sbid/common.less';

const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();
const accessToken = getAccessToken();
const host = API_HOST;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

@formatterCollections({ code: ['ssrc.acceptBidNotice'] })
@connect(({ bidNotice, loading }) => ({
  bidNotice,
  queryLoading: loading.effects['bidNotice/queryBidNotice'],
}))
export default class BidNotice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [], // 附件
    };
  }

  componentDidMount() {
    this.handleBidNotice();
  }

  /**
   * 查询招标公告
   */
  @Bind()
  handleBidNotice() {
    const { dispatch, location } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    dispatch({
      type: 'bidNotice/queryBidNotice',
      payload: {
        sourceType: 'BR',
        sourceFrom: 'BID',
        sourceHeaderId: routerParams.sourceHeaderId,
      },
    }).then((res) => {
      if (res && res.noticeAttachmentUuid) {
        const attachmentUUID = res.noticeAttachmentUuid;
        dispatch({
          type: 'bidNotice/queryAttachment',
          payload: {
            attachmentUUID,
            bucketName: PUBLIC_BUCKET,
            directory: 'ssrc-bid-notice',
          },
        }).then((fileList) => {
          if (fileList) {
            this.setState({ fileList });
          }
        });
      }
    });
  }

  /**
   * 公告信息
   */
  renderNoticInfor() {
    const {
      bidNotice: { bidNoticeObj },
    } = this.props;
    return (
      <div className={common['notice-item']}>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidNum`).d('招标编号')}
              {...formLayout}
            >
              {bidNoticeObj.bidNum}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidMatter`).d('招标事项')}
              {...formLayout}
            >
              {bidNoticeObj.bidTitle}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidType`).d('招标类别')}
              {...formLayout}
            >
              {bidNoticeObj.bidTypeMeaning}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.purchasUnit`)
                .d('采购单位')}
              {...formLayout}
            >
              {bidNoticeObj.companyName}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidStartDate`)
                .d('投标开始时间')}
              {...formLayout}
            >
              {bidNoticeObj.quotationStartDate}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidEndDate`)
                .d('投标截止时间')}
              {...formLayout}
            >
              {bidNoticeObj.quotationEndDate}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidOpenDate`)
                .d('开标时间')}
              {...formLayout}
            >
              {bidNoticeObj.bidOpenDate}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidOpenSite`)
                .d('开标地点')}
              {...formLayout}
            >
              {bidNoticeObj.bidOpenLocation}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }

  /**
   * 联系人及联系方式
   */
  renderContactMethod() {
    const {
      bidNotice: { bidNoticeObj },
    } = this.props;

    return (
      <div className={common['notice-item']}>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.purchaseContact`)
                .d('采购联系人')}
              {...formLayout}
            >
              {bidNoticeObj.purName}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.contactTel`)
                .d('联系人电话')}
              {...formLayout}
            >
              {bidNoticeObj.purPhone}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.contactEmail`)
                .d('联系人邮箱')}
              {...formLayout}
            >
              {bidNoticeObj.purEmail}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }

  /**
   * 采购需求（分标段／不分标段）
   */
  renderPurchaseDemand() {
    const {
      bidNotice: { bidNoticeObj },
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.acceptBidNotice.model.goods.num`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.acceptBidNotice.modal.goods.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.acceptBidNotice.modal.goods.description`).d('物品描述'),
        dataIndex: 'itemName',
      },
      {
        title: intl.get(`ssrc.acceptBidNotice.model.goods.classify`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 120,
      },

      {
        title: intl.get(`ssrc.acceptBidNotice.model.goods.requestedDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 120,
        render: (val) => dateRender(val),
      },
      {
        title: intl.get(`ssrc.acceptBidNotice.model.goods.quantityRequired`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.acceptBidNotice.model.goods.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 140,
      },
    ];
    return (
      <Fragment>
        {bidNoticeObj.subjectMatterRule === 'PACK' &&
          bidNoticeObj.bidLineItemListPACK &&
          bidNoticeObj.bidLineItemListPACK.map((n, i) => {
            return (
              <div className={common['purchase-demand']}>
                <div className={common['section-title']}>
                  {intl.get(`ssrc.acceptBidNotice.model.goods.bidLines`).d('标段')}
                  {`${i + 1}-${n.sectionName}`}
                </div>
                <Table bordered dataSource={n.itemList} columns={columns} pagination={false} />
              </div>
            );
          })}
        {bidNoticeObj.subjectMatterRule === 'NONE' && (
          <div className={common['purchase-demand']}>
            <Table
              bordered
              columns={columns}
              pagination={false}
              dataSource={bidNoticeObj.bidLineItemListNONE}
            />
          </div>
        )}
      </Fragment>
    );
  }

  /**
   * 附件
   */
  renderAttachment() {
    const { fileList } = this.state;
    return (
      <Fragment>
        {fileList.map((n) => {
          return (
            <Row style={{ marginBottom: 16 }}>
              <Col span={20}>{n.fileName}</Col>
              <Col span={4}>
                <a
                  href={`${host}/hfle/v1/${organizationId}/files/download?access_token=${accessToken}&bucketName=${PUBLIC_BUCKET}&directory=ssrc-bid-notice&url=${n.fileUrl}`}
                >
                  {intl.get(`ssrc.acceptBidNotice.view.message.downloadAttachments`).d('附件下载')}
                </a>
              </Col>
            </Row>
          );
        })}
      </Fragment>
    );
  }

  render() {
    const {
      queryLoading,
      location,
      bidNotice: { bidNoticeObj },
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { sourceHeaderId, expertScoreType, preQualificationFlag } = routerParams;
    return (
      <Fragment>
        <Header
          title={intl.get(`ssrc.acceptBidNotice.title.bidNoticePreview`).d('招标公告预览')}
          backPath={`/ssrc/bid-hall/bid-update/${sourceHeaderId}?expertScoreType=${expertScoreType}&preQualificationFlag=${preQualificationFlag}`}
        />
        <Spin spinning={queryLoading}>
          <Content className={common['accept-notice']}>
            <div className={common['notice-title']}>
              <div>
                {bidNoticeObj.bidTitle &&
                  `${bidNoticeObj.bidTitle}${intl
                    .get(`ssrc.acceptBidNotice.model.acceptBidNotice.biddingAnnouncement`)
                    .d('招标公告')}`}
              </div>
              <div className={common['notice-time']}>
                {bidNoticeObj.approvedDate &&
                  `${intl
                    .get(`ssrc.acceptBidNotice.model.acceptBidNotice.approvedDate`)
                    .d('发布时间')}：${bidNoticeObj.approvedDate}`}
              </div>
            </div>
            <div className={common['notice-item-wrap']}>
              <Row className={common['notice-item-title']}>
                {intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.noticInfor`).d('公告信息')}
              </Row>
              <Divider />
              {this.renderNoticInfor()}
              <Row className={common['notice-item-title']}>
                {intl
                  .get(`ssrc.acceptBidNotice.model.acceptBidNotice.contactMethod`)
                  .d('联系人及联系方式')}
              </Row>
              <Divider />
              {this.renderContactMethod()}
              <Row className={common['notice-item-title']}>
                {intl
                  .get(`ssrc.acceptBidNotice.model.acceptBidNotice.purchaseDemand`)
                  .d('采购需求')}
              </Row>
              <Divider />
              {this.renderPurchaseDemand()}
              {bidNoticeObj.prequalRemark && (
                <Fragment>
                  <Row className={common['notice-item-title']}>
                    {intl
                      .get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidStatusDemand`)
                      .d('投标人的资格要求')}
                  </Row>
                  <Divider />
                  <div className={common['other-item']}>{bidNoticeObj.prequalRemark}</div>
                </Fragment>
              )}
              {bidNoticeObj.remark && (
                <Fragment>
                  <Row className={common['notice-item-title']}>
                    {intl
                      .get(`ssrc.acceptBidNotice.model.acceptBidNotice.otherSuppleItems`)
                      .d('其它补充事项')}
                  </Row>
                  <Divider />
                  <div className={common['other-item']}>{bidNoticeObj.remark}</div>
                </Fragment>
              )}
              {bidNoticeObj.noticeAttachmentUuid && (
                <Fragment>
                  <Row className={common['notice-item-title']}>
                    {intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.attachment`).d('附件')}
                  </Row>
                  <Divider />
                  <div className={common['notice-item']}>
                    <Row className={common['notice-attachment']}>
                      <Col span={2}>
                        {intl
                          .get(`ssrc.acceptBidNotice.model.acceptBidNotice.attachment`)
                          .d('附件')}
                        ：
                      </Col>
                      <Col span={10}>{this.renderAttachment()}</Col>
                    </Row>
                  </div>
                </Fragment>
              )}
            </div>
          </Content>
        </Spin>
      </Fragment>
    );
  }
}
