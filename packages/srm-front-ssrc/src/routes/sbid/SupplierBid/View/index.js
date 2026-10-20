/**
 * index -投标明细/查看投标
 * @date: 2018-12-29
 * @author: LC<chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import {
  Button,
  Form,
  Col,
  Row,
  Spin,
  Collapse,
  Icon,
  Modal,
  Popover,
  Tooltip,
  Tabs,
  Table,
} from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';
import { map, sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import querystring from 'querystring';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  DEFAULT_DATE_FORMAT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import * as routerRedux from 'react-router-redux';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

const FormItem = Form.Item;
const { Panel } = Collapse;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};
const promptCode = 'ssrc.supplierBid';

@withCustomize({
  unitCode: [
    'SSRC.TENDER_HALL_VIEW.ITEM_LINE',
    'SSRC.TENDER_HALL_VIEW.ITEM_LINE_NONE',
    'SSRC.TENDER_HALL_VIEW.HEADER',
  ],
})
@connect(({ inquiryHall, supplierBid, loading }) => ({
  inquiryHall,
  supplierBid,
  organizationId: getCurrentOrganizationId(),
  headerLoding: loading.effects['supplierBid/queryQuotationHeader'],
  quotationBackLoading: loading.effects['supplierBid/quotationTakeback'],
  abandonLoading: loading.effects['supplierBid/fatchAbandon'],
  fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
  queryQuotationLinesLoading: loading.effects['supplierBid/queryQuotationLines'],
}))
@formatterCollections({
  code: 'ssrc.supplierBid',
})
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  form;

  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      routerParams,
      // fileLength: 0, // 资格预审文件个数，用于付费情况下只读展示
      collapseKeys: ['baseInfos'], // 打开的折叠面板key
      sectionFlag: false, // 分标段标志
    };
  }

  /**
   * 生命周期初始化函数-接口初始化数据查询
   */
  componentDidMount() {
    this.querySupplier();
  }

  /**
   * 生命周期销毁函数-销毁页面存在redux中state
   */
  componentWillUnmount() {
    // 判断路由进来的是那个页面，清空对应的state
    const { routerParams } = this.state;
    if (routerParams.typeName === 'bidQueryClarification') {
      this.props.dispatch({
        type: 'supplierBid/updateState',
        payload: {
          supplierBidQueryHeader: {},
          supplierBidQueryItemsList: [],
        },
      });
    } else if (routerParams.typeName === 'bidTenderlarification') {
      this.props.dispatch({
        type: 'supplierBid/updateState',
        payload: {
          supplierBidTenderHeader: {},
          supplierBidTenderItemsList: [],
        },
      });
    } else {
      this.props.dispatch({
        type: 'supplierBid/updateState',
        payload: {
          quotationHeader: {},
          quotationLines: [],
        },
      });
    }
  }

  /**
   * 渲染父路由
   * bidQueryClarification-供应商招投标澄清查询
   * bidTenderClarification-供应商-招投标澄清维护
   * other-供应商-投标明细
   * @returns {*}
   */
  renderParent() {
    let url;
    const { routerParams } = this.state;
    if (routerParams.typeName === 'bidQueryClarification') {
      url = '/ssrc/bid-query-clarification/list';
    } else if (routerParams.typeName === 'bidTenderlarification') {
      url = '/ssrc/bid-tender-clarification/list';
    } else {
      url = '/ssrc/supplier-bid-hall/list';
    }
    return url;
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   *  分割end---------------------------------------------------------分割end
   *  start---------------------放弃-----------------------------start
   */

  /**
   * 初始化查询供应商接口信息
   */
  @Bind()
  querySupplier() {
    const {
      dispatch,
      match: { params },
      location: { search = {} },
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    const { subjectMatterRule = '' } = routerParams;
    const { quotationHeaderId } = params;
    dispatch({
      type: 'supplierBid/queryQuotationHeader',
      payload: {
        quotationHeaderId,
        customizeUnitCode: 'SSRC.TENDER_HALL_VIEW.HEADER',
      },
    });
    dispatch({
      type: 'supplierBid/queryQuotationLines',
      payload: {
        quotationHeaderId,
        customizeUnitCode:
          subjectMatterRule === 'PACK'
            ? 'SSRC.TENDER_HALL_VIEW.ITEM_LINE'
            : 'SSRC.TENDER_HALL_VIEW.ITEM_LINE_NONE',
      },
    }).then((res) => {
      if (res) {
        // 不分标段
        if (res.sectionFlag === 0) {
          this.setState({
            sectionFlag: false,
          });
          // 分标段
        } else {
          this.setState({
            sectionFlag: true,
          });
        }
      }
    });
  }

  /**
   * 收回投标
   */
  @Bind()
  backBid() {
    const {
      dispatch,
      supplierBid: { quotationHeader = {} },
    } = this.props;

    Modal.confirm({
      title: intl.get(`${promptCode}.model.supplierBid.backBid`).d('收回投标'),
      content: intl.get(`${promptCode}.model.supplierBid.backBidYesOrNot`).d('是否确认收回投标？'),
      onOk: () => {
        dispatch({
          type: 'supplierBid/quotationTakeback',
          payload: {
            quotationHeader,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/supplier-bid-hall/list`,
              })
            );
          }
        });
      },
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 物品行报价明细
   *
   * @param {*} [record={}]
   * @memberof Update
   */
  @Bind()
  fetchQuotationDetail(_, record = {}) {
    this.showQuotationDetail(record);
  }

  /**
   * 关闭报价模板
   *
   * @memberof Update
   */
  @Bind()
  closeQuotationData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        QuotationDetailDataSource: {},
        itemQuotationDetail: [],
        itemQuotationPagination: {},
      },
    });
  }

  /**
   * 渲染标段tabs
   */
  @Bind()
  renderTabs() {
    const {
      supplierBid: { quotationLines = [] },
    } = this.props;
    return (
      <div>
        <Tabs onChange={this.changeTabs} animated={false}>
          {/* 循环标段数据,渲染tabs标段 */}
          {map(quotationLines, (item) => {
            return (
              <Tabs.TabPane tab={this.tooTipTabs(item)} key={[item.quotationLineId]}>
                {/* 渲染标段头只读信息 */}
                {this.renderSectionHeader(item)}
                {/* 渲染标段物料行只读信息 */}
                <div>{this.renderSectionItemLine(item.children)}</div>
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }

  /**
   * 渲染不区分标段tabs
   */
  @Bind()
  renderNormalTabs() {
    return <div>{this.categoryTable()}</div>;
  }

  /**
   * 渲染标段只读头信息
   * sectionHeader
   */
  @Bind()
  renderSectionHeader(item) {
    const { collapseKeys } = this.state;
    const { organizationId } = this.props;
    return (
      <Collapse
        className="form-collapse"
        defaultActiveKey={['quotationInfo']}
        onChange={this.onCollapseChange}
      >
        <Panel
          showArrow={false}
          header={
            <Fragment>
              <h3>{intl.get(`${promptCode}.view.message.panel.sectionInfoView`).d('标段信息')}</h3>
              <a>
                {collapseKeys.includes('sectionInfo')
                  ? intl.get(`hzero.common.button.up`).d('收起')
                  : intl.get(`hzero.common.button.expand`).d('展开')}
              </a>
              <Icon type={collapseKeys.includes('sectionInfo') ? 'up' : 'down'} />
            </Fragment>
          }
          key="sectionInfo"
        >
          <Form>
            <Row gutter={48} className="read-row" {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.sectionNum`).d('标段/包编号')}
                  value={item.sectionNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.sectionName`).d('标段/包名称')}
                  value={item.sectionName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.demandDate`).d('需求日期')}
                  value={item.demandDate && moment(item.demandDate).format(DEFAULT_DATE_FORMAT)}
                />
              </Col>
            </Row>
            <Row gutter={48} className="read-row" {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBid.sectionAmount`)
                    .d('标段/包总金额')}
                  value={item.sectionAmount}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBid.supplierLineAttachment`)
                    .d('标段/包投标文件')}
                  value={
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-quotationline"
                      attachmentUUID={item.currentAttachmentUuid}
                      tenantId={organizationId}
                      viewOnly
                      icon="download"
                    />
                  }
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.abandonedFlag`).d('是否放弃')}
                  value={yesOrNoRender(item.abandonedFlag)}
                />
              </Col>
            </Row>
          </Form>
        </Panel>
      </Collapse>
    );
  }

  /**
   * 渲染标段只读行信息
   * sectionItemLine
   */
  @Bind()
  renderSectionItemLine(children = []) {
    const { customizeTable = () => {} } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBid.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.sbidStatus`).d('投标状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationStartValidTime`)
          .d('报价有效日期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationEndValidTime`)
          .d('报价有效日期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
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
        title: intl.get(`${promptCode}.model.supplierBid.itemCategory`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 200,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (_, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowSupplierViewFlag />
        ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.currentQuotationQuantity`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.unitPrice`).d('单价'),
        dataIndex: 'currentQuotationPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'currentDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.proPayDate`).d('承诺交付日期'),
        dataIndex: 'currentPromisedDate',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: <span>{intl.get(`${promptCode}.model.supplierBid.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.lineAttachmentUuid`).d('行附件')}</span>,
        dataIndex: 'lineAttachmentUuid',
        width: 100,
        render: (val) => {
          return (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-bid-bidItem"
              attachmentUUID={val}
            />
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        width: 120,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.netAmount`).d('不含税总金额'),
        dataIndex: 'netAmount',
        width: 180,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.totalAmount`).d('总金额'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.currentQuotationRemark`).d('备注'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.TENDER_HALL_VIEW.ITEM_LINE', // 单元编码，必传
          },
          <Table
            bordered
            rowKey="bidLineItemId"
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={children}
            pagination={false}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * 浮动文字tabs
   */
  @Bind()
  tooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {intl.get(`${promptCode}.view.message.section`).d('标段')}
        {item.bidLineItemNum}
      </Tooltip>
    );
  };

  /**
   * 只读物料行不分标段表格渲染
   * @returns {*}
   */
  @Bind()
  categoryTable() {
    const {
      supplierBid: { quotationLines = [], bidQuoPagination = {}, quotationHeader = {} },
      customizeTable = () => {},
      dispatch,
      queryQuotationLinesLoading,
    } = this.props;
    function onSearch(page) {
      dispatch({
        type: 'supplierBid/queryQuotationLines',
        payload: {
          quotationHeaderId: quotationHeader.quotationHeaderId,
          page,
        },
      });
    }

    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBid.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.sbidStatus`).d('投标状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationStartValidTime`)
          .d('报价有效日期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.quotationValidTime`).d('报价有效日期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
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
        title: intl.get(`${promptCode}.model.supplierBid.itemCategory`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 200,
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
        title: intl.get(`${promptCode}.model.supplierBid.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.currentQuotationQuantity`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.unitPrice`).d('单价'),
        dataIndex: 'currentQuotationPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'currentDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get('ssrc.common.model.quotationDetails').d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (val, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowSupplierViewFlag />
        ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.proPayDate`).d('承诺交付日期'),
        dataIndex: 'currentPromisedDate',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: <span>{intl.get(`${promptCode}.model.supplierBid.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.lineAttachmentUuid`).d('行附件')}</span>,
        dataIndex: 'lineAttachmentUuid',
        width: 100,
        render: (val) => {
          return (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-bid-bidItem"
              attachmentUUID={val}
            />
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        width: 120,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.netAmount`).d('不含税总金额'),
        dataIndex: 'netAmount',
        width: 150,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.totalAmount`).d('总金额'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.TENDER_HALL_VIEW.ITEM_LINE_NONE', // 单元编码，必传
          },
          <Table
            bordered
            rowKey="bidLineItemId"
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={quotationLines}
            loading={queryQuotationLinesLoading}
            pagination={bidQuoPagination}
            onChange={(page) => {
              onSearch(page);
            }}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * 基本信息
   * @param {*} quotationHeader
   */
  renderHeaderForm(quotationHeader) {
    const {
      organizationId,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.TENDER_HALL_VIEW.HEADER',
        form: this.props.form,
        dataSource: quotationHeader,
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${promptCode}.model.supplierBid.bidNum.`).d('招标编号')}
            >
              {getFieldDecorator('bidNum', {
                initialValue: quotationHeader.bidNum,
              })(<span>{quotationHeader.bidNum}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${promptCode}.model.supplierBid.bidTitle`).d('招标事项')}
            >
              {getFieldDecorator('bidTitle', {
                initialValue: quotationHeader.bidTitle,
              })(<span>{quotationHeader.bidTitle}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${promptCode}.model.supplierBid.companyName`).d('招标公司')}
            >
              {getFieldDecorator('companyName', {
                initialValue: quotationHeader.companyName,
              })(<span>{quotationHeader.companyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${promptCode}.model.supplierBid.bidType`).d('招标类别')}
            >
              {getFieldDecorator('bidTypeMeaning', {
                initialValue: quotationHeader.bidTypeMeaning,
              })(<span>{quotationHeader.bidTypeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${promptCode}.model.supplierBid.quotationEndTime`).d('投标截止时间')}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: quotationHeader.quotationEndDate,
              })(<span>{quotationHeader.quotationEndDate}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${promptCode}.model.supplierBid.currencyCode`).d('币种')}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: quotationHeader.currencyCode,
              })(<span>{quotationHeader.currencyCode}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${promptCode}.model.supplierBid.evalMethod`).d('评标办法')}
            >
              {getFieldDecorator('evalMethodName', {
                initialValue: quotationHeader.evalMethodName,
              })(<span>{quotationHeader.evalMethodName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${promptCode}.model.supplierBid.paymentTypeId`).d('付款方式')}
            >
              {getFieldDecorator('paymentTypeName', {
                initialValue: quotationHeader.paymentTypeName,
              })(<span>{quotationHeader.paymentTypeName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`${promptCode}.model.supplierBid.BusinessAttachment`)
                .d('投标商务文件')}
            >
              {getFieldDecorator('currentBusinessAttachmentUuid', {
                initialValue: quotationHeader.currentBusinessAttachmentUuid,
              })(
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={quotationHeader.currentBusinessAttachmentUuid}
                  tenantId={organizationId}
                  viewOnly
                  icon="download"
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`${promptCode}.model.supplierBid.currentTechAttachmentUuid`)
                .d('投标技术文件')}
            >
              {getFieldDecorator('currentTechAttachmentUuid', {
                initialValue: quotationHeader.currentTechAttachmentUuid,
              })(
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={quotationHeader.currentTechAttachmentUuid}
                  tenantId={organizationId}
                  viewOnly
                  icon="download"
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${promptCode}.model.supplierBid.paymentTerm`).d('付款条款')}
            >
              {getFieldDecorator('paymentTerm', {
                initialValue: quotationHeader.paymentTerm,
              })(<span>{quotationHeader.paymentTerm}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          {quotationHeader.explorationFlag ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`ssrc.common.supplierExplorationStatus`).d('是否踏勘')}
              >
                {getFieldDecorator('supplierExplorationStatusMeaning', {
                  initialValue: quotationHeader.supplierExplorationStatusMeaning,
                })(<span>{quotationHeader.supplierExplorationStatusMeaning}</span>)}
              </Form.Item>
            </Col>
          ) : (
            ''
          )}
          {quotationHeader.supplierExplorationStatus === 'EXPLORED' ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`ssrc.common.supplierExplorationDate`).d('踏勘日期')}
              >
                {getFieldDecorator('supplierExplorationDate', {
                  initialValue: quotationHeader.supplierExplorationDate,
                })(<span>{quotationHeader.supplierExplorationDate}</span>)}
              </Form.Item>
            </Col>
          ) : (
            ''
          )}
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('remark', {
                initialValue: quotationHeader.quotationRemark,
              })(<span>{quotationHeader.quotationRemark}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      supplierBid: {
        quotationHeader = {},
        supplierBidQueryHeader = {},
        supplierBidTenderHeader = {},
      },
      headerLoding,
      quotationBackLoading,
    } = this.props;
    const { collapseKeys = [], routerParams, sectionFlag } = this.state;
    let validHeader = {};
    if (routerParams.typeName === 'bidQueryClarification') {
      validHeader = supplierBidQueryHeader;
    } else if (routerParams.typeName === 'bidTenderlarification') {
      validHeader = supplierBidTenderHeader;
    } else {
      validHeader = quotationHeader;
    }

    return (
      <React.Fragment>
        <Header
          backPath={this.renderParent()}
          title={intl.get(`${promptCode}.view.message.title.viewBidDetail`).d('查看投标')}
        >
          <Button type="primary" loading={quotationBackLoading} onClick={() => this.backBid()}>
            {intl.get(`${promptCode}.view.message.button.backBIdTender`).d('收回投标')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={headerLoding} wrapperClassName="ued-detail-wrapper">
            <Collapse
              className="form-collapse"
              onChange={this.onCollapseChange}
              defaultActiveKey={['baseInfos']}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.panel.basicInfoHeader`).d('基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="baseInfos"
              >
                {this.renderHeaderForm(validHeader)}
              </Panel>
            </Collapse>
            {sectionFlag ? this.renderTabs() : this.renderNormalTabs()}
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
