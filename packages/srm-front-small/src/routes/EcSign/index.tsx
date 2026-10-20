import React, { useMemo } from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';

import { ecListDS } from './stores';
import EcCard from './EcCard';
import styles from './index.less';

const EcSign: React.FC = () => {
  const ecListDs = useMemo(() => new DataSet(ecListDS()), []);

  return (
    <>
      <Header title={intl.get('small.ecSign.view.title').d('电商签约')} />
      <Content>
        <Spin dataSet={ecListDs}>
          <Observer>
            {() => (
              <div className={styles['ec-sign-container']}>
                {ecListDs.map(record => (
                  <EcCard dataSet={ecListDs} record={record} />
                ))}
              </div>
            )}
          </Observer>
        </Spin>
      </Content>
    </>
  );
};

export default formatterCollections({ code: ['small.ecSign', 'small.common', 'small.ecClient'] })(EcSign);
