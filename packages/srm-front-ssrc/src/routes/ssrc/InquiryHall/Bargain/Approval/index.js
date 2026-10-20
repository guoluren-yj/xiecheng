/**
 * model - 线上议价 工作流-审批
 * @date: 2021-01-19
 * @author: ZXM <ximin.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Row, Col, Tag, Tabs, Form } from 'hzero-ui';
import { Modal as c7nModal } from 'choerodon-ui/pro';

import { isEmpty } from 'lodash';
// import moment from 'moment';

import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { getEditTableData, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import Upload from 'srm-front-boot/lib/components/Upload';
import { EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT, FORM_COL_2_3_LAYOUT } from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';
import classnames from 'classnames';
import PriceComparison from '@/routes/ssrc/components/PriceComparison';
import Iconfont from '@/routes/ssrc/components/Icons'; // 下载至本地的icon
import OperationRecord from '@/routes/ssrc/components/OperationRecord';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { isText } from '@/utils/utils';
import { fetchHeaderInfoApproval } from '@/services/inquiryHallService';
import { INQUIRY } from '@/utils/globalVariable';
import FullQuoteDetails from './FullQuoteDetails';
// import SupplierList from './SupplierList';
// import ItemDetails from './ItemDetails';
// import CounterOffersBulk from '../../FeedbackBargain/CounterOffersBulk';
import styles from '../index.less';

import { withStandardCompEnhancer } from './standardCompEnhancerCreator';

const { TabPane } = Tabs;
const FormItem = Form.Item;

class Bargain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'allDetails', // 当前激活的面板
      uploadVisible: false, // 附件上传模态框
      collapseSupplierActiveKeys: [], // 控制供应商列表的展开
      collapseItemActiveKeys: [], // 控制物品列表的展开
      priceComparisonModalVisible: false, // 比价助手模态框
      operationRecordModalVisible: false, // 操作记录模态框
      loadingFlag: {}, // loading判断
      fullDetailsSelectKeys: [], // 全部报价明细勾选id
      fullDetailsSelectRows: [], // 全部报价明细勾选数据
      supplierSelectKeys: [], // 供应商列表勾选id,
      supplierSelectRow: [], // 供应商列表勾选数据
      itemSelectKeys: [], // 物品明细列表勾选id,
      itemSelectRows: [], // 物品明细列表勾选数据
      fillCounteroffersVisible: false, // 批量填写还价模态框
      fillCounteroffersOfflineVisible: false, // 批量填写价格模态框
      fillCounteroffersFlag: false, // 判断批量填写还价按钮显隐
      currentLineId: null,
      deadlineEventVisible: false, // 截止时间模态框打开
      pageSize: [],
      currentPage: {},
      pageAll: [], // 存储分页变化
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      itemQuotationDetailModalVisible: false, // 全部报价->报价明细弹窗
      itemId: undefined, // 比价记录点击历史行标记
      bargainAttachmentUuid: '', // 上传附件
      requestFlag: false,
      itemRecord: {}, // 当前操作的物品行
      quotationDetailVisible: false, // 报价明细显示标识
      itemLineRecord: {}, // 物品行记录
      bargainFlag: true, // 是否是线上议价
      header: {}, // 询价单头
      rfxHeaderSnapId: props.match.params.rfxHeaderSnapId,
      doubleUnitFlag: false, // 双单位标志
    };
  }

  sourceKey = this.props.sourceKey || INQUIRY;

  componentDidMount() {
    this.repalceRouter();
  }

  repalceRouter() {
    const {
      match: { path, params },
    } = this.props;
    if (path.indexOf('rfxId') > -1) {
      this.setState(
        {
          rfxHeaderSnapId: params.rfxId,
        },
        () => {
          this.fetchBargainHeader();
        }
      );
    } else {
      this.fetchBargainHeader();
    }
  }

  /**
   * 结束生命周期，清空数据
   */
  componentWillUnmount() {
    const { dispatch, modelName = 'bargain' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        bargainFullDetails: [],
        bargainFullDetPagination: {},
        bargainSupplierLine: [],
        bargainSupplierLinePagination: {},
        supplierLine: [],
        supplierLinePagination: {},
        bargainItemLine: [],
        bargainItemLinePagination: {},
        itemLine: [],
        itemLinePagination: {},
      },
    });
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        itemQuotationDetail: [],
        QuotationDetailDataSource: {},
        itemQuotationPagination: {},
      },
    });
  }

  @Bind()
  async fetchBargainHeader() {
    const {
      // match: { path = null },
      dispatch,
      organizationId,
    } = this.props;
    const { rfxHeaderSnapId } = this.state;
    if (!rfxHeaderSnapId) {
      return;
    }

    try {
      let header = await fetchHeaderInfoApproval({
        organizationId,
        rfxHeaderId: rfxHeaderSnapId,
        // path,
      });
      header = getResponse(header);
      if (!header) {
        return;
      }
      this.setState({ header });
    } catch (e) {
      throw e;
    }

    const lovCodes = {
      bargainType: 'SSRC.BARGAIN_TYPE', // 还价方式
      bargainTypeOffline: 'SSRC.BARGAIN_OFFLINE_TYPE', // 线下还价方式
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    });
    // this.fetchSupplierLineBargainPrice(); // 获取供应商头信息
    this.fetchBargainFullDetails(); // 获取全部报价明细
    // this.fetchItemDetailsInfo(); // 获取物品明细头信息
    this.queryDoubleUnit();
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  /**
   * 全部明细
   */
  @Bind()
  fetchBargainFullDetails(page = {}, filters, sorter) {
    const { dispatch, organizationId, modelName = 'bargain' } = this.props;
    const { bargainFlag, rfxHeaderSnapId } = this.state;
    const orderType = isEmpty(sorter) ? 'itemCategoryName' : sorter.field;

    dispatch({
      type: `${modelName}/fetchBargainFullDetails`,
      payload: {
        page,
        organizationId,
        orderType, // 全部报价默认按物品排序
        rfxHeaderId: rfxHeaderSnapId,
        rfxHeaderSnapId,
        flag: 0,
        isApproval: 'Approval', // 线上议价工作流审批标识
        customizeUnitCode: bargainFlag
          ? `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION`
          : `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION_OFFLINE`,
      },
    }).then((res) => {
      if (res) {
        const keys = [];
        const rows = [];
        let flag;
        if (res.content) {
          res.content.forEach((item) => {
            if (item.bargainSelectedFlag === 1) {
              keys.push(item.quotationLineId);
              rows.push(item);
            }
          });
          flag = res.content.some((item) => item.bargainSelectedFlag === 1);
        }
        this.setState({
          fullDetailsSelectKeys: keys,
          fullDetailsSelectRows: rows,
          fillCounteroffersFlag: flag,
        });
      }
    });
  }

  /**
   * 供应商列表行头部 - 查询
   */

  @Bind()
  fetchSupplierLineBargainPrice(page = {}) {
    const { dispatch, organizationId, modelName = 'bargain' } = this.props;
    const { rfxHeaderSnapId } = this.state;
    dispatch({
      type: `${modelName}/fetchSupplierLineBargainPrice`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: rfxHeaderSnapId,
      },
    });
  }

  /**
   * 物品明细行头部 - 查询
   */

  @Bind()
  fetchItemDetailsInfo(page = {}) {
    const { dispatch, organizationId, modelName = 'bargain' } = this.props;
    const { rfxHeaderSnapId } = this.state;
    dispatch({
      type: `${modelName}/fetchItemDetailsInfo`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: rfxHeaderSnapId,
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
   * 面板切换记录
   */
  @Bind()
  changeActiveKey(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * 供应商列表 - 改变分页
   */
  @Bind()
  changeItemLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchSupplierLineBargainPrice(changedPagination);
  }

  /**
   * 物品明细泪飙 - 分页
   */
  @Bind()
  changeItemDetailsPagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchItemDetailsInfo(changedPagination);
  }

  /**
   * fetchBargainSupplierOrItem - 根据flagAll来分别处理供应商列表和物品明细列表数据
   */
  @Bind()
  fetchBargainSupplierOrItem(lineId, flagALL, judge = true, page = {}) {
    const { modelName = 'bargain' } = this.props;
    const {
      dispatch,
      organizationId,
      [modelName]: { supplierLine = [], itemLine = [] },
    } = this.props;
    const { rfxHeaderSnapId } = this.state;
    const { currentPage, bargainFlag } = this.state;

    if (judge) {
      dispatch({
        type: `${modelName}/fetchBargainFullDetails`,
        payload: {
          page,
          organizationId,
          rfxHeaderId: rfxHeaderSnapId,
          rfxHeaderSnapId,
          supplierCompanyId: flagALL === 1 ? lineId : null,
          rfxLineItemId: flagALL === 2 ? lineId : null,
          flag: flagALL,
          isApproval: 'Approval', // 线上议价工作流审批标识
          customizeUnitCode: bargainFlag
            ? `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS,SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER`
            : `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS_OFFLINE,SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`,
        },
      }).then((res) => {
        if (res) {
          const keys = [];
          const rows = [];
          if (res.content) {
            res.content.forEach((item) => {
              if (item.bargainSelectedFlag === 1) {
                keys.push(item.quotationLineId);
                rows.push(item);
              }
            });
          }
          if (flagALL === 1) {
            if (!isEmpty(supplierLine)) {
              supplierLine.forEach((item) => {
                if (item.bargainSelectedFlag === 1) {
                  keys.push(item.quotationLineId);
                  rows.push(item);
                }
              });
            }
            this.setState({
              loadingFlag: { [lineId]: { supplierLineBargainLoading: false } },
              pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
              supplierSelectKeys: keys,
              supplierSelectRow: rows,
            });
          } else {
            if (!isEmpty(itemLine)) {
              itemLine.forEach((item) => {
                if (item.bargainSelectedFlag === 1) {
                  keys.push(item.quotationLineId);
                  rows.push(item);
                }
              });
            }
            this.setState({
              loadingFlag: { [lineId]: { itemLineBargainLoading: false } },
              pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
              itemSelectKeys: keys,
              itemSelectRows: rows,
            });
          }
        }
      });
    } else {
      if (flagALL === 1) {
        this.setState({ loadingFlag: { [lineId]: { supplierLineBargainLoading: true } } });
      } else {
        this.setState({ loadingFlag: { [lineId]: { itemLineBargainLoading: true } } });
      }
      dispatch({
        type: `${modelName}/fetchBargainDetails`,
        payload: {
          page: currentPage,
          organizationId,
          rfxHeaderId: rfxHeaderSnapId,
          supplierCompanyId: flagALL === 1 ? lineId : null,
          rfxLineItemId: flagALL === 2 ? lineId : null,
          flag: flagALL,
          dataSource: flagALL === 1 ? supplierLine : itemLine,
          customizeUnitCode: bargainFlag
            ? `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS,SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER`
            : `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS_OFFLINE,SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`,
        },
      }).then((res) => {
        if (res) {
          if (flagALL === 1) {
            this.setState({
              loadingFlag: { [lineId]: { supplierLineBargainLoading: false } },
              pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
            });
          } else {
            this.setState({
              loadingFlag: { [lineId]: { itemLineBargainLoading: false } },
              pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
            });
          }
        }
      });
    }
  }

  /**
   * 展开折叠框查询对应的供应商数据
   */
  @Bind()
  handleCollBack(supplierId, key = []) {
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { supplierLine = [] },
    } = this.props;
    // 判断供应商列表数据是否已经查询过
    let supplierFlag = false;
    if (!isEmpty(supplierLine)) {
      supplierLine.forEach((item) => {
        if (item.supplierCompanyId === supplierId) {
          supplierFlag = true;
        }
      });
    }
    if (!supplierFlag) {
      // 判断loading是否加载
      const loadingFlag = {
        [supplierId]: { supplierLineBargainLoading: true },
      };
      this.setState({ loadingFlag });
      this.fetchBargainSupplierOrItem(supplierId, 1, true);
    }
    this.setState({ collapseSupplierActiveKeys: key });
  }

  /**
   * 展开折叠框查询物品明细数据
   */
  @Bind()
  handleItemCallBack(itemId, key) {
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { itemLine = [] },
    } = this.props;
    // 判断供应商列表数据是否已经查询过
    let itemFlag = false;
    if (!isEmpty(itemLine)) {
      itemLine.forEach((item) => {
        if (item.rfxLineItemId === itemId) {
          itemFlag = true;
        }
      });
    }
    if (!itemFlag) {
      // 判断loading是否加载
      const loadingFlag = {
        [itemId]: { itemLineBargainLoading: true },
      };
      this.setState({ loadingFlag });
      this.fetchBargainSupplierOrItem(itemId, 2, true);
    }
    this.setState({ collapseItemActiveKeys: key });
  }

  /**
   * 分页查询数据
   */
  @Bind()
  fetchPaginationSupplierOrItem(lineId, flagALL, page = {}, type = '') {
    const { modelName = 'bargain' } = this.props;
    const {
      dispatch,
      organizationId,
      [modelName]: { supplierLine = [], itemLine = [] },
    } = this.props;
    const { rfxHeaderSnapId, bargainFlag } = this.state;
    if (flagALL === 1) {
      this.setState({
        loadingFlag: { [lineId]: { supplierLineBargainLoading: true } },
        currentPage: page,
        pageAll: { ...this.state.pageAll, [lineId]: page.current },
      });
    } else {
      this.setState({
        loadingFlag: { [lineId]: { itemLineBargainLoading: true } },
        currentPage: page,
        pageAll: { ...this.state.pageAll, [lineId]: page.current },
      });
    }
    dispatch({
      type: `${modelName}/fetchBargainDetails`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: rfxHeaderSnapId,
        supplierCompanyId: flagALL === 1 ? lineId : null,
        rfxLineItemId: flagALL === 2 ? lineId : null,
        flag: flagALL,
        dataSource: flagALL === 1 ? supplierLine : itemLine,
        type,
        customizeUnitCode: bargainFlag
          ? `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS,SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER`
          : `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS_OFFLINE,SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`,
      },
    }).then((res) => {
      if (res) {
        const keys = [];
        const rows = [];
        if (res.content) {
          res.content.forEach((item) => {
            if (item.bargainSelectedFlag === 1) {
              keys.push(item.quotationLineId);
              rows.push(item);
            }
          });
        }
        if (flagALL === 1) {
          if (!isEmpty(supplierLine)) {
            supplierLine.forEach((item) => {
              if (item.bargainSelectedFlag === 1) {
                keys.push(item.quotationLineId);
                rows.push(item);
              }
            });
          }
          this.setState({
            loadingFlag: { [lineId]: { supplierLineBargainLoading: false } },
            pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
            supplierSelectKeys: keys,
            supplierSelectRow: rows,
          });
        } else {
          if (!isEmpty(itemLine)) {
            itemLine.forEach((item) => {
              if (item.bargainSelectedFlag === 1) {
                keys.push(item.quotationLineId);
                rows.push(item);
              }
            });
          }
          this.setState({
            loadingFlag: { [lineId]: { itemLineBargainLoading: false } },
            pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
            itemSelectKeys: keys,
            itemSelectRows: rows,
          });
        }
      }
    });
  }

  /**
   * 全部报价明细分页切换保存并查询数据 - 线上
   */
  @Bind()
  changeFullInfoPageOnline(page, _, sorter) {
    this.fetchBargainFullDetails(page, _, sorter);
  }

  /**
   * 全部报价明细分页切换保存并查询数据 - 线下
   */
  @Bind()
  changeFullInfoPageOffline(page, _, sorter) {
    this.fetchBargainFullDetails(page, _, sorter);
  }

  /**
   * 线上 - 供应商明细列表及物品明细切换分页时，先保存数据
   */
  @Bind()
  changeSupplierOrItemLinePageOnline(page, lineId, flagALL) {
    // 判断供应商列表数据是否已经查询过
    this.bargainOnSaveOnline('pageSave', lineId, flagALL, page);
    // this.fetchPaginationSupplierOrItem(lineId, flagALL, page, 'pageSave');
  }

  /**
   * 线下 - 供应商明细列表及物品明细切换分页时，先保存数据
   */
  @Bind()
  changeSupplierOrItemLinePageOffline(page, lineId, flagALL) {
    // 判断供应商列表数据是否已经查询过
    this.bargainOnSaveOffline('pageSave', lineId, flagALL, page, 'pageSave');
  }

  /**
   * 批量填写还价
   */
  // @Bind()
  // handleSaveCounterOffersBulk(values) {
  //   const { bargainType, bargainPrice, bargainRemark } = values;
  //   const {
  //     bargain: { bargainFullDetails = [], supplierLine = [], itemLine = [] },
  //     organizationId,
  //     dispatch,
  //   } = this.props;
  //   const {
  //     fullDetailsSelectRows,
  //     activeKey,
  //     supplierSelectRow,
  //     itemSelectRows,
  //     currentLineId,
  //   } = this.state;
  //   const bargainFullDetailsNew = getEditTableData(bargainFullDetails, ['_status']);
  //   const supplierNew = getEditTableData(supplierLine, ['_status']);
  //   const itemLineNew = getEditTableData(itemLine, ['_status']);
  //   let dataProcess = [];
  //   if (activeKey === 'allDetails') {
  //     // 处理全部报价明细表格数据
  //     dataProcess = bargainFullDetailsNew.map((item) => {
  //       const dataFilter = fullDetailsSelectRows.filter(
  //         (data) => data.quotationLineId === item.quotationLineId
  //       );
  //       return {
  //         ...item,
  //         bargainSelectedFlag: !isEmpty(dataFilter) ? 1 : 0,
  //       };
  //     });
  //   } else if (activeKey === 'supplierList') {
  //     // 处理供应商列表表格数据
  //     const filterData = supplierNew.filter((item) => item.supplierCompanyId === currentLineId);
  //     dataProcess = filterData.map((item) => {
  //       const dataFilter = supplierSelectRow.filter(
  //         (data) => data.quotationLineId === item.quotationLineId
  //       );
  //       return {
  //         ...item,
  //         bargainSelectedFlag: !isEmpty(dataFilter) ? 1 : 0,
  //       };
  //     });
  //   } else {
  //     // 处理物品明细表格数据
  //     const filterData = itemLineNew.filter((item) => item.rfxLineItemId === currentLineId);
  //     dataProcess = filterData.map((item) => {
  //       const dataFilter = itemSelectRows.filter(
  //         (data) => data.quotationLineId === item.quotationLineId
  //       );
  //       return {
  //         ...item,
  //         bargainSelectedFlag: !isEmpty(dataFilter) ? 1 : 0,
  //       };
  //     });
  //   }
  //   dispatch({
  //     type: 'bargain/saveCounterOffersBulk',
  //     payload: {
  //       organizationId,
  //       rfxHeaderId: params.rfxHeaderSnapId,
  //       bargainType,
  //       bargainPrice,
  //       bargainRemark,
  //       supplierCompanyId: activeKey === 'supplierList' ? currentLineId : null,
  //       rfxLineItemId: activeKey === 'itemDetails' ? currentLineId : null,
  //       rfxQuotationLines: dataProcess,
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       notification.success();
  //       this.setState({ fillCounteroffersVisible: false });
  //       if (activeKey === 'allDetails') {
  //         this.fetchBargainFullDetails();
  //         this.fetchBargainSupplierOrItem(currentLineId, 1, false);
  //         this.fetchBargainSupplierOrItem(currentLineId, 2, false);
  //       } else if (activeKey === 'supplierList') {
  //         this.fetchBargainSupplierOrItem(currentLineId, 1, false);
  //         this.fetchBargainFullDetails();
  //         dispatch({
  //           type: 'bargain/updateState',
  //           payload: {
  //             itemLine: [],
  //           },
  //         });
  //         this.setState({ itemSelectRows: [], collapseItemActiveKeys: [] });
  //       } else {
  //         this.fetchBargainSupplierOrItem(currentLineId, 2, false);
  //         this.fetchBargainFullDetails();
  //         dispatch({
  //           type: 'bargain/updateState',
  //           payload: {
  //             supplierLine: [],
  //           },
  //         });
  //         this.setState({ supplierSelectRow: [], collapseSupplierActiveKeys: [] });
  //       }
  //     }
  //   });
  // }

  /**
   * 批量填写价格 - 线下
   */
  // @Bind()
  // handleSaveCounterOfflineBulk(values) {
  //   const { bargainType, bargainPrice, bargainRemark } = values;
  //   const {
  //     bargain: { bargainFullDetails = [], supplierLine = [], itemLine = [] },
  //     organizationId,
  //     dispatch,
  //   } = this.props;
  //   const { activeKey, currentLineId } = this.state;
  //   const bargainFullDetailsNew = getEditTableData(bargainFullDetails, ['_status']);
  //   const supplierNew = getEditTableData(supplierLine, ['_status']);
  //   const itemLineNew = getEditTableData(itemLine, ['_status']);
  //   let dataProcess = [];
  //   if (activeKey === 'allDetails') {
  //     // 处理全部报价明细表格数据
  //     dataProcess = bargainFullDetailsNew;
  //   } else if (activeKey === 'supplierList') {
  //     // 处理供应商列表表格数据
  //     const filterData = supplierNew.filter((item) => item.supplierCompanyId === currentLineId);
  //     dataProcess = filterData;
  //   } else {
  //     // 处理物品明细表格数据
  //     const filterData = itemLineNew.filter((item) => item.rfxLineItemId === currentLineId);
  //     dataProcess = filterData;
  //   }
  //   dispatch({
  //     type: 'bargain/saveCounterOffersOffline',
  //     payload: {
  //       organizationId,
  //       rfxHeaderId: params.rfxHeaderSnapId,
  //       bargainType,
  //       bargainPrice,
  //       bargainRemark,
  //       supplierCompanyId: activeKey === 'supplierList' ? currentLineId : null,
  //       rfxLineItemId: activeKey === 'itemDetails' ? currentLineId : null,
  //       rfxQuotationLines: dataProcess,
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       notification.success();
  //       this.setState({ fillCounteroffersOfflineVisible: false });
  //       if (activeKey === 'allDetails') {
  //         this.fetchBargainFullDetails();
  //       } else if (activeKey === 'supplierList') {
  //         this.fetchBargainSupplierOrItem(currentLineId, 1, false);
  //       } else {
  //         this.fetchBargainSupplierOrItem(currentLineId, 2, false);
  //       }
  //     }
  //   });
  // }

  // /**
  //  * 全部报价明细勾选数据
  //  */
  // @Bind()
  // fullDetailsSelect(keys, rows) {
  //   this.setState({
  //     fullDetailsSelectKeys: keys,
  //     fullDetailsSelectRows: rows,
  //   });
  // }

  // /**
  //  * 供应商列表勾选数据
  //  */
  // @Bind()
  // supplierLineSelect(keys, rows) {
  //   this.setState({
  //     supplierSelectKeys: keys,
  //     supplierSelectRow: rows,
  //   });
  // }

  // /**
  //  * 物品明细勾选数据
  //  */
  // @Bind()
  // itemLineSelect(keys, rows) {
  //   this.setState({
  //     itemSelectKeys: keys,
  //     itemSelectRows: rows,
  //   });
  // }

  /**
   * 打开比价助手模态框
   */

  @Bind()
  priceComparisonAssistant() {
    this.setState({ priceComparisonModalVisible: true });
  }

  /**
   * hidePriceComparison - 关闭比价助手弹窗
   */

  @Bind()
  hidePriceComparison() {
    this.setState({
      priceComparisonModalVisible: false,
    });
  }

  /**
   * 打开阶梯报价模态框
   */

  @Bind()
  viewLadderLevelModal(record = {}) {
    const {
      itemCode,
      itemName,
      supplierCompanyName,
      quotationLineId,
      quotationLineStatus,
    } = record;
    this.setState(
      {
        viewLadderLevelVisible: true,
        LadderLevelHeaderData: {
          itemCode,
          itemName,
          quotationLineId,
          supplierCompanyName,
          quotationLineStatus,
        },
      },
      () => {
        const { dispatch, organizationId } = this.props;
        dispatch({
          type: 'inquiryHall/fetchBarginLadderLevelyTable',
          payload: { quotationLineId, organizationId },
        });
      }
    );
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
        barginLadderLevelData: [],
      },
    });
  }

  /**
   * saveBarginLadderLine - 保存阶梯还价数据
   */
  @Bind()
  saveBarginLadderLine() {
    const {
      dispatch,
      organizationId,
      inquiryHall: { barginLadderLevelData = [] },
    } = this.props;
    const newParams = getEditTableData(barginLadderLevelData, ['ladderQuotationId']);
    if (!isEmpty(newParams)) {
      dispatch({
        type: 'inquiryHall/saveBarginLadderLevel',
        payload: { newParams, organizationId },
      }).then((res) => {
        if (res) {
          notification.success();
          const { LadderLevelHeaderData } = this.state;
          dispatch({
            type: 'inquiryHall/fetchBarginLadderLevelyTable',
            payload: { quotationLineId: LadderLevelHeaderData.quotationLineId, organizationId },
          });
        }
      });
    }
  }

  /**
   *  打开截止时间模态框
   */
  @Bind()
  bargainOnStart() {
    const {
      deadlineEventVisible,
      activeKey,
      fullDetailsSelectKeys,
      supplierSelectKeys,
      itemSelectKeys,
    } = this.state;
    let openFlag;
    if (activeKey === 'allDetails') {
      openFlag = fullDetailsSelectKeys.length > 0;
    } else if (activeKey === 'supplierList') {
      openFlag = supplierSelectKeys.length > 0;
    } else {
      openFlag = itemSelectKeys.length > 0;
    }
    if (openFlag) {
      this.setState({ deadlineEventVisible: !deadlineEventVisible });
    } else {
      notification.warning({
        message: intl.get(`ssrc.inquiryHall.model.bargain.selectRowWarning`).d('未勾选行数据'),
      });
    }
  }

  /**
   * 批量填写还比价 - 线上
   */
  @Bind()
  handleFillCounteroffers(event, lineId) {
    const { activeKey, fullDetailsSelectKeys } = this.state;
    event.stopPropagation();
    if (activeKey === 'allDetails') {
      if (fullDetailsSelectKeys.length > 0) {
        this.setState({ fillCounteroffersVisible: true, currentLineId: lineId });
      } else {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.model.bargain.pleaseTickTheLine`)
            .d('请勾选要批量填写还价的行'),
        });
      }
    }
  }

  @Bind()
  handleCancelCounterOffersBulk() {
    this.setState({ fillCounteroffersVisible: false });
  }

  /**
   * 批量填写价格 - 线下
   */
  @Bind()
  handleFillCounteroffersOffline(event, lineId) {
    event.stopPropagation();
    this.setState({ fillCounteroffersOfflineVisible: true, currentLineId: lineId });
  }

  @Bind()
  handleCancelCounterOffersOffline() {
    this.setState({ fillCounteroffersOfflineVisible: false });
  }

  /**
   * 二开渲染单号  此方法被 [屈臣氏]重写, 请合理修改!!!
   * @protected
   */
  @Bind()
  renderRfxNum(rfxNum) {
    return rfxNum;
  }

  /**
   * 头部渲染
   */
  @Bind()
  renderHeader() {
    const { header = {} } = this.state;
    const { rfxNum, rfxTitle, bargainEndDate = null, bargainRemark = null } = header;

    return (
      <>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_2_3_LAYOUT}>
            <h3 style={{ marginTop: '5px' }}>
              {this.renderRfxNum(rfxNum)} - {rfxTitle}
              <Tag className={styles['bargain-header-tag-round']} style={{ marginLeft: '15px' }}>
                {intl
                  .get(`ssrc.inquiryHall.view.message.commonQuotationRound`, {
                    round: header.quotationRoundNumber || 1,
                  })
                  .d('第{round}轮报价')}
              </Tag>
              {header.bargainTimes ? (
                <Tag className={styles['bargain-header-tag-bargain']}>
                  {intl
                    .get(`ssrc.common.theRoundBargainNum`, { bargainTimes: header.bargainTimes })
                    .d(`第{bargainTimes}次议价`)}
                </Tag>
              ) : null}
            </h3>
          </Col>
        </Row>
        <h4 className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-m'])}>
          <div className={styles['rfx-card-item-title-line']} />
          {intl.get('ssrc.inquiryHall.model.bargain.bargainIntro').d('议价说明')}
        </h4>
        <Row>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.bargain.bargainDeadline`).d('议价截止时间')}
            >
              {bargainEndDate}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <div className={styles.titleRight}>
              <FormItem
                label={intl.get(`ssrc.inquiryHall.model.bargain.reasonToBargain`).d('议价理由')}
              >
                {bargainRemark}
              </FormItem>
            </div>
          </Col>
        </Row>
      </>
    );
  }

  /**
   * 附件上传
   */
  // @Bind()
  // handleAfterOpenModal(checkAttachmentUuid) {
  //   this.setState({
  //     bargainAttachmentUuid: checkAttachmentUuid,
  //   });
  // }

  /**
   * 回调成功传递uuid
   */
  // @Bind()
  // uploadSuccess() {
  //   const {
  //     organizationId,
  //     bargain: { bargainHeader = {} },
  //   } = this.props;
  //   const param = {
  //     ...bargainHeader,
  //     ...{ bargainAttachmentUuid: this.state.bargainAttachmentUuid },
  //   };
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'bargain/uploadAttachement',
  //     payload: {
  //       organizationId,
  //       param,
  //     },
  //   });
  // }

  /**
   * 禁止选择当前时间之前
   */

  // @Bind()
  // disabledDate(current) {
  //   // Can not select days before today and today
  //   return current && current < moment().subtract(1, 'days');
  // }

  handleRenderPriceComparison(priceComparisonProps) {
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: <PriceComparison {...priceComparisonProps} />,
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  render() {
    const {
      operationRecordModalVisible,
      header = {},
      doubleUnitFlag,
      // priceComparisonModalVisible,
    } = this.state;
    const { modelName = 'bargain' } = this.props;
    const {
      dispatch,
      organizationId,
      // form: { getFieldDecorator },
      [modelName]: {
        bargainFullDetails = [],
        bargainFullDetPagination = {},
        // bargainSupplierLine = [],
        // bargainSupplierLinePagination = {},
        // supplierLine = [],
        // supplierLinePagination = {},
        // bargainItemLine = [],
        // bargainItemLinePagination = {},
        // itemLine = [],
        // itemLinePagination = {},
      },
      inquiryHall: {
        // code: { bargainType, bargainTypeOffline },
        barginLadderLevelData = [],
        operationPagination,
        operationData,
      },
      fetchBargainFullDetLoading, // 全部报价明细loading
      // handleSaveAllLoading,
      // fetchItemDetailsInfoLoading,
      // saveCounterOffersBulkLoading,
      // saveCounterOffersOfflineLoading,
      // fetchSupplierLineBargainLoading,
      saveBarginLadderLevelLoading,
      fetchBarginLadderLevelyTableLoading,
      // handleSaveAllOfflineLoading,
      // handleStartAllLoading,
      // bargainOnFinishedLoading,
      customizeTable,
      match = {},
    } = this.props;

    const {
      activeKey,
      // deadlineEventVisible,
      // fillCounteroffersFlag,
      viewLadderLevelVisible,
      // pageSize,
      LadderLevelHeaderData, // 阶梯报价头部数据
      // collapseSupplierActiveKeys = [],
      // collapseItemActiveKeys = [],
      // loadingFlag = {},
      // fullDetailsSelectKeys = [],
      // supplierSelectKeys = [],
      // itemSelectKeys = [],
    } = this.state;

    // // 全部报价明细勾选数据
    // const rowSelection = {
    //   selectedRowKeys: fullDetailsSelectKeys,
    //   onChange: this.fullDetailsSelect,
    //   getCheckboxProps: (record) => ({
    //     disabled:
    //       record.quotationLineStatus === 'BARGAINED' || record.quotationLineStatus === 'ABANDONED',
    //   }),
    // };

    // // 供应商列表勾选数据
    // const supplierSelection = {
    //   selectedRowKeys: supplierSelectKeys,
    //   onChange: this.supplierLineSelect,
    //   getCheckboxProps: (record) => ({
    //     disabled:
    //       record.quotationLineStatus === 'BARGAINED' || record.quotationLineStatus === 'ABANDONED',
    //   }),
    // };

    // // 物品明细勾选数据
    // const itemSelection = {
    //   selectedRowKeys: itemSelectKeys,
    //   onChange: this.itemLineSelect,
    //   getCheckboxProps: (record) => ({
    //     disabled:
    //       record.quotationLineStatus === 'BARGAINED' || record.quotationLineStatus === 'ABANDONED',
    //   }),
    // };

    // 全部报价明细
    const fullQuoteDetailsProps = {
      organizationId,
      customizeTable,
      doubleUnitFlag,
      sourceKey: this.sourceKey,
      viewLadderLevelVisible,
      barginLadderLevelData,
      LadderLevelHeaderData,
      headerInfo: header,
      saveLoading: saveBarginLadderLevelLoading,
      dataSource: bargainFullDetails,
      pagination: bargainFullDetPagination,
      onSearch: this.changeFullInfoPageOnline,
      fullDetailsLoading: fetchBargainFullDetLoading,
      // bargainFullDetLine: rowSelection,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      onSaveBarginLadderLine: this.saveBarginLadderLine,
      fetchLoading: fetchBarginLadderLevelyTableLoading,
      showQuotationDetail: this.showQuotationDetail,
      match,
    };

    // 全部报价明细-线下
    // const fullQuoteDetailsOfflineProps = {
    //   organizationId,
    //   customizeTable,
    //   headerInfo: header,
    //   bargainHeader: header,
    //   dataSource: bargainFullDetails,
    //   pagination: bargainFullDetPagination,
    //   onSearch: this.changeFullInfoPageOffline,
    //   fullDetailsLoading: fetchBargainFullDetLoading,
    //   viewLadderLevel: this.viewLadderLevelModal,
    //   hideModal: this.hideLadderLevelModal,
    //   onSaveBarginLadderLine: this.saveBarginLadderLine,
    //   fetchLoading: fetchBarginLadderLevelyTableLoading,
    //   showQuotationDetail: this.showQuotationDetail,
    // };

    // 供应商列表
    // const supplierListProps = {
    //   loadingFlag,
    //   customizeTable,
    //   supplierSelectKeys,
    //   collapseSupplierActiveKeys,
    //   pageSize,
    //   organizationId,
    //   LadderLevelHeaderData,
    //   viewLadderLevelVisible,
    //   barginLadderLevelData,
    //   fetchSupplierLineBargainLoading,
    //   headerInfo: bargainSupplierLine,
    //   saveLoading: saveBarginLadderLevelLoading,
    //   headerPagination: bargainSupplierLinePagination,
    //   handleCollBack: this.handleCollBack,
    //   dataSource: supplierLine,
    //   pagination: supplierLinePagination,
    //   onSearch: this.changeSupplierOrItemLinePageOnline,
    //   // barSelectSupplierLine: supplierSelection,
    //   onChangePagination: this.changeItemLinePagination,
    //   fillCounterSupplier: this.handleFillCounteroffers,
    //   viewLadderLevel: this.viewLadderLevelModal,
    //   hideModal: this.hideLadderLevelModal,
    //   onSaveBarginLadderLine: this.saveBarginLadderLine,
    //   fetchLoading: fetchBarginLadderLevelyTableLoading,
    //   showQuotationDetail: this.showQuotationDetail,
    // };

    // 物品明细
    // const itemDetailsProps = {
    //   loadingFlag,
    //   itemSelectKeys,
    //   collapseItemActiveKeys,
    //   pageSize,
    //   organizationId,
    //   customizeTable,
    //   headerInfo: bargainItemLine,
    //   fetchItemDetailsInfoLoading,
    //   headerPagination: bargainItemLinePagination,
    //   onChangePagination: this.changeItemDetailsPagination,
    //   handleItemCallBack: this.handleItemCallBack,
    //   onSearch: this.changeSupplierOrItemLinePageOnline,
    //   dataSource: itemLine,
    //   pagination: itemLinePagination,
    //   // barSelectItemLine: itemSelection,
    //   fillCounterItem: this.handleFillCounteroffers,
    //   viewLadderLevelVisible,
    //   hideModal: this.hideLadderLevelModal,
    //   barginLadderLevelData,
    //   onSaveBarginLadderLine: this.saveBarginLadderLine,
    //   LadderLevelHeaderData,
    //   saveLoading: saveBarginLadderLevelLoading,
    //   fetchLoading: fetchBarginLadderLevelyTableLoading,
    //   viewLadderLevel: this.viewLadderLevelModal,
    //   showQuotationDetail: this.showQuotationDetail,
    // };

    // // 比价助手
    const priceComparisonProps = {
      rfxId: header.rfxHeaderId,
      // visible: priceComparisonModalVisible,
      // onHideModal: this.hidePriceComparison,
      sourceCategory: header.sourceCategory,
      diyLadderQuotationFlag: header.diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
    };

    // 操作记录
    const operationRecordProps = {
      dispatch,
      organizationId,
      rfxHeaderId: header.rfxHeaderId,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
      pagination: operationPagination,
      dataSource: operationData,
    };

    return (
      <Fragment>
        <Header title={intl.get('ssrc.inquiryHall.view.message.title.bargainOnline').d('线上议价')}>
          <Button icon="clock-circle-o" type="default" onClick={this.playView}>
            {intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录')}
          </Button>
          <Button
            type="default"
            onClick={() => this.handleRenderPriceComparison(priceComparisonProps)}
          >
            <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </Button>
          <div className={styles['m-r-m']}>
            <Upload
              filePreview
              viewOnly
              bucketName={PRIVATE_BUCKET}
              attachmentUUID={header.bargainAttachmentUuid}
            />
          </div>
        </Header>
        <Content>
          {this.renderHeader()}
          <Tabs
            defaultActiveKey="allDetails"
            animated={false}
            onChange={this.changeActiveKey}
            activeKey={activeKey}
          >
            <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.tab.barginPriceDetail`).d('议价明细')}
              key="allDetails"
            >
              <FullQuoteDetails {...fullQuoteDetailsProps} />
            </TabPane>
            {/* <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.tab.supplierList`).d('供应商列表')}
              key="supplierList"
            >
              <SupplierList {...supplierListProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.tab.itemDetails`).d('物品明细')}
              key="itemDetails"
            >
              <ItemDetails {...itemDetailsProps} />
            </TabPane> */}
          </Tabs>
        </Content>
        {/* {priceComparisonModalVisible && <PriceComparison {...priceComparisonProps} />} */}
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </Fragment>
    );
  }
}

export default withStandardCompEnhancer(Bargain);
export { Bargain };
