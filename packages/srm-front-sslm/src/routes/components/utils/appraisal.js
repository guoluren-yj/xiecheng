/*
 * appraisal - 绩效考评相关方法
 * @Date: 2023-11-15 09:55:17
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import moment from 'moment';
import { isEmpty, isFunction } from 'lodash';
import { Modal, DataSet, Table, Tooltip, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import MultipleTextField from '@/routes/components/MultipleTextField';

import {
  getReferenceIndicatorDs,
  getReferenceIndicatorColumns,
} from '@/routes/IndicatorTemplateDefine/stores/getReferenceIndicatorDS';
import {
  getFormulaConfigDS,
  getFormulaConfigColumns,
  getOptionsConfigDS,
  getOptionsConfigColumns,
  getParamDefinitionDS,
  getParamDefinitionColumns,
  getParamConfigDS,
  getParamConfigColumns,
} from '@/routes/IndicatorTemplateDefine/stores/getIndicatorConfigDS';

let searchBarRef; // 筛选器ref

// SSLM.KPI_EVAL_CYCLE_MONTH 月份值集转数字
const getMonthNum = combineTimeUnit => {
  switch (combineTimeUnit) {
    case 'JANUARY':
      return 0;
    case 'FEBRUARY':
      return 1;
    case 'MARCH':
      return 2;
    case 'APRIL':
      return 3;
    case 'MAY':
      return 4;
    case 'JUNE':
      return 5;
    case 'JULY':
      return 6;
    case 'AUGUST':
      return 7;
    case 'SEPTEMBER':
      return 8;
    case 'OCTOBER':
      return 9;
    case 'NOVEMBER':
      return 10;
    case 'DECEMBER':
      return 11;
    default:
      break;
  }
};

// SSLM.KPI_EVAL_CYCLE_QUARTER 季度值集转数字
const getQuarterum = combineTimeUnit => {
  switch (combineTimeUnit) {
    case 'Q1':
      return 1;
    case 'Q2':
      return 2;
    case 'Q3':
      return 3;
    case 'Q4':
      return 4;
    default:
      break;
  }
};

// 根据考评周期+月度、季度、半年度、年度计算考评日期从和至
export const getEvalDate = (evalCycle, combineTimeUnit) => {
  const now = moment(); // 当前时间
  switch (evalCycle) {
    case 'MONTH': {
      // 月度
      const monthNum = getMonthNum(combineTimeUnit);
      const customMontht = moment().month(monthNum);
      const startDate = customMontht.startOf('month'); // 开始时间
      if (startDate.isAfter(now)) {
        // 如果开始时间大于当前时间，年份减1
        startDate.subtract(1, 'years');
      }
      const evalDateFrom = startDate.format('YYYY-MM-DD');
      const evalDateTo = customMontht.endOf('month').format('YYYY-MM-DD');
      return { evalDateFrom, evalDateTo };
    }
    case 'QUARTER': {
      // 季度
      const quarterNum = getQuarterum(combineTimeUnit);
      const customQuarter = moment().quarter(quarterNum);
      const startDate = customQuarter.startOf('quarter'); // 开始时间
      if (startDate.isAfter(now)) {
        // 如果开始时间大于当前时间，年份减1
        startDate.subtract(1, 'years');
      }
      const evalDateFrom = startDate.format('YYYY-MM-DD');
      const evalDateTo = customQuarter.endOf('quarter').format('YYYY-MM-DD');
      return { evalDateFrom, evalDateTo };
    }
    case 'HALF-YEAR': {
      // 半年度
      let evalDateFrom;
      let evalDateTo;
      // 上半年
      if (combineTimeUnit === 'FIRST') {
        const startDate = moment()
          .month(0)
          .startOf('month'); // 开始时间
        const endDate = moment()
          .month(5)
          .endOf('month'); // 结束时间
        if (startDate.isAfter(now)) {
          // 如果开始时间大于当前时间，年份减1
          startDate.subtract(1, 'years');
          endDate.subtract(1, 'years');
        }
        evalDateFrom = startDate.format('YYYY-MM-DD');
        evalDateTo = endDate.format('YYYY-MM-DD');
      } else {
        // 下半年
        const startDate = moment()
          .month(6)
          .startOf('month'); // 开始时间
        const endDate = moment()
          .month(11)
          .endOf('month'); // 结束时间
        if (startDate.isAfter(now)) {
          // 如果开始时间大于当前时间，年份减1
          startDate.subtract(1, 'years');
          endDate.subtract(1, 'years');
        }
        evalDateFrom = startDate.format('YYYY-MM-DD');
        evalDateTo = endDate.format('YYYY-MM-DD');
      }
      return { evalDateFrom, evalDateTo };
    }
    case 'YEAR': {
      // 年度
      const customYear = moment().year(combineTimeUnit);
      const evalDateFrom = customYear.startOf('year').format('YYYY-MM-DD');
      const evalDateTo = customYear.endOf('year').format('YYYY-MM-DD');
      return { evalDateFrom, evalDateTo };
    }
    default:
      break;
  }
};

// 根据考评周期，计算考评日期从
export const getEvalDateFrom = evalCycle => {
  switch (evalCycle) {
    case 'MONTH':
      return moment().startOf('month');
    case 'QUARTER':
      return moment().startOf('quarter');
    case 'HALF-YEAR': {
      const currentMonth = moment().month();
      const evalDateFrom =
        currentMonth > 5
          ? moment()
              .startOf('year')
              .add(6, 'months')
          : moment().startOf('year');
      return evalDateFrom;
    }
    case 'YEAR':
      return moment().startOf('year');
    default:
      break;
  }
};

// 根据考评周期，计算考评日期至
export const getEvalDateTo = (evalDateFrom, evalCycle) => {
  if (!isEmpty(evalDateFrom)) {
    switch (evalCycle) {
      case 'MONTH':
        return moment(evalDateFrom)
          .add(1, 'months')
          .subtract(1, 'days');
      case 'QUARTER':
        return moment(evalDateFrom)
          .add(3, 'months')
          .subtract(1, 'days');
      case 'HALF-YEAR':
        return moment(evalDateFrom)
          .add(6, 'months')
          .subtract(1, 'days');
      case 'YEAR':
        return moment(evalDateFrom)
          .add(12, 'months')
          .subtract(1, 'days');
      default:
        break;
    }
  }
};

// 消息提醒
export const RenderReminder = ({ kpiEvalTplIndRemind }) => {
  return (
    <Tooltip title={kpiEvalTplIndRemind.remindDesc}>
      <span
        style={{
          padding: 1,
          marginLeft: 8,
          cursor: 'pointer',
          borderRadius: '2px',
          background: 'rgba(230, 67, 34, 0.15)',
        }}
      >
        <Icon
          type="error"
          style={{
            fontSize: 14,
            color: '#E64322',
            marginTop: '-3px',
          }}
        />
      </span>
    </Tooltip>
  );
};

// 系统计算指标-参数定义
export const handleParamDefinition = ({ isEdit = false, sourceKey, lineRecord } = {}) => {
  const { evalTplId, evalTplIndId, indicatorFmlId, evalTplIndFmlId } =
    lineRecord?.get(['evalTplId', 'evalTplIndId', 'indicatorFmlId', 'evalTplIndFmlId']) || {};
  const indFmlId = sourceKey === 'CURRENT_TEMPLATE' ? evalTplIndFmlId : indicatorFmlId;
  const dataSet = new DataSet(
    getParamDefinitionDS({ sourceKey, indFmlId, evalTplId, evalTplIndId })
  );
  const columns = getParamDefinitionColumns({ isEdit });
  const queryParams = sourceKey === 'CURRENT_TEMPLATE' ? { evalTplIndFmlId } : { indicatorFmlId };
  dataSet.setQueryParameter('queryParams', queryParams);
  dataSet.query();
  Modal.open({
    key: Modal.key(),
    style: { width: 742 },
    drawer: true,
    okCancel: isEdit,
    title: intl.get('sslm.common.model.formula.paramDefinition').d('参数定义'),
    okText: isEdit
      ? intl.get('hzero.common.button.save').d('保存')
      : intl.get('hzero.common.button.close').d('关闭'),
    children: (
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={isEdit ? ['add', 'delete'] : []}
        selectionMode={isEdit ? 'rowbox' : 'none'}
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      />
    ),
    onOk: () => {
      return dataSet.submit();
    },
  });
};

// 系统计算指标-参数配置
export const handleParamConfig = ({ isEdit = false, sourceKey, lineRecord } = {}) => {
  const { indicatorFmlId, evalTplIndFmlId } =
    lineRecord?.get(['indicatorFmlId', 'evalTplIndFmlId']) || {};
  const indFmlId = sourceKey === 'CURRENT_TEMPLATE' ? evalTplIndFmlId : indicatorFmlId;
  const dataSet = new DataSet(getParamConfigDS({ sourceKey, indFmlId }));
  const columns = getParamConfigColumns({ isEdit, sourceKey });
  const queryParams = sourceKey === 'CURRENT_TEMPLATE' ? { evalTplIndFmlId } : { indicatorFmlId };
  dataSet.setQueryParameter('queryParams', queryParams);
  dataSet.query();
  Modal.open({
    key: Modal.key(),
    style: { width: 742 },
    drawer: true,
    okCancel: isEdit,
    title: intl.get('sslm.common.model.formula.paramConfig').d('参数配置'),
    okText: isEdit
      ? intl.get('hzero.common.button.sure').d('确定')
      : intl.get('hzero.common.button.close').d('关闭'),
    children: (
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={isEdit ? ['add', 'delete'] : []}
        selectionMode={isEdit ? 'rowbox' : 'none'}
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      />
    ),
    onOk: () => {
      return dataSet.submit();
    },
  });
};

// 查看配置回调
export const handleConfiguration = ({ type, isEdit, evalTplId, indicatorId, sourceKey }) => {
  const isFormulaConfig = type === 'formulaConfig'; // 公式配置
  const title = isFormulaConfig
    ? intl.get('spfm.supplierKpiIndicator.view.button.formulaConfig').d('公式配置')
    : intl.get('spfm.supplierKpiIndicator.view.button.optionsConfig').d('选项配置');
  const configDataSet = new DataSet(
    isFormulaConfig
      ? getFormulaConfigDS({ evalTplId, indicatorId, sourceKey })
      : getOptionsConfigDS({ evalTplId, indicatorId, sourceKey })
  );
  const configColumns = isFormulaConfig
    ? getFormulaConfigColumns({ isEdit, type, sourceKey })
    : getOptionsConfigColumns({ isEdit });
  const customizedCode = isFormulaConfig
    ? 'SSLM.INDICATOR_DEFINE.LIST_FORMULA_CONFIG'
    : 'SSLM.INDICATOR_DEFINE.LIST_OPTIONS_CONFIG';
  configDataSet.query();
  Modal.open({
    title,
    drawer: true,
    key: Modal.key(),
    style: { width: 742 },
    cancelButton: Boolean(isEdit),
    okText: isEdit
      ? intl.get('hzero.common.button.sure').d('确定')
      : intl.get('hzero.common.button.close').d('关闭'),
    children: (
      <Table
        dataSet={configDataSet}
        columns={configColumns}
        customizedCode={customizedCode}
        buttons={isEdit ? ['add', 'delete'] : []}
        selectionMode={isEdit ? 'rowbox' : 'none'}
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      />
    ),
    onOk: () => {
      return configDataSet.submit();
    },
  });
};

// 筛选器左侧渲染
const renderLeftSearchBar = (_, queryDataSet) => {
  return (
    <MultipleTextField
      multiple={false}
      dataSet={queryDataSet}
      name="indicatorCodeOrName"
      placeholder={intl
        .get('sslm.common.modal.placeholder.indicatorCodeOrName')
        .d('请输入指标编码、名称查询')}
    />
  );
};

const handleQuery = ({ params, dataSet }) => {
  if (dataSet.queryDataSet?.current) {
    const { customizeOrderField, ...rest } = params;
    const orderField = {}; // 排序
    if (customizeOrderField) {
      const newCustomizeOrderField = customizeOrderField?.split(':');
      const orderKey = newCustomizeOrderField[0];
      const orderValue = newCustomizeOrderField[1];
      if (orderKey === 'creationDate') {
        // 按创建时间排序时，后端自己手动处理
        orderField.creationDateOrder = orderValue;
      } else {
        orderField.customizeOrderField = customizeOrderField;
      }
    }
    const clearParams = {}; // 清理
    const dataObj = dataSet.queryDataSet.current.toData();
    if (dataObj) {
      for (const key in dataObj) {
        if (!['creationDateOrder'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    dataSet.queryDataSet.current.set({
      ...rest,
      ...orderField,
      ...clearParams,
    });
    dataSet.query();
  } else {
    // 解决设置默认值查询不生效问题
    searchBarRef.handleQuery(true);
  }
};

// 引用平台指标/租户指标/当前模板中维护的指标
// 指标定义-新建指标、模板定义-考评指标-新建指标（后续改动需全局排查）
// sourceKey: PLATFORM // 平台级指标 TENANT // 租户级指标 TEMPLATE// 模板指标 CURRENT_TEMPLATE// 当前模板中维护的指标
export const handleReferenceIndicator = ({
  onOk,
  record,
  dataSet,
  sourceKey,
  queryParams = {},
  searchCode,
} = {}) => {
  const referenceIndicatorDs = new DataSet(getReferenceIndicatorDs({ sourceKey, queryParams }));
  referenceIndicatorDs.setQueryParameter('customizeUnitCode', searchCode);
  Modal.open({
    key: Modal.key(),
    drawer: true,
    style: { width: 1090 },
    className: 'reference-indicator-modal',
    title: intl.get('sslm.indicatorTemplate.model.title.createIndicator').d('新建指标'),
    children: (
      <SearchBarTable
        virtual
        virtualCell
        cacheState
        mode="tree"
        searchCode={searchCode}
        dataSet={referenceIndicatorDs}
        searchBarRef={ref => {
          searchBarRef = ref;
        }}
        style={{ maxHeight: `calc(100vh - 180px)` }}
        defaultRowExpanded={sourceKey === 'CURRENT_TEMPLATE'}
        customizedCode="SSLM.INDICATOR_TEMPLATE.INDICATOR_TABLE"
        columns={getReferenceIndicatorColumns(sourceKey, handleConfiguration)}
        searchBarConfig={{
          left: {
            render: renderLeftSearchBar,
          },
          expandable: false,
          closeFilterSelector: true,
          onQuery: ({ params }) => handleQuery({ params, dataSet: referenceIndicatorDs }),
        }}
      />
    ),
    onOk: () => {
      return new Promise(resolve => {
        const selectedRows = referenceIndicatorDs.selected.map(item => item.toData());
        if (isEmpty(selectedRows)) {
          notification.warning({
            message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
          });
          resolve(false);
        } else if (isFunction(onOk)) {
          onOk({ record, selectedRows, resolve, dataSet });
        }
      });
    },
  });
};
