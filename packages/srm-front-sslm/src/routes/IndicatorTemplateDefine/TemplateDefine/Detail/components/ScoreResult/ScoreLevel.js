/*
 * @Date: 2023-10-19 10:40:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isNil, isEmpty } from 'lodash';
import React, { useCallback, useRef } from 'react';
import { Tabs, Table, Button, Modal, Dropdown, Menu } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import { saveTotalLevelCondition } from '@/services/indicatorTemplateDefineService';
import { handleReferenceIndicator } from '@/routes/components/utils/appraisal';

import styles from './styles.less';
import TotalPointsRule from './TotalPointsRule';

const { TabPane } = Tabs;

const ScoreLevel = ({
  isEdit,
  evalTplId,
  totalPointsDs,
  indicatorScoresDs,
  handleCreateIndicator,
}) => {
  // 总分等级条件配置ref
  const totalPointsRuleRef = useRef(null);

  // 总分等级条件配置
  const handleScoreConfig = record => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 742 },
      className: 'manual-create-modal',
      title: intl.get('sslm.common.model.field.ruleConfiguration').d('条件配置'),
      children: <TotalPointsRule record={record} evalTplId={evalTplId} ref={totalPointsRuleRef} />,
      onOk: () => {
        return new Promise(async resolve => {
          const saveParams = await totalPointsRuleRef.current?.getSaveParams();
          if (saveParams) {
            const params = {
              evalTplId,
              evalLevelId: record.get('evalLevelId'),
              ...(totalPointsRuleRef.current?.conditionRuleData || {}),
              ...saveParams,
            };
            saveTotalLevelCondition(params).then(response => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                resolve();
                totalPointsDs.query();
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        });
      },
    });
  };

  // 渲染总分等级条件配置
  const renderLevelConditions = dataTacticsRuleDesc => {
    const { customizeConditionCombination, conditionLines = [] } = dataTacticsRuleDesc || {};
    const ruleFlag = !isEmpty(conditionLines);
    return (
      <Menu className={styles['level-conditions']} selectable={false}>
        <Menu.Item className={styles['level-conditions-title']}>
          {intl.get('sslm.common.modal.field.conditions').d('条件')}
        </Menu.Item>
        {ruleFlag ? (
          conditionLines.map((item, index) => {
            const { leftValueMeaning, operatorMeaning, rightValueMeaning } = item;
            return (
              <Menu.Item>
                {`#${index + 1} ${leftValueMeaning} ${operatorMeaning} ${rightValueMeaning}`}
              </Menu.Item>
            );
          })
        ) : (
          <Menu.Item>
            {intl.get('sslm.common.modal.field.unconditionalRestrictions').d('无条件限制')}
          </Menu.Item>
        )}
        <Menu.Item className={styles['level-conditions-title']}>
          {intl.get('sslm.common.modal.field.rule').d('规则')}
        </Menu.Item>
        <Menu.Item>{customizeConditionCombination || '-'}</Menu.Item>
      </Menu>
    );
  };

  const totalPointsColumns = [
    {
      name: 'orderReq',
    },
    {
      name: 'levelCode',
    },
    {
      name: 'levelDesc',
    },
    {
      name: 'scoreFrom',
    },
    {
      name: 'scoreTo',
    },
    {
      name: 'dataTacticsRuleDesc',
      editor: false,
      renderer: ({ record, value }) => {
        return isEdit ? (
          <a onClick={() => handleScoreConfig(record)} disabled={!record.get('evalLevelId')}>
            {intl.get('sslm.scoreLevel.model.scoreLevel.conditionConfig').d('总分等级条件配置')}
          </a>
        ) : (
          <Dropdown overlay={renderLevelConditions(value)}>
            <Button funcType="link">
              {intl
                .get('sslm.scoreLevel.model.scoreLevel.checkConditionConfig')
                .d('查看总分等级条件配置')}
            </Button>
          </Dropdown>
        );
      },
    },
    {
      name: 'enabledFlag',
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
    },
  ].map(col => ({ editor: isEdit, ...col }));

  const indicatorScoresColumns = [
    {
      name: 'orderReq',
    },
    {
      name: 'indicatorCode',
      width: 150,
      editor: false,
    },
    {
      name: 'indicatorName',
      width: 150,
      editor: false,
    },
    {
      name: 'scoreTypeMeaning',
      width: 100,
      editor: false,
    },
    {
      name: 'indicatorScoreFrom',
      width: 120,
      editor: false,
    },
    {
      name: 'indicatorScoreTo',
      width: 120,
      editor: false,
    },
    {
      name: 'levelCode',
      width: 100,
    },
    {
      name: 'levelDesc',
      width: 150,
    },
    {
      name: 'scoreFrom',
      width: 100,
    },
    {
      name: 'scoreTo',
      width: 100,
    },
    {
      name: 'enabledFlag',
      width: 80,
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
    },
  ].map(col => ({ editor: isEdit, ...col }));

  const getButtons = useCallback(
    type => {
      if (isEdit) {
        switch (type) {
          case 'definedByTotalPoints':
            return ['add', 'delete'];
          case 'definedByIndexScores':
            return [
              <Button
                icon="playlist_add"
                funcType="flat"
                onClick={() =>
                  handleReferenceIndicator({
                    sourceKey: 'CURRENT_TEMPLATE',
                    dataSet: indicatorScoresDs,
                    queryParams: { evalTplId },
                    onOk: handleCreateIndicator,
                    searchCode: 'SSLM.TEMPLATE_DEFINE.SCORE_RESULT.INDICATOR_SEARCH',
                  })
                }
              >
                {intl.get('hzero.common.button.add').d('新增')}
              </Button>,
              'delete',
            ];
          default:
            return [];
        }
      } else {
        return [];
      }
    },
    [isEdit]
  );

  return (
    <Tabs>
      <TabPane
        key="definedByTotalPoints"
        tab={intl.get(`sslm.scoreLevel.model.scoreLevel.definedByTotalPoints`).d('按总分定义等级')}
      >
        <Table
          dataSet={totalPointsDs}
          columns={totalPointsColumns}
          style={{ maxHeight: 'calc(100vh - 300px)' }}
          buttons={getButtons('definedByTotalPoints')}
          selectionMode={isEdit ? 'rowbox' : 'none'}
          customizedCode="SSLM.TEMPLATE_DEFINE.SCORE_LEVEL.DEFINED_BY_TOTAL_POINTS"
        />
      </TabPane>
      <TabPane
        key="definedByIndexScores"
        tab={intl
          .get(`sslm.scoreLevel.model.scoreLevel.definedByIndexScores`)
          .d('按指标分数定义等级')}
      >
        <Table
          dataSet={indicatorScoresDs}
          columns={indicatorScoresColumns}
          style={{ maxHeight: 'calc(100vh - 300px)' }}
          buttons={getButtons('definedByIndexScores')}
          selectionMode={isEdit ? 'rowbox' : 'none'}
          customizedCode="SSLM.TEMPLATE_DEFINE.SCORE_LEVEL.DEFINED_BY_INDEX_SCORES"
        />
      </TabPane>
    </Tabs>
  );
};

export default ScoreLevel;
