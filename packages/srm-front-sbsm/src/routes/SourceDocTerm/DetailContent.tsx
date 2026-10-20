import React, { useContext, useMemo } from 'react';
// import type { DataSet } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { Content } from 'components/Page';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import styles from './index.less';
import BasicInfo from './components/BasicInfo';
import TermLine from './components/TermLine';
import SyncLine from './components/SyncLine';

const defaultActiveKey = [
  'basic',
  'line',
  'sync',
];

const { Panel } = Collapse;


const DetailContent = observer(() => {

  const { loading, modalFlag, readOnlyFlag } = useContext<StoreValueType>(Store);

  const panList: any = useMemo(() => {
    return [
      {
        key: 'basic',
        title: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.basicTerm').d('条款基本信息'),
        content: <BasicInfo />,
      },
      {
        key: 'line',
        title: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.lineTerm').d('付款条款阶段'),
        content: <TermLine />,
      },
      readOnlyFlag && {
        key: 'sync',
        title: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.syncStatus').d('同步资金计划状态'),
        content: <SyncLine />,
      },
    ].filter((v: any) => v);
  }, [readOnlyFlag]);


  return (
    <Content
      className={`${modalFlag && styles['sbsm-detail-modal-content-forest']} ${styles['sbsm-detail-content-forest']}`}
    >
      <Spin spinning={loading}>
        <Collapse
          ghost
          trigger="icon"
          expandIconPosition="text-right"
          defaultActiveKey={defaultActiveKey}
        >
          {
            panList.map((item) => (
              <Panel forceRender showArrow={false} key={item.key} header={item.title}>
                {item.content}
              </Panel>
            ))
          }
        </Collapse>
      </Spin>
    </Content>
  );
});

export default DetailContent;
