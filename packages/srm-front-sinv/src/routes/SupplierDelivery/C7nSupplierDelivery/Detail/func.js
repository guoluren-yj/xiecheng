/* -详情页按钮操作- */
import React from 'react';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import { Form, TextField, Select, Lov } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { refreshTab, openTab } from 'hzero-front/lib/utils/menuTab';
import {
  getLabelPermission,
  addLogistics,
  print,
  newPrintList,
  reImportERP,
} from '@/services/supplierDeliveryService';
import { save } from '@/services/purchaserDeliveryService';
import { c7nModal } from '@/routes/components/CustomSpecsModal';
import { useTable } from '../hooks';
import { globalPrint } from '@/routes/components/utils';
import notification from 'utils/notification';
import getColumnsAndDataSet from '../operationRecord';
import MessageBoard from '@/routes/components/C7nMessageBoard';
import styles from '@/routes/components/C7nMessageBoard/index.less';

async function handleRouteJump(dataSet) {
  const asnNum = dataSet.current.get('asnNum');
  if (!asnNum) return false;
  const data = ['srm.logistics.delivery.box.label.creation.ps.default'];
  const res = await getLabelPermission(data);
  if (Array.isArray(res) && res.length && res[0].approve) {
    openTab({
      key: `/sinv/box-label-creation`,
      title: '分摊门店',
      path: `/sinv/box-label-creation/list`,
      search: `?asnNum=${asnNum}`,
    });
    refreshTab('/sinv/box-label-creation');
  } else {
    notification.error({
      message: intl
        .get(`sinv.supplierDelivery.view.message.noPermission`)
        .d('当前角色没有【标签创建/查询】菜单的访问权限，请检查角色菜单后重试'),
    });
  }
}

async function handleLogisticsChange(dataSet, customizeForm, callback = (e) => e) {
  const LogisticForm = () =>
    customizeForm(
      {
        code: 'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS',
      },

      <Form labelLayout="float" columns={1} dataSet={dataSet}>
        <Lov name="logisticsCompany" />
        <TextField name="logisticsContactInfo" />
        <TextField name="logisticsCost" />
        <TextField name="expressNum" />
        <TextField name="logisticsPhoneNum" addonBefore={<Select name="internationalTelCode" />} />
        <TextField name="logisticsStaff" />
        <TextField name="carNumber" />
        <Select name="logisticsReceiptStatus" />
      </Form>
    );
  return c7nModal({
    title: intl.get(`sinv.supplierDelivery.view.message.addLogistics.title`).d('物流信息补录'),
    bodyStyle: {
      paddingTop: 0,
      paddingLeft: 0,
      paddingRight: 0,
    },
    children: (
      <>
        <Alert
          banner
          type="success"
          showIcon={false}
          message={
            <div className={styles['add-log-alert']}>
              <div
                className={styles['add-log-icon']}
                style={{ width: getCurrentLanguage() === 'en_US' ? '40px' : '16px' }}
              />
              <div>
                {intl
                  .get(`sinv.common.view.message.addLogistics.titleTooltip`)
                  .d(
                    '提示：为配合第三方物流公司升级查询服务，让您更精准地获取物流信息，建议您维护 “收件人手机号” 信息，感谢您的理解'
                  )}
              </div>
            </div>
          }
        />
        <div className={styles['add-log-form']}>
          <LogisticForm />
        </div>
      </>
    ),
    width: 520,
    onOk: async () => {
      const flag = await dataSet?.validate();
      const params = {
        ...dataSet?.current?.toData(),
        ...dataSet?.current?.toJSONData(),
      };
      if (flag) {
        const res = await addLogistics(params, 'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS');
        if (getResponse(res)) {
          notification.success();
          callback();
        }
        return true;
      }
      return false;
    },
  });
}

async function handleSave(DeliverHeaderDs, ShipHeaderInfoDs, baseInfoDs, callback = (e) => e) {
  const flag =
    (await DeliverHeaderDs?.validate()) &&
    (await ShipHeaderInfoDs?.validate()) &&
    (await baseInfoDs?.validate());
  if (flag && ShipHeaderInfoDs?.current?.get('_token')) {
    const originData = DeliverHeaderDs?.current?.toData();
    const params = {
      data: {
        ...originData,
        ...ShipHeaderInfoDs?.current?.toJSONData(),
        ...DeliverHeaderDs?.current?.toJSONData(),
        asnLineList: baseInfoDs.toData(),
      },
      customizeUnitCode:
        'SINV.SUPPLIER_DELIVERY.DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.BASIC_C7N,SINV.SUPPLIER_DELIVERY.DETAIL.OTHER,SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS,SINV.SUPPLIER_DELIVERY.DETAIL.HEADERSHIP,SINV.SUPPLIER_DELIVERY.DETAIL.BUTTONS.BTN,SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS',
    };
    const res = await save(params);
    if (getResponse(res)) {
      notification.success();
      callback();
    }
  }
}

async function handlePrint(asnHeaderId) {
  const tenantId = getCurrentOrganizationId();
  const params = {
    asnHeaderId,
    tenantId,
  };
  const res = await print(params);
  if (getResponse(res)) {
    globalPrint(res);
  }
}

async function handleOperateRecord(DeliverHeaderDs) {
  const asnHeaderId = DeliverHeaderDs?.current?.get('asnHeaderId');
  const query = {
    changeRecordFlag: 1,
    asnHeaderId,
  };
  const { OperationDs, columns } = getColumnsAndDataSet(query);
  return c7nModal({
    title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    style: { width: 820 },
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: useTable(OperationDs, columns),
  });
}

async function handleNewPrint(DeliverHeaderDs) {
  const originData = DeliverHeaderDs?.current?.toData();
  newPrintList([originData]).then((res) => {
    if (getResponse(res)) {
      globalPrint(res);
    }
  });
}

async function handleReImport(DeliverHeaderDs, baseInfoDs, callback) {
  const params = {
    ...DeliverHeaderDs?.current?.toData(),
    asnLineList: [baseInfoDs?.current?.toData()],
  };
  reImportERP([params]).then((res) => {
    if (getResponse(res)) {
      notification.success();
      callback();
    }
  });
}

async function handleOpenMessage(asnHeaderId) {
  c7nModal({
    footer: null,
    className: styles.messageAll,
    style: { width: 380 },
    title: intl.get(`sinv.supplierDelivery.view.message.message`).d('留言板'),
    mask: true,
    closable: true,
    children: <MessageBoard asnHeaderId={asnHeaderId} messageVisible />,
  });
}

export {
  handleRouteJump,
  handleLogisticsChange,
  handleSave,
  handlePrint,
  handleOperateRecord,
  handleNewPrint,
  handleReImport,
  handleOpenMessage,
};
