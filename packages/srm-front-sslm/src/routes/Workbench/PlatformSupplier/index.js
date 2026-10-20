/* eslint-disable react/jsx-indent */
/**
 * PlatformSupplier - 本地供应商
 * @date: 2021-04-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import classNames from 'classnames';
import { withRouter } from 'dva/router';
import querystring from 'querystring';
import { connect } from 'dva';
import { Tooltip } from 'choerodon-ui';
import { isUndefined, compose, isArray } from 'lodash';
import React, { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import { SelectBox, Modal, DataSet, Spin, Dropdown, Icon, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { Button as PermissionButton } from 'components/Permission';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import {
  getResponse,
  getCurrentUserId,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import ExcelExportPro from 'components/ExcelExportPro';

import {
  tableMaxHeight,
  tableHeight,
  renderThirdServiceAuthStatus,
  downLoadFile,
} from '@/routes/components/utils';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { checkPermission } from 'services/api';
import { riskScan } from '@/routes/LifeCycleManage/utils';
import { openRelationChart } from '@/routes/components/EnterpriseRelationSearch';
import {
  // riskEmbedPage,
  saveGroup,
  fetchLineType,
  queryRiskMonitorType,
  handleQCCAddMonitor,
  verifySupplierLife,
} from '@/services/workbenchService';
import { renderMenus } from '../utils';
import styles from '../index.less';

import ApplyStrategy from './ApplyStrategy';
import LifeCycleHistory from './LifeCycleHistory';
import RiskHistory from './components/RiskHistory';

const { Option } = SelectBox;

const useId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();

// 聚合视图icon切换
// const wideSelected = require('@/assets/wide.svg');
// const wideUnselected = require('@/assets/wide-black.svg');
// 生命周期阶段升降级icon
const upgradeIcon = require('@/assets/upgrade.svg');
const degradeIcon = require('@/assets/degrade.svg');

// 行菜单
const LineMenus = ({ record, onClick }) => {
  const [menuList, setMenuList] = useState([]);
  useEffect(() => {
    const { stageId, gradeType, supplyStatus, stageCode, itemCategoryId } = record.get([
      'stageId',
      'gradeType',
      'supplyStatus',
      'stageCode',
      'itemCategoryId',
    ]);
    fetchLineType({ stageId, gradeType, supplyStatus, stageCode, itemCategoryId }).then(
      response => {
        const res = getResponse(response);
        if (res) {
          setMenuList(res);
        }
      }
    );
  }, []);

  return renderMenus({ menus: menuList, isGroup: true, onItemClick: onClick });
};

const PlatformSupplier = props => {
  const [aggregation, setAggregation] = useState(true);
  const [permissionObj, setPermissionObj] = useState({});
  const {
    code,
    history,
    custLoading,
    customizeTable,
    supplierChange,
    supplierDimension,
    supplierDimensionChange,
    platformSupplierListDs,
    queryPlatformSupplier,
    onSearchBarRef,
    location,
    onRelationDocuments,
    primaryColor = '#29BECE',
    lifecycleWorkbench,
    supChange,
    remote,
  } = props;
  const customizeUnitCode = useMemo(
    () =>
      supplierDimension === 'SUPPLIER'
        ? 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.LIST'
        : 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.CATEGORY.LIST',
    [supplierDimension]
  );
  const searchBarKey = useMemo(() => (supplierDimension === 'SUPPLIER' ? 'SUPPLIER' : 'ITEM'), [
    supplierDimension,
  ]);
  const searchBarCode = useMemo(
    () =>
      supplierDimension === 'SUPPLIER'
        ? 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.SEARCH_BAR'
        : 'SSLM.SUPPLIER_WORKBENCH_PLATFORM.SUP_IT_SEARCH_BAR',
    [supplierDimension]
  );
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const {
    companyId: newCompanyId,
    companyName: newCompanyName,
    supplierCompanyId: newSupplierCompanyId,
    supplierCompanyName: newSupplierCompanyName,
    supplierNameAndNum,
  } = routerParams;

  useEffect(() => {
    handlPermissionButton();
  }, []);

  // 斯瑞德 -- 加入监控回调
  const handleSRDAddMonitor = record => {
    const { data: { supplierCompanyId } = {} } = record;
    // options ds
    const optionsDs = new DataSet({
      autoQuery: true,
      transport: {
        read: {
          url: `${SRM_SSLM}/v1/${organizationId}/monitor-group`,
          method: 'GET',
          params: {},
        },
      },
    });
    // 分组ds
    const groupDs = new DataSet({
      fields: [
        {
          name: 'group',
          multiple: true,
          textField: 'monitorGroupName',
          valueField: 'monitorGroupId',
          options: optionsDs,
        },
      ],
    });
    Modal.open({
      drawer: true,
      closable: true,
      mask: false,
      key: 'choiceGroup',
      title: intl.get('spfm.supplier.model.supplier.platform.choiceGroup').d('选择分组'),
      children: (
        <Spin dataSet={optionsDs}>
          <div>
            {intl
              .get('spfm.supplier.model.supplier.platform.drawerTitleNotic')
              .d('请为您的供应商选择分组（至少选择一个）')}
            ：
          </div>
          <SelectBox dataSet={groupDs} vertical name="group" className={styles.groupSelectBox} />
        </Spin>
      ),
      onOk: () => {
        const data = (groupDs.current && groupDs.current.toJSONData()) || {};
        if (isUndefined(data.group)) {
          notification.warning({
            message: intl
              .get('spfm.supplier.model.supplier.platform.selectOneGroup')
              .d('至少选择一个分组！'),
          });
        } else {
          Modal.confirm({
            children: intl
              .get(`spfm.supplier.model.supplier.platform.confirmMessage`)
              .d('加入监控将会扣除监控额度，是否确认加入？'),
            onOk: async () => {
              await saveGroup({
                resultGroup: data.group,
                supplierDTO: [supplierCompanyId],
                isPlatformEnterprise: 1,
              }).then(response => {
                const res = getResponse(response);
                if (res) {
                  Modal.destroyAll();
                  notification.success();
                  platformSupplierListDs.query();
                }
              });
            },
          });
        }
        return false;
      },
    });
  };

  // 企查查 -- 加入监控回调
  const handlePartnerAddMonitor = async record => {
    const { data: { supplierCompanyId } = {} } = record;
    Modal.confirm({
      children: intl
        .get(`spfm.supplier.model.supplier.platform.confirmMessage`)
        .d('加入监控将会扣除监控额度，是否确认加入？'),
      onOk: async () => {
        await handleQCCAddMonitor({ supplierCompanyId }).then(response => {
          const res = getResponse(response);
          if (res) {
            Modal.destroyAll();
            notification.success();
            platformSupplierListDs.query();
          }
        });
      },
    });
  };

  // 加入监控
  const handleAddMonitor = async record => {
    const riskMonitorTypeResult = getResponse(await queryRiskMonitorType({ type: 'ADD_MONITOR' }));
    if (riskMonitorTypeResult) {
      const { partnerCode: riskMonitorType } = riskMonitorTypeResult;
      if (riskMonitorType === 'SRD') {
        handleSRDAddMonitor(record);
      }
      if (riskMonitorType === 'ZHENYUN_PARTNER') {
        handlePartnerAddMonitor(record);
      }
    }
  };

  // 生命周期升降级申请单跳转
  const handleApplication = record => {
    const {
      data: {
        gradeType,
        processStatus,
        degradeEditPath,
        upgradeEditPath,
        lifeCycleId,
        supplierCompanyId,
        itemCategoryId,
        abilityLineId,
        dimensionCode,
        documentType,
        requisitionId,
      } = {},
    } = record;
    const queryParams = filterNullValueObject({
      lifeCycleId: dimensionCode === 'GROUP' ? undefined : lifeCycleId,
      supplierCompanyId,
      itemCategoryId,
      abilityLineId,
    });
    const dimensionPath = gradeType === 'UPGRADE' ? upgradeEditPath : degradeEditPath;
    if (documentType) {
      const isEdit = ['NEW', 'REJECTED'].includes(processStatus);
      history.push({
        pathname: `/sslm/life-cycle-manage/${isEdit ? 'detail' : 'read'}`,
        search: querystring.stringify({
          requisitionId,
          documentType,
        }),
      });
    } else {
      history.push(`${dimensionPath}?${querystring.stringify(queryParams)}`);
    }
  };

  // 查看生命周期历史
  const viewLifeCycleHistory = record => {
    Modal.open({
      // mask: false,
      drawer: true,
      okCancel: false,
      style: { width: 380 },
      key: 'lifeCycleHistory',
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sslm.workbench.model.platformSupplier.lifeCycleHistory').d('生命周期历史'),
      children: <LifeCycleHistory record={record} />,
    });
  };

  // 适用策略查看
  const viewApplyStrategy = useCallback(record => {
    const { strategyName, versionNumber } = record.get(['strategyName', 'versionNumber']);
    const curVersion = intl
      .get('sslm.common.view.version', {
        name: versionNumber,
      })
      .d(`版本${versionNumber}`);
    Modal.open({
      drawer: true,
      okCancel: false,
      style: { width: 1200 },
      key: 'lifeCycleHistory',
      bodyStyle: { background: '#F7F8FA', padding: 0 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: strategyName
        ? intl
            .get('sslm.common.model.title.applyStrategy', {
              strategyName,
              versionNumber: curVersion,
            })
            .d(`适用策略-${strategyName}-${curVersion}`)
        : intl.get('sslm.workbench.model.platformSupplier.applyStrategy').d('适用策略'),
      children: <ApplyStrategy record={record} />,
    });
  }, []);

  // 新建生命周期申请单
  const createApplication = (menuParams, record) => {
    // 起始阶段
    const {
      data: {
        stageId,
        strategyId,
        companyId,
        stageOrderSeq,
        stageCode,
        lifeCycleId,
        supplierCompanyId,
        itemCategoryId,
        abilityLineId,
        dimensionCode,
      },
    } = record;
    // 目标阶段
    const {
      orderSeq,
      parentValue,
      stageCode: targetStageCode,
      stageId: toStageId,
      degradeEditPath,
      upgradeEditPath,
    } = menuParams;
    // 判断升降级
    const isUpgrade = stageCode === 'ELIMINATED' ? true : orderSeq >= stageOrderSeq;
    const isDegrade = targetStageCode === 'ELIMINATED';
    const gradeType = isDegrade ? 'DEGRADE' : isUpgrade ? 'UPGRADE' : 'DEGRADE';

    const queryParams = filterNullValueObject({
      toStageId,
      lifeCycleId: dimensionCode === 'GROUP' ? undefined : lifeCycleId,
      supplierCompanyId,
      itemCategoryId,
      abilityLineId,
    });
    const dimensionPath = gradeType === 'UPGRADE' ? upgradeEditPath : degradeEditPath;
    verifySupplierLife({
      strategyId,
      toStageId,
      stageId,
      supplierCompanyId,
      companyId: dimensionCode === 'COMPANY' ? companyId : null,
      documentType: parentValue,
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        if (lifecycleWorkbench) {
          // 跳转新生命周期
          history.push({
            pathname: '/sslm/life-cycle-manage/create',
            search: querystring.stringify({
              toStageId,
              companyId,
              supplierCompanyId,
              documentType: parentValue,
            }),
          });
        } else {
          history.push(`${dimensionPath}?${querystring.stringify(queryParams)}`);
        }
      }
    });
  };

  // 新建供货能力清单定义
  const createSupplyAbility = (queryParams, record) => {
    const { data: { supplyAbilityId } = {} } = record;
    if (supplyAbilityId) {
      history.push(`/sslm/supplier-ablility-definition/detail/${supplyAbilityId}`);
    } else {
      history.push({
        pathname: '/sslm/supplier-ablility-definition/create',
        search: queryParams,
      });
    }
  };

  // 行菜单回调
  const lineOverlayClick = useCallback(
    ({ item }, record) => {
      const { data: { companyId, supplierCompanyId } = {} } = record;
      const { router, value, menuParams } = item.props;
      const queryParams = querystring.stringify(
        filterNullValueObject({ companyId, supplierCompanyId })
      );
      if (value === 'srm.partner.my-partner.supplier-inform-change') {
        supplierChange(record);
      } else if (value.match('srm.partner.suplier-lifecycle.management')) {
        createApplication(menuParams, record);
      } else if (value === 'srm.partner.suplier-ability.supply-ability-define') {
        createSupplyAbility(queryParams, record);
      } else {
        history.push({
          pathname: router,
          search: queryParams,
        });
      }
    },
    [lifecycleWorkbench, supChange]
  );

  // 查询账户管理按钮权限集
  const handlPermissionButton = useCallback(() => {
    checkPermission([
      'srm.partner.my-partner.supplier-workbench.ps.sales.management',
      'srm.partner.my-partner.supplier-workbench.ps.conditionauthfilter',
    ]).then(response => {
      const res = getResponse(response);
      if (res && isArray(res)) {
        const salesManagement = res.find(
          i => i.code === 'srm.partner.my-partner.supplier-workbench.ps.sales.management'
        ).approve;
        const applyStrategy = res.find(
          i => i.code === 'srm.partner.my-partner.supplier-workbench.ps.conditionauthfilter'
        ).approve;
        setPermissionObj({
          salesManagement,
          applyStrategy,
        });
      }
    });
  }, []);

  const handleDownloadReport = fileUrl => {
    if (!fileUrl) {
      return;
    }
    const url = downLoadFile({ tenantId: organizationId, attachmentUrl: fileUrl });
    window.open(url);
  };

  const handleRiskHistory = useCallback(record => {
    Modal.open({
      drawer: true,
      okCancel: false,
      style: { width: 520 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sslm.workbench.model.platformSupplier.riskHistory').d('风险扫描历史'),
      children: <RiskHistory record={record} />,
    });
  }, []);

  const getExportQueryParams = record => {
    let param = {};
    if (record) {
      const { supplierCompanyId, companyId } = record.get(['companyId', 'supplierCompanyId']) || {};
      param = {
        supplierCompanyId,
        companyId,
      };
    }
    return param;
  };

  const cols = [
    {
      key: 'partners',
      align: 'left',
      aggregation: true,
      header: intl.get('sslm.workbench.model.platformSupplier.partners').d('合作伙伴'),
      children: [
        {
          name: 'supplierCompanyName',
          width: 200,
          renderer: ({ record, value }) =>
            value ? <a onClick={() => handleSupplierDetail(record.data, true)}>{value}</a> : '-',
        },
        {
          name: 'companyName',
          width: 200,
        },
        permissionObj.salesManagement && {
          name: 'sailorAccountManage',
          width: 120,
          renderer: ({ record }) => {
            const { data: { tenantId, supplierTenantId, supplierCompanyId } = {} } = record;
            return (
              <Fragment>
                <PermissionButton
                  type="text"
                  onClick={() => {
                    // 判断供应商和公司是否为同一租户下
                    if (tenantId === supplierTenantId) {
                      notification.warning({
                        message: intl
                          .get(`sslm.workbench.view.message.accountManageWarning`)
                          .d(
                            '当前供应商为内部供应商，请至本租户下的【子账户管理】功能管理销售员的权限控制'
                          ),
                      });
                    } else {
                      history.push({
                        pathname: `/hiam/supplier-account-manage`,
                        search: querystring.stringify({
                          supplierTenantId,
                          supplierCompanyId,
                        }),
                      });
                    }
                  }}
                  permissionList={[
                    {
                      code: `srm.partner.my-partner.supplier-workbench.ps.sales.management`,
                      type: 'button',
                      meaning: '平台供应商-供应商销售员管理',
                    },
                  ]}
                >
                  {intl.get('sslm.workbench.model.platformSupplier.accountManage').d('管理')}
                </PermissionButton>
              </Fragment>
            );
          },
        },
        {
          name: 'purchaseAgentNameJoint',
          width: 200,
        },
        {
          name: 'categoryDescriptions',
          width: 150,
        },
      ].filter(Boolean),
    },
    supplierDimension === 'ITEM' && {
      key: 'categoryOfMaterial',
      align: 'left',
      aggregation: true,
      header: intl.get('sslm.workbench.model.platformSupplier.categoryOfMaterial').d('品类物料'),
      children: [
        {
          name: 'categoryName',
          width: 150,
        },
        {
          name: 'itemName',
          width: 150,
        },
        {
          name: 'supplyFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'supplyStatus',
          width: 100,
          renderer: ({ record, value }) => {
            const {
              data: { supplyStatusMeaning },
            } = record;
            return value ? (
              <span
                style={{
                  padding: '2px 4px',
                  borderRadius: '2px',
                  fontWeight: 700,
                  color: value === 'G' ? '#44b37d' : value === 'Y' ? '#f5b806' : '#f56649',
                  backgroundColor:
                    value === 'G' ? '#ecf7f1' : value === 'Y' ? '#fff6eb' : '#ffeeeb',
                }}
              >
                {supplyStatusMeaning}
              </span>
            ) : (
              '-'
            );
          },
        },
      ],
    },
    {
      key: 'baseInfo',
      align: 'left',
      aggregation: true,
      header: intl.get('sslm.workbench.model.platformSupplier.baseInfo').d('基本信息'),
      children: [
        {
          name: 'contactName',
          width: 120,
        },
        {
          name: 'contactPhone',
          width: 180,
          renderer: ({ record, value }) => {
            const {
              data: { internationalTelMeaning },
            } = record;
            if (internationalTelMeaning && value) {
              return `${internationalTelMeaning} ${value}`;
            } else {
              return value || '-';
            }
          },
        },
        {
          name: 'erpNum',
          width: 150,
        },
        {
          name: 'unifiedSocialCode',
          width: 160,
        },
        {
          name: 'businessRegistrationNumber',
          width: 150,
        },
        {
          name: 'dunsCode',
          width: 120,
        },
      ],
    },
    {
      key: 'lifeCycle',
      align: 'left',
      aggregation: true,
      header: intl.get('sslm.workbench.model.platformSupplier.lifeCycle').d('生命周期'),
      children: [
        {
          name: 'stageDescription',
          width: 120,
          renderer: ({ record, value }) => {
            const { data: { gradeType, stageDescription, toStageDescription } = {} } = record;
            return gradeType && gradeType !== 'NO' ? (
              <span>
                {stageDescription}
                <img
                  alt=""
                  style={{ margin: '0 2px' }}
                  src={gradeType === 'UPGRADE' ? upgradeIcon : degradeIcon}
                />
                {toStageDescription}
              </span>
            ) : (
              value
            );
          },
        },
        {
          name: 'gradeTypeMeaning',
          width: 100,
          renderer: ({ record, value }) => {
            const { createdBy, processStatus, documentType } = record.get([
              'createdBy',
              'processStatus',
              'documentType',
            ]);
            if (value) {
              const isEdit = documentType
                ? ['NEW', 'REJECTED'].includes(processStatus)
                : createdBy === useId
                ? ['NEW', 'REJECTED', 'SCORED'].includes(processStatus)
                : false;
              return (
                <a onClick={() => handleApplication(record)}>
                  {isEdit
                    ? intl.get('sslm.common.view.message.editApplication').d('编辑申请单')
                    : intl.get('sslm.common.view.message.search').d('查看申请单')}
                </a>
              );
            } else {
              return '-';
            }
          },
        },
        {
          name: 'lifeCycleHistory',
          width: 120,
          renderer: ({ record }) => (
            <a onClick={() => viewLifeCycleHistory(record)}>
              {intl.get('sslm.common.view.message.view').d('查看')}
            </a>
          ),
        },
        permissionObj.applyStrategy && {
          name: 'applyStrategy',
          width: 100,
          renderer: ({ record }) => {
            const strategyId = record.get('strategyId');
            return strategyId ? (
              <a onClick={() => viewApplyStrategy(record)}>
                {intl.get('sslm.common.view.message.view').d('查看')}
              </a>
            ) : (
              '-'
            );
          },
        },
        {
          name: 'dimensionCode',
          width: 120,
        },
      ].filter(Boolean),
    },
    {
      name: 'documentsManage',
      width: 280,
      renderer: ({ record }) => {
        // 新建单据是否展示
        const addDocumentsFlag = remote.process(
          'SSLM_PLATFORM_SUPPLIER_DEFINITION.ADD_DOCS',
          true,
          { record }
        );
        return (
          <Fragment>
            <PermissionButton
              type="text"
              onClick={() => onRelationDocuments(record)}
              style={{ marginRight: 16, display: aggregation ? 'block' : 'inline' }}
              permissionList={[
                {
                  code: `srm.partner.my-partner.supplier-workbench.ps.supplier.button.link-doc`,
                  type: 'button',
                  meaning: '平台供应商-关联单据',
                },
              ]}
            >
              {intl.get('sslm.workbench.model.platformSupplier.relationDocuments').d('关联单据')}
            </PermissionButton>
            <ExcelExportPro
              queryParams={() => getExportQueryParams(record)}
              requestUrl={`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/supplier/document/export-new`}
              templateCode="SRM_C_SRM_SPFM_PARTNER_DOCUMENT"
              buttonText={intl
                .get('sslm.common.model.common.relationDocumentExport')
                .d('关联单据导出')}
              otherButtonProps={{
                type: 'text',
                icon: '',
                style: { marginRight: 16, display: aggregation ? 'block' : 'inline' },
                className: styles['sslm-workbench-table-export'],
              }}
            />
            <Dropdown
              overlay={<LineMenus record={record} />}
              onOverlayClick={e => lineOverlayClick(e, record)}
            >
              <PermissionButton
                type="text"
                hidden={!addDocumentsFlag}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.supplier-workbench.ps.supplier.button.create-doc`,
                    type: 'button',
                    meaning: '平台供应商-新建单据',
                  },
                ]}
              >
                {intl.get('sslm.workbench.view.button.addDocuments').d('新建单据')}
                <Icon type="expand_more" style={{ fontSize: 16, marginLeft: 4, marginTop: -2 }} />
              </PermissionButton>
            </Dropdown>
          </Fragment>
        );
      },
    },
    {
      key: 'riskManages',
      align: 'left',
      aggregation: true,
      header: intl.get('sslm.workbench.model.platformSupplier.riskManage').d('风险管理'),
      children: [
        {
          name: 'joinMonitor',
          width: 180,
          renderer: ({ record }) => {
            return (
              <PermissionButton type="text" onClick={() => handleAddMonitor(record)}>
                {intl.get('sslm.workbench.model.platformSupplier.isMonitor').d('加入监控')}
              </PermissionButton>
            );
          },
        },
        {
          name: 'riskScanning',
          width: 180,
          renderer: ({ record }) => {
            return (
              <PermissionButton type="text" onClick={() => riskScan(record, false, true)}>
                {intl.get('sslm.workbench.model.platformSupplier.isScan').d('风险扫描')}
              </PermissionButton>
            );
          },
        },
        {
          name: 'riskHistory',
          width: 120,
          renderer: ({ record }) => {
            return (
              <PermissionButton type="text" onClick={() => handleRiskHistory(record)}>
                {intl.get('sslm.common.view.message.view').d('查看')}
              </PermissionButton>
            );
          },
        },
        {
          name: 'riskScanDate',
          width: 130,
        },
        {
          name: 'riskLevelMeaning',
          width: 120,
        },
        {
          name: 'fileUrl',
          width: 120,
          renderer: ({ record }) => {
            const fileUrl = record.get('fileUrl');
            if (!fileUrl) {
              return '-';
            }
            return (
              <a
                onClick={() => {
                  handleDownloadReport(fileUrl);
                }}
              >
                {intl.get('sslm.common.view.message.riskReport').d('风险报告')}
              </a>
            );
          },
        },
      ],
    },
    supplierDimension === 'SUPPLIER' && {
      key: 'electronicAuthStatus',
      align: 'left',
      aggregation: true,
      header: intl
        .get('sslm.common.model.supplier.platform.thirdServiceAuthStatus')
        .d('电子签章认证状态'),
      children: [
        {
          name: 'thirdServiceAuthStatus',
          width: 150,
          renderer: ({ record }) => {
            const data = record.toData();
            return renderThirdServiceAuthStatus(data);
          },
        },
      ],
    },
    {
      key: 'relationSearchGroup',
      align: 'left',
      aggregation: true,
      header: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
      children: [
        {
          name: 'relationSearch',
          width: 120,
          renderer: ({ record }) => {
            const supplierCompanyName = record.get('supplierCompanyName');
            const domesticForeignRelation = record.get('domesticForeignRelation');
            return (
              <a
                onClick={() => {
                  openRelationChart({
                    domesticForeignRelation,
                    supplierCompanyName,
                    businessType: 'SUPPLIER_MANAGEMENT',
                  });
                }}
              >
                {intl.get('sslm.common.view.common.relationSearch').d('关系排查')}
              </a>
            );
          },
        },
        {
          name: 'latestCheckTime',
          width: 160,
        },
        {
          name: 'latestCheckFileUrl',
          width: 160,
          renderer: ({ record }) => {
            const latestCheckFileUrl = record.get('latestCheckFileUrl');
            if (!latestCheckFileUrl) {
              return '-';
            }
            return (
              <a
                onClick={() => {
                  handleDownloadReport(latestCheckFileUrl);
                }}
              >
                {intl.get('sslm.common.view.common.latestRelationReport').d('最新关系排查报告')}
              </a>
            );
          },
        },
      ],
    },
  ].filter(Boolean);
  const columns = remote
    ? remote.process('SSLM_PLATFORM_SUPPLIER_DEFINITION_PLATFORM_SUPPLIER_COLUMNS', cols)
    : cols;

  // 平铺聚合改变时的回调
  const onAggregationChange = newAggregation => {
    setAggregation(newAggregation);
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(() => {
    const { dimensionList = [] } = code;
    return (
      <Select
        clearButton={false}
        value={supplierDimension}
        onChange={supplierDimensionChange}
        suffix={<Icon type="expand_more" style={{ marginLeft: -20 }} />}
      >
        {dimensionList.map(item => (
          <Option value={item.value}>{item.meaning}</Option>
        ))}
      </Select>
    );
  }, [code, supplierDimension]);

  // 筛选器右侧渲染
  const renderRightSearchBar = useCallback(() => {
    return (
      <div className={styles.search}>
        <Tooltip title={intl.get('sslm.common.model.flatTableView').d('平铺表视图')}>
          <div
            onClick={() => onAggregationChange(false)}
            className={classNames(styles['view-wrap'], { [styles.active]: !aggregation })}
          >
            <Icon
              type="view_headline"
              style={{ fontSize: 16, color: !aggregation ? primaryColor : '#000' }}
            />
          </div>
        </Tooltip>
        <Tooltip title={intl.get('sslm.common.model.aggregateTableView').d('聚合表视图')}>
          <div
            onClick={() => onAggregationChange(true)}
            className={classNames(styles['view-wrap'], { [styles.active]: aggregation })}
          >
            <Icon
              type="view_day"
              style={{ fontSize: 16, color: aggregation ? primaryColor : '#000' }}
            />
          </div>
        </Tooltip>
      </div>
    );
  }, [aggregation]);

  // 获取FieldProps
  const getFieldProps = useCallback(() => {
    const fieldProps = {
      categoryIdStr: {
        lovPara: { enabledFlag: 1 },
      },
    };
    if (newSupplierCompanyId) {
      fieldProps.supplierCompanyId = {
        defaultValue: {
          supplierCompanyId: newSupplierCompanyId,
          supplierCompanyName: newSupplierCompanyName,
        },
      };
    }
    if (newCompanyId) {
      fieldProps.companyId = {
        defaultValue: {
          companyId: newCompanyId,
          companyName: newCompanyName,
        },
      };
    }
    if (supplierNameAndNum) {
      fieldProps.supplierNameAndNum = {
        defaultValue: supplierNameAndNum,
      };
    }
    return fieldProps;
  }, [newSupplierCompanyId, newSupplierCompanyName, newCompanyId, newCompanyName]);

  return (
    <div style={{ height: tableHeight.hasTab }}>
      {customizeTable(
        {
          code: customizeUnitCode,
          readOnly: true,
        },
        <SearchBarTable
          cacheState
          columns={columns}
          key={searchBarKey}
          custLoading={custLoading}
          aggregation={aggregation}
          dataSet={platformSupplierListDs}
          style={{ maxHeight: tableMaxHeight.hasTab }}
          onAggregationChange={onAggregationChange}
          searchBarRef={onSearchBarRef}
          searchCode={searchBarCode}
          searchBarConfig={{
            onQuery: queryPlatformSupplier,
            left: {
              render: renderLeftSearchBar,
            },
            right: {
              render: renderRightSearchBar,
            },
            fieldProps: getFieldProps(),
          }}
        />
      )}
    </div>
  );
};

export default compose(
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
  withRouter
)(PlatformSupplier);
