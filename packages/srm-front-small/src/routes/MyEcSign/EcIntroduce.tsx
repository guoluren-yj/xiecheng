import React, { useMemo } from 'react';
import { DataSet, Form, Output, Spin } from 'choerodon-ui/pro';
import type { RouteComponentProps } from 'react-router';
import { observer } from 'mobx-react-lite';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';

import { ecSigningDS } from './stores';
import styles from './index.less';

const EcIntroduce: React.FC<RouteComponentProps> = (props) => {
  const {
    match: { params },
  } = props;
  const { ecPlatformId } = params as {ecPlatformId: string};
  const ecSigningDs = useMemo(() => (new DataSet(ecSigningDS(ecPlatformId))), []);
  return (
    <>
    <Header title={intl.get('small.ecSign.view.viewSignDes').d('查看电商介绍')} backPath="/small/my-ec-sign/list" />
    <Content style={{padding: 20}}>
      <Spin dataSet={ecSigningDs}>
        <div className={styles['ec-introduce']}>
          <div className="ec-name-wrapper">
            <span className="ec-name text-overflow">{ecSigningDs.current?.get('ecPlatformName')}</span>
          </div>
          <Form
            dataSet={ecSigningDs}
            columns={1}
            className="c7n-pro-vertical-form-display"
            // @ts-ignore
            useWidthPercent
          >
            <Output name="ecIntroduction" renderer={({value}) => (
              <div dangerouslySetInnerHTML={{__html: value}} />
            )} />
          </Form>
        </div>
      </Spin>
    </Content>
    </>
  );
}

export default observer(EcIntroduce);
