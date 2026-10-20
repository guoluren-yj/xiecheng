/**
 * inquiryHall - 寻源服务/寻源大厅-明细查看
 * @date: 2020-04-08
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Form, Row, Col, Collapse, Icon, Table, Popover, Tooltip } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { tableScrollWidth, getResponse, createPagination } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import { phoneRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  prequalDetailHeaderInInquiryDetail,
  prequalDetailInInquiryDetail,
} from '@/services/inquiryHallService';

import InPrequalProgress from './InPrequalProgress';

const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
export default class InPrequal extends PureComponent {
  constructor(props) {
    super(props);

    this.collapseKeys = ['ssrcDetailInPrequalHeader', 'ssrcDetailInprequalSupplier'];

    this.state = {
      headerInfo: {},
      prequalDetailList: [],
      prequalDetailPagination: {},
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
      this.fetchPageMain();
    }
  }

  componentDidMount() {
    this.fetchPageMain();
  }

  // 查询头/行
  fetchPageMain = () => {
    this.prequalDetailHeaderInInquiryDetail();
    this.prequalDetailInInquiryDetail();
  };

  @Bind()
  async prequalDetailHeaderInInquiryDetail() {
    const {
      sourceHeaderId,
      organizationId,
      rfx = {},
      pubRouterAddParams = () => {},
      onFormLoaded,
    } = this.props;
    const { unitCodeSymbol } = rfx;

    try {
      let data = await prequalDetailHeaderInInquiryDetail({
        organizationId,
        sourceHeaderId,
        sourceFrom: 'RFX', // 来源是bid/rfx
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.PREQUAL_HEADER`,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        headerInfo: data,
      });
    } catch (e) {
      throw e;
    } finally {
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    }
  }

  @Bind()
  async prequalDetailInInquiryDetail(page = {}) {
    const { sourceHeaderId, organizationId, pubRouterAddParams = () => {}, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    try {
      let data = await prequalDetailInInquiryDetail({
        organizationId,
        sourceHeaderId,
        page,
        sourceFrom: 'RFX', // 来源是bid/rfx
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.PREQUAL_LINE`,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      const { content = [] } = data || {};
      this.setState({
        prequalDetailList: content,
        prequalDetailPagination: createPagination(data),
      });
    } catch (e) {
      throw e;
    }
  }

  // 查看预审建议进度
  @Bind()
  showLineApprovedProgress(record = {}) {
    const { headerInfo: header = {} } = this.state;
    const { prequalHeaderId } = header || {};
    if (isEmpty(record) || !prequalHeaderId) return;

    Modal.open({
      key: 'rfx-detail-prequal-suggest-progress',
      title: intl.get('ssrc.qualiExam.model.qualiExam.lineApprovedProgress').d('预审建议进度'),
      destroyOnClose: true,
      style: {
        width: 742,
      },
      drawer: true,
      children: <InPrequalProgress record={record} prequalHeaderId={header.prequalHeaderId} />,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
    });
  }

  @Bind()
  setCollapseByKey(keys = []) {
    // this.setState({
    //   InPrequalCollapseKeys: keys,
    // });

    this.toggleCollapseIndicator(keys);
  }

  toggleCollapseIndicator(keys = []) {
    const ids = this.collapseKeys || {};

    ids.forEach((item) => {
      if (!item) {
        return;
      }
      const isOpened = keys.includes(item);
      if (isOpened) {
        this.renderCollapseIndicatorNode(item);
      } else {
        this.renderCollapseIndicatorNode(item, false);
      }
    });
  }

  renderCollapseIndicatorNode(id = null, opened = true) {
    if (!id) {
      return;
    }

    const CurrentNode = (
      <span style={{ paddingLeft: '8px' }}>
        <a>
          {opened
            ? intl.get(`hzero.common.button.up`).d('收起')
            : intl.get(`hzero.common.button.expand`).d('展开')}
        </a>
        <Icon type={opened ? 'up' : 'down'} />
      </span>
    );

    const CurrentId = document.getElementById(id);
    if (!CurrentId) {
      return;
    }
    ReactDOM.render(CurrentNode, CurrentId);
  }

  renderFormContent(dataSource = {}) {
    const {
      form,
      organizationId,
      FormItem,
      showPretrialPanel = () => {},
      showScoringElement = () => {},
      customizeForm = () => {},
      rfx = {},
    } = this.props;
    const { headerInfo: header = {} } = this.state;
    const { getFieldDecorator } = form;
    const { unitCodeSymbol } = rfx;

    return (
      <React.Fragment>
        {customizeForm(
          {
            code: `SSRC.${unitCodeSymbol}_DETAIL.PREQUAL_HEADER`,
            form,
            dataSource,
            readOnly: true,
          },
          <Form className="read-row-custom">
            <Row type="flex" justify="start" gutter={48} className="read-row-custom">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.common.company').d('公司')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('companyName', { initialValue: dataSource.companyName })(
                    <span>{dataSource.companyName}</span>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceCategoryMeaning', {
                    initialValue: dataSource.sourceCategoryMeaning,
                  })(
                    <span>
                      {dataSource.secondarySourceCategoryMeaning ||
                        dataSource.sourceCategoryMeaning}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceMethodMeaning', {
                    initialValue: dataSource.sourceMethodMeaning,
                  })(<span>{dataSource.sourceMethodMeaning}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" justify="start" gutter={48} className="read-row-custom">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.qualiExam.model.qualiExam.prequalEndDate`)
                    .d('预审截止时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalEndDate', { initialValue: dataSource.prequalEndDate })(
                    <span>{dateTimeRender(dataSource.prequalEndDate)}</span>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.qualificationType`).d('审查方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('reviewMethodMeaning', {
                    initialValue: dataSource.reviewMethodMeaning,
                  })(<span>{dataSource.reviewMethodMeaning}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.qualifiedLimit`).d('合格上限')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('qualifiedLimit', {
                    initialValue: dataSource.qualifiedLimit,
                  })(<span>{dataSource.qualifiedLimit}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" justify="start" gutter={48} className="read-row-custom">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.prequalLocation`).d('申请提交地点')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalLocation', {
                    initialValue: dataSource.prequalLocation,
                  })(<span>{dataSource.prequalLocation}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.enableScoreFlag`)
                    .d('启用评分细项')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('enableScoreFlag', {
                    initialValue: dataSource.enableScoreFlag,
                  })(
                    <span>
                      {yesOrNoRender(header.enableScoreFlag)}
                      {header.enableScoreFlag ? (
                        <a onClick={() => showScoringElement(header)}>
                          {intl.get('hzero.common.button.view').d('查看')}
                        </a>
                      ) : null}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.qualiExam.model.qualiExam.prequalAttachmentUuid`)
                    .d('资格预审文件')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalAttachmentUuid', {
                    initialValue: dataSource.prequalAttachmentUuid,
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
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.common.pretrialPanel`).d('预审小组')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('pretrialPanel')(
                    <a onClick={() => showPretrialPanel(true)}>
                      {intl.get('hzero.common.button.view').d('查看')}
                    </a>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.common.qualRequirements`).d('资质要求')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalRemark', {
                    initialValue: dataSource.prequalRemark,
                  })(<span>{dataSource.prequalRemark}</span>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }

  renderPrequalHeader() {
    const { headerInfo: header = {} } = this.state;

    return (
      <Panel
        showArrow={false}
        header={
          <span style={{ display: 'flex' }}>
            <h3
              style={{
                maxWidth: '90%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'noWrap',
                marginRight: '12px',
              }}
            >
              {header.rfxNum}
              <Tooltip
                title={`${header.rfxNum}-${header.rfxTitle}`}
                overlayStyle={{ minWidth: '300px' }}
              >
                {header.rfxTitle ? `-${header.rfxTitle}` : null}
              </Tooltip>
            </h3>
            <span id="ssrcDetailInPrequalHeader">
              {this.renderCollapseIndicatorNode('ssrcDetailInPrequalHeader')}
            </span>
          </span>
        }
        key="ssrcDetailInPrequalHeader"
      >
        {this.renderFormContent(header)}
      </Panel>
    );
  }

  renderTableColumns() {
    return [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        dataIndex: 'name',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        dataIndex: 'mobilephone',
        width: 200,
        render: (val, record) => phoneRender(record.internationalTelCodeMeaning, val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalRequestted`).d('预审申请'),
        dataIndex: 'prequalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('ssrc.qualiExam.model.qualiExam.lineApprovedProgress').d('预审建议进度'),
        dataIndex: 'lineApprovedProgress',
        width: 120,
        render: (val, record = {}) => {
          if (record.rfxPrequalLineStatus === 'RETURNED') {
            return;
          }
          return (
            <a onClick={() => this.showLineApprovedProgress(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          );
        },
      },
      {
        title: intl.get('ssrc.qualiExam.model.qualiExam.lineApprovedAdvice').d('预审建议结果'),
        dataIndex: 'lineApprovedStatusMeaning',
        width: 120,
      },
      {
        title: intl.get('ssrc.qualiExam.model.qualiExam.leaderSummaryRes').d('组长汇总结果'),
        dataIndex: 'leaderSummaryResMeaning',
        width: 120,
      },
      {
        title: intl.get('ssrc.qualiExam.model.qualiExam.leaderSummaryRemark').d('组长汇总备注'),
        dataIndex: 'preRemark',
        width: 120,
      },
    ];
  }

  renderPrequalSupplier() {
    // const {
    //   prequalDetailInInquiryDetailLoading,
    //   prequalDetailList = [],
    //   prequalDetailPagination = {},
    //   prequalDetailInInquiryDetail,
    // } = this.props;
    const { customizeTable = () => {}, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    const { prequalDetailList = [], prequalDetailPagination = {} } = this.state;

    const columns = this.renderTableColumns();
    const scrollX = tableScrollWidth(columns);

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{intl.get('ssrc.inquiryHall.view.title.prequalDetails').d('预审详情')}</h3>
            <span id="ssrcDetailInprequalSupplier">
              {this.renderCollapseIndicatorNode('ssrcDetailInprequalSupplier')}
            </span>
          </React.Fragment>
        }
        key="ssrcDetailInprequalSupplier"
      >
        {customizeTable(
          {
            code: `SSRC.${unitCodeSymbol}_DETAIL.PREQUAL_LINE`,
            readOnly: true,
          },
          <Table
            bordered
            rowKey="supplierCompanyId"
            // loading={prequalDetailInInquiryDetailLoading}
            columns={columns}
            scroll={{ x: scrollX, y: 360 }}
            dataSource={prequalDetailList}
            pagination={prequalDetailPagination}
            onChange={(page) => this.prequalDetailInInquiryDetail(page)}
          />
        )}
      </Panel>
    );
  }

  render() {
    return (
      <Collapse
        onChange={(keys) => this.setCollapseByKey(keys)}
        className="form-collapse"
        defaultActiveKey={this.collapseKeys}
      >
        {this.renderPrequalHeader()}
        {this.renderPrequalSupplier()}
      </Collapse>
    );
  }
}
