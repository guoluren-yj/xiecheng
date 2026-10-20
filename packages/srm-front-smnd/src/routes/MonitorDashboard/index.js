import React, { useState, useCallback } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { compose } from 'lodash';
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import BusinessList from './List/BusinessList';
import ServiceList from './List/ServiceList';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { BusinessDateSet } from './store/ListDs';
import { downloadFileByAxios } from 'services/api';
import { delDashboardList } from '@/services/monitorService';
import './index.less';

const { TabPane, TabGroup } = Tabs;

function Index(props) {
  const { customizeTable, history } = props;
  const [activeKey, setActiveKey] = useState('detail');
  const BusinessDs = new DataSet(BusinessDateSet(activeKey));

  const handleChangeKey = useCallback((key) => {
    if (key === 'list') {
      const ds = new DataSet(BusinessDateSet(key));
      ds.queryDataSet.current.reset();
      ds.query();
    }
    setActiveKey(key);
  }, []);

  const handleDelete = (dataSet) => {
    const Ids = dataSet?.selected.map((item) => item.toJSONData()).map((n) => n.id);
    delDashboardList(Ids).then((res) => {
      if (getResponse(res)) {
        notification.success();
        dataSet.query();
        dataSet.unSelectAll();
      }
    });
  };

  const handleExport = () => {
    BusinessDs.status = 'submitting';
    const organizationId = getCurrentOrganizationId();
    const Ids = BusinessDs?.selected.map((item) => item.toJSONData()).map((n) => n.id);
    let params =
      BusinessDs.selected.length > 0
        ? { exportIds: Ids }
        : {
            ...filterNullValueObject(
              (BusinessDs.queryDataSet?.toData().length && BusinessDs.queryDataSet?.toData()[0]) ||
                {}
            ),
          };
    if (params.tenantIdList) {
      params = { ...params, exportTenantIds: params.tenantIdList };
      delete params.tenantIdList;
    }
    const api = `/smnd/v1/${organizationId}/data/export`;
    downloadFileByAxios({
      requestUrl: api,
      method: 'POST',
      queryData: params,
    })
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
        }
        BusinessDs.status = 'ready';
      })
      .finally(() => {
        BusinessDs.status = 'ready';
      });
  };

  const HeaderBtns = observer(({ dataSet }) => {
    const buttons = {
      list: [
        {
          name: 'del',
          group: true,
          child: (
            <>
              <Button
                onClick={() => handleDelete(dataSet)}
                disabled={dataSet?.selected.length === 0}
              >
                {intl.get(`smnd.monitorDashboard.view.message.delete`).d('删除')}
              </Button>
            </>
          ),
        },
        {
          name: 'export',
          group: true,
          child: (
            <Button onClick={() => handleExport()}>
              {dataSet.selected.length > 0
                ? intl.get(`smnd.monitorDashboard.view.message.checkExport`).d('勾选导出')
                : intl.get(`smnd.monitorDashboard.view.message.export`).d('导出')}
            </Button>
          ),
        },
      ],
    };

    if (activeKey === 'list') {
      return <DynamicButtons buttons={buttons.list} />;
    }

    return <DynamicButtons buttons={buttons.detail} />;
  });

  const listProps = {
    customizeTable,
    BusinessDs,
    history,
    activeKey,
  };

  return (
    <>
      <Header title={intl.get(`smnd.monitorDashboard.view.message.title`).d('异常监控数据平台')}>
        <HeaderBtns dataSet={BusinessDs} />
      </Header>

      <Content style={{ padding: 0 }}>
        <Tabs
          className="tabs-btm"
          // defaultActiveKey={activeKey}
          onChange={(key) => handleChangeKey(key)}
        >
          <TabGroup tab={intl.get('smnd.monitorDashboard.view.message.whole').d('聚合视图')}>
            <TabPane
              tab={intl.get(`smnd.monitorDashboard.view.tab.detail`).d('业务异常监控')}
              key="detail"
            >
              <ServiceList {...listProps} />
            </TabPane>
          </TabGroup>
          <TabGroup tab={intl.get('smnd.monitorDashboard.view.message.detail').d('明细视图')}>
            <TabPane
              tab={intl.get(`smnd.monitorDashboard.view.tab.list`).d('服务异常监控')}
              key="list"
              count={() => BusinessDs.totalCount}
            >
              <BusinessList {...listProps} />
            </TabPane>
          </TabGroup>
        </Tabs>
      </Content>
    </>
  );
}

export default compose(
  formatterCollections({
    code: ['smnd.monitorDashboard'],
  }),
  withProps(() => {}, { cacheState: true })
)(Index);
