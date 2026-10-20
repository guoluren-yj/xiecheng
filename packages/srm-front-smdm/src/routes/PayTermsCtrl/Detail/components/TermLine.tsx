/*
 * @Description: 付款条款结构化定义
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-20 14:51:11
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useMemo, useContext, useEffect, useCallback } from 'react';
import { Table, IntlField, Select } from 'choerodon-ui/pro';
import { TableButtonType, SelectionMode, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import type { Buttons, ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';
import { pull, intersection } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { fetchTermHeaderData } from '../../utils/api';
import { filterDsDestroyed } from '../../utils/utils';
import { DetailCustomizeCode } from '../../utils/type';
import { getNumberSelectContent } from '../../utils/renderer';

const fieldLinkage: Record<string, Function> = {
  // 付款阶段编号
  stageNum: ({ oldValue, dataSet }) => {
    const handleCascadeRule = (ruleDs) => {
      if (!ruleDs) return;
      // 付款阶段编号变更后规则的适用阶段过滤旧值
      ruleDs.forEach(msgRecord => {
        const oldStageLineNums = Array.from(msgRecord.get('stageLineNums'));
        if (oldStageLineNums.includes(oldValue)) {
          const newStageLineNums = pull(oldStageLineNums, oldValue);
          msgRecord.set('stageLineNums', newStageLineNums);
        }
      });
    };
    const { termPlanMessageRuleList, termPlanDateRuleList, termPlanAmountRuleList, termPlanDateValidRuleList } = dataSet.parent?.children || {};
    handleCascadeRule(termPlanMessageRuleList);
    handleCascadeRule(termPlanDateRuleList);
    handleCascadeRule(termPlanAmountRuleList);
    handleCascadeRule(termPlanDateValidRuleList);
  },
  // 是否预付
  prepayFlag: ({ value, record, dataSet }) => {
    const parentDs = dataSet.parent;
    if (!parentDs) return;
    const stageNum = record.get('stageNum');
    const handleCascadeHeader = (headerDs) => {
      const headerCurrent = headerDs.current;
      if (headerCurrent) {
        // 「是否预付」允许多行，任意一行存在，则头字段为是，所有行均取消勾选，则为否
        if (!headerCurrent) return;
        if (value === 1) {
          headerCurrent.init('prepayFlag', 1);
        } else {
          const hasPrepay = dataSet.some(record => record.get('prepayFlag') === 1);
          headerCurrent.init('prepayFlag', hasPrepay ? 1 : 0);
        }
      }
    };
    const handleCascadeRule = (ruleDs) => {
      if (!ruleDs) return;
      ruleDs.forEach(ruleRecord => {
        const { settleType, stageLineNums } = ruleRecord.get(['settleType', 'stageLineNums']);
        // 变更时需将规则中其他行的适用阶段该行编码过滤
        if ((Number(value) === 1 && settleType !== 'PREPAYMENT') || (Number(value) !== 1 && settleType === 'PREPAYMENT')) {
          const newStageLineNums = pull(Array.from(stageLineNums), stageNum);
          ruleRecord.set('stageLineNums', newStageLineNums);
        }
      });
    };
    record.set({ baseDateFieldCode: null });
    handleCascadeHeader(parentDs);
    const { termPlanMessageRuleList, termPlanDateRuleList, termPlanAmountRuleList, termPlanDateValidRuleList } = parentDs.children || {};
    handleCascadeRule(termPlanMessageRuleList);
    handleCascadeRule(termPlanDateRuleList);
    handleCascadeRule(termPlanAmountRuleList);
    handleCascadeRule(termPlanDateValidRuleList);
  },
  // 是否计算阶段金额
  enableStageAmountFlag: ({ name, value, record, dataSet }) => {
    // 【是否计算阶段金额=否】时清空金额要素
    record.set('amountMaintainCode',
      value === dataSet.getField(name).get('defaultValue') ?
        dataSet.getField('amountMaintainCode').get('defaultValue') :
        null
    );
    const stageNum = record.get('stageNum');
    const handleCascadeRule = (ruleDs) => {
      if (!ruleDs) return;
      ruleDs.forEach(ruleRecord => {
        const { stageLineNums } = ruleRecord.get(['stageLineNums']);
        // 取消勾选时需将规则中金额默认值规则行的适用阶段该行编码过滤
        if (Number(value) !== 1 && stageLineNums.includes(stageNum)) {
          const newStageLineNums = pull(Array.from(stageLineNums), stageNum);
          ruleRecord.set('stageLineNums', newStageLineNums);
        }
      });
    };
    const { termPlanAmountRuleList } = dataSet.parent?.children || {};
    handleCascadeRule(termPlanAmountRuleList);
  },
  // 是否计算阶段日期
  enableStageDateFlag: ({ name, value, record, dataSet }) => {
    // 【是否计算阶段日期=否】时清空日期要素
    record.set('dateMaintainCode',
      value === dataSet.getField(name).get('defaultValue') ?
        dataSet.getField('dateMaintainCode').get('defaultValue') :
        null
    );
    const stageNum = record.get('stageNum');
    const handleCascadeRule = (ruleDs) => {
      if (!ruleDs) return;
      ruleDs.forEach(ruleRecord => {
        const { stageLineNums } = ruleRecord.get(['stageLineNums']);
        // 取消勾选时需将规则中消息提醒和日期默认值行的适用阶段该行编码过滤
        if (Number(value) !== 1 && stageLineNums.includes(stageNum)) {
          const newStageLineNums = pull(Array.from(stageLineNums), stageNum);
          ruleRecord.set('stageLineNums', newStageLineNums);
        }
      });
    };
    const { termPlanMessageRuleList, termPlanDateRuleList, termPlanDateValidRuleList } = dataSet.parent?.children || {};
    handleCascadeRule(termPlanMessageRuleList);
    handleCascadeRule(termPlanDateRuleList);
    handleCascadeRule(termPlanDateValidRuleList);
  },
  // 金额计算公式
  amountMaintainCode: ({ value, record }) => {
    const newPartData: Record<string, any> = {};
    // 不是【比例-合计100%、比例-阶段自定义】时清空影响因素
    if (!['COUNT_HUNDRED_PERCENT', 'CUSTOMIZE_PERCENT'].includes(value)) {
      Object.assign(newPartData, {
        stagePercent: null,
        baseAmountFieldCode: null,
      });
    } else {
      // 比例-合计100%、比例-阶段自定义时，默认=付款来源单据总额
      newPartData.baseAmountFieldCode = 'paymentAmount';
    }
    if (value !== 'CUSTOMIZE_PERCENT') {
      // 当【金额计算公式=比例-阶段自定义】不成立时清空影响因素
      newPartData.grandFlag = 0;
    }
    if (value !== 'AMOUNT') {
      // 当【金额计算公式=金额】不成立时清空影响因素
      newPartData.stageAmount = null;
    }
    record.set(newPartData);
  },
  // 日期计算公式
  dateMaintainCode: ({ value, record }) => {
    const newPartData: Record<string, any> = {};
    // 【日期计算公式=动态基准日期、固定基准日期-月结】不成立时清空影响因素
    if (!['DYNAMIC_BASE_DATE', 'FIXED_BASE_DATE'].includes(value)) {
      Object.assign(newPartData, {
        baseDateFieldCode: null,
        accountPeriod: null,
      });
    }
    // 【日期计算公式=固定基准日期-月结】不成立时清空影响因素
    if (value !== 'FIXED_BASE_DATE') {
      Object.assign(newPartData, {
        deadLineDate: null,
        fixedDate: null,
        addMonth: null,
      });
    }
    record.set(newPartData);
  },
};

const baseDateFieldCodeFilter = (option, record): boolean => {
  const isPrePayment = Number(record.get('prepayFlag')) === 1;
  return isPrePayment ? option.get('tag') !== 'payment' : option.get('tag') !== 'prepayment';
};

const dateMaintainCodeFilter = (option): boolean => option.get('value') !== 'BASE_DATE';

// 级联部分头字段值
const handleCascadeHeader = (lineDs, headerDs) => {
  const headerDsCurrnt = headerDs.current;
  if (!headerDsCurrnt) return;
  // 「是否预付」允许多行，任意一行存在，则头字段为是，所有行均取消勾选，则为否
  const hasPrepay = lineDs.some(record => Number(record.get('prepayFlag')) === 1);
  headerDsCurrnt.init({
    prepayFlag: hasPrepay ? 1 : 0,
    // 行长度大于1时「是否分期」为是，否则为否
    // 删除接口回显数据不分页导致totalCount为0，用length做判断
    stageFlag: lineDs.length > 1 ? 1 : 0,
  });
};

// 级联规则部分字段值
const handleCascadeRule = (ruleDs) => {
  if (!ruleDs) return;
  const newOptions = ruleDs.getField('stageLineNums').getOptions();
  const optionalStageNumList = newOptions.map(optionRecord => optionRecord.get('value'));
  ruleDs.forEach(msgRecord => {
    const oldStageLineNums = Array.from(msgRecord.get('stageLineNums'));
    const newStageLineNums = intersection(oldStageLineNums, optionalStageNumList);
    msgRecord.set('stageLineNums', newStageLineNums);
  });
};

const onRecordUpdate = (data) => fieldLinkage[data.name]?.(data);

const onRecordsCreate = ({ dataSet }) => {
  const parentCurrent = dataSet.parent?.current;
  if (!parentCurrent) return;
  // 行长度大于1时「是否分期」为是，否则为否
  // 删除接口回显数据不分页导致totalCount为0，用length做判断
  parentCurrent.init('stageFlag', dataSet.length > 1 ? 1 : 0);
};

const onRecordsRemove = ({ dataSet }) => {
  const headerDs = dataSet.parent;
  if (!headerDs) return;
  const { termPlanMessageRuleList, termPlanDateRuleList, termPlanAmountRuleList } = headerDs.children || {};
  handleCascadeHeader(dataSet, headerDs);
  handleCascadeRule(termPlanMessageRuleList);
  handleCascadeRule(termPlanDateRuleList);
  handleCascadeRule(termPlanAmountRuleList);
};

const TermLine = observer(() => {
  const { remote, viewFlag, termLineDs, customizeTable, termHeaderDs, termHeaderId } = useContext<StoreValueType>(Store);

  const { sourceCode, enableTermFlag } = termHeaderDs.current?.get(['sourceCode', 'enableTermFlag']);
  const disabledFlag = sourceCode !== 'SRM' || Number(enableTermFlag) !== 1;

  useEffect(() => {
    termLineDs.addEventListener('update', onRecordUpdate);
    termLineDs.addEventListener('create', onRecordsCreate);
    termLineDs.addEventListener('remove', onRecordsRemove);
    termLineDs.addEventListener('reset', onRecordsRemove);
    return () => {
      termLineDs.removeEventListener('update', onRecordUpdate);
      termLineDs.removeEventListener('create', onRecordsCreate);
      termLineDs.removeEventListener('remove', onRecordsRemove);
      termLineDs.removeEventListener('reset', onRecordsRemove);
    };
  }, [termLineDs]);

  const columns: ColumnProps[] = useMemo(() => {
    // 后端要求「是否计算阶段金额=否」时，阶段比例、剩余阶段金额、已执行阶段金额、剩余阶段金额前端显示为空
    const manualEmptyRender: any = ({ value, record }) => Number(record?.get('enableStageAmountFlag')) === 1 ? value : null;
    return [
      {
        name: 'lineNum',
        width: 100,
        renderer: ({ record, value }) => value || Number(record?.index) + 1,
      },
      {
        name: 'stageNum',
        width: 120,
        editor: !viewFlag,
      },
      {
        name: 'stageDesc',
        width: 150,
        editor: !viewFlag && <IntlField />,
      },
      {
        name: 'prepayFlag',
        width: 100,
        editor: !viewFlag,
        align: ColumnAlign.left,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'enableStageAmountFlag',
        width: 150,
        editor: !viewFlag,
        align: ColumnAlign.left,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'amountMaintainCode',
        width: 150,
        editor: !viewFlag,
        help: intl.get('smdm.payTermsCtrl.view.help.amountMaintainCode').d('控制条款维护时字段必输性，并用于付款申请计划阶段金额计算公式判断。比例-合计100%，阶段基准参考金额默认为付款来源单据金额， 付款计划阶段金额=来源单据金额x阶段比例；来源单据金额/阶段数量，付款计划阶段金额=来源单据金额/阶段数量，比如该条款以订单金额分12期付款，则可通过定义12行阶段，并选择该公式实现'),
      },
      {
        name: 'stagePercent',
        width: 150,
        editor: !viewFlag,
        renderer: manualEmptyRender,
      },
      {
        name: 'baseAmountFieldCode',
        width: 150,
        editor: !viewFlag,
        help: intl.get('smdm.payTermsCtrl.view.help.baseAmountFieldCode').d('是否预付=是、金额计算公式=「比例-合计100%」时，阶段基准参考金额建议配置为「付款来源单据金额」，即根据创建付款申请计划的来源单据总额作为各阶段基准参考金额'),
      },
      {
        name: 'grandFlag',
        width: 120,
        editor: !viewFlag,
        align: ColumnAlign.left,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'stageAmount',
        width: 120,
        editor: !viewFlag,
        renderer: manualEmptyRender,
      },
      {
        name: 'enableStageDateFlag',
        width: 150,
        editor: !viewFlag,
        align: ColumnAlign.left,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'dateMaintainCode',
        width: 150,
        editor: !viewFlag && <Select optionsFilter={dateMaintainCodeFilter} />,
      },
      {
        name: 'baseDateFieldCode',
        width: 150,
        editor: record => !viewFlag && <Select optionsFilter={(option) => baseDateFieldCodeFilter(option, record)} />,
      },
      {
        name: 'deadLineDate',
        width: 150,
        editor: !viewFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'fixedDate',
        width: 100,
        editor: !viewFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'addMonth',
        width: 100,
        editor: !viewFlag,
      },
      {
        name: 'accountPeriod',
        width: 150,
        editor: !viewFlag,
      },
    ];
  }, [viewFlag]);

  // 向下新增避免序号反转
  const handleAddLine = useCallback(() => {
    const normalAddData = {};
    const otherProps = { termLineDs };
    const processAddData = remote
      ? remote.process('SMDM.PAY_TERMS_CTRL_DETAIL_CUX.LINE_ADD_DATA', normalAddData, otherProps)
      : normalAddData;
    termLineDs.create(processAddData, -1);
  }, [remote, termLineDs]);

  // 删除行时清空无法回写的数据
  const handleDeleteLine = useCallback(async () => {
    const { selected } = termLineDs;
    const deleteRes = await termLineDs.delete(selected);
    if (!deleteRes) return;
    // 存在无法重新回写的情况
    filterDsDestroyed(termLineDs);
    const newHeaderData = getResponse(await fetchTermHeaderData(termHeaderId));
    const termHeader = termHeaderDs.current;
    if (!newHeaderData || !termHeader) return;
    const { objectVersionNumber } = newHeaderData;
    termHeader.init({ objectVersionNumber });
  }, [termLineDs, termHeaderDs, termHeaderId]);

  const buttons = useMemo<Buttons[]>(() => {
    return viewFlag || disabledFlag ?
      [] :
      [
        [TableButtonType.add, { onClick: handleAddLine }],
        [TableButtonType.delete, { icon: 'delete_sweep', onClick: handleDeleteLine }],
      ];
  }, [viewFlag, disabledFlag, handleAddLine, handleDeleteLine]);

  return (
    <Fragment>
      {customizeTable(
        { code: DetailCustomizeCode.LineTableCode, readOnly: viewFlag },
        <Table
          columns={columns}
          buttons={buttons}
          dataSet={termLineDs}
          selectionMode={viewFlag ||disabledFlag ? SelectionMode.none : SelectionMode.rowbox}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>

  );
});

export default TermLine;