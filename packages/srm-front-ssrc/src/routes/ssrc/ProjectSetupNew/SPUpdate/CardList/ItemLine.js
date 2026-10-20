import React, { useContext, useMemo, useEffect, useState, useRef } from 'react';
import { Table, Lov, Button, useModal, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { Badge } from 'choerodon-ui';
import { isEmpty, noop, isNil } from 'lodash';
import { getResponse, getCurrentTenant } from 'utils/utils';
import querystring from 'querystring';
import notification from 'utils/notification';
import { SRM_SSRC } from '_utils/config';
import CommonImportNew from 'hzero-front/lib/components/Import';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Purchaser';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';

import { fetchConfigSheet } from '@/services/inquiryHallService';
import {
  createQuoteApprovalDetail,
  prLineBatchValidatePurchase,
} from '@/services/projectSetupService';

import { numberSeparatorRender } from '@/utils/renderer';
import { calculateBasicQty } from '@/utils/utils';

import PurchaseRequestContent from '../../PurchaseRequestContent';

import { StoreContext } from '../store/StoreProvider';

// 标的物卡片
const ItemLine = observer((props) => {
  const Modal = useModal();

  const { handleSetOperateLoading = noop, fetchHeader = noop } = props;

  const {
    commonDs: {
      itemLineDs,
      headerDs,
      purchaseRequestDs,
      sectionOrPacketInfoDs,
      supplierLineTableDs,
    } = {},
    doubleUnitFlag,
    customizeTable,
    getCustomizeUnitCode,
    sourceProjectId,
    organizationId,
    history,
    remote,
  } = useContext(StoreContext);

  // 申请新老ui配置
  const [sprmOldUiConfig, setSprmOldUiConfig] = useState(false);
  // 引用申请弹框实例
  const prRequestModal = useRef(null);

  useEffect(() => {
    fetchSprmUiConfig();
  }, []);

  const {
    projectFrom, // 立项单来源
    subjectMatterRule, // 是否分标段
    tenantId,
  } = headerDs?.current?.get(['projectFrom', 'subjectMatterRule', 'tenantId']) || {};

  // 查询配置表
  const fetchSprmUiConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId,
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }
      setSprmOldUiConfig(!isEmpty(data));
    } catch (e) {
      throw e;
    }
  };

  // 改变业务实体
  const changeOuId = (value, record) => {
    const { invOrganizationId = null, invOrganizationName = null } = value || {};
    record.set({
      invOrganizationId: value
        ? {
            invOrganizationId,
            invOrganizationName,
          }
        : null,
      itemId: null,
      itemName: null,
      secondaryUomId: null,
      uomId: null,
    });
  };

  // 改变业务实体
  const changeInvOrganizationId = (value, record) => {
    record.set({
      itemId: null,
      itemName: null,
      secondaryUomId: null,
      uomId: null,
    });
  };

  // 计算基本数量
  const getCalculateQty = (record = {}) => {
    const { secondaryQuantity, secondaryUomId, itemId, uomId } = record.get([
      'secondaryQuantity',
      'secondaryUomId',
      'itemId',
      'uomId',
    ]);
    if (secondaryQuantity && secondaryUomId?.uomId) {
      calculateBasicQty({
        secondaryQuantity,
        itemId: itemId?.itemId,
        businessKey: -1,
        doublePrimaryUomId: uomId?.uomId,
        secondaryUomId: secondaryUomId.uomId,
      }).then((res) => {
        record.set({
          requiredQuantity: res ?? null,
        });
      });
    } else if (secondaryQuantity === 0) {
      record.set({
        requiredQuantity: 0,
      });
    }
  };

  // 改变物料编码
  const changeItemId = (value, record) => {
    const {
      secondaryUomId = null,
      uomId = null,
      secondaryUomName = null,
      uomName = null,
      orderUomId = null,
      primaryUomId = null,
      orderUomName = null,
      specifications = null,
      model = null,
      categoryId = null,
      categoryName = null,
      itemName = null,
    } = value || {};
    if (doubleUnitFlag && value?.itemId) {
      record.set({
        secondaryUomId: value
          ? {
              uomId: secondaryUomId || uomId,
              uomName: secondaryUomName || uomName,
            }
          : null,
        uomId: value
          ? {
              uomId,
              uomName,
            }
          : null,
      });
      if (secondaryUomId && secondaryUomId !== uomId) {
        record.set('priceBatch', 1);
      }
      getCalculateQty(record, value?.itemId);
    } else {
      record.set({
        requiredQuantity: record.get('secondaryQuantity'),
        uomId: value
          ? {
              uomId: orderUomId || primaryUomId,
              uomName: orderUomName || uomName,
            }
          : null,
        secondaryUomId: value
          ? {
              uomId: orderUomId || primaryUomId,
              uomName: orderUomName || uomName,
            }
          : null,
      });
    }
    record.set({
      itemName,
      specifications,
      model,
      itemCategoryId: value
        ? {
            categoryId,
            categoryName,
          }
        : null,
    });
  };

  // 改变数量
  const changeSecondaryQuantity = (e, record = {}) => {
    if (e.target.value) {
      if (doubleUnitFlag && record.get('itemId')?.itemId) {
        getCalculateQty(record);
      } else {
        record.set({
          requiredQuantity: record.get('secondaryQuantity'),
        });
      }
    }
  };

  // 改变单位
  const changeUomId = (value, record) => {
    const { uomId = null, uomCodeAndName = null } = value || {};
    if (doubleUnitFlag && record.get('itemId')?.itemId) {
      record.set({
        secondaryUomId: value
          ? {
              uomId,
              uomName: uomCodeAndName,
            }
          : null,
      });
      if (uomId && uomId !== record.get('uomId')?.uomId) {
        record.set({
          priceBatch: 1,
        });
      }
      getCalculateQty(record);
    } else if (doubleUnitFlag) {
      record.set({
        requiredQuantity: record.get('secondaryQuantity'),
        uomId: value
          ? {
              uomId,
              uomName: uomCodeAndName,
            }
          : null,
        secondaryUomId: value
          ? {
              uomId,
              uomName: uomCodeAndName,
            }
          : null,
      });
    } else {
      record.set({
        uomId: value
          ? {
              uomId,
              uomName: uomCodeAndName,
            }
          : null,
        secondaryUomId: value
          ? {
              uomId,
              uomName: uomCodeAndName,
            }
          : null,
      });
    }
  };

  // 采购申请行跳转
  const linkToPrNumDetail = (record = {}) => {
    const { prSourcePlatform, prHeaderId } = record.get(['prSourcePlatform', 'prHeaderId']) || {};
    const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
    let pathUrl = null;

    if (!sprmOldUiConfig) {
      // 记录一个标识, 实现跳转的采购申请工作台明细后,点击返回按钮，返回采购申请工作台主页面的【整单-全部】页签
      // 需要去采购申请工作台去适配此方案
      // NOTE window.ssrc.directionToPurchasePlatform = 'inquiryHallNewUpdate,inquiryHallNewDetail';
      window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewUpdate';

      pathUrl = isErp
        ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
        : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
    } else {
      pathUrl = isErp
        ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
        : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
    }

    if (window.top !== window) {
      window.parent.postMessage({
        type: 'link',
        data: JSON.stringify({
          pathname: pathUrl,
        }),
      });
    } else {
      history.push({
        pathname: pathUrl,
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'projectLineItemNum',
      },
      {
        name: 'ouId',
        editor: (record) => {
          return (
            <Lov record={record} name="ouId" onChange={(value) => changeOuId(value, record)} />
          );
        },
      },
      {
        name: 'invOrganizationId',
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="invOrganizationId"
              onChange={(value) => changeInvOrganizationId(value, record)}
            />
          );
        },
      },
      {
        name: 'itemId',
        editor: (record) => {
          return (
            <Lov record={record} name="itemId" onChange={(value) => changeItemId(value, record)} />
          );
        },
      },
      {
        name: 'itemName',
        editor: true,
      },
      {
        name: 'itemCategoryId',
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="itemCategoryId"
              tableProps={{
                mode: 'tree',
                selectionMode: 'rowbox',
              }}
            />
          );
        },
      },
      {
        name: 'specifications',
        editor: true,
      },
      {
        name: 'model',
        editor: true,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="budgetAmount"
                  type="c7n-pro"
                  record={record}
                  uom="secondaryUomId"
                  onBlur={(e) => changeSecondaryQuantity(e, record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryUomId',
            editor: (record) => {
              return (
                <Lov
                  record={record}
                  name="secondaryUomId"
                  onChange={(value) => changeUomId(value, record)}
                />
              );
            },
          }
        : null,
      {
        name: 'requiredQuantity',
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="requiredQuantity"
              type="c7n-pro"
              record={record}
              uom="uomId"
              queryPrecisionParams={{
                purTenantId: tenantId,
              }}
            />
          );
        },
        renderer: ({ record, value }) =>
          doubleUnitFlag
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        name: 'uomId',
        editor: (record) => {
          return (
            <Lov record={record} name="uomId" onChange={(value) => changeUomId(value, record)} />
          );
        },
      },
      {
        name: 'priceBatch',
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="priceBatch"
              type="c7n-pro"
              record={record}
              headerRecord={headerDs?.current}
              getValueFromHeaderRecordFirst
              currency="currencyCode"
              queryPrecisionParams={{
                purTenantId: tenantId,
              }}
            />
          );
        },
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('currency_precision')),
      },
      !doubleUnitFlag
        ? {
            name: 'costPrice',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="costPrice"
                  type="c7n-pro"
                  record={record}
                  headerRecord={headerDs?.current}
                  getValueFromHeaderRecordFirst
                  currency="currencyCode"
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              );
            },
            renderer: ({ value, record }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          }
        : null,
      !doubleUnitFlag
        ? {
            name: 'totalPrice',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'estimatedPrice',
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="estimatedPrice"
              type="c7n-pro"
              record={record}
              getValueFromHeaderRecordFirst
              headerRecord={headerDs?.current}
              currency="currencyCode"
              queryPrecisionParams={{
                purTenantId: tenantId,
              }}
            />
          );
        },
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('currency_precision')),
      },
      {
        name: 'estimatedAmount',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'quotationTemplateId',
        editor: true,
      },
      {
        name: 'quotationDetail',
        renderer: ({ record }) => {
          const { itemCategoryId, itemId, quotationTemplateId, projectLineItemId } = record.get([
            'itemCategoryId',
            'itemId',
            'quotationTemplateId',
            'projectLineItemId',
          ]);
          const coverInterfaceParam = {
            itemId: itemId?.itemId,
            itemCategoryId: itemCategoryId?.categoryId,
            quotationTemplateId: quotationTemplateId?.templateId,
          };
          return (itemCategoryId?.categoryId ||
            itemId?.itemId ||
            quotationTemplateId?.templateId) &&
            projectLineItemId ? (
            <>
              <QuotationDetailModal
                rowData={record}
                sourceFrom="PROJECT"
                uiType="c7n"
                buttonText={intl.get('hzero.common.button.edit').d('编辑')}
                coverInterfaceParam={coverInterfaceParam}
                saveUrl={`${SRM_SSRC}/v1/${organizationId}/quotation-details/changing/save`}
                deleteUrl={`${SRM_SSRC}/v1/${organizationId}/quotation-details/${sourceProjectId}/${projectLineItemId}/changing/delete`}
                deleteRequestPrams={{ sourceFrom: 'PROJECT' }}
                onOk={() => fetchHeader({ refreshSectionFieldsFlag: true })}
              />
              {record.get('quotationDetailRequire') === 1 && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )}
            </>
          ) : null;
        },
      },
      {
        name: 'itemRemark',
        editor: true,
      },
      {
        name: 'itemAttachmentUuid',
        editor: (record) => {
          return !record.get('prNum');
        },
      },
      projectFrom === 'REFERENCE'
        ? {
            name: 'prNum',
            renderer: ({ value, record }) => {
              return (
                <Button funcType="link" onClick={() => linkToPrNumDetail(record)}>
                  {value}
                </Button>
              );
            },
          }
        : null,
      projectFrom === 'REFERENCE'
        ? {
            name: 'prDisplayLineNum',
          }
        : null,
      {
        name: 'requestUserId',
        editor: true,
      },
      {
        name: 'projectTaskId',
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="projectTaskId"
              tableProps={{
                mode: 'tree',
                selectionMode: 'rowbox',
              }}
            />
          );
        },
      },
      subjectMatterRule === 'PACK'
        ? {
            name: 'sectionCode',
            editor: (record) => {
              return (
                <Lov
                  record={record}
                  name="sectionCode"
                  tableProps={{
                    selectionMode: 'rowbox',
                  }}
                />
              );
            },
          }
        : null,
      subjectMatterRule === 'PACK'
        ? {
            name: 'sectionName',
          }
        : null,
    ],
    [doubleUnitFlag, projectFrom, subjectMatterRule]
  );

  // 清除ds缓存
  const clearDsCacheData = (ds) => {
    if (!ds) return;
    ds.reset();
    ds.loadData([]);
    ds.clearCachedSelected();
    ds.clearCachedModified();
    ds.clearCachedRecords();
  };

  // 开启或者关闭采购申请弹框loading
  const handleOperatePurModalLoading = (loading) => {
    if (prRequestModal.current) {
      prRequestModal.current.update({
        okProps: {
          loading,
        },
      });
    }
  };

  // 引用申请立项提交
  const submitPrLineToPurchase = async ({ selectedRowKeys } = {}) => {
    try {
      handleOperatePurModalLoading(true);
      const result = getResponse(
        await createQuoteApprovalDetail({
          prLineIdList: selectedRowKeys,
          configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
          sourceProject: {
            sourceProjectId,
          },
        })
      );
      if (result) {
        notification.success();
        if (prRequestModal?.current) {
          // 关闭引用申请立项弹框
          prRequestModal.current.close();
        }
        await fetchHeader({ refreshSectionFieldsFlag: true });
        itemLineDs.query(undefined, undefined, true);
        clearDsCacheData(purchaseRequestDs);
      }
      handleOperatePurModalLoading(false);
    } catch (err) {
      handleOperatePurModalLoading(false);
      throw err;
    }
  };

  // 引用申请立项确定事件
  const handlePurchaseRequestOk = async () => {
    const { selected } = purchaseRequestDs;
    const selectedRowKeys = selected.map((ele) => ele.toData().prLineId);
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.message.pleaseSelectAtleastOneData')
          .d('请至少选择一条数据'),
      });
      return false;
    }

    try {
      // 调用校验接口
      const ValidateResult = getResponse(
        await prLineBatchValidatePurchase({
          organizationId,
          prLineIdList: selectedRowKeys,
          customizeUnitCode: 'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT_NEW.LIST',
          configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
          sourceDocumentType: 'PROJECT',
        })
      );

      if (!ValidateResult) {
        return false;
      }

      // 校验提示框
      await validatorConfirmModal({
        response: ValidateResult,
        validatorType: 'highestValidatorType',
        validatorArrName: 'validateResults',
        onOk: () => {
          return submitPrLineToPurchase({ selectedRowKeys });
        },
        firstValidateSuccessCallback: () => {
          return submitPrLineToPurchase({ selectedRowKeys });
        }, // 首次提交即校验通过，处理后续逻辑
      });
      return false;
    } catch (err) {
      throw err;
    }
  };

  // 新增
  const handleAdd = () => {
    const newItemLine = {
      sourceProjectId,
      tenantId: organizationId,
      priceBatch: 1,
    };
    itemLineDs.create(newItemLine, 0);
  };

  // 复制
  const handleCopy = () => {
    const selectedRecords = itemLineDs.selected;
    if (!selectedRecords?.length) return;
    selectedRecords.forEach((r) => {
      const sourceJSONRecord = r.toData() || {};
      const copyItemLine = {
        ...sourceJSONRecord,
        projectLineItemNum: null,
        prNum: null,
        prLineNum: null,
        prDisplayLineNum: null,
        projectLineItemId: null,
        objectVersionNumber: null,
        prHeaderId: null,
        prLineId: null,
        creationDate: null,
        lastUpdateDate: null,
        itemAttachmentUuid: null,
      };
      // 埋点二开
      const remoteCopyItemLine = remote
        ? remote.process('SSRC_PROJECTSETUP_SP_UPDATE_PROCESS_COPY_ITEM', copyItemLine, {
            sourceRecord: r,
            sourceJSONRecord,
          })
        : copyItemLine;
      itemLineDs.create(remoteCopyItemLine, 0);
    });
  };

  // 引用申请
  const handleQuoteApply = async () => {
    const search = querystring.stringify({
      routeFrom: 'projectSetupUpdate',
      sourceProjectId,
      backPath: `/ssrc/new-project-setup/sp-update/${sourceProjectId}`,
    });
    let data = null;
    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_execution_link_old_tenant',
        organizationId,
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      if (isEmpty(data)) {
        const Props = {
          organizationId,
          PurchaseRequestDS: purchaseRequestDs,
          doubleUnitFlag,
          executionLinkFlag: 1,
        };
        prRequestModal.current = Modal.open({
          destroyOnClose: true,
          drawer: true,
          title: intl.get('ssrc.projectSetup.view.button.quoteApproval').d('引用申请立项'),
          children: <PurchaseRequestContent {...Props} />,
          style: { width: '80%' },
          okProps: {
            waitType: 'throttle',
            wait: 1200,
          },
          onOk: handlePurchaseRequestOk,
          onClose: () => clearDsCacheData(purchaseRequestDs),
        });
      } else {
        history.push({
          pathname: `/ssrc/new-project-setup/quoteApproval`,
          search,
        });
      }
    } catch (e) {
      throw e;
    }
  };

  // 批量删除
  const handleBatchDeleteItem = () => {
    const selectedRecords = itemLineDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('projectLineItemId')) || [];

    // 删除新增数据
    itemLineDs.remove(addRecords);

    if (!isEmpty(oldRecords)) {
      handleSetOperateLoading(true);
      // 删除线上数据
      itemLineDs
        .delete(oldRecords, {
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        })
        .then(async (res) => {
          if (getResponse(res)) {
            try {
              await fetchHeader({ refreshSectionFieldsFlag: true });
              await handleRefreshItemLine();
            } catch (err) {
              handleSetOperateLoading(false);
              throw err;
            }
          }
          handleSetOperateLoading(false);
        })
        .catch(() => {
          handleSetOperateLoading(false);
        });
    }
  };

  // 刷新表格 & 保留缓存的变更数据
  const handleRefreshItemLine = () => {
    const list = [
      itemLineDs.query(undefined, undefined, true),
      sectionOrPacketInfoDs.query(sectionOrPacketInfoDs.currentPage, undefined, true),
      supplierLineTableDs.query(supplierLineTableDs.currentPage, undefined, true),
    ];
    return Promise.all(list);
  };

  // 批量删除按钮、复制禁用逻辑
  const batchDisabledFlag = useMemo(() => {
    return (
      !itemLineDs ||
      !itemLineDs.selected?.length ||
      (!itemLineDs.length && !itemLineDs.cachedRecords?.length) ||
      itemLineDs?.status === 'loading'
    );
  }, [
    itemLineDs?.selected,
    itemLineDs.length,
    itemLineDs.cachedRecords?.length,
    itemLineDs?.status,
  ]);

  // 导入参数
  const importProps = useMemo(
    () => ({
      businessObjectTemplateCode: 'SSRC.PROJECT_LINE_ITEM',
      prefixPatch: SRM_SSRC,
      args: Object.assign(
        {},
        {
          tenantId: organizationId,
          organizationId,
          sourceProjectId,
          templateCode: 'SSRC.PROJECT_LINE_ITEM',
        }
      ),
      icon: 'archive',
      tenantId: organizationId,
      successCallBack: async () => {
        await fetchHeader({ refreshSectionFieldsFlag: true });
        await handleRefreshItemLine();
      },
    }),
    [organizationId, handleRefreshItemLine]
  );

  // table buttons
  const buttons = useMemo(
    () => [
      <Button name="add" funcType="flat" icon="playlist_add" onClick={handleAdd}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        name="copy"
        funcType="flat"
        icon="baseline-file_copy"
        disabled={batchDisabledFlag}
        onClick={handleCopy}
      >
        {intl.get('hzero.common.button.copy').d('复制')}
      </Button>,
      projectFrom === 'REFERENCE' && (
        <Button
          onClick={handleQuoteApply}
          name="quoteApply"
          wait={1200}
          waitType="throttle"
          icon="root"
        >
          {intl.get(`ssrc.projectSetup.view.button.spChange.quoteApply`).d('引用申请')}
        </Button>
      ),
      !sourceProjectId && (
        <Tooltip
          name="import"
          title={intl.get('ssrc.common.view.message.save.tip').d('请先保存。')}
          theme="light"
        >
          <Button
            name="import"
            funcType="flat"
            icon="archive"
            disabled={isNil(sourceProjectId)}
            permissionList={[
              {
                code: `ssrc.new-project-setup.update.button.material-import-new`,
                type: 'button',
                meaning:
                  intl.get('ssrc.projectSetup.view.message.title.projectSetup').d('寻源立项') -
                  intl
                    .get(`ssrc.projectSetup.view.message.button.materialImportNew`)
                    .d('(新)物料导入'),
              },
            ]}
          >
            {intl.get('hzero.common.import').d('导入')}
          </Button>
        </Tooltip>
      ),
      sourceProjectId && (
        <CommonImportNew
          name="import"
          buttonText={intl.get('hzero.common.import').d('导入')}
          buttonProps={{
            funcType: 'flat',
            disabled: isNil(sourceProjectId),
            permissionList: [
              {
                code: `ssrc.new-project-setup.update.button.material-import-new`,
                type: 'button',
                meaning:
                  intl.get('ssrc.projectSetup.view.message.title.projectSetup').d('寻源立项') -
                  intl
                    .get(`ssrc.projectSetup.view.message.button.materialImportNew`)
                    .d('(新)物料导入'),
              },
            ],
          }}
          {...importProps}
        />
      ),
      <Button
        name="delete"
        funcType="flat"
        icon="delete_sweep"
        onClick={handleBatchDeleteItem}
        disabled={batchDisabledFlag}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </Button>,
    ],
    [batchDisabledFlag, importProps, handleAdd, handleCopy, handleBatchDeleteItem]
  );

  return customizeTable(
    {
      code: getCustomizeUnitCode('itemLineTable'),
      buttonCode: getCustomizeUnitCode('itemLineTableBtn'),
    },
    <Table
      dataSet={itemLineDs}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: '4.5rem' }}
    />
  );
});

export default ItemLine;
