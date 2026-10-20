import React, { useContext, useImperativeHandle, useEffect, useRef } from 'react';
import { Content, Header } from 'components/Page';
import { observer } from 'mobx-react-lite';
import { Icon, Spin } from 'choerodon-ui/pro';
import { Radio, Tabs } from 'choerodon-ui';
import notification from 'utils/notification';
import { RadioChangeEvent } from 'choerodon-ui/lib/radio/interface.d';

import ImgIcon from '@/utils/ImgIcon';
import { ETableType } from '@/globalData/modelManager';
import ModelerLayout from '@/components/ModelerLayout';
import { queryModelListPage } from '@/services/modelListService';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import HeadTenantSelect from '@/routes/Modeler/component/HeadTenantSelect';

import EmptyPage from '@/routes/Modeler/component/EmptyPage'; // 空太页
import ModelDetail from './Manager/ModelDetail'; // 模型设计器表模型详情
import ApiDetail from './Manager/ApiDetail'; // 模型设计器api模型详情
import ModelLeftMenu from './Manager/Menu';
import MoveUnit, { useMoveUnitData } from '@/routes/Modeler/component/MoveUnit';
import isFailureResponse from '@/utils/isFailureResponse';
import '@/lowcodeGlobalStyles/hzero-styles.less';

import ModelAuthorization from './ModelAuthorization';
import styles from './index.less';

const { TabPane } = Tabs;
enum EModel {
  model = 'model',
  authorization = 'authorization',
}
export type IHandleMenuQueryListParams = (params?: any) => any;
export type IHandleSourceQueryListParams = (
  data?: string | null,
  type?: string | null
) => Promise<common.Page<model.LogicModel>>;
interface IUseMoveUnitData {
  [propName: string]: number;
}

// 查询左侧模型列表
enum EDataSourceType {
  API = 'API',
  TABLE = 'TABLE',
}

// 组件参数接口
const ListView = observer((props: any) => {
  const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;
  useEffect(() => {
    document.body.classList.add('style-hmde');
    return () => {
      document.body.classList.remove('style-hmde');
    };
  }, []);

  const pageCenterContentRef: any = useRef();
  const {
    setPageType, // 设置当前页面功能
    setRightEditData, // 设置右侧菜单内容
    setDataStore,
    setIsModelShow, // 设置侧边栏是否显示
    ref: { listViewRef, pageRef },
    pageFun: { type: pageType },
    menuLoading,
    getDataStore,
    clearDetailAll,
    storeData: {
      modelRadio,
      isLeftShow, // 左边是否展开
      modelDetail, // 左边栏数据
      modelDataObjParams, // 查询左边菜单栏
      leftWidthStyle, // 左边栏宽度
      modelTypeList,
      labelCodeList,
      resourceUponRoleHierarchy,
    },
    authorizationData: { sourceDetailType },
    setSourceData, // 设置模型授权租户数据
  }: IModelManagerStore = modelManagerStore; // useContext<IModelManagerStore>(_store as any).store;

  useImperativeHandle(listViewRef, () => ({
    handleMenuQueryList,
  }));

  useEffect(() => {
    setDataStore('pageCenterContentHeight', pageCenterContentRef.current?.offsetHeight, true);

    // !!! 测试 //
    (window as any).isTenantRoleLevel = isTenantRoleLevel;
    (window as any).getCurrentOrganizationId = getCurrentOrganizationId;
  }, [pageType]);

  const [leftListL, , leftListMoveUnitProps] = useMoveUnitData({
    leftMax: 500,
    leftMin: 200,
  } as IUseMoveUnitData);

  // 设置左右区域宽度
  useEffect(() => {
    setDataStore('leftWidthStyle', leftListL - 54);
  }, [leftListL]);

  // 点击模型有变动，显示右侧菜单(模型菜单)
  useEffect(() => {
    if (modelDetail.code) {
      if (pageType !== 'authorization') {
        setIsModelShow('right', 'true');
      } else {
        setIsModelShow('right', 'no');
      }
      // setRightEditData('model');
    }
  }, [modelDetail.code]);

  // 切换模型类型 清空字段属性面板
  useEffect(() => {
    setRightEditData('model');
    setDataStore('fieldAttribute', null);
  }, [modelRadio]);

  useEffect(() => {
    if (resourceUponRoleHierarchy === 'tenant') {
      setPageType('model');
    }
  }, [resourceUponRoleHierarchy]);

  useEffect(() => {
    if (isTenantRoleLevel()) {
      handelLevelChange({ name: 'level', value: 'tenant' });
      setDataStore('selectedTenantId', getCurrentOrganizationId());
    }
  }, []);

  const handleMenuQueryList = async (
    params: {
      name?: string;
      dataSourceType?: 'TABLE' | 'modelTable' | 'apiTable' | 'API';
      page?: number;
      size?: number;
      modelTypeList?: string[];
      labelCodeList?: string;
      publishStatusList?: string[];
    } = {}
  ): Promise<model.LogicModelTreeVO | Record<never, never>> => {
    let _dataSourceType: 'TABLE' | 'API' = 'TABLE';

    if (params.dataSourceType === 'TABLE' || params.dataSourceType === 'API') {
      _dataSourceType = params.dataSourceType;
    } else if (params.dataSourceType) {
      _dataSourceType =
        params.dataSourceType === ETableType.apiTable ? EDataSourceType.API : EDataSourceType.TABLE;
    } else {
      _dataSourceType = modelRadio === 'apiTable' ? 'API' : 'TABLE';
    }

    const _defaultParams: MenuQueryListParams = {
      name: modelDataObjParams || '',
      dataSourceType: 'TABLE',
      page: 0,
      size: 20,
      modelTypeList, // : pageType === 'authorization' ? ['PLATFORM_SHARED'] : modelTypeList,
      labelCodeList,
      publishStatusList:
        modelManagerStore.pageFun.type === 'authorization' ? ['PUBLISHED', 'MODIFIED'] : [],
    };

    setDataStore('menuLoading', true, true);

    const queryParams = Object.assign({}, _defaultParams, params, {
      dataSourceType: _dataSourceType,
    });

    const res: model.LogicModelTreeVO = await queryModelListPage({
      query: queryParams,
    });

    setDataStore('menuLoading', false, true);

    if (isFailureResponse(res)) {
      // 捕获错误
      notification.error({
        message: '警告',
        description: res.message,
      });
      return {};
    }

    let newData = {};
    newData = { ...res };

    setDataStore('modelDataObj', newData);

    return res;
  };

  // 右侧列表按钮点击事件
  const leftMenuProps = {
    handleMenuQueryList,
  };
  const ModelDetailProps = {
    handleMenuQueryList,
  };

  /**
   * 切换到模型
   * @param {Event} e 原生事件对象
   */
  const handleToPageModel = async () => {
    if (sourceDetailType !== 'see') {
      setSourceData('sourceDetailType', 'see');
      setSourceData('sourceDataObjParams', null); // 清空数据对象查询条件

      setDataStore('isRightShow', 'false'); // 显示右侧
    }
    clearDetailAll('modelDetail'); // 清除表详情信息
    clearDetailAll('apiDetail'); // 清除表详情信息
    setDataStore('modelTypeList', []);
    setDataStore('labelCodeList', '');
    setPageType('model');
    handleMenuQueryList();
  };

  /**
   * 切换到模型授权租户
   * @param {Event} e 原生事件对象
   */
  const handlerToSource = async () => {
    if (sourceDetailType !== 'see') {
      setSourceData('sourceDetailType', 'see');
      setSourceData('sourceDataObjParams', null); // 清空模型授权租户查询条件

      setDataStore('isRightShow', 'false'); // 显示右侧
    }
    clearDetailAll('modelDetail'); // 清除表详情信息
    clearDetailAll('apiDetail'); // 清除表详情信息
    setPageType('authorization');
    setDataStore('modelTypeList', ['PLATFORM_SHARED']);
    setDataStore('labelCodeList', '');
    handleMenuQueryList({ dataSourceType: modelRadio, modelTypeList: ['PLATFORM_SHARED'] });
  };

  /**
   * 模型设计器|模型授权租户配置切换
   * @param {Object} e 原生事件对象
   */
  type IHandleTabChangeParams = (val: string) => void;
  const handleTabChange: IHandleTabChangeParams = (val) => {
    if (val === 'model') {
      handleToPageModel();
    } else if (val === 'authorization') {
      handlerToSource();
    }
  };

  /**
   * API模型|表模型切换
   * @param {Object} e 原生事件对象
   */
  type IApiAndTableModelChangeParams = (e: RadioChangeEvent) => void;
  const apiAndTableModelChange: IApiAndTableModelChangeParams = async (e) => {
    setDataStore('modelRadio', e?.target?.value);
    clearDetailAll('modelDetail'); // 清除表详情信息
    setDataStore('modelSelectedKeys', null);
    const currentModelTypeList = pageType === EModel.authorization ? ['PLATFORM_SHARED'] : [];
    setDataStore('modelTypeList', currentModelTypeList);
    setDataStore('labelCodeList', '');
    handleMenuQueryList({
      dataSourceType: e?.target?.value,
      modelTypeList: modelManagerStore.storeData.modelTypeList,
    });
    // 清除搜索框内容
    setSourceData('modelDataObjParams', null);
  };

  type IHandelLevelChange = (props: any) => void;
  const handelLevelChange: IHandelLevelChange = ({ name, value }) => {
    if (name === 'level') {
      setDataStore(
        'modelListPagingResetSignal',
        !modelManagerStore.storeData.modelListPagingResetSignal
      ); // 切换角色层级时闪烁重置分页页码信号
      setDataStore('resourceUponRoleHierarchy', value);
      setDataStore('selectedTenantId', undefined);
    } else {
      setDataStore('selectedTenantId', value?.tenantId);
    }
    clearDetailAll('modelDetail'); // 清除表详情信息
    clearDetailAll('apiDetail'); // 清除表详情信息
    setDataStore('labelCodeList', '');
  };

  const platformRoleWithoutTenantSelection =
    !isTenantRoleLevel() &&
    modelManagerStore.storeData.resourceUponRoleHierarchy === 'tenant' &&
    !modelManagerStore.storeData.selectedTenantId;

  // 渲染左边菜单列表页面
  const renderLeftMenu = () => {
    return (
      <section
        className={styles['left-list']}
        style={{ width: `${leftWidthStyle + 20}px` }}
        hidden={isLeftShow === 'no'}
      >
        <div
          className="collapse-handle"
          style={{ display: (isLeftShow as any) === 'false' ? 'none' : 'flex' }}
          onClick={() => setIsModelShow('left', 'false')}
        >
          <ImgIcon name="fold.svg" size={8} />
        </div>
        {isLeftShow === 'true' && (
          <Spin spinning={menuLoading}>
            <div className={styles['page-type-top']}>
              {
                <Radio.Group
                  className={styles['radio-group-style']}
                  value={modelRadio}
                  onChange={apiAndTableModelChange}
                >
                  <Radio.Button value={ETableType.modelTable}>
                    {modelRadio === ETableType.modelTable ? (
                      <ImgIcon name="Table model-Highlight@v4.0.svg" size={14} />
                    ) : (
                      <ImgIcon name="Table model@v4.0.svg" size={14} />
                    )}
                    表模型
                  </Radio.Button>
                  <Radio.Button value={ETableType.apiTable}>
                    {modelRadio === ETableType.apiTable ? (
                      <ImgIcon name="API structure-Highlight@v4.0.svg" size={14} />
                    ) : (
                      <ImgIcon name="API structure@v4.0.svg" size={14} />
                    )}
                    API模型
                  </Radio.Button>
                </Radio.Group>
              }
            </div>
            <ModelLeftMenu {...leftMenuProps} />
            <MoveUnit
              {...leftListMoveUnitProps}
              pageRef={pageRef}
              style={{
                right: 0,
              }}
            />
          </Spin>
        )}
        {isLeftShow === 'false' && (
          <div
            onClick={() => setIsModelShow('left', 'true')}
            className={styles['left-show-button']}
          >
            <Icon type="format_indent_increase" />
            <h4>应用模型</h4>
          </div>
        )}
      </section>
    );
  };

  // 渲染中间详情内容部分
  const renderMiddleContent = () => {
    return (
      <section
        className={styles['center-content']}
        style={{
          marginLeft: leftWidthStyle + 6,
        }}
      >
        <div style={{ height: '100%' }} ref={pageCenterContentRef}>
          {pageType === 'model' && (
            <React.Fragment>
              {modelRadio === ETableType.apiTable &&
                (modelDetail.code ? (
                  <ApiDetail {...ModelDetailProps} />
                ) : (
                  <EmptyPage
                    help="检测到您未选择任何模型"
                    message="请在左侧菜单中选择您要查看的模型"
                  />
                ))}
              {modelRadio === ETableType.modelTable &&
                (modelDetail.code ? (
                  <ModelDetail {...ModelDetailProps} />
                ) : (
                  <EmptyPage
                    help="检测到您未选择任何模型"
                    message="请在左侧菜单中选择您要查看的模型"
                  />
                ))}
            </React.Fragment>
          )}
          {pageType === 'authorization' && (
            <React.Fragment>
              {modelDetail.code ? (
                <ModelAuthorization />
              ) : (
                <EmptyPage
                  help="检测到您未选择任何模型"
                  message="请在左侧菜单中选择您要查看的模型"
                />
              )}
            </React.Fragment>
          )}
        </div>
      </section>
    );
  };

  return (
    <ModelerLayout
      disableLowcodePageContainer
      {...props}
      style={{ padding: 0 }}
      className={`hlod-routes-modeler ${styles['model-manager']} hmde hmde-modeler-page`}
    >
      <Header>
        {!isTenantRoleLevel() && <HeadTenantSelect onChange={handelLevelChange} />}
        <div className={`tabs ${styles['head-tab-style']}`}>
          <Tabs activeKey={pageType} defaultActiveKey="model" onChange={handleTabChange}>
            <TabPane tab="模型管理" key={EModel.model} />
            {!isTenantRoleLevel() && (
              <TabPane
                disabled={modelManagerStore.storeData.resourceUponRoleHierarchy === 'tenant'}
                tab="模型授权租户"
                key={EModel.authorization}
              />
            )}
          </Tabs>
        </div>
      </Header>
      <Content>
        {!isTenantRoleLevel() &&
          resourceUponRoleHierarchy === 'tenant' &&
          !getDataStore('selectedTenantId') && (
            <EmptyPage
              help="检测到当前为租户层且未选择任何租户"
              message="请确认是否选择租户或有正确权限"
            />
          )}
        <article
          ref={pageRef}
          style={{ display: platformRoleWithoutTenantSelection ? 'none' : 'block' }}
        >
          {renderLeftMenu()}
          {renderMiddleContent()}
        </article>
      </Content>
    </ModelerLayout>
  );
});

interface MenuQueryListParams {
  name: string;
  dataSourceType: 'TABLE' | 'API' | 'modelTable' | 'apiTable';
  page: number;
  size: number;
  modelTypeList: string[];
  labelCodeList: string;
  publishStatusList: string[];
}

export interface IHandleMenuQueryList {
  handleMenuQueryList(
    params?: Partial<MenuQueryListParams>
  ): Promise<model.LogicModelTreeVO | Record<never, never>>;
}

export default ListView;
