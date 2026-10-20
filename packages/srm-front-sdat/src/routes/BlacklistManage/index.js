/**
 * 供应商黑名单管理
 * @date: 2022-11-22
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import { DataSet, Modal, Button, Dropdown, Menu, Icon, Tabs } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';
import CommonImport from 'srm-front-boot/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getUrlParam } from '@/utils/utils';
import StaticSearchBar from '@/components/StaticSearchBar';
// import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import {
  fetchFreeQuota,
  saveBlackListLine,
  removeBlackListLine,
  // queryIfSubscribeRelationMap,
} from '@/services/supplierBlacklistService';

import { ReactExportButton } from './ReactExportButton';
import CustomizedTable from './CustomizedTable';

import { getBlackListDs, getBusinessListDS, getBlackRecordDS } from './store/supplierBlackListDS';
import { getQueryConfig } from './queryConfig';
import BusinessAddModal from './BusinessAddModal';
import ManualEntryModal from './ManualEntryModal';

import style from './index.less';

// const { Column } = Table;
const { TabPane } = Tabs;
const tenantId = getCurrentOrganizationId();
// const modalKey = Modal.key();
const ENTERPRISE_BLACKLIST = 'enterpriseBlacklist';
const BLACKLIST_MAP = 'blacklistMap';
const ENTERPRISE_PAY_FLAG = 0;
const BLACKLIST_MAP_PAY_FLAG = 1;
const ENTERPRISE_SEARCH_CODE = 'SDAT.SUPPLIER_BLACKLIST';
const BLACKLIST_MAP_SEARCH_CODE = 'SDAT.SUPPLIER_BLACKLIST_MAP';

const getFiltersByTabs = () => {
  const enterpriseFilters = getQueryConfig(false);
  const mapFilters = getQueryConfig(true);
  return {
    ...enterpriseFilters,
    [BLACKLIST_MAP_SEARCH_CODE]: mapFilters[ENTERPRISE_SEARCH_CODE],
  };
};

const exportRequestUrl = `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/blacklist-export`;

const removeOrgPmn = 'risk-workplace-supplier-blacklist-manage.api.remove-org'; // 移除企业权限集
const saveOrgPmn = 'risk-workplace-supplier-blacklist-manage.api.save-org'; // 保存权限集
const editOrgPmn = 'risk-workplace-supplier-blacklist-manage.api.edit-org'; // 编辑权限集
const viewMapPmn = 'risk-workplace-supplier-blacklist-manage.button.viewMap'; // 图谱查看权限集

function SupplierBlacklistManage(props = {}) {
  const { enterpriseBlackListDs, blacklistMapDs, businessListDs, blackRecordDS } = props.valueDs;
  const {
    customizeTable,
    customizeBtnGroup,
    history,
    location: { state: { _back } = {} },
  } = props;

  // const [isSubscribe, setIsSubscribe] = useState(true);
  const defaultActiveKey = _back === -1 ? BLACKLIST_MAP : ENTERPRISE_BLACKLIST;
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [backValue, setBackPath] = useState('');
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [quotaData, setQuotaData] = useState({});

  const [filters, setFilters] = useState(getFiltersByTabs());
  const currentBlackListDs = activeKey === BLACKLIST_MAP ? blacklistMapDs : enterpriseBlackListDs;
  const currentPayFlag = activeKey === BLACKLIST_MAP ? BLACKLIST_MAP_PAY_FLAG : ENTERPRISE_PAY_FLAG;

  const getQuotaConfig = () => {
    fetchFreeQuota({}).then((res) => {
      if (getResponse(res)) {
        if (res?.usedQuantity > res?.canUseQuantity) {
          setDisabledBtn(true);
          return; // 无限制
        }
        setQuotaData(res);
      }
    });
  };

  const refreshQuotaIfEnterprise = (payFlag) => {
    if (payFlag === ENTERPRISE_PAY_FLAG) {
      getQuotaConfig();
    }
  };

  const quotaCountComp = () => (
    <div className={style['quota-count']}>
      {quotaData?.usedQuantity ?? 0}/{quotaData?.canUseQuantity ?? 0}
    </div>
  );

  useEffect(() => {
    enterpriseBlackListDs.status = 'loading';
    blacklistMapDs.status = 'loading';

    const { backPath = '' } = getUrlParam() || {};
    setBackPath(backPath);

    // queryIfSubscribeRelationMap()
    //   .then(() => {
    //     setIsSubscribe(true);
    //   })
    //   .finally(() => {
    //     enterpriseBlackListDs.status = 'ready';
    //     blacklistMapDs.status = 'ready';
    //   });

    setFilters(getFiltersByTabs());
    refreshQuotaIfEnterprise(currentPayFlag);
  }, []);

  // useEffect(() => {
  //   setFilters({ ...getQueryConfig(isSubscribe) });
  // }, [isSubscribe]);

  const getQueryParamsByTab = (params = {}, tabKey = activeKey) => {
    const { addTime_range: rangeAddTime = '', updateTime_range: rangeUpdateTime = '' } = params;
    const [startDate = undefined, endDate = undefined] = rangeAddTime?.split(',') ?? [];
    const [graphStartDate = undefined, graphEndDate = undefined] =
      rangeUpdateTime?.split(',') ?? [];
    const queryParams = { ...params, startDate, endDate };
    if (tabKey === BLACKLIST_MAP) {
      queryParams.graphStartDate = graphStartDate;
      queryParams.graphEndDate = graphEndDate;
    }
    return queryParams;
  };

  const handleFilterQueryAll = ({ params }) => {
    const queryParams = getQueryParamsByTab(params);
    currentBlackListDs.queryParameter = queryParams;
    currentBlackListDs
      .query()
      .then(() => {
        setDisabledBtn(false);
      })
      .catch(() => {
        setDisabledBtn(true);
      });
  };

  const handleClear = () => {
    currentBlackListDs.queryParameter = {};
    currentBlackListDs
      .query()
      .then(() => {
        setDisabledBtn(false);
      })
      .catch(() => {
        setDisabledBtn(true);
      });
  };

  const handleChangeTabs = (key) => {
    setActiveKey(key);
  };

  /**
   * handleAddCompany: 点击头部添加企业按钮回调
   */
  const handleAddCompany = (type) => {
    let modal = null;

    const handleCloseModal = () => {
      currentBlackListDs.query();
      refreshQuotaIfEnterprise(currentPayFlag);
      modal.close();
    };

    const addBusiness = () => {
      currentBlackListDs.query();
      refreshQuotaIfEnterprise(currentPayFlag);
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.button.addBlackListBusiness').d('添加黑名单企业'),
      children: (
        <BusinessAddModal
          onAddBusiness={addBusiness}
          businessListDS={businessListDs}
          onClose={handleCloseModal}
          type={type}
          payFlag={currentPayFlag}
        />
      ),
      closable: true,
      drawer: true,
      // mask: false,
      fullScreen: true,
      style: { width: '1000px' },
      footer: null,
      afterClose: () => {
        currentBlackListDs.query();
        refreshQuotaIfEnterprise(currentPayFlag);
      },
    });
  };

  /**
   * handleEdit: 处理行编辑
   */
  const handleEdit = (record, dataSet = currentBlackListDs) => {
    // 为保证保存的逻辑, 当前行编辑时其他行要取消编辑
    // 检查是否有正在编辑的项目
    let editingRecord = null;
    dataSet.forEach((rec) => {
      if (rec?.getState('editing')) {
        editingRecord = rec;
      }
    });
    if (editingRecord) {
      Modal.confirm({
        title: intl.get('hzero.common.view.button.confirm').d('确认'),
        children: (
          <div>
            <p>
              {intl
                .get('sdat.supplierBlacklistManage.view.text.unsavedLineExists')
                .d('当前存在未保存的行')}
            </p>
            <p>
              {intl
                .get('sdat.supplierBlacklistManage.view.text.continueWillLostMessage')
                .d('继续操作将丢失编辑的信息')}
            </p>
          </div>
        ),
      }).then((button) => {
        if (button === 'cancel') return;
        // 把其他行重置
        editingRecord.setState('editing', false);
        editingRecord.reset();
        record.setState('editing', true);
      });
    } else {
      record.setState('editing', true);
    }
  };

  /**
   * handleCancel: 处理行编辑取消
   */
  const handleCancel = (record) => {
    record.reset();
    record.setState('editing', false);
  };

  /**
   * handleSave: 处理行保存
   */
  const handleSave = (record, dataSet = currentBlackListDs) => {
    const targetDs = dataSet;
    // 校验
    record.validate(true).then((bool) => {
      if (!bool) return;
      targetDs.status = 'loading';
      saveBlackListLine({ ...record.toData(), payFlag: targetDs.payFlag })
        .then((res) => {
          if (getResponse(res)) {
            record.setState('editing', false);
          }
        })
        .finally(() => {
          targetDs.status = 'ready';
          targetDs.query();
        });
    });
  };

  /**
   * handleRemove: 处理行移除
   */
  const handleRemove = (record, dataSet = currentBlackListDs) => {
    const targetDs = dataSet;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: (
        <p>
          {intl
            .get('sdat.supplierBlacklistManage.message.confirm.removeOrganization')
            .d('确定移除该企业吗?')}
        </p>
      ),
    }).then((btn) => {
      if (btn === 'ok') {
        // 检查是否有正在编辑的项目
        let hasEdit = false;
        targetDs.forEach((rec) => {
          if (rec?.getState('editing')) hasEdit = true;
        });
        if (hasEdit) {
          Modal.confirm({
            title: intl.get('hzero.common.view.button.confirm').d('确认'),
            children: (
              <div>
                <p>
                  {intl
                    .get('sdat.supplierBlacklistManage.view.text.unsavedLineExists')
                    .d('当前存在未保存的行')}
                </p>
                <p>
                  {intl
                    .get('sdat.supplierBlacklistManage.view.text.continueWillLostMessage')
                    .d('继续操作将丢失编辑的信息')}
                </p>
              </div>
            ),
          }).then((button) => {
            if (button === 'cancel') return;
            targetDs.status = 'loading';
            removeBlackListLine({ ...record.toData(), payFlag: targetDs.payFlag })
              .then((res) => {
                if (getResponse(res)) {
                  targetDs.query();
                  refreshQuotaIfEnterprise(targetDs.payFlag);
                }
              })
              .finally(() => {
                targetDs.status = 'ready';
              });
          });
        } else {
          targetDs.status = 'loading';
          removeBlackListLine({ ...record.toData(), payFlag: targetDs.payFlag })
            .then((res) => {
              if (getResponse(res)) {
                targetDs.query();
                refreshQuotaIfEnterprise(targetDs.payFlag);
              }
            })
            .finally(() => {
              targetDs.status = 'ready';
            });
        }
      }
    });
  };

  const getTableProps = (dataSet, isMapTab) => ({
    removeOrgPmn,
    editOrgPmn,
    saveOrgPmn,
    viewMapPmn,
    handleRemove: (record) => handleRemove(record, dataSet),
    handleEdit: (record) => handleEdit(record, dataSet),
    handleSave: (record) => handleSave(record, dataSet),
    handleCancel,
    blackListDs: dataSet,
    customizeTable,
    isMapTab,
    history,
  });

  const buttons = [
    {
      name: 'import',
      btnComp: CommonImport,
      btnProps: {
        refreshButton: true,
        // templateCode: 'SDAT.TENANT_BLACKLIST_IMPORT',
        businessObjectTemplateCode: 'SDAT.TENANT_BLACKLIST_IMPORT',
        prefixPatch: SRM_DATA_SDAT,
        buttonText: intl.get('hzero.common.button.importdata').d('导入'),
        modalProps: {
          afterClose: () => {
            enterpriseBlackListDs.query();
            refreshQuotaIfEnterprise(enterpriseBlackListDs.payFlag);
          },
        },
        buttonProps: { funcType: 'flat', disabled: disabledBtn },
        auto: true,
      },
    },
  ];

  // 手工录入
  const handleManualEntry = () => {
    let modal = null;

    const handleCloseModal = () => {
      currentBlackListDs.query();
      refreshQuotaIfEnterprise(currentPayFlag);
      blackRecordDS.data = [];
      blackRecordDS.reset();
      modal.close();
    };

    blackRecordDS.create(
      {
        tenant: tenantId,
        useTenant: tenantId,
        userId: getCurrentUser().id,
        userName: getCurrentUser().realName,
        source: 2,
        payFlag: currentPayFlag,
      },
      0
    );

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.button.manualEntry').d('手工录入'),
      children: <ManualEntryModal dataSet={blackRecordDS} onClose={handleCloseModal} />,
      closable: true,
      drawer: true,
      // mask: false,
      fullScreen: true,
      style: { width: '380px' },
      className: style['base-content-body'],
      footer: null,
      afterClose: () => {
        currentBlackListDs.query();
        refreshQuotaIfEnterprise(currentPayFlag);
      },
    });
  };

  // const handleOpenShootModal = () => {
  //   const path = '/public/sdat/relation-investigation';
  //   const { userId = '', realName = '', loginName = '', themeConfigVO = {} } = getCurrentUser();
  //   const {
  //     colorCode, // 主题色
  //   } = themeConfigVO;
  //   const embedProps = {
  //     path,
  //     pageData: {},
  //     location: {
  //       path,
  //       pathname: path,
  //       search: `?tenantId=${tenantId}&userId=${userId}&realName=${realName}&loginName=${loginName}&primaryColor=${colorCode}`,
  //     },
  //     match: {
  //       path,
  //     },
  //     history: {
  //       ...window.dvaApp._history,
  //     },
  //   };

  //   Modal.open({
  //     title: '',
  //     children: <EmbedPage href={path} {...embedProps} />,
  //     key: modalKey,
  //     drawer: true,
  //     mask: true,
  //     closable: true,
  //     resizable: true,
  //     maskClosable: true,
  //     style: { width: '80%' },
  //     contentStyle: { padding: '0' },
  //     bodyStyle: { padding: '0' },
  //     header: null,
  //     footer: null,
  //   });
  // };

  const menu = () => {
    return disabledBtn ? null : (
      <Menu>
        <Menu.Item onClick={() => handleAddCompany('cooperated')}>
          <span>{intl.get('sdat.monitorBusiness.view.button.handCooperated').d('已合作企业')}</span>
        </Menu.Item>
        {activeKey !== ENTERPRISE_BLACKLIST && (
          <Menu.Item onClick={() => handleAddCompany('query')}>
            <span>
              {intl.get('sdat.monitorBusiness.view.button.fastQueryWrite').d('快捷查询录入')}
            </span>
          </Menu.Item>
        )}
        <Menu.Item onClick={handleManualEntry}>
          <span>{intl.get('sdat.monitorBusiness.view.button.manualEntry').d('手工录入')}</span>
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <>
      <Header
        title={intl
          .get('sdat.supplierBlacklistManage.view.header.supplierBlacklistManage')
          .d('黑名单管理')}
        backPath={backValue ? '/sdat/risk-control-workbench/list' : null}
      >
        <Dropdown overlay={menu}>
          <Button disabled={disabledBtn} icon="add" color="primary">
            {intl.get('sdat.monitorBusiness.view.button.addBusiness').d('添加企业')}
            &nbsp;
            <Icon type="expand_more" style={{ verticalAlign: 'top' }} />
          </Button>
        </Dropdown>
        {/* <Button icon="360" funcType="flat" onClick={handleOpenShootModal}>
          {intl.get('sdat.supplier.view.title.relationShooting').d('关系排查')}
        </Button> */}
        <ReactExportButton
          btnText={intl.get('hzero.common.button.confirm.export').d('导出')}
          exportRequestUrl={exportRequestUrl}
          funcType="flat"
          ds={currentBlackListDs}
          params={{ payFlag: currentPayFlag }}
          disabled={disabledBtn}
          templateCode={
            activeKey === ENTERPRISE_BLACKLIST ? 'SDAT.TENANT_BLACKLIST_EXPORT' : 'SDAT.TENANT_BLACKLIST_MAP_EXPORT'
          }
        />
        {activeKey === ENTERPRISE_BLACKLIST &&
          customizeBtnGroup(
            { code: 'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACKLIST_IMPORT', pro: true },
            <DynamicButtons buttons={buttons} />
          )}
      </Header>
      <Content style={{ margin: '8px' }} className={style['blacklist-list-page-basic']}>
        <Tabs activeKey={activeKey} onChange={handleChangeTabs}>
          <TabPane
            tab={intl
              .get('sdat.supplierBlacklistManage.view.title.enterpriseBlacklist')
              .d('企业黑名单')}
            key={ENTERPRISE_BLACKLIST}
          >
            <div className={style['search-bar-row']}>
              <StaticSearchBar
                key="blacklist-org-bar"
                cacheState
                clearButton
                searchCode={ENTERPRISE_SEARCH_CODE}
                filters={filters}
                dataSet={[enterpriseBlackListDs]}
                onQuery={handleFilterQueryAll}
                onClear={handleClear}
                onReset={handleClear}
                showLoading={false}
                defaultExpand={false}
              />
              {quotaCountComp()}
            </div>
            <div className={style['table-box']}>
              <CustomizedTable {...getTableProps(enterpriseBlackListDs, false)} />
            </div>
          </TabPane>
          <TabPane
            tab={intl.get('sdat.supplierBlacklistManage.view.title.blacklistMap').d('黑名单图谱')}
            key={BLACKLIST_MAP}
          >
            <StaticSearchBar
              key="blacklist-map-bar"
              cacheState
              clearButton
              searchCode={BLACKLIST_MAP_SEARCH_CODE}
              filters={filters}
              dataSet={[blacklistMapDs]}
              onQuery={handleFilterQueryAll}
              onClear={handleClear}
              onReset={handleClear}
              showLoading={false}
              defaultExpand={false}
            />
            {/* <div className={style['paid-feature-tip']}>
              {intl
                .get('sdat.supplierBlacklistManage.view.message.paidFeature')
                .d('当前版菜单为付费版功能')}
            </div> */}
            <div className={style['table-box']}>
              <CustomizedTable {...getTableProps(blacklistMapDs, true)} />
            </div>
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.supplierBlacklistManage', 'hzero.common', 'sdat.monitorBusiness', 'sdat.supplier'],
})(
  withCustomize({
    unitCode: [
      'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACK_LIST_BXJD',
      'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACK_LIST_MAP_BXJD',
      'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACKLIST_IMPORT',
    ],
  })(
    withProps(
      () => {
        const enterpriseBlackListDs = new DataSet(
          getBlackListDs({
            payFlag: ENTERPRISE_PAY_FLAG,
            customizeUnitCode: 'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACK_LIST_BXJD',
          })
        );
        enterpriseBlackListDs.payFlag = ENTERPRISE_PAY_FLAG;
        const blacklistMapDs = new DataSet(
          getBlackListDs({
            payFlag: BLACKLIST_MAP_PAY_FLAG,
            customizeUnitCode: 'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACK_LIST_MAP_BXJD',
          })
        );
        blacklistMapDs.payFlag = BLACKLIST_MAP_PAY_FLAG;
        const businessListDs = new DataSet(getBusinessListDS());
        const blackRecordDS = new DataSet(getBlackRecordDS());
        const valueDs = { enterpriseBlackListDs, blacklistMapDs, businessListDs, blackRecordDS };
        return { valueDs };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(SupplierBlacklistManage)
  )
);
