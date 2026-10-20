import React, { useEffect, useMemo, useState } from 'react';
import { Tabs } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { Content, Header } from 'hzero-front/lib/components/Page';
import Button from '@/components/ObserveButtons';
import { DataSet } from 'choerodon-ui/pro';
import { totalListDS } from '@/stores/InterfaceMonitor/OverviewDs';
import { exceptionListDS } from '@/stores/InterfaceMonitor/ExceptionDs';
import { breakerCircuitData } from '@/stores/InterfaceMonitor/BreakerCircuit';
import interfaceMonitor from '@/models/interfaceMonitor';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { handleBatchReSend } from '@/services/InterfaceMonitorService';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import withProps from 'hzero-front/lib/utils/withProps';
import { listTableDS, treeSearchDs } from '@/stores/InterfaceMonitor/DetailDs';
import Detail from './Detail';
import Overview from './Overview';
import ExceptionQuery from './ExceptionQuery';
import BreakerCircuit from './BreakerCircuit';

import styles from './index.less';

const { TabPane } = Tabs;

// 是否为租户
const isTenant = isTenantRoleLevel();

const InterfaceMonitor: React.FC<any> = ({
  history,
  tableDs,
  exceptionTableDs,
  breakerTableDs,
  searchDs,
  detailListTableDs,
  tabKeyDs,
}) => {
  const [tabKey, setTabKey] = useState(tabKeyDs?.current?.get('tabKey') || '1');
  const [bntLoading, setBntLoading] = useState(false);

  useEffect(() => {
    tableDs.addEventListener('load', handleLoad);
    detailListTableDs.addEventListener('load', handleDetailLoad);
    return () => {
      tableDs.removeEventListener('load', handleLoad);
      detailListTableDs.removeEventListener('load', handleDetailLoad);
      // 关闭接口监控工作台则清空所选的树目录
      interfaceMonitor.setSelectedKey('');
      interfaceMonitor.setInterfaceId(null);
    };
  }, []);

  const handleDetailLoad = () => {
    interfaceMonitor.setLoadingFlag(false);
  };

  // 导出类型接口不可选中重新执行
  const handleLoad = ({ dataSet }) => {
    dataSet.forEach(record => {
      const interfaceType = record.get('interfaceType');
      const responseStatus = record.get('responseStatus');
      // 导出类型接口和数据执行成功，执行中的数据不可选中
      const selectFlag = !(
        interfaceType === 'EXPORT' ||
        responseStatus === 'SUCCESS' ||
        responseStatus === 'RUNNING'
      );
      // eslint-disable-next-line no-param-reassign
      record.selectable = selectFlag;
    });
  };

  const handleChangeTabs = key => {
    if (tabKeyDs.current) {
      tabKeyDs.current.set('tabKey', key);
    }
    setTabKey(key);
  };

  // 单条数据重新执行
  const reExecute = () => {
    setBntLoading(true);
    const data = tableDs.selected.map(item => {
      if (isTenant) {
        return {
          monitorId: item.get('monitorId'),
        };
      } else {
        return {
          monitorId: item.get('monitorId'),
          tenantId: interfaceMonitor.monitorTenantId,
        };
      }
    });
    if (!data.length) return;

    handleBatchReSend(data).then(res => {
      const response = getResponse(res);
      setBntLoading(false);
      if (response) {
        notification.success({});
        tableDs.batchUnSelect(tableDs.selected);
        tableDs.query();
      }
    });
  };

  const renderBtn = useMemo(() => {
    if (tabKey === '2') {
      return (
        <Button
          dataSet={tableDs}
          type="primary"
          icon="reload"
          loading={bntLoading}
          onClick={() => reExecute()}
        >
          {intl.get('hitf.interfaceMonitor.button.reExecute').d('重新执行')}
        </Button>
      );
    }
  }, [tabKey, tableDs, bntLoading]);

  return (
    <>
      <Header title={intl.get('hitf.interfaceMonitor.tab.title.header').d('接口监控工作台')}>
        {renderBtn}
      </Header>
      <Content
        style={{
          overflowY: 'auto',
          height: 'calc(100% - 48px)',
          margin: '0.08rem',
          padding: '0.16rem 0.16rem 0',
        }}
      >
        <Tabs activeKey={tabKey} onChange={handleChangeTabs} className={styles['tab-content']}>
          <TabPane tab={intl.get('hitf.interfaceMonitor.tab.title.detail').d('监控详情')} key="1">
            <Detail
              history={history}
              tableDs={detailListTableDs}
              searchDs={searchDs}
              interfaceMonitor={interfaceMonitor}
            />
          </TabPane>
          <TabPane tab={intl.get('hitf.interfaceMonitor.tab.title.overview').d('监控总览')} key="2">
            <Overview tableDs={tableDs} history={history} />
          </TabPane>
          <TabPane
            tab={intl.get('hitf.interfaceMonitor.tab.title.exception.query').d('异常调用查询')}
            key="3"
          >
            <ExceptionQuery tableDs={exceptionTableDs} history={history} />
          </TabPane>
          <TabPane
            tab={intl.get('hitf.interfaceMonitor.tab.title.breakerCircuit').d('熔断纪录')}
            key="4"
          >
            <BreakerCircuit tableDs={breakerTableDs} />
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
};

export default React.memo(
  formatterCollections({
    code: ['hitf.InterfaceMonitor', 'hitf.interfaceMonitor', 'sitf.interfaceMointoringWork'],
  })(
    withProps(
      () => {
        const tableDs = new DataSet(totalListDS());
        const exceptionTableDs = new DataSet(exceptionListDS());
        const breakerTableDs = new DataSet(breakerCircuitData());
        const detailListTableDs = new DataSet(listTableDS());
        const searchDs = new DataSet(treeSearchDs());
        const tabKeyDs = new DataSet({
          autoCreate: true,
          fields: [
            {
              name: 'tabKey',
              type: FieldType.string,
              defaultValue: '1',
            },
          ],
        });
        return {
          tableDs,
          exceptionTableDs,
          breakerTableDs,
          detailListTableDs,
          searchDs,
          tabKeyDs,
        };
      },
      { cacheState: true }
    )(InterfaceMonitor)
  )
);
