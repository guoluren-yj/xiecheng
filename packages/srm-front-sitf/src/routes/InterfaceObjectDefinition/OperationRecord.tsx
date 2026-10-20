import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { fetchOperationNav, operationData } from './initialDataDs';
import './index.less';

const { TabPane } = Tabs;
enum TabsPosition {
  top = 'top',
  bottom = 'bottom',
  left = 'left',
  right = 'right',
}

const columns = [
  {
    name: 'version',
  },
  {
    name: 'fieldSourceMeaning',
  },
  {
    name: 'actionTypeMeaning',
  },
  {
    name: 'fieldCode',
  },
  {
    name: 'fieldName',
  },
  {
    name: 'sourceNode',
  },
  {
    name: 'createMeaning',
  },
  {
    name: 'creationDate',
  },
];

const OperationRecord: React.FC<any> = (props) => {
  const {tenantId, objectId} = props;
  const [navData, setNavData] = useState([]);
  const [tabKey, setTabKey] = useState('');
  const operationDataDs = useMemo(() => new DataSet(operationData()), []);

  useEffect(() => {
    if(!isNil(tenantId) && !isNil(objectId)) {
      fetchOperationNav({tenantId, objectId}).then(res => {
        const resp = getResponse(res);
        if(resp) {
          setNavData(resp.content);
          handleChangeTab(resp.content[0].recordId)
        }
      })
    }
  }, [objectId, tenantId]);

  const renderTab = (item) => {
    return(
      <div style={{lineHeight: 2}}>
        <div><span style={{paddingRight: '8px', fontWeight: 600}}>{item.operatorMeaning}</span>{item.actionTypeMeaning}{item.remark}</div>
        <div style={{color: "#c2c5c9"}}>{item.fieldSourceMeaning} <span style={{paddingLeft: '10px'}}>{intl.get('scux.interfaceObjectDefinition.model.interfaceObjectDefinition.version').d('版本')}: {item.version}</span></div>
        <div style={{color: "#c2c5c9"}}>{item.creationDate}</div>
      </div>
    );
  };

  const handleChangeTab = useCallback((key) => {
    console.log(111, key);
    
    setTabKey(`${key}`);
    if(!isNil(tenantId) && !isNil(objectId)) {
      operationDataDs.setQueryParameter('recordId', key);
      operationDataDs.setQueryParameter('tenantId', tenantId);
      operationDataDs.setQueryParameter('objectId', objectId);
      operationDataDs.query();
    }
  }, [objectId, tenantId]);

  return (
    <div className='operationStyle'>
      <Tabs tabPosition={TabsPosition.left} activeKey={tabKey} onChange={handleChangeTab} style={{height: 'calc(100vh - 130px)'}} flex>
        {navData.map((item: any) => <TabPane tab={renderTab(item)} key={item.recordId}>
        <div className='contentStyle' style={{backgroundColor: 'white'}}>
          <div className="titleTag">
            {intl.get(`scux.interfaceObjectDefinition.view.tab.update.details`).d('修改明细')}
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
  code: ['scux.interfaceObjectDefinition', 'hzero.common'],
})(OperationRecord);
