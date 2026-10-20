/*
 * @Description: 付款计划详情-付款阶段信息
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-26 13:46:18
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useMemo, useCallback, useEffect } from 'react';
import { Table, Button, useModal, Select, notification } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { TableButtonType, SelectionMode, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import type { Buttons, ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { pull, intersection } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { useModalOpen } from '../../../../hooks';
import StatusTag, { getTagColor } from '../../../Components/StatusTag';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import PlanLineDetail from './PlanLineDetail';
import { getNumberSelectContent } from '../../utils/renderer';
import { DetailCustomizeCode } from '../../utils/type';

// 已完成只有金额计算公式【amountMaintainCode】可编辑
// 行状态编辑字段逻辑
// 1、已生效、调整中，新建，所有行字段可编辑
// 2、已完成，只有金额计算公式【amountMaintainCode】可编辑
// 3、执行中，「付款阶段编号、付款阶段描述、是否预付、是否计算阶段金额」不可编辑
// 4、已取消全页面只读
// 5、订单场景下未生效和调整中逻辑一致
export const getAllEditLineStatus = (sodrFlag) => {
  const allEditLineStatus = ['EFFECTIVE', 'ADJUSTING', undefined];
  if (sodrFlag) allEditLineStatus.push('INEFFECTIVE');
  return allEditLineStatus;
};
export const amountCodeEditLineStatus = ['FINISHED'];
export const amountDateEditLineStatus = ['EXECUTING'];

const fieldLinkage: Record<string, Function> = {
  stagePercent: ({ value, dataSet, record }) => {
    const headerDsCurrent = dataSet.parent?.current;
    const sourceAmount = headerDsCurrent?.get('sourceAmount');
    const amountPrecision = record.get('amountPrecision');
    const adjustAmount = math.toFixed(math.multipliedBy(sourceAmount, math.multipliedBy(value, 0.01)), amountPrecision);
    record.set({ adjustAmount });
  },
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
    const { messageRules, planDateRules, planAmountRules, planDateValidRules } = dataSet.parent?.children || {};
    handleCascadeRule(messageRules);
    handleCascadeRule(planDateRules);
    handleCascadeRule(planAmountRules);
    handleCascadeRule(planDateValidRules);
  },
  // 是否预付
  prepayFlag: ({ value, record, dataSet }) => {
    // 基准参考日期根据是否预付做了过滤
    record.set({ baseDateFieldCode: null });
    const parentDs = dataSet.parent;
    if (!parentDs) return;
    const stageNum = record.get('stageNum');
    const handleCascadeHeader = (headerDs) => {
      const headerCurrent = headerDs.current;
      if (headerCurrent) {
        // 「是否预付」允许多行，任意一行存在，则头字段为是，所有行均取消勾选，则为否
        if (!headerCurrent) return;
        if (value === 1) {
          headerCurrent.set('prepayFlag', 1);
        } else {
          const hasPrepay = dataSet.some(record => record.get('prepayFlag') === 1);
          headerCurrent.set('prepayFlag', hasPrepay ? 1 : 0);
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
    handleCascadeHeader(parentDs);
    const { messageRules, planDateRules, planAmountRules, planDateValidRules } = parentDs.children || {};
    handleCascadeRule(messageRules);
    handleCascadeRule(planDateRules);
    handleCascadeRule(planAmountRules);
    handleCascadeRule(planDateValidRules);
  },
  // 是否计算阶段金额
  enableStageAmountFlag: ({ value, record, dataSet }) => {
    // 【是否计算阶段金额=否】时清空金额要素
    record.set({
      amountMaintainCode:
        Number(value) === 1 ?
          dataSet.getField('amountMaintainCode').get('defaultValue') :
          null,
    });
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
    const { planAmountRules } = dataSet.parent?.children || {};
    handleCascadeRule(planAmountRules);
  },
  // 是否计算阶段日期
  enableStageDateFlag: ({ value, record, dataSet }) => {
    // 【是否计算阶段日期=否】时清空日期要素
    record.set({
      dateMaintainCode:
        Number(value) === 1 ?
          dataSet.getField('dateMaintainCode').get('defaultValue') :
          null,
    });
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
    const { messageRules, planDateRules, planDateValidRules } = dataSet.parent?.children || {};
    handleCascadeRule(messageRules);
    handleCascadeRule(planDateRules);
    handleCascadeRule(planDateValidRules);
  },
  // 金额计算公式
  amountMaintainCode: ({ value, record, dataSet }) => {
    const { stagePercent, lineStatus, amountPrecision } = record.get(['stagePercent', 'lineStatus', 'amountPrecision']);
    // 已完成行状态的行不做任何字段级联和调整金额计算
    if (amountCodeEditLineStatus.includes(lineStatus)) return;
    const headerDs = dataSet.parent;
    const headerDsCurrent = headerDs.current;
    const newPartData: Record<string, any> = {};
    if (['COUNT_HUNDRED_PERCENT', 'CUSTOMIZE_PERCENT'].includes(value)) {
      const sourceAmount = headerDsCurrent?.get('sourceAmount');
      newPartData.adjustAmount = math.toFixed(math.multipliedBy(sourceAmount, math.multipliedBy(stagePercent, 0.01)), amountPrecision);
      // 比例-合计100%、比例-阶段自定义时，默认=付款来源单据总额
      newPartData.baseAmountFieldCode = 'paymentAmount';
    } else {
      // 不是【比例-合计100%、比例-阶段自定义】,即为金额时清空影响因素
      Object.assign(newPartData, {
        adjustAmount: null,
        stagePercent: null,
        baseAmountFieldCode: null,
      });
    }
    if (value !== 'CUSTOMIZE_PERCENT') {
      // 当【金额计算公式=比例-阶段自定义】不成立时清空影响因素
      newPartData.grandFlag = 0;
    }
    record.set(newPartData);
    // 最后阶段计算所有行公式
    if (value === 'DOCU_AMOUNT_DIV_STAGE_NUM') handleCascadeLine(dataSet, headerDs);
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

// 级联部分头字段值
const handleCascadeHeader = (lineDs, headerDs) => {
  const headerDsCurrent = headerDs.current;
  if (!headerDsCurrent) return;
  // 「是否预付」允许多行，任意一行存在，则头字段为是，所有行均取消勾选，则为否
  const hasPrepay = lineDs.some(record => Number(record.get('prepayFlag')) === 1);
  headerDsCurrent.set({
    prepayFlag: hasPrepay ? 1 : 0,
    // 行长度大于1时「是否分期」为是，否则为否
    // 删除接口回显数据不分页导致totalCount为0，用length做判断
    stageFlag: lineDs.length > 1 ? 1 : 0,
  });
};

// 级联行部分字段值
const handleCascadeLine = (lineDs, headerDs) => {
  const headerDsCurrent = headerDs.current;
  if (!headerDsCurrent) return;
  // // 保证所有行金额计算公式都为【来源单据金额/阶段数量】时的调整金额，更新列表所有调整金额（删除行除外）
  if (lineDs.every(record => record.get('amountMaintainCode') === 'DOCU_AMOUNT_DIV_STAGE_NUM')) {
    const { sourceAmount, amountPrecision } = headerDsCurrent?.get(['sourceAmount', 'amountPrecision']);
    const totalCount = lineDs.length;
    lineDs.forEach(record => {
      record.set('adjustAmount', math.toFixed(math.div(sourceAmount, totalCount), amountPrecision));
    });
  }
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
  parentCurrent.set('stageFlag', dataSet.length > 1 ? 1 : 0);
};

const onRecordsRemove = ({ dataSet }) => {
  const headerDs = dataSet.parent;
  if (!headerDs) return;
  const { messageRules, planDateRules, planAmountRules, planDateValidRules } = headerDs.children || {};
  handleCascadeHeader(dataSet, headerDs);
  handleCascadeLine(dataSet, headerDs);
  handleCascadeRule(messageRules);
  handleCascadeRule(planDateRules);
  handleCascadeRule(planAmountRules);
  handleCascadeRule(planDateValidRules);
};

const PlanLine = observer(() => {
  const {
    remote,
    editFlag,
    spcmFlag,
    sodrFlag,
    planLineDs,
    planHeaderDs,
    customizeTable,
  } = useContext<StoreValueType>(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const enableTermFlag = planHeaderDs.current?.get('enableTermFlag');
  const lineAddOrDeleteFlag = editFlag && !spcmFlag && Number(enableTermFlag) === 1; // 行新增或删除
  const allEditLineStatus = getAllEditLineStatus(sodrFlag);

  useEffect(() => {
    planLineDs.addEventListener('update', onRecordUpdate);
    planLineDs.addEventListener('create', onRecordsCreate);
    planLineDs.addEventListener('remove', onRecordsRemove);
    planLineDs.addEventListener('reset', onRecordsRemove);
    return () => {
      planLineDs.removeEventListener('update', onRecordUpdate);
      planLineDs.removeEventListener('create', onRecordsCreate);
      planLineDs.removeEventListener('remove', onRecordsRemove);
      planLineDs.removeEventListener('reset', onRecordsRemove);
    };
  }, [planLineDs]);

  const handleViewLineDetail = useCallback((record) => {
    const stageNum = record.get('stageNum') || '';
    modalOpen({
      size: 'large',
      title: `${stageNum} ${intl.get('ssta.paymentPlan.view.title.paymentStageDetail').d('付款阶段详情')}`,
      children: <PlanLineDetail record={record} />,
    });
  }, [modalOpen]);

  const columns: ColumnProps[] = useMemo(() => {
    // 金额计算公式后面的金额日期字段除了已完成其余皆可编辑
    const amountDateFieldsEditor = (record) => !amountCodeEditLineStatus.includes(record.get('lineStatus'));
    const baseFieldsEditor = record => allEditLineStatus.includes(record.get('lineStatus'));
    // 后端要求「是否计算阶段金额=否」时，金额字段前端显示为空
    const manualEmptyRender: any = ({ text, record }) => Number(record?.get('enableStageAmountFlag')) === 1 ? text : null;
    return editFlag ? [
      {
        name: 'lineNum',
        width: 100,
        renderer: ({ record, value }) => {
          if (lineAddOrDeleteFlag) {
            return record?.index !== -1 ? Number(record?.index) + 1 : undefined;
          } else {
            return value;
          }
        },
      },
      {
        name: 'lineStatus',
        width: 120,
        renderer: ({ text, dataSet, record, name }) => text ? (
          <StatusTag text={text} color={getTagColor(dataSet, record, name)} />
        ) : text,
      },
      {
        name: 'stageNum',
        width: 120,
        editor: baseFieldsEditor,
      },
      {
        name: 'stageDesc',
        width: 150,
        editor: baseFieldsEditor,
      },
      {
        name: 'prepayFlag',
        width: 100,
        editor: baseFieldsEditor,
        align: ColumnAlign.left,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'enableStageAmountFlag',
        width: 150,
        editor: baseFieldsEditor,
        align: ColumnAlign.left,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'amountMaintainCode',
        width: 150,
        editor: true,
        help: intl.get('ssta.paymentPlan.view.help.amountMaintainCode').d('控制条款维护时字段必输性，并用于付款申请计划阶段金额计算公式判断。比例-合计100%，阶段基准参考金额默认为付款来源单据金额， 付款计划阶段金额=来源单据金额x阶段比例；来源单据金额/阶段数量，付款计划阶段金额=来源单据金额/阶段数量，比如该条款以订单金额分12期付款，则可通过定义12行阶段，并选择该公式实现'),
      },
      {
        name: 'stagePercent',
        width: 150,
        editor: amountDateFieldsEditor,
        renderer: manualEmptyRender,
      },
      {
        name: 'adjustAmount',
        width: 150,
        editor: amountDateFieldsEditor,
      },
      {
        name: 'originStagePercent',
        width: 130,
      },
      {
        name: 'originStageAmount',
        width: 150,
      },
      {
        name: 'enableStageDateFlag',
        width: 150,
        editor: amountDateFieldsEditor,
        align: ColumnAlign.left,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'dateMaintainCode',
        width: 150,
        editor: amountDateFieldsEditor,
      },
      {
        name: 'baseDateFieldCode',
        width: 150,
        editor: record => amountDateFieldsEditor(record) && <Select optionsFilter={(option) => baseDateFieldCodeFilter(option, record)} />,
      },
      {
        name: 'deadLineDate',
        width: 150,
        editor: (record) => !amountCodeEditLineStatus.includes(record.get('lineStatus')) && (
          <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />
        ),
      },
      {
        name: 'fixedDate',
        width: 100,
        editor: (record) => !amountCodeEditLineStatus.includes(record.get('lineStatus')) && (
          <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />
        ),
      },
      {
        name: 'addMonth',
        width: 100,
        editor: amountDateFieldsEditor,
      },
      {
        name: 'accountPeriod',
        width: 150,
        editor: amountDateFieldsEditor,
      },
      (spcmFlag && {
        name: 'stagePaymentDate',
        width: 150,
        editor: amountDateFieldsEditor,
      }) as ColumnProps,
    ] : [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'lineStatus',
        width: 120,
        renderer: ({ text, dataSet, record, name }) => (
          <StatusTag text={text} color={getTagColor(dataSet, record, name)} />
        ),
      },
      {
        name: 'stageNum',
        width: 120,
      },
      {
        name: 'stageDesc',
        width: 150,
      },
      {
        name: 'stagePercent',
        width: 120,
        renderer: manualEmptyRender,
      },
      {
        name: 'stageAmount',
        width: 120,
        renderer: manualEmptyRender,
      },
      {
        name: 'executedStageAmount',
        width: 120,
        renderer: manualEmptyRender,
      },
      {
        name: 'stageBalance',
        width: 120,
        renderer: manualEmptyRender,
      },
      {
        name: 'baseDateFieldCode',
        width: 150,
      },
      (spcmFlag && {
        name: 'stagePaymentDate',
        width: 150,
      }) as ColumnProps,
      {
        name: 'operation',
        width: 150,
        renderer: ({ record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            onClick={() => handleViewLineDetail(record)}
          >
            {intl.get('ssta.paymentPlan.view.button.viewDetail').d('查看详情')}
          </Button>
        ),
      },
    ];
  }, [handleViewLineDetail, editFlag, spcmFlag, allEditLineStatus, lineAddOrDeleteFlag]);

  // 向下新增避免序号反转
  const handleAddLine = useCallback(() => {
    // 新增行给默认精度以便计算
    const amountPrecision = planHeaderDs.current?.get('amountPrecision');
    const normalAddData = { amountPrecision };
    const otherProps = { planLineDs };
    const processAddData = remote
      ? remote.process('SSTA.PAYMENT_PLAN_DETAIL_CUX.LINE_ADD_DATA', normalAddData, otherProps)
      : normalAddData;
    planLineDs.create(processAddData, -1);
  }, [remote, planLineDs, planHeaderDs]);

  // 删除行时清空无法回写的数据
  const handleDeleteLine = useCallback(async () => {
    const { selected } = planLineDs;
    const invalidRecordFlag = selected.some(record => !allEditLineStatus.includes(record.get('lineStatus')));
    if (invalidRecordFlag) {
      notification.error({
        message: intl.get('hzero.common.status.mistake').d('错误'),
        description: sodrFlag
          ? intl.get('ssta.paymentPlan.view.message.delInvalidStatusRecordSodr').d('删除失败，仅未生效/已生效/变更中阶段允许删除，请检查')
          : intl.get('ssta.paymentPlan.view.message.delInvalidStatusRecord').d('删除失败，仅已生效/变更中阶段允许删除，请检查'),
      });
      return;
    }
    planLineDs.delete(selected);
  }, [sodrFlag, planLineDs, allEditLineStatus]);

  const buttons = useMemo<Buttons[]>(() => {
    return lineAddOrDeleteFlag ?
      [
        [TableButtonType.add, { onClick: handleAddLine }],
        [TableButtonType.delete, { icon: 'delete_sweep', onClick: handleDeleteLine }],
      ] : [];
  }, [handleAddLine, handleDeleteLine, lineAddOrDeleteFlag]);

  return customizeTable(
    { code: DetailCustomizeCode.LineTableCode, readOnly: !editFlag },
    <Table
      buttons={buttons}
      columns={columns}
      dataSet={planLineDs}
      selectionMode={lineAddOrDeleteFlag ? SelectionMode.rowbox : SelectionMode.none}
      style={{ maxHeight: 430 }}
    />
  );
});

export default PlanLine;
