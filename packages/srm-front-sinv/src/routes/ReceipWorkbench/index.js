import React, { Fragment, Component } from 'react';
import { DataSet, Table, Form, Lov, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { isEmpty, isString } from 'lodash';
import { stringify } from 'querystring';
import qs from 'qs';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  resetSearchBarCache,
  getSearchBarKey,
} from 'srm-front-boot/lib/components/SearchBarTable/util/cache';
import { Debounce } from 'lodash-decorators';
import withProps from 'utils/withProps';
import {
  fetchInit,
  fetchSendBackList,
  fetchTabDataList,
  modalPostCreate,
  print,
  newPrint,
  settlementOnChange,
  subAndDelete,
  handleTransferUser,
  handleBatchConfirmApi,
  handleBatchRejectApi,
  handleBatchRetryApi,
  handleCancelApi,
  handleReturnValidate,
  handleRevokeApprovalChange,
  handleReturnAllDataEventsChange,
} from '@/services/ReceipWorkbenchService';
// import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'hzero-front/lib/utils/remote';
import { listenAfterFreeHandler } from 'hzero-front/lib/utils/menuTab';
import { openApproveModal } from '_components/ApproveModal';
import { sendTableDS } from './modalDS';
import { waitTableDS } from './ThingReceipts/indexDS';
import { returnTableDS } from './ThingReceipts/returnIndexDS';
import { courseAsnTableDS, courseTableDS } from './ThingReceipts/courseIndexDS';
import { endAsnTableDS, endTableDS } from './ThingReceipts/endIndexDS';
import { waitConfirmTableDS, waitConfirmAsnTableDS } from './ThingReceipts/waitConfirmDs';
import { useDoubleUomConfig } from '@/routes/components/utils/index';
import TabShow from './withTab';
import { c7nModal } from '../components/CustomSpecsModal';
import { confirm, getCustomizeCode, getCustomizeBtnCodes } from './util';
import { globalPrint } from '../components/utils';
import ExecutionRecordDetail from '@/routes/components/ExecutionRecordDetail';
import AbnormalOperationRecord from './components/AbnormalOperationRecord';
import BtnComps from './btnComp';

const organizationId = getCurrentOrganizationId();

@useDoubleUomConfig()
// @WithCustomize({ manualQuery: true })
@formatterCollections({
  code: [
    'sinv.receiptExecution',
    'sinv.receiptWorkbench',
    'hzero.common',
    'sinv.purchaserDelivery',
    'slod.deliveryWorkbench',
    'entity.company',
    'sinv.receipWork',
    'sinv.common',
  ],
})
@remote(
  {
    code: 'SINV_PRLIST_REMOTE',
    name: 'docManageRemote',
  },
  {
    events: {
      cuxHandleCreate() {}, // 二开执行创建按钮逻辑
      beforeMultipleSearch() {},
    },
  }
)
@withProps(
  (props) => {
    const { docManageRemote } = props;
    const cacheTab = new Map();
    const sendTableDs = new DataSet(sendTableDS());
    const waitTableDs = new DataSet(
      docManageRemote
        ? docManageRemote.process('SINV_PRLIST_REMOTE_PROCESS_WAIT_DS', waitTableDS(), { props })
        : waitTableDS()
    );
    const courseTableDs = new DataSet(courseTableDS());
    const courseAsnTableDs = new DataSet(courseAsnTableDS());
    const waitConfirmTableDs = new DataSet(waitConfirmTableDS());
    const waitConfirmAsnTableDs = new DataSet(waitConfirmAsnTableDS());
    const endTableDs = new DataSet(endTableDS());
    const endAsnTableDs = new DataSet(endAsnTableDS());
    const returnTableDs = new DataSet(returnTableDS());
    const custTabParams = {
      one: {},
      two: {},
      three: {},
      four: {},
      five: {},
    };
    return {
      history,
      cacheTab,
      sendTableDs,
      waitTableDs,
      courseTableDs,
      courseAsnTableDs,
      waitConfirmTableDs,
      waitConfirmAsnTableDs,
      endTableDs,
      endAsnTableDs,
      returnTableDs,
      custTabParams,
    };
  },
  { cacheState: true }
)
export default class Summarizing extends Component {
  constructor(props) {
    super(props);
    const {
      cacheTab,
      sendTableDs,
      waitTableDs,
      courseTableDs,
      courseAsnTableDs,
      waitConfirmTableDs,
      waitConfirmAsnTableDs,
      endTableDs,
      endAsnTableDs,
      returnTableDs,
    } = this.props;
    const { from, courseAsLine, viewType, search } = this.props?.location || {};
    const {
      defaultTabIndex,
      base,
      origin,
      displaySupplierName,
      tempKey,
      rcvTrxTypeId,
      rcvTrxTypeName,
      finishedDate,
      trxDate,
      invOrganizationId,
      organizationName,
    } = qs.parse(search.substr(1));
    this.sendTableDs = sendTableDs;
    this.waitTableDs = waitTableDs;
    this.courseTableDs = courseTableDs;
    this.courseAsnTableDs = courseAsnTableDs;
    this.waitConfirmTableDs = waitConfirmTableDs;
    this.waitConfirmAsnTableDs = waitConfirmAsnTableDs;
    this.endTableDs = endTableDs;
    this.endAsnTableDs = endAsnTableDs;
    this.returnTableDs = returnTableDs;

    this.state = {
      origin,
      defaultTabIndex, // 接收返回消息卡片路由 中定位tab字段
      base,
      from,
      nodeFlag: false,
      ceationLoading: false,
      asyncLoading: false,
      selectName: undefined,
      tabCutPage:
        defaultTabIndex ||
        (origin === '1' && 'two') ||
        (origin === 'EvaluationFileManagement' && 'three') ||
        cacheTab.get('key') ||
        base ||
        from ||
        'one', // origin来源卡片
      viewType: origin === 'EvaluationFileManagement' ? 'flat' : viewType || 'flat',
      courseAsLine: courseAsLine || false, // 收货中按行或按单,默认为按单
      nodeConfigIndexAbc: 'K',
      nodeData: '', // 判断当前节点
      tabClause: {
        waitingCount: 0,
        doingCount: 0,
        reverseCount: 0,
        finishedCount: 0,
        confirmCount: 0,
      },
      batchMaintains: [],
      customParams: {}, // 筛选器查询参数
      isFromSupplierParams: {
        displaySupplierName,
        tempKey,
        rcvTrxTypeId,
        rcvTrxTypeName,
        finishedDate: finishedDate && finishedDate.split(','),
        trxDate: trxDate && trxDate.split(','),
        invOrganizationId,
        organizationName,
      },
    };
  }

  /**
   * Ds汇总
   * */
  getCurrentDs = () => {
    const { tabCutPage, viewType, courseAsLine } = this.state;
    let currentDs;
    switch (tabCutPage) {
      case 'one':
        currentDs = this.waitTableDs;
        break;
      case 'two':
        if (courseAsLine) {
          currentDs = this.courseAsnTableDs;
        } else {
          currentDs = this.courseTableDs;
        }
        break;
      case 'three':
        if (viewType === 'flat') {
          currentDs = this.endTableDs;
        } else {
          currentDs = this.endAsnTableDs;
        }
        break;
      case 'four':
        currentDs = this.returnTableDs;
        break;
      case 'five':
        if (courseAsLine) {
          currentDs = this.waitConfirmAsnTableDs;
        } else {
          currentDs = this.waitConfirmTableDs;
        }
        break;
      default:
        currentDs = this.waitTableDs;
        break;
    }
    return currentDs;
  };

  /**
   * 个性化单元汇总
   * */
  custCode = () => {
    const { nodeConfigIndexAbc, tabCutPage, viewType, courseAsLine } = this.state;
    let code;
    switch (tabCutPage) {
      case 'one':
        code = `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.WAIT_SEARCH`;
        break;
      case 'two':
        if (courseAsLine) {
          code = `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`;
        } else {
          code = `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`;
        }
        break;
      case 'five':
        if (courseAsLine) {
          code = `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`;
        } else {
          code = `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`;
        }
        break;
      case 'three':
        if (viewType === 'flat') {
          code = `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.END_SEARCH`;
        } else {
          code = `SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.END_SEARCH`;
        }
        break;
      case 'four':
        code = `SINV.RECEIPT_WORKBENCH_THING.RETURN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_SEARCH`;
        break;
      default:
        code = `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.WAIT_SEARCH`;
        break;
    }
    return code;
  };

  componentDidMount() {
    const { nodeConfigId } = this.state;
    // const { cacheTab } = this.props;
    listenAfterFreeHandler('moduleCustomize', 'refresh', ({ tabKey }) => {
      // 清理刷新时候的缓存
      if (tabKey === '/sinv/receipt-workbench/list') {
        window._withPropsCache.delete('/sinv/receipt-workbench/list');
      }
    });
    // const _arr = [...getCustomizeBtnCodes(), ...getCustomizeCode(tabCutPage)];
    // this.props.queryUnitConfig(undefined, null, _arr);
    // this.props.queryUomConfig();
    const currentDs = this.getCurrentDs();
    // currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
    // currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
    const custCode = this.custCode();
    this.init();
    this.fetchTabData();
    currentDs.setQueryParameter('params', {
      // allSource: cacheTab.get('allSource'),
      nodeConfigId,
      customizeUnitCode: custCode,
    });
    // if (_back === -1) {
    //   currentDs.query(currentDs.currentPage);
    // } else {
    //   currentDs.query();
    // }

    // currentDs?.queryDataSet?.current?.set({
    //   allSource: cacheTab.get('allSource')
    //     ? cacheTab
    //         .get('allSource')
    //         .map((ele) => ele.trim().replace(/\s+/g, ','))
    //         .join(',')
    //     : undefined,
    // });
  }

  /** ************************************************ 事件方法 *********************************************************** */

  /**
   * 清除勾选的数据缓存公共方法
   * */
  clearSelectListChange = () => {
    const currentDs = this.getCurrentDs();
    currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
    currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
  };

  /**
   * 事务-下拉框值集查询
   * */
  init = () => {
    fetchInit().then((res) => {
      if (Array.isArray(res) && res.length) {
        this.setState({
          batchMaintains: res, // 下拉菜单的值集
        });
      }
    });
  };

  /**
   * 事务-Tab栏条目查询
   * */
  fetchTabData = (id) => {
    getResponse(fetchTabDataList({ nodeConfigId: id })).then((res) => {
      if (getResponse(res)) {
        this.setState({
          tabClause: {
            waitingCount: res?.waitingCount > 99 ? '99+' : res?.waitingCount,
            doingCount: res?.doingCount > 99 ? '99+' : res?.doingCount,
            finishedCount: res?.finishedCount > 99 ? '99+' : res?.finishedCount,
            reverseCount: res?.reverseCount > 99 ? '99+' : res?.reverseCount,
            confirmCount: res?.confirmCount > 99 ? '99+' : res?.confirmCount,
          },
        });
      }
    });
  };

  selectChoiceRender = (e) => {
    this.setState({
      selectName: e,
    });
  };

  /**
   * 事务-下拉框节点选择-查询对应节点数据
   * */
  selectedChange = (record, flag = false) => {
    const _obj = {
      one: 'SINV.RECEIPT_WORKBENCH_THING.WAIT_SEARCH',
      two: 'SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH',
      three: 'SINV.RECEIPT_WORKBENCH_THING.END_SEARCH',
      four: 'SINV.RECEIPT_WORKBENCH_THING.RETURN_SEARCH',
      five: 'SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH',
    };
    const { tabCutPage } = this.state;
    const nodeConfigId = parseFloat((record || []).slice(1)) || null;
    const nodeConfigIndexAbc = (record && (record || []).slice(0, 1)) || 'K';
    this.setState({
      selectName: nodeConfigId ? record : undefined,
      nodeFlag: !!nodeConfigId,
      nodeConfigId: nodeConfigId && nodeConfigId,
      nodeConfigIndexAbc: (nodeConfigId && nodeConfigIndexAbc) || 'K',
    });
    if (!flag) {
      const _arr = [...getCustomizeBtnCodes(tabCutPage), ...getCustomizeCode(tabCutPage)];
      this.props.queryUnitConfig(undefined, null, _arr);
      this.props.queryUomConfig();
      resetSearchBarCache(_obj[tabCutPage], getSearchBarKey(_obj[tabCutPage]), true);
    }
  };

  // 多条件查询
  multipleSearch = (params) => {
    const {
      nodeConfigId,
      nodeConfigIndexAbc,
      tabCutPage,
      viewType,
      courseAsLine,
      customParams,
    } = this.state;
    const { docManageRemote } = this.props;
    if (docManageRemote?.event) {
      docManageRemote.event.fireEvent('beforeMultipleSearch', { that: this });
    }
    if (tabCutPage === 'one') {
      this.waitTableDs.setQueryParameter('params', {
        ...params,
        ...customParams,
        nodeConfigId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.WAIT_SEARCH`,
      });
      this.waitTableDs.query();
    } else if (tabCutPage === 'two' && !courseAsLine) {
      this.courseTableDs.setQueryParameter('params', {
        ...params,
        ...customParams,
        nodeConfigId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`,
      });
      this.courseTableDs.query();
    } else if (tabCutPage === 'two' && courseAsLine) {
      // TODO: 按单的个性化
      this.courseAsnTableDs.setQueryParameter('params', {
        ...params,
        ...customParams,
        nodeConfigId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.END_SEARCH,SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`,
      });
      this.courseAsnTableDs.query();
    } else if (tabCutPage === 'three' && viewType === 'flat') {
      this.endTableDs.setQueryParameter('params', {
        ...params,
        ...customParams,
        nodeConfigId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.END_SEARCH,SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc}`,
      });
      this.endTableDs.query();
    } else if (tabCutPage === 'three' && viewType !== 'flat') {
      this.endAsnTableDs.setQueryParameter('params', {
        ...params,
        ...customParams,
        nodeConfigId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.END_SEARCH,SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc}`,
      });
      this.endAsnTableDs.query();
    } else if (tabCutPage === 'four') {
      this.returnTableDs.setQueryParameter('params', {
        // TODO:
        ...params,
        ...customParams,
        nodeConfigId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN_SEARCH,SINV.RECEIPT_WORKBENCH_THING.RETURN.${nodeConfigIndexAbc}`,
      });
      this.returnTableDs.query();
    } else if (tabCutPage === 'five' && !courseAsLine) {
      this.courseTableDs.setQueryParameter('params', {
        ...params,
        ...customParams,
        nodeConfigId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`,
      });
      this.courseTableDs.query();
    } else if (tabCutPage === 'five' && courseAsLine) {
      // TODO: 按单的个性化
      this.courseAsnTableDs.setQueryParameter('params', {
        ...params,
        ...customParams,
        nodeConfigId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH,SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${nodeConfigIndexAbc}`,
      });
      this.courseAsnTableDs.query();
    }
  };

  /**
   * 事务-切换tab时获取对应的key值
   * */
  tabSelectChange = (tabKey) => {
    const { nodeConfigId, nodeConfigIndexAbc } = this.state;
    const { cacheTab } = this.props;
    cacheTab.set('key', tabKey);
    this.setState(
      {
        tabCutPage: tabKey,
        customParams: {},
        origin: '2',
      },
      () => {
        this.selectedChange(`${nodeConfigIndexAbc}${nodeConfigId}`, true);
        // this.props.queryUnitConfig(undefined, null, getCustomizeCode(tabKey));
        // this.props.queryUomConfig();
      }
    );
  };

  /*
   *按事务-创建按钮显示内容
   */
  creationButton = (flag) => {
    const { nodeConfigId } = this.state;
    if (flag) {
      this.showModal(nodeConfigId, flag);
    } else {
      confirm({
        content: intl
          .get(`sinv.receiptWorkbench.model.receipt.createAllMessage`)
          .d('确认要全选创建吗？确定后，将会引用【待收货】页面所有数据创建收货单'),
        onOk: () => this.showModal(nodeConfigId, flag),
        // okCancel
      });
    }
  };

  handleCuxLoading = (loading) => {
    this.setState({ ceationLoading: loading });
  };

  /*
   *创建按钮 - 事务
   */
  showModal = async (nodeConfigId, flag) => {
    const { history, docManageRemote } = this.props;
    const { nodeConfigIndexAbc } = this.state;
    const dataQueryDs = this.waitTableDs;
    // 勾选获取参数
    const List = dataQueryDs.selected
      .map((item) => item.toJSONData())
      .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    // 全选获取参数
    // TODO 后端逻辑局限导致前端必须要做双重判断 先使用数据自带的nodeConfigIndexAbc 如果没有再使用转化的 index
    const configListAbc =
      dataQueryDs &&
      dataQueryDs.data?.length > 0 &&
      dataQueryDs.data.map((item) => item.toData())[0]?.nodeConfigIndexAbc;
    const nodeConfigIndex =
      dataQueryDs &&
      dataQueryDs.data?.length > 0 &&
      dataQueryDs.data.map((item) => item.toData())[0]?.nodeConfigIndex;
    const index = String.fromCharCode(65 + nodeConfigIndex);
    // 判断勾选还是全选
    const configIndexAbc = !isEmpty(List) ? List[0]?.nodeConfigIndexAbc : configListAbc || index;
    // const nodeAbc = isNil(configIndexAbc) ? null : configListAbc;
    const queryData =
      dataQueryDs.queryDataSet?.toData().length && dataQueryDs.queryDataSet?.toData()[0];
    const queryParams = filterNullValueObject({
      ...dataQueryDs?.queryParameter.params,
      ...queryData,
    });
    // 全选创建参数
    const allCreationParams = {
      queryParams,
      nodeConfigId,
      urlType: flag,
    };
    // 正常创建参数
    const nodeCreationParams = {
      nodeConfigId,
      sourceList: List,
      urlType: flag,
    };
    // const indexAbc = flag ? nodeConfigIndexAbc : configListAbc;
    const params = filterNullValueObject(flag ? nodeCreationParams : allCreationParams);
    if (docManageRemote?.event && !flag) {
      const eventProps = {
        params,
        dataQueryDs,
        nodeCode: configIndexAbc || nodeConfigIndexAbc,
        setLoading: this.handleCuxLoading,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await docManageRemote.event.fireEvent('cuxHandleCreate', eventProps);
      if (!res && !flag) {
        return;
      }
    }

    this.setState({ ceationLoading: true });
    // 调创建接口
    modalPostCreate(params).then((rec) => {
      if (getResponse(rec)) {
        if (rec?.length > 1) {
          notification.success();
          this.clearSelectListChange();
          history.push({
            pathname: `/sinv/receipt-workbench/merge-detail`,
            search: `type=SOURCE&nodeConfigIndexAbc=${
              configIndexAbc || nodeConfigIndexAbc
            }&cacheKey=${rec[0].cacheKey}`,
          });
          this.setState({ ceationLoading: false });
        } else {
          if (rec.length === 0) {
            const currentDs = this.getCurrentDs();
            const custCode = this.custCode();
            currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
            currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
            currentDs.setQueryParameter('params', {
              nodeConfigId,
              customizeUnitCode: custCode,
            });
            currentDs.query();
            this.setState({ ceationLoading: false });
            return notification.warning({
              message: intl
                .get(`sinv.receiptWorkbench.model.receipt.moreSelectedData`)
                .d('当前执行数量超过预置数量'),
            });
          }
          rec.forEach((element) => {
            notification.success();
            dataQueryDs.clearCachedSelected();
            dataQueryDs.unSelectAll();
            history.push({
              pathname: `/sinv/receipt-workbench/detail/${element.rcvTrxHeaderId}`,
              search: `type=SOURCE&nodeConfigIndexAbc=${configIndexAbc || nodeConfigIndexAbc}`,
            });
          });
        }
      } else {
        this.setState({ ceationLoading: false });
      }
    });
  };

  /*
   *事务-已收货-退货策略节点弹框
   */
  handleSendBackOk = () => {
    return new Promise((resolve) => {
      const { selected } = this.returnTableDs;
      const sendTableLength = this.sendTableDs.selected.map((i) => i.toData());
      if (sendTableLength.length !== 0) {
        const { history } = this.props;
        const { nodeConfigIndexAbc } = this.state;
        const selectedRecords = selected.map((item) => item.toData());
        // TODO 后端逻辑局限导致前端必须要做双重判断 先使用数据自带的nodeConfigIndexAbc 如果没有再使用转化的 index
        const configIndexAbc = selected[0].get('nodeConfigIndexAbc');
        const nodeConfigIndex = selected[0].get('nodeConfigIndex');
        const index = String.fromCharCode(65 + nodeConfigIndex);
        const sendRecords = this.sendTableDs.selected;
        const { rcvTrxTypeId, nodeConfigId } =
          sendRecords[0]?.get(['rcvTrxTypeId', 'nodeConfigId']) ?? {};
        const params = filterNullValueObject({
          rcvTrxTypeId,
          nodeConfigId,
          selectedRecords,
        });
        getResponse(fetchSendBackList(params)).then((res) => {
          if (res && !res.type) {
            if (isEmpty(res)) {
              notification.warning({
                message: intl
                  .get(`sinv.receiptWorkbench.model.receipt.moreSelectedDataTuihuo`)
                  .d('当前执行数量超过预置数量'),
              });
              this.returnTableDs.query();
            } else {
              history.push({
                pathname: `/sinv/receipt-workbench/return-detail/${res.rcvTrxHeaderId}`,
                search: `type=END&nodeConfigIndexAbc=${
                  configIndexAbc || index || nodeConfigIndexAbc
                }`,
              });
            }
            this.clearSelectListChange();
            resolve();
          } else {
            notification.error({
              message: res?.message,
            });
            resolve(false);
          }
        });
      } else {
        notification.warning({
          message: intl
            .get(`sinv.receiptWorkbench.model.receipt.sendBackNoData`)
            .d('请选择一条数据！'),
        });
        resolve(false);
      }
    });
  };

  // 待确认列表按钮操作
  handleAffirm = (type) => {
    const sinvRcvTrxHeaderDTO = this.waitConfirmTableDs.selected.map((item) => item.toJSONData());
    const handleQuery = () => {
      const currentDs = this.getCurrentDs();
      const custCode = this.custCode();
      currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
      currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
      const { nodeConfigId, customParams } = this.state;
      currentDs.setQueryParameter('params', {
        ...customParams,
        nodeConfigId,
        customizeUnitCode: custCode,
      });
      currentDs.query();
    };

    const tips = sinvRcvTrxHeaderDTO
      .map(
        (i) =>
          `${i.returnedFlagMeaning}${intl
            .get('sinv.receiptExecution.view.message.bills')
            .d(`单`)}[${i.displayTrxNum}]`
      )
      .join('/');
    confirm({
      content:
        type === '30_SUP_REJECTED'
          ? `${intl
              .get(`sinv.receiptExecution.view.message.refuseTip`)
              .d(`确定要拒绝单据`)}${tips}?`
          : `${intl
              .get(`sinv.receiptExecution.view.message.confirmTip`)
              .d(`确定要确认单据`)}${tips}?`,
      onOk: async () => {
        this.setState({ subAndDeleteLoading: true });
        if (type === '30_SUP_REJECTED') {
          handleBatchRejectApi(sinvRcvTrxHeaderDTO)
            .then((res) => {
              if (getResponse(res) && !res.failed) {
                notification.success();
                handleQuery();
                this.setState({ subAndDeleteLoading: false });
              }
            })
            .finally(() => {
              this.setState({ subAndDeleteLoading: false });
            });
        } else {
          handleBatchConfirmApi(sinvRcvTrxHeaderDTO)
            .then((res) => {
              if (getResponse(res) && !res.failed) {
                notification.success();
                handleQuery();
                this.setState({ subAndDeleteLoading: false });
              }
            })
            .finally(() => {
              this.setState({ subAndDeleteLoading: false });
            });
        }
      },
      okCancel: () => {
        this.setState({ subAndDeleteLoading: false });
      },
    });
  };

  /*
   *收货中提交删除 - 事务
   */
  subAndDelChange = (type) => {
    const { nodeConfigIndexAbc } = this.state;
    const selectedRecords = this.courseTableDs.selected
      .map((item) => item.toJSONData())
      .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    const data = {
      type,
      selectedRecords,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`,
    };
    if (type === '50_DELETED') {
      // 仅删除增添二次弹窗
      confirm({
        content: intl
          .get('sinv.receiptExecution.view.message.orderDelBills')
          .d(`确定要整单删除吗？`),
        onOk: async () => {
          const res = await getResponse(subAndDelete(data));
          if (res && res.type !== 'error' && res.type !== 'warn') {
            notification.success();
            this.courseTableDs.batchUnSelect(this.courseTableDs.selected.map((item) => item.id));
            this.clearSelectListChange();
            this.courseTableDs.query();
          } else {
            // 策略节点不同 提示
            notification.warning({
              message: res?.message,
            });
            this.courseTableDs.batchUnSelect(this.courseTableDs.selected.map((item) => item.id));
            this.courseTableDs.query();
          }
        },
      });
      return false;
    }

    const tips = selectedRecords
      .map(
        (i) =>
          `${i.returnedFlagMeaning}${intl
            .get('sinv.receiptExecution.view.message.bills')
            .d(`单`)}[${i.displayTrxNum}]`
      )
      .join('/');
    confirm({
      content: `${intl
        .get(`sinv.receiptExecution.view.message.submitTip`)
        .d(`确定要提交单据`)}${tips}?`,
      onOk: async () => {
        this.setState({ subAndDeleteLoading: true });
        getResponse(subAndDelete(data)).then((res) => {
          this.setState({ subAndDeleteLoading: false });
          if (Array.isArray(res) && res.some((i) => i.doAsynFlag === 1)) {
            notification.warning({
              message: intl
                .get('sinv.receiptExecution.view.message.showAysncTip')
                .d(
                  `当前执行行数量超过预置数量，程序转为后台执行，执行进度结果可前往【异步执行记录】按钮明细进行查看`
                ),
            });
            return false;
          }
          if (res && !res?.failed) {
            notification.success();
            this.courseTableDs.batchUnSelect(this.courseTableDs.selected.map((item) => item.id));
            this.clearSelectListChange();
            this.courseTableDs.query();
          } else {
            // 策略节点不同 提示
            notification.warning({
              message: res?.message,
            });
            this.courseTableDs.batchUnSelect(this.courseTableDs.selected.map((item) => item.id));
            this.courseTableDs.query();
          }
        });
      },
    });
  };

  sendBackShowModalChange = (type) => {
    if (type === 'select') {
      this.sendBackShowModal();
    }
    if (type === 'all') {
      const dataQueryDs = this.returnTableDs;
      const queryData =
        dataQueryDs.queryDataSet?.toData().length && dataQueryDs.queryDataSet?.toData()[0];
      const queryParams = filterNullValueObject({
        ...dataQueryDs?.queryParameter.params,
        ...queryData,
      });
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get(`sinv.receiptWorkbench.model.receipt.confirmAllReturn`)
          .d('确认要全选退货吗？确定后，将会引用【可退货】页面所有数据创建退货单。'),
        onOk: async () => {
          const res = await handleReturnValidate(queryParams, 'p');
          if (getResponse(res)) {
            this.sendBackAllChange(res);
            return true;
          }
          return false;
        },
      });
    }
  };

  /*
   * 已收货-退货事件-勾选退货
   */
  @Debounce(300)
  sendBackShowModal = () => {
    const { history } = this.props;
    const { nodeConfigIndexAbc } = this.state;
    const currentDs = this.getCurrentDs();
    const selectedRecords = currentDs.selected.map((item) => item.toData());
    const nodeConfigIndex = selectedRecords.map((item) => item?.nodeConfigIndex)[0];
    const index = String.fromCharCode(65 + nodeConfigIndex);
    // TODO 后端逻辑局限导致前端必须要做双重判断 先使用数据自带的nodeConfigIndexAbc 如果没有再使用转化的 index
    const configIndexAbc = selectedRecords.map((item) => item.nodeConfigIndexAbc)[0];
    const strategyLineIdsSet = selectedRecords.map((i) => i.strategyLineId);
    const strategyLineIds = [...new Set(strategyLineIdsSet)].join(',');
    const nodeConfigIdFlag = selectedRecords.every(
      (item) => selectedRecords[0].nodeConfigId === item.nodeConfigId
    ); // 判断多行勾选是否为同一策略
    this.setState({ sendBackLoading: true });
    if (selectedRecords.length > 1) {
      // 勾选退货数量大于1时，判断所勾选数据策略id是否相同，相同则进行下面逻辑，不同则提示用户
      if (nodeConfigIdFlag) {
        // 判断策略节点是否一致,相同则进行下面逻辑
        const nodeConfigIdList = [];
        selectedRecords.forEach((item) => {
          nodeConfigIdList.push(item.nodeConfigId);
        });
        this.sendTableDs.setQueryParameter('params', {
          nodeConfigId: nodeConfigIdList[0],
          tenantId: organizationId,
          strategyLineIds,
        });
        this.sendTableDs.query().then((res) => {
          if (!res?.content?.length) {
            const nodeConfig = currentDs.selected.map((i) => i.toData())[0]?.nodeConfigName;
            this.setState({ sendBackLoading: false });
            return notification.warning({
              message: `${intl
                .get(`sinv.receiptWorkbench.model.receipt.currentNode`)
                .d('节点')}[${nodeConfig}]${intl
                .get(`sinv.receiptWorkbench.model.receipt.reTry`)
                .d(
                  '未找到退货类型，请检查【收货管理配置】下对应节点的退货类型是否已维护完善后重试'
                )}`,
            });
          }
          if (res && res.content.length > 1) {
            // 策略节点数量大于1时， 打开策略弹框
            this.setState({
              sendBackLoading: false,
            });
            const sendBacklistProps = {
              dataSet: this.sendTableDs,
              columns: this.getSendColumns(),
              queryFieldsLimit: 2,
            };

            c7nModal({
              style: { width: 700 },
              afterClose: () => {
                this.sendTableDs.reset();
              },
              drawer: false,
              center: true,
              children: <Table {...sendBacklistProps} />,
              onOk: this.handleSendBackOk,
            });
          } else {
            // 策略节点数量小于等于1时，不显示策略弹框，直接提交退货数据
            const rcvTrxTypeId = res.content.map((n) => n.rcvTrxTypeId)[0];
            const nodeConfigId = res.content.map((n) => n.nodeConfigId)[0];
            const params = filterNullValueObject({
              rcvTrxTypeId,
              nodeConfigId,
              selectedRecords,
            });
            getResponse(fetchSendBackList(params))
              .then((endRes) => {
                if (endRes && !endRes.type) {
                  if (isEmpty(endRes)) {
                    notification.warning({
                      message: intl
                        .get(`sinv.receiptWorkbench.model.receipt.moreSelectedDataTuihuo`)
                        .d('当前执行数量超过预置数量'),
                    });
                    currentDs.query();
                  } else {
                    history.push({
                      pathname: `/sinv/receipt-workbench/return-detail/${endRes.rcvTrxHeaderId}`,
                      search: `type=END&nodeConfigIndexAbc=${
                        configIndexAbc || index || nodeConfigIndexAbc
                      }`,
                    });
                  }
                  this.clearSelectListChange();
                  this.setState({ sendBackLoading: false });
                } else {
                  this.setState({ sendBackLoading: false });
                  notification.error({
                    message: endRes?.message,
                  });
                }
              })
              .catch(() => {
                this.setState({ sendBackLoading: false });
              });
          }
        });
      } else {
        this.setState({ sendBackLoading: false });
        // 策略节点不同 提示
        notification.warning({
          message: intl
            .get(`sinv.receiptWorkbench.model.receipt.sendBackWarning`)
            .d('策略节点不一致，请重新选择！'),
        });
      }
    } else {
      // 勾选退货数量等于1时，判断策略节点数量
      selectedRecords.forEach((item) => {
        this.sendTableDs.setQueryParameter('params', {
          nodeConfigId: item.nodeConfigId,
          tenantId: organizationId,
          strategyLineIds,
        });
        this.sendTableDs.query().then((res) => {
          if (!res.content.length) {
            const nodeConfig = currentDs.selected.map((i) => i.toData())[0]?.nodeConfigName;
            this.setState({ sendBackLoading: false });
            return notification.warning({
              message: `${intl
                .get(`sinv.receiptWorkbench.model.receipt.currentNode`)
                .d('节点')}[${nodeConfig}]${intl
                .get(`sinv.receiptWorkbench.model.receipt.reTry`)
                .d(
                  '未找到退货类型，请检查【收货管理配置】下对应节点的退货类型是否已维护完善后重试'
                )}`,
            });
          }
          if (res && res.content.length > 1) {
            // 策略节点数量大于1时， 打开策略弹框
            this.setState({
              sendBackLoading: false,
            });
            const sendBacklistProps = {
              dataSet: this.sendTableDs,
              columns: this.getSendColumns(),
              queryFieldsLimit: 2,
            };

            c7nModal({
              drawer: false,
              style: { width: 700 },
              afterClose: () => {
                this.sendTableDs.reset();
              },
              center: true,
              children: <Table {...sendBacklistProps} />,
              onOk: this.handleSendBackOk,
            });
          } else if (res && res.content.length === 1) {
            // 策略节点数量小于等于1时，不显示策略弹框，直接提交退货数据
            const rcvTrxTypeId = res.content.map((n) => n.rcvTrxTypeId)[0];
            const nodeConfigId = res.content.map((n) => n.nodeConfigId)[0];
            const params = filterNullValueObject({
              selectedRecords,
              rcvTrxTypeId,
              nodeConfigId,
            });
            getResponse(fetchSendBackList(params))
              .then((endRes) => {
                if (endRes && !endRes.type) {
                  if (isEmpty(endRes)) {
                    notification.warning({
                      message: intl
                        .get(`sinv.receiptWorkbench.model.receipt.moreSelectedDataTuihuo`)
                        .d('当前执行数量超过预置数量'),
                    });
                    currentDs.query();
                  } else {
                    history.push({
                      pathname: `/sinv/receipt-workbench/return-detail/${endRes.rcvTrxHeaderId}`,
                      search: `type=END&nodeConfigIndexAbc=${
                        configIndexAbc || index || nodeConfigIndexAbc
                      }`,
                    });
                  }
                  this.setState({ sendBackLoading: false });
                  this.clearSelectListChange();
                } else {
                  this.setState({ sendBackLoading: false });
                  notification.error({
                    message: endRes?.message,
                  });
                }
              })
              .catch(() => {
                this.setState({ sendBackLoading: false });
              });
          } else {
            this.setState({ sendBackLoading: false });
            // 策略节点为空 提示
            notification.warning({
              message: intl
                .get(`sinv.receiptWorkbench.model.receipt.maintainCollocate`)
                .d('请在<收货管理配置>维护【退货类型】！'),
            });
          }
        });
      });
    }
  };

  sendBackAllChange = async (retparams) => {
    const { history } = this.props;
    const { nodeConfigIndexAbc } = this.state;
    const dataQueryDs = this.returnTableDs;
    const queryData =
      dataQueryDs.queryDataSet?.toData().length && dataQueryDs.queryDataSet?.toData()[0];
    const queryParams = filterNullValueObject({
      ...dataQueryDs?.queryParameter.params,
      ...queryData,
    });
    const selectedRecords = dataQueryDs.selected.map((item) => item.toData());
    const nodeConfigIndex = selectedRecords.map((item) => item?.nodeConfigIndex)[0];
    const configIndexAbc = selectedRecords.map((item) => item.nodeConfigIndexAbc)[0];
    const index = String.fromCharCode(65 + nodeConfigIndex);
    const sendBacklistProps = {
      dataSet: this.sendTableDs,
      columns: this.getSendColumns(),
      queryFieldsLimit: 2,
    };
    this.setState({ sendBackLoading: true });
    this.sendTableDs.setQueryParameter('params', {
      nodeConfigId: retparams.nodeConfigId,
      tenantId: organizationId,
      strategyLineIds: retparams.strategyLineId,
    });
    this.sendTableDs.query().then(async (result) => {
      if (result && result?.content?.length > 1) {
        c7nModal({
          drawer: false,
          style: { width: 700 },
          afterClose: () => {
            this.setState({ sendBackLoading: false });
            this.sendTableDs.reset();
          },
          center: true,
          children: <Table {...sendBacklistProps} />,
          onOk: async () => {
            const sendRecords = this.sendTableDs.selected;
            const sendTableLength = sendRecords.map((i) => i.toData());
            if (sendTableLength.length === 0) {
              notification.warning({
                message: intl
                  .get(`sinv.receiptWorkbench.model.receipt.sendBackNoData`)
                  .d('请选择一条数据！'),
              });
              return false;
            }
            const { rcvTrxTypeId, nodeConfigId } =
              sendRecords[0]?.get(['rcvTrxTypeId', 'nodeConfigId']) ?? {};
            const res = await handleReturnAllDataEventsChange(
              { rcvTrxTypeId, nodeConfigId },
              queryParams,
              'p'
            );
            if (getResponse(res)) {
              this.clearSelectListChange();
              this.setState({ sendBackLoading: false });
              if (isEmpty(res)) {
                notification.warning({
                  message: intl
                    .get(`sinv.receiptWorkbench.model.receipt.moreSelectedDataTuihuo`)
                    .d('当前执行数量超过预置数量'),
                });
                this.returnTableDs.query();
                return true;
              }
              history.push({
                pathname: `/sinv/receipt-workbench/return-detail/${res.rcvTrxHeaderId}`,
                search: `type=END&nodeConfigIndexAbc=${
                  configIndexAbc || index || nodeConfigIndexAbc
                }`,
              });
            } else {
              this.setState({ sendBackLoading: false });
            }
          },
        });
      }
      if (result && result?.content?.length === 1) {
        const rcvTrxTypeId = result?.content?.map((n) => n?.rcvTrxTypeId)[0];
        const nodeConfigId = result?.content?.map((n) => n?.nodeConfigId)[0];
        const res = await handleReturnAllDataEventsChange(
          { rcvTrxTypeId, nodeConfigId },
          queryParams,
          'p'
        );
        if (getResponse(res)) {
          this.clearSelectListChange();
          this.setState({ sendBackLoading: false });
          if (isEmpty(res)) {
            notification.warning({
              message: intl
                .get(`sinv.receiptWorkbench.model.receipt.moreSelectedDataTuihuo`)
                .d('当前执行数量超过预置数量'),
            });
            this.returnTableDs.query();
            return false;
          }
          history.push({
            pathname: `/sinv/receipt-workbench/return-detail/${res.rcvTrxHeaderId}`,
            search: `type=END&nodeConfigIndexAbc=${configIndexAbc || index || nodeConfigIndexAbc}`,
          });
        } else {
          this.setState({ sendBackLoading: false });
        }
      }
      if (result && result?.content?.length === 0) {
        this.setState({ sendBackLoading: false });
        notification.warning({
          message: intl
            .get(`sinv.receiptWorkbench.model.receipt.maintainCollocate`)
            .d('请在<收货管理配置>维护【退货类型】！'),
        });
      }
    });
  };

  /**
   * 打印功能
   */
  handlePrint = (record) => {
    const paramsList = record.map((item) => item.get('rcvTrxHeaderId'));
    this.setState({ subAndDeleteLoading: true });
    getResponse(print(paramsList)).then((res) => {
      const func = () => {
        const currentDs = this.getCurrentDs();
        currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
        currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
        const custCode = this.custCode();
        const { nodeConfigId, tabCutPage } = this.state;
        if (tabCutPage === 'two') {
          this.init();
          this.fetchTabData();
          currentDs.setQueryParameter('params', {
            nodeConfigId,
            customizeUnitCode: custCode,
          });
          currentDs.query();
        }
      };
      globalPrint(res, func);
      this.setState({ subAndDeleteLoading: false });
    });
  };

  /**
   * 新版打印功能
   */
  handleNewPrint = (record) => {
    const paramsList = record.map((item) => item.get('rcvTrxHeaderId'));
    this.setState({ subAndDeleteLoading: true });
    getResponse(newPrint(paramsList)).then((res) => {
      const func = () => {
        const currentDs = this.getCurrentDs();
        currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
        currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
        const custCode = this.custCode();
        const { nodeConfigId, tabCutPage } = this.state;
        if (tabCutPage === 'two') {
          this.init();
          this.fetchTabData();
          currentDs.setQueryParameter('params', {
            nodeConfigId,
            customizeUnitCode: custCode,
          });
          currentDs.query();
        }
      };
      globalPrint(res, func);
      this.setState({ subAndDeleteLoading: false });
    });
  };

  /**
   * 切换视图
   */
  handleChangeStatus = (type) => {
    this.setState({
      viewType: type,
      nodeConfigId: null,
      nodeConfigIndexAbc: 'K',
      selectName: undefined,
    });
  };

  /**
   * 切换执行中按行或者按单
   */
  handleChangeCourseStatus = (courseAsLine) => {
    this.setState({
      courseAsLine,
      nodeConfigId: null,
      nodeConfigIndexAbc: 'K',
      selectName: undefined,
    });
  };

  sreachBarQuery = (param, type) => {
    const { nodeConfigId, nodeConfigIndexAbc, viewType, courseAsLine } = this.state;
    if (type === 'RETURN') {
      this.returnTableDs.setQueryParameter('params', {
        ...param,
        nodeConfigId,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_SEARCH`,
      });
      this.returnTableDs.query();
    } else if (type === 'FINISHED') {
      if (viewType === 'flat') {
        this.endTableDs.setQueryParameter('params', {
          ...param,
          nodeConfigId,
          customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.END_SEARCH`,
        });
        this.endTableDs.query();
      } else {
        this.endAsnTableDs.setQueryParameter('params', {
          ...param,
          nodeConfigId,
          customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.END_SEARCH,SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc}`,
        });
        this.endAsnTableDs.query();
      }
    } else if (type === 'DOING') {
      // courseAsLine true 按行 false 按单  //TODO 切换单行保留查询条件
      const currentDS = courseAsLine ? this.courseAsnTableDs : this.courseTableDs;
      const currentUnitCode = courseAsLine
        ? `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`
        : `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`;
      currentDS.setQueryParameter('params', {
        ...param,
        nodeConfigId,
        customizeUnitCode: currentUnitCode,
      });
      currentDS.query();
    } else if (type === 'CONFIRM') {
      // courseAsLine true 按行 false 按单  //TODO 切换单行保留查询条件
      const currentDS = courseAsLine ? this.waitConfirmAsnTableDs : this.waitConfirmTableDs;
      const currentUnitCode = courseAsLine
        ? `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`
        : `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`;
      currentDS.setQueryParameter('params', {
        ...param,
        nodeConfigId,
        customizeUnitCode: currentUnitCode,
      });
      currentDS.query();
    }
    this.setState({
      customParams: { ...param },
    });
  };

  /*
   *已完成-重新同步
   */

  synchronousButton = async (type, selected) => {
    this.setState({ asyncLoading: true });
    const currentDs = this.getCurrentDs();
    const data = selected.map((item) => item.toData());
    const res = await settlementOnChange({ data, type });
    if (res && res.type !== 'error') {
      this.setState({ asyncLoading: false });
      notification.info({
        message: intl
          .get(`sinv.common.view.message.lookOver`)
          .d('正在重新同步结算/外部系统，请稍后查看导出结果'),
      });
      currentDs.query();
    } else {
      this.setState({ asyncLoading: false });
      notification.error({
        message: res?.message,
      });
    }
  };

  /** ************************************************ 路由跳转 *********************************************************** */

  /*
   *收货中-跳转收货明细页面
   */
  courseToDetail = (record, type, page, isFromTrx) => {
    const { history } = this.props;
    const {
      data: { fromRcvTrxHeaderId, nodeConfigIndex, nodeConfigIndexAbc, rcvTrxHeaderId },
    } = record;
    const id = isFromTrx ? fromRcvTrxHeaderId : rcvTrxHeaderId;
    const index = String.fromCharCode(65 + nodeConfigIndex);
    const params = filterNullValueObject({
      type,
      ...page,
      nodeConfigIndexAbc: nodeConfigIndexAbc || index,
      isFromTrx,
    });
    history.push({
      pathname: `/sinv/receipt-workbench/detail/${id}`,
      search: stringify(params),
    });
  };

  /*
   *已完成-跳转收货明细页面
   */
  endToDetail = (record, type, page, isFromTrx) => {
    const { history } = this.props;
    const {
      data: { fromRcvTrxHeaderId, nodeConfigIndex, nodeConfigIndexAbc, rcvTrxHeaderId },
    } = record;
    const id = isFromTrx ? fromRcvTrxHeaderId : rcvTrxHeaderId;
    const index = String.fromCharCode(65 + nodeConfigIndex);
    const params = filterNullValueObject({
      type,
      ...page,
      nodeConfigIndexAbc: nodeConfigIndexAbc || index,
      isFromTrx,
    });
    history.push({
      pathname: `/sinv/receipt-workbench/return-detail/${id}`,
      search: stringify(params),
    });
  };

  /**
   * 跳转详情
   * @param {type,others} type:类型包括PO/PC/ASN...,record:数据,others
   */
  commonToDetail = (type, record, others = {}) => {
    let pathname;
    let search;
    let jumpFlag;
    const rowData = record.toData();
    const { history } = this.props;
    // const { nodeConfigIndexAbc } = this.state;
    switch (type) {
      case 'PO': {
        const { fromPoHeaderId, poSourcePlatform } = rowData;
        jumpFlag = fromPoHeaderId;
        pathname = `/sodr/send-order/detail/${fromPoHeaderId}`;
        search = poSourcePlatform ? stringify({ poSourcePlatform }) : stringify({});
        break;
      }
      case 'PC': {
        const { fromPcHeaderId } = rowData;
        jumpFlag = fromPcHeaderId;
        pathname = `/spcm/purchase-contract-view/detail`;
        search = fromPcHeaderId ? stringify({ pcHeaderId: fromPcHeaderId }) : stringify({});
        break;
      }
      case 'ASN': {
        const { fromAsnHeaderId, printStatusFlag } = rowData;
        jumpFlag = fromAsnHeaderId;
        pathname = `/sinv/purchaser-delivery/detail/${fromAsnHeaderId}`;
        search = printStatusFlag ? stringify({ printStatusFlag }) : stringify({});
        break;
      }
      case 'TRX': {
        const { returnedFlag, fromReturnedFlag } = rowData;
        const { detailType, from, courseAsLine, viewType, isFromTrx } = others;
        // jumpFlag = rcvTrxHeaderId;
        const page = filterNullValueObject({
          from,
          courseAsLine,
          viewType,
        });

        if (isFromTrx) {
          // 来源参考凭证号跳转 fromDisplayTrxNum
          return fromReturnedFlag && Number(fromReturnedFlag) === 1
            ? this.endToDetail(record, detailType, page, isFromTrx)
            : this.courseToDetail(record, detailType, page, isFromTrx);
        }
        if (returnedFlag) {
          this.endToDetail(record, detailType, page, isFromTrx);
        } else {
          this.courseToDetail(record, detailType, page, isFromTrx);
        }

        break;
      }
      case 'FIVE': {
        const { returnedFlag, fromReturnedFlag } = rowData;
        const { detailType, from, courseAsLine, viewType, isFromTrx } = others;
        // jumpFlag = rcvTrxHeaderId;
        const page = filterNullValueObject({
          from,
          courseAsLine,
          viewType,
        });
        if (isFromTrx) {
          // 来源参考凭证号跳转 fromDisplayTrxNum
          return fromReturnedFlag && Number(fromReturnedFlag) === 1
            ? this.endToDetail(record, detailType, page, isFromTrx)
            : this.courseToDetail(record, detailType, page, isFromTrx);
        }
        if (returnedFlag) {
          this.endToDetail(record, detailType, page, isFromTrx);
        } else {
          this.courseToDetail(record, detailType, page, isFromTrx);
        }

        break;
      }
      default:
        break;
    }
    if (jumpFlag) {
      history.push({
        pathname,
        search,
      });
    }
  };
  /** ************************************************ 列表字段 *********************************************************** */

  /*
   * 事务-modal-退货功能数据
   */
  getSendColumns = () => {
    const columns = [
      {
        name: 'rcvTypeCode',
        width: 170,
      },
      {
        name: 'rcvTypeName',
        width: 170,
      },
      {
        name: 'nodeConfigName',
        width: 170,
      },
    ];
    return columns;
  };

  handleToOperation = () => {
    c7nModal({
      title: intl
        .get('sinv.receiptWorkbench.view.button.AbnormalOperationRecord')
        .d('异常操作记录'),
      style: { width: '1090px' },
      resizable: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <AbnormalOperationRecord />,
    });
  };

  handleToDetail = (cuxPageTag, othersProps) => {
    const { tabCutPage } = this.state;
    const { cuxTitle } = othersProps || {};
    const { docManageRemote } = this.props;
    const params = {
      from: tabCutPage,
    };
    c7nModal({
      title:
        cuxTitle ||
        intl
          .get('sinv.receiptWorkbench.view.title.detail.executionRecordDetail')
          .d('异步执行记录明细'),
      style: { width: '742px' },
      resizable: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <ExecutionRecordDetail {...params} remote={docManageRemote} cuxPageTag={cuxPageTag} />
      ),
    });
  };

  handleRevoke = () => {
    this.setState({ subAndDeleteLoading: true });
    const sinvRcvTrxHeaderDTO = this.courseTableDs.selected.map((item) => item.toJSONData());
    const handleQuery = () => {
      const currentDs = this.getCurrentDs();
      const custCode = this.custCode();
      this.clearSelectListChange();
      const { nodeConfigId, customParams } = this.state;
      currentDs.setQueryParameter('params', {
        ...customParams,
        nodeConfigId,
        customizeUnitCode: custCode,
      });
      currentDs.query();
    };
    handleBatchRetryApi(sinvRcvTrxHeaderDTO)
      .then((res) => {
        if (getResponse(res) && !res.failed) {
          notification.success();
          handleQuery();
          this.setState({ subAndDeleteLoading: false });
        }
      })
      .finally(() => {
        this.setState({ subAndDeleteLoading: false });
      });
  };

  handleTransfer = () => {
    const ds = new DataSet({
      selection: false,
      forceValidate: true,
      autoCreate: true,
      fields: [
        {
          name: 'userId',
          type: 'object',
          lovCode: 'SPUC_LOV_USER',
          label: intl.get(`sinv.receiptWorkbench.model.receipt.userId`).d('收货人'),
          required: true,
        },
      ],
    });
    c7nModal({
      closable: true,
      onOk: async () => {
        const currentDs = this.getCurrentDs();
        const formFlag = await ds.validate();
        if (!formFlag || !ds.toJSONData().length) return false;
        const params = {
          id: ds.toJSONData()[0].userId.id,
          data: currentDs.selected
            .map((i) => i.toJSONData())
            .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })),
        };

        const res = await handleTransferUser(params);
        if (res && res.failed) return notification.error({ message: res?.message });
        const custCode = this.custCode();
        this.clearSelectListChange();
        const { nodeConfigId } = this.state;
        currentDs.setQueryParameter('params', {
          nodeConfigId,
          customizeUnitCode: custCode,
        });
        currentDs.query();
      },
      title: intl.get(`sinv.receiptWorkbench.model.receipt.handleTransferUserId`).d('收货人转交'),
      children: (
        <>
          <Form dataSet={ds}>
            <Lov name="userId" />
          </Form>
        </>
      ),
    });
  };

  handleCancel = async () => {
    this.setState({ asyncLoading: true });
    const currentDs = this.getCurrentDs();
    const params = currentDs.selected.map((i) => i.toData());
    const res = await handleCancelApi(params);
    if (getResponse(res)) {
      this.clearSelectListChange();
      notification.success({
        message: intl
          .get('sinv.receiptWorkbench.view.button.cancelOkTip')
          .d(
            '单据取消，又名反审核，用于删除单据并回滚上游单据的接收数量。该操作不可逆，成功后列表页将无法查询到。'
          ),
      });
      currentDs.query();
      this.setState({ asyncLoading: false });
    } else {
      this.setState({ asyncLoading: false });
    }
  };

  // 审批
  handleApprovalList = (_object) => {
    const currentDs = this.getCurrentDs();
    const { taskId, processInstanceId } = _object;
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess: () => {
        currentDs.query();
      },
    });
  };

  // 撤销审批
  handleRevokeApprovalList = ({ record }) => {
    const currentDs = this.getCurrentDs();
    const businessKey = record?.get('businessKey');
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
      children: (
        <div>
          <span>
            {intl
              .get('slod.deliveryWorkbench.view.message.revokeApprovalMessage')
              .d('是否确认撤销审批？撤销后您仍可在此提交发起审批（仅工作流审批发起人可执行撤销）')}
          </span>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const res = await handleRevokeApprovalChange({ businessKey });
        if (isString(res)) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: res,
          });
        } else if (res && !res.failed) {
          currentDs.query();
          notification.success({
            message: intl.get('hzero.common.notification.success').d('操作成功'),
            description: intl
              .get('slod.deliveryWorkbench.view.message.approvalSuccess')
              .d('撤销审批成功'),
          });
        }
      },
    });
  };

  /** ************************************************ 渲染 *********************************************************** */
  render() {
    const {
      history,
      isSlodConfig,
      custLoading,
      customizeTable,
      doubleUnitEnabled,
      cacheTab,
      docManageRemote,
    } = this.props;
    this.waitTableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.courseAsnTableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.courseTableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.endAsnTableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.endTableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.returnTableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.waitConfirmAsnTableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    this.waitConfirmTableDs.setState('doubleUnitEnabled', doubleUnitEnabled);
    const {
      base,
      viewType,
      courseAsLine,
      nodeFlag,
      nodeData,
      tabClause,
      selectName,
      tabCutPage,
      nodeConfigId,
      asyncLoading,
      batchMaintains,
      nodeConfigIndexAbc,
      isFromSupplierParams,
      from,
      defaultTabIndex,
      origin,
      ceationLoading,
      sendBackLoading,
      subAndDeleteLoading,
    } = this.state;
    console.log(docManageRemote);
    const btnProps = {
      viewType,
      remote: docManageRemote,
      tabCutPage,
      courseAsLine,
      isSlodConfig,
      asyncLoading,
      ceationLoading,
      sendBackLoading,
      subAndDeleteLoading,
      nodeConfigIndexAbc,
      handleRevoke: this.handleRevoke,
      handleCancel: this.handleCancel,
      creationButton: this.creationButton,
      handleToDetail: this.handleToDetail,
      handleTransfer: this.handleTransfer,
      handlePrint: this.handlePrint,
      handleAffirm: this.handleAffirm,
      subAndDelChange: this.subAndDelChange,
      handleToOperation: this.handleToOperation,
      synchronousButton: this.synchronousButton,
      sendBackShowModalChange: this.sendBackShowModalChange,
      queryUnitConfig: this.props.queryUnitConfig,
      customizeBtnGroup: this.props.customizeBtnGroup,
    };

    const listProps = {
      origin,
      history,
      nodeFlag,
      nodeData,
      cacheTab,
      viewType,
      selectName,
      asyncLoading,
      custLoading,
      nodeConfigId,
      courseAsLine,
      customizeTable,
      batchMaintains,
      docManageRemote,
      nodeConfigIndexAbc,
      doubleUnitEnabled,
      isFromSupplierParams,
      waitTableDs: this.waitTableDs,
      creationFetch: this.creationFetch,
      selectedChange: this.selectedChange,
      multipleSearch: this.multipleSearch,
      commonToDetail: this.commonToDetail,
      key: nodeConfigIndexAbc || undefined,
      courseTableDs: this.courseTableDs,
      courseAsnTableDs: this.courseAsnTableDs,
      sreachBarQuery: this.sreachBarQuery,
      handleChangeCourseStatus: this.handleChangeCourseStatus,
      courseToDetail: this.courseToDetail,
      waitConfirmTableDs: this.waitConfirmTableDs,
      waitConfirmAsnTableDs: this.waitConfirmAsnTableDs,
      endTableDs: this.endTableDs,
      endAsnTableDs: this.endAsnTableDs,
      endToDetail: this.courseToDetail, // 跳接收
      handleChangeStatus: this.handleChangeStatus,
      handleApprovalList: this.handleApprovalList,
      handleRevokeApprovalList: this.handleRevokeApprovalList,
      returnTableDs: this.returnTableDs,
      onRef: (node) => {
        this.indexListRef = node;
      },
    };

    const tabProps = {
      from,
      base,
      tabCutPage,
      listProps,
      defaultTabIndex,
      tabClause,
      tabSelectChange: this.tabSelectChange,
      changeTab: (key) => {
        this.setState(
          {
            tabCutPage:
              defaultTabIndex ||
              (origin === '1' && 'two') ||
              (origin === 'EvaluationFileManagement' && 'three') ||
              base ||
              from ||
              key ||
              tabCutPage ||
              'one',
          },
          () => {
            // this.props.queryUnitConfig('', '', getCustomizeCode(this.state.tabCutPage));
            this.props.queryUomConfig();
          }
        );
      },
    };
    return (
      <Fragment>
        <Header
          title={intl.get('sinv.receiptWorkbench.view.title.receipWorkbench').d('收货工作台')}
        >
          {/* {this.getBtns()} */}
          <BtnComps
            dataSet={this.getCurrentDs()}
            _btnObjs={btnProps}
            docManageRemote={docManageRemote}
          />
        </Header>
        <Content>
          <Fragment>
            <div>
              <TabShow {...tabProps} />
            </div>
          </Fragment>
        </Content>
      </Fragment>
    );
  }
}
