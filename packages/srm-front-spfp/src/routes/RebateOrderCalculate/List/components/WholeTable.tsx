import React, { useContext, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { useModal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import moment from 'moment';
import { filterNullValueObject } from 'utils/utils';

import { useModalOpen } from '../../../../utils/hooks';
import type { StoreValueType } from '../stores/index';
import { Store } from '../stores/index';
import CumulativeDimensionModal from './CumulativeDimensionModal';
import FailInfoModal from './FailInfoModal';
import CalcProgress from './CalcProgress';
import ExcuteResultModal from './ExcuteResultModal';
import ExcuteStageProcessPop from './ExcuteStageProcessPop';
import { TableCustomizeCodes } from '../../utils/type';
import { yesOrNoRenderWithLink } from '../../../../utils/renderer';
import { dateRangeTransform } from '../../../../utils/utils';

const WholeTable = () =>
{
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const searchBarRef: any = useRef({});

  const { tableDs, customizeTable, defaultVersionNumber, defaultRebatesRuleNum, defaultCalculateBeginDate, remote } = useContext<StoreValueType>(Store);

  // 后续路由字段默认值更改同步更新字段值
  useEffect(() => {
    const { setFields, handleQuery } = searchBarRef.current;
    // 个性化配置的查询条件更新
    if (setFields) {
      setFields(filterNullValueObject({
        _mergeField: defaultRebatesRuleNum,
        versionNumber: defaultVersionNumber,
        calculateBeginDate: defaultCalculateBeginDate ? [moment(defaultCalculateBeginDate), moment(defaultCalculateBeginDate)] : undefined,
      }), 'init');
    }
    if (handleQuery) handleQuery();
  }, [defaultRebatesRuleNum, defaultCalculateBeginDate, defaultVersionNumber]);

  // 初始化页面时添加customizeDs默认值
  const handleBindSeachBarRef = useCallback(
    (ref) => {
      searchBarRef.current = ref;
      const { setFields } = ref;
      if (setFields) {
        setFields({
          _mergeField: defaultRebatesRuleNum,
        }, 'init');
      }
    },
    [defaultRebatesRuleNum]
  );

  const handleGetTitle = useCallback((record) => {
    const { ruleNum, ruleName } = record?.get(['ruleNum', 'ruleName']) || {};
    if (!ruleNum && !ruleName) return '';
    return `${ruleNum},${ruleName} `;
  }, []);

  // 累计维度弹窗
  const openCumulativeDimensionModal = useCallback((record) =>
  {
    modalOpen({
      title: handleGetTitle(record) + intl.get('spfp.ruleMaintenance.view.title.create.applyRange').d('适用范围'),
      size: 'medium',
      editFlag: false,
      children: <CumulativeDimensionModal ruleId={record?.get('ruleId')} />,
    });
  }, [modalOpen, handleGetTitle]);

  // 计算结果弹窗
  const openCalculateResultModal = useCallback((record) =>
  {
    modalOpen({
      title: handleGetTitle(record) + intl.get(`spfp.common.view.title.calculationProcess`).d('计算过程'),
      size: 'medium',
      editFlag: false,
      children: (
        <CalcProgress topRecord={record} />
      ),
    });
  }, [modalOpen, handleGetTitle]);

  // 执行单据弹窗
  const openExcuteResultModal = useCallback((record) =>
  {
    const serialNum = record?.get('serialNum');
    modalOpen({
      title: handleGetTitle(record) + intl.get(`spfp.common.view.title.excuteResultInfo`).d('执行结果单据明细'),
      size: 'small',
      editFlag: false,
      children: <ExcuteResultModal rebatesSerialNum={serialNum} />,
    });
  }, [modalOpen, handleGetTitle]);

  const handleFailInfoModal = useCallback((record) =>
  {
    modalOpen({
      title: intl.get(`spfp.common.view.title.excuteFailInfo`).d('失败明细'),
      size: 'medium',
      editFlag: false,
      children: <FailInfoModal record={record} />,
    });

  }, [modalOpen]);

  const columns: ColumnProps[] = useMemo(() =>
  {
    const columnList = [
      {
        name: 'serialNum',
        width: 240,
      },
      {
        name: 'ruleNum',
        width: 150,
      },
      {
        name: 'versionNumber',
        width: 80,
      },
      {
        name: 'ruleName',
        width: 220,
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
        name: 'ruleCreatedByName',
        width: 150,
      },
      {
        name: 'cumulativeMode',
        width: 120,
      },
      {
        name: 'cumulativeDimension',
        width: 80,
        renderer: ({ record }) => (
          <a
            onClick={() => openCumulativeDimensionModal(record)}
          >
            {intl.get(`spfp.common.view.title.detail`).d('明细')}
          </a>
        ),
      },
      {
        name: 'calculateResult',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => openCalculateResultModal(record)}>
            {intl.get(`spfp.common.view.title.calculationProcess`).d('计算过程')}
          </a>
        ),
      },
      {
        name: 'currentCalculateResult',
        width: 180,
      },
      {
        name: 'historicalCalculateResult',
        width: 180,
      },
      {
        name: 'calculateBeginDate',
        width: 200,
      },
      {
        name: 'successFlag',
        width: 120,
        renderer: ({ value, record }) => yesOrNoRenderWithLink({
          value,
          yesLink: false,
          noLink: true,
          noOnclick: () => handleFailInfoModal(record),
        }),
      },
      {
        name: 'errorMessage',
        width: 250,
      },
      {
        name: 'excuteResultDocuments',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => openExcuteResultModal(record)}>
            {intl.get(`spfp.common.view.title.detail`).d('明细')}
          </a>
        ),
      },
      {
        name: 'excuteStage',
        width: 100,
        renderer: ({ record }) => <ExcuteStageProcessPop record={record} />,
      },
    ];
    return remote ? remote.process('SPFP.REBATE_ORDER_CALCULATE_LIST_CUX.COLUMS', columnList, { tableDs }) : columnList;
  }, [
    openCumulativeDimensionModal,
    openCalculateResultModal,
    openExcuteResultModal,
    handleFailInfoModal,
    remote,
    tableDs,
  ]);

  const handleQuery = useCallback(async ({ params }) => {
    if (tableDs.queryDataSet) tableDs.queryDataSet.loadData([params]);
    tableDs.query();
  }, [tableDs]);

  return (
    <div style={{ height: 'calc(100vh - 200px)' }}>
      {
        customizeTable(
          {
            code: TableCustomizeCodes.listCode,
          },
          <SearchBarTable
            cacheState
            customizable
            dataSet={tableDs}
            columns={columns}
            searchCode={TableCustomizeCodes.searchCode}
            searchBarRef={handleBindSeachBarRef}
            searchBarConfig={{
              onQuery: handleQuery,
              fieldProps: {
                versionNumber: {
                  defaultValue: defaultVersionNumber && (() => defaultVersionNumber),
                },
                calculateBeginDate: {
                  defaultValue: defaultCalculateBeginDate ? [moment(defaultCalculateBeginDate), moment(defaultCalculateBeginDate)] : dateRangeTransform('LAST MONTH'),
                },
              },
            }}
            style={{ maxHeight: 'calc(100% - 22px)' }}
            pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          />)
      }
    </div>
  );
};
export default WholeTable;
