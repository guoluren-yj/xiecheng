/*
 * @Description: 返利优惠政策规则维护-详情
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-03-01 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Fragment, useMemo, useContext, useEffect, useState } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import styles from './index.less';
import
{
  Store,
  triggerColumns,
  dimensionColumns,
  issueColumns,
} from './stores';
import SceneInfo from '../components/SceneInfo';
import DimensionLine from '../components/DimensionLine';
import TrigerCondition from '../components/TrigerCondition';
import CalculateRule from '../components/CalculateRule';
import IssueRuleForm from '../components/IssueRuleForm';
import { setNewColumnsProps } from '../../../utils';
import { DimensionType } from '../../../BasicConfiguration/utils/type';
import { renderBubblePrompt } from '../../../../utils/renderer';

const { Panel } = Collapse;

const defaultActiveKey = [
  'sceneInfo',
  'applyRange',
  'triggerCondition',
  'calcRules',
  'issueRules',
];

const DetailContent = observer(() =>
{
  const {
    ruleDs,
    loading,
    configFieldsArr,
    applyRangeDs,
    modal,
    setEditFlag,
  } = useContext(Store);

  const [bubblePrompt, setBubblePrompt] = useState('');

  useEffect(() =>
  {
    // 弹窗中的此组件是只读的，销毁组件后，需要将编辑标识置为true
    if (setEditFlag) setEditFlag(false);
    return () =>
    {
      if (setEditFlag) setEditFlag(true);
    };
  }, [setEditFlag]);


  // 每个step下的全部字段是否都是隐藏
  const [applyIsHideAll, triggerIsHideAll, issueIsHideAll] = [
    setNewColumnsProps(dimensionColumns, ruleDs, configFieldsArr, DimensionType.apply).length === 0,
    setNewColumnsProps(triggerColumns, ruleDs, configFieldsArr).length === 0,
    setNewColumnsProps(issueColumns, ruleDs, configFieldsArr).length === 0,
  ];

  const paneList = useMemo(() => [
    {
      key: 'sceneInfo',
      header: intl.get('spfp.ruleMaintenance.detail.card.title.rebateScenario').d('返利场景'),
      content: <SceneInfo />,
    },
    !triggerIsHideAll && {
      key: 'triggerCondition',
      header: intl.get('spfp.ruleMaintenance.detail.card.title.triggerCond').d('触发条件'),
      content: <TrigerCondition />,
    } as any,
    !applyIsHideAll && {
      key: 'applyRange',
      header: <span>{intl.get('spfp.ruleMaintenance.detail.card.title.appliedRange').d('适用范围')}{renderBubblePrompt(bubblePrompt)}</span>,
      content: <DimensionLine dataSet={applyRangeDs} dimensionType={DimensionType.apply} setBubblePrompt={setBubblePrompt} />,
    } as any,
    {
      key: 'calcRules',
      header: intl.get('spfp.ruleMaintenance.detail.card.title.calcRules').d('计算规则'),
      content: <CalculateRule />,
    } as any,
    !issueIsHideAll && {
      key: 'issueRules',
      header: intl.get('spfp.ruleMaintenance.detail.card.title.issueRules').d('出单规则'),
      content: <IssueRuleForm />,
    } as any,
  ].filter(item => item), [applyIsHideAll, triggerIsHideAll, issueIsHideAll, applyRangeDs, bubblePrompt]);


  return (
    <Fragment>
      <div className={modal ? styles['spfp-rule-maintain-content-view-modal'] : null}>
        <Spin spinning={loading} wrapperClassName="full-height-spinning">
          <Collapse
            ghost
            trigger="icon"
            expandIconPosition="text-right"
            defaultActiveKey={defaultActiveKey}
          >
            {paneList.map((item) =>
            {
              const { content, ...panelProps } = item;
              return (
                <Panel forceRender showArrow={false} {...panelProps}>
                  {content}
                </Panel>
              );
            })}
          </Collapse>
        </Spin>
      </div>
    </Fragment>
  );
}
);


export default DetailContent;
