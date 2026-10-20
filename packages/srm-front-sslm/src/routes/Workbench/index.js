/**
 * Workbench - 工作台
 * @date: 2021-04-28
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import querystring from 'querystring';
import { Alert } from 'choerodon-ui';
import { compose, isArray, head, isEmpty } from 'lodash';
import React, { Fragment, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  DataSet,
  Tabs,
  ModalProvider,
  Modal,
  Form,
  Lov,
  Select,
  useDataSet,
  notification,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remote from 'utils/remote';
import withProps from 'utils/withProps';
import { routerRedux } from 'dva/router';
import { queryMapIdpValue } from 'services/api';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentUserId, filterNullValueObject } from 'utils/utils';

import {
  fetchHeaderType,
  verifySupplierUpdate,
  queryMenuPermissions,
  batchUpdateSupplierData,
} from '@/services/workbenchService';
import { createEntryForm } from '@/services/supplierEntryService';
import CreateForm from '@/routes/SupplierEntry/CreateForm';
import { getJumpUrl } from '@/routes/SupplierEntry/utils';
import ModalChildren from '@/routes/SupplierEntry/ModalChildren';
import { getCreateFormDs, getOperateTypeDs } from '@/routes/SupplierEntry/stores/createForm';

import styles from './index.less';
import { getHeaderBtns } from './HeaderBtns';
import LocalSupplier from './LocalSupplier';
import PlatformSupplier from './PlatformSupplier';
import RelationBills from './PlatformSupplier/RelationBills';
import { getEnterpriseChangeDS } from './stores/enterpriseChangeDS';
// import { getSupplierChangeDS } from './stores/supplierChangeDS';
import { getSimpleSupplierDS } from './stores/simpleSupplierDS';
import { getPlatformSupplierListDS } from './stores/platformSupplierDS';
import { getLocalSupplierListDS } from './stores/localSupplierDS';
import { useSetState, btnsPermissions } from './utils';

const currentUserId = getCurrentUserId();
const { TabPane } = Tabs;
let currentSearchBarRef = null;

// 菜单编码，顺序不可调整
const menuCode = [
  'srm.partner.purchaser-investigation-workbench', // 采购方调查表工作台
  'srm.partner.my-partner.supplier-invite', // 供应商邀约管理
  'srm.partner.lifecycle.management', // 生命周期管理工作台
  'srm.partner.my-partner.supplier-inform-change-new', // 供应商信息变更（新）
  'srm.partner.my-partner.supplier-inform-change', // 供应商信息变更（旧）
  'srm.pc-admin.pc-purchaser.workspace2', // 协议工作台
];

const Workbench = ({
  history,
  location,
  dispatch,
  localSupplierListDs,
  custLoading,
  customizeTable,
  customizeForm,
  customizeTabPane,
  customizeBtnGroup,
  mixObj,
  mixObj: { platformSupplierListDs } = {},
  getHocInstance,
  platformSupplierRemote,
}) => {
  const guideRef = useRef(null); // 操作指引ref
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const {
    supplierDimension: newSupplierDimension,
    defaultTabIndex,
    relationActiveKey = 'investigate',
    sideFlag,
  } = routerParams;
  const [createMenus, setCreateMenus] = useState([]);
  const [createMenusLodaing, setCreateMenusLodaing] = useState(false);
  const [currentKey, setCurrentKey] = useState(defaultTabIndex || mixObj.currentKey);
  const [valueList, setValueList] = useState({}); // 存储值集
  const [supplierDimension, setSupplierDimension] = useState(
    newSupplierDimension || mixObj.supplierDimension
  );
  const [permissionFlag, setPermissionFlag] = useState(false); // 判断本地供应商是否有变更信息权限

  const [menuPermissions, setMenuPermissions] = useSetState({
    purchaserInvestig: false,
    inviteManage: false,
    lifecycleWorkbench: false,
    supChange: false,
    oldSupChange: false,
    contractWorkspace: false,
  });
  const { purchaserInvestig, inviteManage, lifecycleWorkbench, supChange } = menuPermissions;
  // 平台供应商
  const isPlatform = currentKey === 'platformSupplier';

  const operateTypeDs = useDataSet(() => getOperateTypeDs(), []);
  const supplierEnteringDs = useDataSet(() => getCreateFormDs(), []);
  let supplierEnteringModal;

  useEffect(() => {
    queryValueList();
    handleHeaderType();
    // 其他页面跳转至工作台，处理默认维度与刷新问题
    if (newSupplierDimension) {
      supplierDimensionChange(newSupplierDimension);
    }
    // 查询角色菜单权限
    handleMenuPermissions();
  }, [newSupplierDimension]);

  // 查询角色菜单权限
  const handleMenuPermissions = () => {
    queryMenuPermissions({
      code: menuCode.join(','),
    }).then(res => {
      if (getResponse(res)) {
        setMenuPermissions({
          purchaserInvestig: res[menuCode[0]],
          inviteManage: res[menuCode[1]],
          lifecycleWorkbench: res[menuCode[2]],
          supChange: res[menuCode[3]],
          oldSupChange: res[menuCode[4]],
          contractWorkspace: res[menuCode[5]],
        });
      }
    });
  };

  // 查询值集
  const queryValueList = () => {
    const lovCode = {
      businessInvite: 'SSLM.BUSINESS_INVITATION',
      dimensionList: 'SSLM.SUP.WORK_BENCH_DIMENSION',
    };
    queryMapIdpValue(lovCode).then(response => {
      const res = getResponse(response);
      if (res) {
        setValueList(res);
      }
    });
  };

  // 绑定筛选器的ref
  const onSearchBarRef = ref => {
    currentSearchBarRef = ref;
  };

  // 查询平台供应商信息
  const queryPlatformSupplier = ({ params }) => {
    const listCode =
      supplierDimension === 'SUPPLIER'
        ? 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.LIST'
        : 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.CATEGORY.LIST';
    const searchCode =
      supplierDimension === 'SUPPLIER'
        ? 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.SEARCH_BAR'
        : 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.SUP_IT_SEARCH_BAR';

    const queryParams = {
      ...params,
      supplierDimensionCode: supplierDimension,
      customizeUnitCode: `${searchCode},${listCode}`,
    };
    const remoteParams = platformSupplierRemote.process(
      'SSLM_PLATFORM_SUPPLIER_DEFINITION_PLATFORM_SUPPLIER_QUERY',
      queryParams,
      { params }
    );
    platformSupplierListDs.setQueryParameter('queryParams', remoteParams);
    platformSupplierListDs.query().then(res => {
      if (res && res.content && isArray(res.content) && sideFlag === '1') {
        const data = head(res.content);
        relationDocuments({ data });
      }
    });
  };

  // 头新建单据下拉查询
  const handleHeaderType = useCallback(() => {
    setCreateMenusLodaing(true);
    fetchHeaderType()
      .then(response => {
        const res = getResponse(response);
        if (res) {
          setCreateMenus(res);
          const menuFlag = res
            .map(n => n.value)
            .includes('srm.partner.my-partner.supplier-warehouse');
          setPermissionFlag(menuFlag);
        }
      })
      .finally(() => setCreateMenusLodaing(false));
  }, []);

  // 企业信息变更弹框
  const enterpriseChange = useCallback(() => {
    const enterpriseChangeDs = new DataSet(getEnterpriseChangeDS());
    Modal.open({
      title: intl.get('sslm.enterpriseInform.model.application.chooseEnterprise').d('选择企业'),
      key: Modal.key(),
      drawer: true,
      style: { width: 380 },
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: (
        <Form dataSet={enterpriseChangeDs} labelLayout="float">
          <Select
            name="changeContent"
            help={intl
              .get('sslm.enterpriseInform.model.application.changeContentTitle')
              .d(
                '选择全平台公开信息，变更内容将对所有合作采购方生效，选择采购方相关信息则只对所选采购方生效'
              )}
            showHelp="tooltip"
          />
          <Lov name="enterpriseLov" />
          <Select
            name="changeLevel"
            help={intl
              .get('sslm.enterpriseInform.model.application.latitudeChangeTitle')
              .d('选择集团级变更内容将对采购方所有子公司生效，选择公司级则只对所选公司生效')}
            showHelp="tooltip"
          />
          <Lov name="partnerCompanyLov" />
        </Form>
      ),
      onOk: async () => {
        const validateFlag = await enterpriseChangeDs.validate();
        if (validateFlag) {
          const response = await enterpriseChangeDs.submit();
          if (response && response.success) {
            const { changeReqId, companyId, partnerTenantId } =
              response.content && response.content[0];
            history.push({
              pathname: `/sslm/enterprise-inform-change/detail/${changeReqId}`,
              search: querystring.stringify({
                companyId,
                partnerTenantId,
                tenantId: partnerTenantId,
              }),
            });
          }
        }
        return false;
      },
    });
  }, []);

  // 供应商信息变更弹框
  const supplierChange = useCallback(
    record => {
      let params = {};
      if (record) {
        const { supplierCompanyId } = record.get(['supplierCompanyId']);
        params = supChange ? { supplierCompanyId } : {};
      }
      const pathname = supChange
        ? '/sslm/supplier-inform-change-new/detail/create'
        : '/sslm/supplier-inform-change/list';
      dispatch(
        routerRedux.push({
          pathname,
          search: querystring.stringify(filterNullValueObject(params)),
        })
      );
    },
    [supChange]
  );

  // 简易供应商入库弹框
  const simpleSupplier = useCallback(() => {
    const simpleSupplierDs = new DataSet(getSimpleSupplierDS());
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 380 },
      title: intl.get('hzero.common.button.create').d('新建'),
      children: (
        <Form dataSet={simpleSupplierDs} labelLayout="float">
          <Select name="reqTypeCode" />,
          <Lov name="supplierLov" />
        </Form>
      ),
      onOk: async () => {
        const validateFlag = await simpleSupplierDs.current.validate();
        const currentData = simpleSupplierDs.current.toData();
        if (validateFlag) {
          const { reqTypeCode, supplierId, supplierNum } = currentData;
          if (reqTypeCode === 'SUP_NEW_REQ') {
            history.push(`/sslm/supplier-warehouse/create/${currentUserId}`);
          } else if (reqTypeCode === 'SUP_UPDATE_REQ') {
            const response = await verifySupplierUpdate(currentData);
            const res = getResponse(response);
            if (res) {
              // 默认返回true,当返回false时走二开逻辑不走标准逻辑
              const eventProps = {
                dataSet: simpleSupplierDs,
              };
              const result = await platformSupplierRemote.event.fireEvent(
                'cuxHandleCreateSupplierWarehouse',
                eventProps
              );
              if (!result) {
                return;
              }
              history.push({
                pathname: `/sslm/supplier-warehouse/create/${currentUserId}`,
                search: querystring.stringify({
                  supplierId,
                  supplierNum,
                }),
              });
            }
          }
        }
        return false;
      },
    });
  }, []);

  const handleJumpOtherPage = (selectValue, newRegisterFlag, supplierInfo = {}) => {
    const { partnerCompanyId } = supplierInfo;
    const urlObj = getJumpUrl({
      newRegisterFlag,
      name: selectValue,
      menuPermissionsFlag: supChange,
    });
    let params = {};
    if (selectValue === 'updateSupplier' && supChange) {
      params = {
        supplierCompanyId: partnerCompanyId,
      };
    }
    const { url = '' } = urlObj || {};
    history.push({
      pathname: url,
      search: querystring.stringify(filterNullValueObject(params)),
    });
  };

  /**
   * 处理继续录入
   */
  const handleContinueAttestation = async () => {
    const formValues = supplierEnteringDs.current.toData();
    // 获取操作选项标识
    const { firstType, secondType } = operateTypeDs?.current?.get(['firstType', 'secondType']);
    const partnerFlag = firstType === 'createPartnership' || secondType === 'createPartnership';
    const payload = {
      ...formValues,
      checkFlag: false,
      buildNewPartnerFlag: partnerFlag ? 1 : 0, // 选择新增合作关系传1
    };
    const res = await createEntryForm(payload);
    if (getResponse(res)) {
      const { changeReqId } = res;
      supplierEnteringModal.close();
      notification.success({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      history.push({
        pathname: `/sslm/supplier-entry/detail/${changeReqId}/create`,
      });
    }
    return false;
  };

  const handleModalOk = ({
    newRegisterFlag = false,
    moreOneStepFlag = false,
    supplierInfo = {},
  } = {}) => {
    const { firstType, secondType } = operateTypeDs?.current?.get(['firstType', 'secondType']);
    // 是否需要校验第二个步骤
    const needCheckSecond = firstType === 'continueEntry' && moreOneStepFlag;
    // 当步骤条超过1个时，根据第一个步骤条选的值，判断第二个步骤条选的值：第一个步骤为continueEntry，第二个没值需报错
    // checkSecondType: false通过，true 不通过，默认通过
    const checkSecondType = needCheckSecond ? !secondType : false;
    if (!firstType || checkSecondType) {
      notification.error({
        placement: 'bottomRight',
        message: intl.get('sslm.supplierEntry.view.message.operateType').d('请选择操作类型'),
      });
      return false;
    }
    // 处理跳转其他页面
    let goToOtherPage = false;
    let pageType = '';
    if (!needCheckSecond) {
      goToOtherPage = ['sendInvite', 'updateSupplier', 'viewSupplier'].includes(firstType);
      pageType = firstType;
    } else {
      goToOtherPage = ['sendInvite', 'updateSupplier', 'viewSupplier'].includes(secondType);
      pageType = secondType;
    }
    if (goToOtherPage) {
      supplierEnteringModal.close();
      handleJumpOtherPage(pageType, newRegisterFlag, supplierInfo);
    } else {
      return handleContinueAttestation();
    }
  };

  const handleOperateGuide = result => {
    // 每次打开弹窗重置ds
    operateTypeDs.reset();
    const { enteringCheckVo = {} } = result;
    const {
      newRegisterFlag,
      urlRegisterBeforeFlag,
      partnerType,
      privateFlag,
      partnerVOS = [],
    } = enteringCheckVo;
    // partnerType 0 完全合作  1 部分合作  2 完全未合作
    const partPartnerShipFlag = partnerType === 1;
    // 协同标识
    const coordinationFlag = urlRegisterBeforeFlag === 1 || privateFlag === 0;
    // 部分合作且有协同，展示步骤条
    const moreOneStepFlag = partPartnerShipFlag && coordinationFlag;
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: {
        width: 400,
      },
      bodyStyle: {
        padding: 0,
      },
      title: intl.get('sslm.supplierEntry.view.message.operateGuide').d('操作指引'),
      cancelText: intl.get('hzero.common.button.cance').d('取消'),
      okFirst: true,
      destroyOnClose: true,
      children: <ModalChildren childrenProps={enteringCheckVo} operateTypeDs={operateTypeDs} />,
      onOk: () =>
        handleModalOk({
          newRegisterFlag,
          moreOneStepFlag,
          supplierInfo: isEmpty(partnerVOS) ? {} : partnerVOS[0],
        }),
    });
  };

  // 供应商录入弹框
  const supplierEntering = useCallback(() => {
    supplierEnteringModal = Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 400 },
      className: styles.createModal,
      bodyStyle: {
        padding: 0,
        overflow: 'hidden',
      },
      title: intl.get('hzero.common.button.create').d('新建'),
      children: (
        <Fragment>
          <Alert
            banner
            showIcon
            closable
            type="info"
            iconType="help"
            className={styles.supEntryAlert}
            message={intl
              .get('sslm.supplierEntry.view.alert.createWarning')
              .d(
                '请正确完整地填写真实有效的企业关键信息以查询企业是否已在平台认证，若查询无结果则直接进入录入页面，在预录入内容的基础上维护其他信息，预录入的内容不允许变更。'
              )}
          />
          <CreateForm dataSet={supplierEnteringDs} />
        </Fragment>
      ),
      onOk: async () => {
        const formValues = supplierEnteringDs.current.toData();
        const checkResult = await supplierEnteringDs.validate();
        if (checkResult) {
          const payload = {
            ...formValues,
            checkFlag: true,
          };
          return createEntryForm(payload).then(res => {
            if (getResponse(res)) {
              const { terminationFlag = false, changeReqId } = res;
              if (!terminationFlag) {
                history.push({
                  pathname: `/sslm/supplier-entry/detail/${changeReqId}/create`,
                });
              } else {
                // 存在唯一认证，操作指引
                handleOperateGuide(res);
                return false;
              }
            } else {
              return false;
            }
          });
        } else {
          return false;
        }
      },
      afterClose: () => {
        supplierEnteringDs.reset();
      },
    });
  }, [supChange]);

  // 菜单回调
  const handleOverlayClick = useCallback(
    event => {
      const { router, value } = event.item.props;
      switch (value) {
        case 'srm.mdm.firm-info-change':
          enterpriseChange();
          break;
        case 'srm.partner.my-partner.supplier-inform-change':
          supplierChange();
          break;
        case 'srm.partner.my-partner.supplier-warehouse':
          simpleSupplier();
          break;
        case 'srm.partner.my-partner.supplier-entering':
          supplierEntering();
          break;
        default:
          history.push({
            pathname: router,
          });
          break;
      }
    },
    [supChange]
  );

  // 关联单据回调
  let _modal;
  const relationDocuments = record => {
    const { data = {} } = record;
    // 将当前record存入window中，便于二开取行上参数
    window.sslmRecord = record;
    if (_modal) {
      _modal.update({
        children: (
          <RelationBills
            currentRow={data}
            custLoading={custLoading}
            customizeTable={customizeTable}
            customizeTabPane={customizeTabPane}
            defaultActiveKey={relationActiveKey}
            menuPermissions={menuPermissions}
            platformSupplierRemote={platformSupplierRemote}
          />
        ),
      });
    } else {
      _modal = Modal.open({
        mask: false,
        drawer: true,
        closable: false,
        key: 'relation',
        style: { width: 1000 },
        okCancel: false,
        destroyOnClose: true,
        className: styles.relationModal,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get('sslm.workbench.model.platformSupplier.relationDocuments').d('关联单据'),
        children: (
          <RelationBills
            currentRow={data}
            custLoading={custLoading}
            customizeTable={customizeTable}
            customizeTabPane={customizeTabPane}
            defaultActiveKey={relationActiveKey}
            menuPermissions={menuPermissions}
            platformSupplierRemote={platformSupplierRemote}
          />
        ),
        onOk: () => {
          _modal = null;
        },
        onClose: () => {
          _modal = null;
        },
      });
    }
  };

  // tab改变时的回调
  const handleTabChange = key => {
    Modal.destroyAll();
    setCurrentKey(key);
    // eslint-disable-next-line no-param-reassign
    mixObj.currentKey = key;
  };

  // 供应商维度切换回调
  const supplierDimensionChange = value => {
    setSupplierDimension(value);
    // eslint-disable-next-line no-param-reassign
    mixObj.supplierDimension = value;
    // 维度切换 重新初始化ds，不然个性化配置显示有问题
    // eslint-disable-next-line no-param-reassign
    mixObj.platformSupplierListDs = new DataSet(getPlatformSupplierListDS());
  };

  const btnGroupUnitCode = useMemo(
    () =>
      isPlatform
        ? supplierDimension === 'SUPPLIER'
          ? 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.BTN_GROUP'
          : 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.CATEGORY_BTN_GROUP'
        : 'SSLM.SUPPLIER_WORKBENCH_LOCAL.BTN_GROUP',
    [isPlatform, supplierDimension]
  );

  // 导入 ture为本地供应商导入 false为平台供应商导入
  const handleImport = useCallback(
    flag => {
      const code = flag ? 'SSLM.BATCH_IMPORT_ERP' : 'SPFM.ORG_COMPANY.IMPORT';
      const { pathname } = location;
      const othersSearch = {};
      if (routerParams.defaultTabIndex) {
        othersSearch.defaultTabIndex = currentKey;
      }
      const search = querystring.stringify({
        ...routerParams,
        ...othersSearch,
      });
      history.push({
        pathname: `/sslm/supplier-workbench/local-import/${code}`,
        search: querystring.stringify({
          action: intl.get('hzero.common.title.batchImport').d('批量导入'),
          backPath: `${pathname}?${search}`,
          dataImportButton: flag, // 是否隐藏数据导入按钮
        }),
      });
    },
    [currentKey]
  );

  // 获取导出参数
  const getExportParams = useCallback(() => {
    let queryParams = {};
    // 平台供应商导出参数
    if (isPlatform) {
      const params = currentSearchBarRef.getQueryParameter();
      queryParams = params;
    } else {
      // 本地供应商导出参数
      const params =
        localSupplierListDs.queryDataSet && localSupplierListDs.queryDataSet.current.toData();
      const { __dirty, ...others } = params;
      queryParams = others;
    }
    return filterNullValueObject(queryParams);
  }, [isPlatform, currentSearchBarRef]);

  // 批量更新单据供应商数据
  const batchUpdateSupplier = useCallback(() => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.workbench.model.confirm.batchUpdateSupplierDataMsg')
        .d(
          '请确认是否批量将历史单据中平台/本地供应商为空的数据更新为当前最新关联的平台和本地供应商。'
        ),
      onOk: () => {
        return batchUpdateSupplierData().then(response => {
          const res = getResponse(response);
          if (res) {
            localSupplierListDs.query();
          }
        });
      },
    });
  }, []);

  // 获取头按钮
  const headerBtns = getHeaderBtns({
    guideRef,
    valueList,
    isPlatform,
    dispatch,
    createMenus,
    inviteManage,
    handleImport,
    getExportParams,
    supplierDimension,
    createMenusLodaing,
    handleOverlayClick,
    batchUpdateSupplier,
  });

  return (
    <ModalProvider location={location}>
      <Header title={intl.get('sslm.workbench.view.title.supplierWorkbench').d('供应商管理工作台')}>
        {customizeBtnGroup(
          {
            code: btnGroupUnitCode,
            pro: true,
          },
          <DynamicButtons
            maxNum={5}
            trigger="hover"
            defaultBtnType="c7n-pro"
            buttons={headerBtns}
            key={btnGroupUnitCode}
            unitCode={btnGroupUnitCode}
            permissions={btnsPermissions}
          />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SSLM.SUPPLIER_WORKBENCH.LIST_TABS',
            custDefaultActive: key => handleTabChange(key || currentKey),
          },
          <Tabs activeKey={currentKey} onChange={handleTabChange} className={styles.workbenchTab}>
            <TabPane
              showCount={false}
              key="platformSupplier"
              tab={intl.get('sslm.workbench.view.tab.platformSupplier').d('平台供应商')}
            >
              <PlatformSupplier
                code={valueList}
                supChange={supChange}
                custLoading={custLoading}
                customizeTable={customizeTable}
                supplierChange={supplierChange}
                onSearchBarRef={onSearchBarRef}
                supplierDimension={supplierDimension}
                lifecycleWorkbench={lifecycleWorkbench}
                onRelationDocuments={relationDocuments}
                supplierDimensionChange={supplierDimensionChange}
                platformSupplierListDs={platformSupplierListDs}
                queryPlatformSupplier={queryPlatformSupplier}
                menuPermissionsFlag={purchaserInvestig}
                remote={platformSupplierRemote}
              />
            </TabPane>
            <TabPane
              showCount={false}
              key="localSupplier"
              tab={intl.get('sslm.workbench.view.tab.localSupplier').d('本地供应商')}
            >
              <LocalSupplier
                custLoading={custLoading}
                customizeTable={customizeTable}
                customizeForm={customizeForm}
                permissionFlag={permissionFlag}
                localSupplierListDs={localSupplierListDs}
                getHocInstance={getHocInstance}
                remote={platformSupplierRemote}
              />
            </TabPane>
          </Tabs>
        )}
      </Content>
    </ModalProvider>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'spcm.common',
      'sslm.sample',
      'entity.company',
      'sslm.workbench',
      'spfm.supplier',
      'spfm.common',
      'sslm.supplierInform',
      'sslm.enterpriseInform',
      'sslm.supplierWarehouse',
      'spcm.purchaseContractView',
      'sslm.purchaserEvaluationDetail',
      'sslm.siteInvestigateReport',
      'spfm.certificationApproval',
      'sslm.supplierLifePolicyConfig',
      'sslm.evaluationQuery',
      'ssrc.inquiryHall',
      'ssrc.bidHall',
      'sqam.common',
      'spfm.companySearch',
      'spfm.importErp',
      'spfm.bank',
      'sslm.material',
      'sslm.supplierEntry',
      'sslm.purchaserEvaluation',
      'sslm.eventRecord',
      'sqam.ppap',
    ],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.LIST',
      'SSLM.SUPPLIER_WORKBENCH_PLATFORM.LIST',
      'SSLM.SUPPLIER_WORKBENCH_PLATFORM.CATEGORY.LIST',
      'SSLM.SUPPLIER_WORKBENCH_PLATFORM.RELATED_DOC',
      'SSLM.SUPPLIER_WORKBENCH_PLATFORM.BTN_GROUP',
      'SSLM.SUPPLIER_WORKBENCH_PLATFORM.CATEGORY_BTN_GROUP',
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.BTN_GROUP',
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.BASE_INFO',
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.CONTACTS',
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.ADDRESS',
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.BANK_ACCT',
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.SUPPLIER_SITE',
      'SSLM.SUPPLIER_WORKBENCH.LIST_TABS',
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.PURCHASE_HEADER',
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.PURCHASE_LINE',
      'SSLM.SUPPLIER_WORKBENCH_LOCAL.CARDS',
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.QUESTIONNAIRE', // 关联单据-调查表
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SAMPLE', // 关联单据-送样申请
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SITE_INSPECTION', // 关联单据-现场考察
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALUATION', // 关联单据-绩效考评
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVAL_EVENT', // 关联单据-考评事件
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALUATION_REPORT', // 关联单据-供应商评估
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SUPPLIER_CHANGE_TABLE',
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.INQUIRY_LIST', // 关联单据-询价单
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.BID_LIST', // 关联单据-招投标
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.MATERIAL_LIST', // 关联单据-物料认证
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.AGREEMENT_LIST', // 关联单据-协议
      'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.RECTIFY_LIST', // 关联单据-整改单
    ],
  }),
  remote(
    {
      code: 'SSLM_PLATFORM_SUPPLIER_DEFINITION', // Expose编码
      name: 'platformSupplierRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxHandleUpdateSupplierWarehouse() {}, // 本地供应商变更信息
        cuxHandleCreateSupplierWarehouse() {}, // 本地供应商新建单据信息
        cuxHandleViewLocalSupplierInfo() {}, // 查看本地供应商信息
      },
    }
  ),
  withProps(
    props => {
      const { platformSupplierRemote } = props;
      const platformDsProps = platformSupplierRemote
        ? platformSupplierRemote.process(
            'SSLM_PLATFORM_SUPPLIER_DEFINITION_PLATFORM_SUPPLIER_DS_PROPS',
            getPlatformSupplierListDS()
          )
        : getPlatformSupplierListDS();
      const platformSupplierListDs = new DataSet(platformDsProps);
      const localSupplierListDs = new DataSet(getLocalSupplierListDS());
      const mixObj = {
        currentKey: 'platformSupplier',
        supplierDimension: 'SUPPLIER',
        platformSupplierListDs, // 解决切换维度时个性化配置不能正常显示问题
      };
      return { localSupplierListDs, mixObj };
    },
    { cacheState: true }
  )
)(Workbench);
