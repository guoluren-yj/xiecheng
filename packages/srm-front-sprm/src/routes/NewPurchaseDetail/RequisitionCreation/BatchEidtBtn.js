import React, { useContext, useCallback, useState, useEffect } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { Alert } from 'choerodon-ui';
import { Button, Tooltip, Modal, TextField, DatePicker, Lov, Icon, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { Store } from '../stores';
import styles from '../index.less';

const BatchEidtBtn = function BatchEidtBtn() {
  const {
    headerDs,
    listDs,
    prSourcePlatform,
    batchMaintainDs,
    customizeForm,
    lineDsSaveFlag,
    cuxBatchFormComponent,
    cuxBatchFormTakeCondition,
    handleCuxBatchMaintainForm,
    handleCuxEditMaintainDs,
    handleCuxListData,
    handleCuxPushField,
    handleSetDisabled,
    handleCuxBatchEditFeild,
    remote,
  } = useContext(Store) || {};

  // const { current } = headerDs;

  const [batchMaintainInfo, setBatchMaintainInfo] = useState({ fieldMapValues: [] });

  const handleBatchOk = useCallback(() => {
    const batchOrganizationId = batchMaintainDs.current.get('invOrganizationId');
    if (batchOrganizationId) {
      batchMaintainDs.current.set({
        invOrganizationId: {
          ...batchOrganizationId,
          address: batchMaintainDs.current.get('receiveAddress'),
        },
      });
    }
    const [listData] = batchMaintainDs.toJSONData();
    const receiveAddress = prSourcePlatform === 'CATALOGUE' ? undefined : listData.receiveAddress;
    const trueListData = { ...listData, receiveAddress };

    const { selected, cachedModified } = listDs;
    const batchRecord = batchMaintainDs.current;
    // 获取字段设置值
    const fieldMapValues = [];
    const fields = batchMaintainDs.fields.toJSON();

    for (const i in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, i) && fields[i]) {
        const value = fields[i].getValue(batchRecord);
        const bind = fields[i].get('bind');
        const cuxPushFlag =
          typeof handleCuxPushField === 'function' ? handleCuxPushField({ i }) : false;
        if ((value || cuxPushFlag) && !bind) {
          fieldMapValues.push([i, value]);
        }
      }
    }

    // 全量批量维护
    if (selected.length === 0) {
      // 设置头字段值的批量编辑. 用于保存
      const { current } = headerDs || {};
      if (current) {
        current.init({
          ...(typeof handleCuxBatchEditFeild === 'function'
            ? handleCuxBatchEditFeild({ trueListData })
            : {}),
          batchEditFieldMap:
            typeof handleCuxListData === 'function'
              ? {
                  ...handleCuxListData({ trueListData }),
                  unitCode:
                    prSourcePlatform === 'SRM'
                      ? 'SPRM.PURCHASE_PLAFORM_CREATE.BATCH_EDIT'
                      : 'SPRM.PURCHASE_PLAFORM_CREATE.NOTSRM',
                }
              : {
                  ...trueListData,
                  unitCode:
                    prSourcePlatform === 'SRM'
                      ? 'SPRM.PURCHASE_PLAFORM_CREATE.BATCH_EDIT'
                      : 'SPRM.PURCHASE_PLAFORM_CREATE.NOTSRM',
                },
        });
      }
      // 用于加载下一页数据
      setBatchMaintainInfo({
        ...trueListData,
        fieldMapValues,
      });

      // 行缓存的数据
      cachedModified.forEach((i) => {
        fieldMapValues.forEach(([key, value]) => {
          const field = i.getField(key);
          // 特殊XXXLov字段设置
          // itemCodeLov  categoryLov  uomLov  taxLov  currencyLov  supplierCompanyIdLov  不设置批量维护
          if (
            ['projectCategory', 'invOrganizationId', 'inventoryId'].includes(key) &&
            !field.disabled &&
            value &&
            (typeof cuxBatchFormTakeCondition === 'function'
              ? cuxBatchFormTakeCondition({ listData, key })
              : true)
          ) {
            i.set({ [`${key}Lov`]: value });
          } else if (
            [
              'budgetAccountId',
              'expBearDepId',
              'accountSubjectId',
              'costId',
              'purchaseAgentId',
            ].includes(key) &&
            !field.disabled &&
            value
          ) {
            const lovKey = key.replace('Id', 'Lov');
            i.set({ [lovKey]: value });
          } else if (key === 'wbsCode') {
            i.set({ wbsLov: value });
          } else if (key === 'requestedBy') {
            i.set({ prRequestedLov: value });
          } else if (handleSetDisabled && key === 'itemCodeLov') {
            console.log('运行', { ...value, batchEdit: true });
            i.set({ [key]: { ...value, batchEdit: true } });
          } else if (
            !field.disabled &&
            value &&
            (typeof cuxBatchFormTakeCondition === 'function'
              ? cuxBatchFormTakeCondition({ listData, key })
              : true)
          ) {
            i.set({ [key]: value });
          } else if (handleSetDisabled) {
            i.set({ [key]: value });
          }
        });
      });
    }

    (isEmpty(selected) ? listDs : selected).forEach((i) => {
      fieldMapValues.forEach(([key, value]) => {
        const field = i.getField(key);
        // 特殊XXXLov字段设置
        // itemCodeLov  categoryLov  uomLov  taxLov  currencyLov  supplierCompanyIdLov  不设置批量维护
        if (
          ['projectCategory', 'invOrganizationId', 'inventoryId'].includes(key) &&
          !field.disabled &&
          value &&
          (typeof cuxBatchFormTakeCondition === 'function'
            ? cuxBatchFormTakeCondition({ listData, key })
            : true)
        ) {
          i.set({ [`${key}Lov`]: value });
        } else if (
          [
            'budgetAccountId',
            'expBearDepId',
            'accountSubjectId',
            'costId',
            'purchaseAgentId',
          ].includes(key) &&
          !field.disabled &&
          value
        ) {
          const lovKey = key.replace('Id', 'Lov');
          i.set({ [lovKey]: value });
        } else if (key === 'wbsCode') {
          i.set({ wbsLov: value });
        } else if (key === 'requestedBy') {
          i.set({ prRequestedLov: value });
        } else if (handleSetDisabled && key === 'itemCodeLov') {
          console.log('运行', { ...value, batchEdit: true });
          i.set({ [key]: { ...value, batchEdit: true } });
        } else if (
          !field.disabled &&
          value &&
          (typeof cuxBatchFormTakeCondition === 'function'
            ? cuxBatchFormTakeCondition({ listData, key })
            : true)
        ) {
          i.set({ [key]: value });
        } else if (handleSetDisabled) {
          i.set({ [key]: value });
        }
        console.log('key', key);
        batchMaintainDs.current.reset();
      });
    });

    batchMaintainDs.current.reset();
    if (typeof handleCuxEditMaintainDs === 'function') {
      handleCuxEditMaintainDs({ batchMaintainDs });
    }
  }, [batchMaintainDs, prSourcePlatform]);

  // 当页面保存时，清空批量带出的信息
  useEffect(() => {
    // console.log(lineDsSaveFlag, 3323223, 'lineDsSaveFlag');
    setBatchMaintainInfo({ fieldMapValues: [] });
  }, [lineDsSaveFlag]);

  useEffect(() => {
    const handleUpdate = ({ dataSet }) => {
      const { fieldMapValues = [] } = batchMaintainInfo;
      const batchEditFieldMap = headerDs?.current?.get('batchEditFieldMap');
      if (fieldMapValues.length > 0 && batchEditFieldMap) {
        dataSet.forEach((i) => {
          fieldMapValues.forEach(([key, value]) => {
            const field = i.getField(key);
            // 特殊XXXLov字段设置
            // itemCodeLov  categoryLov  uomLov  taxLov  currencyLov  supplierCompanyIdLov  不设置批量维护
            if (
              ['projectCategory', 'invOrganizationId'].includes(key) &&
              !field.disabled &&
              value
            ) {
              i.init({ [`${key}Lov`]: value });
            } else if (
              [
                'budgetAccountId',
                'expBearDepId',
                'accountSubjectId',
                'costId',
                'purchaseAgentId',
              ].includes(key) &&
              !field.disabled &&
              value
            ) {
              const lovKey = key.replace('Id', 'Lov');
              i.init({ [lovKey]: value });
            } else if (key === 'wbsCode') {
              i.init({ wbsLov: value });
            } else if (key === 'requestedBy') {
              i.init({ prRequestedLov: value });
            } else if (handleSetDisabled && key === 'itemCodeLov') {
              i.set({ [key]: { ...value, batchEdit: true } });
            } else if (!field.disabled && value) {
              i.init({ [key]: value });
            } else if (handleSetDisabled) {
              i.set({ [key]: value });
            }
          });
        });
      }
    };
    listDs.addEventListener('load', handleUpdate);
    return () => {
      listDs.removeEventListener('load', handleUpdate);
    };
  }, [listDs, batchMaintainInfo]);

  const handleBatchModal = async () => {
    const alertMessage = !isEmpty(listDs.selected)
      ? intl
          .get('sprm.common.view.alert.batchTickMaintain', {
            value: listDs.selected?.length,
          })
          .d(`已勾选${listDs.selected?.length}条数据进行批量编辑`)
      : intl.get('sprm.common.view.alert.batchAllMaintain').d('针对全部数据进行批量编辑');
    // eslint-disable-next-line no-unused-expressions
    batchMaintainDs.current?.set({ batchSelectFlag: isEmpty(listDs.selected) ? 0 : 1 }); // 是勾选还是全选标识
    const beforeOpenModal = await remote?.event?.fireEvent('beforeOpenModal', {
      selectedList: listDs.selected,
      batchMaintainDs,
      headerDs,
    });
    if (beforeOpenModal === false) {
      return;
    }
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: '380px' },
      bodyStyle: { overflowX: 'hidden' },
      destroyOnClose: true,
      title: intl.get('sprm.purchaseReqCreation.view.button.batchMaintain').d('批量维护'),
      children: (
        <div>
          <Alert
            className={styles['batch-all-edit-alert']}
            border={false}
            message={
              <div className={styles['batch-all-edit-alert-message']}>
                <Icon type="help" /> {alertMessage}
              </div>
            }
            closable
          />
          {customizeForm(
            {
              code:
                prSourcePlatform === 'SRM'
                  ? 'SPRM.PURCHASE_PLAFORM_CREATE.BATCH_EDIT'
                  : 'SPRM.PURCHASE_PLAFORM_CREATE.NOTSRM',
              __force_record_to_update__: true,
              dataSet: batchMaintainDs,
            },
            <Form dataSet={batchMaintainDs} labelLayout="float" useColon={false}>
              <DatePicker name="neededDate" />
              <Lov name="invOrganizationId" />
              <Lov name="inventoryId" />
              <Lov name="costId" />
              <Lov name="wbsCode" />
              {!['E-COMMERCE', 'CATALOGUE', 'SHOP'].includes(prSourcePlatform) &&
                (typeof cuxBatchFormComponent === 'function' ? (
                  cuxBatchFormComponent({ field: 'receiveAddress' })
                ) : (
                  <TextField name="receiveAddress" />
                ))}
              {!['E-COMMERCE', 'CATALOGUE', 'SHOP'].includes(prSourcePlatform) && (
                <TextField name="receiveContactName" />
              )}
              {!['E-COMMERCE', 'CATALOGUE', 'SHOP'].includes(prSourcePlatform) && (
                <TextField name="receiveTelNum" />
              )}
              {!['E-COMMERCE', 'CATALOGUE', 'SHOP'].includes(prSourcePlatform) && (
                <Lov name="budgetAccountId" />
              )}
              <TextField name="projectNum" />
              <TextField name="projectName" />
              <TextField name="remark" />
              <Lov name="projectCategory" />
              <Lov name="expBearDepId" />
              <Lov name="accountSubjectId" />
              <Lov
                name="projectTaskId"
                tableProps={{
                  mode: 'tree',
                  onRow: (row) => {
                    const handleSelect = ({ dataSet, record: _record }) => {
                      if (dataSet && _record) {
                        dataSet.select(_record);
                      }
                    };
                    return {
                      onClick: () => handleSelect(row),
                      onDoubleClick: () => {
                        if (row?.record?.selectable) {
                          handleSelect(row);
                          // eslint-disable-next-line no-unused-expressions
                          batchMaintainDs?.current?.set({
                            projectTaskId: row?.record?.toData(),
                          });
                          Modal.destroyAll();
                        }
                      },
                    };
                  },
                  selectionMode: 'rowbox',
                }}
              />
              {prSourcePlatform === 'SRM' &&
                typeof handleCuxBatchMaintainForm === 'function' &&
                handleCuxBatchMaintainForm({
                  selectedList: listDs.selected,
                  batchMaintainDs,
                  headerDs,
                })}
            </Form>
          )}
        </div>
      ),
      onOk: () => handleBatchOk(),
      onCancel: () => {
        batchMaintainDs.current.reset();
        if (typeof handleCuxEditMaintainDs === 'function') {
          handleCuxEditMaintainDs({ batchMaintainDs });
        }
      },
    });
  };

  return (
    <Tooltip
      title={
        isEmpty(listDs.selected)
          ? intl.get('sprm.common.view.tooltip.batchAllMaintain').d('批量编辑全部数据')
          : intl.get('sprm.common.view.tooltip.batchTickMaintain').d('勾选批量编辑')
      }
      key="batch"
    >
      <Button funcType="flat" icon="mode_edit" color="primary" onClick={() => handleBatchModal()}>
        {isEmpty(listDs.selected)
          ? intl.get('sprm.purchaseReqCreation.view.button.batchMaintain').d('批量维护')
          : intl.get('sprm.common.view.tooltip.batchTickMaintain').d('勾选批量编辑')}
      </Button>
    </Tooltip>
  );
};

export default observer(BatchEidtBtn);
