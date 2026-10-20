import React, { createElement } from 'react';
import { getResponse, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import notification from 'utils/notification';
import { Icon, TextField, Form, Select, Lov, DataSet } from 'choerodon-ui/pro';
import { Tag, Alert } from 'choerodon-ui';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import BomRecord from '../Pop/Bom/BomRecord';
import ExectRecord from '../Pop/Exect/ExectRecord';
import { c7nModal } from '@/routes/components/CustomSpecsModal';
import C7nMessageBoard from '@/routes/components/C7nMessageBoard';
import styles from '@/routes/components/C7nMessageBoard/index.less';
import { print, addLogistics } from '@/services/purchaserDeliveryService';
import OperateAndApprove from '../Pop/OperateAndApprove';
import LogisticsDataSet from '../C7nPages/NewDetail/DataSource/LogisticsDs';
import RelationComp from '../CustRelationComp/index';

// 按钮样式排序
export function btnNumber(arr) {
  const showBtns = [];
  const foldBtns = [];
  arr
    .filter((item) => item)
    .forEach((btn, index) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      const { funcType, color } = btnProps;
      const newFuncType = funcType || (index === 0 ? 'raised' : 'flat');
      const newColor = color || (index === 0 ? 'primary ' : 'default');
      const pushArr = index < 5 ? showBtns : foldBtns;
      if (!group && !btnComp) {
        pushArr.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, funcType: newFuncType, color: newColor, key: name },
        });
      } else {
        pushArr.push(btn);
      }
    });
  return foldBtns.length
    ? [
        ...showBtns,
        {
          name: 'more',
          group: true,
          children: foldBtns,
          child: createElement(Icon, { type: 'more_horiz' }),
        },
      ]
    : showBtns;
}

// 状态样式
export function colorRender(record, code) {
  const value = record.get(code);
  const meaning = record.get(`${code}Meaning`);
  switch (value) {
    case 'SHIPPED':
      // 绿色：已完成
      return (
        <Tag color="#ebf7f1" style={{ color: '#47b883' }}>
          <span>{meaning}</span>
        </Tag>
      );
    case '':
      // 红色：警告
      return (
        <Tag color="#ffeeeb" style={{ color: '#f56649' }}>
          <span>{meaning}</span>
        </Tag>
      );
    case 'CLOSED':
      //  灰色：结束、未开始
      return (
        <Tag color="#F0F0F0" style={{ color: '#595959' }}>
          <span>{meaning}</span>
        </Tag>
      );
    default:
      // 橙色：过程中
      return (
        <Tag color="#fef4e2" style={{ color: '#fca400' }}>
          <span>{meaning}</span>
        </Tag>
      );
  }
}

/**
 * 双单位展示 - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
 * @param {*} record 记录
 * @param {*} code 单位code
 * @param {*} name 单位name
 * @returns 单位名称 / 单位名称+编码
 */
export const showUomText = (record, code, name) => {
  let text =
    record.get(name) && record.get(code) ? (
      <span>{`${record.get(code)}/${record.get(name)}`}</span>
    ) : (
      record.get(name)
    );
  if (!isNil(record.get('unitCodeIsShow'))) {
    text =
      record.get('unitCodeIsShow') === '1' && record.get(code) && record.get(name)
        ? `${record.get(code)}/${record.get(name)}`
        : record.get(name);
  }
  return text;
};

// 打印
export const handlePrint = async (asnHeaderId, callBack = (e) => e) => {
  const tenantId = getCurrentOrganizationId();
  const params = {
    asnHeaderId,
    tenantId,
  };
  const res = await print(params);
  if (getResponse(res)) {
    if (res && res.type === 'application/json') {
      const reader = new FileReader();
      reader.readAsText(res, 'utf-8');
      reader.onload = () => {
        const readerres = reader.result;
        const parseObj = JSON?.parse(readerres);
        notification.error({ message: parseObj.message });
      };
    } else if (res && res.type === 'application/pdf') {
      const file = new Blob([res], { type: 'application/pdf' });
      const fileURL = URL?.createObjectURL(file);
      const printWindow = window?.open(fileURL);
      if (printWindow && !isNil(printWindow)) {
        printWindow.print();
      }
    }
  }
  callBack();
};

// 外协Bom弹框
export const handleBomRecord = (record) => {
  const listProps = {
    poHeaderId: record.get('asnHeaderId'),
    poLineId: record.get('asnLineId'),
    ds: record.dataSet,
  };
  c7nModal({
    style: { width: 820 },
    title: `${intl.get(`sinv.common.model.common.titleBom`).d('外协BOM')}`,
    children: <BomRecord {...listProps} />,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
};

// 导入状态弹框
export const handleExectRecord = (record) => {
  const listProps = { asnHeaderId: record.get('asnHeaderId') };
  c7nModal({
    style: { width: 820 },
    title: `${record.get('asnTypeCodeMeaning')}${record.get('asnNum')}`,
    children: <ExectRecord {...listProps} />,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
};

// 留言板弹框
export const handleOpenMessage = (asnHeaderId) => {
  const listProps = { asnHeaderId };
  c7nModal({
    className: styles.messageAll,
    style: { width: 380 },
    title: intl.get(`sinv.common.view.title.detail.message`).d('留言板'),
    closable: true,
    children: <C7nMessageBoard {...listProps} />,
    footer: null,
  });
};

// 操作记录/审批记录 弹框
export const handleOperationRecord = (asnHeaderId) => {
  const listProps = { asnHeaderId };
  c7nModal({
    style: { width: 920 },
    title: intl.get(`sinv.common.model.common.operationRecord`).d('操作记录'),
    children: <OperateAndApprove {...listProps} />,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
};

// 物流信息补录弹框
export const handleAddLogisticInfo = (params = {}, callBack = (e) => e) => {
  const { customizeForm, customizeUnitCode, headInfo, configSheetFlag = false } = params;
  const logisticsDs = new DataSet(LogisticsDataSet());
  logisticsDs.setState('configSheetFlag', configSheetFlag);
  logisticsDs.create(headInfo, 0);
  const addLogistic = async () => {
    const flag = await logisticsDs.validate();
    const data = {
      asnHeaderId: headInfo.asnHeaderId,
      _token: headInfo._token,
      objectVersionNumber: headInfo.objectVersionNumber,
      ...logisticsDs.current.toData(),
    };
    if (flag) {
      const res = await addLogistics(data, customizeUnitCode);
      if (getResponse(res)) {
        notification.success();
        callBack();
      }
    } else {
      return false;
    }
  };
  c7nModal({
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
          className={styles['add-alert']}
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
          {customizeForm(
            {
              code: customizeUnitCode,
            },
            <Form labelLayout="float" dataSet={logisticsDs} columns={1}>
              <Lov name="logisticsCompany" />
              <TextField name="logisticsStaff" />
              <TextField name="logisticsContactInfo" />
              <TextField name="logisticsCost" />
              <TextField name="expressNum" />
              <TextField
                name="logisticsPhoneNum"
                pattern={/1[3-9]\d{9}/g}
                addonBefore={<Select name="internationalTelCode" />}
              />
              <Select name="logisticsReceiptStatus" />
              <TextField name="carNumber" />
            </Form>
          )}
        </div>
      </>
    ),
    okText: intl.get('hzero.common.button.sure').d('确认'),
    onOk: addLogistic,
  });
};

// 关联单据弹框
export const handleRelation = (_obj) => {
  const listProps = { ..._obj };
  c7nModal({
    style: { width: 820 },
    drawer: true,
    title: intl.get(`sinv.common.model.common.relationDanju`).d('关联单据'),
    children: <RelationComp {...listProps} />,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
};
