/* eslint-disable no-unused-expressions */
import React, { Fragment, Component } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
// import { Menu } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
// import { observer } from 'mobx-react-lite';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { stringify } from 'querystring';
import qs from 'qs';
import { Debounce } from 'lodash-decorators';
// import { Button as PermissionButton } from 'components/Permission';
// import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import withProps from 'utils/withProps';
import { openApproveModal } from '_components/ApproveModal';
import formatterCollections from 'utils/intl/formatterCollections';
import remoteFunc from 'hzero-front/lib/utils/remote';
// import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import {
  resetSearchBarCache,
  getSearchBarKey,
} from 'srm-front-boot/lib/components/SearchBarTable/util/cache';
import {
  fetchInit,
  modalSupplierPostCreate,
  subAndDelete,
  fetchSupplierTabDataList,
  fetchSendBackList,
  print,
  newPrint,
  settlementOnChange,
  handleBatchConfirmApi,
  handleBatchRejectApi,
  handleReturnValidate,
  handleSupplierRevokeApprovalApi,
  handleReturnAllDataEventsChange,
} from '@/services/ReceipWorkbenchService';
// import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
// import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { sendTableDS } from './modalDS';
import { waitTableDS } from './ThingReceipts/indexDS.ts';
import { returnTableDS } from './ThingReceipts/returnIndexDS.ts';
import { courseTableDS, courseAsnTableDS } from './ThingReceipts/courseIndexDS.ts';
import { endTableDS, endAsnTableDS } from './ThingReceipts/endIndexDS.ts';
import { confirm } from './util';
import { getCustomizeCode, getCustomizeBtnCodes } from '@/routes/components/utils/util';
import { useDoubleUomConfig } from '@/routes/components/utils/index';
import { c7nModal } from '../components/CustomSpecsModal';
import { waitConfirmTableDS, waitConfirmAsnTableDS } from './ThingReceipts/waitConfirmDs';
import WithTab from './withTab';
// import style from './index.less';
import { globalPrint } from '../components/utils';
import ExecutionRecordDetail from '@/routes/components/ExecutionRecordDetail';
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
    'entity.company',
    'sinv.receipWork',
    'sinv.common',
  ],
})
@withProps(
  () => {
    const cacheTab = new Map();
    const cacheNode = new Map();
    const sendTableDs = new DataSet(sendTableDS());
    const waitTableDs = new DataSet(waitTableDS());
    const courseTableDs = new DataSet(courseTableDS());
    const courseAsnTableDs = new DataSet(courseAsnTableDS());
    const waitConfirmTableDs = new DataSet(waitConfirmTableDS());
    const waitConfirmAsnTableDs = new DataSet(waitConfirmAsnTableDS());
    const endTableDs = new DataSet(endTableDS());
    const endAsnTableDs = new DataSet(endAsnTableDS());
    const returnTableDs = new DataSet(returnTableDS());
    return {
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
      cacheNode,
    };
  },
  { cacheState: true }
)
@remoteFunc(
  {
    code: 'SINV_PRLIST_REMOTE',
    name: 'remote',
  },
  {
    events: {
      cuxOnSubmit(eventProps) {
        const { onSubmit } = eventProps;
        if (onSubmit) {
          onSubmit();
        }
      }, // 二开批量提交按钮逻辑
    },
  }
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
      cacheNode,
    } = this.props;
    const { from, courseAsLine, viewType, search } = this.props?.location || {};
    const { origin } = qs.parse(search.substr(1));
    const nodeId = cacheNode.get('nodeId');
    const nodeConfigAbc = cacheNode.get('nodeConfigAbc') || 'K';
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
      from,
      nodeFlag: nodeConfigAbc !== 'K', // 判断是否为汇总节点
      ceationLoading: false,
      asyncLoading: false,
      selectName: nodeId ? `${nodeConfigAbc}${nodeId}` : undefined,
      tabCutPage: origin === '1' ? 'two' : cacheTab.get('key') || from || 'one', // origin为1来源工作卡片
      viewType: viewType || 'flat',
      courseAsLine: courseAsLine || false, // 收货中按行或按单,默认为按单
      nodeConfigIndexAbc: nodeConfigAbc || 'K',
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
      origin,
      nodeConfigId: nodeId,
    };
  }

  getCurrentDsOrCode = (type) => {
    const { nodeConfigIndexAbc, tabCutPage, viewType, courseAsLine } = this.state;
    let currentDs;
    let code;
    switch (tabCutPage) {
      case 'one':
        currentDs = this.waitTableDs;
        code = `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.WAIT_SEARCH`;
        break;
      case 'two':
        if (courseAsLine) {
          currentDs = this.courseAsnTableDs;
          code = `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`;
        } else {
          currentDs = this.courseTableDs;
          code = `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`;
        }
        break;
      case 'three':
        if (viewType === 'flat') {
          currentDs = this.endTableDs;
          code = `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH`;
        } else {
          currentDs = this.endAsnTableDs;
          code = `SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH`;
        }
        break;
      case 'four':
        currentDs = this.returnTableDs;
        code = `SINV.RECEIPT_WORKBENCH_THING.RETURN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.RETURN_SEARCH`;
        break;

      case 'five':
        if (courseAsLine) {
          currentDs = this.waitConfirmAsnTableDs;
          code = `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`;
        } else {
          currentDs = this.waitConfirmTableDs;
          code = `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`;
        }
        break;
      default:
        currentDs = this.waitTableDs;
        code = `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.WAIT_SEARCH`;
        break;
    }
    return type === 'code' ? code : currentDs;
  };

  componentDidMount() {
    const { nodeConfigId } = this.state;
    const currentDs = this.getCurrentDsOrCode();
    currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
    currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
    const custCode = this.getCurrentDsOrCode('code');
    this.init();
    currentDs.setQueryParameter('params', {
      nodeConfigId,
      customizeUnitCode: custCode,
    });
  }

  /**
   * 清除勾选的数据缓存公共方法
   * */
  clearSelectListChange = () => {
    const currentDs = this.getCurrentDsOrCode();
    currentDs?.clearCachedSelected(); // 初始化时清除缓存的勾选记录
    currentDs?.unSelectAll(); // 初始化时清除缓存的勾选记录
  };

  init = () => {
    fetchInit().then((res) => {
      if (Array.isArray(res) && res.length) {
        this.setState({
          batchMaintains: res, // 下拉菜单的值集
        });
      }
    });
    fetchSupplierTabDataList().then((res) => {
      if (res && Object.keys(res).length) {
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

  getCustomizeUnitCodes = (props) => {
    const { tabCutPage, nodeConfigIndexAbc, courseAsLine, viewType } = props;
    let customizeUnitCodes = null;
    switch (tabCutPage) {
      case 'one':
        customizeUnitCodes = `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.WAIT_SEARCH`;
        break;
      case 'two':
        customizeUnitCodes = courseAsLine
          ? `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`
          : `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`;
        break;
      case 'three':
        customizeUnitCodes =
          viewType === 'flat'
            ? `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH`
            : `SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH`;
        break;
      case 'four':
        customizeUnitCodes = `SINV.RECEIPT_WORKBENCH_THING.RETURN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.RETURN_SEARCH`;
        break;

      case 'five':
        customizeUnitCodes = courseAsLine
          ? `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`
          : `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`;
        break;
      default:
        customizeUnitCodes = `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.WAIT_SEARCH`;
        break;
    }
    return customizeUnitCodes;
  };

  // 下拉框节点选择
  selectedChange = (record, flag = false) => {
    const _obj = {
      one: 'SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.WAIT_SEARCH',
      two: 'SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH',
      three: 'SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH',
      four: 'SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.RETURN_SEARCH',
      five: 'SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH',
    };
    const { queryUnitConfig, queryUomConfig, cacheNode } = this.props;
    const { tabCutPage, viewType, courseAsLine } = this.state;
    const nodeConfigId = parseFloat((record || []).slice(1)) || null;
    const nodeConfigIndexAbc = (record && (record || []).slice(0, 1)) || 'K';
    cacheNode.set('nodeId', nodeConfigId);
    cacheNode.set('nodeConfigAbc', nodeConfigIndexAbc);
    this.setState(
      {
        selectName: nodeConfigId ? record : undefined,
        nodeFlag: !!nodeConfigId,
        nodeConfigId: nodeConfigId && nodeConfigId,
        nodeConfigIndexAbc: (nodeConfigId && nodeConfigIndexAbc) || 'K',
      },
      () => {
        const params = { tabCutPage, nodeConfigIndexAbc, courseAsLine, viewType };
        const customizeUnitCodes = this.getCustomizeUnitCodes(params);
        const currentDs = this.getCurrentDsOrCode();
        if (!flag) {
          const _arr = [
            ...getCustomizeBtnCodes({ nodeConfigIndexAbc }),
            ...getCustomizeCode({ tab: tabCutPage, nodeConfigIndexAbc }),
          ];
          resetSearchBarCache(_obj[tabCutPage], getSearchBarKey(_obj[tabCutPage]), true);
          queryUnitConfig('', '', _arr);
          queryUomConfig();
          currentDs.pageSize = 20;
          currentDs.setQueryParameter('params', {
            nodeConfigId,
            customizeUnitCode: customizeUnitCodes,
          });
          currentDs?.queryDataSet?.current.reset();
          currentDs.query();
        }
      }
    );
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
    const param = { tabCutPage, nodeConfigIndexAbc, courseAsLine, viewType };
    const customizeUnitCodes = this.getCustomizeUnitCodes(param);
    const currentDs = this.getCurrentDsOrCode();
    currentDs.setQueryParameter('params', {
      ...params,
      ...customParams,
      nodeConfigId,
      customizeUnitCode: customizeUnitCodes,
    });
    currentDs.query();
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
      });
    }
  };

  /*
   *创建按钮 - 事务
   */
  showModal = (nodeConfigId, flag) => {
    this.setState({ ceationLoading: true });
    const { history } = this.props;
    const { nodeConfigIndexAbc, nodeFlag } = this.state;
    const dataQueryDs = this.waitTableDs;
    // 勾选获取参数
    const List = dataQueryDs.selected
      .map((item) => item.toJSONData())
      .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    // 全选获取参数
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
    const params = filterNullValueObject(flag ? nodeCreationParams : allCreationParams);
    // 调创建接口
    modalSupplierPostCreate(params).then((rec) => {
      if (getResponse(rec)) {
        const currentDs = this.getCurrentDsOrCode();
        const custCode = this.getCurrentDsOrCode('code');
        currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
        currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
        if (rec.length > 1) {
          notification.success();
          history.push({
            pathname: `/sinv/supplier-receipt-workbench/merge-detail`,
            search: `type=SOURCE&nodeConfigIndexAbc=${
              configIndexAbc || nodeConfigIndexAbc
            }&cacheKey=${rec[0].cacheKey}&pageCurrentIsSelectedNodeCodes=${nodeFlag ? '1' : '0'}`,
          });
          this.setState({ ceationLoading: false });
        } else {
          if (rec.length === 0) {
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
            history.push({
              pathname: `/sinv/supplier-receipt-workbench/detail/${element.rcvTrxHeaderId}`,
              search: `type=SOURCE&nodeConfigIndexAbc=${
                configIndexAbc || nodeConfigIndexAbc
              }&pageCurrentIsSelectedNodeCodes=${nodeFlag ? '1' : '0'}`,
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
      const { history } = this.props;
      const { nodeConfigIndexAbc, nodeFlag } = this.state;
      const selectedRecords = this.returnTableDs.selected.map((item) => item.toData());
      const configIndexAbc = selectedRecords.map((item) => item.nodeConfigIndexAbc)[0];
      // TODO 后端逻辑局限导致前端必须要做双重判断 先使用数据自带的nodeConfigIndexAbc 如果没有再使用转化的 index
      const nodeConfigIndex = selectedRecords[0]?.nodeConfigIndex;
      const index = String.fromCharCode(65 + nodeConfigIndex);
      const sendRecords = this.sendTableDs.selected.map((item) => item.toData());
      const rcvTrxTypeId = sendRecords.map((n) => n.rcvTrxTypeId)[0];
      const nodeConfigId = sendRecords.map((n) => n.nodeConfigId)[0];
      const sendTableLength = this.sendTableDs.selected.map((i) => i.toData());
      if (sendTableLength.length !== 0) {
        const params = filterNullValueObject({
          rcvTrxTypeId,
          nodeConfigId,
          selectedRecords,
        });
        getResponse(fetchSendBackList(params)).then((res) => {
          if (res && !res.type) {
            history.push({
              pathname: `/sinv/supplier-receipt-workbench/return-detail/${res.rcvTrxHeaderId}`,
              search: `type=END&nodeConfigIndexAbc=${
                configIndexAbc || index || nodeConfigIndexAbc
              }&pageCurrentIsSelectedNodeCodes=${nodeFlag ? '1' : '0'}`,
            });
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
    const { nodeConfigId, customParams } = this.state;
    const sinvRcvTrxHeaderDTO = this.waitConfirmTableDs.selected.map((item) => item.toJSONData());
    const handleQuery = () => {
      const currentDs = this.getCurrentDsOrCode();
      const custCode = this.getCurrentDsOrCode('code');
      currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
      currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
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
    const { remote } = this.props;
    const { nodeConfigIndexAbc } = this.state;
    const selectedRecords = this.courseTableDs.selected
      .map((item) => item.toJSONData())
      .map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId }));
    const data = {
      type,
      selectedRecords,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`,
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

    const onSubmit = () => {
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

    if (remote?.event) {
      remote.event.fireEvent('cuxOnSubmit', {
        onSubmit,
      });
    } else {
      onSubmit();
    }
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
          const res = await handleReturnValidate(queryParams, 's');
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
   * 已收货-退货事件- 事务
   */
  @Debounce(300)
  sendBackShowModal = () => {
    const { history } = this.props;
    const { nodeConfigIndexAbc, nodeFlag } = this.state;
    const currentDs = this.getCurrentDsOrCode();
    const selectedRecords = currentDs.selected.map((item) => item.toData());
    // TODO 后端逻辑局限导致前端必须要做双重判断 先使用数据自带的nodeConfigIndexAbc 如果没有再使用转化的 index
    const configIndexAbc = selectedRecords.map((item) => item?.nodeConfigIndexAbc)[0] || null;
    const nodeConfigIndex = selectedRecords.map((item) => item?.nodeConfigIndex)[0] || null;
    const index = String.fromCharCode(65 + nodeConfigIndex);
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
                  } else {
                    history.push({
                      pathname: `/sinv/supplier-receipt-workbench/return-detail/${endRes.rcvTrxHeaderId}`,
                      search: `type=END&nodeConfigIndexAbc=${
                        configIndexAbc || index || nodeConfigIndexAbc
                      }&pageCurrentIsSelectedNodeCodes=${nodeFlag ? '1' : '0'}`,
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
              .finally(() => {
                this.setState({ sendBackLoading: false });
                this.clearSelectListChange();
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
              style: { width: 700 },
              afterClose: () => {
                this.sendTableDs.reset();
              },
              drawer: false,
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
                // endRes && !endRes.type
                if (getResponse(endRes)) {
                  if (isEmpty(endRes)) {
                    notification.warning({
                      message: intl
                        .get(`sinv.receiptWorkbench.model.receipt.moreSelectedDataTuihuo`)
                        .d('当前执行数量超过预置数量'),
                    });
                    currentDs.query();
                  } else {
                    history.push({
                      pathname: `/sinv/supplier-receipt-workbench/return-detail/${endRes.rcvTrxHeaderId}`,
                      search: `type=END&nodeConfigIndexAbc=${
                        configIndexAbc || index || nodeConfigIndexAbc
                      }&pageCurrentIsSelectedNodeCodes=${nodeFlag ? '1' : '0'}`,
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
              .finally(() => {
                this.setState({ sendBackLoading: false });
                this.clearSelectListChange();
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
    const { nodeConfigIndexAbc, nodeFlag } = this.state;
    const dataQueryDs = this.returnTableDs;
    const queryData =
      dataQueryDs.queryDataSet?.toData().length && dataQueryDs.queryDataSet?.toData()[0];
    const queryParams = filterNullValueObject({
      ...dataQueryDs?.queryParameter.params,
      ...queryData,
    });
    const selectedRecords = dataQueryDs.selected.map((item) => item.toData());
    const configIndexAbc = selectedRecords.map((item) => item?.nodeConfigIndexAbc)[0] || null;
    const nodeConfigIndex = selectedRecords.map((item) => item?.nodeConfigIndex)[0] || null;
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
    this.sendTableDs.query()?.then(async (result) => {
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
              's'
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
                pathname: `/sinv/supplier-receipt-workbench/return-detail/${res.rcvTrxHeaderId}`,
                search: `type=END&nodeConfigIndexAbc=${
                  configIndexAbc || index || nodeConfigIndexAbc
                }&pageCurrentIsSelectedNodeCodes=${nodeFlag ? '1' : '0'}`,
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
          's'
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
            pathname: `/sinv/supplier-receipt-workbench/return-detail/${res?.rcvTrxHeaderId}`,
            search: `type=END&nodeConfigIndexAbc=${
              configIndexAbc || index || nodeConfigIndexAbc
            }&pageCurrentIsSelectedNodeCodes=${nodeFlag ? '1' : '0'}`,
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
    const paramsList = [];
    const selectedRecords = record.map((item) => item.toData());
    selectedRecords.forEach((item) => {
      paramsList.push(item.rcvTrxHeaderId);
    });
    this.setState({ subAndDeleteLoading: true });
    getResponse(print(paramsList)).then((res) => {
      const func = () => {
        const currentDs = this.getCurrentDsOrCode();
        currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
        currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
        const custCode = this.getCurrentDsOrCode('code');
        const { nodeConfigId, tabCutPage } = this.state;
        if (tabCutPage === 'two') {
          this.init();
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
        // const currentDs = this.getCurrentDs();
        const currentDs = this.getCurrentDsOrCode();
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
    if (type === 'FINISHED') {
      const currentDS = viewType === 'flat' ? this.endTableDs : this.endAsnTableDs;
      const currentUnitCode =
        viewType === 'flat'
          ? `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH`
          : `SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH,SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc}`;
      currentDS.setQueryParameter('params', {
        ...param,
        nodeConfigId,
        customizeUnitCode: currentUnitCode,
      });
      currentDS.query();
    } else if (type === 'DOING') {
      const currentDS = courseAsLine ? this.courseAsnTableDs : this.courseTableDs;
      const currentUnitCode = courseAsLine
        ? `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`
        : `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`;
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
    const currentDs = this.getCurrentDsOrCode();
    const data = selected.map((item) => item.toData());
    const res = await settlementOnChange({ data, type });
    if (res.type !== 'error') {
      this.setState({ asyncLoading: false });
      notification.info({
        message: intl
          .get(`sinv.common.view.message.lookOver`)
          .d('正在重新同步结算/外部系统，请稍后查看导出结果'),
      });
      currentDs.query();
      this.clearSelectListChange();
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
    const { nodeFlag } = this.state;
    const {
      data: { fromRcvTrxHeaderId, nodeConfigIndexAbc, nodeConfigIndex, rcvTrxHeaderId },
    } = record;
    const id = isFromTrx ? fromRcvTrxHeaderId : rcvTrxHeaderId;
    const index = String.fromCharCode(65 + nodeConfigIndex);
    const params = filterNullValueObject({
      type,
      ...page,
      nodeConfigIndexAbc: nodeConfigIndexAbc || index,
      pageCurrentIsSelectedNodeCodes: nodeFlag ? '1' : '0',
    });
    history.push({
      pathname: `/sinv/supplier-receipt-workbench/detail/${id}`,
      search: stringify(params),
    });
  };

  /*
   *已完成-跳转收货明细页面
   */
  endToDetail = (record, type, page, isFromTrx) => {
    const { history } = this.props;
    const { nodeFlag } = this.state;
    const {
      data: { fromRcvTrxHeaderId, nodeConfigIndexAbc, nodeConfigIndex, rcvTrxHeaderId },
    } = record;
    const id = isFromTrx ? fromRcvTrxHeaderId : rcvTrxHeaderId;
    const index = String.fromCharCode(65 + nodeConfigIndex);
    const params = filterNullValueObject({
      type,
      ...page,
      nodeConfigIndexAbc: nodeConfigIndexAbc || index,
      pageCurrentIsSelectedNodeCodes: nodeFlag ? '1' : '0',
    });
    history.push({
      pathname: `/sinv/supplier-receipt-workbench/return-detail/${id}`,
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
        const { returnedFlag } = rowData;
        const { detailType, from, courseAsLine, viewType, isFromTrx } = others;
        // jumpFlag = rcvTrxHeaderId;
        const page = filterNullValueObject({
          from,
          courseAsLine,
          viewType,
        });
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
        returnedFlag
          ? this.endToDetail(record, detailType, page, isFromTrx)
          : this.courseToDetail(record, detailType, page, isFromTrx);
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

  handleToDetail = () => {
    const { tabCutPage } = this.state;
    const params = {
      from: tabCutPage,
    };
    c7nModal({
      title: intl
        .get('sinv.receiptWorkbench.view.title.detail.executionRecordDetail')
        .d('异步执行记录明细'),
      style: { width: '742px' },
      resizable: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <ExecutionRecordDetail {...params} />,
    });
  };

  handleState = (flag) => {
    this.setState({ visible: !!flag });
  };

  // 审批
  handleApprovalList = (_object) => {
    // const currentDs = this.getCurrentDs();
    const currentDs = this.getCurrentDsOrCode();
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
    // const currentDs = this.getCurrentDs();
    const currentDs = this.getCurrentDsOrCode();
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
        const res = await handleSupplierRevokeApprovalApi({ businessKey });
        if (getResponse(res)) {
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
      customizeTable,
      // customizeBtnGroup,
      customizeTabPane,
      custLoading,
      doubleUnitEnabled,
      cacheTab,
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
      viewType,
      courseAsLine,
      nodeFlag,
      nodeData,
      selectName,
      tabCutPage,
      nodeConfigId,
      asyncLoading,
      batchMaintains,
      ceationLoading,
      visible = false,
      nodeConfigIndexAbc,
      sendBackLoading = false,
      subAndDeleteLoading = false,
      origin,
      from,
    } = this.state;

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
      nodeConfigIndexAbc,
      doubleUnitEnabled,
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
        this.endList = node;
      },
    };

    const outParams = {
      listProps,
      tabCutPage: this.state.tabCutPage,
      tabClause: this.state.tabClause,
      tabSelectChange: this.tabSelectChange,
      customizeTabPane,
      changeTab: (tab) => {
        this.setState(
          {
            tabCutPage: cacheTab.get('key') || from || tab || 'one',
          },
          () => {
            // this.props.queryUnitConfig('', '', getCustomizeCode(this.state.tabCutPage));
          }
        );
      },
    };

    const currentDs = this.getCurrentDsOrCode();
    // const HeaderBtn = observer(({ dataSet }) => {
    //   const queryData = currentDs?.queryDataSet?.toData()[0];
    //   const queryParams = filterNullValueObject({
    //     ...dataSet?.queryParameter.params,
    //     ...queryData,
    //   });

    //   const getQueryParams = () =>
    //     filterNullValueObject({
    //       ...dataSet?.queryParameter.params,
    //       ...currentDs.queryDataSet?.toData()[0],
    //     });
    //   const buttonCreate = () => (
    //     <Menu>
    //       <Menu.Item key="instantly">
    //         <a disabled={isEmpty(dataSet?.selected)} onClick={() => this.creationButton(true)}>
    //           {intl.get('sinv.receiptExecution.model.selectCreate').d('勾选新建')}
    //         </a>
    //       </Menu.Item>
    //       <Menu.Item key="all">
    //         <a disabled={!dataSet.length} onClick={() => this.creationButton(false)}>
    //           {intl.get('hzero.common.model.allCreate').d('全选新建')}
    //         </a>
    //       </Menu.Item>
    //     </Menu>
    //   );

    //   const selectedRecords = dataSet?.selected.map((item) => item.toData());
    //   const rcvTrxLineIds = selectedRecords?.map((item) => item.rcvTrxLineId);
    //   const rcvTrxHeaderIds = selectedRecords?.map((item) => item.rcvTrxHeaderId);
    //   const disBtn = selectedRecords?.some((item) => item.rcvStatusCode === '20_SUBMITTED');
    //   switch (tabCutPage) {
    //     case 'one':
    //       return (
    //         <>
    //           {customizeBtnGroup(
    //             { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${nodeConfigIndexAbc}` },
    //             [
    //               <Dropdown
    //                 data-name="create"
    //                 overlay={ceationLoading || buttonCreate}
    //                 visible={visible}
    //                 onVisibleChange={(flag) => this.setState({ visible: !!flag })}
    //               >
    //                 <Button
    //                   color="primary"
    //                   icon="add"
    //                   type="c7n-pro"
    //                   style={{ border: 'none', color: '#FFF' }}
    //                   loading={ceationLoading}
    //                 >
    //                   {intl.get('hzero.common.model.create').d('新建')} <Icon type="expand_more" />
    //                 </Button>
    //               </Dropdown>,
    //               isEmpty(dataSet?.selected) && (
    //                 <ExcelExportPro
    //                   allBody
    //                   method="POST"
    //                   otherButtonProps={{
    //                     icon: 'unarchive',
    //                     type: 'c7n-pro',
    //                     funcType: 'flat',
    //                     permissionList: [
    //                       {
    //                         code:
    //                           'srm.logistics.receive.supplier-receipt-workbench.ps.srm.logistics.receive.supplier-receipt-workbench.ps.button.wait.newexport',
    //                         type: 'c7n-pro',
    //                       },
    //                     ],
    //                   }}
    //                   data-name="newExport"
    //                   style={{ border: 'none' }}
    //                   requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/waiting/export/new`}
    //                   queryParams={queryParams}
    //                   templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_WAITING_EXPORT"
    //                   buttonText={intl
    //                     .get(`sinv.receiptWorkbench.view.button.newExport`)
    //                     .d('新版导出')}
    //                 />
    //               ),
    //               !isEmpty(dataSet?.selected) && (
    //                 <ExcelExportPro
    //                   allBody
    //                   method="POST"
    //                   otherButtonProps={{
    //                     icon: 'unarchive',
    //                     type: 'c7n-pro',
    //                     funcType: 'flat',
    //                     permissionList: [
    //                       {
    //                         code:
    //                           'srm.logistics.receive.supplier-receipt-workbench.ps.srm.logistics.receive.supplier-receipt-workbench.ps.button.wait.newexport',
    //                         type: 'c7n-pro',
    //                       },
    //                     ],
    //                   }}
    //                   data-name="newExport"
    //                   buttonText={intl
    //                     .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
    //                     .d('新版勾选导出')}
    //                   style={{ border: 'none' }}
    //                   requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/waiting/export/new`}
    //                   queryParams={{ rcvTrxLineIds }}
    //                   templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_WAITING_EXPORT"
    //                 />
    //               ),
    //               <Button
    //                 icon="operation_service_request"
    //                 funcType="flat"
    //                 type="c7n-pro"
    //                 data-name="executionRecord"
    //                 onClick={() => this.handleToDetail(tabCutPage)}
    //               >
    //                 {intl
    //                   .get('sinv.receiptWorkbench.view.button.executionRecord')
    //                   .d('异步执行记录')}
    //               </Button>,
    //             ]
    //           )}
    //         </>
    //       );
    //     case 'two':
    //       if (!courseAsLine) {
    //         return (
    //           <>
    //             {customizeBtnGroup(
    //               { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${nodeConfigIndexAbc}` },
    //               [
    //                 <Button
    //                   data-name="executionRecord"
    //                   icon="operation_service_request"
    //                   type="c7n-pro"
    //                   funcType="flat"
    //                   onClick={() => this.handleToDetail(tabCutPage)}
    //                   style={{ border: 'none' }}
    //                 >
    //                   {intl
    //                     .get('sinv.receiptWorkbench.view.button.executionRecord')
    //                     .d('异步执行记录')}
    //                 </Button>,
    //                 isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                       permissionList: [
    //                         {
    //                           code:
    //                             'srm.logistics.receive.supplier-receipt-workbench.ps.doing.line.newexport',
    //                           type: 'c7n-pro',
    //                         },
    //                       ],
    //                     }}
    //                     data-name="newExport"
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing/export/new`}
    //                     queryParams={queryParams}
    //                     templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_DOING_EXPORT"
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newExport`)
    //                       .d('新版导出')}
    //                   />
    //                 ),
    //                 !isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                       permissionList: [
    //                         {
    //                           code:
    //                             'srm.logistics.receive.supplier-receipt-workbench.ps.doing.line.newexport',
    //                           type: 'c7n-pro',
    //                         },
    //                       ],
    //                     }}
    //                     data-name="newExport"
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
    //                       .d('新版勾选导出')}
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing/export/new`}
    //                     queryParams={{ rcvTrxHeaderIds }}
    //                     templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_DOING_EXPORT"
    //                   />
    //                 ),
    //                 <Button
    //                   data-name="delete"
    //                   icon="delete"
    //                   type="c7n-pro"
    //                   funcType="flat"
    //                   loading={subAndDeleteLoading}
    //                   disabled={isEmpty(dataSet?.selected) || disBtn}
    //                   onClick={() => this.subAndDelChange('50_DELETED')}
    //                   style={{ border: 'none' }}
    //                 >
    //                   {intl.get('hzero.common.model.delete').d('删除')}
    //                 </Button>,
    //                 <PermissionButton
    //                   data-name="print"
    //                   type="c7n-pro"
    //                   icon="print"
    //                   funcType="flat"
    //                   onClick={() => this.handlePrint(dataSet.selected)}
    //                   disabled={isEmpty(dataSet?.selected)}
    //                   style={{ border: 'none' }}
    //                   permissionList={[
    //                     {
    //                       code: `srm.logistics.receive.supplier-receipt-workbench.button.print`,
    //                       type: 'button',
    //                     },
    //                   ]}
    //                   loading={subAndDeleteLoading}
    //                 >
    //                   {intl.get(`sinv.common.view.message.button.print`).d('打印')}
    //                 </PermissionButton>,
    //                 <PrintProButton
    //                   data-name="newPrint"
    //                   buttonProps={{
    //                     icon: 'print',
    //                     type: 'c7n-pro',
    //                     funcType: 'flat',
    //                     disabled: isEmpty(dataSet?.selected),
    //                     // 权限集配置，可不传
    //                     permissionList: [
    //                       {
    //                         code: `srm.logistics.receive.supplier-receipt-workbench.button.newPrint`,
    //                         type: 'button',
    //                         meaning: '收货工作台-列表-新打印',
    //                       },
    //                     ],
    //                   }}
    //                   method="POST"
    //                   requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`}
    //                   data={dataSet?.selected.map((item) => item.get('rcvTrxHeaderId'))}
    //                   buttonText={intl
    //                     .get(`sinv.common.view.message.button.newPrint`)
    //                     .d('打印(新)')}
    //                 >
    //                   {intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)')}
    //                 </PrintProButton>,
    //                 <Button
    //                   data-name="submit"
    //                   icon="check"
    //                   color="primary"
    //                   style={{ color: '#FFF' }}
    //                   onClick={() => this.subAndDelChange('40_FINISHED')}
    //                   disabled={isEmpty(dataSet?.selected) || disBtn}
    //                   loading={subAndDeleteLoading}
    //                 >
    //                   {intl.get('hzero.common.model.submit').d('提交')}
    //                 </Button>,
    //               ].reverse()
    //             )}
    //           </>
    //         );
    //       } else {
    //         return (
    //           <div className={style['thing-receipts-btn']}>
    //             {customizeBtnGroup(
    //               { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${nodeConfigIndexAbc}` },
    //               [
    //                 isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     data-name="newExport"
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing-sinv/line/export/new`}
    //                     queryParams={queryParams}
    //                     otherButtonProps={{
    //                       type: 'c7n-pro',
    //                       icon: 'unarchive',
    //                       funcType: 'flat',
    //                       permissionList: [
    //                         {
    //                           code:
    //                             'srm.logistics.receive.supplier-receipt-workbench.ps.button.doing.newexport',
    //                           type: 'c7n-pro',
    //                         },
    //                       ],
    //                     }}
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newExport`)
    //                       .d('新版导出')}
    //                     templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_DOING_DETAIL_EXPORT"
    //                   />
    //                 ),
    //                 !isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                       permissionList: [
    //                         {
    //                           code:
    //                             'srm.logistics.receive.supplier-receipt-workbench.ps.button.doing.newexport',
    //                           type: 'c7n-pro',
    //                         },
    //                       ],
    //                     }}
    //                     data-name="newExport"
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
    //                       .d('新版勾选导出')}
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing-sinv/line/export/new`}
    //                     queryParams={{ rcvTrxLineIds }}
    //                     templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_DOING_DETAIL_EXPORT"
    //                   />
    //                 ),
    //               ]
    //             )}
    //           </div>
    //         );
    //       }
    //     case 'three':
    //       if (viewType === 'wide') {
    //         // 按单
    //         return (
    //           <div className={style['thing-receipts-btn']}>
    //             {customizeBtnGroup(
    //               { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${nodeConfigIndexAbc}` },
    //               [
    //                 <PrintProButton
    //                   data-name="newPrint"
    //                   buttonProps={{
    //                     icon: 'print',
    //                     type: 'c7n-pro',
    //                     funcType: 'flat',
    //                     disabled: isEmpty(dataSet?.selected),
    //                     // 权限集配置，可不传
    //                     permissionList: [
    //                       {
    //                         code: `srm.logistics.receive.supplier-receipt-workbench.button.newPrint`,
    //                         type: 'button',
    //                         meaning: '收货工作台-列表-新打印',
    //                       },
    //                     ],
    //                   }}
    //                   method="POST"
    //                   requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`}
    //                   data={dataSet?.selected.map((item) => item.get('rcvTrxHeaderId'))}
    //                   buttonText={intl
    //                     .get(`sinv.common.view.message.button.newPrint`)
    //                     .d('打印(新)')}
    //                 >
    //                   {intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)')}
    //                 </PrintProButton>,
    //                 <PermissionButton
    //                   data-name="print"
    //                   icon="print"
    //                   type="c7n-pro"
    //                   funcType="flat"
    //                   onClick={() => this.handlePrint(dataSet.selected)}
    //                   disabled={isEmpty(dataSet?.selected)}
    //                   style={{ border: 'none' }}
    //                   loading={subAndDeleteLoading}
    //                   permissionList={[
    //                     {
    //                       code: `srm.logistics.receive.supplier-receipt-workbench.button.print`,
    //                       type: 'button',
    //                     },
    //                   ]}
    //                 >
    //                   {intl.get(`sinv.common.view.message.button.print`).d('打印')}
    //                 </PermissionButton>,
    //                 !isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     method="POST"
    //                     allBody
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                       permissionList: [
    //                         {
    //                           code:
    //                             'srm.logistics.receive.supplier-receipt-workbench.ps.ps.button.finish.newexport',
    //                           type: 'c7n-pro',
    //                         },
    //                       ],
    //                     }}
    //                     data-name="newExport"
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
    //                       .d('新版勾选导出')}
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/finish/header/export/new`}
    //                     queryParams={{ rcvTrxHeaderIds }}
    //                     templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_FINISH_EXPORT"
    //                   />
    //                 ),
    //                 isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     method="POST"
    //                     allBody
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                       permissionList: [
    //                         {
    //                           code:
    //                             'srm.logistics.receive.supplier-receipt-workbench.ps.ps.button.finish.newexport',
    //                           type: 'c7n-pro',
    //                         },
    //                       ],
    //                     }}
    //                     data-name="newExport"
    //                     style={{ border: 'none' }}
    //                     queryParams={queryParams}
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newExport`)
    //                       .d('新版导出')}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/finish/header/export/new`}
    //                     templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_FINISH_EXPORT"
    //                   />
    //                 ),
    //               ]
    //             )}
    //           </div>
    //         );
    //       } else {
    //         return (
    //           <div className={style['thing-receipts-btn']}>
    //             {customizeBtnGroup(
    //               { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${nodeConfigIndexAbc}` },
    //               [
    //                 isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                       permissionList: [
    //                         {
    //                           code:
    //                             'srm.logistics.receive.supplier-receipt-workbench.ps.finish.newexport',
    //                           type: 'c7n-pro',
    //                         },
    //                       ],
    //                     }}
    //                     data-name="newExport"
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/finish/line/export/new`}
    //                     queryParams={queryParams}
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newExport`)
    //                       .d('新版导出')}
    //                     templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_FINISH_DETAIL_EXPORT"
    //                   />
    //                 ),
    //                 !isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                       permissionList: [
    //                         {
    //                           code:
    //                             'srm.logistics.receive.supplier-receipt-workbench.ps.finish.newexport',
    //                           type: 'c7n-pro',
    //                         },
    //                       ],
    //                     }}
    //                     data-name="newExport"
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
    //                       .d('新版勾选导出')}
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/finish/line/export/new`}
    //                     queryParams={{ rcvTrxLineIds }}
    //                     templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_FINISH_DETAIL_EXPORT"
    //                   />
    //                 ),
    //               ]
    //             )}
    //           </div>
    //         );
    //       }
    //     case 'four':
    //       return (
    //         <>
    //           {customizeBtnGroup(
    //             { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.RETURN_${nodeConfigIndexAbc}` },
    //             [
    //               isEmpty(dataSet?.selected) && (
    //                 <ExcelExportPro
    //                   allBody
    //                   method="POST"
    //                   otherButtonProps={{
    //                     icon: 'unarchive',
    //                     funcType: 'flat',
    //                     permissionList: [
    //                       {
    //                         code:
    //                           'srm.logistics.receive.supplier-receipt-workbench.ps.ps.button.back.newexport',
    //                         type: 'c7n-pro',
    //                       },
    //                     ],
    //                   }}
    //                   data-name="newExport"
    //                   style={{ border: 'none' }}
    //                   requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/can-reverse/line/export/new`}
    //                   queryParams={queryParams}
    //                   buttonText={intl
    //                     .get(`sinv.receiptWorkbench.view.button.newExport`)
    //                     .d('新版导出')}
    //                   templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_REVERSE_EXPORT"
    //                 />
    //               ),
    //               !isEmpty(dataSet?.selected) && (
    //                 <ExcelExportPro
    //                   allBody
    //                   method="POST"
    //                   otherButtonProps={{
    //                     icon: 'unarchive',
    //                     funcType: 'flat',
    //                     permissionList: [
    //                       {
    //                         code:
    //                           'srm.logistics.receive.supplier-receipt-workbench.ps.ps.button.back.newexport',
    //                         type: 'c7n-pro',
    //                       },
    //                     ],
    //                   }}
    //                   data-name="newExport"
    //                   buttonText={intl
    //                     .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
    //                     .d('新版勾选导出')}
    //                   style={{ border: 'none' }}
    //                   requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/can-reverse/line/export/new`}
    //                   queryParams={{ rcvTrxLineIds }}
    //                   templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_REVERSE_EXPORT"
    //                 />
    //               ),
    //               <Button
    //                 data-name="return"
    //                 icon="reply"
    //                 color="primary"
    //                 onClick={() => this.sendBackShowModal()}
    //                 disabled={isEmpty(dataSet?.selected)}
    //                 loading={sendBackLoading}
    //               >
    //                 {intl.get('sinv.receiptWorkbench.model.receipt.sendBack').d('退货')}
    //               </Button>,
    //             ].reverse()
    //           )}
    //         </>
    //       );
    //     case 'five':
    //       // 按单
    //       if (!courseAsLine) {
    //         return (
    //           <>
    //             {customizeBtnGroup(
    //               { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${nodeConfigIndexAbc}` },
    //               [
    //                 isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                     }}
    //                     data-name="newExport"
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/confirm/export/new`}
    //                     queryParams={getQueryParams}
    //                     templateCode="SPUC_SINV_WORKBENCH_CONFIRM_EXPORT"
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newExport`)
    //                       .d('新版导出')}
    //                   />
    //                 ),
    //                 !isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                     }}
    //                     data-name="newExport"
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
    //                       .d('新版勾选导出')}
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/confirm/export/new`}
    //                     queryParams={{ rcvTrxHeaderIds }}
    //                     templateCode="SPUC_SINV_WORKBENCH_CONFIRM_EXPORT"
    //                   />
    //                 ),
    //                 <PrintProButton
    //                   data-name="newPrint"
    //                   buttonProps={{
    //                     icon: 'print',
    //                     type: 'c7n-pro',
    //                     funcType: 'flat',
    //                     disabled: isEmpty(dataSet?.selected),
    //                     // 权限集配置，可不传
    //                     permissionList: [
    //                       {
    //                         code: `srm.logistics.receive.supplier-receipt-workbench.button.newPrint`,
    //                         type: 'button',
    //                         meaning: '收货工作台-列表-新打印',
    //                       },
    //                     ],
    //                   }}
    //                   method="POST"
    //                   requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`}
    //                   data={dataSet?.selected.map((item) => item.get('rcvTrxHeaderId'))}
    //                   buttonText={intl
    //                     .get(`sinv.common.view.message.button.newPrint`)
    //                     .d('打印(新)')}
    //                 >
    //                   {intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)')}
    //                 </PrintProButton>,

    //                 <PermissionButton
    //                   data-name="print"
    //                   type="c7n-pro"
    //                   icon="print"
    //                   funcType="flat"
    //                   onClick={() => this.handlePrint(dataSet.selected)}
    //                   disabled={isEmpty(currentDs?.selected)}
    //                   style={{ border: 'none' }}
    //                   loading={subAndDeleteLoading}
    //                   permissionList={[
    //                     {
    //                       code: `srm.logistics.receive.supplier-receipt-workbench.button.print`,
    //                       type: 'button',
    //                     },
    //                   ]}
    //                 >
    //                   {intl.get(`sinv.common.view.message.button.print`).d('打印')}
    //                 </PermissionButton>,

    //                 <Button
    //                   data-name="refuse"
    //                   icon="close"
    //                   type="c7n-pro"
    //                   funcType="flat"
    //                   loading={subAndDeleteLoading}
    //                   disabled={isEmpty(currentDs?.selected)}
    //                   onClick={() => this.handleAffirm('30_SUP_REJECTED')}
    //                   style={{ border: 'none' }}
    //                 >
    //                   {intl.get('hzero.common.button.refuse').d('拒绝')}
    //                 </Button>,
    //                 <Button
    //                   data-name="affirm"
    //                   icon="done"
    //                   color="primary"
    //                   onClick={() => this.handleAffirm('40_FINISHED')}
    //                   disabled={isEmpty(currentDs?.selected)}
    //                   loading={subAndDeleteLoading}
    //                 >
    //                   {intl.get('hzero.common.button.affirm').d('确认')}
    //                 </Button>,
    //               ].reverse()
    //             )}
    //           </>
    //         );
    //       } else {
    //         return (
    //           <div className={style['thing-receipts-btn']}>
    //             {customizeBtnGroup(
    //               { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${nodeConfigIndexAbc}` },
    //               [
    //                 !isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                     }}
    //                     data-name="newExport"
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
    //                       .d('新版勾选导出')}
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/confirm-sinv/line/export/new`}
    //                     queryParams={{ rcvTrxLineIds }}
    //                     templateCode="SPUC_SINV_WORKBENCH_CONFIRM_DETAIL_EXPORT"
    //                   />
    //                 ),
    //                 isEmpty(dataSet?.selected) && (
    //                   <ExcelExportPro
    //                     allBody
    //                     method="POST"
    //                     otherButtonProps={{
    //                       icon: 'unarchive',
    //                       type: 'c7n-pro',
    //                       funcType: 'flat',
    //                     }}
    //                     data-name="newExport"
    //                     style={{ border: 'none' }}
    //                     requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/confirm-sinv/line/export/new`}
    //                     queryParams={getQueryParams}
    //                     buttonText={intl
    //                       .get(`sinv.receiptWorkbench.view.button.newExport`)
    //                       .d('新版导出')}
    //                     templateCode="SPUC_SINV_WORKBENCH_CONFIRM_DETAIL_EXPORT"
    //                   />
    //                 ),
    //               ]
    //             )}
    //           </div>
    //         );
    //       }
    //     default:
    //       break;
    //   }
    // });

    const btnProps = {
      visible,
      viewType,
      tabCutPage,
      courseAsLine,
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
      sendBackShowModalChange: this.sendBackShowModalChange,
      synchronousButton: this.synchronousButton,
      handleState: this.handleState,
      queryUnitConfig: this.props.queryUnitConfig,
      customizeBtnGroup: this.props.customizeBtnGroup,
    };
    return (
      <Fragment>
        <Header
          title={intl
            .get('sinv.receiptWorkbench.view.title.supplierReceiptWorkBench')
            .d('销售方收货工作台')}
        >
          {/* <HeaderBtn dataSet={currentDs} /> */}
          <BtnComps dataSet={currentDs} _btnObjs={btnProps} />
        </Header>
        <Content>
          <Fragment>
            <div>
              <WithTab {...outParams} />
            </div>
          </Fragment>
        </Content>
      </Fragment>
    );
  }
}
