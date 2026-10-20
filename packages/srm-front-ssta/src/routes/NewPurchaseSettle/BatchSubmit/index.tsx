// import { stringify } from 'querystring';
import React, { Fragment, useMemo, useCallback, useContext } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import { getActiveTabKey, updateTab } from 'utils/menuTab';


// import style from './index.less';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import Basic from './components/Basic';
import Line from './components/Line';
import commonStyles from '../../common.less';
import styles from './index.less';


const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'line',
];

const Detail = observer(() => {
  const {
    loading,
    modal,
    notPub,
    location,
  } = useContext<StoreValueType>(Store);
  const { state } = location || {};

  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`ssta.common.view.title.basicInfo`).d('基本信息'),
        content: <Basic />,
      },
      {
        key: 'line',
        header: intl.get(`ssta.common.view.title.settleLineBatch`).d('结算单列表'),
        content: <Line />,
      } as any,
    ].filter(Boolean);
  }, []);

  const backPath = useMemo(() => {
    return state?.backPath || '/ssta/new-purchase-settle/list';
  }, [state]);
  const updateTabLink = useCallback((search, stateKey) => {
    updateTab({
      key: getActiveTabKey(),
      search,
      state: stateKey,
    });
  }, []);

  return (
    <Fragment>
      {
        !modal && (
          <Header
            title={notPub && intl.get(`ssta.common.view.title.settleDocBatch`).d('结算单批次')}
            backPath={notPub ? backPath : ''}
            onBack={() => {
                  if (notPub && state?.backPath) {
                      updateTabLink(state?.backPath.split('?')[1], null);
                  }
              }}
          />
        )
      }
      <div className={`${!!modal && styles['ssta-detail-modal-content']} ${
          commonStyles['ssta-detail-content']
        } ssta-detail-splite-content`}
      >
        <Spin spinning={loading}>
          <div className="ssta-detail-collapse-content">
            <Collapse
              ghost
              trigger="icon"
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              {paneList.map((item) => {
                const { content, ...panelProps } = item;
                return (
                  <Panel showArrow={false} {...panelProps}>
                    {content}
                  </Panel>
                );
              })}
            </Collapse>
          </div>
        </Spin>
      </div>
    </Fragment>
  );
});

const BatchSubmit = (props) => {
  return <StoreProvider {...props}><Detail /></StoreProvider>;
};

export default BatchSubmit;
