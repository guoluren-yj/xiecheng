import React, { useContext, useEffect, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import { Spin } from 'choerodon-ui/pro';
import { Icon, Tabs, Radio, Tooltip } from 'choerodon-ui';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { RadioChangeEvent } from 'choerodon-ui/lib/radio';

import Modal from '@/components/LowcodeModal';
import ModelerLayout from '@/components/ModelerLayout';
import ImgIcon from '@/utils/ImgIcon';
import SourceEmptyPage from '@/routes/Modeler/component/EmptyPage';
import HeadTenantSelect from '@/routes/Modeler/component/HeadTenantSelect';
import MoveUnit, { useMoveUnitData } from '@/routes/Modeler/component/MoveUnit';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import { querySourceLeftTreeService } from '@/services/modelDataSourceService';
import { ESource, EModeStatus } from '@/globalData/modelManager';

import LeftMenu from './Menu';
import SourceDetail from './Detail';
import SourceAuthorization from './Detail/SourceAuthorization';

import styles from './index.less';

const { confirm } = Modal;
const { TabPane } = Tabs;

export default observer((props: any) => {
  const {
    pageFun: { type: pageType },
    setPageType,
    dataObject: {
      leftWidthStyle,
      isLeftShow,
      menuLoading,
      dataObj,
      dataObjectDetail,
      dataObjectDetailType,
      dataRadio,
      dataObjParams,
      level,
      // dataSelectedKey,
    },
    platformHidden,
    ref: { pageRef, listViewRef },
    setDataObject,
    setDataObjectDetailAll,
    setIsLeftShow, // 设置侧边栏是否显示
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;

  useImperativeHandle(listViewRef, () => ({
    handleSourceMenuQuery,
  }));

  const initSourceMenuQuery = {
    page: 0,
    size: 20,
    dataObjectOwnerTypeList:
      pageType === ESource.source ? '' : dataObjParams.dataObjectOwnerTypeList,
    sourceName: '',
    labelCodeList: '',
  };

  // 查询左侧数据对象列表
  const handleSourceMenuQuery: (
    type?: string | null
  ) => Promise<model.data.DataSourceTreeVO> = async (type) => {
    const dataObjectCategory = (type || dataRadio) === 'apiSource' ? 'API' : 'TABLE';
    if (type) {
      setDataObject('dataObjParams', {
        ...initSourceMenuQuery,
        dataObjectCategory,
      });
      return;
    }
    setDataObject('menuLoading', true);
    const params = {
      ...dataObjParams,
      dataObjectCategory,
      publishStatusList:
        pageType === ESource.source ? '' : [EModeStatus.PUBLISHED, EModeStatus.MODIFIED],
      includePlatformSameCode: true,
    };
    const res: model.data.DataSourceTreeVO = await querySourceLeftTreeService({
      query: params,
    });
    setDataObject('menuLoading', false);
    if (res && (res as any).failed) {
      // 捕获错误
      notification.error({
        message: '警告',
        description: (res as any).message,
      });
      return {} as any;
    }
    setDataObject('dataObj', res);
    return res;
  };

  /**
   * API数据对象|模型数据对象切换
   * @param {Object} e 原生事件对象
   */
  type TApiAndTableSourceChange = (e: RadioChangeEvent) => void;
  const apiAndTableSourceChange: TApiAndTableSourceChange = async (e) => {
    if (dataObjectDetailType !== 'see') {
      const submitOk =
        (await confirm(
          '当前有未保存的信息，切换tab会导致未保存的内容被丢弃，建议保存后切换。请确认是否切换？',
          'small'
        )) === 'ok';
      if (!submitOk) return;
    }
    // 清除右侧的数据详情
    // setDataObjectDetailAll({} as any);
    setDataObject('dataRadio', e.target.value);
    await handleSourceMenuQuery(e.target.value);
  };
  // useEffect(() => {
  //   if (
  //     dataObj?.content?.find(
  //       ({ dataObjectId }) => dataObjectId === dataSelectedKey[dataRadio].dataObjectId
  //     )
  //   ) {
  //     // 找回原tab展示的数据详情
  //     setDataObjectDetailAll(dataSelectedKey[dataRadio]);
  //   } else {
  //     // 清除右侧的数据详情
  //     setDataObjectDetailAll({} as any);
  //   }
  //   setDataObject('dataObjectDetailType', 'see'); // 中间变为只读
  // }, [dataObj]);

  // 数据对象左侧菜单
  // eslint-disable-next-line no-unused-vars
  const sourceLeftMenuProps = {
    handleSourceMenuQuery,
  };
  const SourceDetailProps = {
    handleSourceMenuQuery,
  };
  interface IUseMoveUnitData {
    [propName: string]: number;
  }
  const [leftListL, , leftListMoveUnitProps] = useMoveUnitData({
    leftMax: 500,
    leftMin: 200,
  } as IUseMoveUnitData);
  // 设置左右区域宽度
  useEffect(() => {
    setDataObject('leftWidthStyle', leftListL - 54);
  }, [leftListL]);

  type IHandelLevelChange = (props: any) => void;
  const handelLevelChange: IHandelLevelChange = ({ name, value, record }) => {
    if (name === 'level') {
      setDataObject('level', value);
      setDataObject('tenantId', undefined);
      record.set('tenant', undefined);
      setPageType(ESource.source);
      // 切换平台级-租户级时清空左侧菜单选中数据
      setDataObjectDetailAll({} as any);
      setDataObject('dataSelectedKey', {
        modelSource: {},
        apiSource: {},
      });
    } else {
      setDataObject('tenantId', value?.tenantId);
    }
    setDataObject('dataObjParams', {
      ...dataObjParams,
      labelCodeList: undefined,
    });
    setDataObject('dataSelectedKey', {
      modelSource: {},
      apiSource: {},
    });
    setDataObjectDetailAll({} as any); // 肃清中间
    setDataObject('dataObjectDetailType', 'see'); // 中间变为只读
  };

  // 切换数据对象/授权tab给菜单设置dataObjectOwnerTypeList参数
  const handlePageTypeChange = async (val: string) => {
    function change() {
      setPageType(val);
      setDataObjectDetailAll({} as any);
      setDataObject('dataObjectDetailType', 'see');
      if (val === 'source') {
        setDataObject('dataObjParams', {
          ...dataObjParams,
          dataObjectName: undefined,
          dataObjectOwnerTypeList: undefined,
        });
      } else {
        setDataObject('dataObjParams', {
          ...dataObjParams,
          dataObjectName: undefined,
          dataObjectOwnerTypeList: 'PLATFORM_SHARED',
        });
      }
      setDataObject('dataSelectedKey', {
        modelSource: {},
        apiSource: {},
      });
    }
    if (dataObjectDetailType !== 'see') {
      await confirm({
        children: '当前数据对象操作未保存，确定继续操作吗？',
        lowcodeSize: 'small',
        onOk: change,
      });
    } else {
      change();
    }
  };

  const sourceAuthorizationProps = {};

  return (
    <ModelerLayout {...props} className={`lowcode-m-modal ${styles['data-source']} hmde`}>
      <Header>
        <div
          className={`tabs ${styles['head-tab-style']}`}
          style={{ width: '100%', textAlign: 'center' }}
        >
          <HeadTenantSelect onChange={handelLevelChange} />
          <Tabs
            activeKey={pageType}
            defaultActiveKey={ESource.source}
            onChange={handlePageTypeChange}
          >
            <TabPane tab="数据对象管理" key={ESource.source} />
            {!isTenantRoleLevel() && (
              <TabPane
                tab="数据对象授权租户"
                disabled={platformHidden || level !== 'platform'}
                key={ESource.sourceAuthorization}
              />
            )}
          </Tabs>
        </div>
      </Header>
      <Content style={{ padding: 0, margin: 0, height: '100%' }}>
        {!platformHidden && level !== 'platform' ? (
          <SourceEmptyPage
            help="检测到当前为租户层且未选择任何租户"
            message="请确认是否选择租户或有正确权限"
          />
        ) : (
          <article ref={pageRef} style={{ height: '100%' }}>
            <section className={styles['left-list']} style={{ width: leftWidthStyle }}>
              {isLeftShow && (
                <Spin spinning={menuLoading} style={{ paddingTop: 10, paddingLeft: 16 }}>
                  <div className={styles['page-type-top']}>
                    <Radio.Group
                      className={styles['radio-group-style']}
                      value={dataRadio}
                      onChange={apiAndTableSourceChange}
                    >
                      <Radio.Button value="modelSource">
                        <ImgIcon
                          size={16}
                          name={
                            dataRadio === 'modelSource'
                              ? 'Table model-Highlight@v4.0.svg'
                              : 'Table model@v4.0.svg'
                          }
                          style={{ marginRight: 5 }}
                        />
                        表对象
                      </Radio.Button>
                      <Radio.Button value="apiSource">
                        <ImgIcon
                          size={16}
                          name={
                            dataRadio === 'apiSource'
                              ? 'API structure-Highlight@v4.0.svg'
                              : 'API structure@v4.0.svg'
                          }
                          style={{ marginRight: 5 }}
                        />
                        API对象
                      </Radio.Button>
                    </Radio.Group>
                    <div className={styles.refresh}>
                      {menuLoading ? (
                        <Spin size={Size.small} />
                      ) : (
                        <Tooltip placement="top" title="刷新">
                          <ImgIcon
                            name="refresh.svg"
                            size={16}
                            onClick={() => handleSourceMenuQuery()}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <LeftMenu {...sourceLeftMenuProps} />
                  <MoveUnit
                    {...leftListMoveUnitProps}
                    pageRef={pageRef}
                    style={{
                      right: 0,
                    }}
                  />
                </Spin>
              )}
              {!isLeftShow && (
                <div onClick={() => setIsLeftShow(true)} className={styles['left-show-button']}>
                  <Icon type="format_indent_increase" />
                  <h4>{pageType === 'source' ? '数据对象管理' : '应用数据对象授权'}</h4>
                </div>
              )}
            </section>
            <section
              className={styles['center-content']}
              style={{
                height: '100%',
                marginLeft: leftWidthStyle,
              }}
            >
              {pageType === ESource.source &&
                (dataObjectDetail.dataObjectCode ? (
                  <SourceDetail {...SourceDetailProps} />
                ) : (
                  <SourceEmptyPage
                    help={
                      dataObj?.totalElements || dataRadio === 'modelSource'
                        ? '检测到您未选择任何数据对象'
                        : 'API对象需要API模型发布后生成'
                    }
                    message={
                      dataObj?.totalElements || dataRadio === 'modelSource'
                        ? '请在左侧菜单中选择您要查看的数据对象'
                        : '请前往发布API逻辑模型'
                    }
                  />
                ))}
              {pageType === ESource.sourceAuthorization &&
                (dataObjectDetail.dataObjectCode ? (
                  <SourceAuthorization {...sourceAuthorizationProps} /> // 数据对象授权
                ) : (
                  <SourceEmptyPage
                    help={
                      dataObj?.totalElements || dataRadio === 'modelSource'
                        ? '检测到您未选择任何数据对象'
                        : 'API对象需要API模型发布后生成'
                    }
                    message={
                      dataObj?.totalElements || dataRadio === 'modelSource'
                        ? '请在左侧菜单中选择您要查看的数据对象'
                        : '请前往发布API逻辑模型'
                    }
                  />
                ))}
            </section>
          </article>
        )}
      </Content>
    </ModelerLayout>
  );
});
