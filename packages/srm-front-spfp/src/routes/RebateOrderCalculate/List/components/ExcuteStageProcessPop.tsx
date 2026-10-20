import React, { useMemo, useCallback } from 'react';
import { Steps } from 'choerodon-ui';
import type Record from 'choerodon-ui/dataset/data-set/Record';
import { observer } from 'mobx-react';
import { isEmpty, isNil } from 'lodash';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import styles from '../../../../index.less';

import { ExcuteStageTypes, ProgressMark } from '../..//utils/type';

const { Step } = Steps;

interface StageProcessPopProps
{
  record: Record | undefined | null,
}


export default observer(({ record }: StageProcessPopProps) =>
{
  const { cumulativeRule, rebatesExecuteStageList, orderStatus } = record?.get(['cumulativeRule', 'rebatesExecuteStageList', 'orderStatus']) || {};

  const ProgressMarkMeaning = useMemo(() => {
    return {
      MATCH_REBATE_RULE: intl.get(`spfp.rebateOrderCaculate.view.message.rebateRuleMatch`).d('返利规则匹配'),
      LOCK_DATA_RANGE: intl.get(`spfp.rebateOrderCaculate.view.message.lockDataRange`).d('锁定数据范围'),
      START_DATA_COMPUTING: intl.get(`spfp.rebateOrderCaculate.view.message.startDataComputing`).d('启动大数据计算'),
      PARSE_FILE: intl.get(`spfp.rebateOrderCaculate.view.message.parseFile`).d('解析文件'),
      EXECUTION_EVALUATION_RULE: intl.get(`spfp.rebateOrderCaculate.view.message.executionEvaluationRule`).d('执行计算规则'),
      TAKE_PRICE: intl.get(`spfp.rebateOrderCaculate.view.message.takePrice`).d('取价'),
      ORDERING: intl.get(`spfp.rebateOrderCaculate.view.message.ordering`).d('出单'),
      NO_ORDER: intl.get(`spfp.rebateOrderCaculate.view.message.noNeedOrdering`).d('暂不出单'),
      NO_NEED_HANDLE: intl.get(`spfp.rebateOrderCaculate.view.message.noNeedHandleOrdering`).d('无需出单'),
    };
  }, []);

  // 【规则模式】为【赠品】时,总共有7种类型，否则6种
  const excuteStageTypes = useMemo(() =>
    Object.keys(ExcuteStageTypes)
      .filter((type) => ['GIFT'].includes(cumulativeRule)
        ? true
        : type !== ExcuteStageTypes.TAKE_PRICE),
    [cumulativeRule]);

  const allData = useMemo(() =>
  {
    return rebatesExecuteStageList && !isEmpty(rebatesExecuteStageList) ? excuteStageTypes.map((eachType) =>
    {
      const eachTypeContent = (rebatesExecuteStageList).find(item => item.stageType === eachType) || {};
      const { completeFlag, errorFlag } = eachTypeContent;
      const renderType = (eachType === 'ORDERING' && ['NO_ORDER', 'NO_NEED_HANDLE'].includes(orderStatus)) ? orderStatus : eachType;
      return {
        name: eachType,
        status: !isNil(completeFlag)
          ? completeFlag === 0 // 未完成
            ? ProgressMark.PROCESS :
            completeFlag === 1 && errorFlag === 0
              ? ProgressMark.FINISH
              : ProgressMark.ERROR
          : ProgressMark.WAIT,
        title: ProgressMarkMeaning[renderType],
        // description: beginDate,
      };
    }) : [];

  }, [excuteStageTypes, rebatesExecuteStageList, ProgressMarkMeaning, orderStatus]);

  // 条件:优先找出进行中或错误或最后一个已结束的
  const getCurrent = useCallback((status, index) =>
    [ProgressMark.PROCESS, ProgressMark.ERROR].includes(status)
    || allData.length - 1 === index && [ProgressMark.FINISH].includes(status),
    [allData]);

  const currentItem = useMemo(() => allData.find((typeItem, index) => getCurrent(typeItem.status, index)), [allData, getCurrent]);
  // 如果上述条件都不符合，找到最近的一个待执行的
  const waitIndex = useMemo(() => allData.findIndex((v) => [ProgressMark.WAIT].includes(v.status)), [allData]);
  const { title, status, name } = currentItem || allData[waitIndex] || allData[allData.length - 1] || {};
  const toolTipText = useMemo(() => intl.get(`spfp.rebateOrderCaculate.view.message.rebateToolTipText`).d('当前大数据计算执行完毕，后续计算出单将于次日凌晨继续执行'), []);

  return title ? (
    <div className={status === ProgressMark.WAIT && styles['wait-step']}>
      <Steps type="popup" headerText={name === 'PARSE_FILE' && status === ProgressMark.WAIT ? <Tooltip title={toolTipText}>{title}</Tooltip> : title} status={status}>
        {(allData || []).map(data =>
        {
          return <Step {...data} />;
        })}

      </Steps>
    </div>
  ) : <span>-</span>;
});
