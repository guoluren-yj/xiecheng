import React, {
  useMemo,
  useRef,
  useContext,
  useState,
  useEffect,
  useImperativeHandle,
} from 'react';
import { isEmpty } from 'lodash';
import { Spin, TextField, DataSet } from 'choerodon-ui/pro';
import { Menu } from 'choerodon-ui';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';

import ImgIcon from '@/utils/ImgIcon';
import { HZERO_IAM } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import SmallPagination from '@/routes/Modeler/component/SmallPagination';

import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';

import styles from '../../index.less';
import AuthorizationMenuTitle from './AuthorizationMenuTitle';

const { Item } = Menu;

const pageParams = {
  page: 1,
  pageSize: 10,
  total: 0,
};
export default observer(function index() {
  const {
    ref: { apiMenuRef },
    setDataStore,
    storeData: { showNoServiceEmpty },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [tenantDataList, setTenantDataList] = useState<any[]>([]);
  const [menuListLoading, setMenuListLoading] = useState<boolean>(false);
  const [pageObj, setPageObj] = useState<any>(pageParams);
  const searchValueRef: any = useRef('');

  useImperativeHandle(apiMenuRef, () => ({
    leftMenuDsQuery: () => leftMenuDsQuery({}),
  }));

  const leftMenuDs = useMemo(
    () =>
      new DataSet({
        autoQuery: false,
        paging: false,
        // pageSize: 20,
        transport: {
          read: {
            url: `${lowcodeOrganizationURL({ route: HZERO_IAM })}/tenants`,
            method: 'get',
          },
        },
      }),
    []
  );

  // 左侧列表重置
  const leftMenuDsQuery = async ({ param, page = 1, size = 20 }: any) => {
    let data: any = {};
    const params = {
      tenantName: param,
    };
    setMenuListLoading(true);
    leftMenuDs.setQueryParameter('tenantName', params.tenantName);
    leftMenuDs.setQueryParameter('page', page - 1);
    leftMenuDs.setQueryParameter('size', size);
    data = await leftMenuDs.query();
    setMenuListLoading(false);
    if (data && (data as any).failed) {
      notification.error({
        message: '错误',
        description: (data as any).message,
      });
      return false;
    }
    if (!param && isEmpty(data)) {
      setDataStore('showNoServiceEmpty', true);
    } else if (showNoServiceEmpty) {
      // 如果是false 就不用重新设置了
      setDataStore('showNoServiceEmpty', false);
    }
    setTenantDataList(data.content);
    setPageObj({
      page: data.number + 1,
      pageSize: data.size,
      total: data.totalElements,
    });
    if (data && data.content && Array.isArray(data.content)) {
      setDataStore('tenantMenuList', data.content);
      return true;
    }
    return false;
  };

  // 初始化
  const init = async () => {
    leftMenuDsQuery({});
  };

  useEffect(() => {
    init();
  }, []);

  /**
   * 根据名称查询过滤
   * @param {*} valse
   */
  const findMenuItemByName = async (valse: string) => {
    runInAction(() => {
      setDataStore('tenantName', valse);
    });
    leftMenuDsQuery({ param: valse });
  };

  /**
   * 选中菜单回调
   * @param {*} param0
   */
  const handleSelectNode = ({ item }: any): void => {
    const { tenantName, tenantNum, tenantId } = item.props;
    runInAction(() => {
      setDataStore('tenantNum', tenantNum);
      setDataStore('tenantName', tenantName);
      setDataStore('tenantId', tenantId);
    });
  };

  /**
   * 设置菜单选项Item样式
   * @param {Object} item
   * @param {Object} parentNode
   */
  const setItemStyle = (item: any) => {
    return (
      <div className={styles['menu-left-list-item']}>
        <div style={{ display: 'flex' }}>
          <AuthorizationMenuTitle item={item} />
        </div>
      </div>
    );
  };

  /**
   * 循环遍历菜单选项Item
   * @param {Array<Object>} data
   * @param {Object} parentNode 菜单根对象
   */
  const loop = (data: any[]) =>
    data.map((item) => (
      <Item
        key={item.tenantNum}
        tenantNum={item.tenantNum}
        tenantName={item.tenantName}
        tenantId={item.tenantId}
      >
        {setItemStyle(item)}
      </Item>
    ));

  /**
   * SubMenu 展开/关闭的回调
   * @param {string: []} param0
   */
  const onOpenChange = (newOpenKeys: string[]) => {
    setOpenKeys(newOpenKeys);
  };

  const searchDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'searchInput',
          },
        ],
        events: {
          update: ({ value }) => {
            findMenuItemByName(value?.trim?.());
          },
        },
      }),
    []
  );

  const handleChange = async (page, size) => {
    leftMenuDsQuery({ page, size });
  };

  return (
    <div className={`${styles['list-menu']} ${styles['authorization-list-menu']}`}>
      <div className={styles['top-wrapper']}>
        <div className={styles['c7n-pro-base-table-filter']}>
          <TextField
            name="searchInput"
            dataSet={searchDs}
            // style={{ width: '240px' }}
            placeholder="请输入租户名称"
            onInput={(e: any) => {
              searchValueRef.current = (e.target as any).value?.trim();
            }}
            onChange={(value) => findMenuItemByName(value?.trim())}
            onEnterDown={(e) => findMenuItemByName((e.target as any).value.trim())}
            suffix={
              // <Icon type="search" onClick={() => findMenuItemByName(searchValueRef.current)} />
              <ImgIcon
                onClick={() => findMenuItemByName(searchValueRef.current)}
                name="search@v4.0.svg"
                size={14}
              />
            }
          />
        </div>
      </div>
      <Spin spinning={menuListLoading} wrapperClassName={styles['menu-list-wrapper']}>
        {/* <div className={styles['menu-list-wrapper']}> */}
        <Menu
          mode="inline"
          openKeys={openKeys}
          onSelect={handleSelectNode}
          onOpenChange={onOpenChange}
        >
          {loop(tenantDataList)}
        </Menu>
        {/* </div> */}
      </Spin>
      <SmallPagination
        showSizeChanger
        showSizeChangerLabel={false}
        showTotal
        showPager={false}
        showQuickJumper={false}
        sizeChangerPosition={'left' as any}
        pageObj={pageObj}
        onChange={handleChange}
      />
    </div>
  );
});
