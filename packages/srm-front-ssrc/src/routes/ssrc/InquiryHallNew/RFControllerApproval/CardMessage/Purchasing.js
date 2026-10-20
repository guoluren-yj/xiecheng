import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';

import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import {
  historyDiffRenderComp,
  ComponentDiffRender,
} from '@/routes/ssrc/InquiryHallNew/RFController/utils.js';
import styles from './index.less';

const Purchasing = (props) => {
  const { customizeTable, sourcingTeamDs, getCustomizeUnitCode, viewType } = props;

  const columns = useMemo(
    () => [
      {
        name: 'loginName',
        width: 300,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfMember', 'loginName'),
      },
      {
        name: 'contactName',
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfMember', 'contactName'),
      },
      {
        name: 'contactMail',
        width: 200,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfMember', 'contactMail'),
      },
      {
        name: 'contactPhone',
        width: 220,
        renderer: ({ record, dataSet }) => (
          <div style={{ display: 'flex' }}>
            {historyDiffRenderComp(
              record,
              dataSet,
              'rfMember',
              'internationalTelCode',
              record.getField('internationalTelCode')?.getText(record.get('internationalTelCode'))
            )}
            <span>|</span>
            {historyDiffRenderComp(record, dataSet, 'rfMember', 'contactPhone')}
          </div>
        ),
      },
      {
        name: 'publicContactFlag',
        width: 120,
        renderer: ({ value, record }) => {
          return (
            <ComponentDiffRender
              check
              record={record}
              historyDTO="rfMember"
              name="publicContactFlag"
            >
              {yesOrNoRender(value)}
            </ComponentDiffRender>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className={styles['score-element-header']}>
        <h3>
          <div className={styles['card-sub-title-line']} />
          {intl.get('ssrc.rfController.view.card.source.group').d('寻源小组')}
        </h3>
      </div>
      <div className={styles['score-element-table']}>
        {customizeTable(
          {
            code: getCustomizeUnitCode('member', viewType),
          },
          <Table dataSet={sourcingTeamDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
        )}
      </div>
    </React.Fragment>
  );
};

export default observer(Purchasing);
