/* eslint-disable react/jsx-indent */
/* @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Popover, Tabs } from 'choerodon-ui';
import { isEmpty, upperFirst } from 'lodash';
import { parse, stringify } from 'querystring';
import { observer } from 'mobx-react';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';

import intl from 'utils/intl';
import withRemote from 'utils/remote';
import withProps from 'utils/withProps';
import { SRM_SSTA } from '_utils/config';
import { queryIdpValue } from 'services/api';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import PrintProButton from '_components/PrintProButton';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject, getResponse, isUrl } from 'utils/utils';
import IMChatDraggable from '_components/IMChatDraggable';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import DocFlow from '_components/DocFlow';
import { confirmModal } from '@/routes/Components/ConfirmModal';
import { statusTagRender } from '@/utils/renderer';
import {
  dateRangeTransform,
  formatDynamicBtns,
  transformSupplierData,
  formatNumber,
  transformQselectDate,
} from '@/utils/utils';
import { PermissionDropdown, getPermissions, PermissionBtns } from '@/routes/Components';
import {
  cancelSupplier,
  returnSupplierData,
  comfirmSupplier,
  getStatementWorkbench,
  getReconciliationLineh,
  featchWithdraw,
  submitSupplier,
  proofSearch,
  submitValidate,
  printBillList,
} from '@/services/reconciliationWorkbenchService';
import Styles from '@/routes/common.less';
import { handleViewTaskProgress } from '@/routes/ExecutionProgress/modal';
import { mainTableDs, detailTableDs } from './mainDS';
import { operationDS } from '../pubDS/operationDS';
import CreateModal from './CreateModal';
import DetailDrawerNew from './DetailDrawerNew';
import FilledInfoModal from './FilledInfoModal';
import { tagColor } from '../ReconciliationWorkbench/dic';
import InvoiceStatementRecords from './components/InvoiceStatementRecords';

const numberShiledRender = ({ text, record }) =>
  Number(record.get('priceShiledFlag')) === 1 ? '****' : text;

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;
const gridCodePrefix = 'SSTA.SUPPLIER_BILL_LIST.GRID_';
const searchCodePrefix = 'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_';
// const permPrefix = `srm.settle-account.reconciliation-workbench.supplier.ps.radio.button`;
// const permissionPrefix = `srm.settle-account.reconciliation-workbench.supplier.ps.list.button`;
const { TabPane, TabGroup } = Tabs;

const normalKeys = new Set(['ALL', 'UPDATE', 'APPROVE', 'CANCEL', 'SIGNATURE']);

@withCustomize({
  unitCode: [
    'SSTA.SUPPLIER_BILL_LIST.GRID_ALL',
    'SSTA.SUPPLIER_BILL_LIST.GRID_UPDATE',
    'SSTA.SUPPLIER_BILL_LIST.GRID_APPROVE',
    'SSTA.SUPPLIER_BILL_LIST.GRID_CANCEL',
    'SSTA.SUPPLIER_BILL_LIST.GRID_SIGNATURE',
    'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_SIGNATURE',
    'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_ALL',
    'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_UPDATE',
    'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_APPROVE',
    'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_CANCEL',
    'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_DETAIL',
    'SSTA.SUPPLIER_BILL_LIST.GRID_DETAIL',
    'SSTA.SUPPLIER_BILL_LIST.HEADER_BTNS',
    'SSTA.SUPPLIER_BILL_LIST.TABS',
    'SSTA.SUPPLIER_BILL_LIST.PRE_CONFIRM',
    'SSTA.SUPPLIER_BILL_LIST.PRE_RETURN',
    'SSTA.SUPPLIER_BILL_LIST.HEADER_BTNS_ALL',
    'SSTA.SUPPLIER_BILL_LIST.CANCEL_MODAL',
    'SSTA.SUPPLIER_BILL_LIST.INVOICE_RECORD',
  ],
})
@withRemote({
  code: 'SSTA.SUPPLIER_BILL_LIST_CUX',
  name: 'remote',
})
@formatterCollections({
  code: [
    'ssta.reconciliationWorkbench',
    'ssta.supplySettlePool',
    'ssta.reconciliationWorkbenchSup',
    'hzero.c7nProU',
    'hzero.c7nProUI',
    'ssta.settlePool',
    'sbud.budgeting',
    'ssta.costSheet',
    'entity.attachment',
    'hwfp.common',
    'ssta.common',
    'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup',
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
      SIGNATURE: new DataSet(mainTableDs()),
    };
    const processDsObj = remote
      ? remote.process('SSTA.SUPPLIER_BILL_LIST_CUX.DS_OBJ', dsObj, { tableDS: mainTableDs })
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
export default class index extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search, pathname },
      custConfig,
      dsObj,
      cacheState,
      detailTableDS,
    } = props;
    const isNew = pathname.indexOf('new') > -1;
    const { type: urlType, billNums: defaultBillNums, billStatus: defaultBillStatus } = parse(
      search.substring(1)
    );
    const { fields = [] } = custConfig?.['SSTA.SUPPLIER_BILL_LIST.TABS'] || {};
    const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
    /**
     * 内部状态
     */
    this.state = {
      defaultBillStatus,
      type: urlType || cacheState?.get('activeKey') || fieldCode?.toUpperCase() || 'ALL',
      isDetailTab: cacheState?.get('isDetailTab') || false,
      permsMap: new Map(),
      itemCount: {},
      statusData: {},
      isOpenClearCashed: true, // 记录是否开启清理缓存记录标识
      initFlag: true, // 用来过滤页面渲染时筛选器初次查询
      detailUrl: isNew
        ? '/ssta/new-reconciliation-workbench-supplier/detail'
        : '/ssta/reconciliation-workbench-supplier/detail',
      permfix: isNew
        ? 'srm.settle-account.reconciliation-workbench.ux-supplier'
        : 'srm.settle-account.reconciliation-workbench.supplier',
      isNew,
      defaultBillNums,
    };

    this.dsObj = dsObj;
    this.detailTableDS = detailTableDS;

    /**
     * 操作记录DataSet
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
        getReconciliationLineh({ type: 'supplier' }).then((res) => {
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
        getStatementWorkbench({ action: typeKey, type: 'supplier' }).then((res) => {
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
        getStatementWorkbench({ action: 'ALL', type: 'supplier' }),
        getStatementWorkbench({ action: 'UPDATE', type: 'supplier' }),
        getStatementWorkbench({ action: 'APPROVE', type: 'supplier' }),
        getStatementWorkbench({ action: 'CANCEL', type: 'supplier' }),
        getStatementWorkbench({ action: 'SIGNATURE', type: 'supplier' }),
      ]).then((res) => {
        this.setState({
          itemCount: {
            ...this.state.itemCount,
            all: res[0] ? res[0].totalElements : 0,
            update: res[1] ? res[1].totalElements : 0,
            approve: res[2] ? res[2].totalElements : 0,
            cancel: res[3] ? res[3].totalElements : 0,
            signature: res[4] ? res[4].totalElements : 0,
          },
        });
      });
    }
  };

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
  getPermissions() {
    const { permfix } = this.state;
    const { remote } = this.props;
    const cuxPermCodes = remote
      ? remote.process('SSTA.SUPPLIER_BILL_LIST_CUX.PERMISSION_CODES', [])
      : [];
    getPermissions([
      `${permfix}.ps.radio.button.update`,
      `${permfix}.ps.radio.button.audit`,
      `${permfix}.ps.radio.button.cancel`,
      `${permfix}.ps.radio.button.recall`,
      `srm.settle-account.settle-pool.supply.ps.radio.button.bill`,
      `${permfix}.ps.list.button.confirm`,
      `${permfix}.ps.list.button.return`,
      `${permfix}.ps.list.button.batch_submit`,
      `${permfix}.ps.newimport`,
      `${permfix}.ps.export`,
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
  }

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
    const { billHeaderId, billNum } = record.toData();
    const { detailUrl } = this.state;
    history.push({
      pathname: detailUrl,
      search: stringify(
        Object.assign(action === 'ALL' ? { type: 'ALL' } : { action }, {
          editFlag: ['ALL', 'DETAIL', 'SIGNATURE'].includes(action) ? 0 : 1,
          billList: JSON.stringify([{ billHeaderId, billNum }]),
        })
      ),
    });
  };

  /**
   * 跳转创建页面
   */
  linkToCreate = (params = {}) => {
    const { type } = this.state;
    // 如果结算池没有配置可对账的权限集，就跳转全部tab
    // if (permsMap.get('srm.settle-account.settle-pool.supply.ps.radio.button.bill')) {
    //   history.push('/ssta/supply-settle-pool/list?type=B');
    // } else {
    //   history.push('/ssta/supply-settle-pool');
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
            role: 'supplier',
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

  /**
   * 撤回
   */
  handleWithdraw = (record) => {
    const { type } = this.state;
    const ds = this.dsObj[type];
    Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl.get(`ssta.costSheet.model.costSheet.withdrawning`).d('是否撤回？'),
      onOk: async () => {
        this.setLoading(true);
        const res = getResponse(await featchWithdraw(record.toData()));
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
   * 获取勾选行keys
   * @returns {Array} - 勾选行keys
   */
  getSelectedRowKes = () => {
    const { type } = this.state;
    const ds = this.dsObj[type];
    let selectedRowKeys = [];
    if (!isEmpty(ds.selected)) {
      selectedRowKeys = ds.selected.map((item) => item.toData().budgetId);
    }
    return selectedRowKeys;
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
      'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_DETAIL,SSTA.SUPPLIER_BILL_LIST.GRID_DETAIL';
    return isDetailTab
      ? `/ssta/v1/${getCurrentOrganizationId()}/bill-lines/supplier/export?customizeUnitCode=${customizeUnitCodeLine}`
      : `/ssta/v1/${getCurrentOrganizationId()}/bill-headers/supplier/excel-export/${apiType}?customizeUnitCode=${customizeUnitCode}`;
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
      'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_DETAIL,SSTA.SUPPLIER_BILL_LIST.GRID_DETAIL';
    return isDetailTab
      ? `/ssta/v1/${getCurrentOrganizationId()}/bill-lines/supplier/export/new/post?customizeUnitCode=${customizeUnitCodeLine}`
      : `/ssta/v1/${getCurrentOrganizationId()}/bill-headers/supplier/excel-export/${apiType}?customizeUnitCode=${customizeUnitCode}`;
  };

  /**
   * 获取导出数据
   * @returns Object
   */
  getExportParams = () => {
    const { type, isDetailTab } = this.state;
    const ds = this.dsObj[type];
    if (!isDetailTab) {
      const billHeaderIdList = ds.selected.map((item) => item.toData().billHeaderId).join(',');
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
            'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_DETAIL,SSTA.SUPPLIER_BILL_LIST.GRID_DETAIL',
        });
      }
    }
  };

  getSelectedKeys = () => {
    const billLineIds = this.detailTableDS.selected.map((item) => item.get('billLineId'));
    return filterNullValueObject({
      billLineIds,
      customizeUnitCode:
        'SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_DETAIL,SSTA.SUPPLIER_BILL_LIST.GRID_DETAIL',
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
    const { remote } = this.props;
    const { isDetailTab, type, permsMap, permfix } = this.state;
    const ds = isDetailTab ? this.detailTableDS : this.dsObj[type];
    const loading = ds.status !== 'ready';
    let billHeaderId = '';
    if (!isDetailTab) {
      billHeaderId = ds.selected.map((item) => item.toData().billHeaderId).join(',');
    } else {
      billHeaderId = this.detailTableDS.selected.map((item) => item.get('billLineId')).join(',');
    }
    const btns = !isDetailTab
      ? [
          {
            name: 'submit',
            child: intl.get('hzero.common.button.submit').d('提交'),
            hidden: type !== 'UPDATE' || !permsMap.get(`${permfix}.ps.list.button.batch_submit`),
            btnProps: {
              icon: 'check',
              onClick: () => this.handleOpr(submitSupplier, 'submit'),
              disabled: ds.selected.length === 0,
              loading,
              wait: 1000,
            },
          },
          {
            name: 'confirm',
            child: intl.get('ssta.reconciliationWorkbenchSup.view.title.confirm').d('确认'),
            hidden: type !== 'APPROVE' || !permsMap.get(`${permfix}.ps.list.button.confirm`),
            btnProps: {
              icon: 'check',
              onClick: () => this.operateBeforeConfirm(comfirmSupplier, 'CONFIRM'),
              disabled: ds.selected.length === 0,
              loading,
              wait: 1000,
            },
          },
          {
            name: 'back',
            child: intl.get('ssta.reconciliationWorkbenchSup.view.title.back').d('退回'),
            hidden: type !== 'APPROVE' || !permsMap.get(`${permfix}.ps.list.button.return`),
            btnProps: {
              icon: 'reply',
              onClick: () => this.operateBeforeConfirm(returnSupplierData, 'RETURN'),
              disabled: ds.selected.length === 0,
              loading,
              wait: 1000,
            },
          },
          {
            name: 'create',
            child: intl.get('ssta.reconciliationWorkbenchSup.view.title.creates').d('新建'),
            hidden: type === 'CANCEL' || !permsMap.get(`${permfix}.ps.radio.button.update`),
            btnProps: {
              icon: 'add',
              onClick: () => this.linkToCreate(),
              loading,
            },
          },
          {
            name: 'cancel',
            child: intl.get('ssta.reconciliationWorkbenchSup.view.title.cancel').d('取消'),
            hidden:
              !['UPDATE', 'CANCEL'].includes(type) ||
              !permsMap.get(`${permfix}.ps.radio.button.cancel`),
            btnProps: {
              icon: 'cancel',
              onClick: () => this.operateBeforeConfirm(cancelSupplier, 'CANCEL'),
              loading,
              disabled: ds.selected.length === 0,
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
            hidden: !permsMap.get(`${permfix}.ps.export`),
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
              requestUrl: this.requestUrl(),
              queryParams: this.getExportParams(),
              templateCode: `SSTA_BILL_HEADER_SUPPLIER_${type}_EXPORT`,
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
            hidden: !permsMap.get(`${permfix}.ps.export`),
            btnProps: {
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
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
              },
              method: 'POST',
              allBody: true,
              requestUrl: this.requestNewUrl(),
              queryParams: !isEmpty(ds.selected) ? this.getSelectedKeys() : this.getExportParams(),
              templateCode: 'SSTA_BILL_LINE_SUPPLIER_ALL_EXPORT',
            },
          },
        ];
    const processBtns = remote
      ? remote.process('SSTA.SUPPLIER_BILL_LIST_CUX.BTNS', btns, {
          type,
          ds,
          loading,
          state: this.state,
          onCreate: this.linkToCreate,
          setState: this.setState.bind(this),
          fetchCount: this.fetchCount,
        })
      : btns;
    return formatDynamicBtns(processBtns.filter((btn) => btn && !btn.hidden));
  };

  listColumnsRender = () => {
    const { permsMap, statusData, type, permfix } = this.state;
    const { remote, history } = this.props;
    return [
      (type === 'APPROVE' || type === 'ALL') && {
        name: 'dragIcon',
        width: 40,
        renderer: ({ value, record }) => {
          const billNum = record.get('billNum');
          const billStatus = record.get('billStatus');
          return (
            (type === 'ALL'
              ? !['NEW', 'SYSTEM_SUBMITING'].includes(billStatus)
              : ['SUBMITED', 'CANCELING', 'WAIT_SUPPLIER_CANCEL', 'WAIT_SUPPLIER_CONFIRM'].includes(
                  billStatus
                )) && (
              <div className={Styles['im-chat-draggable']}>
                <IMChatDraggable
                  cardCode={
                    type === 'ALL'
                      ? 'SSTA_RECONCILIATION_ATTENTION_SUP'
                      : billStatus === 'CANCELING' || billStatus === 'WAIT_SUPPLIER_CANCEL'
                      ? 'SSTA_RECONCILIATION_CANCEL_SUP'
                      : 'SSTA_RECONCILIATION_APPROVE_SUP'
                  }
                  icon="baseline-drag_indicator"
                  tooltip=""
                  requestBody={{
                    ...record.toData(),
                  }}
                  dragText={`${intl
                    .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billNum')
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
        width: 100,
        tooltip: 'overflow',
        // lock: 'left',
        renderer: ({ value, record }) =>
          statusTagRender(value, statusData[record.get('billStatus')]),
      },
      ['ALL', 'APPROVE'].includes(type) && {
        name: 'operation',
        width: 150,
        // lock: 'left',
        renderer: ({ record }) => {
          const {
            camp,
            autoIssue,
            cancelCamp,
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
            invoiceButtonFlag,
          } = record.toData();
          const btns = [
            {
              type: 'update',
              onClick: () => this.linkToDetail(record, 'UPDATE'),
              title: intl.get('hzero.common.button.edit').d('编辑'),
              // 显示这些公司+供应商下，单据状态为“新建”、“已退回”；创建方阵营“销售方”
              show: type === 'ALL' && ['NEW', 'RETURN'].includes(billStatus) && camp === 'SUPPLIER',
              permissionCodeList: [`${permfix}.ps.radio.button.update`],
            },
            {
              type: 'approve',
              onClick: () => this.linkToDetail(record, 'APPROVE'),
              title: intl.get('ssta.common.button.approve').d('审核'),
              // 1.单据状态“已提交”，协同模式-确认=双边协同&创建方阵营=采购方&确认-审批方式=功能审批；
              // 2.单据状态“取消中”协同模式-取消=双边协同&取消方阵营=采购方&且取消审批方式=功能审批&& 同步状态未同步/同步成功；
              // 3.单据状态“供应商待确认”或者“供应商待取消”【取消流程的采购方发起双边协同工作流审批】
              show:
                (billStatus === 'SUBMITED' &&
                  confirmApproveMethod === 'FUNCTIONAL' &&
                  confirmCollaborativeMode === 'DOUBLE' &&
                  camp === 'PURCHASER') ||
                (billStatus === 'CANCELING' &&
                  ['UNSYNCHRONIZED', 'SYNC_SUCCESS', 'SYNC_FAILURE'].includes(syncStatus) &&
                  cancelApproveMethod === 'FUNCTIONAL' &&
                  cancelCollaborativeMode === 'DOUBLE' &&
                  cancelCamp === 'PURCHASER') ||
                ['WAIT_SUPPLIER_CONFIRM', 'WAIT_SUPPLIER_CANCEL'].includes(billStatus),
              permissionCodeList: [`${permfix}.ps.radio.button.audit`],
            },
            {
              type: 'cancel',
              onClick: () => this.linkToDetail(record, 'CANCEL'),
              title: intl.get('hzero.common.button.cancel').d('取消'),
              // 单据状态为“已确认”，协同模式-取消=双边协同
              // 若取消类型=ERP发起取消,且同步ERP状态为同步成功，不可以取消
              show:
                type === 'ALL' &&
                billStatus === 'CONFIRM' &&
                cancelCollaborativeMode === 'DOUBLE' &&
                autoIssue !== 'EC_BILL' &&
                !(billCancelType === 'ERP' && syncStatus === 'SYNC_SUCCESS'),
              permissionCodeList: [`${permfix}.ps.radio.button.cancel`],
            },
            {
              type: 'withdraw',
              title: intl.get('ssta.costSheet.model.costSheet.withdraw').d('撤回'),
              onClick: () => this.handleWithdraw(record),
              show:
                type === 'ALL' &&
                ['SUBMITED', 'SUBMITED_APPROVING'].includes(billStatus) &&
                camp === 'SUPPLIER' &&
                !(confirmApproveMethod === 'WORKFLOW' && confirmCollaborativeMode === 'DOUBLE'),
              permissionCodeList: [`${permfix}.ps.radio.button.recall`],
            },
            {
              type: 'signature',
              title: intl.get('ssta.common.model.common.eSign').d('签章'),
              onClick: () => this.linkToDetail(record, 'SIGNATURE'),
              show:
                // 对账单状态=已确认且双方不同时已存证
                // 签章顺序=供应商发起，供应商签章状态为“未签章/签章失败”；或者签章顺序=采购方发起，供应商签章状态为“未签章/签章失败”且采购方签章状态为“已签章”】
                type === 'ALL' &&
                !(
                  ['EVIDENCED'].includes(purchaserEvidenceStatus) &&
                  ['EVIDENCED'].includes(supplierEvidenceStatus)
                ) &&
                ['CONFIRM'].includes(billStatus) &&
                ['UN_SIGNED', 'SIGN_FAILED'].includes(supplierESignStatus) &&
                (eSignOrder === 'SUPPLIER' ||
                  (eSignOrder === 'PURCHASER' && ['SIGNED'].includes(purchaserESignStatus))) &&
                eSignFlag === 1,
              permissionCodeList: [`${permfix}.ps.radio.button.signature`],
            },
            {
              type: 'proofSearch',
              title: intl.get('ssta.common.model.common.proofSearch').d('存证查询'),
              onClick: () => this.proofSearch(record),
              // 当采购方存证状态为已存证且供应商存证状态为已存证时，在供应商页面显示按钮；
              show:
                type === 'ALL' &&
                ['EVIDENCED'].includes(purchaserEvidenceStatus) &&
                ['EVIDENCED'].includes(supplierEvidenceStatus),
              permissionCodeList: [`${permfix}.button.proofSearch`],
            },
            {
              type: 'signatureReject',
              title: intl.get('ssta.common.model.common.rejectSign').d('驳回签章'),
              onClick: () => this.linkToDetail(record, 'SIGNATURE'),
              // 采购方存证状态为已存证，采购方签章状态为已签章& 供应商存证状态为未存证，供应商签章状态为未签章
              show:
                type === 'ALL' &&
                ['CONFIRM'].includes(billStatus) &&
                ['EVIDENCED'].includes(purchaserEvidenceStatus) &&
                ['SIGNED'].includes(purchaserESignStatus) &&
                ['UN_EVIDENCE'].includes(supplierEvidenceStatus) &&
                ['UN_SIGNED'].includes(supplierESignStatus),
              permissionCodeList: [`${permfix}.button.signature-reject`],
            },
            {
              type: 'invoiceRecord',
              onClick: () => this.handleViewInvRecord(record),
              title: intl
                .get('ssta.common.model.common.invoiceStatementRecords')
                .d('发票申请执行记录'),
              show: type === 'ALL' && Number(invoiceButtonFlag) === 1,
              permissionCodeList: [`${permfix}.button.invoiceRecord`],
            },
          ];
          return (
            <PermissionDropdown
              permsMap={permsMap}
              dataSource={
                remote
                  ? remote.process('SSTA.SUPPLIER_BILL_LIST_CUX.TABLE_BTNS', btns, {
                      type,
                      record,
                      history,
                      tableDs: this.dsObj[type],
                    })
                  : btns
              }
            />
          );
        },
      },
      {
        name: 'billNum',
        width: 200,
        tooltip: 'overflow',
        renderer: ({ value, record }) => (
          <a onClick={() => this.linkToDetail(record, type)}>{value}</a>
        ),
      },
      {
        name: 'companyName',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'supplierCompanyName',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'currencyCode',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'netAmountMeaning',
        width: 200,
        align: 'right',
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'taxAmountMeaning',
        width: 200,
        align: 'right',
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'taxIncludedAmountMeaning',
        width: 270,
        align: 'right',
        tooltip: 'overflow',
        sortable: true,
        renderer: numberShiledRender,
      },
      {
        name: 'creationDate',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'createdUserName',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'campMeaning',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'invOrganizationName',
        width: 200,
      },
      {
        name: 'sourceSupplierCompanyName',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'sourceSupplierCompanyNum',
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
      type !== 'CANCEL' && {
        width: 100,
        name: 'confirmCollaborativeMode',
        renderer: (record) => {
          return record.record.get('confirmCollaborativeModeMeaning')
            ? record.record.get('confirmCollaborativeModeMeaning')
            : '-';
        },
      },
      {
        name: 'supplierSiteCode',
        width: 150,
      },
    ];
  };

  detailColumnsRender = () => {
    const { statusData } = this.state;
    return [
      {
        name: 'billStatusMeaning',
        width: 150,
        renderer: ({ value, record }) =>
          statusTagRender(value, statusData[record.get('billStatus')]),
      },
      {
        name: 'billNum',
        width: 150,
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
        width: 150,
      },
      {
        name: 'sourceSettleNumAndLineNum',
        width: 200,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 150,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'uom',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
        align: 'right',
        tooltip: 'overflow',
      },
      {
        name: 'netPriceMeaning',
        width: 150,
        renderer: this.priceShiledRenderAndHighLight,
        align: 'right',
        tooltip: 'overflow',
      },
      {
        name: 'unitPriceBatch',
        width: 150,
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
        width: 150,
        align: 'right',
        tooltip: 'overflow',
      },
      {
        name: 'taxAmountMeaning',
        align: 'right',
        tooltip: 'overflow',
        width: 150,
        renderer: numberShiledRender,
      },
      {
        name: 'taxIncludedPriceMeaning',
        width: 150,
        renderer: this.priceShiledRenderAndHighLight,
        align: 'right',
        tooltip: 'overflow',
      },
      {
        name: 'taxIncludedAmountMeaning',
        width: 270,
        align: 'right',
        tooltip: 'overflow',
        sortable: true,
        renderer: numberShiledRender,
      },
      {
        name: 'settleMatchDimensionMeaning',
        width: 150,
      },
      {
        name: 'settleBasePriceMeaning',
        width: 150,
      },
      {
        name: 'settleModeMeaning',
        width: 150,
      },
      {
        name: 'enableQuantity',
        width: 150,
        align: 'right',
        tooltip: 'overflow',
      },
      {
        name: 'orignPriceMeaning',
        width: 150,
        align: 'right',
        tooltip: 'overflow',
        renderer: numberShiledRender,
      },
      {
        name: 'enableAmountMeaning',
        align: 'right',
        tooltip: 'overflow',
        width: 150,
        renderer: numberShiledRender,
      },
      {
        name: 'trxDate',
        width: 150,
      },
      {
        name: 'poAndLineNum',
        width: 200,
      },
      {
        name: 'ecPoSubNum',
        width: 150,
      },
      {
        name: 'sourceParentSettleNumAndLineNum',
        width: 200,
      },
      {
        name: 'asnAndLineNum',
        width: 200,
      },
      {
        name: 'orderType',
        width: 150,
      },
      {
        name: 'purOrganizationName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'purchaseAgentName',
        width: 150,
      },
      {
        name: 'trxTypeCodeMeaning',
        width: 150,
      },
      {
        name: 'dataSourceMeaning',
        width: 150,
      },
      {
        name: 'sourcePlatformCodeMeaning',
        width: 150,
      },
      {
        name: 'ecBillNum',
        width: 150,
      },
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'createdUserName',
        width: 150,
      },
      {
        name: 'campMeaning',
        width: 150,
      },
      {
        name: 'supplierSiteCode',
        width: 150,
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
        width: 150,
        align: 'left',
        renderer: ({ record }) => (
          <a onClick={() => this.viewLineDetail(record)}>
            {intl.get('hzero.common.button.viewDetail').d('查看详情')}
          </a>
        ),
      },
    ];
  };

  listTableRender = (value, cuxProps = {}) => {
    const { gridCode, searchCode } = cuxProps || {};
    const { remote, customizeTable } = this.props;
    const { defaultBillStatus, defaultCreationDateRange } = this.state;
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
            disabled: ({ record }) => !record.get('supplierCompanyId')?.supplierId,
            lovPara: ({ record }) => ({
              supplierId: record.get('supplierCompanyId')?.supplierId,
              tenantId,
            }),
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
      ? remote.process('SSTA.SUPPLIER_BILL_LIST_CUX.SEARCH_BAR_CONFIG', normalConfig, {
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
            searchBarRef={(ref) => {
              this.searchBarRef.current[value] = ref;
            }}
            searchBarConfig={searchBarConfig}
            // pagination={{ pageSizeOptions: ['20', '50', '100'] }}
            style={{ maxHeight: 'calc(100% - 22px)' }}
          />
        )}
      </div>
    );
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

  detailRender = (value) => {
    const { customizeTable } = this.props;
    return (
      <div style={{ height: 'calc(100vh - 260px)' }}>
        {customizeTable(
          {
            code: 'SSTA.SUPPLIER_BILL_LIST.GRID_DETAIL',
          },
          <SearchBarTable
            cacheState
            searchCode="SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_DETAIL"
            dataSet={this.detailTableDS}
            columns={this.detailColumnsRender()}
            searchBarRef={(ref) => this.handleBindSeachBarRef(ref, value)}
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
                    disabled: ({ record }) => !record.get('supplierCompanyId')?.supplierId,
                    lovPara: ({ record }) => ({
                      supplierId: record.get('supplierCompanyId')?.supplierId,
                      tenantId,
                    }),
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
            // pagination={{ pageSizeOptions: ['20', '50', '100'] }}
            style={{ maxHeight: 'calc(100% - 22px)' }}
          />
        )}
      </div>
    );
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
      this.setState({ isDetailTab: value, type: typeKey });
      if (this.searchBarRef.current[typeKey]) {
        this.detailTableDS.query(this.detailTableDS.currentPage);
      }
    } else {
      this.setState({ type: typeKey, isDetailTab: false });
      const ds = this.dsObj[typeKey];
      if (this.searchBarRef.current[typeKey]) ds.query(ds.currentPage);
    }
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

  getWholeTabPanes = () => {
    const { remote, history } = this.props;
    const { permsMap, permfix, isNew, itemCount } = this.state;
    const normalPanes = [
      {
        type: 'UPDATE',
        tab: intl
          .get('ssta.reconciliationWorkbenchSup.view.title.reconciliationWorkbenchTable.update')
          .d('可维护'),
        hidden: !permsMap.get(`${permfix}.ps.radio.button.update`),
      },
      {
        type: 'APPROVE',
        tab: intl
          .get('ssta.reconciliationWorkbenchSup.view.title.reconciliationWorkbenchTable.approve')
          .d('可审核'),
        hidden: !permsMap.get(`${permfix}.ps.radio.button.audit`),
      },
      {
        type: 'CANCEL',
        tab: intl
          .get('ssta.reconciliationWorkbenchSup.view.title.reconciliationWorkbenchTable.cancel')
          .d('可取消'),
        hidden: !permsMap.get(`${permfix}.ps.radio.button.cancel`),
      },
      {
        type: 'SIGNATURE',
        tab: intl.get('ssta.common.view.title.signature').d('可签章'),
        hidden: !isNew || !permsMap.get(`${permfix}.ps.radio.button.signature`),
      },
      {
        type: 'ALL',
        tab: intl
          .get('ssta.reconciliationWorkbenchSup.view.title.reconciliationWorkbenchTable.all')
          .d('全部'),
      },
    ].map((item) => {
      const key = item.type.toLowerCase();
      return { ...item, key, count: itemCount?.[key] };
    });
    const processPanes = remote
      ? remote.process('SSTA.SUPPLIER_BILL_LIST_CUX.WHOLE_TAB_PANELS', normalPanes, {
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
            .get('ssta.reconciliationWorkbenchSup.view.title.supplierReconciliationWorkbench')
            .d('销售方对账单工作台')}
        >
          <PermissionBtns type={isDetailTab ? 'detail' : type}>
            {customizeBtnGroup(
              {
                code:
                  type === 'ALL'
                    ? 'SSTA.SUPPLIER_BILL_LIST.HEADER_BTNS_ALL'
                    : 'SSTA.SUPPLIER_BILL_LIST.HEADER_BTNS',
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
              code: 'SSTA.SUPPLIER_BILL_LIST.TABS',
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
