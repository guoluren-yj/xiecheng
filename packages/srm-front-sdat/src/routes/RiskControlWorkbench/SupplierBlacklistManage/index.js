/**
 * 供应商黑名单管理
 * @date: 2022-11-22
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import { DataSet, Modal, Dropdown, Menu, Icon, Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import CommonImport from 'srm-front-boot/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';
import { checkPermission } from 'services/api';
// import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';

import { SRM_DATA_SDAT } from '@/utils/config';
import { getResponse } from '@/utils/utils'; // getUrlParam
import StaticSearchBar from '@/components/StaticSearchBar';
import {
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

const tenantId = getCurrentOrganizationId();
// const modalKey = Modal.key();

const exportRequestUrl = `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/blacklist-export`;

function SupplierBlacklistManage(props = {}) {
  const { blackListDs, businessListDs, blackRecordDS } = props.valueDs;
  const { customizeTable, customizeBtnGroup, history } = props;

  // const [isSubscribe, setIsSubscribe] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [localPermissionList, setPermissionList] = useState(false);
  // const [backValue, setBackPath] = useState('');

  const [filters, setFilters] = useState({ ...getQueryConfig(true) });

  useEffect(() => {
    blackListDs.status = 'loading';

    // const { backPath = '' } = getUrlParam() || {};
    // setBackPath(backPath);

    checkPermission([
      'risk-control-workbench.api.blackList-addBusiness',
      'risk-control-workbench.api.blackList-import',
    ]).then((res) => {
      if (getResponse(res)) {
        setPermissionList(res.length ? res : []);
      }
    });

    // queryIfSubscribeRelationMap()
    //   .then((res) => {
    //     setIsSubscribe(res);
    //   })
    //   .finally(() => {
    //     blackListDs.status = 'ready';
    //   });

    setFilters({ ...getQueryConfig(true) });
  }, []);

  // useEffect(() => {
  //   setFilters({ ...getQueryConfig(isSubscribe) });
  // }, [isSubscribe]);

  const handleFilterQueryAll = ({ params }) => {
    // 处理一下时间
    const { addTime_range: rangeAddTime = '', updateTime_range: rangeUpdateTime = '' } = params;
    const [startDate = undefined, endDate = undefined] = rangeAddTime?.split(',') ?? [];
    const [graphStartDate = undefined, graphEndDate = undefined] =
      rangeUpdateTime?.split(',') ?? [];
    blackListDs.queryParameter = { ...params, startDate, endDate, graphStartDate, graphEndDate };
    blackListDs
      .query()
      .then(() => {
        setDisabledBtn(false);
      })
      .catch(() => {
        setDisabledBtn(true);
      });
  };

  const handleClear = () => {
    blackListDs.queryParameter = {};
    blackListDs
      .query()
      .then(() => {
        setDisabledBtn(false);
      })
      .catch(() => {
        setDisabledBtn(true);
      });
  };

  /**
   * handleAddCompany: 点击头部添加企业按钮回调
   */
  const handleAddCompany = (type) => {
    let modal = null;

    const handleCloseModal = () => {
      blackListDs.query();
      modal.close();
    };

    const addBusiness = () => {
      blackListDs.query();
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.button.addBlackListBusiness').d('添加黑名单企业'),
      children: (
        <BusinessAddModal
          onAddBusiness={addBusiness}
          businessListDS={businessListDs}
          onClose={handleCloseModal}
          type={type}
        />
      ),
      closable: true,
      drawer: true,
      // mask: false,
      fullScreen: true,
      style: { width: '1000px' },
      footer: null,
      afterClose: () => {
        blackListDs.query();
      },
    });
  };

  /**
   * handleEdit: 处理行编辑
   */
  const handleEdit = (record) => {
    // 为保证保存的逻辑, 当前行编辑时其他行要取消编辑
    // 检查是否有正在编辑的项目
    let editingRecord = null;
    blackListDs.forEach((rec) => {
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
  const handleSave = (record) => {
    // 校验
    record.validate(true).then((bool) => {
      if (!bool) return;
      blackListDs.status = 'loading';
      saveBlackListLine({ ...record.toData() })
        .then((res) => {
          if (getResponse(res)) {
            record.setState('editing', false);
          }
        })
        .finally(() => {
          blackListDs.status = 'ready';
          blackListDs.query();
        });
    });
  };

  /**
   * handleRemove: 处理行移除
   */
  const handleRemove = (record) => {
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
        blackListDs.forEach((rec) => {
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
            blackListDs.status = 'loading';
            removeBlackListLine({ ...record.toData() })
              .then((res) => {
                if (getResponse(res)) blackListDs.query();
              })
              .finally(() => {
                blackListDs.status = 'ready';
              });
          });
        } else {
          blackListDs.status = 'loading';
          removeBlackListLine({ ...record.toData() })
            .then((res) => {
              if (getResponse(res)) blackListDs.query();
            })
            .finally(() => {
              blackListDs.status = 'ready';
            });
        }
      }
    });
  };

  // 校验权限集
  const checkIfPermission = (code = '') => {
    let checkFlag = false;
    if (localPermissionList.length) {
      localPermissionList.forEach((item) => {
        if (item.code === code) {
          checkFlag = item.approve;
        }
      });
    }

    return checkFlag;
  };

  const tableProps = {
    handleRemove,
    handleEdit,
    handleSave,
    handleCancel,
    blackListDs,
    customizeTable,
    // isSubscribe,
    history,
  };

  const buttons = [
    checkIfPermission('risk-control-workbench.api.blackList-import') && {
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
            blackListDs.query();
          },
        },
        buttonProps: { funcType: 'flat', disabled: disabledBtn },
        auto: true,
      },
    },
  ].filter(Boolean);

  // 手工录入
  const handleManualEntry = () => {
    let modal = null;

    const handleCloseModal = () => {
      blackListDs.query();
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
        blackListDs.query();
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
  //     maskClosable: true,
  //     resizable: true,
  //     style: { width: '80%' },
  //     contentStyle: { padding: '0' },
  //     bodyStyle: { padding: '0' },
  //     header: null,
  //     footer: null,
  //   });
  // };

  const hasPermission = checkIfPermission('risk-control-workbench.api.blackList-addBusiness');

  const menu = () => {
    return disabledBtn || !hasPermission ? null : (
      <Menu>
        <Menu.Item>
          <span onClick={() => handleAddCompany('cooperated')}>
            {intl.get('sdat.monitorBusiness.view.button.handCooperated').d('已合作企业')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span onClick={() => handleAddCompany('query')}>
            {intl.get('sdat.monitorBusiness.view.button.fastQueryWrite').d('快捷查询录入')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span onClick={handleManualEntry}>
            {intl.get('sdat.monitorBusiness.view.button.manualEntry').d('手工录入')}
          </span>
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
        // backPath={backValue ? '/sdat/risk-control-workbench/list' : null}
        backPath="/sdat/risk-control-workbench/list"
      >
        <Dropdown overlay={menu} disabled={disabledBtn || !hasPermission}>
          <Button disabled={disabledBtn || !hasPermission} icon="add" color="primary">
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
          ds={blackListDs}
          disabled={disabledBtn}
          templateCode="SDAT.TENANT_BLACKLIST_EXPORT"
          permissionList={[{ code: 'risk-control-workbench.api.blackList-export' }]}
        />
        {customizeBtnGroup(
          { code: 'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACKLIST_IMPORT', pro: true },
          <DynamicButtons buttons={buttons} />
        )}
      </Header>
      <Content style={{ margin: '8px' }} className={style['blacklist-list-page-basic']}>
        <StaticSearchBar
          key="monitor-org-bar"
          cacheState
          clearButton
          searchCode="SDAT.SUPPLIER_BLACKLIST"
          filters={filters}
          dataSet={[blackListDs]}
          onQuery={handleFilterQueryAll}
          onClear={handleClear}
          onReset={handleClear}
          showLoading={false}
          defaultExpand={false}
        />
        <div className={style['table-box']}>
          <CustomizedTable {...tableProps} />
        </div>
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
      'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACKLIST_IMPORT',
    ],
  })(
    withProps(
      () => {
        const blackListDs = new DataSet(getBlackListDs());
        const businessListDs = new DataSet(getBusinessListDS());
        const blackRecordDS = new DataSet(getBlackRecordDS());
        const valueDs = { blackListDs, businessListDs, blackRecordDS };
        return { valueDs };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(SupplierBlacklistManage)
  )
);
