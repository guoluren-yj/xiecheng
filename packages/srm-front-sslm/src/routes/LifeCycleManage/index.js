/*
 * LifeCycleManage - 生命周期管理
 * @Date: 2022-12-02 16:24:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { connect } from 'dva';
import qs from 'querystring';
import classNames from 'classnames';
import { routerRedux } from 'dva/router';
import { useObserver } from 'mobx-react-lite';
import { compose, isNil, toString, isEmpty, pullAt } from 'lodash';
import React, { Fragment, useEffect, useState, useCallback, useMemo } from 'react';
import { Spin, Tabs, Dropdown, Icon, Menu, DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remote from 'utils/remote';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';
import { Button as PermissionButton } from 'components/Permission';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import {
  checkSubmit,
  batchCheckSubmit,
  queryCurrentConfig,
  queryDocumentCount,
  searchSupplier,
  verifySupplierLife,
  batchSubmitApplication,
} from '@/services/lifeCycleManageService';
import { queryPermission } from '@/services/commonService';

import styles from './index.less';
import Supplier from './Supplier';
import Documents from './Documents';
import HeaderBtns from './HeaderBtns';
import { documentsList, getSubmitMsg } from './utils';
import { Context } from './Context';
import { getDocumentsListDS } from './stores/getDocumentsListDS';
import { getSupplierListDS } from './stores/getSupplierListDS';

const { TabPane, TabGroup } = Tabs;
const tenantId = getCurrentOrganizationId();
let laneSearchBarRef = null;

const Index = ({
  dispatch,
  waitSubmitDs,
  approvalDs,
  allDs,
  supplierTableDs,
  mixObj,
  primaryColor,
  customizeTable,
  customizeBtnGroup,
  lifeCycleManageRemote,
}) => {
  // 存储值集
  const [valueList, setValueList] = useState({});
  // 阶段泳道数据源
  const [stageLane, setStageLane] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [permission, setPermission] = useState([]);
  // 配置中心管控维度
  const [dimensionCode, setDimensionCode] = useState(mixObj.dimensionCode);
  const [dimensionDisabled, setDimensionDisabled] = useState(mixObj.dimensionDisabled);
  const [activeKey, setActiveKey] = useState(mixObj.activeKey);
  const [aggregation, setAggregation] = useState(mixObj.aggregation); // 泳道还是表格视图
  const [stageList, setStageList] = useState([]); // 所有阶段集合
  const [documentCount, setDocumentCount] = useState({}); // 单据页签显示数量
  const [pageChacheFlag, setPageChacheFlag] = useState(true); // 供应商表格视图是否缓存分页

  const dataSetList = {
    waitSubmit: waitSubmitDs,
    approval: approvalDs,
    all: allDs,
  };

  useEffect(() => {
    handleDsState();
    queryValueList();
    handlePermission();
  }, []);

  useEffect(() => {
    initQuery();
  }, [activeKey]);

  // 初始化查询
  const initQuery = useCallback(() => {
    handleDocumentCount();
    for (const key in dataSetList) {
      if (Object.hasOwnProperty.call(dataSetList, key)) {
        const ds = dataSetList[key];
        if (key === activeKey && ds.getState('queryStatus') === 'ready') {
          ds.setState('initQueryStatus', null);
          ds.query(ds.currentPage);
        }
      }
    }
  }, [activeKey]);

  // 处理ds的state
  const handleDsState = () => {
    // initQueryStatus用于处理详情返回列表时，列表查询两次问题
    for (const key in dataSetList) {
      if (Object.hasOwnProperty.call(dataSetList, key)) {
        const ds = dataSetList[key];
        ds.setState('initQueryStatus', 'ready');
      }
    }
  };

  // 查询按钮权限集
  const handlePermission = useCallback(() => {
    const permissionList = [
      'srm.partner.lifecycle.management.button.special', // 特批申请单
    ];
    queryPermission(permissionList).then(response => {
      const res = getResponse(response);
      if (res) {
        setPermission(res);
      }
    });
  }, []);

  // 查询值集
  const queryValueList = useCallback(() => {
    const lovCode = {
      dimensionList: 'SSLM.LIFE_CYCLE_DIMENSION',
      documentTypeList: 'SSLM.LIFE_CYCLE_CHANGE_DOCUMENT_TYPE',
    };
    queryMapIdpValue(lovCode).then(response => {
      const res = getResponse(response);
      if (res) {
        setValueList(res);
      }
    });
    queryUnifyIdpValue('SSLM.LIFE_CYCLE_STAGE', { tenantId }).then(response => {
      const res = getResponse(response);
      if (res) {
        setStageList(res);
      }
    });
  }, []);

  // 查询配置中心管控维度
  const handleControlDimension = useCallback(async () => {
    setSpinning(true);
    await queryCurrentConfig()
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { dimensionCode: newDimensionCode } = res;
          const dimension = newDimensionCode === 'BOTH' ? 'GROUP' : newDimensionCode;
          setDimensionCode(dimension);
          setDimensionDisabled(newDimensionCode !== 'BOTH');
          // eslint-disable-next-line no-param-reassign
          mixObj.dimensionCode = dimension;
          // eslint-disable-next-line no-param-reassign
          mixObj.dimensionDisabled = newDimensionCode !== 'BOTH';
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  // 查询单据数量
  const handleDocumentCount = useCallback(() => {
    queryDocumentCount().then(response => {
      const res = getResponse(response);
      if (res) {
        setDocumentCount(res);
      }
    });
  }, []);

  // 筛选器code
  const searchCode = useMemo(() => {
    if (!aggregation) {
      return 'SSLM.LIFE_CYCLE.SUPPLIER_LIST.TABLE_SEARCH_BAR';
    } else if (dimensionCode === 'COMPANY') {
      return 'SSLM.LIFE_CYCLE.SUPPLIER_LIST.COMPANY_SEARCH_BAR';
    } else {
      return 'SSLM.LIFE_CYCLE.SUPPLIER_LIST.SEARCH_BAR';
    }
  }, [dimensionCode, aggregation]);

  // 查询供应商列表
  const handleSupplierSearch = useCallback(
    async ({ params = {} } = {}) => {
      if (!aggregation) {
        supplierTableDs.setQueryParameter('queryParams', params);
        if (pageChacheFlag) {
          supplierTableDs.query(supplierTableDs.currentPage);
        } else {
          supplierTableDs.query();
        }
      } else {
        // 缓存中dimensionCode有值时，不重新查询配置中心管控维度，否则缓存被覆盖
        // 筛选器的查询接口，dimensionCode为必须参数，固查配置中心的接口放在onQuery中
        if (!mixObj.dimensionCode) {
          await handleControlDimension();
        }
        const { stageId = 'ALL', ...others } = params;
        // 处理泳道切换分页时，无法拿到筛选器查询条件问题
        const searchBarParams = filterNullValueObject(laneSearchBarRef?.getQueryParameter() || {});
        const payload = {
          stageId,
          dimensionCode: mixObj.dimensionCode,
          customizeUnitCode: [searchCode, 'SSLM.LIFE_CYCLE.SUPPLIER_LIST.TABLE_LIST'].join(),
          ...others,
          ...searchBarParams,
        };
        setSpinning(true);
        await searchSupplier(payload)
          .then(response => {
            const res = getResponse(response);
            if (res) {
              if (stageId === 'ALL') {
                setStageLane(res);
              } else {
                // 分阶段查询;
                const stage = stageLane.find(item => item.stageId === stageId);
                const index = stageLane.findIndex(item => item.stageId === stageId);
                setStageLane([
                  ...stageLane.slice(0, index),
                  {
                    ...stage,
                    stageLifeCycles: res,
                  },
                  ...stageLane.slice(index + 1),
                ]);
              }
            }
          })
          .finally(() => {
            setSpinning(false);
          });
      }
    },
    [dimensionCode, stageLane, laneSearchBarRef, aggregation, pageChacheFlag]
  );

  // 泳道拖动结束的回调
  const handleDragEnd = useCallback(
    async result => {
      const { source, destination, draggableId } = result;
      if (!destination) {
        // 被拖动的draggable没有被droppable包含
        return;
      }
      // 跨droppable中拖动
      if (source.droppableId !== destination.droppableId) {
        const sourceIndex = stageLane.findIndex(item => item.stageId === source.droppableId);
        const destinationIndex = stageLane.findIndex(
          item => item.stageId === destination.droppableId
        );
        const {
          stageId: toStageId,
          stageCode: destinationCode,
          stageDescription: destinationDescription,
        } = stageLane[destinationIndex]; // 目标阶段
        let gradeType = 'NO';
        // 校验升级 or 降级
        const isUpgrade =
          stageLane[sourceIndex].stageCode === 'ELIMINATED' ? true : destinationIndex > sourceIndex;
        const isDegrade = stageLane[destinationIndex].stageCode === 'ELIMINATED';
        gradeType = isDegrade ? 'DEGRADE' : isUpgrade ? 'UPGRADE' : 'DEGRADE';
        const sourceSupplier = stageLane[sourceIndex]; // 起始阶段供应商列表
        // 当前供应商
        const supplier = sourceSupplier.stageLifeCycles.content.find(
          item => toString(item.supplierCompanyId) === draggableId
        );
        const { supplierCompanyId, companyId, strategyId, stageId } = supplier;
        if (isNil(supplier)) {
          return;
        }
        const index = sourceSupplier.stageLifeCycles.content.findIndex(
          item => toString(item.supplierCompanyId) === draggableId
        );
        const currentInfo = {
          ...supplier,
          gradeType,
          toStageId,
          destinationCode,
          destinationDescription,
        };
        const newSuplier = [
          ...sourceSupplier.stageLifeCycles.content.slice(0, index),
          { ...currentInfo },
          ...sourceSupplier.stageLifeCycles.content.slice(index + 1),
        ];
        verifySupplierLife({
          strategyId,
          toStageId,
          stageId,
          supplierCompanyId,
          companyId: dimensionCode === 'COMPANY' ? companyId : null,
          documentType: 'NORMAL',
        }).then(response => {
          const res = getResponse(response);
          if (res) {
            setStageLane([
              ...stageLane.slice(0, sourceIndex),
              {
                ...sourceSupplier,
                stageLifeCycles: {
                  ...sourceSupplier.stageLifeCycles,
                  content: [...newSuplier],
                },
              },
              ...stageLane.slice(sourceIndex + 1),
            ]);
            handleDetail(
              { toStageId, supplierCompanyId, companyId, documentType: 'NORMAL' },
              'create'
            );
          }
        });
      }
    },
    [stageLane]
  );

  // tab改变时的回调
  const handleTabChange = useCallback(key => {
    setActiveKey(key);
    // eslint-disable-next-line no-param-reassign
    mixObj.activeKey = key;
  }, []);

  // "新建"下拉菜单
  const renderCreateMenus = useCallback(() => {
    const { documentTypeList = [] } = valueList;
    const specialFlag = (
      permission.find(n => n.code === 'srm.partner.lifecycle.management.button.special') || {}
    ).approve;
    return (
      <Menu>
        {documentTypeList.map(item => (
          <Menu.Item
            key={item.value}
            style={{ display: item.value === 'SPECIAL' && !specialFlag ? 'none' : 'block' }}
          >
            {item.meaning}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [valueList, permission]);

  // 绑定供应商SearchBar的ref
  const bindLaneSearchBarRef = useCallback(element => {
    laneSearchBarRef = element;
  }, []);

  // 管控维度改变的回调
  const handleDimensionChange = useCallback(value => {
    setDimensionCode(value);
    // eslint-disable-next-line no-param-reassign
    mixObj.dimensionCode = value;
  }, []);

  // 视图改变的回调
  const handleAggregation = useCallback(flag => {
    setAggregation(flag);
    // eslint-disable-next-line no-param-reassign
    mixObj.aggregation = flag;
  }, []);

  // 渲染下拉菜单
  const renderMenus = useCallback(() => {
    return (
      <Menu style={{ maxHeight: 400, overflow: 'scroll' }}>
        {stageList.map(stage => (
          <Menu.Item key={stage.value} toStageId={stage.value}>
            {stage.meaning}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [stageList]);

  // 菜单回调
  const lineOverlayClick = useCallback(({ item }, record, documentType) => {
    const { toStageId } = item.props;
    const {
      supplierCompanyId,
      companyId,
      strategyId,
      stageId,
      dimensionCode: recordDimensionCode,
    } = record;
    verifySupplierLife({
      strategyId,
      toStageId,
      stageId,
      supplierCompanyId,
      documentType,
      companyId: recordDimensionCode === 'COMPANY' ? companyId : null,
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        handleDetail({ toStageId, supplierCompanyId, companyId, documentType }, 'create');
      }
    });
  }, []);

  // 渲染升降级中的操作链接
  // reqCreatedByPermissions 返回false表示创建人是当前登录用户
  const renderOperateLink = useCallback(
    data => {
      const {
        gradeType,
        requisitionId,
        documentType,
        processStatus,
        reqCreatedByPermissions,
      } = data;
      if (gradeType === 'NO') {
        return (
          <Fragment>
            <Dropdown
              overlay={() => renderMenus()}
              onOverlayClick={e => lineOverlayClick(e, data, 'NORMAL')}
            >
              <PermissionButton type="c7n-pro" funcType="link" style={{ marginRight: 8 }}>
                <span className={styles['option-btn']}>
                  {intl
                    .get('sslm.lifeCycleManage.view.title.launchRelegationApply')
                    .d('发起升降级申请')}
                </span>
                <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
              </PermissionButton>
            </Dropdown>
            <Dropdown
              overlay={() => renderMenus()}
              onOverlayClick={e => lineOverlayClick(e, data, 'SPECIAL')}
            >
              <PermissionButton
                type="c7n-pro"
                funcType="link"
                permissionList={[
                  {
                    code: 'srm.partner.lifecycle.management.button.special',
                    type: 'button',
                    meaning: '生命周期管理工作台-特批申请单',
                  },
                ]}
              >
                <span className={styles['option-btn']}>
                  {intl
                    .get('sslm.lifeCycleManage.view.title.launchSpecialApproveApply')
                    .d('发起特批申请')}
                </span>
                <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
              </PermissionButton>
            </Dropdown>
          </Fragment>
        );
      } else {
        const isEdit = ['NEW', 'REJECTED'].includes(processStatus);
        const status = isEdit ? 'detail' : 'read';
        const disabled = lifeCycleManageRemote.process(
          'SSLM_LIFE_CYCLE_MANAGE_LANE_OPERATE_APPLICATION_DISABLE',
          false,
          {
            data,
            isEdit,
          }
        );
        return !reqCreatedByPermissions ? (
          <PermissionButton
            type="c7n-pro"
            funcType="link"
            disabled={disabled}
            style={{ marginRight: 8 }}
            onClick={() => handleDetail({ requisitionId, documentType }, status)}
          >
            {isEdit
              ? intl.get('sslm.common.view.message.editApplication').d('编辑申请单')
              : intl.get('sslm.common.view.message.search').d('查看申请单')}
          </PermissionButton>
        ) : (
          '-'
        );
      }
    },
    [stageList, dimensionCode]
  );

  // 跳转详情
  const handleDetail = useCallback((params = {}, status = 'detail') => {
    dispatch(
      routerRedux.push({
        pathname: `/sslm/life-cycle-manage/${status}`,
        search: qs.stringify(params),
      })
    );
  }, []);

  // 【全部】页签行内提交
  let _submitModal = null;
  const lineSubmit = useCallback(record => {
    setSpinning(true);
    const requisitionId = record.get('requisitionId');
    const index = 0;
    checkSubmit({ requisitionId })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const submitMsg = getSubmitMsg(res);
          _submitModal = Modal.open({
            border: false,
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: submitMsg[index].message,
            bodyStyle: { padding: '0 24px 24px' },
            onOk: () => {
              pullAt(submitMsg, index);
              if (submitMsg.length) {
                _submitModal.update({
                  children: submitMsg[index].message,
                });
                return false;
              } else {
                return batchSubmitApplication([requisitionId]).then(submitResponse => {
                  const submitRes = getResponse(submitResponse);
                  if (submitRes) {
                    notification.success();
                    allDs.query(allDs.currentPage);
                  }
                });
              }
            },
          });
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  // 【待提交】页签批量检验并提交
  const handleAllCheckAndSubmit = useCallback(() => {
    const selectedRows = waitSubmitDs.toJSONData();
    const requisitionIdList = selectedRows.map(n => n.requisitionId);
    setSpinning(true);
    return batchCheckSubmit(requisitionIdList)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { checkType, supplierCompanyNames } = res;
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            className: styles['submit-modal'],
            children:
              checkType === 'WEAK_CHECK'
                ? intl
                    .get('sslm.lifeCycleManage.view.message.btachSubmitMsg', {
                      name: supplierCompanyNames,
                    })
                    .d(`【${supplierCompanyNames}】存在未完结的【订单】、【结算事务】，请关注！`)
                : intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
            onOk: () => {
              return batchSubmitApplication(requisitionIdList).then(submitResponse => {
                const submitRes = getResponse(submitResponse);
                if (submitRes) {
                  notification.success();
                  waitSubmitDs.query(waitSubmitDs.currentPage, null, false);
                  handleDocumentCount();
                }
              });
            },
          });
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  const submitDisabled = useObserver(() => isEmpty(waitSubmitDs.selected));

  // context对应value
  const contextValue = {
    activeKey,
    stageLane,
    valueList,
    stageList,
    searchCode,
    aggregation,
    primaryColor,
    dimensionCode,
    customizeTable,
    supplierTableDs,
    dimensionDisabled,
    laneSearchBarRef,
    lifeCycleManageRemote,
    setStageLane,
    renderOperateLink,
    onSubmit: lineSubmit,
    onDetail: handleDetail,
    onDragEnd: handleDragEnd,
    onRef: bindLaneSearchBarRef,
    onSearch: handleSupplierSearch,
    onPageChache: setPageChacheFlag,
    onAggregation: handleAggregation,
    onDimensionChange: handleDimensionChange,
  };

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.lifeCycleManage.view.title.lifeCycleManage')
          .d('供应商生命周期管理工作台')}
      >
        <HeaderBtns
          loading={spinning}
          activeKey={activeKey}
          submitDisabled={submitDisabled}
          dataSet={dataSetList[activeKey]}
          onSubmit={handleAllCheckAndSubmit}
          onCreateMenus={renderCreateMenus}
          customizeBtnGroup={customizeBtnGroup}
          onOverlayClick={e => handleDetail({ documentType: e.key }, 'create')}
        />
      </Header>
      <Content>
        <Spin spinning={spinning}>
          <Context.Provider value={contextValue}>
            <Tabs
              activeKey={activeKey}
              onChange={handleTabChange}
              className={classNames({
                [styles['life-cycle-tab']]: activeKey === 'supplierLane',
                [styles['list-tabs']]: activeKey === 'supplierLane',
              })}
            >
              <TabGroup
                key="supplier"
                tab={intl.get('sslm.common.view.supplier.supplierCompany').d('供应商')}
              >
                <TabPane key="supplierLane">
                  <Supplier />
                </TabPane>
              </TabGroup>
              <TabGroup
                key="documents"
                tab={intl.get('sslm.common.view.supplier.documents').d('单据')}
              >
                {documentsList().map(document => (
                  <TabPane
                    key={document.key}
                    tab={document.tab}
                    count={documentCount[document.key]}
                  >
                    <Documents
                      searchCode={document.searchCode}
                      dataSet={dataSetList[document.key]}
                      customizeUnitCode={document.customizeUnitCode}
                    />
                  </TabPane>
                ))}
              </TabGroup>
            </Tabs>
          </Context.Provider>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.workbench',
      'sslm.commonApplication',
      'sslm.lifeCycleManage',
      'sslm.supplierLifeManage',
      'sslm.supplierLifePolicyConfig',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.ALL',
      'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.SUBMIT',
      'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.APPROVAL',
      'SSLM.LIFE_CYCLE.SUPPLIER_LIST.TABLE_LIST',
    ],
  }),
  withProps(
    () => {
      const mixObj = {
        aggregation: true,
        dimensionCode: '',
        dimensionDisabled: false, // 存对象中，防止详情返回列表时被清空
        activeKey: 'supplierLane',
      };
      const waitSubmitDs = new DataSet(getDocumentsListDS('waitSubmit')); // 待提交
      const approvalDs = new DataSet(getDocumentsListDS('approval')); // 审批中
      const allDs = new DataSet(getDocumentsListDS('all')); // 全部
      const supplierTableDs = new DataSet(getSupplierListDS()); // 供应商-表格视图ds
      return {
        mixObj,
        waitSubmitDs,
        approvalDs,
        allDs,
        supplierTableDs,
      };
    },
    { cacheState: true }
  ),
  connect(({ user = {} }) => {
    const { currentUser: { themeConfigVO = {} } = {} } = user;
    const {
      enableThemeConfig, // 是否开启了新主题
      colorCode, // 主题色
    } = themeConfigVO;
    if (enableThemeConfig) {
      return {
        primaryColor: colorCode,
      };
    }
    return {};
  }),
  remote({
    code: 'SSLM_LIFE_CYCLE_MANAGE',
    name: 'lifeCycleManageRemote',
  })
)(Index);
