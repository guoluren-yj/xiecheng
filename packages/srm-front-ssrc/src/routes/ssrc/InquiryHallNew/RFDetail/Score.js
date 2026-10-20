import React, { Fragment } from 'react';
import intl from 'utils/intl';

import Card from '../rfComponents/Card';
import BasicInfo from './CardManage/Score/BasicInfo';
import ScoreResult from './CardManage/Score/ScoreResult';

export default function Score() {
  return (
    <Fragment>
      <Card
        title={intl.get('ssrc.rfDetail.view.card.title.basicInfos').d('基本信息')}
        component={<BasicInfo />}
      />
      <Card
        title={intl.get('ssrc.rfDetail.view.card.title.scoreResult').d('评分结果')}
        component={<ScoreResult />}
      />
    </Fragment>
  );
}
