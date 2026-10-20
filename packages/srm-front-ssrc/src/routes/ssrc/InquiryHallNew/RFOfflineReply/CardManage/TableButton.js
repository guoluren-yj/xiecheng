import React, { useMemo, useContext } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { isEmpty, noop } from 'lodash';

import notification from 'utils/notification';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';

import { addSupplierReply, deleteOfflineSupplierReply } from '@/services/rfService';
import { fetchSourceRFSupplierRelativeConfig } from '@/services/inquiryHallNewService';

import styles from './index.less';
import Store from '../store/index';

const RenderButtons = observer((props) => {
  const { initFetchSupplier = noop, size = 2 } = props;

  const {
    commonDs: { basicFormDs, supplierInfoDs },
    routerParams: { rfHeaderId, sourceCategory },
  } = useContext(Store);

  const bulkAddSupplierLovDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'supplierLov',
            type: 'object',
            lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
            multiple: true,
          },
        ],
      }),
    [supplierInfoDs, basicFormDs]
  );

  // 取消添加供应商
  const cancelAddSupplier = () => {
    bulkAddSupplierLovDs.clearCachedSelected();
    bulkAddSupplierLovDs.unSelectAll();
    bulkAddSupplierLovDs.reset();
  };

  // 头部按钮添加供应商
  const handleHeaderAddSupplier = async () => {
    const data = bulkAddSupplierLovDs?.toData();
    const { supplierLov = [] } = data?.[0] || {};
    const newParams = supplierLov.map((item) => {
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
        contactMail: mail || contactMail,
        sourceFrom: 'RF',
        contactPhone: mobilephone || contactPhone,
        mobilephone: mobilephone || contactPhone,
        supplierCompanyName: supplierCompanyName || supplierName,
        supplierCompanyNum: supplierCompanyNum || supplierNum,
        internationalTelCode,
      };
    });
    const res = await addSupplierReply({
      rfHeaderId,
      selectedList: newParams,
    });
    if (getResponse(res)) {
      initFetchSupplier(0, size || (basicFormDs?.current?.get('lineItemsFlag') ? 2 : 10));
    }
    cancelAddSupplier();
  };

  const fetchSourceSupplierRelativeConfigData = async () => {
    const params = {
      organizationId: getCurrentOrganizationId(),
      sourceHeaderId: rfHeaderId,
      sourceFrom: 'RF_OFFLINE',
      sourceCategory,
    };
    let result = {};
    try {
      result = await fetchSourceRFSupplierRelativeConfig(params);
      result = getResponse(result);
      if (!result) {
        return;
      }

      const {
        reviewStatusList = null,
        existSuppliers = null,
        itemCategoryIds = null,
        sourceCode = null,
        erpFlag = null,
        excludeSuppliers = null,
        srmFlag = null,
      } = result;

      result = {
        defaultQueryItemCategoryIds: formatListToString(itemCategoryIds),
        supplyReviewStatus: formatListToString(reviewStatusList),
        sourceCode,
        erpFlag,
        srmFlag,
        excludeSupplierDetailDTOS: excludeSuppliers,
        chooseDetailDTOS:
          basicFormDs?.current?.get('sourceMethod') === 'INVITE' ? existSuppliers : null, // 维护，过程控制-反选供应商，线下正选供应商
      };
    } catch (e) {
      throw e;
    }

    return result || {};
  };

  const formatListToString = (list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  };

  // 删除供应商列表
  const handleDelete = () => {
    const { selected } = supplierInfoDs;
    Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl.get('ssrc.inquiryHall.confirm.remove').d('确定删除吗?'),
      onOk: async () => {
        const selectedList = selected.map((item) => item?.toData()?.quotationHeaderId);
        const res = await deleteOfflineSupplierReply({
          rfHeaderId,
          selectedList,
        });
        if (getResponse(res)) {
          notification.success();
          supplierInfoDs.clearCachedSelected();
          supplierInfoDs.unSelectAll();
          initFetchSupplier(0, size || (basicFormDs?.current?.get('lineItemsFlag') ? 2 : 10));
        }
      },
    });
  };

  return (
    <div className={styles['offline-reply-table-buttons']}>
      <SupplierLov
        dataSet={bulkAddSupplierLovDs}
        name="supplierLov"
        mode="button"
        clearButton={false}
        icon="playlist_add"
        placeholder={intl.get('ssrc.rf.model.rf.button.addSupplier').d('新增供应商')}
        modalProps={{
          style: { maxWidth: '1500px', width: '1000px' },
          onOk: handleHeaderAddSupplier,
          okProps: {
            waitType: 'debounce',
            wait: 500,
          },
          onCancel: cancelAddSupplier,
        }}
        color="primary"
        funcType="flat"
        beforeQuery={fetchSourceSupplierRelativeConfigData}
        queryData={{ companyId: basicFormDs?.current?.get('companyId') }}
      >
        {intl.get('ssrc.rf.model.rf.button.addSupplier').d('新增供应商')}
      </SupplierLov>
      <TooltipButtonPro
        onClick={handleDelete}
        color="primary"
        funcType="flat"
        icon="delete_sweep"
        disabled={supplierInfoDs.selected.length === 0}
        help={intl
          .get('ssrc.common.view.message.quotation-line.select.tip')
          .d('请先勾选报价行')}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </TooltipButtonPro>
    </div>
  );
});

export default RenderButtons;
