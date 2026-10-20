import React, { useContext, useEffect, useRef } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Content, Header } from 'components/Page';
import { isTenantRoleLevel } from 'utils/utils';

import ImgIcon from '@/utils/ImgIcon';
import ModelerLayout from '@/components/ModelerLayout';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';
import EmptyPage from '@/routes/Modeler/component/EmptyPage';
// import DraggleLayout from '@/routes/Modeler/component/DraggleLayout';
import HeadTenantSelect from '@/routes/Modeler/component/HeadTenantSelect';

import BasicDataMenu from './BasicDataMenu';
import AuthorizationMenu from './Authorization/AuthorizationMenu';
import AuthorizationDetail from './Authorization/AuthorizationDetail';
import BaseTableDetail from './BaseTableDetail';
import ApiTableDetail from './ApiTableDetail';
import styles from './index.less';

const { TabPane } = Tabs;
export default observer((props: any) => {
  const isTenantRole: boolean = isTenantRoleLevel();
  const {
    // hasApiTable,
    ref: { basicDataMenuRef },
    tabVal,
    setDataStore,
    getDataStore,
    resetApiDetail,
    resetTableDetail,
    resetAuthorization,
    storeData: { isLeftShowMenu, tableName, showNoServiceEmpty, pageType, level, apiCode },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;

  const contentRef: any = useRef();
  // const leftDomRef: any = useRef();
  // const rightDomRef: any = useRef();
  // const [init, setInit] = useState(false);

  // 不同角色进来初始化store中的默认值
  useEffect(() => {
    setDataStore('viewType', isTenantRole ? 'labelView' : 'serviceView');
    setDataStore('level', isTenantRole ? 'tenant' : 'platform');
    // setInit(true);
  }, []);

  enum ETabKey {
    infrastructureManagement = 'infrastructureManagement', // 基础结构管理
    infrastructureAuthorization = 'infrastructureAuthorization', // 基础结构授权
  }

  type IHandelLevelChange = (props: any) => void;
  const handelLevelChange: IHandelLevelChange = ({ name, value }) => {
    if (name === 'level') {
      const flag = value === 'platform';
      setDataStore('level', value);
      setDataStore('viewType', flag ? 'serviceView' : 'labelView'); // 平台层默认服务视图
      setDataStore('_tenantId', null); // 清空租户ID
      resetApiDetail(); // 清api表结构缓存
      resetTableDetail(); // 清接基础表结构缓存
      if (!flag) {
        setDataStore('tabVal', ETabKey.infrastructureManagement, true);
      }
    } else {
      resetApiDetail();
      resetTableDetail();
      // eslint-disable-next-line no-unused-expressions
      basicDataMenuRef.current?.handleInputClean();
      setDataStore('_tenantId', value?.tenantId);
    }
  };

  const handleChangeTabVal = (activeKey) => {
    setDataStore('tabVal', activeKey, true);
    resetApiDetail();
    resetTableDetail();
    resetAuthorization();
  };

  return (
    <ModelerLayout {...props} className={`${styles['base-table-list']}`}>
      <Header>
        {!isTenantRole && <HeadTenantSelect onChange={handelLevelChange} />}
        <div className={`tabs ${styles['basic-head-tabs']}`}>
          <Tabs
            activeKey={tabVal}
            defaultActiveKey={ETabKey.infrastructureManagement}
            onChange={handleChangeTabVal}
          >
            {/* 非租户角色(平台角色)才显示授权tab 平台角色租户层禁用 */}
            <TabPane tab="物理模型管理" key={ETabKey.infrastructureManagement} />
            {!isTenantRole && (
              <TabPane
                disabled={level === 'tenant'}
                tab="物理模型授权"
                key={ETabKey.infrastructureAuthorization}
              />
            )}
          </Tabs>
        </div>
      </Header>
      <Content>
        {!isTenantRole && level === 'tenant' && !getDataStore('_tenantId') ? (
          <EmptyPage
            help="检测到当前为租户层且未选择任何租户"
            message="请确认是否选择租户或有正确权限"
          />
        ) : (
          <div ref={contentRef} className={styles['c7n-pro-base-table']}>
            {/* 收起图标 */}
            {!isLeftShowMenu && tabVal === ETabKey.infrastructureManagement && (
              <div
                onClick={() => setDataStore('isLeftShowMenu', true)}
                className={styles['left-show-button']}
              >
                <Icon type="format_indent_increase" />
                {tabVal === ETabKey.infrastructureManagement ? (
                  <h4>基础表信息</h4>
                ) : (
                  <h4>
                    <ImgIcon name="API@v4.0.svg" size={18} />
                    信息
                  </h4>
                )}
              </div>
            )}
            {/* 左侧菜单 */}
            <div className={isLeftShowMenu && styles['left-menu-wrapper']}>
              {tabVal === ETabKey.infrastructureManagement ? (
                <BasicDataMenu />
              ) : (
                <AuthorizationMenu />
              )}
            </div>
            {/* {init && <DraggleLayout {...draggleLayoutProps} />} */}
            {/* 中间部分 */}
            <div className={styles['c7n-pro-base-table-content']}>
              {!showNoServiceEmpty &&
                tabVal === ETabKey.infrastructureManagement &&
                pageType === 'baseTable' &&
                (!tableName ? (
                  <EmptyPage
                    help="检测到您未选择任何基础表"
                    message="请在左侧树状图中选择您要查看的基础表"
                  />
                ) : (
                  <BaseTableDetail {...props} />
                ))}
              {!showNoServiceEmpty &&
                tabVal === ETabKey.infrastructureManagement &&
                pageType === 'api' &&
                (!apiCode ? (
                  <EmptyPage
                    help="检测到您未选择任何api"
                    message="请在左侧树状图中选择您要查看的api"
                  />
                ) : (
                  <ApiTableDetail {...props} />
                ))}
              {tabVal === ETabKey.infrastructureAuthorization && <AuthorizationDetail {...props} />}
              {showNoServiceEmpty && (
                <EmptyPage
                  help="检测到当前物理模型暂无任务服务"
                  message="请确认业务服务是否开启SDK依赖且当前应用是否已分配至少一个应用可见服务"
                />
              )}
            </div>
          </div>
        )}
      </Content>
    </ModelerLayout>
  );
});
