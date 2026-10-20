/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-01 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useState, useEffect, useContext } from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'srm-front-boot/lib/utils/intl';
import { Tabs } from 'choerodon-ui';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import qs from 'querystring';
import { ObjectMenuType } from '../../components/utils/common';
import BaseInfo from './BaseInfo';
import FieldInformation from './FieldInformation';
import TemplateManagement from './TemplateManagement';
import { Store } from './StoreProvider';
import styles from './index.less';

const { TabPane } = Tabs;

const RoManagementDetail = () => {
  const { history, location, templateDs, tableDs, domainId, domainCode } = useContext(Store);
  let _search = location.search.split('?')?.[1];
  _search = qs.parse(_search);
  const { combineId, combineCode, combineName, docObjectId, originKey } = _search || {};
  const [activeKey, setActiveKey] = useState(ObjectMenuType.fieldList);

  const fieldInformationProps = {
    history,
    combineName,
    combineCode,
    combineId,
    docObjectId, // 单据对象主键id
    tableDs,
  };
  useEffect(() => {
    if (originKey) {
      setActiveKey(originKey);
    }
  }, [originKey]);

  return (
    <>
      <Header backPath="/swbh/role-object-management/list" title={combineName} />
      <Content>
        <div className={styles['role-object-container']}>
          <Tabs tabPosition={TabsPosition.left} activeKey={activeKey} onChange={(key) => setActiveKey(key)}>
            <TabPane
              tab={intl.get('swbh.common.view.message.baseInfo').d('基础信息')}
              key={ObjectMenuType.baseInfo}
              forceRender
            >
              <BaseInfo {...fieldInformationProps} />
            </TabPane>
            <TabPane
              tab={intl.get('swbh.roManagement.view.message.tab.fieldInfo').d('字段信息')}
              key={ObjectMenuType.fieldList}
              forceRender
            >
              <FieldInformation {...fieldInformationProps} />
            </TabPane>
            <TabPane
              tab={intl.get('swbh.roManagement.view.message.tab.templateManagement').d('模板管理')}
              key={ObjectMenuType.templateManagement}
              forceRender
            >
              <TemplateManagement
                history={history}
                templateDs={templateDs}
                combineCode={combineCode}
                docObjectId={docObjectId}
                combineName={combineName}
                domainId={domainId}
                domainCode={domainCode}
                combineId={combineId}
                tableDs={tableDs}
              />
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['swbh.roManagement', 'swbh.common', 'hzero.common'],
})(observer(RoManagementDetail));
