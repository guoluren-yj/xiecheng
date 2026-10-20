/* @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Tabs, Tooltip, Icon, Modal, Button } from 'choerodon-ui/pro';
// import { Popover } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { parse, stringify } from 'querystring';
import { observer } from 'mobx-react';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { SRM_SSTA } from '_utils/config';
import { queryIdpValue } from 'services/api';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import PrintProButton from '_components/PrintProButton';
import Import from 'components/Import';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { statusTagRender } from '@/utils/renderer';
import WorkflowCaller from '@/components/WorkflowCaller';
import {
  dateRangeTransform,
  formatDynamicBtns,
  transformSupplierData,
  confirmDocNegAction,
  transformQselectDate,
} from '@/utils/utils';
import {
  reverse,
  push,
  getExpenseList,
  updateSync,
  sync,
  saveLineDatasApi,
  print,
  getExpenseDetailList,
  copy,
  submitValidate,
  submitBatch,
  confirmBatch,
  returnBatch,
  revoke,
} from '@/services/costSheetService';
import { PermissionDropdown, getPermissions } from '@/routes/Components';
import remote from 'hzero-front/lib/utils/remote';
// import './index.less';
import Styles from '@/routes/common.less';
import { mainTableDs, detailTableDs } from './mainDS';
import MultiTextFilter from '../Components/MultiTextFilter';
import FilledInfoModal from './DetailNew/FilledInfoModal';
import ExeResult from './DetailNew/ExeResult';
import { tagColor } from '../ReconciliationWorkbench/dic';

import style from './DetailNew/index.less';

const { TabPane, TabGroup } = Tabs;

// 权限编码前缀
// const permPrefix = `srm.settle-account.cost-sheet.cost-sheet.ps.radio.button`;

const unitCodes = [
  'SSTA.COST_SHEET_LIST.GRID',
  'SSTA.COST_SHEET_LIST.SEARCH_BAR',
  'SSTA.COST_SHEET_LIST.HEADER_BTNS',
  'SSTA.COST_SHEET_LIST.TAB',
  'SSTA.COST_SHEET_LIST.REVERSE',
  'SSTA.COST_SHEET_LIST.GRID_DETAIL',
  'SSTA.COST_SHEET_LIST.SEARCH_BAR_DETAIL',
  'SSTA.COST_SHEET_LIST.RETURN',
  'SSTA.COST_SHEET_LIST.CONFIRM',
];

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

@remote({
  code: 'SSTA_COSTSHEET_LIST',
  name: 'remote',
})
@withCustomize({
  unitCode: unitCodes,
})
@formatterCollections({
  code: [
    'ssta.costSheet',
    'hzero.c7nProU',
    'hzero.c7nProUI',
    'sbud.budgeting',
    'ssta.settlePool',
    'entity.attachment',
    'hwfp.common',
    'hzero.common',
    'ssta.purchaseSettlePool',
    'ssta.common',
  ],
})
@withProps(
  () => {
    const cacheState = new Map();
    const dsObj = {
      ALL: new DataSet(mainTableDs()),
      UPDATE: new DataSet(mainTableDs()),
      APPROVAL: new DataSet(mainTableDs()),
      COMPLETED: new DataSet(mainTableDs()),
      SYNC: new DataSet(mainTableDs()),
      DETAIL: new DataSet(detailTableDs()),
    };
    return {
      dsObj,
      cacheState,
      detailDs: new DataSet(detailTableDs()),
    };
  },
  { cacheState: true }
)
@observer
export default class costSheet extends Component {
  constructor(props) {
    super(props);
    this.searchBarRef = { current: {} };
    const {
      dsObj,
      cacheState,
      location: { search, pathname },
      custConfig,
      detailDs,
    } = props;
    const { type: urlChargeType } = parse(search.substring(1));
    const isNew = pathname.indexOf('new') > -1;
    const { fields = [] } = custConfig?.['SSTA.COST_SHEET_LIST.TAB'] || {};
    const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
    /**
     * 内部状态
     */
    this.state = {
      chargeType:
        urlChargeType || cacheState?.get('activeKey') || fieldCode?.toUpperCase() || 'ALL', // 当前 tab 页编码
      permsMap: props.permsMap || new Map(), // 权限集数据 map
      // tableDisplay: 'flat', // 聚合图
      itemCount: {}, // tab 页标题计数
      statusData: {}, // 费用单状态值集
      isOpenClearCashed: true, // 记录是否开启清理缓存记录标识
      initFlag: true, // 用来过滤页面渲染时筛选器初次查询,
      detailUrl: isNew ? '/ssta/new-cost-sheet/detail' : '/ssta/cost-sheet/detail',
      creatUrl: isNew ? '/ssta/new-cost-sheet/detail-create' : '/ssta/cost-sheet/detail-create',
      importUrl: isNew ? '/ssta/new-cost-sheet/data-import' : '/ssta/cost-sheet/data-import',
      backUrl: isNew ? '/ssta/new-cost-sheet/list' : '/ssta/cost-sheet/list',
      permfix: isNew
        ? 'srm.settle-account.cost-sheet.ux-cost-sheet'
        : 'srm.settle-account.cost-sheet.cost-sheet',
      isNew,
    };

    this.dsObj = dsObj;
    this.detailDs = detailDs;
  }

  /**
   * 组件挂载后触发方法
   */
  componentDidMount() {
    this.init();
    this.getPermissions();
    this.getExpenseList();
    this.fetchLov();
    this.addWorkflowCaller();
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
    const { type: urlChargeType } = parse(search.substring(1));
    const { type: prevUrlChargeType } = parse(prevSearch.substring(1));
    if (prevUrlChargeType !== urlChargeType && urlChargeType) {
      this.setChargeType(urlChargeType);
    }
  }

  setChargeType = (chargeType) => {
    this.setState({ chargeType });
  };

  /**
   * dataSet 添加查询参数
   */
  init = () => {
    Object.entries(this.dsObj).forEach(([chargeType, ds]) => {
      ds.setQueryParameter('chargeType', chargeType);
    });
    this.detailDs.setQueryParameter('chargeType', 'DETAIL');
  };

  addWorkflowCaller = () => {
    this.dsObj.ALL.setState('workflowCaller', new WorkflowCaller(this.dsObj.ALL));
    this.dsObj.APPROVAL.setState('workflowCaller', new WorkflowCaller(this.dsObj.APPROVAL));
  };

  removeWorkflowCaller = () => {
    this.dsObj.ALL.getState('workflowCaller').destroy();
    this.dsObj.APPROVAL.getState('workflowCaller').destroy();
  };

  /**
   * 获取权限集数据
   */
  getPermissions = async () => {
    const { permfix } = this.state;
    const data = await getPermissions([
      `${permfix}.ps.radio.button.update`,
      `${permfix}.ps.radio.button.audit`,
      `${permfix}.ps.radio.button.completed`,
      `${permfix}.ps.button.excel`,
      `${permfix}.ps.export`,
      `${permfix}.ps.newexport`,
      `${permfix}.ps.newimport`,
      `${permfix}.ps.radio.button.sync`,
      `${permfix}.ps.radio.button.syncconfig`,
      `${permfix}.button.print`,
      `${permfix}.button.new-print-list`,
      `${permfix}.button.linedetail`,
      `${permfix}.button.copylist`,
      `${permfix}.button.approveList`,
      `${permfix}.button.submitList`,
      `${permfix}.button.withdraw`,
    ]);
    if (data) {
      this.setState({
        permsMap: data,
      });
    }
  };

  /**
   * 获取 tab 页标题技术
   */
  getExpenseList = (chargeType) => {
    // chargeType有值精确查询
    if (chargeType) {
      if (chargeType === 'DETAIL') {
        getExpenseDetailList().then((res) => {
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
        getExpenseList({
          chargeType: chargeType === 'APPROVAL' ? 'PURCHASER_APPROVAL' : chargeType,
        }).then((res) => {
          if (res) {
            this.setState({
              itemCount: {
                ...this.state.itemCount,
                [chargeType.toLowerCase()]: res.totalElements || 0,
              },
            });
          }
        });
      }
    } else {
      Promise.all([
        getExpenseList({ chargeType: 'ALL' }),
        getExpenseList({ chargeType: 'UPDATE' }),
        getExpenseList({ chargeType: 'PURCHASER_APPROVAL' }),
        getExpenseList({ chargeType: 'COMPLETED' }),
        getExpenseList({ chargeType: 'SYNC' }),
      ]).then((res) => {
        this.setState({
          itemCount: {
            all: res[0] ? res[0].totalElements : 0,
            update: res[1] ? res[1].totalElements : 0,
            approval: res[2] ? res[2].totalElements : 0,
            completed: res[3] ? res[3].totalElements : 0,
            sync: res[4] ? res[4].totalElements : 0,
          },
        });
      });
    }
  };

  /**
   * 查询费用单状态值集
   */
  fetchLov = async () => {
    const data = await queryIdpValue('SSTA.CHARGE_STATUS');
    if (data) {
      const statusData = {};
      data.forEach(({ value, tag }) => {
        statusData[value] = tag;
      });
      this.setState({ statusData });
    }
  };

  setLoading = (flag) => {
    const { chargeType } = this.state;
    const ds = this.dsObj[chargeType];
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
  handleQuery = async ({ params }) => {
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
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
    }
  };

  /**
   * 切换 tab 页响应函数
   * @param {String} value 目标 tab 页编码
   */
  handleChange = (value) => {
    const { cacheState } = this.props;
    const chargeType = value.toUpperCase();
    this.getExpenseList(chargeType);
    this.setState({ chargeType });
    cacheState.set('activeKey', chargeType);
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    if (this.searchBarRef.current[chargeType]) ds.query(ds.currentPage);
  };

  /**
   * 响应头创建按钮点击
   */
  linkToCreate = () => {
    const { history } = this.props;
    const { creatUrl } = this.state;
    history.push({
      pathname: creatUrl,
      search: stringify({ updateFlag: 1 }),
    });
  };

  /**
   * 响应行单号点击
   * @param {Object} record 行记录
   */
  linkToDetail = (record, chargeType) => {
    const { history } = this.props;
    const { detailUrl } = this.state;
    const { approveMethod, chargeHeaderId } = record.get(['approveMethod', 'chargeHeaderId']);
    if (chargeType === 'APPROVAL') {
      history.push({
        pathname: detailUrl,
        search: stringify({
          chargeHeaderId,
          updateFlag: 0,
          approveFlag: approveMethod === 'WORKFLOW' ? 0 : 1,
        }),
      });
    } else if (chargeType === 'COMPLETED') {
      history.push({
        pathname: detailUrl,
        search: stringify({
          chargeHeaderId,
          updateFlag: 0,
          reverseFlag: 1,
        }),
      });
    } else if (chargeType === 'SYNC') {
      history.push({
        pathname: detailUrl,
        search: stringify({
          chargeHeaderId,
          updateFlag: 0,
          syncFlag: 1,
        }),
      });
    } else if (chargeType === 'ALL') {
      history.push({
        pathname: detailUrl,
        search: stringify({
          chargeHeaderId,
          updateFlag: 0,
          type: 'ALL',
        }),
      });
    } else {
      history.push({
        pathname: detailUrl,
        search: stringify({
          chargeHeaderId,
          updateFlag: chargeType === 'ALL' || chargeType === 'DETAIL' ? 0 : 1,
        }),
      });
    }
  };

  /**
   * 响应行冲销按钮点击
   * @param {Object} record 行记录
   */
  linkToReverseDetail = (record) => {
    const { history } = this.props;
    const { detailUrl } = this.state;
    history.push({
      pathname: detailUrl,
      search: stringify({
        chargeHeaderId: record.get('chargeHeaderId'),
        updateFlag: 0,
        reverseFlag: 1,
      }),
    });
  };

  linkToSyncDetail = (record) => {
    const { history } = this.props;
    const { detailUrl } = this.state;
    history.push({
      pathname: detailUrl,
      search: stringify({
        chargeHeaderId: record.get('chargeHeaderId'),
        updateFlag: 0,
        syncFlag: 1,
      }),
    });
  };

  /**
   * 响应行审批按钮点击
   * @param {Object} record 行记录
   */
  approveRecord = (record) => {
    const { history } = this.props;
    const { detailUrl, chargeType } = this.state;
    const ds = this.dsObj[chargeType];
    const { approveMethod, chargeHeaderId } = record.get(['approveMethod', 'chargeHeaderId']);
    if (approveMethod === 'WORKFLOW') {
      this.dsObj[chargeType].getState('workflowCaller').goApprove({
        record,
        onSuccess: () => {
          notification.success();
          ds.query();
          this.getExpenseList();
        },
      });
      return;
    }
    history.push({
      pathname: detailUrl,
      search: stringify({
        chargeHeaderId,
        updateFlag: 0,
        approveFlag: 1,
      }),
    });
  };

  /**
   * 响应行维护按钮点击
   * @param {Object} record 行记录
   * @param {Object} closeModal 审批记录弹窗
   */
  updateDetail = (record, closeModal) => {
    const chargeHeaderId = record.get('chargeHeaderId');
    const { detailUrl } = this.state;
    if (closeModal) {
      closeModal.close();
      const { history } = this.props;
      history.push({
        pathname: detailUrl,
        search: stringify({ chargeHeaderId, updateFlag: 1 }),
      });
    } else {
      const { history } = this.props;
      history.push({
        pathname: detailUrl,
        search: stringify({ chargeHeaderId, updateFlag: 1 }),
      });
    }
  };

  /**
   * 响应头撤销按钮点击
   * @param {Object} record 行记录
   */
  reverse = async (record) => {
    const { chargeType } = this.state;
    const ds = this.dsObj[chargeType];
    this.setLoading(true);
    const res = await reverse(record);
    this.setLoading(false);
    if (res) {
      notification.success();
      ds.query();
      this.getExpenseList();
    }
  };

  /**
   * 获取勾选行keys
   * @returns {Array} - 勾选行keys
   */
  getSelectedRowKes = () => {
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    let selectedRowKeys = [];
    if (!isEmpty(ds.selected)) {
      selectedRowKeys = ds.selected.map((item) => item.get('budgetId'));
    }
    return selectedRowKeys;
  };

  //  获取勾选的数据和冲销弹框的内容
  getLineDatasToReverse = (reverseFormData = {}) => {
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    return ds.selected.map((record) => ({
      chargeHeader: {
        chargeHeaderId: record.get('chargeHeaderId'),
        objectVersionNumber: record.get('objectVersionNumber'),
        ...reverseFormData,
      },
    }));
  };

  /**
   * 获取导出接口的参数
   * @returns {Object} 导出参数
   */
  getExportParams = () => {
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    const chargeIds = ds.selected.map((item) => item.get('chargeHeaderId')).join();
    const formParams = ds.queryDataSet.current?.toData() ? ds.queryDataSet.current?.toData() : {};
    const dateTime = formParams.date || {};
    if (chargeIds) {
      return filterNullValueObject({
        chargeIds,
        chargeType: chargeType === 'APPROVAL' ? 'PURCHASER_APPROVAL' : chargeType,
        customizeUnitCode: `SSTA.COST_SHEET_LIST.GRID,SSTA.COST_SHEET_LIST.SEARCH_BAR`,
      });
    } else {
      const { supplierCompanyId } = formParams;
      return filterNullValueObject({
        ...formParams,
        ...dateTime,
        ...transformQselectDate(formParams, { creationDateRange: 'creationDate' }),
        ...transformSupplierData(supplierCompanyId),
        chargeIds,
        chargeType: chargeType === 'APPROVAL' ? 'PURCHASER_APPROVAL' : chargeType,
        customizeUnitCode: `SSTA.COST_SHEET_LIST.GRID,SSTA.COST_SHEET_LIST.SEARCH_BAR`,
      });
    }
  };

  /**
   * 获取费用单行导出接口的参数
   * @returns {Object} 导出参数
   */
  getExportDetailParams = () => {
    const ds = this.detailDs;
    const chargeLineIds = ds.selected.map((item) => {
      return item.get('chargeLineId');
    });
    const formParams = ds.queryDataSet.current?.toData() ? ds.queryDataSet.current?.toData() : {};
    if (!isEmpty(chargeLineIds)) {
      return filterNullValueObject({
        chargeIdList: chargeLineIds,
        customizeUnitCode:
          'SSTA.COST_SHEET_LIST.GRID_DETAIL,SSTA.COST_SHEET_LIST.SEARCH_BAR_DETAIL',
      });
    } else {
      delete formParams.__dirty;
      return filterNullValueObject({
        ...formParams,
        ...transformQselectDate(formParams, { creationDateRange: 'creationDate' }),
        customizeUnitCode:
          'SSTA.COST_SHEET_LIST.GRID_DETAIL,SSTA.COST_SHEET_LIST.SEARCH_BAR_DETAIL',
      });
    }
  };

  /**
   * 响应操作
   * @param {Function} reqFun 接口方法
   */
  handleOpr = async (reqFun, oprType) => {
    const { customizeForm, custConfig, remote: remoteProps } = this.props;
    const { chargeType } = this.state;
    const ds = this.dsObj[chargeType];
    let sendData = await this.getExportParams();
    const { selected } = ds;

    const handleOprRes = async (...params) => {
      const reverseFormData = filterNullValueObject(params?.[1] || {});
      if (['REVERSELIST'].includes(oprType)) sendData = { ...sendData, ...reverseFormData };
      else if (['CONFIRMLIST', 'RETURNLIST'].includes(oprType)) {
        sendData = {
          chargeHeaderIdList: selected.map((item) => item?.get('chargeHeaderId')),
          ...reverseFormData,
          customizeUnitCode:
            'SSTA.COST_SHEET_LIST.GRID, SSTA.COST_SHEET_LIST.SEARCH_BAR,SSTA.COST_SHEET_LIST.CONFIRM,SSTA.COST_SHEET_LIST.RETURN',
        };
      }
      // 冲销操作，先保存后冲销
      if (['REVERSELIST'].includes(oprType)) {
        const saveData = this.getLineDatasToReverse(reverseFormData);
        const saveRes = getResponse(
          await saveLineDatasApi({
            customizeUnitCode: 'SSTA.COST_SHEET_LIST.REVERSE',
            saveData,
          })
        );
        if (!saveRes) return;
      }
      this.setLoading(true);
      const res = getResponse(await reqFun(sendData));
      this.setLoading(false);
      if (res) {
        notification.success();
        await ds.query();
        this.cancelAllSelected(ds);
        this.getExpenseList();
      } else if (['REVERSELIST'].includes(oprType)) await ds.query(ds.currentPage);
    };

    if (sendData) {
      if (['REVERSELIST', 'CONFIRMLIST', 'RETURNLIST'].includes(oprType)) {
        if (remoteProps?.event) {
          const cuxRes = await remoteProps.event.fireEvent('beforeOprModalOpenCux', {
            ds,
            oprType,
          });
          if (cuxRes === false) {
            return false;
          }
        }
        const title = {
          REVERSELIST: intl.get(`ssta.costSheet.view.message.panel.reverseInfo`).d('冲销信息'),
          CONFIRMLIST: intl.get('ssta.costSheet.view.button.approveResolve').d('确认'),
          RETURNLIST: intl.get('ssta.costSheet.view.button.approveReject').d('退回'),
        };
        Modal.open({
          drawer: true,
          key: Modal.key(),
          closable: true,
          className: style['ssta-reverse-modal'],
          title: title[oprType],
          children: (
            <FilledInfoModal
              reqFun={reqFun}
              action={oprType}
              custConfig={custConfig}
              customizeForm={customizeForm}
              onOk={handleOprRes}
            />
          ),
        });
      } else {
        return handleOprRes();
      }
    }
  };

  // 点击打印
  handlePrint = async () => {
    const flag = checkPrintWindow();
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    const sendData = ds.selected.map((item) => item.get('chargeHeaderId'));
    const params = {
      list: sendData,
      responseType: flag ? 'blob' : 'json',
      headers: flag ? {} : { 's-print-using-preview': '1' },
    };
    if (sendData) {
      this.setLoading(true);
      const printRes = getResponse(await print(params));
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

  // 同步
  handleSync = async () => {
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    const sendData = ds.selected.map((item) => item.toData());
    if (sendData) {
      notification.info({
        message: intl
          .get(`ssta.costSheet.view.message.syncTips`)
          .d('批量同步中，请刷新功能页签获取最新单据同步情况，同步失败单据可在「可同步」列表查看'),
      });
      this.setLoading(true);
      const res = getResponse(await sync(sendData));
      this.setLoading(false);
      if (res) {
        const { errorMessage } = res;
        if (errorMessage) {
          notification.error({
            message: errorMessage,
          });
        } else {
          notification.success();
        }
        await ds.query();
        // ds.clearCachedSelected();
        this.cancelAllSelected(ds);
        this.getExpenseList();
      }
    }
  };

  // 点击撤回
  handleWithdraw = async (record) => {
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: intl
        .get('ssta.common.view.message.confirmRevokeApprovalTip')
        .d(
          '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
        ),
      onOk: async () => {
        const res = getResponse(await revoke(record?.get('chargeHeaderId')));
        if (!res) return;
        ds.query();
        this.getExpenseList();
      },
    });
  };

  // 点击批量提交
  handleBatchSubmit = async () => {
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    const sendData = ds.selected.map((item) => item?.toData());
    if (!sendData) return false;
    const validateOk = async () => {
      this.setLoading(true);
      const res = getResponse(
        await submitBatch(sendData, 'SSTA.COST_SHEET_LIST.GRID, SSTA.COST_SHEET_LIST.SEARCH_BAR')
      );
      this.setLoading(false);
      if (!res) return false;
      notification.success();
      ds.query();
      this.cancelAllSelected(ds);
      this.getExpenseList();
    };
    this.setLoading(true);
    const results = await Promise.all(
      sendData.map((item) =>
        submitValidate({
          chargeHeader: { camp: 'PURCHASER', ...item },
          customizeUnitCode: 'SSTA.COST_SHEET_LIST.GRID, SSTA.COST_SHEET_LIST.SEARCH_BAR',
          batchFlag: 1,
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
        // 这里不需要return，不然警告弹窗关不掉
        validateOk();
      }
    };
    const err = results.find((item) => item && item.failed === true);
    const validateErr = results.find((item) => item && item.validatedCode === 'ERROR');
    if (err) {
      getResponse(err);
    } else if (validateErr) {
      notification.error({
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: validateErr.msg,
      });
    } else {
      return checkWarn();
    }
  };

  handleImport = () => {
    const { history } = this.props;
    const { importUrl, backUrl } = this.state;
    history.push({
      pathname: `${importUrl}/SSTA.CHARGE_EXCEL_IMPORT`,
      search: stringify({
        backPath: backUrl,
        action: intl.get('hzero.common.button.import').d('导入'),
        historyButton: false,
        args: JSON.stringify({
          tenantId,
          templateCode: 'SSTA.CHARGE_EXCEL_IMPORT',
          newImportFlag: 0,
        }),
      }),
    });
  };

  viewExeResult = (record) => {
    const title = intl.get(`ssta.costSheet.view.message.panel.viewexeresult`).d('查看执行情况');
    const { history } = this.props;
    this.modal = Modal.open({
      key: 'viewexeresult',
      // mask: false,
      drawer: true,
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-medium-modal'],
      title,
      children: (
        <ExeResult
          record={record}
          chargeHeaderId={record.get('chargeHeaderId')}
          history={history}
        />
      ),
    });
  };

  // 复制
  copyCost = async (record) => {
    const { history } = this.props;
    const action = intl.get('hzero.common.button.copy').d('复制');
    const resVerify = await confirmDocNegAction({
      action,
      documentName: record?.get('chargeNum'),
      documentNum: intl.get('ssta.common.view.message.createCost').d('生成新的费用单'),
    });
    if (!resVerify) return;
    this.setLoading(true);
    const res = getResponse(await copy({ chargeHeader: record.toData(), chargeLineList: [] }));
    this.setLoading(false);
    if (res) {
      notification.success();
      const { chargeHeader = {} } = res || {};
      const { chargeHeaderId } = chargeHeader;
      const { detailUrl } = this.state;
      history.push({
        pathname: detailUrl,
        search: stringify({
          chargeHeaderId,
          updateFlag: 1,
        }),
      });
    }
  };

  listColumnsRender = () => {
    const { chargeType, permsMap, statusData, permfix } = this.state;
    const { remote: remoteProps, history } = this.props;
    const columns = [
      {
        name: 'chargeStatusMeaning',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record }) =>
          statusTagRender(value, statusData[record.get('chargeStatus')]),
      },
      {
        name: 'chargeNum',
        width: 150,
        tooltip: 'overflow',
        renderer: ({ record, value }) => (
          <a onClick={() => this.linkToDetail(record, chargeType)}>{value}</a>
        ),
      },
      ['ALL', 'APPROVAL'].includes(chargeType) && {
        name: 'operation',
        width: 140,
        renderer: ({ record, dataSet }) => {
          const {
            camp,
            syncStatus,
            chargeStatus,
            reverseStatus,
            approveMethod,
            collaborativeMode,
            chargeHeaderSource,
          } =
            record.get([
              'camp',
              'syncStatus',
              'chargeStatus',
              'reverseStatus',
              'approveMethod',
              'collaborativeMode',
              'chargeHeaderSource',
            ]) || {};
          const defaultDataSource = [
            {
              key: 'updateDetail',
              title: intl.get('ssta.costSheet.view.button.update').d('维护'),
              onClick: () => this.updateDetail(record),
              main: chargeType === 'UPDATE',
              // 单据状态为“新建”、“已退回”；创建方阵营“采购方”
              show:
                chargeType === 'ALL' &&
                ['NEW', 'RETURNED'].includes(chargeStatus) &&
                camp === 'PURCHASER',
              permissionCodeList: [`${permfix}.ps.radio.button.update`],
            },
            {
              key: 'approveRecord',
              title: intl.get('ssta.costSheet.view.button.approve').d('审核'),
              onClick: () => this.approveRecord(record),
              main: chargeType === 'APPROVAL',
              // 单据状态“已提交”，审批方式=功能审批&【协同模式=单边协同，或者协同模式=双边协同&创建方阵营=销售方】
              show:
                (chargeStatus === 'SUBMITTED' &&
                  approveMethod === 'FUNCTIONAL' &&
                  (collaborativeMode === 'SINGLE' ||
                    (collaborativeMode === 'DOUBLE' && camp === 'SUPPLIER'))) ||
                (['SUBMITTED_FOR_APPROVAL', 'REVERSE_WLF_APPROVING'].includes(chargeStatus) &&
                  approveMethod === 'WORKFLOW' &&
                  dataSet.getState('workflowCaller')?.getApproveFlag(record)),
              permissionCodeList: [`${permfix}.ps.radio.button.audit`],
            },
            {
              key: 'linkToReverseDetail',
              title: intl.get('ssta.costSheet.view.button.reverse').d('冲销'),
              onClick: () => this.linkToReverseDetail(record),
              main: chargeType === 'COMPLETED',
              show:
                chargeType === 'ALL' && chargeStatus === 'COMPLETED' && Number(reverseStatus) !== 1,
              permissionCodeList: [`${permfix}.ps.radio.button.completed`],
            },
            {
              key: 'syncDetail',
              title: intl.get('ssta.purchaseSettlePool.view.button.sync').d('同步'),
              onClick: () => this.linkToSyncDetail(record),
              main: chargeType === 'SYNC',
              show:
                chargeType === 'ALL' &&
                ['COMPLETED', 'REVERSED'].includes(chargeStatus) &&
                ['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus),
              permissionCodeList: [`${permfix}.ps.radio.button.sync`],
            },
            {
              key: 'copy',
              title: intl.get('hzero.common.button.copy').d('复制'),
              onClick: () => this.copyCost(record),
              show: chargeType === 'ALL' && ['SRM', 'EXCEL'].includes(chargeHeaderSource),
              permissionCodeList: [`${permfix}.button.copylist`],
              wait: 1500,
            },
            {
              key: 'withdraw', // 功能/工作流/外部系统审批撤回
              title: intl.get('ssta.costSheet.model.costSheet.withdraw').d('撤回'),
              onClick: () => this.handleWithdraw(record),
              permissionCodeList: [`${permfix}.button.withdraw`],
              show:
                chargeType === 'ALL' &&
                ((camp === 'PURCHASER' &&
                  ((['SUBMITTED_FOR_APPROVAL'].includes(chargeStatus) &&
                    dataSet.getState('workflowCaller')?.getRevokeFlag(record)) ||
                    ['ES_SUBMITED_APPROVING', 'SUBMITTED'].includes(chargeStatus))) ||
                  (['REVERSE_WLF_APPROVING'].includes(chargeStatus) &&
                    dataSet.getState('workflowCaller')?.getRevokeFlag(record))),
            },
          ];
          const dataSource = remoteProps
            ? remoteProps.process('SSTA_COSTSHEET_LIST_COLUMN_OPERATION', defaultDataSource, {
                record,
                dataSet,
                chargeType,
                history,
              })
            : defaultDataSource;
          return <PermissionDropdown permsMap={permsMap} dataSource={dataSource} />;
        },
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
        width: 80,
        tooltip: 'overflow',
      },
      {
        name: 'netAmount',
        width: 110,
      },
      {
        name: 'taxAmount',
        width: 100,
      },
      {
        name: 'taxIncludedAmount',
        width: 100,
      },
      {
        name: 'creationDate',
        width: 140,
        tooltip: 'overflow',
      },
      {
        name: 'createdByName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'reverseStatusMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'reverseNum',
        width: 180,
        tooltip: 'overflow',
      },
      chargeType === 'SYNC' && {
        name: 'syncStatusMeaning',
        width: 180,
        tooltip: 'overflow',
        renderer: ({ value, record }) =>
          statusTagRender(value, tagColor[record?.get('syncStatus')]),
      },
      chargeType === 'SYNC' && {
        name: 'syncResponseMsg',
        width: 180,
        tooltip: 'overflow',
      },
      chargeType === 'SYNC' && {
        name: 'erpChargeNum',
        width: 180,
        tooltip: 'overflow',
      },
      ['ALL', 'APPROVAL'].includes(chargeType) && {
        name: 'miniApproveProcess',
        header: intl.get('hzero.common.button.approve.process').d('审批进度'),
        width: 200,
        renderer: ({ dataSet, record }) => {
          const { chargeStatus, approveMethod } =
            record.get(['chargeStatus', 'approveMethod']) || {};
          return ['SUBMITTED_FOR_APPROVAL', 'REVERSE_WLF_APPROVING'].includes(chargeStatus) &&
            approveMethod === 'WORKFLOW'
            ? dataSet.getState('workflowCaller')?.renderProcess(record)
            : null;
        },
      },
    ];
    return remoteProps
      ? remoteProps.process('SSTA_COSTSHEET_LIST_COLUMN', columns, { history })
      : columns;
  };

  detailColumnsRender = () => {
    const { statusData, chargeType } = this.state;
    return [
      {
        name: 'chargeStatusMeaning',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record }) =>
          statusTagRender(value, statusData[record.get('chargeStatus')]),
      },
      {
        name: 'chargeNumAndLine',
        width: 140,
        renderer: ({ record }) => (
          <a onClick={() => this.linkToDetail(record, chargeType)}>
            {record.get('chargeNumAndLine')}
          </a>
        ),
      },
      {
        name: 'companyName',
        width: 200,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'operation',
        width: 100,
        renderer: ({ record }) => {
          const chargeStatus = record.get('chargeStatus');
          if (['REVERSED', 'COMPLETED'].includes(chargeStatus)) {
            return (
              <Button
                type="c7n-pro"
                color="primary"
                funcType="link"
                onClick={() => this.viewExeResult(record)}
              >
                {intl.get(`ssta.costSheet.view.message.panel.viewexeresult`).d('查看执行情况')}
              </Button>
            );
          }
        },
      },
      {
        name: 'chargeCode',
        width: 120,
      },
      {
        name: 'chargeName',
        width: 120,
      },
      {
        name: 'netAmount',
        width: 100,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'taxAmount',
        width: 100,
      },
      {
        name: 'taxIncludedAmount',
        width: 100,
      },
      {
        name: 'pcNum',
        width: 120,
      },
      {
        name: 'poNum',
        width: 120,
      },
      {
        name: 'treatmentMethod',
        width: 120,
      },
      {
        name: 'pushSettleStatusMeaning',
        width: 120,
        renderer: ({ value, record }) =>
          statusTagRender(value, tagColor[record?.get('pushSettleStatus')]),
      },
      {
        name: 'pushBackMsgMeaning',
      },
      {
        name: 'reverseLineNum',
        width: 120,
      },
    ];
  };

  listTableRender = () => {
    const { chargeType } = this.state;
    const { remote, customizeTable } = this.props;
    const normalConfig = {
      onQuery: this.handleQuery,
      onFieldChange: this.handleFieldChange,
      fieldProps: {
        supplierCompanyId: { lovPara: { tenantId } },
        creationDate: {
          defaultValue: ({ record }) => dateRangeTransform(record.get('creationDateRange'), true),
          dynamicProps: {
            disabled: ({ record }) =>
              record.get('creationDateRange') && record.get('creationDateRange') !== 'ALL TIME',
          },
        },
      },
      left: {
        render: (_, customizeDs) => (
          <MultiTextFilter
            name="chargeNums"
            dataSet={customizeDs}
            placeholder={intl.get('ssta.costSheet.modal.settleNum').d('请输入费用单编号查询')}
          />
        ),
      },
    };
    const searchBarConfig = remote
      ? remote.process('SSTA_COSTSHEET_LIST.SEARCH_BAR_CONFIG', normalConfig, {
          chargeType,
          dateRangeTransform,
        })
      : normalConfig;
    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SSTA.COST_SHEET_LIST.GRID',
          },
          <SearchBarTable
            cacheState
            searchCode="SSTA.COST_SHEET_LIST.SEARCH_BAR"
            dataSet={this.dsObj[chargeType]}
            columns={this.listColumnsRender()}
            searchBarRef={(ref) => {
              this.searchBarRef.current[chargeType] = ref;
            }}
            searchBarConfig={searchBarConfig}
            style={{ maxHeight: 'calc(100% - 22px)' }}
          />
        )}
      </div>
    );
  };

  detailTableRender = () => {
    const { chargeType } = this.state;
    const { remote, customizeTable } = this.props;
    const normalConfig = {
      onQuery: this.handleQuery,
      onFieldChange: this.handleFieldChange,
      fieldProps: {
        chargeCode: { lovPara: { tenantId } },
        poNum: {
          lovPara: {
            tenantId,
          },
        },
        pcNum: {
          lovPara: {
            tenantId,
          },
        },
        taxCode: {
          lovPara: {
            source: 'EXPENSE',
          },
        },
        costId: {
          lovPara: {
            tenantId,
          },
        },
        creationDate: {
          defaultValue: ({ record }) => dateRangeTransform(record.get('creationDateRange'), true),
          dynamicProps: {
            disabled: ({ record }) =>
              record.get('creationDateRange') && record.get('creationDateRange') !== 'ALL TIME',
          },
        },
      },
      left: {
        render: (_, customizeDs) => (
          <MultiTextFilter
            name="chargeNums"
            dataSet={customizeDs}
            placeholder={intl.get('ssta.costSheet.modal.settleNum').d('请输入费用单编号查询')}
          />
        ),
      },
    };
    const searchBarConfig = remote
      ? remote.process('SSTA_COSTSHEET_LIST.SEARCH_BAR_CONFIG', normalConfig, {
          chargeType,
          dateRangeTransform,
        })
      : normalConfig;
    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SSTA.COST_SHEET_LIST.GRID_DETAIL',
          },
          <SearchBarTable
            cacheState
            searchCode="SSTA.COST_SHEET_LIST.SEARCH_BAR_DETAIL"
            columns={this.detailColumnsRender()}
            dataSet={this.detailDs}
            searchBarRef={(ref) => {
              this.searchBarRef.current[chargeType] = ref;
            }}
            searchBarConfig={searchBarConfig}
            style={{ maxHeight: 'calc(100% - 22px)' }}
          />
        )}
      </div>
    );
  };

  // 获取最新同步配置
  updateSync = async () => {
    const { chargeType } = this.state;
    const ds = this.dsObj[chargeType];
    this.setLoading(true);
    const res = getResponse(await updateSync());
    this.setLoading(false);
    if (!res) return;
    notification.success();
    await ds.query();
  };

  headerBtns = () => {
    const { permsMap, chargeType, permfix } = this.state;
    const { remote: remoteProps } = this.props;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    const { selected } = ds;
    const loading = ds.status !== 'ready';
    const chargeIds = ds.selected.map((item) => item.get('chargeHeaderId')).join();
    const cxFlag =
      selected.length === 0
        ? false
        : selected
            .map((item) => item.toData())
            .every((item) => item.chargeStatus === 'COMPLETED' && Number(item.reverseStatus) === 0);
    const xjFlag =
      selected.length === 0
        ? false
        : selected
            .map((item) => item.toData())
            .every(
              (item) =>
                // 单据状态为已冲销或已完成
                ['COMPLETED', 'REVERSED'].includes(item.chargeStatus) &&
                Number(item.enablePushFlag) === 1
            );
    const approvalDisableFlag =
      selected.length === 0 || selected?.some((v) => v?.get('approveMethod') === 'WORKFLOW');
    const allBtns = [
      chargeType === 'UPDATE' &&
        permsMap.get(`${permfix}.button.submitList`) && {
          name: 'submit',
          child: intl.get('hzero.common.button.submit').d('提交'),
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'check',
            onClick: () => this.handleBatchSubmit(),
            disabled: ds.selected.length === 0,
            loading,
            wait: 1000,
          },
        },
      permsMap.get(`${permfix}.ps.radio.button.update`) && {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'add',
          onClick: this.linkToCreate,
          loading,
        },
      },
      chargeType === 'APPROVAL' &&
        permsMap.get(`${permfix}.button.approveList`) && {
          name: 'approveReject',
          child: intl.get('ssta.costSheet.view.button.approveReject').d('退回'),
          btnProps: {
            icon: 'reply',
            onClick: () => this.handleOpr(returnBatch, 'RETURNLIST'),
            disabled: approvalDisableFlag,
            loading,
            wait: 1000,
          },
        },
      chargeType === 'APPROVAL' &&
        permsMap.get(`${permfix}.button.approveList`) && {
          name: 'approveResolve',
          child: intl.get('ssta.costSheet.view.button.approveResolve').d('确认'),
          btnProps: {
            icon: 'check',
            onClick: () => this.handleOpr(confirmBatch, 'CONFIRMLIST'),
            disabled: approvalDisableFlag,
            loading,
            wait: 1000,
          },
        },
      chargeType === 'SYNC' &&
        permsMap.get(`${permfix}.ps.radio.button.sync`) && {
          name: 'sync',
          child: intl.get('ssta.purchaseSettlePool.view.button.sync').d('同步'),
          btnProps: {
            icon: 'sync',
            type: 'c7n-pro',
            onClick: () => this.handleSync(),
            disabled: selected.length === 0,
            loading,
            wait: 1500,
          },
        },
      chargeType === 'SYNC' &&
        permsMap.get(`${permfix}.ps.radio.button.syncconfig`) && {
          name: 'syncNew',
          child: (
            <>
              {intl.get('ssta.costSheet.model.costSheet.syncNew').d('获取最新同步配置')}
              <Tooltip
                title={intl
                  .get('ssta.costSheet.view.message.syncHelp')
                  .d('适用于业务规则定义中同步配置调整后，刷新单据中的最新同步配置')}
              >
                <Icon
                  style={{ marginLeft: '4px', fontSize: '14px', color: 'rgba(0, 0, 0, 0.5)' }}
                  type="help"
                />
              </Tooltip>
            </>
          ),
          btnProps: {
            icon: 'sync',
            type: 'c7n-pro',
            onClick: () => this.updateSync(),
            loading,
            wait: 1500,
          },
        },
      chargeType !== 'UPDATE' &&
        permsMap.get(`${permfix}.ps.radio.button.completed`) && {
          name: 'chargeAgainst',
          child: intl.get('ssta.costSheet.view.title.chargeAgainst').d('冲销'),
          btnProps: {
            icon: 'cancel',
            type: 'c7n-pro',
            onClick: () => this.handleOpr(reverse, 'REVERSELIST'),
            disabled: !cxFlag,
            loading,
          },
        },
      {
        name: 'pushSettlementPool',
        child: intl.get('ssta.costSheet.view.title.pushSettlementPool').d('推送结算池'),
        btnProps: {
          icon: 'publish2',
          disabled: !xjFlag,
          onClick: () => this.handleOpr(push),
          loading,
          wait: 1500,
        },
      },
      permsMap.get(`${permfix}.button.print`) && {
        name: 'print',
        child: intl.get('hzero.common.button.print').d('打印'),
        btnProps: {
          icon: 'print',
          disabled: selected.length === 0,
          onClick: () => this.handlePrint(),
          loading,
          wait: 1500,
        },
      },
      permsMap.get(`${permfix}.button.new-print-list`) && {
        name: 'newPrint',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        child: intl.get('ssta.common.view.button.newPrint').d('(新)打印'),
        btnProps: {
          buttonProps: { funcType: 'flat', disabled: selected.length === 0 },
          requestUrl: `${apiPrefix}/charge-headers/list-print-new`,
          method: 'PUT',
          data: { chargeHeaderIdList: selected.map((record) => record.get('chargeHeaderId')) },
          loading,
        },
      },
      permsMap.get(`${permfix}.ps.export`) && {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child: chargeIds
          ? intl.get('ssta.costSheet.button.tickExport').d('勾选导出')
          : intl.get('ssta.costSheet.button.export').d('导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: `/ssta/v1/${tenantId}/charge-headers/export`,
          queryParams: this.getExportParams(),
        },
      },
      permsMap.get(`${permfix}.ps.newexport`) && {
        name: 'newExports',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: chargeIds
          ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
          : intl.get('hzero.common.button.newExport').d('(新)导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: `/ssta/v1/${tenantId}/charge-headers/export`,
          queryParams: this.getExportParams(),
          templateCode: 'SSTA_CHARGE_HEADER_PURCHASER_ALL_EXPORT',
          loading,
        },
      },
      permsMap.get(`${permfix}.ps.newimport`) && {
        name: 'newImport',
        btnComp: Import,
        childFor: 'buttonText',
        child: intl.get('hzero.common.button.newImport').d('(新)导入'),
        btnProps: {
          businessObjectTemplateCode: 'SSTA.CHARGE_EXCEL_IMPORT',
          buttonProps: {
            type: 'c7n-pro',
            icon: 'archive',
            funcType: 'flat',
            loading,
          },
          prefixPatch: '/ssta',
          args: {
            tenantId,
            templateCode: 'SSTA.CHARGE_EXCEL_IMPORT',
            newImportFlag: 1,
            camp: 'PURCHASER',
          },
          successCallBack: () => {
            this.dsObj[chargeType].query();
          },
        },
      },
      permsMap.get(`${permfix}.ps.button.excel`) && {
        name: 'import',
        child: intl.get('hzero.common.button.import').d('导入'),
        btnProps: {
          icon: 'archive',
          type: 'c7n-pro',
          onClick: this.handleImport,
          style: { border: '0px', fontWeight: 600 },
          loading,
        },
      },
    ];
    const detailBtns = [
      permsMap.get(`${permfix}.ps.newexport`) && {
        name: 'newExports',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: chargeIds
          ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
          : intl.get('hzero.common.button.newExport').d('(新)导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: `/ssta/v1/${tenantId}/charge-lines/purchaser/detail-line-list/export/new`,
          queryParams: this.getExportDetailParams(),
          templateCode: 'SSTA_CHARGE_HEADER_PURCHASER_DETAIL_EXPORT',
          method: 'POST',
          allBody: true,
          exportAsync: false,
        },
      },
    ];
    const btns = chargeType === 'DETAIL' ? detailBtns : allBtns;
    const btnList = remoteProps
      ? remoteProps.process('SSTA_COSTSHEET_LIST_BTNS', btns, { chargeType, ds })
      : btns;
    return formatDynamicBtns(btnList);
  };

  /**
   * 渲染方法
   * @returns React.Element
   */
  render() {
    const { chargeType, itemCount, permsMap, permfix, isNew } = this.state;
    const { customizeBtnGroup, customizeTabPane } = this.props;
    return (
      <Fragment>
        <Header title={intl.get('ssta.costSheet.view.title.costSheetTable').d('费用单工作台')}>
          {customizeBtnGroup(
            { code: 'SSTA.COST_SHEET_LIST.HEADER_BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} maxNum={5} defaultBtnType="c7n-pro" />
          )}
        </Header>
        <Content className={Styles['ssta-list-content']}>
          {customizeTabPane(
            {
              code: 'SSTA.COST_SHEET_LIST.TAB',
              cascade: true,
            },
            <Tabs
              animated={false}
              keyboard={false}
              activeKey={chargeType.toLowerCase()}
              onChange={this.handleChange}
            >
              <TabGroup tab={intl.get(`ssta.common.view.title.wholeTab`).d('整单')} key="whole">
                {permsMap.get(`${permfix}.ps.radio.button.update`) && (
                  <TabPane
                    key="update"
                    tab={intl.get('ssta.costSheet.view.title.costSheetTable.update').d('可维护')}
                    count={itemCount?.update}
                  >
                    {this.listTableRender()}
                  </TabPane>
                )}
                {permsMap.get(`${permfix}.ps.radio.button.audit`) && (
                  <TabPane
                    key="approval"
                    tab={intl.get('ssta.costSheet.view.title.costSheetTable.approve1').d('可审核')}
                    count={itemCount?.approval}
                  >
                    {this.listTableRender()}
                  </TabPane>
                )}
                {permsMap.get(`${permfix}.ps.radio.button.completed`) && (
                  <TabPane
                    key="completed"
                    tab={intl.get('ssta.costSheet.view.title.costSheetTable.completed').d('可冲销')}
                    count={itemCount?.completed}
                  >
                    {this.listTableRender()}
                  </TabPane>
                )}
                {isNew && permsMap.get(`${permfix}.ps.radio.button.sync`) && (
                  <TabPane
                    key="sync"
                    tab={intl.get('ssta.purchaseSettlePool.view.button.synchronizable').d('可同步')}
                    count={itemCount?.sync}
                  >
                    {this.listTableRender()}
                  </TabPane>
                )}
                <TabPane
                  key="all"
                  tab={intl.get('ssta.costSheet.view.title.costSheetTable.all').d('全部')}
                  count={itemCount?.all}
                >
                  {this.listTableRender()}
                </TabPane>
              </TabGroup>
              <TabGroup tab={intl.get(`ssta.common.view.title.detailTab`).d('明细')} key="detail">
                {permsMap.get(`${permfix}.button.linedetail`) && (
                  <TabPane
                    tab={intl.get('ssta.common.button.cost.costdetailLine').d('费用单行')}
                    key="detail"
                    count={itemCount?.detail}
                  >
                    {this.detailTableRender()}
                  </TabPane>
                )}
              </TabGroup>
            </Tabs>
          )}
        </Content>
      </Fragment>
    );
  }
}
