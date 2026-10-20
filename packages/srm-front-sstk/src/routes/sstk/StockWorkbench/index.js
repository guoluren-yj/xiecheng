import React, { useMemo } from 'react';
import qs from 'querystring';
import { Tabs } from 'choerodon-ui';
import { Button, Icon } from 'choerodon-ui/pro';
import { flowRight, isEmpty } from 'lodash';
import withProps from 'utils/withProps';
import { Observer } from 'mobx-react';
import formatterCollections from 'utils/intl/formatterCollections';
// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { filterNullValueObject, getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';

import { useSingleTabs } from '@/hooks/useTabs';
import { confirm } from '@/utils/c7nModal';
import { DropdownMenuBtns } from '@/components/CommonButtons';
import { statusRender } from '@/routes/sstk/components/Tag';
import { openRecordTabs } from '@/utils/drawer/commonDrawer';
import stockRecordRender from './record/stockRecord';
import SubTable from './SubTable';
import { getOptions, handleRevokeApprove } from '../utils';
import getTabs from './tabConfig';
import { fetchDeleteOrder } from './api';

import styles from './index.less';

const { TabPane } = Tabs;

const getWithProps = withProps(
  () => {
    return { tabList: getTabs() };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
);
// 其他页面返回仍停留在当前激活tab
let defaultTabKey = 'ALL';
function StockWorkbench(props) {
  const {
    tabList = [],
    history: { push },
  } = props;
  const [activeKey, onTabChange, { tabsCount, queryTabsCount }] = useSingleTabs(
    defaultTabKey,
    { tabList },
    key => {
      defaultTabKey = key;
    }
  );
  const getCurrentDataset = () => (tabList.find(f => f.key === activeKey) || {}).dataSet;
  const getCurrentTab = () => tabList.find(f => f.key === activeKey) || {};

  const viewDetail = (record, type = '', readOnly = false) => {
    const status = readOnly ? 'read' : 'edit';
    const { wflApproveFlag, wflRevokeApproveFlag, taskId, processInstanceId, workflowBusinessKey } =
      record?.get([
        'wflApproveFlag',
        'wflRevokeApproveFlag',
        'taskId',
        'processInstanceId',
        'workflowBusinessKey',
      ]) || {};
    push({
      pathname: `/sstk/stock-workbench/detail/${status}`,
      search: qs.stringify(
        filterNullValueObject({
          inOutHeaderId: record && record.get('inOutHeaderId'),
          backPath: `/sstk/stock-workbench/list`,
          type: type || (record && record.get('operateType')),
          wflApproveFlag,
          wflRevokeApproveFlag,
          taskId,
          processInstanceId,
          businessKey: workflowBusinessKey?.[0],
        })
      ),
    });
  };

  const query = () => {
    const ds = getCurrentDataset();
    queryTabsCount();
    ds.query(ds.currentPage);
  };

  const handleDeleteOrder = record => {
    confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      content: intl.get('sstk.stockWorkbench.view.confirm.deleteOrder').d(`请确认是否删除库存单？`),
      onOk: async () => {
        const res = getResponse(await fetchDeleteOrder(record.toData()));
        if (res) {
          notification.success();
          query();
        }
      },
    });
  };

  const actionRender = ({ record }) => {
    const {
      statusCode,
      inOutHeaderId,
      wflApproveFlag,
      wflRevokeApproveFlag,
      taskId,
      processInstanceId,
      workflowBusinessKey,
    } = record.get([
      'statusCode',
      'inOutHeaderId',
      'wflApproveFlag',
      'wflRevokeApproveFlag',
      'taskId',
      'processInstanceId',
      'workflowBusinessKey',
    ]);
    const actions = [
      {
        text: intl.get('hzero.common.button.approval').d('审批'),
        event: () =>
          openApproveModal({
            modalProps: {
              closable: true,
            },
            taskId,
            processInstanceId,
            onSuccess: () => query(),
          }),
        show: ['ALL', 'APPROVING'].includes(activeKey) && !!wflApproveFlag,
      },
      {
        text: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
        event: () => handleRevokeApprove(workflowBusinessKey?.[0], () => query()),
        show: ['ALL', 'APPROVING'].includes(activeKey) && !!wflRevokeApproveFlag,
      },
      {
        text: intl.get('hzero.common.button.edit').d('编辑'),
        show: ['NEW', 'REJECTED'].includes(statusCode) && activeKey !== 'RECYCLE',
        event: () => viewDetail(record),
      },
      {
        text: intl.get('hzero.common.button.delete').d('删除'),
        show: ['NEW', 'REJECTED'].includes(statusCode) && activeKey !== 'RECYCLE',
        event: () => handleDeleteOrder(record),
      },
      {
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        event: () =>
          openRecordTabs({
            haswFlow: true,
            headerRecord: record,
            operateArg: {
              url: `/stck/v1/${getCurrentOrganizationId()}/in-out-order-records/list`,
              queryParams: {
                inOutHeaderId,
              },
              operateRenderer: stockRecordRender,
            },
          }),
      },
    ];
    return <span className={styles['action-link-btns']}>{getOptions(actions, 3)}</span>;
  };

  const getPara = param => {
    const { customizeUnitCode, ...other } = param;
    const queryPara = getCurrentDataset().queryDataSet?.current?.toJSONData() || {};
    delete queryPara.__dirty;
    delete queryPara.__id;
    delete queryPara._status;
    return {
      ...queryPara,
      ...getCurrentTab().params,
      customizeUnitCode: `${customizeUnitCode},${getCurrentTab().searchBarCode}`,
      ...other, // 覆盖筛选器单据类型
    };
  };

  const getExportPara = (param = {}) => {
    if (getCurrentDataset()?.selected?.length > 0) {
      const { customizeUnitCode, ...other } = param;
      return {
        headerIdList: getCurrentDataset().selected.map(m => m.get('inOutHeaderId')),
        ...getCurrentTab().params,
        customizeUnitCode: `${customizeUnitCode},${getCurrentTab().searchBarCode}`,
        ...other,
      };
    }
    return getPara(param);
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'statusCodeMeaning',
        width: 130,
        renderer: ({ record, text }) =>
          statusRender(record.get('statusCode'), text, activeKey === 'RECYCLE'),
      },
      {
        name: 'action',
        width: 180,
        renderer: actionRender,
      },
      {
        name: 'orderNum',
        width: 150,
        renderer: ({ record, value }) => (
          <a onClick={() => viewDetail(record, '', true)}>{value}</a>
        ),
      },
      {
        name: 'approvalProgress',
        width: 180,
        show: activeKey === 'APPROVING',
        header: intl.get('sstk.stockWorkbench.view.approvalProgress').d('审批进度'),
        renderer: ({ record }) =>
          isEmpty(record.get('simpleApprovalHistory')) ? (
            '-'
          ) : (
            <ApproveRecordSimple data={record.get('simpleApprovalHistory') || []} />
          ),
      },
      {
        name: 'orderName',
        // width: 150,
      },

      {
        name: 'operateTypeMeaning',
        width: 130,
      },
      {
        name: 'orderTypeMeaning',
        width: 130,
      },
      {
        name: 'realName',
        width: 130,
      },
      {
        name: 'creationDate',
        width: 150,
      },
    ].filter(n => n.show || !('show' in n));
  }, [activeKey]);
  // 单据类型 入库(IN) 出库(OUT) 调拨(TRANSFER)
  const buttons = useMemo(() => {
    return [
      {
        name: 'create',
        comp: DropdownMenuBtns,
        btnProps: {
          width: 110,
          menus: [
            {
              text: intl.get('sstk.stockWorkbench.view.btn.newInStorage').d('新建入库单'),
              event: () => viewDetail(null, 'IN'),
              funcType: 'link',
            },
            {
              text: intl.get('sstk.stockWorkbench.view.btn.newOutStorage').d('新建出库单'),
              event: () => viewDetail(null, 'OUT'),
              funcType: 'link',
            },
            {
              text: intl.get('sstk.stockWorkbench.view.btn.newAllocation').d('新建调拨单'),
              event: () => viewDetail(null, 'TRANSFER'),
              funcType: 'link',
            },
          ],
        },
        getCompChild: () => (
          <Button icon="add" color="primary">
            {intl.get('hzero.common.button.create').d('新建')}
            <Icon
              type="expand_more"
              style={{
                marginLeft: 4,
                marginTop: -2,
                fontSize: '16px',
              }}
            />
          </Button>
        ),
      },
      {
        name: 'export',
        comp: DropdownMenuBtns,
        btnProps: {
          width: 110,
          menus: [
            {
              dataSet: getCurrentDataset(),
              btnComp: (
                <ExcelExportPro
                  templateCode="STCK_IN_OUT_ORDER_IN"
                  exportAsync
                  method="POST"
                  allBody
                  buttonText={intl
                    .get('sstk.stockWorkbench.view.btn.exportInStorage')
                    .d('导出入库单')}
                  requestUrl={`/stck/v1/${getCurrentOrganizationId()}/in-out-order-headers/export`}
                  queryParams={() =>
                    getExportPara({
                      operateType: 'IN',
                      customizeUnitCode: `SSTK.STOCK_DETAIL.IN.ORDER_LINE,SSTK.STOCK_DETAIL.ORDER_LINE`,
                    })
                  }
                  otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'link',
                    icon: '',
                    style: { marginLeft: 0, height: 40 },
                    permissionList: [
                      {
                        code: `sta.srm.mall.stock.stock_change.workbench.button.stock.export-new`,
                        type: 'button',
                        meaning: '库存-导出',
                      },
                    ],
                  }}
                />
              ),
            },
            {
              dataSet: getCurrentDataset(),
              btnComp: (
                <ExcelExportPro
                  templateCode="STCK_IN_OUT_ORDER_OUT"
                  exportAsync
                  method="POST"
                  allBody
                  buttonText={intl
                    .get('sstk.stockWorkbench.view.btn.exportOutStorage')
                    .d('导出出库单')}
                  requestUrl={`/stck/v1/${getCurrentOrganizationId()}/in-out-order-headers/export`}
                  queryParams={() =>
                    getExportPara({
                      operateType: 'OUT',
                      customizeUnitCode: `SSTK.STOCK_DETAIL.OUT.ORDER_HEADER,SSTK.STOCK_DETAIL.OUT_ORDER.LINE`,
                    })
                  }
                  otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'link',
                    icon: '',
                    style: { marginLeft: 0, height: 40 },
                    permissionList: [
                      {
                        code: `sta.srm.mall.stock.stock_change.workbench.button.stock.export-new`,
                        type: 'button',
                        meaning: '库存-导出',
                      },
                    ],
                  }}
                />
              ),
            },
            {
              dataSet: getCurrentDataset(),
              btnComp: (
                <ExcelExportPro
                  templateCode="STCK_IN_OUT_ORDER_TRANSFER"
                  exportAsync
                  method="POST"
                  allBody
                  buttonText={intl
                    .get('sstk.stockWorkbench.view.btn.exportAllocation')
                    .d('导出调拨单')}
                  requestUrl={`/stck/v1/${getCurrentOrganizationId()}/in-out-order-headers/export`}
                  queryParams={() =>
                    getExportPara({
                      operateType: 'TRANSFER',
                      customizeUnitCode: `SSTK.STOCK_DETAIL.TRANSFER.ORDER_HEADER, SSTK.STOCK_DETAIL.TRANSFER_ORDER.LINE`,
                    })
                  }
                  otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'link',
                    icon: '',
                    style: { marginLeft: 0, height: 40 },
                    permissionList: [
                      {
                        code: `sta.srm.mall.stock.stock_change.workbench.button.stock.export-new`,
                        type: 'button',
                        meaning: '库存-导出',
                      },
                    ],
                  }}
                />
              ),
            },
          ],
        },
        getCompChild: () => (
          <Button icon="unarchive" funcType="flat">
            <Observer>
              {() =>
                getCurrentDataset().selected.length > 0
                  ? intl.get('sstk.stockWorkbench.view.button.selectBatchExportNew').d('勾选导出')
                  : intl.get('hzero.common.view.button.export').d('导出')
              }
            </Observer>
            <Icon
              type="expand_more"
              style={{
                marginLeft: 4,
                marginTop: -2,
                fontSize: '16px',
              }}
            />
          </Button>
        ),
      },
    ];
  }, [activeKey]);

  return (
    <>
      <Header title={intl.get('sstk.stockWorkbench.view.title').d('出入库工作台')}>
        {buttons.map(b => {
          const { name, comp: Comp, getCompChild, btnProps = {} } = b;
          return (
            <Comp key={name} {...btnProps}>
              {getCompChild && getCompChild()}
            </Comp>
          );
        })}
      </Header>
      <Content>
        <Tabs
          defaultActiveKey={defaultTabKey}
          activeKey={activeKey}
          onChange={onTabChange}
          customizable
          customizedCode="SSTK.STOCK_WORKBENCH.tabs"
        >
          {tabList.map(m => {
            return (
              <TabPane tab={m.tab} key={m.key} count={tabsCount[m.key]}>
                <SubTable
                  dataSet={m.dataSet}
                  activeKey={activeKey}
                  searchCode={m.searchBarCode}
                  customizedCode={m.tableCode}
                  columns={columns}
                />
              </TabPane>
            );
          })}
        </Tabs>
      </Content>
    </>
  );
}
export default flowRight(
  // withCustomize({ unitCode: getTabs('custCode') }),
  formatterCollections({
    code: ['hzero.common', 'sstk.stockWorkbench', 'sstk.common', 'sagm.common'],
  }),
  getWithProps
)(StockWorkbench);
