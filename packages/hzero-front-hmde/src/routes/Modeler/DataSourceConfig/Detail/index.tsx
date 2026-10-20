/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import { Content } from 'components/Page';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Tabs } from 'choerodon-ui';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import { ESourceCategory, EModeStatus } from '@/globalData/modelManager';
import SeeSource from './SeeSource';
import EditSource from './EditSource';
import APIPane from './APIPane';
import FieldMapping from './FieldMapping';
import styles from './index.less';
// import ImgIcon from '@/utils/ImgIcon';

const { TabPane } = Tabs;
interface IIndexProps {
  handleSourceMenuQuery: (data: any, type: string | null) => any; // fixme
}
export default observer(({ handleSourceMenuQuery }: IIndexProps) => {
  const {
    platformHidden,
    setDataObject,
    setTabActiveKey,
    dataObject: {
      dataObjectDetailType,
      level,
      tabActiveKey,
      dataObjectDetail,
      dataObjectDetail: {
        dataObjectName,
        dataObjectCode,
        publishStatus,
        dataObjectOwnerType,
        dataObjectCategory,
      },
    },
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
  const APIPaneProps = {
    handleSourceMenuQuery,
    level,
  };
  const editSourceProps = {
    handleSourceMenuQuery, // 左边菜单查询
  };
  const seeSourceProps = {
    handleSourceMenuQuery, // 左边菜单查询
  };
  // 切换中间面板，控制右边显示
  return (
    <Content className={styles['model-detail']}>
      {dataObjectDetailType === 'see' && (
        <div className={styles['model-detail-header']}>
          <div className={styles['model-detail-base']}>
            <h3>{dataObjectName}</h3>
            <p>
              <span className={styles['model-detail-label']}>数据对象编码：</span>
              {dataObjectCode}
            </p>
          </div>
          {!(
            (dataObjectOwnerType === 'PLATFORM_SHARED' && platformHidden) ||
            dataObjectCategory === ESourceCategory.API
          ) &&
            tabActiveKey === '1' &&
            // 预定义的也不能编辑
            dataObjectOwnerType !== 'PREDEFINE' && (
              <Button
                icon="mode_edit"
                color={ButtonColor.primary}
                funcType={FuncType.flat}
                onClick={() => setDataObject('dataObjectDetailType', 'edit')}
                style={{ whiteSpace: 'nowrap' }}
              >
                编辑
              </Button>
            )}
        </div>
      )}
      <Tabs
        className={styles['tabs-style']}
        activeKey={tabActiveKey}
        onChange={(key) => setTabActiveKey(key)}
      >
        <TabPane tab={dataObjectDetailType === 'see' ? '主要信息' : '数据对象'} key="1">
          {dataObjectDetailType === 'see' && <SeeSource {...seeSourceProps} />}
          {dataObjectDetailType !== 'see' && <EditSource {...editSourceProps} />}
        </TabPane>
        {dataObjectDetailType === 'see' && publishStatus === EModeStatus.PUBLISHED && (
          <TabPane tab="API" key="2">
            <APIPane {...APIPaneProps} />
          </TabPane>
        )}
        {dataObjectDetailType === 'see' &&
          level === 'tenant' &&
          dataObjectOwnerType !== 'PLATFORM_SHARED' && (
            <TabPane tab="对象字段映射定义" key="3">
              <FieldMapping tabActiveKey={tabActiveKey} dataObjectDetail={dataObjectDetail} />
            </TabPane>
          )}
      </Tabs>
    </Content>
  );
});
