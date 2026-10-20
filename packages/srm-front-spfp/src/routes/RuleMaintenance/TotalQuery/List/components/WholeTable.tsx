import React, { useContext, useMemo, useCallback, useRef } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { Select, useDataSet, useModal } from 'choerodon-ui/pro';

import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';

import { lovOptionDS } from '../../../../../utils/utils';
import type { StoreValueType } from '../stores/index';
import { Store } from '../stores/index';
import { statusColorMap } from '../../../Rebate/Detail/stores';
import StatusTag from '../../../../Components/StatusTag';
import { useModalOpen } from '../../../../../utils/hooks';
import ActionRecord from './ActionRecord';
import { statusTagRender } from '../../../../../utils/renderer';
import { StatusColorMap } from '../../../Discount/utils/type';



const WholeTable = () =>
{

  const { tableDs, handleToDetail, customizeTable } = useContext<StoreValueType>(Store);
  const searchBarRef = useRef({});
  const settleTypeOptionDs = useDataSet(
    () => lovOptionDS({ lovCode: 'SPFP.BASE_PREFERENTIAL_TYPE' }),
    []
  );
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  // 初始化页面时添加customizeDs默认值
  const handleBindSeachBarRef = useCallback(
    (ref) =>
    {
      if (!ref) return;
      searchBarRef.current = ref;
      const { customizeDs } = ref;
      if (!customizeDs.current) customizeDs.create({});
      customizeDs.current.init({
        ruleType: 'REBATE',
      });
    },
    []
  );

  const handleReset = useCallback(() => {
    handleBindSeachBarRef(searchBarRef.current);
  }, [searchBarRef, handleBindSeachBarRef]);

  const openActionRecordModal = useCallback((record) => {
    modalOpen({
      title: intl.get('spfp.common.button.actionRecord').d('执行记录'),
      size: 'large',
      editFlag: false,
      children: <ActionRecord record={record} />,
    });
  }, [modalOpen]);


  const columns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'ruleStatus',
        width: 120,
        renderer: ({ record, text, value }) => {
          if (record?.get('ruleType') === 'DISCOUNT') {
            const { ruleStatus, enableFlag } = record?.get(['ruleStatus', 'enableFlag']) || {};
            const disabledStatus = ruleStatus === 'PUBLISHED' && !enableFlag ? 'DISABLED' : undefined;
            return statusTagRender(
              disabledStatus ? intl.get('hzero.common.status.alreadyDisabled').d('已禁用') : text,
              StatusColorMap[disabledStatus || ruleStatus]
            );
          }
          return <StatusTag value={record?.get('ruleStatusMeaning')} color={statusColorMap[value]} />;
        },
      },
      {
        name: 'ruleNum',
        width: 150,
        renderer: ({ record, value }) => (
          <a onClick={() => handleToDetail(record)}>{value}</a>
        ),
      },
      {
        name: 'ruleName',
        width: 180,
      },
      {
        name: 'ruleType',
        width: 180,
      },
      {
        name: 'sourceTypeMeaning',
        width: 180,
      },
      {
        name: 'scenarioName',
        width: 180,
      },
      {
        name: 'sourceFieldName',
        width: 180,
      },
      {
        name: 'targetFieldName',
        width: 180,
      },
      {
        name: 'applicableDimensionRange',
        width: 180,
      },
      {
        name: 'date',
        width: 300,
      },
      {
        name: 'actionRecord',
        renderer: ({ record }) => record?.get('ruleType') === 'REBATE' && (
          <a onClick={() => openActionRecordModal(record)}>
            {intl.get(`spfp.common.view.title.detail`).d('明细')}
          </a>
        ),
      },
      {
        name: 'createdByName',
      },
    ];
  }, [handleToDetail, openActionRecordModal]);

  return (
    <div style={{ height: 'calc(100vh - 200px)' }}>
      {customizeTable(
        {code: 'SPFP.RULE_QUERY_ALL_LIST.GRID'},
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode='SPFP.RULE_QUERY_ALL_LIST.SEARCH_BAR'
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarRef={handleBindSeachBarRef}
          searchBarConfig={{
            onReset: handleReset,
            onClear: handleReset,
            left: {
              render: (_, customizeDs) => (
                <div>
                  <Select
                    name="ruleType"
                    dataSet={customizeDs}
                    options={settleTypeOptionDs}
                    defaultValue='REBATE'
                    placeholder={intl
                      .get('spfp.common.view.message.searchRuleType')
                      .d('请选择规则类型查询')}
                    clearButton={false}
                  />
                </div>
              ),
            },
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
