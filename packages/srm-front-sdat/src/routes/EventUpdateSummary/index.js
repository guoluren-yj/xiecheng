/**
 * 事件更新汇总查询
 */
import React, { useState } from 'react';
import intl from 'utils/intl';
// import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header } from 'components/Page';

import LeftMenu from './LeftMenu';
import RightListPanel from './RightListPanel';
import styles from './index.less';

const EventUpdateSummary = (props) => {
  const { history } = props;

  const [selected, setSelected] = useState(null);

  const handleSelectItem = (item) => {
    setSelected(item);
  };

  return (
    <>
      <Header
        title={intl
          .get('sdat.eventUpdateSummary.view.title.eventUpdateSummary')
          .d('事件更新汇总查询')}
      />
      <div className={styles['event-update-summary-basic-panel']}>
        <LeftMenu onSelect={handleSelectItem} />
        <RightListPanel localRecord={selected} history={history} />
      </div>
    </>
  );
};

export default formatterCollections({
  code: [
    'sdat.eventUpdateSummary',
    'sdat.riskControl',
    'sdat.monitorBusiness',
    'sdat.riskDefinition',
    'sdat.common',
    'sdat.monitorStuff',
  ],
})(EventUpdateSummary);
