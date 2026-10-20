import React, { useContext, useMemo, useCallback } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableMode, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { Modal } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';


import type { StoreValueType } from '../stores/index';
import { Store } from '../stores/index';
import HistoryVersion from '../../../../../component/HistoryRecord/Version';
import { edit, copy } from '../../utils/api';
import { formatColumnCommand } from '../../../../Components/ColumnBtnGroup';
import { statusTagRender } from '../../../../Components/StatusTag';

const WholeTable = () =>
{

  const { rebateDs, handleToDetail, customizeTable, remoteProps } = useContext<StoreValueType>(Store);

  /**
  * @description: 跳转详情页面
  * @param {String} 行主键
  */
  const handleEdit = useCallback(
    async (record) =>
    {
      const { ruleId, ruleStatus } = record.get(['ruleId', 'ruleStatus']);
      const editNewIdFlag = ['PUBLISHED'].includes(ruleStatus);
      const processEditNewIdFlag = remoteProps ?
        remoteProps.process('SPFP_RULE_MAINTENANCE_REBATE_LIST_CUX.EDIT_NEW_ID_FLAG', editNewIdFlag, {
          record,
        }) : editNewIdFlag;
      if (processEditNewIdFlag)
      {
        const res = getResponse(await edit(record.toData()));
        if (res?.ruleId)
        {
          handleToDetail(res, 'update');
        }
      } else
      {
        handleToDetail({ ruleId }, 'update');
      }

    },
    [remoteProps, handleToDetail]
  );

  /**
  * @description: 跳转详情页面
  * @param {String}
  */
  const handleCopy = useCallback(
    async (record) =>
    {
      const feedback = await Modal.confirm({
        title: intl.get('spfp.common.view.title.tip').d('提示'),
        children: intl
          .get('spfp.common.view.message.copyWarning')
          .d('复制规则无法删除，请确认是否复制？'),
      });

      if (feedback !== 'ok') return;
      const res = getResponse(await copy(record.toData()));
      if (res)
      {
        notification.success({});
        handleToDetail(res, 'update');
      }
    },
    [handleToDetail]
  );

  const handleViewHistory = useCallback(({ record }) =>
  {
    handleToDetail(record.toData(), 'history');

  }, [handleToDetail]);

  const handleSwitch = useCallback(async (record) =>
  {
    const enableFlag = record.get('enableFlag');
    record.set('enableFlag', Number(enableFlag) === 1 ? 0 : 1);
    const res = await rebateDs.submit();
    if (!res) return;
    rebateDs.query(rebateDs.currentPage);

  }, [rebateDs]);

  const getOperationCommand = useCallback(
    ({ record }) =>
    {
      const {
        ruleStatus,
        sourceType,
        ruleNum,
        ruleId,
        children,
        parentRuleId,
        versionNumber,
        enableFlag,
      } = record?.get(['enableFlag', 'sourceType', 'ruleStatus', 'ruleNum', 'ruleId', 'children', 'parentRuleId', 'versionNumber']) || {};
      const showEditbtnFlag = !['PROTOCOL'].includes(sourceType) && !['CANCELED', 'WAITING_APPROVAL'].includes(ruleStatus);
      const normalBtns = [
        {
          name: 'update',
          text: intl.get('hzero.common.button.edit').d('编辑'),
          onClick: () => handleEdit(record),
          showFlag: showEditbtnFlag && (!children || isEmpty(children)),
          wait: 1000,
        },
        {
          name: 'enable',
          text: intl.get('hzero.common.status.enable').d('启用'),
          onClick: () => handleSwitch(record),
          showFlag: !['PROTOCOL'].includes(sourceType) && ruleStatus === 'PUBLISHED' && Number(enableFlag) === 0,
        },
        {
          name: 'disable',
          text: intl.get('hzero.common.status.disabled').d('禁用'),
          onClick: () => handleSwitch(record),
          showFlag: !['PROTOCOL'].includes(sourceType) && ruleStatus === 'PUBLISHED' && Number(enableFlag) === 1,
        },
        {
          name: 'copy',
          text: intl.get('hzero.common.button.copy').d('复制'),
          onClick: () => handleCopy(record),
          showFlag: showEditbtnFlag && (isNil(parentRuleId) || parentRuleId === -1),
          wait: 1000,
        },
        {
          name: 'historyRecord',
          group: true,
          text: intl.get('hzero.common.button.historyVerison').d('历史版本'),
          children: (
            <HistoryVersion
              primaryKey="ruleId"
              onClick={handleViewHistory}
              readTransport={{
                url: `/ssta/v1/${getCurrentOrganizationId()}/rules/history/page?ruleNum=${ruleNum}&ruleId=${ruleId}&page=0`,
                method: 'GET',
              }}
              fieldsConfig={{
                userName: { alias: 'publishedByName' },
                loginName: {
                  alias: 'publishedLoginName',
                },
                time: { alias: 'publishedDate' },

              }}
            />
          ),
          showFlag: ruleStatus === 'PUBLISHED' && versionNumber > 1,
        },
      ];
      const btns = remoteProps
      ? remoteProps.process('SSTA_COSTSHEET_DETAIL_CUX_HEADER_BTN', normalBtns, {
          record,
          rebateDs,
        })
      : normalBtns;
      return formatColumnCommand({ buttons: btns });
    },
    [
      handleCopy,
      handleEdit,
      handleViewHistory,
      handleSwitch,
      remoteProps,
      rebateDs,
    ]
  );


  const columns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'displayStatus',
        width: 160,
        renderer: statusTagRender,
        headerStyle: { paddingLeft: 45 },
      },
      {
        name: 'action',
        width: 200,
        align: ColumnAlign.left,
        command: getOperationCommand,

      },
      {
        name: 'ruleNum',
        width: 150,
        title: intl.get(`spfp.ruleMaintenance.model.ruleMaintenance.rebateRuleNum`).d('返利规则编码'),
        renderer: ({ record, value }) => (
          <a onClick={() => handleToDetail(record?.toData() || {}, 'view')}>{value}</a>
        ),
      },
      {
        name: 'ruleName',
        title: intl.get(`spfp.ruleMaintenance.model.ruleMaintenance.rebateRuleName`).d('返利规则名称'),
        width: 220,
      },
      {
        name: 'sourceTypeMeaning',
        width: 120,
      },
      {
        name: 'versionNumber',
        width: 100,
      },
      {
        name: 'date',
      },
      {
        name: 'createdByName',
      },
    ];
  }, [getOperationCommand, handleToDetail]);


  return (
    <div style={{ height: 'calc(100vh - 200px)' }}>
      {customizeTable(
        { code: 'SPFP.RULE_REBATE_LIST.GRID' },
        <SearchBarTable
          mode={TableMode.tree}
          cacheState
          customizable
          dataSet={rebateDs}
          columns={columns}
          searchCode='SPFP.RULE_REBATE_LIST.SEARCH_BAR'
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            editorProps: {
              ruleStatus: {
                optionsFilter: (record) => record.get('value') !== 'INVALID',
              },
            },
          }}
        />
      )}
    </div>
  );
};
export default WholeTable;
