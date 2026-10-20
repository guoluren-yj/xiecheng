import React, { useEffect, useState, useMemo } from 'react';
import { connect } from 'dva';
import qs from 'qs';
import { compose, isEmpty } from 'lodash';
import uuid from 'uuid/v4';
import { Spin, Tabs } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { DragDropContext } from 'react-beautiful-dnd';

import notification from 'utils/notification';
import {
  // getCurrentRole,
  getCurrentOrganizationId,
  filterNullValueObject,
  getAccessToken,
} from 'utils/utils';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import ChooseRole from '@/components/ChooseRole';
import { ReactComponent as EmptyImg } from '@/assets/MallHomeConfig/mallConfigEmpty.svg';
import Template from './LeftConfig/Template';
import RightContent from './RightContent';
import styles from './index.less';
import GlobalSetting from './GlobalSetting';


const { TabPane } = Tabs;

function MallHomeConfig(props) {
  const {
    mallHomeConfig: { webUrl },
    mallHome,
    mallHome: { currentRole, purchase, mallType, enterprisePermission, memberPermission },
    dispatch,
    history,
    previewLoading = false,
    initListLoading = false,
    configLoading,
    applyCustomLoading,
    applyBannerLoading,
    saveCustomLoading,
    permissionLoading,
  } = props;

  const tenantId = getCurrentOrganizationId();
  const customBarList = mallHome[`${mallType}customBarList`];

  const [isSecond, setIsSecond] = useState(undefined);
  // 是否为租户管理员 租户管理员才能配置集团
  // const isAdmin = useMemo(() => getCurrentRole().code === 'administrator', []);

  useEffect(() => {
    fetchConfigDetail();
    getPermission();
  }, []);

  function getPermission() {
    dispatch({
      type: 'mallHome/fetchPermission',
    });
  }

  function fetchConfigDetail(params = {}) {
    dispatch({
      type: 'mallHomeConfig/fetchDetail',
      payload: {
        unitId: !isEmpty(params) ? params.unitId : purchase.unitId,
      },
    }).then((res) => {
      dispatch({
        type: 'mallHome/updateState',
        payload: {
          configDetail: res,
        },
      });
      if (!isEmpty(res)) {
        setIsSecond(true);
      } else {
        setIsSecond(false);
      }
    });
  }

  // 初始化自定义栏
  useEffect(() => {
    fetchList();
  }, []);

  function fetchList(params = {}) {
    dispatch({
      type: 'mallHome/initList',
      payload: filterNullValueObject({
        tenantId,
        unitId: (params.purchase || purchase).unitId,
        customLevel: (params.currentRole || currentRole) === 'tenant' ? '0' : null,
        // groupAttribute: mallType === 'sigl' ? 1 : 0,
        isPreview: 1,
        filterFlag: 1,
      }),
    }).then((res) => {
      if (res) {
        const list = res?.map((r) => {
          if ([1, 2, 3].includes(r.customType)) {
            return {
              ...r,
              productGroupId: r?.customTagLineList?.[0]?.productGroupId,
              productGroupName: r?.customTagLineList?.[0]?.productGroupName,
              moduleName: r?.customTagLineList?.[0]?.moduleName,
              moduleType: r?.customTagLineList?.[0]?.moduleType,
              imageUrl: r?.customTagLineList?.[0]?.imageUrl,
              jumpPage: r?.customTagLineList?.[0]?.jumpPage,
              imageUrlTwo: r?.customTagLineList?.[0]?.imageUrlTwo,
            };
          } else {
            return r;
          }
        });
        dispatch({
          type: 'mallHome/updateState',
          payload: {
            siglcustomBarList: list.filter((c) => c.groupAttribute === 1),
            customBarList: list.filter((c) => c.groupAttribute === 0), // 企业购
          },
        });
      }
    });
  }

  function checkUnit() {
    if (currentRole === 'purchase' && !purchase?.unitId) {
      notification.warning({
        message: intl.get('small.common.purchase.choose.warning').d('请先选择采买组织'),
      });
      return false;
    }
    return true;
  }

  // 保存
  function save(params = {}) {
    const { type } = params;
    if (!checkUnit()) return;
    // let newList = [];
    let newList1 = []; // 企业购
    if (currentRole === 'tenant') {
      // 配置集团级 处理排序
      newList1 = mallHome.customBarList.map((c, i) => ({ ...c, orderSeq: i }));
    } else {
      newList1 = [
        ...mallHome.customBarList?.filter((c) => c.customLevel === '0'), // 集团级在上面
        ...mallHome.customBarList
          ?.filter((c) => c.customLevel === '1')
          ?.map((c, i) => ({ ...c, orderSeq: i })),
      ];
    }
    // newList = [...newList1];
    let newList2 = []; // 会员购
    if (currentRole === 'tenant') {
      // 配置集团级 处理排序
      newList2 = mallHome.siglcustomBarList.map((c, i) => ({ ...c, orderSeq: i }));
      // newList = [...newList, ...newList2];
    }

    dispatch({
      type: 'mallHome/saveAndPreview',
      payload: (mallType === 'sigl' ? newList2 : newList1)
        .filter((p) => p.customName)
        .map((p) => ({
          ...p,
          pageConfigAuthList: p.pageConfigAuthList?.filter((c) => c.unitId !== 'ALL'),
        })),
    }).then(() => {
      if (!type) {
        fetchList();
      } else if (type === 'apply') {
        apply();
      } else if (type === 'preview') {
        // 保存之后重新查一下
        fetchList();
        const { SRM_MALL_HOST } = window.$$env;
        const url = webUrl || SRM_MALL_HOST;
        const queryParams = filterNullValueObject({
          unitId: purchase.unitId,
          currentRole,
          mallType,
          showFooter: 1,
        });
        window.open(
          `${url}${url?.endsWith('/') ? 'pub' : '/pub'}?${qs.stringify(
            queryParams
          )}#access_token=${getAccessToken()}`
        );
      }
    });
  }

  // 应用
  function apply() {
    dispatch({
      type: 'mallHome/saveAndApplyBanner',
      payload: {
        tenantId: getCurrentOrganizationId(),
        unitId: purchase.unitId,
        bannerLevel: currentRole === 'purchase' ? 1 : 0,
        groupAttribute: mallType === 'sigl' ? 1 : 0,
      },
    });
    // ------
    dispatch({
      type: 'mallHome/saveAndApply',
      payload: {
        tenantId: getCurrentOrganizationId(),
        unitId: purchase.unitId,
        customLevel: currentRole === 'purchase' ? 1 : 0,
        groupAttribute: mallType === 'sigl' ? 1 : 0,
      },
    }).then(() => {
      fetchList();
      notification.success();
    });
    // 公告
    // ------
    dispatch({
      type: 'mallHome/saveAndApplyGonggao',
      payload: {
        belongType: currentRole === 'purchase' ? 1 : 0,
        unitId: purchase.unitId,
        bulletinAttribute: mallType === 'sigl' ? 1 : 0,
      },
    });
    // 专区
    if (currentRole !== 'purchase') {
      dispatch({
        type: 'mallHome/saveAndApplyZhuanqu',
        payload: {
          belongType: 0,
          channel: mallType === 'sigl' ? 1 : 0,
        },
      });
    }
  }

  const changeFlag = useMemo(() => {
    return !(
      mallHome.siglcustomBarList.some((p) => p.updateFlag === 1) ||
      mallHome.customBarList.some((p) => p.updateFlag === 1)
    );
  }, [mallHome.siglcustomBarList, mallHome.customBarList]);

  const btnLoading = applyCustomLoading || applyBannerLoading || saveCustomLoading;

  const content = (
    <Spin spinning={initListLoading || previewLoading}>
      <DragDropContext
        onDragEnd={(result) => {
          const { source, destination } = result;
          if (!source || destination?.droppableId !== 'custom-bar') return;
          let newList = [...customBarList];
          if (source.droppableId === 'custom-bar') {
            // 内部拖拽
            if (currentRole === 'tenant') {
              newList.splice(source.index, 1);
              newList.splice(destination.index, 0, customBarList[source.index]);
            } else {
              const tList = customBarList.filter((c) => c.customLevel === '0'); // 采买组织要提出租户级的
              const pList = customBarList.filter((c) => c.customLevel !== '0'); // 采买组织的数据
              newList = [...pList];
              newList.splice(source.index, 1);
              newList.splice(destination.index, 0, pList[source.index]);
              newList = [...tList, ...newList];
            }
          } else {
            // if (newList?.filter((p) => p.deleteFlag !== 1)?.length >= 8) {
            //   notification.warning({
            //     message: intl
            //       .get('small.mallHomeConfig.view.customBar.maxWarning')
            //       .d('最多展示8个自定义栏'),
            //   });
            //   return;
            // }
            newList.splice(destination.index, 0, {
              customType: source.droppableId,
              lineNum: source.index,
              uuid: uuid(),
            });
          }
          dispatch({
            type: 'mallHome/updateState',
            payload: {
              [`${mallType}customBarList`]: newList.map((p) => ({ ...p, updateFlag: 1 })),
            },
          });
        }}
      >
        <div className={styles['mall-home-config-container']}>
          <div className="container-left">
            <Template role={currentRole} mallType={mallType} />
          </div>
          <div
            className="container-right"
            // style={currentRole === 'purchase' && !purchase?.unitId ? { display: 'flex' } : {}}
          >
            {currentRole === 'purchase' && !purchase?.unitId ? (
              <div className="no-data-box">
                <span className={styles['empty-img']}><EmptyImg /></span>
                {/* <img style={{ display: 'block', width: '100%' }} src={EmptyImg} alt="" /> */}
                <p className="no-data-desc">
                  {intl.getHTML('small.mallHomeConfig.please.choose.purchaseOrg').d(
                    <span>
                      请<b>选择采买组织</b>为商城装修吧～
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <>{!configLoading && <RightContent />}</>
            )}
          </div>
        </div>
      </DragDropContext>
    </Spin>
  );


  return (
    <>
      <div className={styles.content}>
        <Header title={intl.get('small.common.view.mall.zhuangxiu').d('商城装修')}>
          <ChooseRole
            defaultRole={currentRole}
            defaultData={purchase}
            changeFlag={changeFlag}
            onChange={(params) => {
              const { role, purchase: data = {} } = params;
              dispatch({
                type: 'mallHome/updateState',
                payload: {
                  currentRole: role,
                  purchase: data,
                  mallType:
                    mallType === 'sigl' && role === 'purchase'
                      ? mallHome.onlySigl
                        ? 'sigl'
                        : ''
                      : mallType,
                },
              });
              if (role === 'purchase' && !data.unitId) {
                dispatch({
                  type: 'mallHome/updateState',
                  payload: {
                    siglcustomBarList: [],
                    customBarList: [],
                  },
                });
              } else {
                fetchConfigDetail({ unitId: data.unitId });
                fetchList({ currentRole: role, purchase: data });
              }
            }}
          />
          <div className="operate-btns">
            <Button
              funcType="flat"
              icon="ballot"
              className="recommend-btn"
              onClick={() => {
                history.push('/small/product-recommended');
              }}
            >
              {intl.get('small.common.view.product.recommendList').d('商品推荐列表')}
            </Button>
            {isSecond && <GlobalSetting />}
            {/* <GlobalSetting /> */}
            <Button
              funcType="flat"
              icon="pageview"
              className="preview-btn"
              onClick={() => save({ type: 'preview' })}
              loading={btnLoading}
            >
              {intl.get(`small.common.model.save.preview`).d('预览')}
            </Button>
            <Button
              loading={btnLoading}
              funcType="flat"
              icon="save"
              className="save-btn"
              onClick={() => save()}
            >
              {intl.get('small.common.button.save').d('保存')}
            </Button>
            <Button
              loading={btnLoading}
              color="primary"
              icon="done_all"
              className="apply-btn"
              onClick={() => save({ type: 'apply' })}
            >
              {intl.get('small.common.button.apply').d('应用')}
            </Button>
          </div>
        </Header>
      </div>
      <Content>
        <>
          {memberPermission && enterprisePermission ? (
            <Tabs
              defaultActiveKey={mallType}
              onChange={(e) => {
                dispatch({
                  type: 'mallHome/updateState',
                  payload: {
                    mallType: e,
                  },
                });
              }}
            >
              <TabPane tab={intl.get('small.common.view.company.buy').d('企业购')} key="">
                {content}
              </TabPane>
              {currentRole !== 'purchase' && (
                <TabPane tab={intl.get('small.common.view.member.buy').d('会员购')} key="sigl">
                  {content}
                </TabPane>
              )}
            </Tabs>
          ) : (
            <>
              {!permissionLoading && (
                <>
                  {enterprisePermission ? (
                    <Tabs
                      defaultActiveKey=""
                      onChange={(e) => {
                        dispatch({
                          type: 'mallHome/updateState',
                          payload: {
                            mallType: e,
                          },
                        });
                      }}
                    >
                      <TabPane tab={intl.get('small.common.view.company.buy').d('企业购')} key="">
                        {content}
                      </TabPane>
                    </Tabs>
                  ) : (
                    currentRole !== 'purchase' && (
                      <Tabs
                        defaultActiveKey=""
                        onChange={(e) => {
                          dispatch({
                            type: 'mallHome/updateState',
                            payload: {
                              mallType: e,
                            },
                          });
                        }}
                      >
                        <TabPane
                          tab={intl.get('small.common.view.member.buy').d('会员购')}
                          key="sigl"
                        >
                          {content}
                        </TabPane>
                      </Tabs>
                    )
                  )}
                </>
              )}
            </>
          )}
        </>
      </Content>
    </>
  );
}

export default compose(
  connect(({ mallHomeConfig, mallHome, loading }) => ({
    mallHomeConfig,
    mallHome,
    initListLoading: loading.effects['mallHome/initList'],
    previewLoading: loading.effects['mallHome/saveAndPreview'],
    configLoading: loading.effects['mallHomeConfig/fetchDetail'],
    applyCustomLoading: loading.effects['mallHome/saveAndApply'],
    applyBannerLoading: loading.effects['mallHome/saveAndApplyBanner'],
    saveCustomLoading: loading.effects['mallHome/saveAndPreview'],
    permissionLoading: loading.effects['mallHome/fetchPermission'],
  })),
  formatterCollections({
    code: [
      'small.mallHomeConfig',
      'small.common',
      'small.mallHomePlate',
      'small.companyCategoryconfig',
    ],
  })
)(MallHomeConfig);
