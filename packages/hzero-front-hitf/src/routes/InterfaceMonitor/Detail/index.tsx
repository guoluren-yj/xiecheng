import React, { useEffect, useState } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { DataSet } from 'choerodon-ui/pro';
import { getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { treeListDs } from '@/stores/InterfaceMonitor/DetailDs';
import { getOptions } from '@/services/InterfaceMonitorService';
import { ReactComponent as NoneSvg } from '@/assets/icons/none.svg';
import LeftTree from './LeftTree';
import ListTable from './ListTable';
// @ts-ignore
import styles from './index.less';

const initialData: any[] = [];

const Detail: React.FC<any> = ({ history, searchDs, interfaceMonitor, tableDs }) => {
  const [listDs] = useState(new DataSet(treeListDs()));
  const [tenantInterfaceId, setTenantInterfaceId] = useState(interfaceMonitor.interfaceId);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeData, setTreeData] = useState(initialData);
  const [expandKeys, setExpandKeys] = useState(initialData);
  const [dynamicColumn, setDynamicColumn] = useState(interfaceMonitor.dynamicColumn);
  const [dynamicSearch, setDynamicSearch] = useState(interfaceMonitor.dynamicSearch);
  const [executeResultOptions, setExecuteResultOptions] = useState(initialData);
  const [interfaceTypeOptions, setInterfaceTypeOptions] = useState(initialData);
  useEffect(() => {
    handleTreeSearch(searchDs.current);
    handleGetOptions();
  }, []);

  useEffect(() => {
    const selectKey = tableDs.getState('tenantInterfaceId');
    if(selectKey) {
      setTenantInterfaceId(selectKey);
      interfaceMonitor.setSelectedKey(`0-0-${selectKey}`);
    }
  }, [tableDs]);

  // 获取值集数据
  const handleGetOptions = () => {
    getOptions('HITF.OPEN_DATA_RESULT').then((response) => {
      const res = getResponse(response) || [];
      setExecuteResultOptions(res);
    });
    getOptions('SOPP.INTERFACE_TYPE').then((response) => {
      const res = getResponse(response) || [];
      setInterfaceTypeOptions(res);
    });
  };

  // 模糊查询左侧树接口数据
  const handleTreeSearch = (record) => {
    setTreeLoading(true);
    if(!record.get('tenantId')) {
      tableDs.loadData([]);
      interfaceMonitor.setSelectedKey('');
    }
    listDs.setQueryParameter('queryParams', {
      name: record.get('searchIn'),
      tenantId: record.get('tenantId'),
    });
    listDs.query().then(res => {
      setTreeLoading(false);
      if (res) {
        setExpandKeys(getKeys(res));
        setTreeData(res);
      }
    });
  };

  // 生成树结构key
  const getKeys = (data): Array<string> => {
    const keys: any[] = [];
    data.map((node, index) => {
      if (node.interfaceBannerDTOList) {
        node.interfaceBannerDTOList.map((childNode, childIndex) => {
          if (childNode.interfaceBannerDTOList) {
            node.interfaceBannerDTOList.map((grandChildNode, grandChildIndex) => {
              keys.push(`${index}-${childIndex}-${grandChildIndex}`);
              return grandChildNode;
            });
          }
          ;
          keys.push(`${index}-${childIndex}`);
          return childNode;
        });
      }
      keys.push(`${index}`);
      return node;
    });
    return keys;
  };

  return (
    <div className={styles.content}>
      <div className={styles['content-leftTree']}>
        <LeftTree
          listDs={listDs}
          searchDs={searchDs}
          setTenantInterfaceId={setTenantInterfaceId}
          treeData={treeData}
          handleChange={handleTreeSearch}
          treeLoading={treeLoading}
          expandKeys={expandKeys}
          setExpandKeys={setExpandKeys}
          setDynamicColumn={setDynamicColumn}
          setDynamicSearch={setDynamicSearch}
          interfaceMonitor={interfaceMonitor}
        />
      </div>
      <div className={styles['content-rightList']}>
        {tenantInterfaceId ? (
          <ListTable
            tenantInterfaceId={tenantInterfaceId}
            dynamicColumn={dynamicColumn}
            executeResultOptions={executeResultOptions}
            interfaceTypeOptions={interfaceTypeOptions}
            dynamicSearch={dynamicSearch}
            history={history}
            tableDs={tableDs}
            searchDs={searchDs}
          />
        ) : (
          <div className={styles['none-content']}>
            <div>
              <span className={styles['none-content-svg']}>
                <NoneSvg />
              </span>
              <div className={styles['text-tip']}>
                {/* <div className={styles['text-tip-title']}><b>{intl.get('hitf.interfaceMonitor.no.data').d('暂无参数')}</b></div> */}
                <div className={styles['text-tip-content']}>{intl.get('hitf.interfaceMonitor.select.from.left').d('请先在左侧选择应用或接口')}</div>
              </div>
            </div>
          </div>
          )}
      </div>
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hitf.InterfaceMonitor', 'hitf.interfaceMonitor'],
})(Detail));
