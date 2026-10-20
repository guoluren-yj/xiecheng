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
import { statusTagRender } from '../../../../../utils/renderer';
import { StatusColorMap } from '../../utils/type';

const WholeTable = () => {

  const { discountDs, handleToDetail, customizeTable, discountRemote } = useContext<StoreValueType>(Store);

  /**
  * @description: 跳转详情页面
  * @param {String} 行主键
  */
  const handleEdit = useCallback(
    async (record) => {
      const { ruleId, ruleStatus, versionNumber } = record.get(['ruleId', 'ruleStatus', 'versionNumber']);

      if (discountRemote?.event) {
        const res = await discountRemote.event.fireEvent('handleCuxEdit', { record, handleToDetail });
        if (!res) {
          return;
        }
      }

      if (['PUBLISHED'].includes(ruleStatus)) {
        const res = getResponse(await edit(record.toData()));
        if (res?.ruleId) {
          handleToDetail(res, 'update');
        }
      } else {
        handleToDetail({ ruleId, ruleStatus, versionNumber }, 'update');
      }

    },
    [handleToDetail, discountRemote]
  );

  /**
  * @description: 跳转详情页面
  * @param {String}
  */
  const handleCopy = useCallback(
    async (record) => {
      const feedback = await Modal.confirm({
        title: intl.get('spfp.common.view.title.tip').d('提示'),
        children: intl
          .get('spfp.common.view.message.copyWarning')
          .d('复制规则无法删除，请确认是否复制？'),
      });

      if (feedback !== 'ok') return;
      if (!feedback) return;
      const res = getResponse(await copy(record.toData()));
      if (res) {
        notification.success({});
        handleToDetail(res, 'update');
      }
    },
    [handleToDetail]
  );

  const handleViewHistory = useCallback(({ record }) => {
    handleToDetail(record.toData(), 'history');

  }, [handleToDetail]);

  const handleSwitch = useCallback(async (record) => {
    const enableFlag = record.get('enableFlag');
    record.set('enableFlag', Number(enableFlag) === 1 ? 0 : 1);
    const res = await discountDs.submit();
    if (!res) return;
    discountDs.query(discountDs.currentPage);
  }, [discountDs]);

  const getOperationCommand = useCallback(
    ({ record }) => {
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
      const showEnableFlag = ruleStatus === 'PUBLISHED' && !['PROTOCOL'].includes(sourceType);
      let normalBtns = [
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
          showFlag: showEnableFlag && Number(enableFlag) === 0,
        },
        {
          name: 'disable',
          text: intl.get('hzero.common.status.disabled').d('禁用'),
          onClick: () => handleSwitch(record),
          showFlag: showEnableFlag && Number(enableFlag) === 1,
        },
        {
          name: 'copy',
          text: intl.get('hzero.common.button.copy').d('复制'),
          onClick: () => handleCopy(record),
          showFlag: showEditbtnFlag && (isNil(parentRuleId) || parentRuleId < 1),
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
                url: `/spcm/v1/${getCurrentOrganizationId()}/pfp-rule/history/page?ruleNum=${ruleNum}&ruleId=${ruleId}&page=0`,
                method: 'GET',
              }}
              fieldsConfig={{
                userName: { alias: 'createdByName' },
                loginName: {
                  alias: 'createdByLoginName',
                },
                time: { alias: 'creationDate' },

              }}
            />
          ),
          showFlag: ruleStatus === 'PUBLISHED' && versionNumber > 1,
        },
      ];

      normalBtns = discountRemote
        ? discountRemote.process('SPFP_DISCOUNT_LIST_ACTIONBTNS', normalBtns, {
          record,
          discountDs,
        })
        : normalBtns;

      return formatColumnCommand({ buttons: normalBtns });
    },
    [
      handleCopy,
      handleEdit,
      handleViewHistory,
      handleSwitch,
      discountRemote,
      discountDs,
    ]
  );


  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'ruleStatus',
        width: 160,
        renderer: ({ record, text }) => {
          const { ruleStatus, enableFlag } = record?.get(['ruleStatus', 'enableFlag']) || {};
          const disabledStatus = ruleStatus === 'PUBLISHED' && !enableFlag ? 'DISABLED' : undefined;
          return statusTagRender(
            disabledStatus ? intl.get('hzero.common.status.alreadyDisabled').d('已禁用') : text,
            StatusColorMap[disabledStatus || ruleStatus]
          );
        },
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
        width: 180,
        renderer: ({ record, value }) => (
          <a onClick={() => handleToDetail(record?.toData() || {}, 'view')}>{value}</a>
        ),
      },
      {
        name: 'ruleName',
        width: 180,
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
        { code: 'SPFP.RULE_DISCOUNT_LIST.GRID' },
        <SearchBarTable
          mode={TableMode.tree}
          cacheState
          customizable
          dataSet={discountDs}
          columns={columns}
          searchCode='SPFP.RULE_DISCOUNT_LIST.SEARCH_BAR2'
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
        />
      )}
    </div>
  );
};
export default WholeTable;
