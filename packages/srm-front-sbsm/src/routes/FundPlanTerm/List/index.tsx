import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { Fragment, useMemo, useCallback } from 'react';
import { flow, isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { ColumnAlign, TableMode } from 'choerodon-ui/pro/lib/table/interface';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import notification from 'utils/notification';

import type { Operate } from '../utils/type';
import { editPayFundPlan, enablePayFundPlan, revoke, cancelPublish } from '../utils/api';
import { payFundPlanListDS, permissionDS } from './listDS';
import { statusTagRender } from '../../../components/StatusTag';
import { permissionCodeMap, ListCustomizeCode, ListBtnCode } from '../utils/type';
import { formatColumnCommand } from '../../../components/Renderer';
import VersionRecord from '../../../components/HistoryRecord/VersionRecord';
import { formatDynamicBtns } from '../../../utils/utils';

import styles from '../../../common.less';
import ResyncComponent from './components/resync';

interface PayTermsCtrlProps {
  history: any;
  customizeTable: (customizeOptions: object | undefined, tableElement: React.ReactNode) => any;
  customizeBtnGroup: (customizeOptions: object | undefined, tableElement: React.ReactNode) => any;
}

const PayTermsFundingPlanList = flow(
  observer,
  withCustomize({
    unitCode: Object.values(ListCustomizeCode),
    ListBtnCode,
  }),
  formatterCollections({ code: ['sbsm.payTermsCtrl', 'sbsm.common'] }),
)((props: PayTermsCtrlProps) => {
  const { history, customizeTable, customizeBtnGroup } = props;
  const listDs = useMemo<DataSet>(() => new DataSet(payFundPlanListDS()), []);
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;

  const { selected } = listDs;

  const handleQuery = useCallback(({ params, currentPage }) => {
    if (listDs.queryDataSet) listDs.queryDataSet.loadData([params]);
    listDs.query(currentPage);
  }, [listDs]);

  // 跳转至详情页
  const handleToDetail = useCallback((termHeaderId: string | number, operate: Operate, snapshotFlag?: number) => {
    if (!termHeaderId) return;
    history.push({
      pathname: `/sbsm/payment-terms/detail/${termHeaderId}`,
      search: stringify(filterNullValueObject({ operate, snapshotFlag })),
    });
  }, [history]);

  // 编辑付款条款
  const handleEdit = useCallback(async (record: any) => {
    const termStatus = record?.get('termStatus');
    if (termStatus === 'UN_PUBLISH') {
      handleToDetail(record?.get('termHeaderId'), 'edit');
      return;
    }
    const res = getResponse(await editPayFundPlan(record));
    handleToDetail(res?.termHeaderId, 'edit');
  }, [handleToDetail]);

  // 复制付款条款
  const handleCopy = useCallback(async (termHeaderId: string | number) => {
    handleToDetail(termHeaderId, 'copy');
  }, [handleToDetail]);

  const handleSwitch = useCallback(
    async (record) => {
      const status = record.get('termStatus');
      const res = getResponse(await enablePayFundPlan({
        ...record?.toData(),
        termStatus: status === 'DISABLE' ? 'PUBLISHED' : 'DISABLE',
      }));;
      if (!res) return;
      listDs.query(listDs.currentPage);
    },
    [listDs]
  );

  const handleCreate = useCallback(() => {
    handleToDetail('create', 'create');
  }, [handleToDetail]);

  // 打开同步弹框
  const handleOpenSync = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      title: intl.get('sbsm.common.button.sync').d('同步'),
      style: {
        width: 960,
      },
      children: <ResyncComponent recordInfo={record} listDs={listDs} />,
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [listDs]);

  // 重新同步
  const handleResync = useCallback(async () => {
    const res = await listDs.setState('submitType', 'resync').submit();
    if (res) {
      listDs.query();
      listDs.clearCachedSelected();
    }
  }, [listDs]);

  // 取消发布
  const handleCancelPublish = useCallback(async(record) => {
    const termHeaderId = record?.get('termHeaderId');
    if (!termHeaderId) return;
    const res = getResponse(await cancelPublish(termHeaderId));
    if (!res) return;
    notification.success({});
    listDs.query();
  }, [listDs]);

  // 撤回
  const handleRevoke = useCallback(async(record) => {
    const termHeaderId = record?.get('termHeaderId');
    if (!termHeaderId) return;
    const res = getResponse(await revoke(termHeaderId));
    if (!res) return;
    listDs.query();
    notification.success({});
  }, [listDs]);

  const getOperationCommand = useCallback(({ record }) => {
    const {
      termNum,
      termStatus,
      termHeaderId,
      versionNumber,
      children,
      dataSource,
    } = record.get([
      'termNum',
      'termStatus',
      'snapshotFlag',
      'termHeaderId',
      'versionNumber',
      'children',
      'dataSource',
    ]) || {};
    const buttons = [
      {
        name: 'update',
        text: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleEdit(record),
        showFlag: Boolean(permissionMap?.get('edit')) && ['SRM'].includes(dataSource) && (termStatus === 'UN_PUBLISH' || (!children && !['RELEASE_APPROVING', 'DISABLE'].includes(termStatus))),
        wait: 1000,
      },
      {
        name: 'copy',
        text: intl.get('hzero.common.button.copy').d('复制'),
        onClick: () => handleCopy(termHeaderId),
        showFlag: Boolean(permissionMap?.get('copy')) && ['SRM'].includes(dataSource) && !['RELEASE_APPROVING', 'UN_PUBLISH', 'RELEASE_REJECT'].includes(termStatus),
        wait: 1000,
      },
      {
        name: 'enable',
        text: intl.get('hzero.common.status.enable').d('启用'),
        onClick: () => handleSwitch(record),
        showFlag: termStatus === 'DISABLE' && ['SRM'].includes(dataSource) && permissionMap?.get('enable'),
      },
      {
        name: 'disable',
        text: intl.get('hzero.common.status.disabled').d('禁用'),
        onClick: () => handleSwitch(record),
        showFlag: termStatus === 'PUBLISHED' && ['SRM'].includes(dataSource) && permissionMap?.get('disable'),
      },
      {
        name: 'revoke',
        text: intl.get('hzero.common.button.recall').d('撤回'),
        onClick: () => handleRevoke(record),
        showFlag: termStatus === 'RELEASE_APPROVING' && ['SRM'].includes(dataSource) && permissionMap?.get('revoke'),
      },
      {
        name: 'cancelPublish',
        text: intl.get('sbsm.common.button.cancel.publish').d('取消发布'),
        onClick: () => handleCancelPublish(record),
        showFlag: termStatus === 'RELEASE_REJECT' && ['SRM'].includes(dataSource) && permissionMap?.get('cancelPublish'),
      },
      {
        name: 'historyRecord',
        group: true,
        text: intl.get('hzero.common.button.historyVersion').d('历史版本'),
        children: (
          <VersionRecord
            primaryKey='termHeaderId'
            currentKey={termHeaderId}
            onClick={({ record: versionRecord }) => handleToDetail(versionRecord?.get('termHeaderId'), 'history')}
            fieldsConfig={{
              userName: { alias: 'publishedByName' },
              time: { alias: 'publishedDate' },
            }}
            readTransport={{
              url: `/sbdm/v1/${getCurrentOrganizationId()}/term-headers/history/page`,
              method: 'GET',
              params: { termNum },
            }}
          />
        ),
        // 历史版本无需考虑显示状态是否为禁用
        showFlag: ['PUBLISHED', 'DISABLE'].includes(termStatus) && Number(versionNumber) > 1,
      },
    ];
    return formatColumnCommand({ buttons });
  }, [
    handleEdit,
    handleCopy,
    handleSwitch,
    permissionMap,
    handleToDetail,
    handleRevoke,
    handleCancelPublish,
  ]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'termStatus',
        width: 120,
        renderer: statusTagRender,
        headerStyle: { paddingLeft: 45 },
      },
      {
        name: 'operation',
        width: 120,
        align: ColumnAlign.left,
        command: getOperationCommand,
      },
      {
        name: 'termNum',
        renderer: ({ value, record }) => {
          const { termStatus, children } = record?.get(['termStatus', 'children']) || {};
          return (
            <a onClick={() => handleToDetail(record?.get('termHeaderId'), 'all', (termStatus === 'UN_PUBLISH' || (!children)) ? 1 : 0)}>
              {value}
            </a>
          );
        },
      },
      {
        name: 'termName',
      },
      {
        name: 'versionNumber',
        width: 100,
      },
      {
        name: 'termLineStageNums',
        width: 120,
      },
      {
        name: 'prepayStageFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'syncStatus',
        width: 100,
        renderer: ({ value, record, text }) => {
          if (!value) return null;
          return (
            <Button onClick={() => handleOpenSync(record)} funcType={FuncType.link} color={ButtonColor.primary}>
              {text}
            </Button>
          );
        },
      },
      {
        name: 'dataSource',
        width: 120,
      },
    ];
  }, [handleToDetail, getOperationCommand, handleOpenSync]);

  const headerTitle = useMemo(() => {
    return intl.get('sbsm.payTermsCtrl.view.title.payTermsDefineFondsPlan').d('资金计划');
  }, []);

  const buttons: any = useMemo(() => {
    const btns: any = [
      permissionMap?.get('create') && {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'add',
          onClick: handleCreate,
        },
      },
      {
        name: 'resync',
        child: intl.get('sbsm.common.button.resync').d('重新同步'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'sync',
          disabled: isEmpty(selected),
          onClick: handleResync,
        },
      },
    ].filter((v) => v);
    return formatDynamicBtns(btns);
  }, [
    handleCreate,
    permissionMap,
    selected,
    handleResync,
  ]);

  return (
    <Fragment>
      <Header title={headerTitle}>
        {customizeBtnGroup(
          { code: ListBtnCode, pro: true },
          <DynamicButtons unitCode={ListBtnCode} buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <Content>
        {customizeTable(
          {
            code: ListCustomizeCode.TableCode,
          },
          <SearchBarTable
            cacheState
            customizable
            dataSet={listDs}
            columns={columns}
            mode={TableMode.tree}
            style={{ maxHeight: 'calc(100vh - 210px)' }}
            searchCode={ListCustomizeCode.SearchBarCode}
            searchBarConfig={{
              onQuery: handleQuery,
              editorProps: {
                termStatus: {
                  optionsFilter: (record) => record?.get('value') !== 'EXPIRED',
                },
              },
            }}
          />
        )}
      </Content>
    </Fragment>
  );
}) as (props: any) => ReactElement;

export default PayTermsFundingPlanList;


