/*
 * @Date: 2023-10-23 13:45:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { Divider, Tag } from 'choerodon-ui';
import { isEmpty, head, isNil } from 'lodash';
import React, { useMemo, useCallback, useState, useEffect, useImperativeHandle } from 'react';
import { CheckBox, Tabs, TextField, Form, Icon, Button, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import SearchBarTable from '_components/SearchBarTable';

import { RenderReminder } from '@/routes/components/utils/appraisal';
import { getTooltipShow, renderStatus } from '@/routes/components/utils';
import { ReactComponent as NoTab } from '@/assets/appraisal/no-tab.svg';
import { ReactComponent as NoData } from '@/assets/appraisal/no-data.svg';

import styles from '../../index.less';
import {
  tabKey,
  checkBoxLabel,
  queryPlaceholder,
  getTableGroups,
  combinePlaceholder,
} from '../../utils';
import { getScoreInfoDs } from '../../stores/getScoreInfoDS';

const { TabPane } = Tabs;
let searchBarRef; // 筛选器ref

// 评分信息头渲染
const HeaderRender = ({
  dataSet,
  isEdit,
  evalGranularity,
  dimension,
  supplierDimension,
  onDimension,
  onQuery,
}) => {
  return (
    <div className={styles['score-info-header']}>
      <div className={styles['score-info-header-title']}>
        {intl.get('sslm.common.view.message.gradInfo').d('评分信息')}
      </div>
      {isEdit && (
        <CheckBox name="lineScoreStatus" dataSet={dataSet} onChange={() => onQuery()}>
          {checkBoxLabel()[dimension]}
        </CheckBox>
      )}
      {isEdit && evalGranularity !== 'SU' && <Divider type="vertical" />}
      <div
        className={styles['score-info-dimension']}
        style={{ display: evalGranularity !== 'SU' ? 'flex' : 'none' }}
      >
        <div
          onClick={() => onDimension(true)}
          className={classNames({ [styles.active]: supplierDimension })}
        >
          {intl.get(`sslm.common.view.supplier.supplierCompany`).d('供应商')}
        </div>
        <div
          onClick={() => onDimension(false)}
          className={classNames({ [styles.active]: !supplierDimension })}
        >
          {intl.get('sslm.appraisalScore.view.message.materialCategory').d('物料品类')}
        </div>
      </div>
    </div>
  );
};

// tab额外的渲染
const TabBarExtra = ({ dataSet, onQuery, dimension }) => {
  const placeholder = queryPlaceholder()[dimension];
  return (
    <Form columns={3} dataSet={dataSet} className={styles['tabs-extra-form']}>
      <TextField
        clearButton
        name="extraParameter"
        placeholder={placeholder}
        onInput={event => {
          if (dataSet.current) {
            dataSet.current.set('extraParameter', event.target.value);
          }
        }}
        onEnterDown={() => onQuery()}
        onBlur={() => onQuery()}
        onClear={() => onQuery()}
        style={{ width: 200 }}
        prefix={<Icon type="search" />}
      />
    </Form>
  );
};

// 无数据时的渲染
const NoDataRender = () => {
  return (
    <div className={styles['no-data-wrap']}>
      <div className={styles['no-tab']}>
        <NoTab />
        <span> {intl.get('sslm.common.view.message.noData').d('暂无数据')}</span>
      </div>
      <div className={styles['no-data']}>
        <NoData />
        <span> {intl.get('sslm.common.view.message.noData').d('暂无数据')}</span>
      </div>
    </div>
  );
};

const ScoreInfo = (props, ref) => {
  const {
    remote,
    isEdit,
    basicDs,
    leftData,
    sourceKey,
    onGiveUp,
    onTransfer,
    wfParams = {},
    readOnlyFlag,
    submitUserId,
    leftFitlterDs,
    evalGranularity,
    queryScoreLeft,
    customizeTable,
    evalHeaderId,
    saveCurTabData,
    customizeUnitCode,
  } = props;
  const [supplierDimension, setSupplierDimension] = useState(true);
  const [pageChacheFlag, setPageChacheFlag] = useState(true);
  const [activeKey, setActiveKey] = useState(null);

  const tableDs = useDataSet(() => getScoreInfoDs({ evalGranularity, evalHeaderId }), [
    evalGranularity,
    evalHeaderId,
    activeKey,
  ]);

  const { backReasonFlag, abandonFlag } =
    basicDs?.current?.get(['backReasonFlag', 'abandonFlag']) || {};
  const dimension = useMemo(
    () => (supplierDimension ? 'SU' : evalGranularity === 'SU+CA' ? 'CA' : 'IT'),
    [supplierDimension, evalGranularity]
  );

  useImperativeHandle(
    ref,
    () => {
      return { tableDs };
    },
    [tableDs]
  );

  // 维度存于ds中，便于查询接口获取维度
  useEffect(() => {
    if (leftFitlterDs.current) {
      leftFitlterDs.current.set('dimension', dimension);
    }
  }, [dimension]);

  // 左侧数据变更时，activeKey变更，tabChangeFlag标识是否是切换tab调用保存后的查询导致leftData变化，此时无需设置activeKey
  useEffect(() => {
    if (!isEmpty(leftData) && !head(leftData).tabChangeFlag) {
      const firstActiveKey = head(leftData)[tabKey[dimension]];
      setActiveKey(String(firstActiveKey));
    }
  }, [leftData]);

  // 评分表格查询
  const handleQuery = ({ params } = {}) => {
    if (!isEmpty(leftData)) {
      if (tableDs.queryDataSet?.current) {
        const clearParams = {}; // 清理
        const dataObj = tableDs.queryDataSet.current.toData();
        if (dataObj) {
          for (const key in dataObj) {
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
        tableDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        });
        if (pageChacheFlag) {
          tableDs.query(tableDs.currentPage);
        } else {
          tableDs.query();
        }
      } else {
        searchBarRef.handleQuery(true);
      }
    }
  };

  useEffect(() => {
    if (activeKey) {
      const queryParams = {
        ...wfParams,
        submitUserId,
        customizeUnitCode: [
          'SSLM.SCORING_WORKBENCH_DETAIL.SCORE_SEARCH_BAR',
          customizeUnitCode,
        ].join(),
        [tabKey[dimension]]: activeKey,
        // 可编辑状态下传WAIT_SCORE，后端用来过滤掉已评分指标
        pageSource: isEdit ? 'WAIT_SCORE' : null,
      };
      tableDs.setQueryParameter('queryParams', queryParams);
    }
  }, [isEdit, activeKey, submitUserId, dimension, JSON.stringify(wfParams)]);

  // 保存表格当前数据
  const saveCurData = async () => {
    let saveFlag = true;
    if (tableDs.dirty) {
      const validateFlag = await tableDs.validate();
      if (validateFlag) {
        const currentTableData = tableDs.toData();
        const saveData = {
          evalHeaderId,
          customizeUnitCode,
          kpiEvalDetailLineDTOPage: {
            content: currentTableData,
          },
        };
        saveFlag = await saveCurTabData(saveData);
      } else {
        notification.error({
          message: intl.get('sslm.common.message.error.maintainRequiredInfo').d('请维护必填信息！'),
        });
        saveFlag = false;
      }
    }
    return saveFlag;
  };

  // 左侧tab改变的回调
  const handleTabsChange = async key => {
    const saveFlag = await saveCurData();
    if (saveFlag) {
      clearFieldsValues(); // tab切换清空自定义查询条件
      setActiveKey(key);
    }
  };

  // 维度改变时的回调
  const handleDimension = flag => {
    const queryType = flag ? 'SU' : evalGranularity === 'SU+CA' ? 'CA' : 'IT';
    if (leftFitlterDs.current) {
      leftFitlterDs.current.set('extraParameter', null);
      leftFitlterDs.current.set('lineScoreStatus', 0);
      leftFitlterDs.current.set('dimension', queryType);
    }
    clearFieldsValues(); // 切换维度,清空自定义查询条件
    queryScoreLeft();
    setSupplierDimension(flag);
  };

  // 渲染TabPane的tab
  const getTabPaneTitle = useCallback(
    supplier => {
      const {
        itemCode,
        itemName,
        categoryCode,
        categoryName,
        supplierNum,
        supplierName,
        lineScoreStatus,
        lineScoreStatusMeaning,
      } = supplier;
      const newItemName =
        dimension === 'CA' ? categoryName : dimension === 'IT' ? itemName : supplierName;
      const newItemCode =
        dimension === 'CA' ? categoryCode : dimension === 'IT' ? itemCode : supplierNum;
      return (
        <div className="tab-title-wrap">
          <div className="item-name-wrap">
            <span className="item-name">{getTooltipShow(newItemName, 14, 140)}</span>
            {sourceKey !== 'APPROVAL_FORM' && (
              <Tag color={lineScoreStatus === '0' ? 'yellow' : 'green'}>
                {lineScoreStatusMeaning}
              </Tag>
            )}
          </div>
          <div className="item-num">{newItemCode}</div>
        </div>
      );
    },
    [dimension, sourceKey]
  );

  // 筛选器左侧渲染
  const renderLeftSearchBar = (_, queryDataSet) => {
    const type = supplierDimension ? (evalGranularity === 'SU+CA' ? 'CA' : 'IT') : 'SU';
    const name =
      type === 'CA' ? 'combineCategory' : type === 'IT' ? 'combineItem' : 'combineSupplier';
    return (
      <TextField
        clearButton
        name={name}
        dataSet={queryDataSet}
        style={{ width: 280 }}
        placeholder={combinePlaceholder()[type]}
        prefix={<Icon type="search" style={{ fontSize: 14, paddingLeft: 8, paddingRight: 8 }} />}
      />
    );
  };

  const clearFieldsValues = () => {
    if (tableDs.queryDataSet && tableDs.queryDataSet.current) {
      tableDs.queryDataSet.current.reset();
    }
  };

  // 查询条件参数
  const getFieldProps = useCallback(
    () => ({
      indicatorId: {
        lovPara: { evalHeaderId },
      },
      supplierCategoryIds: {
        optionsProps: {
          paging: 'server',
          childrenField: 'children',
        },
      },
    }),
    [evalHeaderId]
  );

  // 获取表格操作按钮
  const getButtons = () => {
    const isDisabled = isEmpty(tableDs.selected);
    return isEdit
      ? [
        <Button
          name="transmit"
          icon="recover"
          funcType="flat"
          onClick={onTransfer}
          disabled={isDisabled}
        >
          {intl.get('sslm.common.button.transmit').d('转交')}
        </Button>,
        <Button
          icon="cancel"
          funcType="flat"
          name="giveUpScore"
          onClick={onGiveUp}
          hidden={!abandonFlag}
          disabled={isDisabled}
        >
          {intl.get(`sslm.common.view.button.giveUpScore`).d('放弃评分')}
        </Button>,
        ]
      : [];
  };
  const buttons = remote
    ? remote.process('SSLM_APPRAISAL_SCORE_DETAIL_TABLE_BTNS', getButtons(), { tableDs, ...props })
    : getButtons();

  const cols = [
    {
      name: 'completeFlagMeaning',
      width: 120,
      renderer: renderStatus,
    },
    {
      name: 'indicatorName',
      width: 120,
    },
    {
      name: 'evalStandard',
      width: 120,
    },
    {
      name: 'indicatorTypeMeaning',
      width: 100,
    },
    {
      name: 'finalScore',
      width: 120,
      editor: record =>
        isEdit && record.get('completeFlag') !== 4 && record.get('indicatorType') === 'SCORE',
      renderer: ({ record, text, value }) => {
        const kpiEvalTplIndRemind = record.get('kpiEvalTplIndRemind') || {};
        return isEdit && record.get('completeFlag') !== 4 && record.get('indicatorType') === 'SCORE'
          ? [
            <span key="text">{text}</span>,
              !isEmpty(kpiEvalTplIndRemind) && (
                <RenderReminder kpiEvalTplIndRemind={kpiEvalTplIndRemind} />
              ),
            ]
          : isNil(value)
          ? '-'
          : value;
      },
    },
    {
      name: 'evalWeight',
      width: 100,
    },
    {
      name: 'score',
      width: 100,
      renderer: ({ record }) => {
        const { scoreFrom, scoreTo } = record.get(['scoreFrom', 'scoreTo']);
        if (isNil(scoreFrom) && isNil(scoreTo)) {
          return '-';
        } else {
          return `${scoreFrom} ~ ${scoreTo}`;
        }
      },
    },
    {
      name: 'respWeight',
      width: 100,
    },
    {
      name: 'isStandard',
      width: 100,
      editor: record =>
        isEdit && record.get('completeFlag') !== 4 && record.get('indicatorType') === 'TICK',
      renderer: ({ value, record }) =>
        record?.get('indicatorType') === 'TICK' ? yesOrNoRender(value) : '-',
    },
    {
      name: 'isVeto',
      width: 100,
      editor: record =>
        isEdit && record.get('completeFlag') !== 4 && record.get('indicatorType') === 'VETO',
      renderer: ({ value, record }) =>
        record?.get('indicatorType') === 'VETO' ? yesOrNoRender(value) : '-',
    },
    {
      name: 'indOptName',
      width: 120,
      editor: record =>
        isEdit && record.get('completeFlag') !== 4 && record.get('indicatorType') === 'OPT',
    },
    {
      name: 'remark',
      width: 150,
      editor: record => isEdit && record.get('completeFlag') !== 4,
    },
    {
      name: 'transformReason',
      width: 150,
    },
    {
      name: 'scorerAttachmentUuid',
      width: 120,
      editor: record => isEdit && record.get('completeFlag') !== 4,
    },
    {
      name: 'backReason',
      width: 120,
      hidden: !backReasonFlag,
    },
  ];
  const columns = remote
    ? remote.process('SSLM_APPRAISAL_SCORE_DETAIL_SCORE_INFO_COLUMNS', cols, { isEdit, basicDs })
    : cols;

  const rightRenderFlag = remote
    ? remote.process('SSLM_APPRAISALSCORE_PURCHASER__WOEKFLOW_DETAIL_RIGHTRENDER', true)
    : true;
  const RightRenderDom = remote
    ? remote.process('SSLM_APPRAISALSCORE_PURCHASER__WOEKFLOW_DETAIL_RIGHTRENDERDOM', null, {
        activeKey,
        basicDs,
        leftData,
        sourceKey,
        onGiveUp,
        onTransfer,
        wfParams,
        readOnlyFlag,
        submitUserId,
        leftFitlterDs,
        evalGranularity,
        queryScoreLeft,
        evalHeaderId,
        saveCurTabData,
      })
    : null;

  return (
    <div className={styles['score-info-wrap']}>
      <HeaderRender
        isEdit={isEdit}
        dimension={dimension}
        dataSet={leftFitlterDs}
        evalGranularity={evalGranularity}
        supplierDimension={supplierDimension}
        onQuery={queryScoreLeft}
        onDimension={handleDimension}
      />
      <div className={styles['score-info-content']}>
        <div className={styles['score-info-content-tabs']}>
          <Tabs
            tabPosition="left"
            activeKey={activeKey}
            onChange={handleTabsChange}
            tabBarExtraContent={
              <TabBarExtra dataSet={leftFitlterDs} onQuery={queryScoreLeft} dimension={dimension} />
            }
          >
            {(leftData || []).map(supplier => (
              <TabPane key={supplier[tabKey[dimension]]} tab={getTabPaneTitle(supplier)} />
            ))}
          </Tabs>
        </div>
        <div className={styles['score-info-content-table']}>
          {!isEmpty(leftData) &&
            rightRenderFlag &&
            customizeTable(
              {
                code: customizeUnitCode,
                readOnly: readOnlyFlag,
              },
              <SearchBarTable
                key={activeKey}
                dataSet={tableDs}
                columns={columns}
                virtual={false}
                virtualCell={false}
                buttons={buttons}
                showAllPageSelectionButton
                style={{ maxHeight: 'calc(100vh - 260px)' }}
                selectionMode={isEdit ? 'rowbox' : 'none'}
                groups={getTableGroups({ dimension, evalGranularity })}
                searchCode="SSLM.SCORING_WORKBENCH_DETAIL.SCORE_SEARCH_BAR"
                searchBarRef={node => {
                  searchBarRef = node;
                }}
                searchBarConfig={{
                  expandable: isEdit,
                  defaultExpand: false,
                  closeFilterSelector: isEdit,
                  left: {
                    render: evalGranularity === 'SU' ? null : renderLeftSearchBar,
                  },
                  fieldProps: getFieldProps(),
                  onQuery: handleQuery,
                  onClear: clearFieldsValues,
                  onFieldChange: () => {
                    setPageChacheFlag(false);
                  },
                }}
              />
            )}
          {RightRenderDom || <></>}
        </div>
      </div>
      {isEmpty(leftData) && <NoDataRender />}
    </div>
  );
};

export default observer(ScoreInfo, { forwardRef: true });
