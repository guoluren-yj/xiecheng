import React, { Fragment, useCallback, useMemo, useState, useEffect } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getResponse } from 'hzero-front/lib/utils/utils';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import notification from 'hzero-front/lib/utils/notification';

import { fetchOperationNav, operationData, moreSettingData, fetchObjectSave } from './initialDataDs';
import './index.less';
import MoreSettings from './MoreSettings';

const { TabPane } = Tabs;
enum TabsPosition {
  top = 'top',
  bottom = 'bottom',
  left = 'left',
  right = 'right',
}

const OperationRecord: React.FC<any> = (props) => {
  const {record} = props;
  const [navData, setNavData] = useState([]);
  
  const [tabKey, setTabKey] = useState('');
  const operationDataDs = useMemo(() => new DataSet(operationData()), []);

  useEffect(() => {
    const {tenantId, id} = record.get(['tenantId', 'id'])
    if(!isNil(tenantId) && !isNil(id)) {
      fetchOperationNav({tenantId, extItfId: id}).then(res => {
        const resp = getResponse(res);
        if(resp) {
          setNavData(resp.content);
          handleChangeTab(resp.content[0].id)
        }
      })
    }
  }, [record]);

  const handleSettingMore = useCallback((record) => {
    const moreSettingDataDs = new DataSet(moreSettingData());
    moreSettingDataDs.loadData([record.toData()])
    const {id, tenantId, source} = record.toData();
    Modal.open({
      title: `${intl.get('scux.externalInterfaceDefinition.model.more.setting').d('更多设置')} - ${record.get('code')}`,
      drawer: true,
      style: {width: 600},
      children: <MoreSettings moreSettingDataDs={moreSettingDataDs} record={record} />,
      onOk: async () => {
        let flag = true;
        const validateFlag = await moreSettingDataDs.validate();
        if(validateFlag) {
          const currentData = {
            ...record.toData(),
            ...moreSettingDataDs.current?.toData(),
          };
          const response = await fetchObjectSave(id, {tenantId, source}, [currentData])
          if(getResponse(response)) {
            notification.success({});
            operationDataDs.query();
          } else {
            flag = false;
          }
        } else {
          notification.warning({
            message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!')
          });
          flag = false;
        }

        return flag;
      },
    });
  }, []);

  const columns = useMemo((): ColumnProps[] => [
    {
      name: 'version',
    },
    {
      name: 'source',
    },
    {
      name: 'actionType',
    },
    {
      name: 'code',
    },
    {
      name: 'name',
    },
    {
      name: 'sourceNode',
    },
    {
      name: 'valueSource',
    },
    {
      name: 'valueCode',
    },
    {
      name: 'valueMethod',
    },
    {
      name: 'valueMethodMeans',
    },
    {
      header: intl.get('scux.externalInterfaceDefinition.model.more.setting').d('更多设置'),
      renderer: ({record}) => <a onClick={() => handleSettingMore(record)}>{intl.get('scux.externalInterfaceDefinition.model.more.setting').d('更多设置')}</a>
    },
    {
      name: 'createMeaning',
    },
    {
      name: 'creationDate',
    },
  ], []);

  const renderTab = (item) => {
    return(
      <div style={{lineHeight: 2}}>
        <div><span style={{paddingRight: '8px', fontWeight: 600}}>{item.operatorMeaning}</span>{item.actionTypeMeaning}{item.remark}</div>
        <div style={{color: "#c2c5c9"}}>{item.fieldSourceMeaning} <span style={{paddingLeft: '10px'}}>{intl.get('scux.externalInterfaceDefinition.model.externalInterfaceDefinition.version').d('版本')}: {item.version}</span></div>
        <div style={{color: "#c2c5c9"}}>{item.creationDate}</div>
      </div>
    );
  };

  const handleChangeTab = useCallback((key) => {
    setTabKey(`${key}`);
    const {tenantId, id } = record.get(['tenantId', 'id'])
    if(!isNil(tenantId)) {
      operationDataDs.setQueryParameter('extItfId', id);
      operationDataDs.setQueryParameter('tenantId', tenantId);
      operationDataDs.setQueryParameter('recordId', key);
      operationDataDs.query();
    }
  }, [record]);

  return (
    <div className='operationStyle'>
      <Tabs tabPosition={TabsPosition.left} activeKey={tabKey} onChange={handleChangeTab} style={{height: 'calc(100vh - 130px)'}} flex>
        {navData.map((item: any) => <TabPane tab={renderTab(item)} key={item.id}>
        <div className='contentStyle' style={{backgroundColor: 'white'}}>
          <div className="titleTag">
            {intl.get(`scux.externalInterfaceDefinition.view.tab.update.details`).d('修改明细')}
          </div>
          <FilterBarTable
             border={true}
             dataSet={operationDataDs}
             columns={columns}
             filterBarConfig={{
              autoQuery: false
             }}
          />
        </div>
        </TabPane>)}
      </Tabs>
    </div>
  );
};

export default formatterCollections({
  code: ['scux.externalInterfaceDefinition', 'hzero.common'],
})(OperationRecord);
