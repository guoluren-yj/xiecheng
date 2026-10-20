/**
 * 询价单 - 招标公告预览
 * @date: 20120-6-4
 * @author: zk <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import { Divider, Row, Col, Form, Table, Spin } from 'hzero-ui';
import { Attachment } from 'choerodon-ui/pro';

// import { FIlESIZE } from '@/utils/SsrcRegx';
// import { PUBLIC_BUCKET } from '_utils/config';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { numberSeparatorRender, phoneRender } from '@/utils/renderer';

import common from '@/routes/sbid/common.less';

const FormItem = Form.Item;

@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.inquiryHall', 'ssrc.bidHall'] })
@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  previewWInnerBidNoticeLoading: loading.effects['inquiryHall/previewWInnerBidNotice'],
  organizationId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  componentDidMount() {
    this.previewWInnerBidNotice();
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams.rfxId || null;
    const id = params.rfxId || null;
    return prevId !== id;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.previewWInnerBidNotice();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        previewWinNoticeInfo: {},
      },
    });
  }

  /**
   * 招标公告
   * */
  previewWInnerBidNotice(data = {}) {
    const {
      dispatch,
      match: { params = {} },
      organizationId,
    } = this.props;

    dispatch({
      type: 'inquiryHall/previewWInnerBidNotice',
      payload: {
        ...data,
        organizationId,
        noticeType: 'BR_ACCEPTED',
        sourceFrom: 'RFX',
        sourceHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 公告信息
   */
  renderNoticInfor() {
    const {
      inquiryHall: { previewWinNoticeInfo = {} },
    } = this.props;
    return (
      <div className={common['notice-item']}>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.rfxSourceNum').d('寻源编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {previewWinNoticeInfo.sourceNum}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.sourceTitle').d('寻源标题')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {previewWinNoticeInfo.sourceTitle}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {previewWinNoticeInfo.secondarySourceCategoryMeaning ||
                previewWinNoticeInfo.sourceCategoryMeaning}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.purchasUnit').d('采购单位')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {previewWinNoticeInfo.companyName}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl
                .get('ssrc.inquiryHall.model.inquiryHall.sourceNoticeDate')
                .d('寻源公告日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {previewWinNoticeInfo.approvedDate && previewWinNoticeInfo.approvedDate.substr(0, 10)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.winBidDate').d('中标日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {previewWinNoticeInfo.sourceAcceptedDate &&
                previewWinNoticeInfo.sourceAcceptedDate.substr(0, 10)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.allAcceptMoney').d('总中标金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {numberSeparatorRender(previewWinNoticeInfo.sourceAcceptedTotalAmount)}
            </FormItem>
          </Col>
          {previewWinNoticeInfo.expertNames && (
            <Col span={12}>
              <FormItem
                label={intl.get('ssrc.inquiryHall.model.inquiryHall.expertList').d('评审专家名单')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {previewWinNoticeInfo.expertNames}
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
      inquiryHall: { previewWinNoticeInfo = {} },
    } = this.props;

    return (
      <div className={common['notice-item']}>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.purchaseContact').d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {previewWinNoticeInfo.purName}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.contactTel').d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {phoneRender(
                previewWinNoticeInfo.internationalTelCodeMeaning,
                previewWinNoticeInfo.purPhone
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.contactEmail').d('联系人邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {previewWinNoticeInfo.purEmail}
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
      inquiryHall: { previewWinNoticeInfo = {} },
    } = this.props;
    const columns = [
      {
        title: intl.get('ssrc.inquiryHall.model.goods.num').d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.goods.itemLinecode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.goods.description').d('物品描述'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.goods.quantityRequired').d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.goods.unit').d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.goods.supplierNum').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.goods.supplierName').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.goods.acceptNumber').d('中标数量'),
        dataIndex: 'validQuotationQuantityMeaning',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.goods.acceptMoney').d('中标金额'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get('ssrc.inquiryHall.model.goods.acceptPercent').d('中标比例'),
        dataIndex: 'bidAcceptedRate',
        width: 100,
      },
    ];
    const scrollX = tableScrollWidth(columns || []);

    return (
      <Table
        bordered
        rowKey="rfxLineItemId"
        columns={columns}
        dataSource={previewWinNoticeInfo.rfxLineItemList || []}
        pagination={false}
        scroll={{ x: scrollX }}
      />
    );
  }

  renderAttachment() {
    const {
      organizationId,
      inquiryHall: { previewWinNoticeInfo = {} },
    } = this.props;

    return (
      <Row>
        <Col span={8}>
          <Attachment
            readOnly
            value={previewWinNoticeInfo.noticeAttachmentUuid}
            label={intl.get('ssrc.rfxNotice.view.subtitle.attachment').d('附件')}
            // isPublic
            // bucketName={PUBLIC_BUCKET}
            bucketDirectory="ssrc-tendernotice-detail"
            data={{
              tenantId: organizationId,
            }}
          />
        </Col>
      </Row>
    );
  }

  render() {
    const {
      previewWInnerBidNoticeLoading,
      inquiryHall: { previewWinNoticeInfo = {} },
    } = this.props;

    return (
      <Fragment>
        <Header
          title={intl.get('ssrc.inquiryHall.model.title.acceptNoticePreview').d('中标公告预览')}
        />
        <Spin spinning={previewWInnerBidNoticeLoading}>
          <Content className={common['accept-notice']}>
            <div className={common['notice-title']}>
              <div>{previewWinNoticeInfo.noticeTitle}</div>
              <div className={common['notice-time']}>
                {previewWinNoticeInfo.noticeDate &&
                  `${intl.get('ssrc.inquiryHall.model.title.releaseTime').d('发布时间')}：${
                    previewWinNoticeInfo.noticeDate
                  }`}
              </div>
            </div>
            <div className={common['notice-item-wrap']}>
              <Row className={common['notice-item-title']}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.noticInfor').d('公告信息')}
              </Row>
              <Divider />
              {this.renderNoticInfor()}
              <Row className={common['notice-item-title']}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.contactMethod').d('联系人及联系方式')}
              </Row>
              <Divider />
              {this.renderContactMethod()}
              <Row className={common['notice-item-title']}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.acceptInfor').d('中标信息')}
              </Row>
              <Divider />
              {this.renderDiffSection()}
              <Row className={common['notice-item-title']}>
                {intl.get(`ssrc.rfxNotice.view.subtitle.attachment`).d('附件')}
              </Row>
              <Divider />
              {this.renderAttachment()}
            </div>
          </Content>
        </Spin>
      </Fragment>
    );
  }
}
