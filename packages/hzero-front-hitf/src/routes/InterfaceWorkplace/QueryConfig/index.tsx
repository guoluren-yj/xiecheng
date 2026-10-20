import React, { useEffect, useState } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { listTableDS, treeListDs } from '@/stores/InterfaceWorkplace/QueryConfigDs';
import { ReactComponent as NoneSvg } from '@/assets/icons/none.svg';
import LeftTree from './LeftTree';
import ListTable from './ListTable';
// @ts-ignore
import styles from './index.less';

const initialData: any[] = [];

interface QueryConfigProps {
  tabKey: String,
}

const QueryConfig: React.FC<QueryConfigProps> = ({ tabKey }) => {
  const [tableDs] = useState(new DataSet(listTableDS()));
  const [listDs] = useState(new DataSet(treeListDs()));
  const [tenantInterfaceId, setTenantInterfaceId] = useState();
  const [treeData, setTreeData] = useState([]);
  const [expandKeys, setExpandKeys] = useState(initialData);
  const [treeLoading, setTreeLoading] = useState(false);

  useEffect(() => {
    if (tabKey === '2') {
      listDs.query().then(res => {
        if (res) {
          setExpandKeys(getKeys(res));
          setTreeData(res);
        }
      });
    }
  }, [tabKey]);

  const getKeys = (data): Array<string> => {
    const keys: any[] = [];
    data.map((node, index) => {
      if (node.interfaceBannerDTOList) {
        node.interfaceBannerDTOList.map((childNode, childIndex) => {
          keys.push(`${index}-${childIndex}`);
          return childNode;
        });
      }
      keys.push(`${index}`);
      return node;
    });
    return keys;
  };

  const handleTreeSearch = (record) => {
    setTreeLoading(true);
    listDs.setQueryParameter('queryParams', {
      name: record.get('searchIn'),
    });
    listDs.query().then(res => {
      setTreeLoading(false);
      if (res) {
        setExpandKeys(getKeys(res));
        setTreeData(res);
      }
    });
  };

  return (
    <div className={styles.content}>
      <div className={styles['content-leftTree']}>
        <LeftTree
          listDs={listDs}
          handleChange={handleTreeSearch}
          setTenantInterfaceId={setTenantInterfaceId}
          treeData={treeData}
          treeLoading={treeLoading}
          expandKeys={expandKeys}
          setExpandKeys={setExpandKeys}
          tableDs={tableDs}
        />
      </div>
      <div className={styles['content-rightList']}>
        {tenantInterfaceId ? (
          <ListTable
            tableDs={tableDs}
            tenantInterfaceId={tenantInterfaceId}
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
  code: ['hitf.InterfaceWorkplace', 'hitf.interfaceWorkplace', 'hitf.interfaceMonitor'],
})(QueryConfig));
