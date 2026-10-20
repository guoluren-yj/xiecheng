/* eslint-disable react/jsx-indent */
/* @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Popover, Tabs } from 'choerodon-ui';
// import DoubleTabs from '_components/DoubleTabs';
import { isEmpty, upperFirst } from 'lodash';
import { observer } from 'mobx-react';
import { parse, stringify } from 'querystring';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';

import intl from 'utils/intl';
import withRemote from 'utils/remote';
import withProps from 'utils/withProps';
import { SRM_SSTA } from '_utils/config';
import { queryIdpValue } from 'services/api';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import PrintProButton from '_components/PrintProButton';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import IMChatDraggable from '_components/IMChatDraggable';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';
import { getCurrentOrganizationId, filterNullValueObject, getResponse, isUrl } from 'utils/utils';
import DocFlow from '_components/DocFlow';
import { confirmModal } from '@/routes/Components/ConfirmModal';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import notification from 'utils/notification';
import { statusTagRender } from '@/utils/renderer';
import {
  dateRangeTransform,
  formatDynamicBtns,
  transformSupplierData,
  formatNumber,
  transformQselectDate,
} from '@/utils/utils';
import { PermissionDropdown, getPermissions, PermissionBtns } from '@/routes/Components';
import { handleViewTaskProgress } from '@/routes/ExecutionProgress/modal';
import {
  cancel,
  returnData,
  comfirm,
  sync,
  getStatementWorkbench,
  getReconciliationLineh,
  withdraw,
  submit,
  proofSearch,
  submitValidate,
  printBillList,
} from '@/services/reconciliationWorkbenchService';
import Styles from '@/routes/common.less';
import { mainTableDs, detailTableDs } from './mainDS';
import { operationDS } from '../pubDS/operationDS';
import FilledInfoModal from './FilledInfoModal';
import DetailDrawerNew from './DetailDrawerNew';
import CreateModal from './CreateModal';
import { tagColor } from './dic';
import InvoiceStatementRecords from './components/InvoiceStatementRecords';
import WorkflowCaller from '@/components/WorkflowCaller';

const numberShiledRender = ({ text, record }) =>
  Number(record.get('priceShiledFlag')) === 1 ? '****' : text;

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;
const gridCodePrefix = 'SSTA.PURCHASER_BILL_LIST.GRID_';
const searchCodePrefix = 'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_';
// const permPrefix = `srm.settle-account.reconciliation-workbench.purchaser.ps.radio.button`;
// const permissionPrefix = `srm.settle-account.reconciliation-workbench.purchaser.ps.list.button`;
const { TabPane, TabGroup } = Tabs;

const normalKeys = new Set(['ALL', 'UPDATE', 'APPROVE', 'CANCEL', 'SYNC', 'SIGNATURE']);

@withCustomize({
  unitCode: [
    'SSTA.PURCHASER_BILL_LIST.GRID_ALL',
    'SSTA.PURCHASER_BILL_LIST.GRID_UPDATE',
    'SSTA.PURCHASER_BILL_LIST.GRID_APPROVE',
    'SSTA.PURCHASER_BILL_LIST.GRID_CANCEL',
    'SSTA.PURCHASER_BILL_LIST.GRID_SYNC',
    'SSTA.PURCHASER_BILL_LIST.GRID_SIGNATURE',
    'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_SIGNATURE',
    'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_ALL',
    'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_UPDATE',
    'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_APPROVE',
    'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_CANCEL',
    'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_SYNC',
    'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_DETAIL',
    'SSTA.PURCHASER_BILL_LIST.GRID_DETAIL',
    'SSTA.PURCHASER_BILL_LIST.HEADER_BTNS',
    'SSTA.PURCHASER_BILL_LIST.TABS',
    'SSTA.PURCHASER_BILL_LIST.PRE_CONFIRM',
    'SSTA.PURCHASER_BILL_LIST.PRE_RETURN',
    'SSTA.PURCHASER_BILL_LIST.HEADER_BTNS_ALL',
    'SSTA.PURCHASER_BILL_LIST.CANCEL_MODAL',
    'SSTA.PURCHASER_BILL_LIST.INVOICE_RECORD',
  ],
})
@withRemote({
  code: 'SSTA.PURCHASER_BILL_LIST_CUX',
  name: 'remote',
})
@formatterCollections({
  code: [
    'ssta.reconciliationWorkbench',
    'hzero.c7nProU',
    'hzero.c7nProUI',
    'ssta.settlePool',
    'sbud.budgeting',
    'ssta.costSheet',
    'ssta.common',
    'entity.attachment',
    'hwfp.common',
    'ssta.reconciliationWorkbench.model.reconciliationWorkbench',
    'hzero.common',
    'ssta.purchaseSettle',
    'ssta.supplySettlePool',
    'ssta.purchaseSettlePool',
    'spcm.common',
    'component.docFlow',
    'ssta.billSheet',
  ],
})
@withProps(
  ({ remote }) => {
    const cacheState = new Map();
    const dsObj = {
      ALL: new DataSet(mainTableDs()),
      UPDATE: new DataSet(mainTableDs()),
      APPROVE: new DataSet(mainTableDs()),
      CANCEL: new DataSet(mainTableDs()),
      SYNC: new DataSet(mainTableDs()),
      SIGNATURE: new DataSet(mainTableDs()),
    };
    const processDsObj = remote
      ? remote.process('SSTA.PURCHASER_BILL_LIST_CUX.DS_OBJ', dsObj, { tableDS: mainTableDs })
      : dsObj;
    const detailTableDS = new DataSet(detailTableDs());
    return {
      dsObj: processDsObj,
      cacheState,
      detailTableDS,
    };
  },
  { cacheState: true }
)
@observer
export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    const {
      location: { search, pathname },
      custConfig,
      dsObj,
      cacheState,
      detailTableDS,
    } = props;

    const {
      type: urlType,
      billNums: defaultBillNums,
      billStatus: defaultBillStatus,
      creationDateRange: defaultCreationDateRange,
    } = parse(search.substring(1));
    const isNew = pathname.indexOf('new') > -1;
    const { fields = [] } = custConfig?.['SSTA.PURCHASER_BILL_LIST.TABS'] || {};
    const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
    /**
     * 内部状态
     */
    this.state = {
      type: urlType || cacheState?.get('activeKey') || fieldCode?.toUpperCase() || 'ALL',
      isDetailTab: cacheState?.get('isDetailTab') || false,
      permsMap: new Map(),
      itemCount: {},
      statusData: {},
      isOpenClearCashed: true, // 记录是否开启清理缓存记录标识
      initFlag: true, // 用来过滤页面渲染时筛选器初次查询
      detailUrl: isNew
        ? '/ssta/new-reconciliation-workbench/detail'
        : '/ssta/reconciliation-workbench/detail',
      permfix: isNew
        ? 'srm.settle-account.reconciliation-workbench.ux-purchaser'
        : 'srm.settle-account.reconciliation-workbench.purchaser',
      isNew,
      defaultBillNums,
      defaultBillStatus,
      defaultCreationDateRange,
    };

    this.dsObj = dsObj;
    this.detailTableDS = detailTableDS;

    /**
     * 操作记录ds
     */
    this.operationDs = new DataSet(
      operationDS({
        url: `/ssta/v1/${getCurrentOrganizationId()}/bill-actions/`,
        pk: 'billHeaderId',
        urlPramas: true,
      })
    );

    this.searchBarRef = { current: {} };
  }

  componentDidMount() {
    this.getPermissions();
    this.fetchLov();
    this.fetchCount();
    this.addWorkflowCaller();
    const { remote } = this.props;
    if (remote) {
      remote.event.fireEvent('onComponentDidMount', {
        dsObj: this.dsObj,
        setState: this.setState.bind(this),
      });
    }
    Object.entries(this.dsObj).forEach(([key, value]) => {
      if (normalKeys.has(key)) {
        // 二开标签页的自定义处理参数
        const customizeUnitCode = [gridCodePrefix + key, searchCodePrefix + key].join();
        value.setQueryParameter('customizeUnitCode', customizeUnitCode);
        value.setQueryParameter('action', key);
      }
    });
  }

  componentWillUnmount() {
    this.removeWorkflowCaller();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
    } = prevProps;
    const {
      location: { search },
    } = this.props;
    const newPartStateData = {};
    const {
      type: urlType,
      billNums: urlBillNums,
      billStatus: urlBillStatus,
      creationDateRange: urlCreateDateRange,
    } = parse(search.substring(1));
    const {
      type: prevUrlType,
      billNums: prevBillNums,
      billStatus: prevBillStatus,
      creationDateRange: prevCreateDateRange,
    } = parse(prevSearch.substring(1));
    if (prevUrlType !== urlType && urlType) {
      newPartStateData.type = urlType;
    }
    // 路由上筛选器默认值参数待刷新值
    const barPartStateData = this.handleInitBarValue(
      [
        {
          name: 'billNums',
          urlValue: urlBillNums,
          preValue: prevBillNums,
        },
        {
          name: 'billStatus',
          urlValue: urlBillStatus,
          preValue: prevBillStatus,
        },
        {
          name: 'creationDateRange',
          urlValue: urlCreateDateRange,
          preValue: prevCreateDateRange,
        },
      ],
      urlType
    );
    this.setNewPartStateData(Object.assign(newPartStateData, barPartStateData));
  }

  addWorkflowCaller = () => {
    this.dsObj.ALL.setState('workflowCaller', new WorkflowCaller(this.dsObj.ALL));
    this.dsObj.APPROVE.setState('workflowCaller', new WorkflowCaller(this.dsObj.APPROVE));
  };

  removeWorkflowCaller = () => {
    this.dsObj.ALL.getState('workflowCaller').destroy();
    this.dsObj.APPROVE.getState('workflowCaller').destroy();
  };

  handleInitBarValue = (listenData, urlType) => {
    const customizeParams = {};
    const searchBarParams = {};
    const barPartStateData = {};
    listenData.forEach((item) => {
      const { name, urlValue, preValue } = item;
      const defaultName = `default${upperFirst(name)}`;
      // 仅路由参数更改的时候更新查询默认值
      if (preValue !== urlValue) {
        const filledParamsName = name === 'billNums' ? customizeParams : searchBarParams;
        filledParamsName[name] = urlValue;
        barPartStateData[defaultName] = urlValue;
        // 日期字段需要设置关联字段默认值
        if (name === 'creationDateRange') {
          searchBarParams.creationDate = dateRangeTransform(urlValue, true);
        }
      }
    });
    const { type } = this.state;
    const currentType = urlType || type;
    const { customizeDs, setFields, handleQuery } = this.searchBarRef.current[currentType] || {};
    const customizeDsCurrent = customizeDs?.current;
    if (customizeDsCurrent && !isEmpty(customizeParams)) {
      customizeDsCurrent.init(customizeParams);
    }
    if (setFields && !isEmpty(searchBarParams)) {
      setFields(searchBarParams, 'init');
    }
    if (handleQuery && !(isEmpty(customizeParams) && isEmpty(searchBarParams))) handleQuery();
    return barPartStateData;
  };

  setNewPartStateData = (partNewStateData) => {
    if (!isEmpty(partNewStateData)) {
      this.setState(partNewStateData);
    }
  };

  /**
   * 获取操作按钮权限集
   */
  getPermissions = () => {
    const { permfix } = this.state;
    const { remote } = this.props;
    const cuxPermCodes = remote
      ? remote.process('SSTA.PURCHASER_BILL_LIST_CUX.PERMISSION_CODES', [])
      : [];
    getPermissions([
      `${permfix}.ps.radio.button.update`,
      `${permfix}.ps.radio.button.audit`,
      `${permfix}.ps.radio.button.cancel`,
      `${permfix}.ps.radio.button.sync`,
      `${permfix}.ps.radio.button.recall`,
      `srm.settle-account.settle-pool.purchase.ps.radio.button.bill`,
      `${permfix}.ps.list.button.confirm`,
      `${permfix}.ps.list.button.return`,
      `${permfix}.ps.list.button.batch_submit`,
      `${permfix}.ps.import`,
      `${permfix}.ps.newimport`,
      `${permfix}.ps.radio.button.signature`,
      `${permfix}.button.print-list`,
      `${permfix}.button.new-print-list`,
      `${permfix}.button.proofSearch`,
      `${permfix}.button.signature-reject`,
      `${permfix}.button.invoiceRecord`,
      `${permfix}.button.taskProgress`,
      ...cuxPermCodes,
    ]).then((data) => {
      if (data) {
        this.setState({
          permsMap: data,
        });
      }
    });
  };

  /**
   * 获取 tab 页标题计数
   */
  fetchCount = async (typeKey) => {
    const { remote } = this.props;
    if (remote) {
      const feedback = await remote.event.fireEvent('onFetchTotalCount', {
        typeKey,
        state: this.state,
        setState: this.setState.bind(this),
      });
      if (feedback === false) return;
    }
    if (typeKey) {
      if (typeKey === 'DETAIL' || this.state.isDetailTab) {
        getReconciliationLineh({ type: 'purchaser' }).then((res) => {
          if (res) {
            this.setState({
              itemCount: {
                ...this.state.itemCount,
                detail: res.totalElements || 0,
              },
            });
          }
        });
      } else {
        getStatementWorkbench({ action: typeKey, type: 'purchaser' }).then((res) => {
          if (res) {
            this.setState({
              itemCount: {
                ...this.state.itemCount,
                [typeKey.toLowerCase()]: res.totalElements || 0,
              },
            });
          }
        });
      }
    } else {
      Promise.all([
        getStatementWorkbench({ action: 'ALL', type: 'purchaser' }),
        getStatementWorkbench({ action: 'UPDATE', type: 'purchaser' }),
        getStatementWorkbench({ action: 'APPROVE', type: 'purchaser' }),
        getStatementWorkbench({ action: 'CANCEL', type: 'purchaser' }),
        getStatementWorkbench({ action: 'SYNC', type: 'purchaser' }),
        getStatementWorkbench({ action: 'SIGNATURE', type: 'purchaser' }),
      ]).then((res) => {
        this.setState({
          itemCount: {
            ...this.state.itemCount,
            all: res[0] ? res[0].totalElements : 0,
            update: res[1] ? res[1].totalElements : 0,
            approve: res[2] ? res[2].totalElements : 0,
            cancel: res[3] ? res[3].totalElements : 0,
            sync: res[4] ? res[4].totalElements : 0,
            signature: res[5] ? res[5].totalElements : 0,
          },
        });
      });
    }
  };

  /**
   * 查询对账单状态值集
   */
  fetchLov = async () => {
    const data = await queryIdpValue('SSTA.BILL_STATUS');
    if (data) {
      const statusData = {};
      data.forEach(({ value, tag }) => {
        statusData[value] = tag;
      });
      this.setState({ statusData });
    }
  };

  setLoading = (flag) => {
    const { type, isDetailTab } = this.state;
    const ds = isDetailTab ? this.detailTableDS : this.dsObj[type];
    ds.status = flag ? 'loading' : 'ready';
  };

  cancelAllSelected = (ds) => {
    const { selected } = ds;
    if (selected?.length > 0) {
      selected.forEach((record) => {
        ds.unSelect(record);
      });
    }
  };

  /**
   * 筛选器查询回调
   */
  handleQuery = async ({ params }, ds) => {
    // eslint-disable-next-line no-unused-expressions
    ds.queryDataSet.loadData([params]);
    const historyState = this.props.location.state;
    const { isOpenClearCashed, initFlag } = this.state;
    if (historyState?._back === 1 && isOpenClearCashed) {
      this.cancelAllSelected(ds);
      this.setState({
        isOpenClearCashed: false,
      });
    }
    if (initFlag) {
      ds.query(ds.currentPage);
      this.setState({ initFlag: false });
    } else {
      ds.query();
    }
  };

  /**
   * 筛选器字段更改回调
   */
  handleFieldChange = ({ value, name, record }) => {
    if (name === 'creationDateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    } else if (name === 'trxDateRange') {
      record.set('trxDate', dateRangeTransform(value, true));
    } else if (name === 'dateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  };

  /**
   * 跳转详情页
   * @param {Object} record 行记录ds
   */
  linkToDetail = (record, action) => {
    const { history } = this.props;
    const { billHeaderId, billNum, billStatus } = record.toData();
    const { detailUrl } = this.state;
    const baseSearch = {};
    if (
      action === 'ALL' ||
      (action === 'APPROVE' && ['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(billStatus))
    ) {
      baseSearch.type = 'ALL';
    } else {
      baseSearch.action = action;
    }
    history.push({
      pathname: detailUrl,
      search: stringify(
        Object.assign(baseSearch, {
          editFlag: ['ALL', 'DETAIL', 'SIGNATURE'].includes(action) ? 0 : 1,
          billList: JSON.stringify([{ billHeaderId, billNum }]),
        })
      ),
    });
  };

  /**
   * 跳转创建页面
   * params 供二开传入 cuxProps
   */
  linkToCreate = (params = {}) => {
    const { type } = this.state;
    // 如果结算池没有配置可对账的权限集，就跳转全部tab
    // if (permsMap.get('srm.settle-account.settle-pool.purchase.ps.radio.button.bill')) {
    //   history.push('/ssta/purchase-settle-pool/list?type=B');
    // } else {
    //   history.push('/ssta/purchase-settle-pool');
    // }
    Modal.open({
      drawer: true,
      className: Styles['ssta-large-modal'],
      title: intl.get('ssta.common.view.title.billCreate').d('对账单新建'),
      key: Modal.key(),
      children: <CreateModal ds={this.dsObj[type]} {...this.props} {...params} />,
      footer: null,
    });
  };

  /**
   * 响应操作按钮
   * @param {Function} reqFun 请求接口函数
   * @param {string} opr 操作类型
   * @param {object} info 审核时填写的信息
   * @param {object} infoCode 个性化编码
   */
  handleOpr = async (reqFun, opr, info = {}, infoCode = '') => {
    const { type } = this.state;
    const ds = this.dsObj[type];
    ds.records.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.status = 'update';
    });
    const validateSelect = await ds.validate(true);
    if (!validateSelect && opr === 'cancel') return false;
    const sendData = ds.selected.map((item) => {
      return filterNullValueObject({
        ...item.toData(),
        ...info,
        submitPoint: opr === 'submit' ? 'LIST' : undefined,
      });
    });
    if (!sendData) return false;
    const { remote } = this.props;
    if (remote) {
      // 校验埋点
      const beforeSubmitRes = await remote.event.fireEvent('handleBeforeSubmitCux', {
        tableDs: ds,
        operateType: opr,
        sendData,
      });
      if (beforeSubmitRes === false) return false;
    }
    const validateOk = async () => {
      this.setLoading(true);
      const res = getResponse(
        await reqFun(sendData, [gridCodePrefix + type, searchCodePrefix + type, infoCode].join())
      );
      this.setLoading(false);
      if (!res) return false;
      if (remote) {
        remote.event.fireEvent('submitCuxCallback', {
          tableDs: ds,
          operateType: opr,
          sendData,
        });
      }
      notification.success();
      ds.query(undefined, undefined, false);
      this.fetchCount();
    };
    if (opr === 'submit' || opr === 'CONFIRM') {
      this.setLoading(true);
      const results = await Promise.all(
        sendData.map((item) =>
          submitValidate({
            body: [item],
            role: 'purchaser',
            customizeUnit: [gridCodePrefix + type, searchCodePrefix + type].join(),
          })
        )
      );
      this.setLoading(false);
      const checkWarn = () => {
        const validateWarnIndex = results.findIndex(
          (item) => item && item.validatedCode === 'WARNING'
        );
        if (validateWarnIndex > -1) {
          Modal.confirm({
            title: intl.get('ssta.common.view.message.tip').d('提示'),
            children: results[validateWarnIndex].msg,
            autoCenter: true,
            onOk: () => {
              results.splice(validateWarnIndex, 1, {});
              return checkWarn();
            },
            onCancel: () => {
              results.splice(validateWarnIndex, 1);
              sendData.splice(validateWarnIndex, 1);
              return checkWarn();
            },
          });
        } else if (sendData.length > 0) {
          return validateOk();
        }
      };
      const err = results.find((item) => item && item.failed === true);
      const validateErr = results.find((item) => item && item.validatedCode === 'ERROR');
      if (err) {
        getResponse(err);
        return false;
      } else if (validateErr) {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: validateErr.msg,
        });
        return false;
      } else {
        return checkWarn();
      }
    }
    return validateOk();
  };

  operateBeforeConfirm = (reqFun, opr) => {
    const { type } = this.state;
    const ds = this.dsObj[type];
    // APPROVE 审核页面确认，RETURN审核页签退回
    if (['CONFIRM', 'RETURN', 'CANCEL'].includes(opr)) {
      const billStatusList = ds.selected.map((item) => item.get('billStatus'));
      // 当list>1存在不同状态，给出错误提示
      const list = Array.from(new Set(billStatusList));
      if (list.length > 1 && opr !== 'CANCEL') {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: intl
            .get('ssta.common.model.reconciliationWorkbench.errorTips')
            .d('提交审批失败，当前勾选待审批的对账单状态不一致，请勾选状态一致对账单进行批量审批'),
        });
      } else {
        const { customizeForm, custConfig } = this.props;
        Modal.open({
          drawer: true,
          key: Modal.key(),
          destroyOnClose: true,
          closable: true,
          className: Styles['ssta-small-modal'],
          title:
            opr === 'CANCEL'
              ? intl.get('ssta.common.alert.cancel').d('取消信息')
              : intl.get('ssta.common.alert.confirms').d('审核信息'),
          children: (
            <FilledInfoModal
              reqFun={reqFun}
              action={opr}
              custConfig={custConfig}
              customizeForm={customizeForm}
              onOk={this.handleOpr}
              selected={ds.selected}
              billStatus={list[0]}
            />
          ),
        });
      }
    } else {
      let bills = [];
      let billsType = [];
      ds.selected.forEach((item) => {
        const billStatusMeaning = `${item.get('billStatusMeaning')}${intl
          .get('ssta.costSheet.model.costSheet.reconciliation')
          .d('对账单')}`;
        bills = [...bills, `${billStatusMeaning}${item.get('billNum')}`];
        billsType = [...billsType, `${billStatusMeaning}`];
      });
      const info = {
        action: opr,
        bills: bills.join(','),
        billType: Array.from(new Set(billsType)).join(','),
      };
      if (opr === 'CANCEL') {
        confirmModal(info, this.handleOpr, reqFun, opr);
      }
    }
  };

  handleApprove = (record) => {
    const billStatus = record.get('billStatus');
    const workflowApproveFlag = ['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(billStatus);
    if (workflowApproveFlag) {
      const { type } = this.state;
      const ds = this.dsObj[type];
      ds.getState('workflowCaller').goApprove({
        record,
        onSuccess: () => {
          notification.success();
          ds.query();
          this.fetchCount();
        },
      });
    } else {
      this.linkToDetail(record, 'APPROVE');
    }
  };

  /**
   * 撤回
   */
  handleWithdraw = (record) => {
    const { type } = this.state;
    const ds = this.dsObj[type];
    Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl
        .get('ssta.common.view.message.confirmRevokeApprovalTip')
        .d(
          '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
        ),
      onOk: async () => {
        this.setLoading(true);
        const res = getResponse(await withdraw(record.toData()));
        this.setLoading(false);
        if (res) {
          notification.success();
          ds.query();
          this.fetchCount();
        }
      },
    });
  };

  // 存证查询
  proofSearch = async (record) => {
    const billHeaderId = record.get('billHeaderId');
    this.setLoading(true);
    const res = await proofSearch({ billHeaderId });
    this.setLoading(false);
    if (res) {
      if (isUrl(res)) {
        window.open(res);
      } else if (res === 'U') {
        notification.warning({
          message: intl
            .get('spcm.common.view.noRealNameCertificationOrCertification')
            .d('无实名认证或认证中'),
        });
      } else {
        notification.warning({
          message: intl.get('spcm.common.view.noQueryViewCertificateDeposit').d('暂未查询到数据！'),
        });
      }
    }
  };

  /**
   * 金额字段渲染和高亮
   * @param {Object} param0 record 行记录 value 字段值 name 字段名称
   * @returns 单元格渲染内容
   */
  priceShiledRenderAndHighLight = ({ record, text, name }) => {
    const { billStatus, priceShiledFlag } = record.get(['billStatus', 'priceShiledFlag']);
    if (Number(priceShiledFlag) === 1) return '****';
    const fieldName =
      record.get('settleBasePrice') === 'NET_PRICE' ? 'netPriceMeaning' : 'taxIncludedPriceMeaning';

    if (
      billStatus !== 'NEW' &&
      billStatus !== 'RETURN' &&
      name === fieldName &&
      record.get('priceLightFlag') === 1
    ) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${formatNumber(
            record.get('orignPriceMeaning')
          )}`}
        >
          <span style={{ color: 'red' }}>{text}</span>
        </Popover>
      );
    } else {
      return text;
    }
  };

  /**
   * 查看行详情
   * @param {Object} record 行记录
   */
  viewLineDetail = (record) => {
    const { history } = this.props;
    const title = intl.get('hzero.common.button.viewDetail').d('查看详情');
    const lineModal = Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      style: {
        width: 1000,
      },
      title,
      className: Styles['ssta-modal-drawer'],
      children: <DetailDrawerNew record={record} type="F" isNew history={history} />,
      footer: (
        <Button color="primary" onClick={() => lineModal.close()}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    });
  };

  /**
   *  响应切换整单 tab 页
   *  @param {String} type
   */
  handleChangeType = (type) => {
    this.setState({ type });
    this.dsObj[type].query();
    this.fetchCount();
  };

  /**
   * 响应切换整单明细 tab 页
   * @param {Object} e
   */
  handleChangeMode = (e) => {
    const { value } = e.target;
    this.setState({ isDetailTab: Boolean(value) });
  };

  /**
   * 导出接口
   * @returns String
   */
  requestUrl = () => {
    const { isDetailTab, type } = this.state;
    let apiType;
    if (type) {
      apiType = type.toLowerCase();
    }
    const str = ',';
    const customizeUnitCode = gridCodePrefix + type + str + searchCodePrefix + type;
    const customizeUnitCodeLine =
      'SSTA.PURCHASER_BILL_LIST.GRID_DETAIL,SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_DETAIL';
    return isDetailTab
      ? `/ssta/v1/${getCurrentOrganizationId()}/bill-lines/purchaser/export?customizeUnitCode=${customizeUnitCodeLine}`
      : `/ssta/v1/${getCurrentOrganizationId()}/bill-headers/purchaser/excel-export/${apiType}?customizeUnitCode=${customizeUnitCode}`;
  };

  /**
   * 导出接口
   * @returns String
   */
  requestNewUrl = () => {
    const { isDetailTab, type } = this.state;
    let apiType;
    if (type) {
      apiType = type.toLowerCase();
    }
    const str = ',';
    const customizeUnitCode = gridCodePrefix + type + str + searchCodePrefix + type;
    const customizeUnitCodeLine =
      'SSTA.PURCHASER_BILL_LIST.GRID_DETAIL,SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_DETAIL';
    return isDetailTab
      ? `/ssta/v1/${getCurrentOrganizationId()}/bill-lines/purchaser/export/new/post?customizeUnitCode=${customizeUnitCodeLine}`
      : `/ssta/v1/${getCurrentOrganizationId()}/bill-headers/purchaser/excel-export/${apiType}?customizeUnitCode=${customizeUnitCode}`;
  };

  /**
   * 获取导出数据
   * @returns Object
   */
  getExportParams = () => {
    const { type, isDetailTab } = this.state;
    const ds = this.dsObj[type];
    if (!isDetailTab) {
      const billHeaderIdList = ds.selected.map((item) => item.get('billHeaderId')).join(',');
      const formParams = ds.queryDataSet.current?.toData() ? ds.queryDataSet.current?.toData() : {};
      const { supplierCompanyId } = formParams;
      if (billHeaderIdList) {
        return filterNullValueObject({ billHeaderIdList, action: type });
      } else {
        return filterNullValueObject({
          ...formParams,
          ...transformQselectDate(formParams, { creationDateRange: 'creationDate' }),
          ...transformSupplierData(supplierCompanyId),
          billHeaderIdList,
          action: type,
        });
      }
    } else {
      const billLineIds = this.detailTableDS.selected
        .map((item) => item.get('billLineId'))
        .join(',');
      const formParams = this.detailTableDS.queryDataSet.current?.toData() || {};
      const { supplierCompanyId } = formParams;
      if (billLineIds) {
        return filterNullValueObject({ billLineIds });
      } else {
        return filterNullValueObject({
          ...formParams,
          ...transformQselectDate(formParams, {
            dateRange: 'creationDate',
            trxDateRange: 'trxDate',
          }),
          ...transformSupplierData(supplierCompanyId),
          billLineIds,
          customizeUnitCode:
            'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_DETAIL,SSTA.PURCHASER_BILL_LIST.GRID_DETAIL',
        });
      }
    }
  };

  getSelectedKeys = () => {
    const billLineIds = this.detailTableDS.selected.map((item) => item.get('billLineId'));
    return filterNullValueObject({
      billLineIds,
      customizeUnitCode:
        'SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_DETAIL,SSTA.PURCHASER_BILL_LIST.GRID_DETAIL',
    });
  };

  // 点击打印
  handlePrint = async () => {
    const flag = checkPrintWindow();
    const { type } = this.state;
    const ds = this.dsObj[type];
    const billHeaderIdList = ds.selected.map((item) => item.get('billHeaderId'));
    if (billHeaderIdList) {
      this.setLoading(true);
      const printRes = getResponse(
        await printBillList({
          billHeaderIdList,
          responseType: flag ? 'blob' : 'json',
          headers: flag ? {} : { 's-print-using-preview': '1' },
        })
      );
      this.setLoading(false);
      if (printRes) {
        if (flag) {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const failedInfo = JSON.parse(reader.result);
              notification.error({
                description: failedInfo.message,
              });
            } catch (e) {
              const file = new Blob([printRes], { type: 'application/pdf' });
              const fileURL = URL.createObjectURL(file);
              const printWindow = window.open(fileURL);
              ds.unSelectAll();
              if (printWindow?.print) {
                printWindow.print();
              }
            }
          };
          reader.readAsText(printRes);
        } else {
          // 添加如下代码
          const { fileUrl, bucketName, fileToken } = printRes || {};
          const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
          window.open(url);
        }
      }
    }
  };

  // 打开发票申请记录
  handleViewInvRecord = (record) => {
    const billHeaderId = record?.get('billHeaderId');
    if (!billHeaderId) return;
    const { customizeTable, history } = this.props;
    Modal.open({
      drawer: true,
      title: intl
        .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceApplicationInfo')
        .d('发票申请信息'),
      closable: true,
      key: Modal.key(),
      className: Styles['ssta-medium-modal'],
      children: (
        <InvoiceStatementRecords
          history={history}
          customizeTable={customizeTable}
          billHeaderId={billHeaderId}
        />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  /**
   * 头按钮组渲染
   * @returns Array
   */
  headerBtnsRender = () => {
    const { isDetailTab, type, permsMap, permfix } = this.state;
    const ds = isDetailTab ? this.detailTableDS : this.dsObj[type];
    const { remote } = this.props;
    const loading = ds.status !== 'ready';
    let billHeaderId = '';
    if (!isDetailTab) {
      billHeaderId = ds.selected.map((item) => item.get('billHeaderId')).join(',');
    } else {
      billHeaderId = this.detailTableDS.selected.map((item) => item.get('billLineId')).join(',');
    }
    const isWorkflowSelected = ds.selected.some((item) =>
      ['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(item.get('billStatus'))
    );
    const btns = !isDetailTab
      ? [
          {
            name: 'submit',
            child: intl.get('hzero.common.button.submit').d('提交'),
            btnType: 'c7n-pro',
            hidden: type !== 'UPDATE' || !permsMap.get(`${permfix}.ps.list.button.batch_submit`),
            btnProps: {
              icon: 'check',
              onClick: () => this.handleOpr(submit, 'submit'),
              disabled: ds.selected.length === 0,
              loading,
              wait: 1000,
            },
          },
          {
            name: 'confirm',
            child: intl.get('ssta.reconciliationWorkbench.view.title.confirm').d('确认'),
            hidden: type !== 'APPROVE' || !permsMap.get(`${permfix}.ps.list.button.confirm`),
            btnProps: {
              icon: 'check',
              onClick: () => this.operateBeforeConfirm(comfirm, 'CONFIRM'),
              disabled: ds.selected.length === 0 || isWorkflowSelected,
              loading,
              wait: 1000,
            },
          },
          {
            name: 'back',
            child: intl.get('ssta.reconciliationWorkbench.view.title.back').d('退回'),
            hidden: type !== 'APPROVE' || !permsMap.get(`${permfix}.ps.list.button.return`),
            btnProps: {
              icon: 'reply',
              color: 'default',
              onClick: () => this.operateBeforeConfirm(returnData, 'RETURN'),
              disabled: ds.selected.length === 0 || isWorkflowSelected,
              loading,
              wait: 1000,
            },
          },
          {
            name: 'sync',
            child: intl.get('hzero.common.button.sync').d('同步'),
            hidden: type !== 'SYNC',
            btnProps: {
              icon: 'sync',
              onClick: () => this.handleOpr(sync),
              disabled: ds.selected.length === 0,
              loading,
              wait: 1000,
            },
          },
          {
            name: 'create',
            child: intl.get('ssta.reconciliationWorkbench.view.title.create').d('创建'),
            hidden: type === 'CANCEL' || !permsMap.get(`${permfix}.ps.radio.button.update`),
            btnProps: {
              icon: 'add',
              onClick: () => this.linkToCreate(),
              loading,
            },
          },
          {
            name: 'cancel',
            child: intl.get('ssta.reconciliationWorkbench.view.title.cancel').d('取消'),
            hidden: !['UPDATE', 'CANCEL'].includes(type),
            btnProps: {
              icon: 'cancel',
              onClick: () => this.operateBeforeConfirm(cancel, 'CANCEL'),
              disabled: ds.selected.length === 0,
              loading,
              wait: 1000,
            },
          },
          {
            name: 'print',
            child: intl.get('hzero.common.button.print').d('打印'),
            hidden: !permsMap.get(`${permfix}.button.print-list`),
            btnProps: {
              icon: 'print',
              disabled: ds.selected.length === 0,
              onClick: this.handlePrint,
              loading,
            },
          },
          {
            name: 'newPrint',
            btnComp: PrintProButton,
            childFor: 'buttonText',
            child: intl.get('ssta.common.view.button.newPrint').d('(新)打印'),
            hidden: !permsMap.get(`${permfix}.button.new-print-list`),
            btnProps: {
              buttonProps: { funcType: 'flat', disabled: ds.selected.length === 0 },
              requestUrl: `${apiPrefix}/bill-headers/list-print-new`,
              method: 'PUT',
              data: { billHeaderIdList: ds.selected.map((record) => record.get('billHeaderId')) },
              loading,
            },
          },
          {
            name: 'export',
            btnComp: ExcelExport,
            childFor: 'buttonText',
            child: billHeaderId
              ? intl.get('ssta.common.button.tickExport').d('勾选导出')
              : intl.get('ssta.common.button.export').d('导出'),
            hidden: !permsMap.get(`${permfix}.ps.import`),
            btnProps: {
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
                loading,
              },
              requestUrl: this.requestUrl(),
              queryParams: this.getExportParams(),
            },
          },
          {
            name: 'newExport',
            btnComp: ExcelExportPro,
            childFor: 'buttonText',
            child: billHeaderId
              ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
              : intl.get('hzero.common.button.newExport').d('(新)导出'),
            hidden: !permsMap.get(`${permfix}.ps.newimport`),
            btnProps: {
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
                loading,
              },
              requestUrl: this.requestNewUrl(),
              queryParams: this.getExportParams(),
              templateCode: `SSTA_BILL_HEADER_PURCHASER_${type}_EXPORT`,
              loading,
            },
          },
          {
            name: 'task',
            child: intl.get('ssta.common.view.title.taskBtn').d('任务进度'),
            hidden: !permsMap.get(`${permfix}.button.taskProgress`),
            btnProps: {
              icon: 'publish2',
              onClick: () => handleViewTaskProgress({ taskDocType: 'BILL' }),
              loading,
            },
          },
        ]
      : [
          {
            name: 'export',
            btnComp: ExcelExport,
            childFor: 'buttonText',
            child: billHeaderId
              ? intl.get('ssta.common.button.tickExport').d('勾选导出')
              : intl.get('ssta.common.button.export').d('导出'),
            hidden: !permsMap.get(`${permfix}.ps.import`),
            btnProps: {
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
                loading,
              },
              requestUrl: this.requestUrl(),
              queryParams: this.getExportParams(),
            },
          },
          {
            name: 'newExport',
            btnComp: ExcelExportPro,
            childFor: 'buttonText',
            child: billHeaderId
              ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
              : intl.get('hzero.common.button.newExport').d('(新)导出'),
            hidden: !permsMap.get(`${permfix}.ps.newimport`),
            btnProps: {
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
                loading,
              },
              method: 'POST',
              allBody: true,
              requestUrl: this.requestNewUrl(),
              queryParams: !isEmpty(ds.selected) ? this.getSelectedKeys() : this.getExportParams(),
              templateCode: 'SSTA_BILL_LINE_PURCHASER_ALL_EXPORT',
            },
          },
        ];
    const btnList = remote
      ? remote.process('SSTA.PURCHASER_BILL_LIST_CUX.BTNS', btns, {
          type,
          ds,
          loading,
          permsMap,
          state: this.state,
          onCreate: this.linkToCreate,
          setState: this.setState.bind(this),
          fetchCount: this.fetchCount,
        })
      : btns;
    return formatDynamicBtns(btnList.filter((btn) => btn && !btn.hidden));
  };

  listColumnsRender = () => {
    const { remote } = this.props;
    const { type, permsMap, statusData, permfix } = this.state;
    return [
      (type === 'APPROVE' || type === 'ALL') && {
        name: 'dragIcon',
        width: 40,
        renderer: ({ value, record }) => {
          const billNum = record.get('billNum');
          const billStatus = record.get('billStatus');
          // const camp = record.get('camp');
          const supplierViewFlag = record.get('supplierViewFlag');
          const confirmCollaborativeMode = record.get('confirmCollaborativeMode');
          // 需要销售方审核的，换成销售方的链接
          // const check = type === 'ALL' && billStatus === 'SUBMITED' && camp === 'PURCHASER';
          const singleCheck = ['SINGLE'].includes(confirmCollaborativeMode)
            ? !['SUBMITED', 'RETURN'].includes(billStatus)
            : true;
          const check =
            Boolean(supplierViewFlag) &&
            !['NEW', 'SUBMITED_APPROVING', 'ES_SUBMITED_APPROVING', 'SYSTEM_SUBMITING'].includes(
              billStatus
            ) &&
            singleCheck;
          return (
            (type === 'ALL'
              ? check
              : ['SUBMITED', 'CANCELING', 'WAIT_SUPPLIER_CANCEL', 'WAIT_SUPPLIER_CONFIRM'].includes(
                  billStatus
                )) && (
              <div className={Styles['im-chat-draggable']}>
                <IMChatDraggable
                  cardCode={
                    type === 'ALL'
                      ? 'SSTA_RECONCILIATION_ATTENTION'
                      : billStatus === 'CANCELING' || billStatus === 'WAIT_SUPPLIER_CANCEL'
                      ? 'SSTA_RECONCILIATION_CANCEL'
                      : 'SSTA_RECONCILIATION_APPROVE'
                  }
                  icon="baseline-drag_indicator"
                  tooltip=""
                  requestBody={{
                    ...record.toData(),
                  }}
                  dragText={`${intl
                    .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billNum')
                    .d('对账单编号')}${billNum}`}
                >
                  {value}
                </IMChatDraggable>
              </div>
            )
          );
        },
      },
      {
        name: 'billStatusMeaning',
        width: 125,
        tooltip: 'overflow',
        // lock: 'left',
        renderer: ({ value, record }) =>
          statusTagRender(value, statusData[record.get('billStatus')]),
      },
      ['ALL', 'APPROVE'].includes(type) && {
        name: 'operation',
        width: 150,
        // lock: 'left',
        renderer: ({ record, dataSet }) => {
          const {
            camp,
            autoIssue,
            cancelCamp,
            billSyncFlag,
            billStatus,
            confirmApproveMethod,
            cancelApproveMethod,
            confirmCollaborativeMode,
            cancelCollaborativeMode,
            billCancelType,
            syncStatus,
            purchaserESignStatus,
            eSignOrder,
            supplierESignStatus,
            purchaserEvidenceStatus,
            supplierEvidenceStatus,
            eSignFlag,
            billErpSyncNode,
            invoiceButtonFlag,
          } = record.toData();
          const btns = [
            {
              type: 'update',
              onClick: () => this.linkToDetail(record, 'UPDATE'),
              title: intl.get('hzero.common.button.edit').d('编辑'),
              main: type === 'UPDATE',
              // 单据状态为“新建”、“已退回”；创建方阵营“采购方”
              show:
                type === 'ALL' && ['NEW', 'RETURN'].includes(billStatus) && camp === 'PURCHASER',
              permissionCodeList: [`${permfix}.ps.radio.button.update`],
            },
            {
              type: 'approve',
              onClick: () => this.handleApprove(record),
              title: intl.get('ssta.common.button.approve').d('审核'),
              main: type === 'APPROVE',
              // 1.单据状态“已提交”，确认-审批方式=功能审批&【协同模式-确认=单边协同，或者协同模式-确认=双边协同&创建方阵营=销售方】；
              // 2.单据状态“取消中”，取消-审批方式=功能审批&& 同步状态未同步/同步成功&【协同模式-取消=单边协同；或者协同模式-取消=双边协同&取消方阵营=销售方】。
              show:
                (billStatus === 'SUBMITED' &&
                  confirmApproveMethod === 'FUNCTIONAL' &&
                  (confirmCollaborativeMode === 'SINGLE' ||
                    (confirmCollaborativeMode === 'DOUBLE' && camp === 'SUPPLIER'))) ||
                (billStatus === 'CANCELING' &&
                  ['UNSYNCHRONIZED', 'SYNC_SUCCESS', 'SYNC_FAILURE'].includes(syncStatus) &&
                  cancelApproveMethod === 'FUNCTIONAL' &&
                  (cancelCollaborativeMode === 'SINGLE' ||
                    (cancelCollaborativeMode === 'DOUBLE' && cancelCamp === 'SUPPLIER'))) ||
                (['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(billStatus) &&
                  dataSet.getState('workflowCaller')?.getApproveFlag(record)),
              permissionCodeList: [`${permfix}.ps.radio.button.audit`],
            },
            // 取消和同步的位置调换
            {
              type: 'cancel',
              onClick: () => this.linkToDetail(record, 'CANCEL'),
              title: intl.get('hzero.common.button.cancel').d('取消'),
              main: type === 'CANCEL',
              // 1.单据状态“已确认”，协同模式-取消=单边协同；
              // 2.单据状态为“已确认”，协同模式-取消=双边协同
              // 若取消类型=ERP发起取消,且同步ERP状态为同步成功，不可以取消
              show:
                type === 'ALL' &&
                billStatus === 'CONFIRM' &&
                autoIssue !== 'EC_BILL' &&
                !(billCancelType === 'ERP' && syncStatus === 'SYNC_SUCCESS'),
              permissionCodeList: [`${permfix}.ps.radio.button.cancel`],
            },
            {
              type: 'sync',
              onClick: () => this.linkToDetail(record, 'SYNC'),
              title: intl.get('hzero.common.button.sync').d('同步'),
              main: type === 'SYNC',
              // 1.单据状态“已确认”，协同模式-取消=单边协同；
              // 2.单据状态为“已确认”，协同模式-取消=双边协同
              show:
                type === 'ALL' &&
                ((billStatus === 'CONFIRM' &&
                  ['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus) &&
                  (billErpSyncNode?.includes('COMPLETED') ||
                    (purchaserESignStatus === 'SIGNED' &&
                      supplierESignStatus === 'SIGNED' &&
                      billErpSyncNode?.includes('SIGNED')))) ||
                  (billStatus === 'CANCELING' && ['ERP_CANCEL_FAILURE'].includes(syncStatus))) &&
                Boolean(billSyncFlag),
              permissionCodeList: [`${permfix}.ps.radio.button.sync`],
            },
            {
              type: 'withdraw',
              title: intl.get('ssta.costSheet.model.costSheet.withdraw').d('撤回'),
              onClick: () => this.handleWithdraw(record),
              show:
                type === 'ALL' &&
                (billStatus === 'SUBMITED' ||
                  (['SUBMITED_APPROVING'].includes(billStatus) &&
                    dataSet.getState('workflowCaller')?.getRevokeFlag(record))) &&
                camp === 'PURCHASER',
              permissionCodeList: [`${permfix}.ps.radio.button.recall`],
              wait: 1000,
            },
            {
              type: 'signature',
              title: intl.get('ssta.common.model.common.eSign').d('签章'),
              onClick: () => this.linkToDetail(record, 'SIGNATURE'),
              show:
                // 对账单状态=已确认且双方不同时已存证
                // 签章顺序=采购方发起，采购方签章状态为“未签章/签章失败”；或者签章顺序=供应商发起，采购方签章状态为“未签章/签章失败”且供应商签章状态为“已签章”
                type === 'ALL' &&
                !(
                  ['EVIDENCED'].includes(purchaserEvidenceStatus) &&
                  ['EVIDENCED'].includes(supplierEvidenceStatus)
                ) &&
                ['CONFIRM'].includes(billStatus) &&
                ['UN_SIGNED', 'SIGN_FAILED'].includes(purchaserESignStatus) &&
                (eSignOrder === 'PURCHASER' ||
                  (eSignOrder === 'SUPPLIER' && ['SIGNED'].includes(supplierESignStatus))) &&
                eSignFlag === 1,
              permissionCodeList: [`${permfix}.ps.radio.button.signature`],
            },
            {
              type: 'proofSearch',
              title: intl.get('ssta.common.model.common.proofSearch').d('存证查询'),
              onClick: () => this.proofSearch(record),
              // 当采购方存证状态为已存证且供应商存证状态为已存证时，在采购方页面显示按钮
              show:
                type === 'ALL' &&
                ['EVIDENCED'].includes(purchaserEvidenceStatus) &&
                ['EVIDENCED'].includes(supplierEvidenceStatus),
              permissionCodeList: [`${permfix}.button.proofSearch`],
              wait: 1000,
            },
            {
              type: 'signatureReject',
              title: intl.get('ssta.common.model.common.rejectSign').d('驳回签章'),
              onClick: () => this.linkToDetail(record, 'SIGNATURE'),
              // 供应商存证状态为已存证，供应商签章状态为已签章& 采购方存证状态为未存证，采购方签章状态为未签章
              show:
                type === 'ALL' &&
                ['CONFIRM'].includes(billStatus) &&
                ['EVIDENCED'].includes(supplierEvidenceStatus) &&
                ['SIGNED'].includes(supplierESignStatus) &&
                ['UN_EVIDENCE'].includes(purchaserEvidenceStatus) &&
                ['UN_SIGNED'].includes(purchaserESignStatus),
              permissionCodeList: [`${permfix}.button.signature-reject`],
            },
            {
              type: 'invoiceRecord',
              onClick: () => this.handleViewInvRecord(record),
              title: intl
                .get('ssta.common.model.common.invoiceStatementRecords')
                .d('发票申请执行记录'),
              // 单据状态为“已确认”；创建方阵营“采购方”
              show: type === 'ALL' && Number(invoiceButtonFlag) === 1,
              permissionCodeList: [`${permfix}.button.invoiceRecord`],
            },
          ];
          const processCommands = remote
            ? remote.process('SSTA.PURCHASER_BILL_LIST_CUX.TABLE_BTNS', btns, {
                type,
                record,
                history,
                dataSet,
                tableDs: this.dsObj[type],
              })
            : btns;
          return <PermissionDropdown permsMap={permsMap} dataSource={processCommands} />;
        },
      },
      {
        name: 'billNum',
        width: 150,
        tooltip: 'overflow',
        renderer: ({ value, record }) => (
          <a onClick={() => this.linkToDetail(record, type)}>{value}</a>
        ),
      },
      (type === 'ALL' || type === 'SYNC') && {
        name: 'syncStatusMeaning',
        width: 160,
        tooltip: 'overflow',
        renderer: ({ value, record }) =>
          statusTagRender(value, tagColor[record?.get('syncStatus')]),
      },
      (type === 'ALL' || type === 'SYNC') && {
        name: 'syncResponseMsg',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'companyName',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'supplierCompanyName',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'currencyCode',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'netAmountMeaning',
        width: 120,
        align: 'right',
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'taxAmountMeaning',
        width: 100,
        align: 'right',
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'taxIncludedAmountMeaning',
        width: 120,
        align: 'right',
        tooltip: 'overflow',
        sortable: true,
        renderer: numberShiledRender,
      },
      {
        name: 'creationDate',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'createdUserName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'campMeaning',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'invOrganizationName',
        width: 130,
        tooltip: 'overflow',
      },
      {
        name: 'sourceSupplierCompanyName',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'sourceSupplierCompanyNum',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'supplierSiteCode',
        width: 150,
        tooltip: 'overflow',
      },
      (type === 'ALL' || type === 'SIGNATURE') && {
        name: 'purchaserESignStatusMeaning',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record }) =>
          statusTagRender(value, tagColor[record?.get('purchaserESignStatus')]),
      },
      (type === 'ALL' || type === 'SIGNATURE') && {
        name: 'supplierESignStatusMeaning',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record }) =>
          statusTagRender(value, tagColor[record?.get('supplierESignStatus')]),
      },
      (type === 'ALL' || type === 'SIGNATURE') && {
        name: 'eSignOrderMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      (type === 'ALL' || type === 'SIGNATURE') && {
        name: 'purchaserEvidenceStatusMeaning',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record }) =>
          statusTagRender(value, tagColor[record?.get('purchaserEvidenceStatus')]),
      },
      (type === 'ALL' || type === 'SIGNATURE') && {
        name: 'supplierEvidenceStatusMeaning',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record }) =>
          statusTagRender(value, tagColor[record?.get('supplierEvidenceStatus')]),
      },
      (type === 'ALL' || type === 'SIGNATURE') && {
        name: 'purchaserESignMsg',
        width: 140,
        tooltip: 'overflow',
      },
      (type === 'ALL' || type === 'SIGNATURE') && {
        name: 'supplierESignMsg',
        width: 140,
        tooltip: 'overflow',
      },
      (type === 'ALL' || type === 'SIGNATURE') && {
        name: 'terminateSignStatus',
        width: 120,
        renderer: ({ value, record }) =>
          statusTagRender(record?.get('terminateSignStatusMeaning'), tagColor[value]),
      },
      type !== 'CANCEL' &&
        type !== 'SYNC' && {
          width: 100,
          name: 'confirmCollaborativeMode',
          renderer: (record) => {
            return record.record.get('confirmCollaborativeModeMeaning')
              ? record.record.get('confirmCollaborativeModeMeaning')
              : '-';
          },
        },
      ['ALL', 'APPROVAL'].includes(type) && {
        name: 'miniApproveProcess',
        header: intl.get('hzero.common.button.approve.process').d('审批进度'),
        width: 200,
        renderer: ({ dataSet, record }) => {
          const billStatus = record.get('billStatus');
          return ['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(billStatus)
            ? dataSet.getState('workflowCaller')?.renderProcess(record)
            : null;
        },
      },
    ];
  };

  detailColumnsRender = () => {
    const { statusData } = this.state;
    return [
      {
        name: 'billStatusMeaning',
        width: 125,
        renderer: ({ value, record }) =>
          statusTagRender(value, statusData[record.get('billStatus')]),
      },
      {
        name: 'billNum',
        width: 150,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          if (value && record.get('lineNum')) {
            return (
              <a onClick={() => this.linkToDetail(record, 'ALL')}>
                {`${value}-${record.get('lineNum')}`}
              </a>
            );
          } else {
            if (value) {
              return <a onClick={() => this.linkToDetail(record, 'ALL')}>{value}</a>;
            }
            if (record.get('lineNum')) {
              return (
                <a onClick={() => this.linkToDetail(record, 'ALL')}>{record.get('lineNum')}</a>
              );
            }
            return '-';
          }
        },
      },
      {
        name: 'settleNum',
        width: 160,
        tooltip: 'overflow',
      },
      {
        name: 'sourceSettleNumAndLineNum',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'companyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'supplierCompanyName',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'currencyCode',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'itemName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'uom',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'quantity',
        width: 120,
        align: 'right',
        tooltip: 'overflow',
      },
      {
        name: 'netPriceMeaning',
        width: 150,
        align: 'right',
        renderer: this.priceShiledRenderAndHighLight,
        tooltip: 'overflow',
      },
      {
        name: 'unitPriceBatch',
        width: 80,
        tooltip: 'overflow',
      },
      {
        name: 'netAmountMeaning',
        width: 150,
        align: 'right',
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'taxRate',
        width: 100,
        align: 'right',
        tooltip: 'overflow',
      },
      {
        name: 'taxAmountMeaning',
        width: 120,
        align: 'right',
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'taxIncludedPriceMeaning',
        width: 130,
        align: 'right',
        renderer: this.priceShiledRenderAndHighLight,
        tooltip: 'overflow',
      },
      {
        name: 'taxIncludedAmountMeaning',
        width: 180,
        align: 'right',
        sortable: true,
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'settleMatchDimensionMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'settleBasePriceMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'settleModeMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'enableQuantity',
        width: 120,
        align: 'right',
        tooltip: 'overflow',
      },
      {
        name: 'orignPriceMeaning',
        width: 120,
        align: 'right',
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'enableAmountMeaning',
        width: 120,
        align: 'right',
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'trxDate',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'poAndLineNum',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'ecPoSubNum',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'sourceParentSettleNumAndLineNum',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'asnAndLineNum',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'orderType',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'purOrganizationName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'invOrganizationName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'purchaseAgentName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'trxTypeCodeMeaning',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'dataSourceMeaning',
        width: 120,
      },
      {
        name: 'sourcePlatformCodeMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'ecBillNum',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'creationDate',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'createdUserName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'campMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'supplierSiteCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'multiDealTrxNum',
        width: 200,
      },
      {
        name: 'multiDealTrxLineNum',
        width: 200,
      },
      {
        name: 'multiDealPoNum',
        width: 200,
      },
      {
        name: 'multiDealPoLineNum',
        width: 200,
      },
      {
        title: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="ssta_bill_line" tablePk={record.get('billLineId')} />
        ),
      },
      {
        name: 'operation',
        width: 120,
        align: 'left',
        renderer: ({ record }) => (
          <a onClick={() => this.viewLineDetail(record)}>
            {intl.get('hzero.common.button.viewDetail').d('查看详情')}
          </a>
        ),
      },
    ];
  };

  // 初始化页面时添加customizeDs默认值
  handleBindSeachBarRef = (ref, value) => {
    const { defaultBillNums } = this.state;
    this.searchBarRef.current[value] = ref;
    const { customizeDs } = ref;
    if (!customizeDs.current) customizeDs.create({});
    customizeDs.current.init({
      billNums: defaultBillNums?.split(','),
    });
  };

  listTableRender = (value, cuxProps = {}) => {
    const { gridCode, searchCode } = cuxProps || {};
    const { defaultBillStatus, defaultCreationDateRange } = this.state;
    const { remote, customizeTable } = this.props;
    const normalConfig = {
      onQuery: (params) => this.handleQuery(params, this.dsObj[value]),
      onFieldChange: this.handleFieldChange,
      fieldProps: {
        companyId: { lovPara: { tenantId } },
        supplierCompanyId: { lovPara: { tenantId } },
        settleConfigNum: { lovPara: { tenantId } },
        sourceSupplierCompanyId: { lovPara: { tenantId } },
        confirmCollaborativeMode: { lovPara: { tenantId } },
        billStatus: {
          // defaultValue为假值时个性化配置才会生效
          defaultValue: defaultBillStatus && (() => defaultBillStatus),
        },
        creationDateRange: {
          // defaultValue为假值时个性化配置才会生效
          defaultValue: defaultCreationDateRange && (() => defaultCreationDateRange),
        },
        creationDate: {
          defaultValue: ({ record }) =>
            dateRangeTransform(defaultCreationDateRange || record.get('creationDateRange'), true),
          dynamicProps: {
            disabled: ({ record }) => {
              const dateRange = defaultCreationDateRange || record.get('creationDateRange');
              return dateRange && dateRange !== 'ALL TIME';
            },
          },
        },
        supplierSiteId: {
          dynamicProps: {
            // 适配多选和供应商值集编码 SSLM.SUPPLIER_CHOOSE
            disabled: ({ record }) => {
              const supplierLovData = record.get('supplierCompanyId');
              if (supplierLovData?.length) {
                return supplierLovData.length > 1 ? true : !supplierLovData[0]?.extSupplierIds;
              }
              return !supplierLovData?.extSupplierIds;
            },
            lovPara: ({ record }) => {
              const supplierLovData = record.get('supplierCompanyId');
              const { extSupplierIds: supplierId } =
                (supplierLovData?.length ? supplierLovData[0] : supplierLovData) || {};
              return {
                supplierId,
                tenantId,
              };
            },
          },
        },
      },
      editorProps: {
        billStatus: {
          optionsFilter: (options) => {
            if (value === 'UPDATE') {
              return ['NEW', 'RETURN'].includes(options.get('value'));
            } else return true;
          },
        },
      },
      left: {
        render: (_, customizeDs) => (
          <MultiTextFilter
            name="billNums"
            dataSet={customizeDs}
            placeholder={intl
              .get('ssta.reconciliationWorkbench.modal.billNum')
              .d('请输入对账单编号查询')}
          />
        ),
      },
    };
    const searchBarConfig = remote
      ? remote.process('SSTA.PURCHASER_BILL_LIST_CUX.SEARCH_BAR_CONFIG', normalConfig, {
          activeKey: value,
        })
      : normalConfig;
    return (
      <div style={{ height: 'calc(100vh - 260px)' }}>
        {customizeTable(
          {
            code: gridCode || `${gridCodePrefix}${value}`,
          },
          <SearchBarTable
            cacheState
            searchCode={searchCode || `${searchCodePrefix}${value}`}
            dataSet={this.dsObj[value]}
            columns={this.listColumnsRender()}
            searchBarRef={(ref) => this.handleBindSeachBarRef(ref, value)}
            searchBarConfig={searchBarConfig}
            // pagination={{ pageSizeOptions: ['20', '50', '100'] }}
            style={{ maxHeight: 'calc(100% - 22px)' }}
          />
        )}
      </div>
    );
  };

  detailRender = (value) => {
    const { customizeTable } = this.props;
    return (
      <div style={{ height: 'calc(100vh - 260px)' }}>
        {customizeTable(
          {
            code: 'SSTA.PURCHASER_BILL_LIST.GRID_DETAIL',
          },
          <SearchBarTable
            cacheState
            searchCode="SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_DETAIL"
            dataSet={this.detailTableDS}
            columns={this.detailColumnsRender()}
            searchBarRef={(ref) => {
              this.searchBarRef.current[value] = ref;
            }}
            searchBarConfig={{
              onQuery: (params) => this.handleQuery(params, this.detailTableDS),
              onFieldChange: this.handleFieldChange,
              fieldProps: {
                companyId: { lovPara: { tenantId } },
                supplierCompanyId: { lovPara: { tenantId } },
                settleConfigNum: { lovPara: { tenantId } },
                trxDate: {
                  defaultValue: ({ record }) =>
                    record.get('trxDateRange') &&
                    dateRangeTransform(record.get('trxDateRange'), true),
                  dynamicProps: {
                    disabled: ({ record }) =>
                      record.get('trxDateRange') && record.get('trxDateRange') !== 'ALL TIME',
                  },
                },
                creationDate: {
                  defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
                  dynamicProps: {
                    disabled: ({ record }) =>
                      record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
                  },
                },
                supplierSiteId: {
                  dynamicProps: {
                    disabled: ({ record }) => {
                      const supplierLovData = record.get('supplierCompanyId');
                      if (supplierLovData?.length) {
                        return supplierLovData.length > 1
                          ? true
                          : !supplierLovData[0]?.extSupplierIds;
                      }
                      return !supplierLovData?.extSupplierIds;
                    },
                    lovPara: ({ record }) => {
                      const supplierLovData = record.get('supplierCompanyId');
                      const { extSupplierIds: supplierId } =
                        (supplierLovData?.length ? supplierLovData[0] : supplierLovData) || {};
                      return {
                        supplierId,
                        tenantId,
                      };
                    },
                  },
                },
              },
              left: {
                render: (_, customizeDs) => (
                  <MultiTextFilter
                    name="billNums"
                    dataSet={customizeDs}
                    placeholder={intl
                      .get('ssta.reconciliationWorkbench.modal.billNum')
                      .d('请输入对账单编号查询')}
                  />
                ),
              },
            }}
            style={{ maxHeight: 'calc(100% - 22px)' }}
          />
        )}
      </div>
    );
  };

  subList = () => {
    const { permsMap, permfix } = this.state;
    return [
      {
        key: 'UPDATE',
        parentKey: 'whole',
        hidden: !permsMap.get(`${permfix}.ps.radio.button.update`),
      },
      {
        key: 'APPROVE',
        parentKey: 'whole',
        hidden: !permsMap.get(`${permfix}.ps.radio.button.audit`),
      },
      {
        key: 'CANCEL',
        parentKey: 'whole',
        hidden: !permsMap.get(`${permfix}.ps.radio.button.cancel`),
      },
      {
        key: 'SYNC',
        parentKey: 'whole',
        hidden: !permsMap.get(`${permfix}.ps.radio.button.sync`),
      },
      {
        key: 'SIGNATURE',
        parentKey: 'whole',
        hidden: !permsMap.get(`${permfix}.ps.radio.button.signature`),
      },
      {
        key: 'ALL',
        parentKey: 'whole',
      },
      {
        key: 'DETAIL',
        parentKey: 'detail',
      },
    ];
  };

  activeKeys = () => {
    const { isDetailTab, type } = this.state;
    if (isDetailTab) {
      return 'detail';
    } else {
      const { hidden } = this.subList().find((item) => item.key === type) || {};
      if (hidden) {
        const { key } =
          this.subList()
            .filter((item) => item.parentKey === 'whole')
            .find((item) => !item.hidden) || {};
        return key.toLowerCase();
      } else {
        return type.toLowerCase();
      }
    }
  };

  handleTabChange = (tabKey) => {
    const { cacheState } = this.props;
    const value = tabKey === 'detail';
    const typeKey = tabKey.toUpperCase();
    cacheState.set('isDetailTab', value);
    cacheState.set('activeKey', typeKey);
    this.fetchCount(typeKey);
    if (value) {
      this.setState({ type: typeKey, isDetailTab: value });
      if (this.searchBarRef.current[typeKey]) {
        this.detailTableDS.query(this.detailTableDS.currentPage);
      }
    } else {
      this.setState({ type: typeKey, isDetailTab: false });
      const ds = this.dsObj[typeKey];
      if (this.searchBarRef.current[typeKey]) ds.query(ds.currentPage);
    }
  };

  getWholeTabPanes = () => {
    const { remote, history } = this.props;
    const { permsMap, permfix, isNew, itemCount } = this.state;
    const normalPanes = [
      {
        type: 'UPDATE',
        tab: intl
          .get('ssta.reconciliationWorkbench.view.title.reconciliationWorkbenchTable.update')
          .d('可维护'),
        hidden: !permsMap.get(`${permfix}.ps.radio.button.update`),
      },
      {
        type: 'APPROVE',
        tab: intl
          .get('ssta.reconciliationWorkbench.view.title.reconciliationWorkbenchTable.approve')
          .d('可审核'),
        hidden: !permsMap.get(`${permfix}.ps.radio.button.audit`),
      },
      {
        type: 'CANCEL',
        tab: intl
          .get('ssta.reconciliationWorkbench.view.title.reconciliationWorkbenchTable.cancel')
          .d('可取消'),
        hidden: !permsMap.get(`${permfix}.ps.radio.button.cancel`),
      },
      {
        type: 'SYNC',
        tab: intl
          .get('ssta.reconciliationWorkbench.view.title.reconciliationWorkbenchTable.sync')
          .d('可同步'),
        hidden: !permsMap.get(`${permfix}.ps.radio.button.sync`),
      },
      {
        type: 'SIGNATURE',
        tab: intl.get('ssta.common.view.title.signature').d('可签章'),
        hidden: !isNew || !permsMap.get(`${permfix}.ps.radio.button.signature`),
      },
      {
        type: 'ALL',
        tab: intl
          .get('ssta.reconciliationWorkbench.view.title.reconciliationWorkbenchTable.all')
          .d('全部'),
      },
    ].map((item) => {
      const key = item.type.toLowerCase();
      return { ...item, key, count: itemCount?.[key] };
    });
    const processPanes = remote
      ? remote.process('SSTA.PURCHASER_BILL_LIST_CUX.WHOLE_TAB_PANELS', normalPanes, {
          history,
          dsObj: this.dsObj,
          state: this.state,
        })
      : [];
    return processPanes.filter((item) => !item.hidden);
  };

  /**
   * 渲染函数
   * @returns Element
   */
  render() {
    const { isDetailTab, type, itemCount } = this.state;
    const { customizeBtnGroup, customizeTabPane } = this.props;
    const wholeTabPanes = this.getWholeTabPanes();
    return (
      <Fragment>
        <Header
          title={intl
            .get('ssta.reconciliationWorkbench.view.title.reconciliationWorkbenchTables')
            .d('采购方对账单工作台')}
        >
          <PermissionBtns type={isDetailTab ? 'detail' : type}>
            {customizeBtnGroup(
              {
                code:
                  type === 'ALL'
                    ? 'SSTA.PURCHASER_BILL_LIST.HEADER_BTNS_ALL'
                    : 'SSTA.PURCHASER_BILL_LIST.HEADER_BTNS',
                pro: true,
              },
              <DynamicButtons
                buttons={this.headerBtnsRender()}
                maxNum={5}
                defaultBtnType="c7n-pro"
              />
            )}
          </PermissionBtns>
        </Header>
        <Content className={`${Styles['ssta-list-content']} ${Styles['ssta-list-tabs']}`}>
          {customizeTabPane(
            {
              code: 'SSTA.PURCHASER_BILL_LIST.TABS',
              cascade: true,
            },
            <Tabs keyboard={false} activeKey={this.activeKeys()} onChange={this.handleTabChange}>
              <TabGroup tab={intl.get(`ssta.common.view.title.wholeTab`).d('整单')} key="whole">
                {wholeTabPanes.map((item) => {
                  const { key, tab, type, count, cuxProps, children } = item;
                  return (
                    <TabPane key={key} tab={tab} count={count}>
                      {children || this.listTableRender(type, cuxProps)}
                    </TabPane>
                  );
                })}
              </TabGroup>
              <TabGroup tab={intl.get(`ssta.common.view.title.detailTab`).d('明细')} key="detail">
                <TabPane
                  tab={intl.get('ssta.common.button.approve.theDetail.thedetailLine').d('对账单行')}
                  key="detail"
                  count={itemCount?.detail}
                >
                  {this.detailRender('DETAIL')}
                </TabPane>
              </TabGroup>
            </Tabs>
          )}
        </Content>
      </Fragment>
    );
  }
}
