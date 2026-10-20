/*
 * @Date: 2023-10-19 10:40:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Tabs, Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { handleReferenceIndicator } from '@/routes/components/utils/appraisal';

const { TabPane } = Tabs;

const ScoreReminder = ({
  isEdit,
  evalTplId,
  totalPointsDs,
  indicatorScoresDs,
  handleCreateIndicator,
}) => {
  const totalPointsColumns = [
    {
      name: 'remindScoreFrom',
    },
    {
      name: 'remindScoreTo',
    },
    {
      name: 'remindDesc',
    },
  ].map(col => ({ editor: isEdit, ...col }));

  const indicatorScoresColumns = [
    {
      name: 'indicatorCode',
      width: 150,
    },
    {
      name: 'indicatorName',
      width: 150,
    },
    {
      name: 'remindScoreFrom',
      width: 100,
      editor: isEdit,
    },
    {
      name: 'remindScoreTo',
      width: 100,
      editor: isEdit,
    },
    {
      name: 'remindDesc',
      width: 150,
      editor: isEdit,
    },
  ];

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
        tab={intl.get(`sslm.scoreLevel.model.reminder.definedByTotalPoints`).d('按总分定义配置')}
      >
        <Table
          dataSet={totalPointsDs}
          columns={totalPointsColumns}
          style={{ maxHeight: 'calc(100vh - 300px)' }}
          buttons={getButtons('definedByTotalPoints')}
          selectionMode={isEdit ? 'rowbox' : 'none'}
          customizedCode="SSLM.TEMPLATE_DEFINE.SCORE_REMINDER.DEFINED_BY_TOTAL_POINTS"
        />
      </TabPane>
      <TabPane
        key="definedByIndexScores"
        tab={intl
          .get(`sslm.scoreLevel.model.reminder.definedByIndexScores`)
          .d('按指标分数定义配置')}
      >
        <Table
          dataSet={indicatorScoresDs}
          columns={indicatorScoresColumns}
          style={{ maxHeight: 'calc(100vh - 300px)' }}
          buttons={getButtons('definedByIndexScores')}
          selectionMode={isEdit ? 'rowbox' : 'none'}
          customizedCode="SSLM.TEMPLATE_DEFINE.SCORE_REMINDER.DEFINED_BY_INDEX_SCORES"
        />
      </TabPane>
    </Tabs>
  );
};

export default ScoreReminder;
