import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';

import { TagRenderer } from '../renderer';
import styles from './index.less';

interface IEcIntroduceProps {
  ecSignStatus: string,
  ecSignStatusMeaning: string,
  ecPlatformName: string,
  ecIntroduction: string,
  style?: object
}

const EcIntroduce: React.FC<IEcIntroduceProps> = ({
  ecSignStatus,
  ecSignStatusMeaning,
  ecPlatformName,
  ecIntroduction,
  style
}) => {
  return (
    <div className={styles['ec-introduce']} style={style}>
      <div className="ec-name-wrapper">
        <span className="ec-name text-overflow">{ecPlatformName}</span>
        <TagRenderer status={ecSignStatus} ecSignStatusMeaning={ecSignStatusMeaning} />
      </div>
      <Form
        columns={1}
        className="c7n-pro-vertical-form-display"
        // @ts-ignore
        useWidthPercent
      >
        <Output name="ecIntroduction" renderer={() => (
          <div dangerouslySetInnerHTML={{__html: ecIntroduction}} />
        )} />
      </Form>
    </div>
  );
}

export default EcIntroduce;
