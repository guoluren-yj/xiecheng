/* @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Tabs, Modal, Button } from 'choerodon-ui/pro';
// import { Popover } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { parse, stringify } from 'querystring';
import { observer } from 'mobx-react';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';
import Import from 'components/Import';

import intl from 'utils/intl';
import remote from 'utils/remote';
import withProps from 'utils/withProps';
import { SRM_SSTA } from '_utils/config';
import { queryIdpValue } from 'services/api';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { statusTagRender } from '@/utils/renderer';
import {
  dateRangeTransform,
  formatDynamicBtns,
  transformQselectDate,
  transformSupplierData,
} from '@/utils/utils';
import {
  reverse,
  getExpenseList,
  print,
  getExpenseDetailList,
  copy,
  revoke,
} from '@/services/costSheetSupService';
import { PermissionDropdown, getPermissions } from '@/routes/Components';
import './index.less';
import Styles from '@/routes/common.less';
import MultiTextFilter from '../Components/MultiTextFilter';
import { mainTableDs, detailTableDs } from './mainDS';
import ExeResult from './DetailNew/ExeResult';
import { tagColor } from '../ReconciliationWorkbench/dic';

const { TabPane, TabGroup } = Tabs;

// 权限编码前缀
// const permPrefix = `srm.settle-account.cost-sheet-sup-cost-sheet.ps.radio.button`;

const unitCodes = [
  'SSTA.COST_SHEET_SUP_LIST.GRID',
  'SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR',
  'SSTA.COST_SHEET_SUP_LIST.TAB',
  'SSTA.COST_SHEET_SUP_LIST.HEADER_BTNS',
  'SSTA.COST_SHEET_SUP_LIST.GRID_DETAIL',
  'SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR_DETAIL',
];

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

@remote({
  code: 'SSTA_COST_SHEET_SUP_LIST',
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
    'ssta.common',
    'ssta.supplySettlePool',
    'ssta.purchaseSettlePool',
  ],
})
@withProps(
  () => {
    const cacheState = new Map();
    const dsObj = {
      ALL: new DataSet(mainTableDs('ALL')),
      UPDATE: new DataSet(mainTableDs('SUPPLIER_UPDATE')),
      APPROVAL: new DataSet(mainTableDs('APPROVAL')),
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
    const { fields = [] } = custConfig?.['SSTA.COST_SHEET_SUP_LIST.TAB'] || {};
    const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
    /**
     * 内部状态
     */
    this.state = {
      isNew,
      chargeType:
        urlChargeType || cacheState?.get('activeKey') || fieldCode?.toUpperCase() || 'ALL', // 当前 tab 页编码
      permsMap: props.permsMap || new Map(), // 权限集数据 map
      // tableDisplay: 'flat', // 聚合图
      itemCount: {}, // tab 页标题计数
      statusData: {}, // 费用单状态值集
      isOpenClearCashed: true, // 记录是否开启清理缓存记录标识
      initFlag: true, // 用来过滤页面渲染时筛选器初次查询
      creatUrl: isNew
        ? '/ssta/new-cost-sheet-sup/detail-create'
        : '/ssta/cost-sheet-sup/detail-create',
      detailUrl: isNew ? '/ssta/new-cost-sheet-sup/detail' : '/ssta/cost-sheet-sup/detail',
      permfix: isNew
        ? 'srm.settle-account.ux-cost-sheet-sup-cost-sheet'
        : 'srm.settle-account.cost-sheet-sup-cost-sheet',
    };

    this.dsObj = dsObj;
    this.detailDs = detailDs;
  }

  /**
   * 组件挂载后触发方法
   */
  componentDidMount() {
    this.getPermissions();
    this.getExpenseList();
    this.fetchLov();
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
   * 获取权限集数据
   */
  getPermissions = async () => {
    const { permfix, isNew } = this.state;
    const data = await getPermissions([
      `${permfix}.ps.radio.button.update`,
      `${permfix}.ps.radio.button.audit`,
      `${permfix}.ps.radio.button.completed`,
      `${permfix}.ps.export`,
      `${permfix}.ps.newexport`,
      `${permfix}.button.print`,
      `${permfix}.button.new-print-list`,
      `${permfix}.ps.linedetail`,
      `${permfix}.button.copylist`,
      `${permfix}.button.newImport`,
      `${permfix}.button.withdraw`,
    ]);
    if (data) {
      if (!isNew) {
        data.set(`${permfix}.ps.radio.button.update`, false);
      }
      this.setState({
        permsMap: data,
      });
    }
  };

  /**
   * 获取 tab 页标题技术
   */
  getExpenseList = (chargeType) => {
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
          chargeType: chargeType === 'UPDATE' ? 'SUPPLIER_UPDATE' : chargeType,
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
        getExpenseList({ chargeType: 'SUPPLIER_UPDATE' }),
        getExpenseList({ chargeType: 'APPROVAL' }),
      ]).then((res) => {
        this.setState({
          itemCount: {
            all: res[0] ? res[0].totalElements : 0,
            update: res[1] ? res[1].totalElements : 0,
            approval: res[2] ? res[2].totalElements : 0,
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
    if (chargeType === 'APPROVAL') {
      history.push({
        pathname: detailUrl,
        search: stringify({
          chargeHeaderId: record.get('chargeHeaderId'),
          updateFlag: 0,
          approveFlag: 1,
        }),
      });
    } else {
      history.push({
        pathname: detailUrl,
        search: stringify({
          chargeHeaderId: record.get('chargeHeaderId'),
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

  /**
   * 响应行审批按钮点击
   * @param {Object} record 行记录
   */
  approveRecord = (record) => {
    const { history } = this.props;
    const { detailUrl } = this.state;
    const { chargeHeaderId } = record.get(['chargeHeaderId']) || {};
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
    const res = await reverse(record);
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
        chargeType: chargeType === 'UPDATE' ? 'SUPPLIER_UPDATE' : chargeType,
        customizeUnitCode: `SSTA.COST_SHEET_SUP_LIST.GRID,SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR`,
      });
    } else {
      const { supplierCompanyId } = formParams;
      return filterNullValueObject({
        ...formParams,
        ...dateTime,
        ...transformQselectDate(formParams, { creationDateRange: 'creationDate' }),
        ...transformSupplierData(supplierCompanyId),
        chargeIds,
        chargeType: chargeType === 'UPDATE' ? 'SUPPLIER_UPDATE' : chargeType,
        customizeUnitCode: `SSTA.COST_SHEET_SUP_LIST.GRID,SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR`,
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
          'SSTA.COST_SHEET_SUP_LIST.GRID_DETAIL,SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR_DETAIL',
      });
    } else {
      delete formParams.__dirty;
      return filterNullValueObject({
        ...formParams,
        ...transformQselectDate(formParams, { creationDateRange: 'creationDate' }),
        customizeUnitCode:
          'SSTA.COST_SHEET_SUP_LIST.GRID_DETAIL,SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR_DETAIL',
      });
    }
  };

  /**
   * 响应操作
   * @param {Function} reqFun 接口方法
   */
  handleOpr = async (reqFun) => {
    const { chargeType } = this.state;
    const ds = this.dsObj[chargeType];
    const sendData = await this.getExportParams();
    if (sendData) {
      const res = getResponse(await reqFun(sendData));
      if (res) {
        notification.success();
        await ds.query();
        ds.clearCachedSelected();
        this.getExpenseList();
      }
    }
  };

  // 点击打印
  handlePrint = async () => {
    const flag = checkPrintWindow();
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    const sendData = ds.selected.map((item) => item.get('chargeHeaderId'));
    if (sendData) {
      this.setLoading(true);
      const params = {
        list: sendData,
        responseType: flag ? 'blob' : 'json',
        headers: flag ? {} : { 's-print-using-preview': '1' },
      };
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

  // 点击撤回
  handleWithdraw = async (record) => {
    const { chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: intl.get(`ssta.costSheet.model.costSheet.withdrawning`).d('是否撤回？'),
      onOk: async () => {
        const res = getResponse(await revoke(record?.get('chargeHeaderId')));
        if (!res) return;
        ds.query();
        this.getExpenseList();
      },
    });
  };

  listColumnsRender = () => {
    const { chargeType, permsMap, statusData, permfix } = this.state;
    const { remote: remoteProps, history } = this.props;
    return [
      {
        name: 'chargeStatusMeaning',
        width: 120,
        tooltip: 'overflow',
        // lock: 'left',
        renderer: ({ value, record }) =>
          statusTagRender(value, statusData[record.get('chargeStatus')]),
      },
      {
        name: 'chargeNum',
        width: 150,
        tooltip: 'overflow',
        // lock: 'left',
        renderer: ({ record }) => (
          <a onClick={() => this.linkToDetail(record, chargeType)}>{record.data.chargeNum}</a>
        ),
      },
      chargeType === 'ALL' && {
        name: 'operation',
        width: 140,
        // lock: 'left',
        renderer: ({ record }) => {
          const { camp, chargeStatus, approveMethod, collaborativeMode, chargeHeaderSource } =
            record.get([
              'camp',
              'chargeStatus',
              'approveMethod',
              'collaborativeMode',
              'chargeHeaderSource',
            ]) || {};
          const defaultDataSource = [
            {
              key: 'updateDetail',
              title: intl.get('ssta.costSheet.view.button.update').d('编辑'),
              onClick: () => this.updateDetail(record),
              main: chargeType === 'UPDATE',
              // 单据状态为“新建”、“已退回”；创建方阵营“销售方”
              show: ['NEW', 'RETURNED'].includes(chargeStatus) && camp === 'SUPPLIER',
              permissionCodeList: [`${permfix}.ps.radio.button.update`],
            },
            {
              key: 'approveRecord',
              title: intl.get('ssta.costSheet.view.button.approve').d('审核'),
              onClick: () => this.approveRecord(record),
              main: chargeType === 'APPROVAL',
              // 1.单据状态“已提交”，创建方阵营=采购方&审批方式=功能审批&协同模式=双边协同；
              // 2.单据状态“供应商待确认”
              show:
                (chargeStatus === 'SUBMITTED' &&
                  camp === 'PURCHASER' &&
                  approveMethod === 'FUNCTIONAL' &&
                  collaborativeMode === 'DOUBLE') ||
                chargeStatus === 'SUPPLIER_TO_BE_CONFIRMED',
              permissionCodeList: [`${permfix}.ps.radio.button.audit`],
            },
            {
              key: 'copy',
              title: intl.get('hzero.common.button.copy').d('复制'),
              onClick: () => this.copyCost(record),
              show: ['SRM', 'EXCEL'].includes(chargeHeaderSource),
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
                camp === 'SUPPLIER' &&
                ['ES_SUBMITED_APPROVING', 'SUBMITTED', 'SUBMITTED_FOR_APPROVAL'].includes(
                  chargeStatus
                ),
            },
          ];
          const dataSource = remoteProps
            ? remoteProps.process('SSTA_COST_SHEET_SUP_LIST_COLUMN_OPERATION', defaultDataSource, {
                record,
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
        width: 150,
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
    ];
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
        width: 160,
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
        width: 110,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'taxAmount',
        width: 110,
      },
      {
        name: 'taxIncludedAmount',
        width: 110,
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
        width: 120,
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
      ? remote.process('SSTA_COST_SHEET_SUP_LIST.SEARCH_BAR_CONFIG', normalConfig, {
          chargeType,
          dateRangeTransform,
        })
      : normalConfig;
    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SSTA.COST_SHEET_SUP_LIST.GRID',
          },
          <SearchBarTable
            cacheState
            searchCode="SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR"
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
      ? remote.process('SSTA_COST_SHEET_SUP_LIST.SEARCH_BAR_CONFIG', normalConfig, {
          chargeType,
          dateRangeTransform,
        })
      : normalConfig;
    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SSTA.COST_SHEET_SUP_LIST.GRID_DETAIL',
          },
          <SearchBarTable
            cacheState
            searchCode="SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR_DETAIL"
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

  headerBtns = () => {
    const { permsMap, permfix, chargeType } = this.state;
    const ds = chargeType === 'DETAIL' ? this.detailDs : this.dsObj[chargeType];
    const { selected } = ds;
    const loading = ds.status !== 'ready';
    const chargeIds = ds.selected.map((item) => item.get('chargeHeaderId')).join();
    const allBtns = [
      permsMap.get(`${permfix}.ps.radio.button.update`) && {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'add',
          color: 'primary',
          onClick: this.linkToCreate,
          loading,
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
          requestUrl: `/ssta/v1/${tenantId}/charge-headers/supplier/export`,
          queryParams: this.getExportParams(),
          loading,
        },
      },
      permsMap.get(`${permfix}.ps.newexport`) && {
        name: 'newExport',
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
          requestUrl: `/ssta/v1/${tenantId}/charge-headers/supplier/export`,
          queryParams: this.getExportParams(),
          templateCode: 'SSTA_CHARGE_HEADER_SUPPLIER_ALL_EXPORT',
        },
      },
      permsMap.get(`${permfix}.button.newImport`) && {
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
            camp: 'SUPPLIER',
          },
          successCallBack: () => {
            this.dsObj[chargeType].query();
          },
        },
      },
    ];
    const detailBtns = [
      permsMap.get(`${permfix}.ps.newexport`) && {
        name: 'newExport',
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
          requestUrl: `/ssta/v1/${tenantId}/charge-lines/supplier/detail-line-list/export/new`,
          queryParams: this.getExportDetailParams(),
          templateCode: 'SSTA_CHARGE_HEADER_SUPPLIER_DETAIL_EXPORT',
          method: 'POST',
          allBody: true,
          exportAsync: false,
        },
      },
    ];
    return formatDynamicBtns(chargeType === 'DETAIL' ? detailBtns : allBtns);
  };

  /**
   * 渲染方法
   * @returns React.Element
   */
  render() {
    const { chargeType, itemCount, permsMap, permfix } = this.state;
    const { customizeTabPane, customizeBtnGroup } = this.props;
    return (
      <Fragment>
        <Header title={intl.get('ssta.costSheet.view.title.costSheetTable').d('费用单工作台')}>
          {customizeBtnGroup(
            { code: 'SSTA.COST_SHEET_SUP_LIST.HEADER_BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} maxNum={5} defaultBtnType="c7n-pro" />
          )}
        </Header>
        <Content className={Styles['ssta-list-content']}>
          {customizeTabPane(
            {
              code: 'SSTA.COST_SHEET_SUP_LIST.TAB',
              cascade: true,
            },
            <Tabs
              animated={false}
              activeKey={chargeType.toLowerCase()}
              onChange={this.handleChange}
            >
              <TabGroup tab={intl.get(`ssta.common.view.title.wholeTab`).d('整单')} key="whole">
                {permsMap.get(`${permfix}.ps.radio.button.update`) && (
                  <TabPane
                    key="update"
                    tab={intl.get('ssta.costSheet.view.title.costSheetTable.update').d('可编辑')}
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

                <TabPane
                  key="all"
                  tab={intl.get('ssta.costSheet.view.title.costSheetTable.all').d('全部')}
                  count={itemCount?.all}
                >
                  {this.listTableRender()}
                </TabPane>
              </TabGroup>
              <TabGroup tab={intl.get(`ssta.common.view.title.detailTab`).d('明细')} key="detail">
                {permsMap.get(`${permfix}.ps.linedetail`) && (
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
