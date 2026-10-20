import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useImperativeHandle,
} from 'react';
import { isEmpty } from 'lodash';
import { Icon, Tooltip, Tree } from 'choerodon-ui';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { isTenantRoleLevel } from 'utils/utils';
import { Spin, DataSet } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

import ImgIcon from '@/utils/ImgIcon';
import Modal from '@/components/LowcodeModal';
import { HZERO_HMDE } from '@/utils/config';
import Lov from '@/components/LowcodeLov';
import { getApiMenuList, deleteApiItem, saveApiInfo } from '@/services/modelBaseService';
import MethodIcon from '@/routes/Modeler/component/MethodIcon';
import { lowcodeOrganizationURL } from '@/utils/common';
import { TargetType } from '@/globalData/common';

// import UpdateApi from './UpdateApi';
import ApiListMenuTitle from './ApiListMenuTitle';
import ServiceNameTitle from './ServiceNameTitle';
import LabelViewMenu from './LabelViewMenu';
import styles from '../../index.less';
import Store, { IBaseTableList } from '../../stores';

// const { Option } = Select;
// const { SubMenu, Item } = Menu;
const { TreeNode } = Tree;
interface IPageObj {
  page: number;
  pageSize: number;
  total: number;
}

interface IIndex {
  val?: string;
}

const pageParams = {
  page: 1,
  pageSize: 10,
  total: 0,
};
export default observer(function index({ val = '' }: IIndex) {
  const {
    ref: { apiMenuRef },
    // apiMenuData,
    setDataStore,
    resetApiDetail,
    storeData: { showNoServiceEmpty, viewType, labelCodeList, _tenantId },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const keyList: any = useRef([]);
  const selectValueRef: any = useRef([]);
  const inputValRef: any = useRef('');
  // const [inputValue, setInputValue] = useState<string>('');
  // const [selectedVal, setSelectedVal] = useState<string>();
  const [apiDataList, setApiDataList] = useState<any[]>([]);
  const [menuListLoading, setMenuListLoading] = useState<boolean>(false);
  const [thisSelectedKeys, setThisSelectedKeys] = useState<string[]>(['']);
  const [pageObj, setPageObj] = useState<IPageObj>(pageParams);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'api',
            type: FieldType.object,
            required: false,
            lovCode: isTenantRoleLevel() ? 'HMDE.EXTERNAL_API' : 'HMDE.EXTERNAL_API.SITE',
            dynamicProps: {
              lovPara: ({ dataSet }) => ({ serviceCode: dataSet.queryParameter.serviceCode }),
            },
            lovQueryAxiosConfig: () => {
              return {
                url: `${lowcodeOrganizationURL({
                  route: HZERO_HMDE,
                })}/apis/external-api/page`,
                method: 'GET',
              };
            },
          },
        ],
        events: {
          update: async ({ value, dataSet }) => {
            // 保存数据 并触发菜单查询 详情查询
            const res = await saveApiInfo(value);
            if (res && res.failed) {
              notification.error({ message: '错误', description: res.message });
              dataSet.set('api', '');
              return false;
            }
            await leftMenuDsQuery();
            setThisSelectedKeys([res.apiCode]);
            setDataStore('editApiFlag', 1); // 默认创建完成有编辑权限
            dataSet.reset();
            setDataStore('apiCode', res.apiCode);
            setDataStore('apiId', res.apiId);
          },
        },
      }),
    [viewType, val]
  );

  useImperativeHandle(apiMenuRef, () => ({
    leftMenuDsQuery: (params: IParams | void) => leftMenuDsQuery({ apiPath: '', ...params }),
    expendsAndCloseAll,
    filterItem, // 根据请求方式过滤
    findMenuItemByName, // 搜索过滤
    selectedVal: selectValueRef.current,
    inputVal: inputValRef.current,
  }));

  // 左侧列表重置
  interface IParams {
    apiPath?: string;
    page?: number;
    size?: number;
    isResetPage?: boolean;
    labelCodeList?: any[];
  }
  const leftMenuDsQuery = async (param: IParams = {}) => {
    const {
      // apiPath = val,
      page = 1,
      size = 20,
      labelCodeList: labelList = labelCodeList,
      isResetPage = true, // 是否重置分页 处理分液器上一页下一页不需要重置 其他查询均需重置第一页
    } = param;
    const params = {
      apiMethod: selectValueRef.current,
      apiPath: inputValRef.current,
      labelCodeList: viewType === 'serviceView' ? '' : labelList,
    };
    const _page = isResetPage ? 1 : page;
    setMenuListLoading(true);
    // 标签视图打平的情况下才支持分页
    if (viewType === 'labelView') {
      Object.assign(params, {
        page: _page - 1,
        size,
      });
    }
    const data = await getApiMenuList(params, viewType);
    setPageObj({
      page: data?.number + 1,
      pageSize: data?.size,
      total: data?.totalElements,
    });
    setMenuListLoading(false);
    if (data && (data as any).failed) {
      notification.error({
        message: '错误',
        description: (data as any).message,
      });
      return false;
    }
    if (!param && isEmpty(data.content || data)) {
      setDataStore('showNoServiceEmpty', true);
    } else if (showNoServiceEmpty) {
      // 如果是false 就不用重新设置了
      setDataStore('showNoServiceEmpty', false);
    }
    const serviceCodeList = (data.content || data).map((item) => item.serviceCode);
    keyList.current = serviceCodeList;
    // setOpenKeys(keyList.current);
    setApiDataList(data.content || data);
    if (data && Array.isArray(data.content || data)) {
      setDataStore('apiMenuList', data.content || data);
      return true;
    }
    return false;
  };

  useEffect(() => {
    // 初始化查询
    leftMenuDsQuery(); // fixme
  }, [viewType, _tenantId]);

  /**
   * 根据名称查询过滤
   * @param {*} value
   */
  const findMenuItemByName = async (value: string) => {
    inputValRef.current = value;
    // runInAction(() => {
    //   setDataStore('apiParam', value);
    // });
    leftMenuDsQuery();
  };

  /**
   * 选中菜单回调
   * @param {*} param0
   */
  const handleSelectNode = (key, node?): void => {
    setThisSelectedKeys([...key]);
    // // fixme
    const [state, apiCode, apiId, _editApiFlag, _createApiFlag] = node.node.title.key.split('&');
    if (state === 'title') return;
    runInAction(() => {
      setDataStore('apiCode', apiCode);
      setDataStore('apiId', apiId);
      setDataStore('editApiFlag', +_editApiFlag);
      setDataStore('createApiFlag', +_createApiFlag);
    });
  };

  /**
   * 删除api定义
   * @param {*} item
   */
  const handleDelete = async (item: model.baseStructure.ApiInfo) => {
    Modal.warning({
      lowcodeSize: 'small',
      title: '警告',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      children: '删除后已基于该API创建的逻辑模型/数据对象数据等均会失效，您确定删除吗？',
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          {okBtn}
        </div>
      ),
      onOk: async () => {
        const res = await deleteApiItem(item);
        if (res && res.failed) {
          notification.error({
            message: '错误',
            description: res.message,
          });
          return false;
        }
        leftMenuDsQuery();
        runInAction(() => {
          resetApiDetail();
        });
      },
    });
  };

  /**
   * 设置菜单选项Item样式
   * @param {Object} item
   * @param {Object} parentNode
   */
  const setItemStyle = (item: model.baseStructure.ApiInfo) => {
    const method = item && item.apiMethod && item.apiMethod.toLowerCase();
    let icon = <></>;
    icon = (
      <div className={styles['menu-left-list-release']}>
        <MethodIcon method={method} />
      </div>
    );
    return (
      <div className={styles['menu-left-list-item']}>
        <div style={{ display: 'flex', width: '75%' }}>
          {icon}
          <ApiListMenuTitle item={item} />
          {item.editApiFlag ? (
            <Tooltip title="删除">
              <div
                className={styles['menu-left-list-delete-icon']}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(item);
                }}
              >
                <ImgIcon
                  name="delete-black.svg"
                  size={18}
                  style={{ marginTop: 2, visibility: 'visible', verticalAlign: 'sub' }}
                />
              </div>
            </Tooltip>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  };

  // /**
  //  * 循环遍历菜单选项Item
  //  * @param {Array<Object>} data
  //  * @param {Object} parentNode 菜单根对象
  //  */
  // const loop = (data: model.baseStructure.ApiInfo[]) =>
  //   data.map((item: model.baseStructure.ApiInfo) => (
  //     <Item
  //       key={item.apiCode}
  //       apiCode={item.apiCode}
  //       apiId={item.apiId}
  //       _editApiFlag={item.editApiFlag}
  //       _createApiFlag={item.createApiFlag}
  //     >
  //       {setItemStyle(item)}
  //     </Item>
  //   ));

  /**
   * 展开所有菜单或关闭所有菜单
   */
  const expendsAndCloseAll = (type: string) => {
    switch (type) {
      case 'closeAll':
        setExpandedKeys([]);
        // setOpenKeys([]);
        break;
      case 'openAll':
        setExpandedKeys(keyList.current);
        break;
      default:
        break;
    }
  };
  /**
   * 改变请求方式 过滤api选项
   * @param {String} val
   */
  const filterItem = (val2: string) => {
    selectValueRef.current = val2;
    leftMenuDsQuery().then((res) => {
      if (res) {
        expendsAndCloseAll('openAll');
      }
    });
  };

  /**
   * SubMenu 展开/关闭的回调
   * @param {string: []} param0
   */
  // const onOpenChange = (newOpenKeys: string[]) => {
  //   setOpenKeys(newOpenKeys);
  // };

  const labelViewMenuProps = {
    leftMenuDsQuery,
    handleSelectNode,
    handleDelete,
    dataSource: apiDataList.filter((item) => item.apiId),
    TargetType,
    pageObj,
  };
  if (viewType === 'serviceView' && apiDataList) {
    return (
      <Spin spinning={menuListLoading} wrapperClassName={styles['api-list-menu']}>
        <div className={styles['menu-list-wrapper']}>
          <span className={styles['sub-menu-wrapper']}>
            {apiDataList.map((item) => (
              <Tree
                expandedKeys={expandedKeys}
                selectedKeys={thisSelectedKeys}
                onSelect={handleSelectNode}
                onExpand={(v) => {
                  setExpandedKeys(v as any);
                }}
              >
                <TreeNode
                  className={styles['tree-node-1']}
                  key={item.serviceCode}
                  title={
                    <div
                      key={`title&${item.serviceCode}`}
                      style={{ position: 'relative', left: '-5px' }}
                    >
                      <ServiceNameTitle item={item} />
                      <span
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        {item?.createApiFlag ? (
                          <Lov dataSet={ds} name="api" mode="button" clearButton={false} noCache>
                            <Tooltip title="新建API">
                              <Icon
                                type="add"
                                onClick={async () => {
                                  ds.reset();
                                  await ds.setQueryParameter('serviceCode', item.serviceCode);
                                }}
                                style={{
                                  marginRight: '5px',
                                  color: 'rgb(90, 102, 119)',
                                  fontSize: '20px',
                                  cursor: 'pointer',
                                }}
                              />
                            </Tooltip>
                          </Lov>
                        ) : (
                          ''
                        )}
                      </span>
                    </div>
                  }
                >
                  {item.children &&
                    item.children.map((value) => (
                      <TreeNode
                        className={styles['tree-node-2']}
                        key={value.apiCode}
                        title={
                          <div
                            key={`node&${value.apiCode}&${value.apiId}&${value.editApiFlag}&${value.createApiFlag}`}
                          >
                            {setItemStyle(value)}
                          </div>
                        }
                      />
                    ))}
                </TreeNode>
              </Tree>
            ))}
          </span>
        </div>
      </Spin>
    );
  } else {
    return <LabelViewMenu {...labelViewMenuProps} />;
  }
});
