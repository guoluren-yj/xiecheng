/*
 * @Description: 付款条款管控-列表页
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-13 14:34:35
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { Fragment, useMemo, useCallback } from 'react';
import { isNil, flow } from 'lodash';
import { observer } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, TableMode } from 'choerodon-ui/pro/lib/table/interface';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import intl from 'utils/intl';
import { SRM_SSTA }from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import type { Operate } from '../utils/type';
import { editPayTermsCtrl } from '../utils/api';
import { payTermsCtrlListDS, permissionDS } from './listDS';
import { statusTagRender } from '../components/StatusTag';
import { permissionCodeMap, ListCustomizeCode } from '../utils/type';
import { formatColumnCommand } from '../utils/renderer';
import VersionRecord from '../components/HistoryRecord/VersionRecord';

interface PayTermsCtrlProps {
  history: any;
  onSwitchPage: () => void;
  customizeTable: (customizeOptions: object | undefined, tableElement: React.ReactNode) => any;
}

const PayTermsCtrlList = flow(
  observer,
  withCustomize({
    unitCode: Object.values(ListCustomizeCode),
  }),
)((props: PayTermsCtrlProps) => {
  const { history, onSwitchPage, customizeTable } = props;
  const listDs = useMemo<DataSet>(() => new DataSet(payTermsCtrlListDS()), []);
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;

  const handleQuery = useCallback(({ params, currentPage }) => {
    if (listDs.queryDataSet) listDs.queryDataSet.loadData([params]);
    listDs.query(currentPage);
  }, [listDs]);

  // 跳转至详情页
  const handleToDetail = useCallback((termHeaderId: string | number, operate: Operate) => {
    if (!termHeaderId) return;
    history.push({
      pathname: `/smdm/payment-terms/detail/${termHeaderId}`,
      search: stringify({ operate }),
    });
  }, [history]);

  // 编辑付款条款
  const handleEdit = useCallback(async (termHeaderId: string | number) => {
    const res = getResponse(await editPayTermsCtrl(termHeaderId));
    handleToDetail(res?.termHeaderId, 'edit');
  }, [handleToDetail]);

  // 复制付款条款
  const handleCopy = useCallback(async (termHeaderId: string | number) => {
    handleToDetail(termHeaderId, 'copy');
  }, [handleToDetail]);

  const handleSwitch = useCallback(
    async (record) => {
      const enableFlag = record.get('enableFlag');
      record.set('enableFlag', Number(enableFlag) === 1 ? 0 : 1);
      const res = await listDs.submit();
      if (!res) return;
      listDs.query(listDs.currentPage);
    },
    [listDs]
  );

  const handleCreate = useCallback(() => {
    handleToDetail('create', 'create');
  }, [handleToDetail]);

  const getOperationCommand = useCallback(({ record }) => {
    const {
      termNum,
      termStatus,
      snapshotFlag,
      termHeaderId,
      versionNumber,
      displayStatus,
      parentTermHeaderId,
    } = record.get([
      'termNum',
      'termStatus',
      'snapshotFlag',
      'termHeaderId',
      'versionNumber',
      'displayStatus',
      'parentTermHeaderId',
    ]) || {};
    const buttons = [
      {
        name: 'update',
        text: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleEdit(termHeaderId),
        showFlag: Boolean(permissionMap?.get('edit')) && Number(snapshotFlag) === 1,
        wait: 1000,
      },
      {
        name: 'copy',
        text: intl.get('hzero.common.button.copy').d('复制'),
        onClick: () => handleCopy(termHeaderId),
        showFlag: Boolean(permissionMap?.get('copy')) && isNil(parentTermHeaderId) || parentTermHeaderId === -1,
        wait: 1000,
      },
      {
        name: 'enable',
        text: intl.get('hzero.common.status.enable').d('启用'),
        onClick: () => handleSwitch(record),
        showFlag: displayStatus === 'DISABLE',
      },
      {
        name: 'disable',
        text: intl.get('hzero.common.status.disabled').d('禁用'),
        onClick: () => handleSwitch(record),
        showFlag: displayStatus === 'PUBLISHED',
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
              url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/term-headers/history/page`,
              method: 'GET',
              params: { termNum },
            }}
          />
        ),
        // 历史版本无需考虑显示状态是否为禁用
        showFlag: termStatus === 'PUBLISHED' && Number(versionNumber) > 1,
      },
    ];
    return formatColumnCommand({ buttons });
  }, [
    handleEdit,
    handleCopy,
    handleSwitch,
    permissionMap,
    handleToDetail,
  ]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'displayStatus',
        width: 120,
        renderer: statusTagRender,
        headerStyle: { paddingLeft: 45 },
      },
      {
        name: 'operation',
        width: 200,
        align: ColumnAlign.left,
        command: getOperationCommand,
      },
      {
        name: 'termNum',
        width: 120,
        renderer: ({ value, record }) => {
          return (
            <a onClick={() => handleToDetail(record?.get('termHeaderId'), 'all')}>
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
        name: 'sourceCode',
        width: 120,
      },
      {
        name: 'enableTermFlag',
        width: 140,
      },
      {
        name: 'priority',
        width: 100,
      },
      {
        name: 'prepayFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
    ];
  }, [handleToDetail, getOperationCommand]);

  const headerTitle = useMemo(() => {
    return (
      <div>
        <span>{intl.get('smdm.payTermsCtrl.view.title.payTermsUpdateAndCtrl').d('付款条款维护与管控')}</span>
        <PermissionButton
          size="small"
          type="c7n-pro"
          icon="swap_horiz"
          onClick={onSwitchPage}
          style={{ marginLeft: 12 }}
          permissionList={[
            {
              code: permissionCodeMap.exChange,
              type: 'button',
            },
          ]}
        >
          {intl.get('smdm.payTermsCtrl.view.button.payTermsUpdate').d('付款条款维护')}
        </PermissionButton>
      </div>
    );
  }, [onSwitchPage]);

  return (
    <Fragment>
      <Header title={headerTitle}>
        <PermissionButton
          type="c7n-pro"
          icon="add"
          onClick={handleCreate}
          color={ButtonColor.primary}
          permissionList={[
            {
              code: permissionCodeMap.create,
              type: 'button',
            },
          ]}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </PermissionButton>
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
                  optionsFilter: (record) => record.get('value') !== 'INVALID',
                },
              },
            }}
          />
        )}
      </Content>
    </Fragment>
  );
}) as (props: any) => ReactElement;

export default PayTermsCtrlList;


