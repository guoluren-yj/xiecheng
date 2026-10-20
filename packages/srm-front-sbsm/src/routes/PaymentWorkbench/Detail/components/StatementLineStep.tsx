import React, { useMemo, Fragment } from 'react';
import { Card } from 'choerodon-ui';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import BasicInfo from './BasicInfo';
import StatementLineInfo from './StatementLineInfo';

interface StatementLineStepProps {
  source?: 'approveEdit',
}

const StatementLineStep = (props: StatementLineStepProps) => {

  const { source } = props;

  const cardList = useMemo(() => {
    return [
      {
        key: 'basic',
        title: intl.get('sbsm.common.view.title.basicInfo').d('基础信息'),
        content: <BasicInfo />,
      },
      {
        key: 'line',
        title: intl.get('sbsm.common.view.title.statementLineInfo').d('流水行信息'),
        content: <StatementLineInfo source={source} />,
      },
    ];
  }, [source]);

  return (
    <Fragment>
      {cardList.map((item) => {
        const { content, ...panelProps } = item;
        return (
          <Card bordered={false} className={DETAIL_CARD_CLASSNAME} {...panelProps}>
            {content}
          </Card>
        );
      })}
    </Fragment>
  );
};

export default StatementLineStep;