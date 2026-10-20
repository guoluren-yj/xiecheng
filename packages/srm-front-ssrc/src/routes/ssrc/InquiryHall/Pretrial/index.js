/**
 * CheckPrice - 寻源服务/核价页面
 * @date: 2019-1-9
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
// import queryString from 'querystring';
import { routerRedux } from 'dva/router';
import { Collapse, Form, Col, Row, Input, Tabs, Tag, Modal, Icon, Spin } from 'hzero-ui';
import { Modal as c7nModal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { getJumpRoutePrefixUrl, isText } from '@/utils/utils';
import { Header, Content } from 'components/Page';
import { yesOrNoRender, numberRender, dateTimeRender } from 'utils/renderer';
import Lov from 'components/Lov';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
// import Icons from 'components/Icons';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import classnames from 'classnames';
import QuotationDirectLable from '@/utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import DynamicButtons from '_components/DynamicButtons';
import remoteHOC from 'hzero-front/lib/utils/remote';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { numberSeparatorRender } from '@/utils/renderer';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { validBeforeUploadFiles } from '@/routes/components/UploadOperation';
import Iconfont from '@/routes/ssrc/components/Icons'; // 下载至本地的icon
import { HOCPriceComparison as PriceComparison } from '@/routes/ssrc/components/PriceComparison';
import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';
import {
  INQUIRY,
  BID,
  getSourceCategoryName,
  getCheckPriceName,
  getQuotationName,
} from '@/utils/globalVariable';
import { queryEnableDoubleUnit, queryH0OrC7N } from '@/services/commonService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';

import ItemLineList from './ItemLineList';
import SupplierLineList from './SupplierLineList';
import QuoteLineTable from './QuoteLineTable';
import styles from './index.less';
import Attachment from '../../components/Attachment';
import OperationRecord from '../../components/OperationRecord';

const { TextArea } = Input;
const { Panel } = Collapse;
const FormItem = Form.Item;
const { TabPane } = Tabs;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

class CheckPrice extends Component {
  state = {
    activeKey: 'itemLine', // 当前激活tab面板的key
    operationRecordModalVisible: false, // 操作记录模态框
    viewLadderLevelVisible: false, // 阶梯报价模态框
    LadderLevelHeaderData: {}, // 阶梯报价头部数据
    viewPriceChartsVisible: false, // 物品明报价细折线图
    priceDataSource: [], // 物品明报价细折线图数据源
    supplierNameList: [], // 物品明报价细折线图有报价的供应商
    chartsLoading: {},
    id: undefined,
    bucketDirectory: 'ssrc-rfx-rfxheader',
    viewOnly: true, // 是否只读标识位
    collapseKeys: [], // 打开的折叠面板key
    pretrialUuid: null, // 预审头附件
    doubleUnitFlag: false,
    newQuotationFlag: 0, // 启用新报价标识
    headerGroupButtonMaxNum: -1, // 头按钮默认max_num数目
  };

  sourceKey = this.props.sourceKey || INQUIRY;

  activeTabKey = getJumpRoutePrefixUrl(this.props.location.pathname);

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.fetchInquiryHallPretrial();
  }

  /**
   * 组件销毁，清空状态树中得值
   */
  componentWillUnmount() {
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        header: {},
        itemLine: [],
        supplierLine: [],
        quoteLine: [],
        itemQuoteLine: [],
        itemQuoteLinePagination: {},
        supplierQuoteLine: [],
        supplierQuoteLinePagination: {},
        itemLineChange: false,
        supplierLineChange: false,
        allLineChange: false,
      },
    });
  }

  /**
   * 打开操作记录模态框
   */
  @Bind()
  playView() {
    this.setState({ operationRecordModalVisible: true });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        operationPagination: {},
        operationData: [],
      },
    });
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
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { itemCode, itemName, companyName, quotationLineId, quotationLineStatus } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        quotationLineId,
        supplierCompanyName: companyName,
        quotationLineStatus,
      },
    });
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/fetchLadderLevelTable',
      payload: { quotationLineId, organizationId },
    });
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        quotaLadderLevelData: [],
      },
    });
  }

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet() {
    const { organizationId, match: { params } = {} } = this.props;
    const rfxHeaderId = params?.rfxId;
    if (!rfxHeaderId) {
      return;
    }

    const param = {
      organizationId,
      rfxHeaderId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(param);
      result = getResponse(result);

      if (result === 1) {
        this.setState({
          newQuotationFlag: result,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 打开缩略图模态框
   */
  @Bind()
  viewPriceCharts(chartFlag, id) {
    const chartsLoading = {
      [id]: { fetchPriceChartLoading: true },
    };
    this.setState({ chartsLoading });
    this.setState({
      viewPriceChartsVisible: true,
    });
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    if (chartFlag === 'i') {
      // 查询物品明细缩略图数据
      dispatch({
        type: 'inquiryHall/fetchPriceChartsData',
        payload: { rfxLineItemId: id, organizationId, rfxHeaderId: params.rfxId },
      }).then((result) => {
        if (result) {
          this.setState({ chartsLoading: { [id]: { fetchPriceChartLoading: false } }, id });
          this.itemPriceChartsData(result);
        }
      });
    } else {
      // 查询供应商缩略图数据
      dispatch({
        type: 'inquiryHall/fetchPriceChartsData',
        payload: { rfxLineSupplierId: id, organizationId, rfxHeaderId: params.rfxId },
      }).then((result) => {
        if (result) {
          this.supPriceChartsData(result);
        }
      });
    }
  }

  /**
   * itemPriceChartsData - 处理物品明细缩略图数据
   */
  @Bind()
  itemPriceChartsData(data) {
    // 将没有报价的供应商剔除数据，filter过滤
    const filterInfo =
      data &&
      data.filter((val) => {
        return val.quotationPrice !== null;
      });
    const priceDataSourceList = filterInfo.map((item) => {
      const { quotedDate } = item;
      const obj = {
        quotedDate,
      };
      obj[`${item.supplierCompanyName}`] = item.quotationPrice;
      return obj;
    });
    // 得到所有含报价的供应商名数据
    const supplierName = filterInfo && filterInfo.map((item) => item.supplierCompanyName);
    const supplierNameArr = Array.from(new Set(supplierName));
    this.setState({
      priceDataSource: priceDataSourceList,
      supplierNameList: supplierNameArr,
    });
  }

  /**
   * hidePriceCharts - 关闭缩略图模态框
   */
  @Bind()
  hidePriceCharts() {
    this.setState({
      viewPriceChartsVisible: false,
      priceDataSource: [],
      supplierNameList: [],
    });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        priceChartsData: [],
      },
    });
  }

  /**
   * 询价大厅-初审头信息查询
   */
  @Bind()
  fetchInquiryHallPretrial() {
    this.fetchH0OrC7N();
    const {
      match: { params, path = null },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchInquiryHeaderDetail',
      payload: {
        rfxHeaderId: params.rfxId,
        organizationId,
        path,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_PRETRIAL.HEADER_INFO,SSRC.${this.sourceKey}_HALL_PRETRIAL.COST`,
      },
    });
    this.fetchItemLine();
    this.fetchSupplierLine();
    this.fetchQuoteLine();
    this.queryDoubleUnit();
    this.newQuotationConfigSheet();
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchItemLine',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_PRETRIAL.ITEM_DETAIL`,
      },
    });
  }

  /**
   * 物品明细 - 改变分页
   */
  @Bind()
  changeItemLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchItemLine(changedPagination);
  }

  /**
   * 供应商列表 - 改变分页
   */
  @Bind()
  changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchSupplierLine(changedPagination);
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  fetchSupplierLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchSupplierLineCheckPrice',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 全部报价明细 - 查询
   */
  @Bind()
  fetchQuoteLine(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchQuoteLine',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_PRETRIAL.ALL_DETAIL`,
      },
    });
  }

  /**
   * 获取双单位标识
   */
  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  // 寻源功能控制黑白名单
  fetchH0OrC7N = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      const bargainObj =
        res.find(
          (item) => item.function === 'BUTTON_GROUP_FIVE_BUTTONS' && item.whiteFlag === '1'
        ) || {}; // 议价
      this.setState({
        headerGroupButtonMaxNum: !isEmpty(bargainObj) ? 5 : -1,
      });
    }
  };

  /**
   * 物品明细行明细 - 查询
   */
  @Bind()
  fetchItemQuoteLineList(itemQuoteLineId, updateState) {
    itemQuoteLineId.forEach((item) =>
      this.itemLineList.fetchItemLineTableList({}, item, updateState)
    );
  }

  /**
   * 供应商行明细 - 查询
   */
  @Bind()
  fetchSupplierQuoteLineList(supplierQuoteLineId, updateState) {
    supplierQuoteLineId.forEach((item) =>
      this.supplierLineList.fetchSupplierLineTableList({}, item, updateState)
    );
  }

  /**
   * 初审 - 转交
   */
  @Bind()
  onSelectTransferOk(value) {
    Modal.confirm({
      title: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.confirmTransfer`)
        .d('确定转交至该选中用户?'),
      onOk: () => {
        const {
          inquiryHall: { header = {} },
          dispatch,
          organizationId,
        } = this.props;
        const { id } = value;
        dispatch({
          type: 'inquiryHall/selectTransferOk',
          payload: {
            rfxHeaderId: header.rfxHeaderId,
            objectVersionNumber: header.objectVersionNumber,
            organizationId,
            deliverUserId: id,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `${this.activeTabKey}/list`,
              })
            );
          }
        });
      },
    });
  }

  /**
   * 保存 - 初审
   *
   */
  @Bind()
  handleSave() {
    const {
      match: { params, path = null },
      form,
      inquiryHall: { header = {} },
      dispatch,
      organizationId,
    } = this.props;
    const { pretrialUuid = null } = this.state;

    form.validateFields((err, values) => {
      const { pretrailRemark = undefined, totalCost = undefined } = values;
      if (isEmpty(err)) {
        dispatch({
          type: 'inquiryHall/savePretrial',
          payload: {
            ...values,
            pretrailRemark,
            totalCost,
            objectVersionNumber: header.objectVersionNumber,
            rfxHeaderId: header.rfxHeaderId,
            organizationId,
            pretrialUuid: pretrialUuid || header.pretrialUuid || null,
            customizeUnitCode: `SSRC.${this.sourceKey}_HALL_PRETRIAL.HEADER_INFO,SSRC.${this.sourceKey}_HALL_PRETRIAL.COST`,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch({
              type: 'inquiryHall/fetchInquiryHeaderDetail',
              payload: {
                rfxHeaderId: params.rfxId,
                organizationId,
                path,
                customizeUnitCode: `SSRC.${this.sourceKey}_HALL_PRETRIAL.HEADER_INFO,SSRC.${this.sourceKey}_HALL_PRETRIAL.COST`,
              },
            });
            dispatch({
              type: 'inquiryHall/updateState',
              payload: {
                itemLineChange: false,
                supplierLineChange: false,
                allLineChange: false,
              },
            });
          }
        });
      }
    });
  }

  /**
   * 提交 - 初审
   *
   */
  @Bind()
  handleSubmit() {
    const {
      form,
      inquiryHall: { header = {} },
      dispatch,
      organizationId,
    } = this.props;
    const { pretrialUuid = null } = this.state;

    form.validateFields((err, values) => {
      const { pretrailRemark = undefined, totalCost = undefined } = values;
      if (isEmpty(err)) {
        dispatch({
          type: 'inquiryHall/submitPretrial',
          payload: {
            ...values,
            pretrailRemark,
            totalCost,
            objectVersionNumber: header.objectVersionNumber,
            rfxHeaderId: header.rfxHeaderId,
            organizationId,
            pretrialUuid: pretrialUuid || header.pretrialUuid || null,
            customizeUnitCode: `SSRC.${this.sourceKey}_HALL_PRETRIAL.HEADER_INFO,SSRC.${this.sourceKey}_HALL_PRETRIAL.COST`,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `${this.activeTabKey}/list`,
              })
            );
          }
        });
      }
    });
  }

  UEDDisplayFormItem(props) {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { label, value, name } = props;
    return (
      <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
        {getFieldDecorator(name)(<span>{value} </span>)}
      </FormItem>
    );
  }

  rfxTitleForm() {
    const {
      inquiryHall: { header = {} },
    } = this.props;
    return (
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
              value: header.templateName,
              name: 'templateName',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
              value: header.secondarySourceCategoryMeaning || header.sourceCategoryMeaning,
              name: 'sourceCategoryMeaning',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
              value: header.purOrganizationName,
              name: 'purOrganizationName',
            })}
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get('ssrc.common.company').d('公司'),
              value: header.companyName,
              name: 'companyName',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
              value: header.unitName,
              name: 'unitName',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonApproach`, {
                  sourceCategoryName: getSourceCategoryName(this.sourceKey === BID),
                })
                .d('{sourceCategoryName}方式'),
              value: header.sourceMethodMeaning,
              name: 'sourceMethodMeaning',
            })}
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: <QuotationDirectLable />,
              value: header.auctionDirectionMeaning,
              name: 'auctionDirectionMeaning',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额'),
              value: numberSeparatorRender(header.budgetAmount),
              name: 'budgetAmount',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
              value: header.currencyCodeMeaning,
              name: 'currencyCodeMeaning',
            })}
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
              value: numberRender(header.exchangeRate, 8, false),
              name: 'exchangeRate',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期'),
              value: header.creationDate,
              name: 'creationDate',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStartTime`, {
                  quotationName: getQuotationName(this.sourceKey === BID),
                })
                .d('{quotationName}开始时间'),
              value: dateTimeRender(header.quotationStartDate),
              name: 'quotationStartDate',
            })}
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDeadline`, {
                  quotationName: getQuotationName(this.sourceKey === BID),
                })
                .d('{quotationName}截止时间'),
              value: dateTimeRender(header.quotationEndDate),
              name: 'quotationEndDate',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingType`).d('寻源类型'),
              value: header.sourceTypeMeaning,
              name: 'sourceTypeMeaning',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
              value: header.paymentTypeName,
              name: 'paymentTypeName',
            })}
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCategory`).d('价格类型'),
              value: header.priceCategoryMeaning,
              name: 'priceCategoryMeaning',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
              value: header.rfxRemark,
              name: 'rfxRemark',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`).d('备注(内部)'),
              value: header.internalRemark,
              name: 'internalRemark',
            })}
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式'),
              value: header.quotationTypeMeaning,
              name: 'quotationTypeMeaning',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.inquiryHall.model.inquiryHall.backResion`).d('退回原因'),
              value: header.backPretrialRemark,
              name: 'backPretrialRemark',
            })}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {this.UEDDisplayFormItem({
              label: intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间'),
              value: header.sourceCreationDate,
              name: 'sourceCreationDate',
            })}
          </Col>
        </Row>
      </Form>
    );
  }

  renderHeaderTitle(header) {
    return (
      <h3>
        {header.rfxNum}-{header.rfxTitle}
        <Tag style={{ marginLeft: '15px' }}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}：{header.roundNumber}
        </Tag>
      </h3>
    );
  }

  /**
   * 渲染成本备注折叠
   */
  rfxCostRemarkForm() {
    const {
      form: { getFieldDecorator },
      inquiryHall: { header = {} },
    } = this.props;
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本')}
              {...formLayout}
            >
              {getFieldDecorator('totalCost', {
                initialValue: header.totalCost,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={header.currencyCode}
                  max="99999999999999999999"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonTotalPrice`, {
                  checkPriceName: getCheckPriceName(this.sourceKey === BID),
                })
                .d('{checkPriceName}总金额')}
              {...formLayout}
            >
              {getFieldDecorator('totalPrice', {
                initialValue: header.totalPrice,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={header.currencyCode}
                  disabled
                  max="99999999999999999999"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostFlag`).d('是否超成本')}
              {...formLayout}
            >
              {getFieldDecorator('overCostFlag', {
                initialValue: header.overCostFlag,
              })}
              {yesOrNoRender(header.overCostFlag)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostPrice`).d('超成本金额')}
              {...formLayout}
            >
              {getFieldDecorator('overCostPrice', {
                initialValue: header.overCostPrice,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={header.currencyCode}
                  disabled
                  max="99999999999999999999"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostScale`).d('超成本百分比')}
              {...formLayout}
            >
              {getFieldDecorator('overCostScale', {
                initialValue: header.overCostScale,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.costRemark`).d('成本备注')}
              {...formLayout}
            >
              {getFieldDecorator('costRemark', {
                initialValue: header.overCostScale,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames('last-form-item', 'half-row')}>
          <Col span={12}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailRemark`).d('初审备注')}
            >
              {getFieldDecorator('pretrailRemark', {
                initialValue: header.pretrailRemark,
                rules: [
                  {
                    max: 1000,
                    message: intl
                      .get('hzero.common.validation.maxCN', {
                        max: 1000,
                      })
                      .d('长度不能超过{max}个汉字'),
                  },
                ],
              })(<TextArea autosize={{ minRows: 3, maxRows: 10 }} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   *切换tab页
   */
  @Bind()
  changeTabs(key) {
    const {
      dispatch,
      inquiryHall: {
        itemLineChange = false,
        supplierLineChange = false,
        allLineChange = false,
        itemQuoteLine = [],
        supplierQuoteLine = [],
        quoteLine = [],
      },
    } = this.props;
    const { activeKey } = this.state;
    if (activeKey !== key) {
      if (itemLineChange || supplierLineChange || allLineChange) {
        // itemLine标签页有改动
        if (activeKey === 'itemLine' && itemLineChange) {
          Modal.confirm({
            title: intl
              .get('hzero.common.message.confirm.giveUpTip')
              .d('你有修改未保存，是否确认离开？'),
            onOk: () => {
              // 设置activeKey，重置itemLineChange，form,表格得$form
              this.setState({ activeKey: key });
              // eslint-disable-next-line no-unused-expressions
              this.itemLineList?.props?.form?.resetFields();
              itemQuoteLine.forEach((item) => item.$form.resetFields());
              dispatch({
                type: 'inquiryHall/updateState',
                payload: {
                  itemLineChange: false,
                },
              });
            },
          });
        }
        // supplierLine标签页有改动
        if (activeKey === 'supplierLine' && supplierLineChange) {
          Modal.confirm({
            title: intl
              .get('hzero.common.message.confirm.giveUpTip')
              .d('你有修改未保存，是否确认离开？'),
            onOk: () => {
              // 设置activeKey，重置itemLineChange，form,表格得$form
              this.setState({ activeKey: key });
              // eslint-disable-next-line no-unused-expressions
              this.itemLineList?.props?.form?.resetFields();
              supplierQuoteLine.forEach((item) => item.$form.resetFields());
              dispatch({
                type: 'inquiryHall/updateState',
                payload: {
                  supplierLineChange: false,
                },
              });
            },
          });
        }
        // quoteLine标签页有改动
        if (activeKey === 'quoteLine' && allLineChange) {
          Modal.confirm({
            title: intl
              .get('hzero.common.message.confirm.giveUpTip')
              .d('你有修改未保存，是否确认离开？'),
            onOk: () => {
              // 设置activeKey，重置itemLineChange，form,表格得$form
              this.setState({ activeKey: key });
              // eslint-disable-next-line no-unused-expressions
              this.quoteLine?.props?.form?.resetFields();
              quoteLine.forEach((item) => item.$form.resetFields());
              dispatch({
                type: 'inquiryHall/updateState',
                payload: {
                  allLineChange: false,
                },
              });
            },
          });
        }
      } else {
        this.setState({ activeKey: key });
      }
    }
  }

  /**
   * 再次询价
   */
  @Bind()
  inquiryAgain() {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    Modal.confirm({
      title: intl.get(`ssrc.inquiryHall.view.message.confirm.inquiryAgain`).d('确认是否再次询价'),
      onOk: () => {
        dispatch({
          type: 'inquiryHall/inquiryAgain',
          payload: {
            organizationId,
            rfxHeaderId: params.rfxId,
          },
        }).then((res) => {
          if (res) {
            let pathname;
            if (this.activeTabKey !== '/ssrc/inquiry-hall') {
              pathname = `${this.activeTabKey}/rfx-update-new/${params.rfxId}`;
            } else {
              pathname = `${this.activeTabKey}/rfx-update/${params.rfxId}`;
            }
            dispatch(
              routerRedux.push({
                pathname,
              })
            );
          }
        });
      },
      onCancel: () => {},
    });
  }

  @Bind()
  handleAfterOpenModal(pretrialUuid = null) {
    this.setState({
      pretrialUuid,
    });
  }

  getBackPath() {
    return `${this.activeTabKey}/list`;
  }

  @Bind()
  renderPriceComparisonModal(priceComparisonProps) {
    return this.sourceKey === INQUIRY ? (
      <PriceComparison {...priceComparisonProps} />
    ) : (
      <BidPriceComparison {...priceComparisonProps} />
    );
  }

  @Bind()
  handleRenderPriceComparisonModal(priceComparisonProps) {
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: this.renderPriceComparisonModal(priceComparisonProps),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  @Bind()
  getButtons() {
    const {
      match: { params },
      organizationId,
      savePretrialLoading,
      fetchInquiryLoading,
      submitPretrialLoading,
      selectTransferOkLoading,
      inquiryHall: { header = {} },
      remote,
    } = this.props;
    const { sourceCategory, diyLadderQuotationFlag } = header || {};
    const priceComparisonProps = {
      item: {},
      rfxId: params.rfxId,
      sourceCategory,
      diyLadderQuotationFlag,
    };
    const buttons = [
      {
        name: 'transferButton',
        btnComp: (props) => <Fragment> {props.children} </Fragment>,
        btnProps: {
          funcType: 'flat',
        },
        child: (text) => {
          return (
            <Lov
              isButton
              style={{
                border: 'none',
                // fontWeight: '400',
                padding: 0,
              }}
              onOk={this.onSelectTransferOk}
              code="HIAM.TENANT.USER"
              queryParams={{ organizationId }}
              loading={selectTransferOkLoading}
            >
              {text || intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交')}
            </Lov>
          );
        },
      },
      {
        name: 'operationRecord',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          onClick: this.playView,
          icon: 'clock-circle-o',
          funcType: 'flat',
        },
      },
      {
        name: 'inquiryAgain',
        child: intl
          .get(`ssrc.inquiryHall.view.message.button.commonInquiryAgain`, {
            sourceCategoryName: getSourceCategoryName(this.sourceKey === BID),
          })
          .d('再次{sourceCategoryName}'),
        btnProps: {
          onClick: this.inquiryAgain,
          funcType: 'flat',
          style: {
            fontWeight: '600',
          },
        },
      },
      {
        name: 'uploadAttachment',
        btnComp: Upload,
        // childFor: 'btnText',
        btnType: 'c7n-pro',
        btnProps: {
          filePreview: true,
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'ssrc-rfx-pretrial',
          attachmentUUID: header.pretrialUuid ? header.pretrialUuid : undefined,
          tenantId: organizationId,
          fileSize: FIlESIZE,
          beforeUpload: validBeforeUploadFiles,
          afterOpenUploadModal: this.handleAfterOpenModal,
          btnProps: {
            icon: 'upload',
            type: 'default',
            style: {
              border: 'none',
            },
          },
          funcType: 'flat',
          ...(ChunkUploadProps || {}),
        },
      },
      {
        name: 'priceAssistant',
        btnProps: {
          type: 'default',
          funcType: 'flat',
          onClick: () => this.handleRenderPriceComparisonModal(priceComparisonProps),
        },
        child: (
          <>
            <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </>
        ),
      },
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          onClick: this.handleSave,
          loading: savePretrialLoading || fetchInquiryLoading,
          funcType: 'flat',
        },
      },
      {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          color: 'primary',
          onClick: this.handleSubmit,
          loading: submitPretrialLoading,
        },
      },
    ]
      .filter(Boolean)
      .reverse();

    return remote
      ? remote.process('SSRC_PRETRIAL_PROCESS_HEADER_BUTTONS', buttons, {
          fetchInquiryHallPretrial: this.fetchInquiryHallPretrial,
          sourceKey: this.sourceKey,
          params,
        })
      : buttons;
  }

  render() {
    const {
      organizationId,
      fetchItemLineLoading,
      fetchSupplierLineLoading,
      fetchQuoteLineLoading,
      fetchLadderLevelTableLoading,
      dispatch,
      match,
      form,
      inquiryHall: {
        header = {},
        itemLine = [],
        supplierLine = [],
        quoteLine = [],
        quoteLinePagination = {},
        operationPagination,
        operationData,
        quotaLadderLevelData = [],
      },
      match: { params },
      customizeTable,
      customizeForm,
      customizeBtnGroup,
    } = this.props;
    const {
      operationRecordModalVisible,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      viewPriceChartsVisible,
      priceDataSource,
      supplierNameList,
      chartsLoading,
      id,
      bucketDirectory,
      viewOnly,
      collapseKeys = [],
      doubleUnitFlag = false,
      newQuotationFlag = 0,
      headerGroupButtonMaxNum = -1,
    } = this.state;
    const operationRecordProps = {
      dispatch,
      match,
      organizationId,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
      pagination: operationPagination,
      dataSource: operationData,
    };
    const itemLineListProps = {
      organizationId,
      sourceKey: this.sourceKey,
      rfxHeaderId: params.rfxId,
      headerList: itemLine,
      loading: fetchItemLineLoading,
      onChangePagination: this.changeItemLinePagination,
      onRef: (node) => {
        this.itemLineList = node;
      },
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      visible: operationRecordModalVisible,
      // 缩略图参数
      id,
      itemChartsLoading: chartsLoading[id] && chartsLoading[id].fetchPriceChartLoading,
      priceDataSource,
      supplierNameList,
      onPriceCharts: this.viewPriceCharts,
      onHidePriceCharts: this.hidePriceCharts,
      priceChartsvisible: viewPriceChartsVisible,
      customizeTable,
      doubleUnitFlag,
      newQuotationFlag,
    };
    const supplierLineListProps = {
      rfxHeaderId: params.rfxId,
      headerList: supplierLine,
      loading: fetchSupplierLineLoading,
      onChangePagination: this.changeSupplierLinePagination,
      onRef: (node) => {
        this.supplierLineList = node;
      },
      sourceKey: this.sourceKey,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      onPriceCharts: this.viewPriceCharts,
      onHidePriceCharts: this.hidePriceCharts,
      priceChartsvisible: viewPriceChartsVisible,
      customizeTable,
      doubleUnitFlag,
      newQuotationFlag,
    };
    const quoteLineTableProps = {
      organizationId,
      loading: fetchQuoteLineLoading,
      dataSource: quoteLine,
      sourceKey: this.sourceKey,
      pagination: quoteLinePagination,
      onChange: this.fetchQuoteLine,
      onRef: (node) => {
        this.quoteLine = node;
      },
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      showQuotationDetail: this.showQuotationDetail,
      customizeTable,
      doubleUnitFlag,
      newQuotationFlag,
    };
    const AttachmentsProps = {
      bucketDirectory,
      bucketName: PRIVATE_BUCKET,
      viewOnly,
      businessUuid: header.businessAttachmentUuid,
      techUuid: header.techAttachmentUuid,
    };

    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.inquiryHall.view.message.title.pretrial`).d('初审')}
          backPath={this.getBackPath()}
        >
          {customizeBtnGroup(
            {
              code: `SSRC.${this.sourceKey}_HALL_PRETRIAL.BUTTONS`,
              pro: true,
            },
            <DynamicButtons
              maxNum={headerGroupButtonMaxNum}
              trigger="click"
              buttons={this.getButtons()}
              defaultBtnType="c7n-pro"
            />
          )}
        </Header>
        <Content>
          <Spin
            spinning={fetchItemLineLoading}
            wrapperClassName={classnames(styles['page-content'], 'ued-detail-wrapper')}
          >
            <Collapse className="form-collapse" onChange={this.onCollapseChange}>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    {this.renderHeaderTitle(header)}
                    <a>
                      {collapseKeys.includes('rfxTitle')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('rfxTitle') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="rfxTitle"
              >
                {customizeForm(
                  {
                    code: `SSRC.${this.sourceKey}_HALL_PRETRIAL.HEADER_INFO`,
                    form,
                    dataSource: header,
                  },
                  this.rfxTitleForm()
                )}
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`ssrc.inquiryHall.view.message.panel.costComments`).d('成本备注')}
                    </h3>
                    <a>
                      {collapseKeys.includes('costRemark')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('costRemark') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="costRemark"
              >
                {customizeForm(
                  {
                    code: `SSRC.${this.sourceKey}_HALL_PRETRIAL.COST`,
                    form,
                    dataSource: header,
                  },
                  this.rfxCostRemarkForm()
                )}
              </Panel>
            </Collapse>
          </Spin>
          {/* <Collapse bordered={false}>
            <Panel header={this.renderHeaderTitle(header)} key="rfxTitle" style={customPanelStyle}>
              {this.rfxTitleForm()}
            </Panel>
            <Panel
              header={intl.get(`ssrc.inquiryHall.view.message.panel.costComments`).d('成本备注')}
              key="costRemark"
              style={customPanelStyle}
            >
              {this.rfxCostRemarkForm()}
            </Panel>
          </Collapse> */}
          <Tabs
            activeKey={this.state.activeKey}
            onChange={this.changeTabs}
            animated={false}
            className={styles.tabStyle}
          >
            <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemDetails`).d('物品明细')}
              key="itemLine"
            >
              <ItemLineList {...itemLineListProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表')}
              key="supplierLine"
              forceRender
            >
              <SupplierLineList {...supplierLineListProps} />
            </TabPane>
            <TabPane
              tab={intl
                .get(`ssrc.inquiryHall.view.message.tab.allQuotationDetails`)
                .d('全部报价明细')}
              key="quoteLine"
              forceRender
            >
              <QuoteLineTable {...quoteLineTableProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.attachmentList`).d('附件列表')}
              key="attachmentList"
              style={{ padding: '16px' }}
            >
              <Attachment {...AttachmentsProps} />
            </TabPane>
          </Tabs>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) => {
  return withCustomize({
    unitCode: [
      `SSRC.${type}_HALL_PRETRIAL.ITEM_DETAIL`,
      `SSRC.${type}_HALL_PRETRIAL.SUPPLIER_DETAIL`,
      `SSRC.${type}_HALL_PRETRIAL.ALL_DETAIL`,
      `SSRC.${type}_HALL_PRETRIAL.HEADER_INFO`,
      `SSRC.${type}_HALL_PRETRIAL.COST`,
      `SSRC.${type}_HALL_PRETRIAL.BUTTONS`,
    ],
  })(
    Form.create({ fieldNameProp: null })(
      connect(({ inquiryHall, loading }) => ({
        inquiryHall,
        fetchItemLineLoading: loading.effects['inquiryHall/fetchItemLine'],
        fetchSupplierLineLoading: loading.effects['inquiryHall/fetchSupplierLineCheckPrice'],
        fetchQuoteLineLoading: loading.effects['inquiryHall/fetchQuoteLine'],
        savePretrialLoading: loading.effects['inquiryHall/savePretrial'],
        submitPretrialLoading: loading.effects['inquiryHall/submitPretrial'],
        selectTransferOkLoading: loading.effects['inquiryHall/selectTransferOk'],
        fetchLadderLevelTableLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
        fetchPriceChartLoading: loading.effects['iinquiryHall/fetchPriceChartsData'],
        fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })(
          remoteHOC({
            code: 'SSRC_PRETRIAL',
            name: 'remote',
          })(Comp)
        )
      )
    )
  );
};

export default HOCComponent(CheckPrice, INQUIRY);

export { CheckPrice, HOCComponent };
