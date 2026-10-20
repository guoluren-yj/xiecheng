/**
 * index -投标明细
 * @date: 2018-12-29
 * @author: LC<chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import {
  Button,
  Col,
  Form,
  Icon,
  Input,
  Modal,
  Popover,
  Row,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isEmpty, isNumber, map, sum } from 'lodash';
import moment from 'moment';
import { Content, Header } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import querystring from 'querystring';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT, EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import { numberSeparatorRender, phoneRender } from '@/utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { PRIVATE_BUCKET } from '_utils/config';
import classnames from 'classnames';
import MatterDetail from '@/routes/components/MatterDetail/MatterDetail';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import common from '@/routes/sbid/common.less';
import Iconfont from '../../components/Icons';
import TenderNoticeForm from '../../components/Detail/TenderNoticeForm';

const { TextArea } = Input;
const FormItem = Form.Item;

@withCustomize({
  unitCode: [
    'SSRC.TENDER_HALL_DETAIL.ITEM_LINE',
    'SSRC.TENDER_HALL_DETAIL.ITEM_LINE_NONE',
    'SSRC.TENDER_HALL_DETAIL.HEADER',
    'SSRC.TENDER_HALL_DETAIL.OTHER.INFO',
    'SSRC.TENDER_HALL_DETAIL.PREQUAL_INFO',
  ],
})
@connect(({ inquiryHall, supplierBid, loading }) => ({
  inquiryHall,
  supplierBid,
  organizationId: getCurrentOrganizationId(),
  headerLoding: loading.effects['supplierBid/fetchHeadDataList'],
  ParticipateLoading: loading.effects['supplierBid/fatchParticipate'],
  abandonLoading: loading.effects['supplierBid/fatchAbandon'],
  fetchQuotationDetailLoading: loading.effects['supplierBid/fetchQuotationDetail'],
}))
@formatterCollections({
  code: ['ssrc.common', 'ssrc.bidHall', 'ssrc.supplierBid', 'ssrc.inquiryHall'],
})
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  form;

  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      routerParams,
      giveUpVisible: false, // 放弃理由弹框
      fileLength: 0, // 资格预审文件个数，用于付费情况下只读展示
      sectionFlag: false, // 分标段标志
    };
  }

  /**
   * 树形展开收起method
   * @description 扩展 此方法必须,不然会报错。代码内容暂时没有使用到，可用此方法扩展树形
   * @param status
   * @param row
   */
  @Bind()
  onExpand() {}

  /**
   *  分割end---------------------------------------------------------分割end
   *  start---------------------放弃-----------------------------start
   */

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
    const { dispatch } = this.props;
    const { routerParams } = this.state;
    if (routerParams.typeName === 'bidQueryClarification') {
      dispatch({
        type: 'supplierBid/updateState',
        payload: {
          supplierBidQueryHeader: {},
          supplierBidQueryItemsList: [],
        },
      });
    } else if (routerParams.typeName === 'bidTenderlarification') {
      dispatch({
        type: 'supplierBid/updateState',
        payload: {
          supplierBidTenderHeader: {},
          supplierBidTenderItemsList: [],
        },
      });
    } else {
      dispatch({
        type: 'supplierBid/updateState',
        payload: {
          supplierHolderList: {},
          supplierItemsList: [],
          itemQuotationDetail: [],
          QuotationDetailDataSource: {},
          itemQuotationPagination: {},
        },
      });
    }

    dispatch({
      type: 'supplierBid/updateState',
      payload: {
        itemQuotationDetail: [],
        QuotationDetailDataSource: {},
        itemQuotationPagination: {},
      },
    });
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
   * 渲染父级标题
   */
  renderTitle(type) {
    let title = '';
    // 应标
    if (type === 'operation') {
      title = intl.get(`ssrc.supplierBid.view.message.title.shouldBid`).d('应标');
    }
    // 投标书明细
    if (type === 'view') {
      title = intl.get(`ssrc.supplierBid.view.message.title.bidDetail`).d('查看招标书');
    }
    return title;
  }

  /**
   * 初始化查询供应商接口信息
   */
  @Bind()
  querySupplier() {
    const {
      dispatch,
      organizationId,
      location,
      match: { params },
    } = this.props;

    const { bidId, companyId: supplierCompanyId } = params;
    const { routerParams } = this.state;
    const { subjectMatterRule = '' } = routerParams;
    const { quotationHeaderId } = querystring.parse(location.search.substr(1));

    dispatch({
      type: 'supplierBid/fetchHeadDataList',
      payload: {
        organizationId,
        bidHeaderId: bidId,
        quotationHeaderId,
        supplierCompanyId,
        customizeUnitCode:
          'SSRC.TENDER_HALL_DETAIL.HEADER,SSRC.TENDER_HALL_DETAIL.OTHER.INFO,SSRC.TENDER_HALL_DETAIL.PREQUAL_INFO',
      },
    });
    dispatch({
      type: 'supplierBid/fetchItemsDataList',
      payload: {
        organizationId,
        supplierCompanyId,
        bidHeaderId: bidId,
        routerParams,
        customizeUnitCode:
          subjectMatterRule === 'PACK'
            ? 'SSRC.TENDER_HALL_DETAIL.ITEM_LINE'
            : 'SSRC.TENDER_HALL_DETAIL.ITEM_LINE_NONE',
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
   * 参与-返回招投标列表
   */
  @Bind()
  onParticipate() {
    const {
      dispatch,
      organizationId,
      supplierBid: { supplierHolderList },
      match: { params },
    } = this.props;
    const { companyId } = params;
    const bidHeader = {
      ...supplierHolderList,
      supplierCompanyId: companyId,
    };
    dispatch({
      type: 'supplierBid/fatchParticipate',
      payload: {
        organizationId,
        bidHeader,
        customizeUnitCode:
          'SSRC.TENDER_HALL_DETAIL.HEADER,SSRC.TENDER_HALL_DETAIL.OTHER.INFO,SSRC.TENDER_HALL_DETAIL.PREQUAL_INFO,SSRC.TENDER_HALL_DETAIL.ITEM_LINE,SSRC.TENDER_HALL_DETAIL.ITEM_LINE',
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
  }

  /**
   * 确认放弃？
   */
  @Bind()
  onConfirmWaiver() {
    const { form } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        this.onConfirm();
      }
    });
  }

  /**
   * 确认
   */
  @Bind()
  onConfirm() {
    const filter = this.props.form.getFieldsValue();
    const { appendRemark } = filter;
    const {
      dispatch,
      organizationId,
      supplierBid: { supplierHolderList },
      match: { params },
    } = this.props;
    const { companyId } = params;
    const bidHeader = {
      ...supplierHolderList,
      supplierCompanyId: companyId,
      appendRemark,
    };
    dispatch({
      type: 'supplierBid/fatchAbandon',
      payload: {
        organizationId,
        bidHeader,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/ssrc/supplier-bid-hall/list`,
          })
        );
      } else {
        this.setState({
          giveUpVisible: false,
        });
      }
    });
  }

  /**
   * 关闭放弃弹框
   */
  @Bind()
  handleConfirmWaiver() {
    this.setState({
      giveUpVisible: false,
    });
  }

  /**
   * 放弃
   */
  @Bind()
  onAbandon() {
    this.setState({
      giveUpVisible: true,
    });
  }

  /**
   *  renderBidLineItemNum -  渲染物料行号
   *  @description 物料行号区分标段
   */
  @Bind()
  renderBidLineItemNum(val, record) {
    // 判断是否存在父标段行号
    if (record.parentSectionNum) {
      return `${record.parentSectionNum}.${val}`;
    } else {
      return val;
    }
  }

  /**
   *  renderTaxIncludedFlag -  渲染物料是否含税
   *  @description 物料是否含税区分标段
   */
  @Bind()
  renderTaxIncludedFlag(val, record) {
    // 判断是否存在父标段行号
    if (record.parentSectionNum) {
      return yesOrNoRender(val);
    } else {
      return null;
    }
  }

  /**
   * @param columns
   * @param fixWidth
   * @returns {*}
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
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
        title: intl.get(`ssrc.supplierBid.model.supplierBid.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.itemName`).d('物品描述'),
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
        title: intl.get(`ssrc.supplierBid.model.supplierBid.itemCategory`).d('物品分类'),
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
        title: intl.get(`ssrc.supplierBid.model.supplierBid.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      // {
      //   title: intl.get(`ssrc.supplierBid.model.supplierBid.costPrice`).d('标底单价'),
      //   dataIndex: 'costPrice',
      //   width: 100,
      //   align: 'right',
      //   render: numberSeparatorRender,
      // },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: <span>{intl.get(`ssrc.supplierBid.model.supplierBid.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.TENDER_HALL_DETAIL.ITEM_LINE', // 单元编码，必传
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
        {item.sectionName}
      </Tooltip>
    );
  };

  /**
   * 渲染标段tabs
   */
  @Bind()
  renderTabs() {
    const {
      supplierBid: { supplierItemsList = [] },
    } = this.props;
    return (
      <div>
        <Tabs onChange={this.changeTabs} animated={false}>
          {/* 循环标段数据,渲染tabs标段 */}
          {map(supplierItemsList, (item) => {
            return (
              <Tabs.TabPane tab={this.tooTipTabs(item)} key={[item.bidLineItemId]}>
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
   * 重构物品行报价明细
   *
   * @param {*} [para = {}, record={}]
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
      type: 'supplierQuotation/updateState',
      payload: {
        QuotationDetailDataSource: {},
        itemQuotationDetail: [],
        itemQuotationPagination: {},
      },
    });
  }

  /**
   * 渲染不区分标段tabs
   */
  @Bind()
  renderNormalTabs() {
    return <div>{this.categoryTable()}</div>;
  }

  /**
   * 供应商物品明细列表
   */
  categoryTable() {
    const {
      supplierBid: { supplierItemsList = [] },
      customizeTable = () => {},
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.itemName`).d('物品描述'),
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
        title: intl.get(`ssrc.supplierBid.model.supplierBid.itemCategory`).d('物品分类'),
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
        title: intl.get('ssrc.common.model.quotationDetails').d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (val, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowSupplierViewFlag />
        ),
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      // {
      //   title: intl.get(`ssrc.supplierBid.model.supplierBid.costPrice`).d('标底单价'),
      //   dataIndex: 'costPrice',
      //   width: 100,
      //   align: 'right',
      //   render: numberSeparatorRender,
      // },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: <span>{intl.get(`ssrc.supplierBid.model.supplierBid.taxRate`).d('税率')}%</span>,
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
    ].filter(Boolean);
    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.TENDER_HALL_DETAIL.ITEM_LINE_NONE', // 单元编码，必传
          },
          <EditTable
            bordered
            scroll={{ x: scrollWidth }}
            rowKey="bidLineItemId"
            columns={columns}
            dataSource={supplierItemsList}
            pagination={false}
            onExpand={this.onExpand}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * 基本信息
   * @param {*} supplierHolderList
   */
  renderHeaderForm(supplierHolderList) {
    const {
      organizationId,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.TENDER_HALL_DETAIL.HEADER',
        form: this.props.form,
        dataSource: supplierHolderList,
      },
      <Form>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.bidNum`).d('招标编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidNum', {
                initialValue: supplierHolderList.bidNum,
              })(<span>{supplierHolderList.bidNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.bidTitle`).d('招标事项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidTitle', {
                initialValue: supplierHolderList.bidTitle,
              })(<span>{supplierHolderList.bidTitle}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.bidType`).d('招标类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidType', {
                initialValue: supplierHolderList.bidType,
              })(<span>{supplierHolderList.bidTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`ssrc.common.company`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: supplierHolderList.companyName,
              })(<span>{supplierHolderList.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.purOrganizationName`)
                .d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationName', {
                initialValue: supplierHolderList.purOrganizationName,
              })(<span>{supplierHolderList.purOrganizationName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.evalMethod`).d('评标办法')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('evalMethodName', {
                initialValue: supplierHolderList.evalMethodName,
              })(<span>{supplierHolderList.evalMethodName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.bidBond`).d('保证金(元)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidBond', {
                initialValue: supplierHolderList.bidBond,
              })(
                <span>
                  {numberSeparatorRender(supplierHolderList.bidBond) ||
                    intl.get(`ssrc.supplierBid.model.supplierBid.free`)}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.bidOpenDate`).d('开标时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenDate', {
                initialValue: supplierHolderList.bidOpenDate,
              })(<span>{supplierHolderList.bidOpenDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.quotationStartDate`)
                .d('投标开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: supplierHolderList.quotationStartDate,
              })(<span>{supplierHolderList.quotationStartDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.quotationEndDate`)
                .d('投标截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: supplierHolderList.quotationEndDate,
              })(<span>{supplierHolderList.quotationEndDate}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.clarifyEndTime`).d('澄清截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('clarifyEndTime', {
                initialValue: supplierHolderList.clarifyEndTime,
              })(<span>{supplierHolderList.clarifyEndTime}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          {supplierHolderList.totalBudgetFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.totalBudget`).d('预算金额')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('totalBudget', {
                  initialValue: supplierHolderList.totalBudget,
                })(<span>{numberSeparatorRender(supplierHolderList.totalBudget)}</span>)}
              </FormItem>
            </Col>
          )}
          {supplierHolderList.techAttachmentFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.bidTechFile`).d('招标技术文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('techAttachmentUuid', {
                  initialValue: supplierHolderList.techAttachmentUuid,
                })(
                  supplierHolderList.tenderFeeFlag ? (
                    <span>
                      {intl
                        .get('ssrc.supplierBid.view.message.beforePayTenderFee')
                        .d('缴纳招标文件费后可下载附件')}
                    </span>
                  ) : (
                    <Upload
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-bid-header"
                      attachmentUUID={
                        isEmpty(supplierHolderList.techAttachmentUuid)
                          ? undefined
                          : supplierHolderList.techAttachmentUuid
                      }
                      tenantId={organizationId}
                      icon="download"
                      viewOnly
                      filePreview
                    />
                  )
                )}
              </FormItem>
            </Col>
          )}
          {supplierHolderList.businessAttachmentFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.bidusinessFile`).d('招标商务文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('businessAttachmentUuid', {
                  initialValue: supplierHolderList.businessAttachmentUuid,
                })(
                  supplierHolderList.tenderFeeFlag ? (
                    <span>
                      {intl
                        .get('ssrc.supplierBid.view.message.beforePayTenderFee')
                        .d('缴纳招标文件费后可下载附件')}
                    </span>
                  ) : (
                    <Upload
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-bid-header"
                      attachmentUUID={
                        isEmpty(supplierHolderList.businessAttachmentUuid)
                          ? undefined
                          : supplierHolderList.businessAttachmentUuid
                      }
                      tenantId={organizationId}
                      icon="download"
                      viewOnly
                      filePreview
                    />
                  )
                )}
              </FormItem>
            </Col>
          )}
        </Row>
      </Form>
    );
  }

  /**
   * 资格预审
   */
  renderPreQualificationForm(supplierHolderList) {
    const {
      organizationId,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    const { fileLength } = this.state;
    return customizeForm(
      {
        code: 'SSRC.TENDER_HALL_DETAIL.PREQUAL_INFO',
        form: this.props.form,
        dataSource: supplierHolderList,
      },
      <Form>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.prequalsEndDate`)
                .d('预审截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalEndDate', {
                initialValue: supplierHolderList.prequalEndDate,
              })(<span>{supplierHolderList.prequalEndDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.reviewway`).d('审查方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('reviewway', {
                initialValue: supplierHolderList.reviewMethodMeaning,
              })(<span>{supplierHolderList.reviewMethodMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.qualifiedLimit`).d('合格上限')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('qualifiedLimit', {
                initialValue: supplierHolderList.qualifiedLimit,
              })(<span>{supplierHolderList.qualifiedLimit}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.prequalFileExpense`)
                .d('预审文件费')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalFileExpense', {
                initialValue: supplierHolderList.prequalFileExpense,
              })(
                <span>
                  {supplierHolderList.fileFreeFlag === 1
                    ? 0
                    : numberSeparatorRender(supplierHolderList.prequalFileExpense)}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.enableScoreFile`)
                .d('资格预审文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalAttachmentUuid', {
                initialValue: supplierHolderList.prequalAttachmentUuid,
              })(
                supplierHolderList.fileFreeFlag === 0 ? (
                  <React.Fragment>
                    <a onClick={this.openUploadModal} style={{ pointerEvents: 'none' }} disabled>
                      <Icon type="download" />
                      {intl.get('hzero.common.upload.view').d('查看附件')}
                    </a>
                    {fileLength > 0 ? (
                      <Tag
                        color="#108ee9"
                        style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
                      >
                        {fileLength}
                      </Tag>
                    ) : null}
                  </React.Fragment>
                ) : (
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-prequal"
                    attachmentUUID={supplierHolderList.prequalAttachmentUuid}
                    tenantId={organizationId}
                    viewOnly
                    icon="download"
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.prequalsRemark`)
                .d('资格预审备注')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalsRemark', {
                initialValue: supplierHolderList.prequalRemark,
              })(<span>{supplierHolderList.prequalRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 其他信息
   * @param {*} supplierHolderList
   */
  renderOtherInfosForm(supplierHolderList) {
    const {
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.TENDER_HALL_DETAIL.OTHER.INFO',
        form: this.props.form,
        dataSource: supplierHolderList,
      },
      <Form>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.projectNum`).d('项目编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectNum', {
                initialValue: supplierHolderList.projectNum,
              })(<span>{supplierHolderList.projectNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.projectName`).d('项目名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectName', {
                initialValue: supplierHolderList.projectName,
              })(<span>{supplierHolderList.projectName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.projectAddress`).d('项目地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectAddress', {
                initialValue: supplierHolderList.projectAddress,
              })(<span>{supplierHolderList.projectAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.sourceStage`).d('招标阶段')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceStage', {
                initialValue: supplierHolderList.sourceStage,
              })(<span>{supplierHolderList.sourceStageMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.currencyCode`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: supplierHolderList.currencyCode,
              })(<span>{supplierHolderList.currencyCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.exchangeRate`).d('汇率')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('exchangeRate', {
                initialValue: supplierHolderList.exchangeRate,
              })(<span>{supplierHolderList.exchangeRate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.roundNumber`).d('轮次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('roundNumber', {
                initialValue: supplierHolderList.roundNumber,
              })(<span>{supplierHolderList.roundNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.versionNumber`).d('版本')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('versionNumber', {
                initialValue: supplierHolderList.versionNumber,
              })(<span>{supplierHolderList.versionNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.maxBidNumber`).d('最大中标数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('maxBidNumber', {
                initialValue: supplierHolderList.maxBidNumber,
              })(<span>{supplierHolderList.maxBidNumber}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.paymentTypeName`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeName', {
                initialValue: supplierHolderList.paymentTypeName,
              })(<span>{supplierHolderList.paymentTypeName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.paymentTerm`).d('付款条款')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTerm', {
                initialValue: supplierHolderList.paymentTerm,
              })(<span>{supplierHolderList.paymentTerm}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.bidOpenLocation`).d('开标地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenLocation', {
                initialValue: supplierHolderList.bidOpenLocation,
              })(<span>{supplierHolderList.bidOpenLocation}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.purchasingContact`)
                .d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purName', {
                initialValue: supplierHolderList.purName,
              })(<span>{supplierHolderList.purName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.contactPhone`).d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purPhone', {
                initialValue: supplierHolderList.purPhone,
              })(
                <span>
                  {phoneRender(
                    supplierHolderList.internationalTelCodeMeaning,
                    supplierHolderList.purPhone
                  )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierBid.model.supplierBid.contactMail`).d('联系人邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purEmail', {
                initialValue: supplierHolderList.purEmail,
              })(<span>{supplierHolderList.purEmail}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierBid.model.supplierBid.explorationFlag`)
                .d('是否需要现场踏勘')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('explorationFlag', {
                initialValue: supplierHolderList.explorationFlag,
              })(<span>{yesOrNoRender(supplierHolderList.explorationFlag)}</span>)}
            </FormItem>
          </Col>
          {supplierHolderList.explorationFlag ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.common.explorationDate`).d('踏勘时间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('explorationDate', {
                  initialValue: supplierHolderList.explorationDate,
                })(<span>{supplierHolderList.explorationDate}</span>)}
              </FormItem>
            </Col>
          ) : (
            ''
          )}
        </Row>
      </Form>
    );
  }

  render() {
    const {
      supplierBid: { supplierHolderList = {} },
      form: { getFieldDecorator },
      match: { params },
      ParticipateLoading,
      abandonLoading,
      headerLoding,
    } = this.props;
    const { sectionFlag } = this.state;
    const { type } = params;
    const { giveUpVisible } = this.state;
    const previewModalStyle = {
      maxWidth: '50vw',
      maxHeight: '50vh',
    };

    const tenderNoticeForm = {
      header: {
        ...supplierHolderList,
      },
      organizationId: supplierHolderList.tenantId,
    };

    const MatterDetailProps = {
      matterDetail: supplierHolderList.matterDetail || '',
    };

    return (
      <React.Fragment>
        <Header backPath={this.renderParent()} title={this.renderTitle(type)}>
          {type === 'operation' && (
            <React.Fragment>
              <Button
                type="primary"
                loading={ParticipateLoading}
                onClick={() => this.onParticipate()}
              >
                <Iconfont type="main-invitation-cooperation" style={{ marginRight: '8px' }} />
                {intl.get(`ssrc.supplierBid.view.message.button.participate`).d('参与')}
              </Button>
              <Button type="default" onClick={() => this.onAbandon()}>
                <Iconfont type="main-delete" style={{ marginRight: '8px' }} />
                {intl.get(`ssrc.supplierBid.view.message.button.abandon`).d('放弃')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Spin spinning={headerLoding}>
            <Tabs defaultActiveKey="baseInfos" animated={false}>
              <Tabs.TabPane
                tab={intl.get(`ssrc.supplierBid.view.message.tab.baseInfos`).d('基本信息')}
                key="baseInfos"
              >
                {this.renderHeaderForm(supplierHolderList)}
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`ssrc.supplierBid.view.message.tab.otherInfos`).d('其他信息')}
                key="otherInfos"
                forceRender
              >
                {this.renderOtherInfosForm(supplierHolderList)}
              </Tabs.TabPane>
              {supplierHolderList.matterRequireFlag === 1 && type !== 'operation' && (
                <Tabs.TabPane
                  tab={intl.get(`ssrc.inquiryHall.view.message.tab.matterDetail`).d('寻源事项说明')}
                  key="matterDetail"
                  forceRender
                >
                  <MatterDetail {...MatterDetailProps} />
                </Tabs.TabPane>
              )}
              {supplierHolderList.preQualificationFlag && (
                <Tabs.TabPane
                  tab={intl.get(`ssrc.supplierBid.view.message.tab.preQualification`).d('资格预审')}
                  key="preQualification"
                  forceRender
                >
                  {this.renderPreQualificationForm(supplierHolderList)}
                </Tabs.TabPane>
              )}
              {(supplierHolderList.sourceMethod && supplierHolderList.sourceMethod === 'OPEN') ||
              supplierHolderList.sourceMethod === 'ALL_OPEN' ? (
                <Tabs.TabPane
                  tab={intl.get('ssrc.supplierBid.view.tab.tenderNotice').d('招标公告')}
                  key="tenderNotice"
                  forceRender
                >
                  <TenderNoticeForm {...tenderNoticeForm} />
                </Tabs.TabPane>
              ) : (
                ''
              )}
            </Tabs>
            <div style={{ marginTop: '16px' }}>
              {sectionFlag ? this.renderTabs() : this.renderNormalTabs()}
            </div>
          </Spin>
        </Content>
        <Modal
          visible={giveUpVisible}
          title={intl.get(`ssrc.supplierBid.view.message.title.waiverOfBid`).d('放弃投标')}
          footer={null}
          onCancel={this.handleConfirmWaiver}
          style={previewModalStyle}
        >
          <Fragment>
            <Form>
              <FormItem
                label={intl.get(`ssrc.supplierBid.model.supplierBid.giveUpReason`).d('放弃理由')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                {getFieldDecorator('appendRemark', {
                  initialValue: supplierHolderList.appendRemark,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.supplierBid.model.supplierBid.giveUpReason`)
                          .d('放弃理由'),
                      }),
                    },
                  ],
                })(<TextArea style={{ height: 65 }} />)}
              </FormItem>
            </Form>
            <Button
              icon="save"
              type="primary"
              style={{ marginLeft: 394, marginTop: 0 }}
              onClick={this.onConfirmWaiver}
              loading={abandonLoading}
            >
              {intl.get(`ssrc.supplierBid.view.message.button.confirm`).d('确认')}
            </Button>
          </Fragment>
        </Modal>
      </React.Fragment>
    );
  }
}
