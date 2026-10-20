/**
 * 评审供应商列表 - 符合性检查
 * @date: 2020-12-30
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Select, Popover, Table, Form, Badge, Modal } from 'hzero-ui';
import { sum, isNumber, isFunction, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import QuoteAttachment from '@/routes/ssrc/SupplierQuotation/InquiryPrice/QuoteAttachment';
import { PRIVATE_BUCKET } from '_utils/config';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';

import styles from './index.less';

const promptCode = 'ssrc.bidHall';

@Form.create({ fieldNameProp: null })
export default class ReviewSupplier extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.bidLineItemId, this);
    }
    this.state = {
      attachmentVisible: false, // 供应商附件查看
      attachmentsProps: {}, // 供应商附件属性
    };
  }

  /**
   * 打开附件模态框
   * @param {Object} record = {}
   */
  @Bind()
  showAttachmentModal(record = {}) {
    if (isEmpty(record)) {
      return;
    }
    const { header } = this.props;

    const {
      businessAttachmentUuid = null,
      techAttachmentUuid = null,
      bargainBusinessAttachmentUuid = null, // 议价中商务附件
      bargainTechAttachmentUuid = null, // 议价中技术附件
      roundBusinessAttachmentUuid = null, // 多轮报价商务附件
      roundTechAttachmentUuid = null, // 多轮报价技术附件
    } = record;

    // 报价单头附件列表
    const attachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      // roundFlag,
      quotationHeader: record, // TODO bargainFlag
      bucketDirectory: 'ssrc-rfx-quotationheader',
      viewOnly: true,
      // tenantId: organizationId,
      // initUpload: this.initUpload,
      businessUuid: businessAttachmentUuid,
      techUuid: techAttachmentUuid,
      bargainBusUuid: bargainBusinessAttachmentUuid,
      bargainTechUuid: bargainTechAttachmentUuid,
      roundBusUuid: roundBusinessAttachmentUuid,
      roundTechUuid: roundTechAttachmentUuid,
      showBusinessAttachment: header && !isEmpty(header) && header?.reviewHidePrice !== 'HIDE',
      // onRef: this.handleBindOnRef,
    };

    this.setState({
      attachmentsProps,
      attachmentVisible: true,
    });
  }

  /**
   * 关闭附件模态框
   */
  @Bind()
  hideAttachmentModal() {
    this.setState({ attachmentVisible: false, attachmentsProps: {} });
  }

  /**
   * 跳转到评审澄清页面
   * @param {!Object} record - 行记录
   */
  @Bind()
  handleJumpToClarify(record = {}) {
    const { quotationHeaderId, sourceFrom, sourceHeaderId } = record;
    const {
      history,
      title,
      location: { pathname = '', search: searchData = '' },
    } = this.props;
    const search = querystring.stringify({
      quotationHeaderId,
      sourceFrom,
      fromFlag: 0,
      sourceHeaderId,
      title,
      backPath: `${pathname}${searchData}`,
    });

    const routerPrefix = pathname.split('/')[2];
    const routerName = sourceFrom === 'BID' ? 'bid' : 'rfx';
    history.push({
      pathname: `/ssrc/${routerPrefix}/${routerName}-review-clarification`,
      search,
    });
  }

  // 渲染评分明细
  renderScoreDetailTable(record = {}) {
    const columns = [
      {
        title: intl.get(`${promptCode}.model.bidHall.subAccount`).d('专家子账户'),
        dataIndex: 'subAccount',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.expertName`).d('专家名称'),
        dataIndex: 'expertName',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.reviewResult`).d('是否通过'),
        dataIndex: 'reviewResultMeaning',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.reviewExpertSuggestion`).d('评审意见'),
        dataIndex: 'reviewExpertSuggestion',
        width: 200,
        render: (val) => (
          <Popover placement="topLeft" content={val}>
            {val}
          </Popover>
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const { supplierCompanyName, evaluateScoreList = [] } = record;
    return (
      <React.Fragment>
        <h3>
          {supplierCompanyName}
          {intl.get(`${promptCode}.view.message.title.scoreDetail`).d('评分明细')}
        </h3>
        <Table
          bordered
          rowKey="evaluateScoreId"
          columns={columns}
          dataSource={evaluateScoreList}
          pagination={false}
          scroll={{ x: scrollX }}
        />
      </React.Fragment>
    );
  }

  render() {
    const {
      // form,
      loading,
      dataSource = [],
      customizeTable,
      code: { detailApprovedStatus = [] },
      newQuotationFlag,
      sourceStatus,
      exportScoringBussSum,
      header,
    } = this.props;

    const { attachmentsProps, attachmentVisible } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.bidHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.expertReviewResult`).d('专家评审结果'),
        dataIndex: 'expertReviewResultMeaning',
        width: 200,
        render: (val, record) => (
          <Popover placement="topLeft" content={this.renderScoreDetailTable(record)}>
            <a>{val}</a>
          </Popover>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.reviewResultConfirm`).d('评审结果确认'),
        dataIndex: 'summaryReviewResult',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('summaryReviewResult', {
                initialValue:
                  val || (record.expertReviewResult === 'ALL_PASS' ? 'APPROVED' : 'NO_APPROVED'),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.bidHall.reviewResultConfirm`)
                        .d('评审结果确认'),
                    }),
                  },
                ],
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  disabled={['ALL_PASS', 'UN_PASS'].includes(record.expertReviewResult)}
                >
                  {detailApprovedStatus &&
                    detailApprovedStatus.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            record.summaryReviewResultMeaning
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.attachment`).d('附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
        render: (_, record) => {
          return !newQuotationFlag ? (
            <a onClick={() => this.showAttachmentModal(record)}>
              {intl.get(`ssrc.bidHall.model.bidHall.viewAttachments`).d('查看附件')}
              <RenderFileTotalCount record={record} uiType="h0" />
            </a>
          ) : (
            <FileGroup
              name="attachmentUuid"
              record={record}
              uiType="h0"
              fileType="HEADER"
              hideBusinessAttachment={header?.reviewHidePrice === 'HIDE'}
              queryParams={{
                expertSummaryScoreQueryFlag: 1,
                sourceStatus,
              }}
            />
          );
        },
      },
      /** ********* 万国二开评审澄清-勿动!!! *********** */
      {
        title: intl.get(`${promptCode}.model.bidHall.reviewClarified`).d('评审澄清'),
        dataIndex: 'reviewClarified',
        width: 200,
        render: (_, record) => (
          <Badge
            count={record.reviewUnreadCount}
            offset={[0, 5]}
            className={styles.suggestInvalidCountBadge}
          >
            <a onClick={() => this.handleJumpToClarify(record)}>
              {intl.get(`${promptCode}.view.message.link.reviewClarified`).d('评审澄清')}
            </a>
          </Badge>
        ),
      },
    ];
    const processColumns = exportScoringBussSum
      ? exportScoringBussSum.process(
          'SSRC_EXPERT_SCORING_BUSS_SUM_PROCESS_REVIEW_SUPPLIER_TABLE_COLUMNS',
          columns,
          {
            header,
          }
        )
      : columns;

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <>
        {customizeTable(
          {
            code: 'SSRC.EXPERT_SCORE_MANAGE.REVIEW_LINE',
          },
          <EditTable
            bordered
            rowKey="quotationHeaderId"
            loading={loading}
            dataSource={dataSource}
            columns={processColumns}
            pagination={false}
            scroll={{ x: scrollX }}
          />
        )}
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          title={intl.get('hzero.common.title.checkAttach').d('查看附件')}
          footer={null}
          onCancel={this.hideAttachmentModal}
          width={1000}
        >
          <QuoteAttachment {...attachmentsProps} />
        </Modal>
      </>
    );
  }
}
