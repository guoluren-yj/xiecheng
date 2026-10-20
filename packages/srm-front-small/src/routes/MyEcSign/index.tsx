import React, { useMemo } from 'react';
import { DataSet, Spin  } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';

import { ReactComponent as NoEcSign } from '@/assets/noEcSign.svg';
import { ecListDS } from './stores';
import EcCard from './EcCard';
import styles from './index.less';

const EcSign: React.FC = () => {
  const ecListDs = useMemo(() => new DataSet(ecListDS()), []);

  return (
    <>
      <Header title={intl.get('small.ecSign.view.myEcSign').d('我的电商')} />
      <Content>
        <Spin dataSet={ecListDs}>
          <Observer>
            {() => (
              <>
                {ecListDs.length > 0 ? (
                  <div className={styles['ec-sign-container']}>
                    {ecListDs.map(record => (
                      <EcCard dataSet={ecListDs} record={record} />
                    ))}
                  </div>
                ) : ecListDs.status === DataSetStatus.ready && (
                  <div className={styles['no-ec-sign-container']}>
                    <div className='no-ec-sign'>
                      <NoEcSign />
                      <p>{intl.get('small.ecSign.view.noEcSign').d('暂无签约电商')}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </Observer>
        </Spin>
      </Content>
    </>
  );
};

export default formatterCollections({ code: ['small.ecSign'] })(EcSign);
