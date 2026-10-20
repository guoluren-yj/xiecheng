import React, { useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { Alert } from 'choerodon-ui';
import { Table, Form, Select, Lov, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { isEmpty, noop } from 'lodash';
import notification from 'utils/notification';
import { getResponse, getCurrentTenant } from 'utils/utils';
import querystring from 'querystring';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';

import { fetchSourceSupplierRelativeConfig, fetchConfigSheet } from '@/services/inquiryHallService';

import { PageSourceSymbol } from '@/utils/constants.js';

import { StoreContext } from '../store/StoreProvider';
import SupplierRelatedGraph from '../../Components/SupplierRelatedGraph';

import Style from '../index.less';

// 标段/包信息
const supplierLineTable = observer((props) => {
  const { handleSetOperateLoading = noop, fetchHeader = noop, fetchSupplierInfo = noop } = props;

  const {
    commonDs: { supplierLineTableDs, headerDs, supplierLovDs } = {},
    customizeTable,
    customizeForm,
    getCustomizeUnitCode,
    organizationId,
    sourceProjectId,
    history,
    history: {
      location: { pathname = null, search },
    },
    getStoreData,
    remote,
  } = useContext(StoreContext);

  const [supplierConfigOldUserFlag, setSupplierConfigOldUserFlag] = useState(true); // 采购方租户是否在配置表中

  // 供应商资质到期信息
  const qualificationInfo = getStoreData('qualificationInfo') || {};

  const {
    subjectMatterRule, // 是否分标段
    companyId,
    sourceMethod,
    sourceProjectNum,
  } =
    headerDs?.current?.get([
      'subjectMatterRule',
      'companyId',
      'sourceMethod',
      'sourceProjectNum',
    ]) || {};

  useEffect(() => {
    fetchSupplierOldUserConfig();
  }, []);

  const fetchSupplierOldUserConfig = async () => {
    try {
      let result = await fetchConfigSheet({
        organizationId,
        configCode: 'sslm_life_cycle_new_360_bk',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      result = getResponse(result);
      if (!result) {
        return;
      }
      if (isEmpty(result)) {
        setSupplierConfigOldUserFlag(false);
      }
    } catch (e) {
      throw e;
    }
  };

  // 跳转360
  const jumpSupplierLifeManagerDetail = (record, supplierTabKey = null) => {
    // 根据当前登陆账号，查配置表，判断是老租户还是新租户
    const {
      tenantId,
      partnerCompanyId,
      partnerTenantId,
      spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    } =
      record.get([
        'tenantId',
        'partnerCompanyId',
        'partnerTenantId',
        'spfmSupplierCompanyId',
        'spfmCompanyId',
        'supplierCompanyId',
      ]) || {};

    if (
      !companyId?.companyId ||
      !partnerCompanyId ||
      !partnerTenantId ||
      !spfmSupplierCompanyId ||
      !supplierCompanyId
    ) {
      return;
    }

    const params = {
      tenantId,
      companyId: companyId?.companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId: spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    };
    const searchParams = querystring.stringify(params);

    if (supplierTabKey) {
      // 判断是否在iframe中
      if (window.top !== window) {
        // 是
        window.parent.postMessage({
          type: 'link',
          data: JSON.stringify({
            pathname: `${supplierTabKey}`,
            search: searchParams,
          }),
        });
      } else {
        history.push({
          pathname: `${supplierTabKey}`,
          search: searchParams,
          state: {
            historyBack: pathname + search,
            ...params,
          },
        });
      }
    }
  };

  // fortmat [] to string
  const formatListToString = useCallback((list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  }, []);

  // before open supplier lov model to query config
  const fetchSourceSupplierRelativeConfigData = useCallback(
    async (options = {}) => {
      if (!sourceProjectId) {
        return;
      }

      const {
        excludeSupplierDetailFlag = 1, // 是否需要过滤掉已经选择过的供应商 0 = 不过滤， 1 = 过滤
      } = options || {};

      const params = {
        organizationId,
        sourceHeaderId: sourceProjectId,
      };
      let result = {};
      try {
        result = await fetchSourceSupplierRelativeConfig(params);
        result = getResponse(result);
        if (!result) {
          return;
        }

        if (result.stageAllMismatchFlag === 1) {
          notification.warning({
            message: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.batchAddSupplierMsg`)
              .d(
                '操作失败，失败原因是业务规则定义"可参与立项供应商设置"导致没有供应商可参与，请检查'
              ),
          });
        }

        const {
          supplyReviewStatusList = [],
          itemAndCategoryDTOS = null,
          reviewStatusList = null,
          existSuppliers = null,
          itemCategoryIds = null,
          sourceCode = null,
          erpFlag = null,
          srmFlag = null,
          stageIdList = null,
          queryItemIds = null,
          expandObject = null, // 扩展对象
        } = result;

        result = {
          defaultQueryItemCategoryIds: formatListToString(itemCategoryIds),
          supplyReviewStatus: formatListToString(reviewStatusList),
          sourceCode,
          erpFlag,
          srmFlag,
          stageIdList,
          itemAndCategoryDTOS,
          supplyReviewStatusList,
          excludeSupplierDetailDTOS: excludeSupplierDetailFlag ? existSuppliers : null,
          queryItemIds,
          ...(expandObject || {}),
          pageSource: PageSourceSymbol.projectSetupUpdate,
        };
      } catch (e) {
        throw e;
      }

      return result || {};
    },
    [organizationId, sourceProjectId, sourceMethod]
  );

  // supplier lov props constructor
  const getSupplierLovProps = useCallback(
    (options = {}) => {
      const queryData = {
        companyId: companyId?.companyId,
      };

      const supplierLovFieldProps = {
        dataSet: supplierLovDs,
        name: 'supplierLovList',
        mode: 'button',
        color: 'primary',
        icon: 'playlist_add',
        clearButton: false,
        placeholder: intl
          .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
          .d('批量添加供应商'),
        modalProps: {
          style: { maxWidth: '1500px', width: '1000px' },
          onOk: supplierLovOk,
          onCancel: () => {
            supplierLovDs.loadData([]);
          },
        },
        beforeQuery: fetchSourceSupplierRelativeConfigData,
      };

      return {
        queryData, // 初始化查询参数 body payload
        ...supplierLovFieldProps,
        ...options,
      };
    },
    [companyId?.companyId, supplierLovOk, supplierLovDs, fetchSourceSupplierRelativeConfigData]
  );

  // new ui supplier lov add supplier
  const supplierLovOk = () => {
    const data = supplierLovDs.toData();
    const { supplierLovList = [] } = data?.[0] || {};

    if (isEmpty(supplierLovList)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    if (!companyId || !organizationId) {
      return;
    }
    return supplierLovDs.submit().then((res) => {
      if (res && !res.failed) {
        supplierLovDs.loadData([]);
        fetchHeader({ refreshSectionFieldsFlag: true });
        fetchSupplierInfo();
      }
    });
  };

  // 改变联系人
  const changeContactName = (value, record) => {
    const { mobilephone, mail, internationalTelCode } = value || {};
    record.set({
      contactMobilephone: mobilephone,
      contactMail: mail,
      internationalTelCode,
    });
  };

  const columns = [
    {
      name: 'supplierCompanyNum',
      width: 180,
      renderer: ({ value, record }) => {
        // 判断有无供应商生命周期/供应商生命周期汇总菜单权限
        const supplierTabKey = supplierConfigOldUserFlag
          ? '/sslm/include/supplier-manager/supplier-detail'
          : '/sslm/supplier-detail-new';
        return supplierTabKey && record?.get('supplierCompanyId') && value ? (
          <Button
            funcType="link"
            onClick={() => jumpSupplierLifeManagerDetail(record, supplierTabKey)}
          >
            {value}
          </Button>
        ) : (
          value
        );
      },
    },
    {
      name: 'supplierCompanyName',
    },
    {
      name: 'supplierCategoryDescription',
    },
    {
      name: 'stageDescription',
    },
    {
      name: 'supplierContactId',
      editor: (record) => (
        <Lov
          name="supplierContactId"
          record={record}
          onChange={(value) => changeContactName(value, record)}
        />
      ),
    },
    {
      name: 'contactMobilephone',
      editor: true,
    },
    {
      name: 'contactMail',
      editor: true,
    },
    subjectMatterRule === 'PACK' && {
      name: 'allocatedLot',
      editor: (record) => {
        return (
          <Lov
            viewMode="popup"
            key={record?.get('projectLineSupplierId')}
            noCache
            record={record}
            name="allocatedLot"
            popupCls={Style['ssrc-sp-change-allot-section']}
          />
        );
      },
    },
  ];

  // 切换寻源方式
  const handleChangeSourceMethod = (value) => {
    if (value === 'INVITE') {
      // 查询供应商列表
      supplierLineTableDs.query();
    }
  };

  // 批量删除
  const handleBatchDeleteItem = () => {
    const selectedRecords = supplierLineTableDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('projectLineSupplierId')) || [];

    // 删除新增数据
    supplierLineTableDs.remove(addRecords);

    if (!isEmpty(oldRecords)) {
      handleSetOperateLoading(true);
      // 删除线上数据
      supplierLineTableDs
        .delete(oldRecords, {
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        })
        .then(async (res) => {
          if (getResponse(res)) {
            try {
              // 查询头 ps：如果单据状态不是变更中，则执行了页面内容的删除或者保存接口会触发状态的变更，因此需要调用头查询变更状态；
              if (headerDs?.current?.get('sourceProjectStatus') !== 'CHANGING') {
                await fetchHeader({ refreshSectionFieldsFlag: true });
              }
              // 刷新标段表格 & 保留缓存的变更数据
              await supplierLineTableDs.query(undefined, undefined, true);
            } catch (err) {
              handleSetOperateLoading(false);
              throw err;
            }
          }
          handleSetOperateLoading(false);
        })
        .finally(() => handleSetOperateLoading(false));
    }
  };

  // 批量删除按钮禁用逻辑
  const batchDisabledFlag = useMemo(() => {
    return (
      !supplierLineTableDs ||
      !supplierLineTableDs.selected?.length ||
      (!supplierLineTableDs.length && !supplierLineTableDs.cachedRecords?.length) ||
      supplierLineTableDs?.status === 'loading'
    );
  }, [
    supplierLineTableDs?.selected,
    supplierLineTableDs.length,
    supplierLineTableDs.cachedRecords?.length,
    supplierLineTableDs?.status,
  ]);

  // table buttons
  const buttons = useMemo(() => {
    const sourceButtons = [
      <SupplierLov {...getSupplierLovProps()}>
        {intl.get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier').d('批量添加供应商')}
      </SupplierLov>,
      <TooltipButtonPro
        name="delete"
        funcType="flat"
        icon="delete_sweep"
        onClick={handleBatchDeleteItem}
        disabled={batchDisabledFlag}
        help={intl.get('ssrc.common.view.message.supplier-line.select.tip').d('请先勾选供应商行')}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </TooltipButtonPro>,
      <SupplierRelatedGraph
        name="relationMap"
        supplierDataList={supplierLineTableDs}
        sourceProjectId={sourceProjectId}
        projectNum={sourceProjectNum}
      />,
    ];
    return remote
      ? remote.process(
          'SSRC_PROJECTSETUP_SP_CHANGE_PROCESS_SUPPLIER_TABLE_BUTTONS',
          sourceButtons,
          { history, headerDs }
        )
      : sourceButtons;
  }, [
    getSupplierLovProps,
    handleBatchDeleteItem,
    batchDisabledFlag,
    remote,
    history,
    sourceProjectId,
    sourceProjectNum,
  ]);

  return (
    <>
      {customizeForm(
        {
          code: getCustomizeUnitCode('sourceMethodForm'),
          dataSet: headerDs,
        },
        <Form dataSet={headerDs} labelLayout="float" columns={3}>
          <Select name="sourceMethod" onChange={handleChangeSourceMethod} />
        </Form>
      )}
      {headerDs?.current?.get('sourceMethod') === 'INVITE' && (
        <div style={{ marginTop: '16px' }}>
          <div>
            {!!qualificationInfo?.supplierCompanyName && (
              <Alert
                showIcon
                message={intl
                  .get(`ssrc.inquiryHall.view.message.qualificationWarnInfo`, {
                    supplierCompanyName: qualificationInfo?.supplierCompanyName,
                    expiredCount: qualificationInfo?.expiredCount,
                  })
                  .d(
                    '{supplierCompanyName}等{expiredCount}家供应商在供应商360资质认证已到期，请确认是否邀请！'
                  )}
                type="error"
                style={{ marginBottom: 16, border: 0 }}
                className={Style['sp-alert-error']}
              />
            )}
          </div>
          {customizeTable(
            {
              code: getCustomizeUnitCode('supplierTable'),
              buttonCode: getCustomizeUnitCode('supplierTableBtn'),
            },
            <Table
              dataSet={supplierLineTableDs}
              columns={columns}
              buttons={buttons}
              style={{ maxHeight: '4.5rem' }}
            />
          )}
        </div>
      )}
    </>
  );
});

export default supplierLineTable;
