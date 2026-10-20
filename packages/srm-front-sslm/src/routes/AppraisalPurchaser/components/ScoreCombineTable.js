/*
 * ScoreCombineTable - 供应商、指标、评分人，组合table
 * @Date: 2023-11-20 13:33:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty, isNil, omit } from 'lodash';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import React, {
  Fragment,
  useCallback,
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
} from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import { yesOrNoRender } from 'utils/renderer';
import ExcelExportPro from 'components/ExcelExportPro';
import SearchBar from '_components/SearchBarTable/SearchBar';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';
import { RenderReminder } from '@/routes/components/utils/appraisal';
import { queryProblemHeader } from '@/services/appraisalPurchaserService';
import { getSupplierIndicatorDs } from '../stores/getScoreCombineTableDS';
import { handleParamQuery, hanldeScoreStatus, handleExecutionDocument } from './utils';

const organizationId = getCurrentOrganizationId();

const ScoreCombineTable = (props, ref) => {
  const {
    remote,
    basicDs,
    dataSet,
    dispatch,
    wfParams,
    sourceKey,
    readOnlyFlag,
    workflowFlag,
    onAppeal,
    searchCode,
    evalHeaderId,
    evalGranularity,
    custLoading,
    customizeTable,
    customizeUnitCode,
    detailLineCode = '',
  } = props;
  const [loading, setLoading] = useState(false);
  const [indicatorDs, setIndicatorDs] = useState({});
  const [allRowExpandFlag, setAllRowExpandFlag] = useState(false);

  const { evalStatus, evalRespRule, modifyScoreRange, supplierAppealFlag, respCalMethod } =
    basicDs?.current?.get([
      'evalStatus',
      'evalRespRule',
      'modifyScoreRange',
      'supplierAppealFlag',
      'respCalMethod',
    ]) || {};

  const appealFlag = ['APPEALING'].includes(evalStatus) || supplierAppealFlag;
  // 申诉弹框
  const isAppeal = useMemo(() => sourceKey === 'APPEAL', [sourceKey]);
  // 评分结果
  const isResult = useMemo(() => sourceKey === 'SCORE_RESULT', [sourceKey]);
  // 预览
  const isPreview = useMemo(() => sourceKey === 'PREVIEW', [sourceKey]);
  // 供应商行状态逻辑
  const lineStatusFlag = [
    'COMPLETED',
    'PUBLISHED',
    'APPEALING',
    'PARTIAL_PUBLISHED',
    'SUPPLIER_CONFIRMED',
  ].includes(evalStatus);

  useEffect(() => {
    const queryParams = {
      ...wfParams,
      customizeUnitCode: [searchCode, customizeUnitCode].join(),
    };
    dataSet.setQueryParameter('queryParams', queryParams);
  }, [searchCode, customizeUnitCode, JSON.stringify(wfParams)]);

  // 获取需保存的数据
  const getSaveParams = async () => {
    const saveParams = {};
    const validatePromise = [];
    const kpiEvalDetailLines = [];
    validatePromise.push(dataSet.validate());
    for (const key in indicatorDs) {
      if (Object.hasOwnProperty.call(indicatorDs, key)) {
        const eleDataSet = indicatorDs[key];
        if (eleDataSet) {
          validatePromise.push(eleDataSet.validate());
          kpiEvalDetailLines.push(...eleDataSet.toJSONData());
        }
      }
    }
    const validateFlag = await Promise.all(validatePromise);
    if (validateFlag.includes(false)) {
      return { validateFlag: false };
    } else {
      saveParams.kpiEvalDetailLines = kpiEvalDetailLines;
      saveParams.collectKpiEvalLines = dataSet.toJSONData();
    }
    return {
      saveParams,
      validateFlag: true,
    };
  };

  // 刷新数据
  const handleRefresh = () => {
    setIndicatorDs({});
    return dataSet.query();
  };

  useImperativeHandle(ref, () => {
    return { getSaveParams, handleRefresh };
  });

  // 发起质量整改
  const hanldeRectification = () => {
    const selectedEvalLineIds = dataSet.selected.map(record => record.get('evalLineId'));
    setLoading(true);
    queryProblemHeader({
      evalHeaderId,
      body: selectedEvalLineIds,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { problemHeaderId, problemStatus } = res;
          const pathname =
            problemStatus === 'NEW'
              ? `/sqam/create8D/detail/${problemHeaderId}`
              : `/sqam/initiated8D/detail/${problemHeaderId}`;
          dispatch(routerRedux.push({ pathname }));
          dataSet.unSelectAll();
          dataSet.clearCachedSelected();
          dataSet.query(dataSet.currentPage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 点击展开图标时触发
  const handleExpand = useCallback(
    (expanded, record) => {
      const evalLineId = record.get('evalLineId');
      if (!indicatorDs[evalLineId]) {
        const currentDs = new DataSet(
          getSupplierIndicatorDs({ evalRespRule, evalLineId, respCalMethod })
        );
        const queryParams = {
          ...wfParams,
          customizeUnitCode: detailLineCode,
        };
        currentDs.setQueryParameter('queryParams', queryParams);
        currentDs.query();
        setIndicatorDs(prevState => ({
          ...prevState,
          [evalLineId]: currentDs,
        }));
      }
    },
    [indicatorDs, evalRespRule, detailLineCode, JSON.stringify(wfParams)]
  );

  // 处理筛选器fieldProps属性
  const fieldProps = useMemo(
    () => ({
      supplierId: {
        lovPara: {
          evalHeaderId,
        },
      },
    }),
    [evalHeaderId]
  );

  const expandedRowRenderer = ({ record }) => {
    const evalLineId = record.get('evalLineId');
    const curIndicatorDs = indicatorDs[evalLineId];
    // 判断指标是否有系统计算指标
    const systemDataFlag = (curIndicatorDs?.toData() || []).some(
      item => item.scoreType === 'SYSTEM'
    );
    const cols = [
      {
        name: 'completeFlag',
        width: 130,
        hidden: isResult,
        renderer: ({ value, record: indicatorRecord }) => {
          const { scoreType } = indicatorRecord.get(['scoreType']);
          const name = scoreType === 'SYSTEM' ? 'processStatus' : 'completeFlag';
          return renderStatus({ value, name, record: indicatorRecord });
        },
        headerStyle: { paddingLeft: 48 },
      },
      {
        name: 'indicatorCode',
        width: 140,
        headerStyle: isResult ? { paddingLeft: 48 } : {},
      },
      {
        name: 'indicatorName',
      },
      {
        name: 'indicatorType',
      },
      {
        name: 'scoreType',
      },
      {
        name: 'processRemark',
        hidden: !systemDataFlag || isPreview,
      },
      {
        name: 'paramQuery',
        hidden: !systemDataFlag || isPreview,
        renderer: ({ record: curRecord }) => {
          const { scoreType, processStatus } = curRecord.get(['scoreType', 'processStatus']) || {};
          const paramQueryClick = remote
            ? remote.process(
                'SSLM_APPRAISAL_PURCHASER_DETAIL_PARAM_QUERY_CLICK',
                handleParamQuery,
                {
                  basicDs,
                  parentRecord: record,
                  curLineRecord: curRecord,
                }
              )
            : handleParamQuery;
          return scoreType === 'SYSTEM' && processStatus === 'COMPLETE' ? (
            <a onClick={() => paramQueryClick(curRecord)}>
              {intl.get('sslm.common.view.title.paramQuery').d('参数值查询')}
            </a>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'evalStandard',
      },
      {
        name: 'evalWeight',
      },
      {
        name: 'scorer',
        hidden: isResult,
      },
      {
        name: 'benchmarkScore',
        hidden: !isResult,
      },
      {
        name: 'vetoFlag',
        hidden: !isResult,
        renderer: ({ value, record: curRecord }) => {
          const { indicatorType } = curRecord?.get(['indicatorType']) || {};
          return indicatorType === 'VETO' ? yesOrNoRender(value || 0) : '-';
        },
      },
      {
        name: 'standardFlag',
        hidden: !isResult,
        renderer: ({ value, record: curRecord }) => {
          const { indicatorType } = curRecord?.get(['indicatorType']) || {};
          return indicatorType === 'TICK' ? yesOrNoRender(value || 0) : '-';
        },
      },
      {
        name: 'indOptFlag',
        hidden: !isResult,
        renderer: ({ value, record: curRecord }) => {
          const { indicatorType } = curRecord?.get(['indicatorType']) || {};
          return indicatorType === 'OPT' ? yesOrNoRender(value || 0) : '-';
        },
      },
      {
        name: 'scoreFrom',
        hidden: !isResult,
      },
      {
        name: 'scoreTo',
        hidden: !isResult,
      },
      {
        name: 'finalScore',
        renderer: ({ value, record: curRecord }) => {
          const { children, kpiEvalTplIndRemind } =
            curRecord?.get(['children', 'kpiEvalTplIndRemind']) || {};
          return [
            isNil(value) ? (
              '-'
            ) : !isEmpty(children) ? (
              <span>{value}</span>
            ) : (
              <a onClick={() => hanldeScoreStatus(curRecord)}>{value}</a>
            ),
            !isEmpty(kpiEvalTplIndRemind) && (
              <RenderReminder kpiEvalTplIndRemind={kpiEvalTplIndRemind} />
            ),
          ];
        },
      },
      {
        name: 'checkDetailScore',
        hidden: !(modifyScoreRange?.includes('INDICATOR') && isResult),
        editor: curRecord => {
          const children = curRecord?.get('children');
          return (
            isEmpty(children) &&
            !readOnlyFlag &&
            ['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus)
          );
        },
      },
      {
        name: 'evalWeightScore',
        hidden: !isResult,
      },
      {
        name: 'indicatorLevelCode',
        hidden: !isResult,
      },
      {
        name: 'respRemarks',
        hidden: !isResult,
      },
    ].filter(col => !col.hidden);
    const columns = remote
      ? remote.process(
          'SSLM_APPRAISAL_PURCHASER_DETAIL_SCORE_COMBINE_TABLE_EXPANDED_ROW_COlUMS',
          cols,
          { sourceKey, basicDs, parentRecord: record }
        )
      : cols;
    return (
      curIndicatorDs &&
      customizeTable(
        {
          code: detailLineCode,
          readOnly: readOnlyFlag,
        },
        <Table mode="tree" defaultRowExpanded columns={columns} dataSet={curIndicatorDs} />
      )
    );
  };

  // c7n表格全部展开-回调
  const expandAllClick = () => {
    if (dataSet) {
      if (allRowExpandFlag) {
        dataSet.forEach(record => {
          Object.assign(record, { isExpanded: false });
        });
      } else {
        dataSet.forEach(record => {
          handleExpand(true, record);
          Object.assign(record, { isExpanded: true });
        });
      }
    }
    setAllRowExpandFlag(!allRowExpandFlag);
  };

  // 获取查询参数
  const getQueryParams = () => {
    const queryDataSet = dataSet?.queryDataSet?.current;
    const queryParams = queryDataSet?.toJSONData() || {};
    return omit(queryParams, ['__id', '_status', '__dirty']);
  };

  const getButtons = () => {
    const newRectificationFlag =
      !workflowFlag &&
      ['FINAL_COLLECTED', 'COMPLETED', 'PUBLISHED', 'REJECTED', 'SUPPLIER_CONFIRMED'].includes(
        evalStatus
      );
    const rectificationFlag = remote
      ? remote.process(
          'SSLM_APPRAISAL_PURCHASER_DETAIL_SCORE_RESULT_LIST_BUTTONS_RECTIFICATION_FLAG',
          newRectificationFlag,
          { workflowFlag, evalStatus }
        )
      : newRectificationFlag;
    const showAppealFlag = !workflowFlag && appealFlag;
    // 导入按钮显示逻辑
    const importFlag = !workflowFlag && ['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus);
    const btns = [
      rectificationFlag && (
        <Button
          icon="fact_check"
          funcType="flat"
          loading={loading}
          disabled={isEmpty(dataSet.selected)}
          onClick={hanldeRectification}
        >
          {intl.get('sslm.supplierDocManage.view.button.qualityRectification').d('发起质量整改')}
        </Button>
      ),
      showAppealFlag && (
        <Button
          icon="rule"
          funcType="flat"
          loading={loading}
          disabled={isEmpty(dataSet.selected)}
          onClick={onAppeal}
        >
          {intl.get('sslm.common.view.button.dealAppeals').d('处理申诉')}
        </Button>
      ),
      isResult && (
        <ExcelExportPro
          queryParams={() => getQueryParams()}
          requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-line/eval-manage/preview/${evalHeaderId}/export`}
          templateCode="SRM_C_SRM_SSLM_KPI_EVAL_LINE_AND_DTL"
          buttonText={intl.get('hzero.common.button.export').d('导出')}
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
          }}
        />
      ),
      importFlag && (
        <CommonImport
          refreshButton
          prefixPatch={SRM_SSLM}
          businessObjectTemplateCode="SRM_C_SRM_SSLM_KPI_EVAL_SCORE_IMPORT"
          buttonText={intl.get('hzero.common.button.import').d('导入')}
          args={{ evalHeaderId }}
          successCallBack={() => {
            dataSet.query();
            setAllRowExpandFlag(false);
            setIndicatorDs({});
          }}
          buttonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code:
                  'srm.partner.evaluation-manage.appraisal-purchaser.api.purchaser.button.eval-result-import',
                type: 'button',
                meaning: '评分结果-导入',
              },
            ],
          }}
        />
      ),
      <Button
        icon={allRowExpandFlag ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
        funcType="flat"
        loading={loading}
        onClick={expandAllClick}
      >
        {allRowExpandFlag
          ? intl.get('hzero.common.button.collapseAll').d('全部收起')
          : intl.get('hzero.common.button.expandAll').d('全部展开')}
      </Button>,
    ].filter(Boolean);
    const buttons = remote
      ? remote.process('SSLM_APPRAISAL_PURCHASER_DETAIL_SCORE_RESULT_LIST_BUTTONS', btns, {
          basicDs,
          dataSet,
          sourceKey,
          workflowFlag,
          hanldeRectification,
        })
      : btns;
    return buttons;
  };

  const cols = useMemo(() => {
    return [
      {
        name: 'lineStatusMeaning',
        width: 110,
        hidden: !lineStatusFlag || isAppeal,
        renderer: renderStatus,
      },
      {
        name: 'supplierNum',
      },
      {
        name: 'supplierName',
      },
      {
        name: 'categoryName',
        hidden: evalGranularity !== 'SU+CA',
      },
      {
        name: 'itemName',
        hidden: evalGranularity !== 'SU+IT',
      },
      {
        name: 'lineScore',
        width: 80,
        hidden: !(isAppeal || appealFlag || isResult),
        renderer: ({ value, record: curRecord }) => {
          const { kpiEvalTplIndRemind } = curRecord?.get(['kpiEvalTplIndRemind']) || {};
          return [
            <span>{value}</span>,
            !isEmpty(kpiEvalTplIndRemind) && (
              <RenderReminder kpiEvalTplIndRemind={kpiEvalTplIndRemind} />
            ),
          ];
        },
      },
      {
        name: 'checkCollectScore',
        width: 80,
        hidden: !(modifyScoreRange?.includes('SUMMARY_SCORE') && isResult),
        editor: !readOnlyFlag && ['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus),
      },
      {
        name: 'rankNum',
        width: 100,
        hidden: !(isAppeal || appealFlag || isResult),
        renderer: ({ record }) => {
          const { rankNum, supplierTotalNum } = record?.get(['rankNum', 'supplierTotalNum']) || {};
          return rankNum ? `${rankNum}/${supplierTotalNum}` : '-';
        },
      },
      {
        name: 'levelCode',
        width: 80,
        hidden: !(isAppeal || appealFlag || isResult),
      },
      {
        name: 'checkLevelDesc',
        width: 100,
        hidden: !(modifyScoreRange?.includes('GRADE') && isResult),
        editor: !readOnlyFlag && ['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus),
      },
      {
        name: 'appealRankNum',
        width: 80,
        hidden: !(isAppeal || appealFlag),
      },
      {
        name: 'appealLevelCode',
        width: 100,
        hidden: !(isAppeal || appealFlag),
      },
      {
        name: 'appealRemark',
        hidden: !(isAppeal || appealFlag),
      },
      {
        name: 'attachmentUuid',
        hidden: !(isAppeal || appealFlag),
      },
      {
        name: 'appealCheckCollectScore',
        width: 80,
        editor: isAppeal,
        lock: isAppeal ? 'right' : false,
        hidden: !(isAppeal || appealFlag),
      },
      {
        name: 'appealReply',
        width: 200,
        editor: isAppeal,
        lock: isAppeal ? 'right' : false,
        hidden: !(isAppeal || appealFlag),
      },
      {
        name: 'executeAction',
        width: 180,
        hidden: !isResult,
      },
      {
        name: 'toStageDescription',
        width: 100,
        hidden: !isResult,
      },
      {
        name: 'executeTotalCount',
        hidden: !isResult,
        width: 100,
        renderer: ({ record, value }) => (
          <Button funcType="link" onClick={() => handleExecutionDocument(record)}>
            {intl
              .get('sslm.common.model.check.num', {
                num: `(${value || 0})`,
              })
              .d(`查看(${value || 0})`)}
          </Button>
        ),
      },
      {
        name: 'publishDate',
        width: 140,
        hidden: !isResult,
      },
    ].filter(col => !col.hidden);
  }, [
    lineStatusFlag,
    isAppeal,
    evalGranularity,
    appealFlag,
    isResult,
    modifyScoreRange,
    evalStatus,
    readOnlyFlag,
  ]);
  const columns = remote
    ? remote.process('SSLM_APPRAISAL_PURCHASER_DETAIL_SCORE_COMBINE_TABLE_COLUMNS', cols, {
        basicDs,
        dataSet,
      })
    : cols;

  const tableButtons = getButtons();
  const extraTableProps = remote
    ? remote.process('SSLM_APPRAISAL_PURCHASER_DETAIL_SCORE_COMBINE_TABLE_PROPS', {}, { ...props })
    : {};

  return (
    <Fragment>
      {!isAppeal && (
        <SearchBar
          dataSet={[dataSet]}
          searchCode={searchCode}
          fieldProps={fieldProps}
          defaultExpand={false}
          tableButtons={tableButtons}
          expandable={!isEmpty(tableButtons)}
          closeFilterSelector={!isEmpty(tableButtons)}
        />
      )}
      {customizeTable(
        {
          code: customizeUnitCode,
          readOnly: readOnlyFlag,
        },
        <Table
          queryBar="none"
          dataSet={dataSet}
          columns={columns}
          onExpand={handleExpand}
          custLoading={custLoading}
          // style={{ maxHeight: 500 }}
          expandedRowRenderer={expandedRowRenderer}
          selectionMode={isResult && !workflowFlag ? 'rowbox' : 'none'}
          {...extraTableProps}
        />
      )}
    </Fragment>
  );
};

export default observer(ScoreCombineTable, { forwardRef: true });
