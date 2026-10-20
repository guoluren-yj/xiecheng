import React, { useMemo } from 'react';
import { DataSet, Table, Modal, Icon, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
// import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { SRM_SSRC } from '_utils/config';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import {
  fetchSourceSupplierRelativeConfig,
  batchAddSupplier,
} from '@/services/quickInquiryService';
import SupplierFilterItemForm from '../Modal/SupplierFilterItemForm';
import { useStore } from '../store/index';
import { supplierLovDS } from '../store/supplierLineDS';

export default observer(function SupplierLine() {
  const {
    routerParams: { rfqHeaderId = '' } = {},
    commonDs: { supplierTableDs, basicFormDs } = {},
    isNewInquiry = false,
    customizeTable,
  } = useStore();

  const supplierLovDs = useMemo(() => new DataSet(supplierLovDS()), []);

  const fetchSourceSupplierRelativeConfigData = async () => {
    if (isNewInquiry) {
      return;
    }

    const params = {
      sourceHeaderId: rfqHeaderId,
      sourceFrom: 'quick_RFQ', // 快速询价
    };
    let result = {};
    try {
      result = await fetchSourceSupplierRelativeConfig(params);
      result = getResponse(result);
      if (!result) {
        return;
      }
      const { stageAllMismatchFlag = 0 } = result;
      if (stageAllMismatchFlag === 1) {
        notification.warning({
          message: intl
            .get(`ssrc.quickInquiry.model.inquiryHall.batchAddRFQSupplierMsg`)
            .d(
              '操作失败，失败原因是业务规则定义"可参与快速询价供应商设置"导致没有供应商可参与，请检查'
            ),
        });
      }

      const {
        reviewStatusList = null,
        existSuppliers = null,
        itemCategoryIds = null,
        sourceCode = null,
        stageIdList = null,
        expandObject = null, // 扩展对象
        erpFlag,
        companyIds,
        stageCompanyConditions, // 供应商生命周期控制
        queryItemIds = null,
      } = result;

      result = {
        defaultQueryItemCategoryIds: formatListToString(itemCategoryIds),
        supplyReviewStatus: formatListToString(reviewStatusList),
        sourceCode,
        erpFlag,
        excludeSupplierDetailDTOS: existSuppliers,
        stageIdList,
        companyIds,
        stageCompanyConditions,
        queryItemIds,
        ...(expandObject || {}),
      };
    } catch (e) {
      throw e;
    }

    return result;
  };

  const formatListToString = (list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  };

  // 批量添加供应商确定
  const newBulkAddSupplier = async () => {
    const data = supplierLovDs?.toData();
    const { supplierLovList = [] } = data?.[0] || {};

    if (isEmpty(supplierLovList)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    const selectLines = supplierLovList;

    const newParams = selectLines.map((item) => {
      const {
        mail,
        mobilephone,
        contactMail,
        contactPhone,
        name = null,
        supplierName,
        supplierCompanyName,
        supplierNum,
        supplierCompanyNum,
        internationalTelCode = null,
      } = item || {};
      return {
        ...item,
        contactName: name,
        rfqHeaderId,
        tenantId: getCurrentOrganizationId(),
        contactMail: mail || contactMail,
        sourceFrom: 'quick_RFQ',
        contactMobilephone: mobilephone || contactPhone,
        mobilephone: mobilephone || contactPhone,
        supplierCompanyName: supplierCompanyName || supplierName,
        supplierCompanyNum: supplierCompanyNum || supplierNum,
        internationalTelCode,
      };
    });
    batchAddSupplier({
      newParams,
      rfqHeaderId,
    }).then((res = []) => {
      supplierLovDs.loadData();
      if (getResponse(res)) {
        // 保留缓存的变更记录
        supplierTableDs.query(undefined, undefined, true);
        cancelBulkAddSupplier();
      }
    });
  };

  const cancelBulkAddSupplier = () => {
    supplierLovDs.clearCachedSelected();
    supplierLovDs.unSelectAll();
    supplierLovDs.reset();
  };

  const handleDeleteSupplier = () => {
    const data = supplierTableDs.selected;
    supplierTableDs.delete(data, {
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
  };

  // 供应商行分配物料
  const supplierLineAllotItem = (record = {}) => {
    return Modal.open({
      closable: true,
      destroyOnClose: true,
      drawer: true,
      key: 'supplier-filter-items',
      title: intl.get(`ssrc.quickInquiry.view.message.title.allotItemLine`).d('分配物料'),
      children: (
        <SupplierFilterItemForm
          supplierRecord={record}
          supplierTableDs={supplierTableDs}
          rfqHeaderId={rfqHeaderId}
          customizeTable={customizeTable}
        />
      ),
      style: { width: '742px' },
      okText: intl.get(`hzero.common.button.confirm`).d('确认'),
    });
  };

  // 改变联系人
  const changeSupplierContactId = (value = {}, record = {}) => {
    const {
      mobilephone = null,
      mail = null,
      name: contactName = null,
      companyContactId = null,
      internationalTelCode = null,
    } = value || {};
    record.set({
      contactMobilephone: mobilephone,
      contactMail: mail,
      contactAreaCode: internationalTelCode,
      supplierContactId: {
        supplierContactId: companyContactId,
        contactName,
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'supplierContactId',
        width: 180,
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="supplierContactId"
              onChange={(value) => changeSupplierContactId(value, record)}
            />
          );
        },
      },
      {
        name: 'contactMobilephone',
        width: 220,
        editor: true,
      },
      {
        name: 'contactMail',
        width: 250,
        editor: true,
      },
      {
        name: 'allotItem',
        header: intl.get(`ssrc.quickInquiry.view.message.button.allotItem`).d('分配物料'),
        width: 100,
        lock: 'right',
        renderer: ({ record }) =>
          record.get('rfqSupplierId') ? (
            <div>
              <a onClick={() => supplierLineAllotItem(record)}>
                {intl.get(`ssrc.quickInquiry.view.message.button.allotItem`).d('分配物料')}
                &nbsp;({record.get('itemAllotCount')}/{record.get('itemTotalCount')})
              </a>
              {record.get('itemAllotCount') === record.get('itemTotalCount') ? null : record.get(
                  'itemAllotCount'
                ) === 0 ? (
                  <Icon
                    type="brightness_o"
                    style={{ color: 'gray', marginLeft: '5px', marginTop: '-2px' }}
                  />
              ) : (
                <Icon
                  type="timelapse"
                  style={{ color: 'gray', marginLeft: '5px', marginTop: '-2px' }}
                />
              )}
            </div>
          ) : null,
      },
    ],
    []
  );

  const buttons = useMemo(
    () => [
      <TooltipButtonPro
        disabled={isNewInquiry}
        dataSet={supplierLovDs}
        name="supplierLovList"
        mode="button"
        funcType="flat"
        clearButton={false}
        icon="playlist_add"
        placeholder={intl
          .get('ssrc.quickInquiry.model.quickInquiry.button.bulkAddSupplier')
          .d('批量新增')}
        tooltipProps={{
          disabled: isNewInquiry,
          btnType: 'supplierLov',
          help: intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据'),
        }}
        modalProps={{
          style: { maxWidth: '1500px', width: '1000px' },
          onOk: () => newBulkAddSupplier(),
          onCancel: () => {
            supplierLovDs.loadData([]);
          },
        }}
        beforeQuery={fetchSourceSupplierRelativeConfigData}
      >
        {intl.get('ssrc.quickInquiry.model.quickInquiry.button.bulkAddSupplier').d('批量新增')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        name="delete"
        icon="delete_sweep"
        disabled={isEmpty(supplierTableDs?.selected)}
        onClick={handleDeleteSupplier}
        help={intl.get('ssrc.common.view.message.supplier-line.select.tip').d('请先勾选供应商行')}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </TooltipButtonPro>,
      <CommonImportNew
        name="supplierImport"
        businessObjectTemplateCode="SRM_C_SSRC_QUICK_RFQ_SUPPLIER"
        prefixPatch={SRM_SSRC}
        buttonText={intl.get(`ssrc.quickInquiry.view.button.supplierImport`).d('供应商导入')}
        buttonTooltip={
          !basicFormDs?.current?.get('hasCompanyFlag')
            ? intl
                .get('ssrc.quickInquiry.view.button.bulkAddSupplier.tips')
                .d('请先维护公司并保存。')
            : null
        }
        buttonProps={{
          icon: 'archive',
          funcType: 'flat',
          color: 'primary',
          disabled: !basicFormDs?.current?.get('hasCompanyFlag'),
        }}
        args={{
          rfqHeaderId,
          tenantId: getCurrentOrganizationId(),
          organizationId: getCurrentOrganizationId(),
          templateCode: 'SRM_C_SSRC_QUICK_RFQ_SUPPLIER',
        }}
        successCallBack={() => supplierTableDs.query()}
      />,
    ],
    [
      supplierLovDs,
      isNewInquiry,
      rfqHeaderId,
      supplierTableDs,
      supplierTableDs?.selected,
      basicFormDs?.current,
    ]
  );

  return customizeTable(
    {
      code: `SSRC.QUICK_INQUIRY.EDIT.LINE_SUPPLIER`,
      buttonCode: `SSRC.QUICK_INQUIRY.EDIT.LINE_SUPPLIER_BUTTONS`,
    },
    <Table
      dataSet={supplierTableDs}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: 420 }}
    />
  );
});
