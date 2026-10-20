import React from 'react';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';

import CollapseForm from '_components/CollapseForm';

import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';

const ProjectInfo = (props) => {
  const {
    customizeCollapseForm = noop,
    custLoading,
    basicFormDS = {},
    getCustomizeUnitCode = () => {},
  } = props;

  return (
    <div className={styles['rfx-card-item-form']}>
      {customizeCollapseForm(
        {
          code: getCustomizeUnitCode('project'),
          dataSet: basicFormDS,
        },
        <CollapseForm
          dataSet={basicFormDS}
          labelLayout="float"
          // layout="none"
          showLines={6}
          columns={3}
          custLoading={custLoading}
          useWidthPercent
        />
      )}
    </div>
  );
};

export default observer(ProjectInfo);
