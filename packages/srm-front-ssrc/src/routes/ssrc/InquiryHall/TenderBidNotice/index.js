/**
 * BidNotice - 招标公告预览
 * @date: 2020-6-5
 * @author: kangzou <kangzou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Divider, Row, Col, Form, Table, Spin, Tooltip, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';
import { PUBLIC_BUCKET } from '_utils/config';

import { phoneRender } from '@/utils/renderer';
import common from '@/routes/sbid/common.less';
import Upload from 'srm-front-boot/lib/components/Upload';
import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';
import style from './style.less';

const FormItem = Form.Item;
const { Option } = Select;

class BidNotice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSectionCode: '',
    };
  }

  sourceKey = this.props.sourceKey || INQUIRY;

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
      this.previewTenderNotice();
    }
  }

  componentDidMount() {
    this.previewTenderNotice();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        tenderNoticePreview: {},
      },
    });
  }

  /**
   * 查询招标公告
   */
  @Bind()
  previewTenderNotice() {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
    } = this.props;

    dispatch({
      type: 'inquiryHall/previewTenderNotice',
      payload: {
        organizationId,
        sourceType: 'BR',
        sourceFrom: 'RFX',
        sourceHeaderId: params.rfxId,
      },
    }).then((res) => {
      if (res && !res.failed) {
        const { multiSectionFlag, projectLineSectionMap = {} } = res || {};
        if (multiSectionFlag) {
          this.setState({ activeSectionCode: Object.keys(projectLineSectionMap)?.[0] });
        }
      }
    });
  }

  // 多选lov文本渲染
  renderMultiLovText(value = null) {
    if (isEmpty(value)) {
      return null;
    }

    const result = [];
    const parseValue = value ? JSON.parse(value) : [];
    parseValue.forEach((item = {}) => {
      const { categoryName = null, industryName = null } = item;
      result.push(categoryName || industryName);
    });
    const valueText = result.join(',');

    return <Tooltip title={valueText}>{valueText || '-'}</Tooltip>;
  }

  // 改变标段
  @Bind()
  changeSection(value) {
    this.setState({ activeSectionCode: value });
  }

  /**
   * 公告信息
   */
  renderNoticInfor() {
    const {
      organizationId,
      inquiryHall: { tenderNoticePreview = {} },
    } = this.props;

    return (
      <div className={common['notice-item']}>
        <Row>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticePreview.sourceNum}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.view.message.button.bidTitle`).d('寻源标题')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticePreview.sourceTitle}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.purchasUnit`)
                .d('采购单位')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticePreview.companyName}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStartTime`, {
                  quotationName: getQuotationName(this.sourceKey === BID),
                })
                .d('{quotationName}开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticePreview.quotationStartDate}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDeadline`, {
                  quotationName: getQuotationName(this.sourceKey === BID),
                })
                .d('{quotationName}截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticePreview.quotationEndDate}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Upload
                filePreview
                viewOnly
                bucketName={PUBLIC_BUCKET}
                bucketDirectory="ssrc-bidhall-update"
                attachmentUUID={tenderNoticePreview.noticeAttachmentUuid}
                tenantId={organizationId}
              />
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
      inquiryHall: { tenderNoticePreview = {} },
    } = this.props;

    return (
      <div className={common['notice-item']}>
        <Row>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.purchaseContact`)
                .d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticePreview.purName}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.contactTel`)
                .d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {phoneRender(
                tenderNoticePreview.internationalTelCodeMeaning,
                tenderNoticePreview.purPhone
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.contactEmail`)
                .d('联系人邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticePreview.purEmail}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }

  // 对供应商要求
  renderSupplierWithRequest = () => {
    const {
      inquiryHall: { tenderNoticePreview = {} },
    } = this.props;

    return (
      <div className={common['notice-item']}>
        <Row>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.organizationType`)
                .d('境内外关系')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {tenderNoticePreview.organizationTypeMeaning || ''}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.industryData`).d('行业类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {this.renderMultiLovText(tenderNoticePreview.industryData)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.industryCategoryData`)
                .d('主营品类')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {this.renderMultiLovText(tenderNoticePreview.industryCategoryData)}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  };

  /**
   * 采购需求
   */
  renderPurchaseDemand() {
    const {
      inquiryHall: { tenderNoticePreview = {} },
    } = this.props;

    const { activeSectionCode = '' } = this.state;

    const columns = [
      {
        title: intl.get(`ssrc.acceptBidNotice.model.goods.num`).d('行号'),
        dataIndex: 'rfxLineItemNum',
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
        dataIndex: 'itemCategoryName',
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
        dataIndex: 'rfxQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.acceptBidNotice.model.goods.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 140,
      },
    ];
    const scrollX = tableScrollWidth(columns || []);

    return (
      <Table
        bordered
        rowKey="rfxLineItemId"
        dataSource={
          tenderNoticePreview?.multiSectionFlag
            ? tenderNoticePreview?.sectionItemMap?.[activeSectionCode] || []
            : tenderNoticePreview.rfxLineItemList
        }
        columns={columns}
        scroll={{ x: scrollX }}
        pagination={false}
        style={{
          marginTop: '8px',
        }}
      />
    );
  }

  render() {
    const {
      queryLoading,
      inquiryHall: { tenderNoticePreview = {} },
    } = this.props;

    const { activeSectionCode } = this.state;

    return (
      <Fragment>
        <Header title={intl.get(`ssrc.acceptBidNotice.title.bidNoticePreview`).d('招标公告预览')} />
        <Spin spinning={queryLoading}>
          <Content className={common['accept-notice']}>
            <div className={common['notice-title']}>
              <div>{tenderNoticePreview.noticeTitle}</div>
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
                  .get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest')
                  .d('对供应商要求')}
              </Row>
              <Divider />
              {this.renderSupplierWithRequest()}

              <Row
                className={common['notice-item-title']}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {intl
                  .get(`ssrc.acceptBidNotice.model.acceptBidNotice.purchaseDemand`)
                  .d('采购需求')}
                {tenderNoticePreview?.multiSectionFlag ? (
                  <>
                    <span className={style['section-bidding-divider']} />
                    <span className={style['section-bidding-title']}>
                      {intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段')}
                    </span>
                    <Select
                      value={activeSectionCode}
                      className={style['section-bidding-select']}
                      onChange={this.changeSection}
                    >
                      {Object.keys(tenderNoticePreview?.projectLineSectionMap)?.map?.((key) => {
                        return (
                          <Option value={key}>
                            {tenderNoticePreview?.projectLineSectionMap?.[key]}
                          </Option>
                        );
                      })}
                    </Select>
                  </>
                ) : null}
              </Row>
              <Divider />
              {this.renderPurchaseDemand()}
            </div>
          </Content>
        </Spin>
      </Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return formatterCollections({
    code: ['ssrc.acceptBidNotice', 'ssrc.inquiryHall', 'ssrc.bidHall', 'ssrc.common'],
  })(
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      queryLoading: loading.effects['inquiryHall/previewTenderNotice'],
      organizationId: getCurrentOrganizationId(),
    }))(Comp)
  );
};

export default HOCComponent(BidNotice);
export { HOCComponent, BidNotice };
