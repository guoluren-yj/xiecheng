/**
 * @Description:订单明细信息
 * @Date: 2021-09-16
 * @author: ljw <jiwei01.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo, Fragment } from 'react';
import { Table, Modal, Form, DatePicker, Tooltip } from 'choerodon-ui/pro';
import { Alert, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { Button } from 'components/Permission';

import Bom from '../../components/Bom';
import { renderStatus } from '@/routes/OrderExecutionWorkbench/components/utils';
import CustomSpecsModal from '@/routes/OrderExecutionWorkbench/components/CustomSpecsModal';
import { useUomRender, usePrecisionRender } from '@/routes/OrderExecutionWorkbench/hooks';
import styles from '../index.less';

const DetailInfo = (props) => {
  const {
    ds,
    customizeTable,
    customizeForm,
    collByLine,
    batchMaintenanceDs,
    basicInfoDs,
    bySourceCode,
    remote,
  } = props;
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
  const columns = useMemo(() => {
    const lineColumns = [
      {
        name: 'displayStatusCode',
        width: 120,
        renderer: ({ record }) =>
          renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
      },
      {
        name: 'displayLineNum',
        width: 80,
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
      },
      {
        name: 'domesticUnitPrice',
        width: 120,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localPrice')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localPrice')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'domesticLineAmount',
        width: 120,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localAmount', {
            bySourceCode,
          })({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localAmount', {
            bySourceCode,
          })({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'originalQuantity',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'quantity')({
            record,
            value,
            dataSet,
          }),
      },
      doubleUnitEnabled && {
        name: 'secondaryUomCodeAndName',
        width: 150,
        renderer: ({ record }) => record?.get('secondaryUomCodeAndName'),
      },
      {
        name: 'uomCodeAndName',
        width: 150,
        renderer: useUomRender,
      },
      {
        name: 'needByDate',
        width: 150,
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        editor: (record) => record.get('quantityEditFlag') === 1,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'secondaryQuantity')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'quantity',
        width: 150,
        editor: (record) => record.get('quantityEditFlag') === 1 && !doubleUnitEnabled,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'quantity')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'promiseDeliveryDate',
        width: 150,
        // editor: true,
        editor: (record) => record.get('deliveryDateEditFlag') === 1,
      },
      {
        name: 'unitPrice',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'price')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'lineAmount',
        width: 120,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'amount', { bySourceCode })({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'price')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'taxIncludedLineAmount',
        width: 120,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'amount', { bySourceCode })({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'unitPriceBatch',
        width: 80,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'inventoryName',
        width: 150,
      },
      {
        name: 'locationName',
        width: 150,
      },
      {
        name: 'consignedFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'returnedFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'freeFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'bom',
        width: 150,
        renderer: ({ record }) => (
          <a onClick={() => openBom(record)}>{intl.get('hzero.common.button.look').d('查看')}</a>
        ),
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        width: 150,
      },
      {
        name: 'sourceNumAndLine',
        width: 150,
      },
      {
        name: 'contractNum',
        width: 150,
      },
      {
        name: 'prRequestedName',
        width: 150,
      },
      {
        name: 'productNum',
        width: 150,
      },
      {
        name: 'productName',
        width: 150,
      },
      {
        name: 'catalogName',
        width: 150,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 150,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 150,
      },
      {
        name: 'receiveTelNum',
        width: 150,
      },
      {
        name: 'departmentName',
        width: 150,
      },
      {
        name: 'costName',
        width: 150,
      },
      {
        name: 'projectCategory',
        width: 150,
        renderer: ({ record }) => record.get('projectCategoryMeaning'),
      },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
      // 隐藏字段
      {
        name: 'productBrand',
        width: 150,
      },
      {
        name: 'productModel',
        width: 150,
      },
      {
        name: 'packingList',
        width: 150,
      },
      {
        name: 'purchaseLineTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'skuType',
        width: 120,
      },
      {
        name: 'customUomName',
        width: 120,
      },
      {
        name: 'customQuantity',
        width: 120,
      },
      {
        name: 'packageQuantity',
        width: 120,
      },
      {
        name: 'customSpecsJson',
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="customSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },
      {
        name: 'customSpecs',
        width: 150,
      },
      {
        name: 'productSpecsJson',
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="productSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },
      {
        name: 'productSpecs',
        width: 150,
      },
    ];
    return remote.process('processColumns', lineColumns);
  }, [doubleUnitEnabled]);
  const openBom = (record) => {
    Modal.open({
      footer: (okBtn, cancelBtn) => cancelBtn,
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      cancelProps: { color: 'primary' },
      closable: true,
      drawer: true,
      style: { width: 742 },
      title: intl.get('slod.orderExecution.view.title.bom').d('外协BOM'),
      children: (
        <Bom
          readOnly
          record={record}
          customizeTable={customizeTable}
          sourcePage="toBeFedBack"
          code="SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BOM"
        />
      ),
    });
  };

  const handleBatchOk = async () => {
    const map = {
      quantity: 'quantityEditFlag',
      promiseDeliveryDate: 'deliveryDateEditFlag',
    };
    const editorRule = (record, key) => (map[key] ? record.get(map[key]) === 1 : true);
    const dataRecord = batchMaintenanceDs.current;
    const data = batchMaintenanceDs.toJSONData()[0];
    const { __id, _status, ...others } = data;
    const fields = batchMaintenanceDs.fields.toJSON();
    const { selected, records, cachedModified } = ds;
    const listRecords = [...records, ...cachedModified];
    const initFields = batchMaintenanceDs.props.fields;
    const custStandardFields = [];
    const dataList = Object.keys(fields)
      .filter((i) => {
        const value = fields[i].getValue(dataRecord);
        const lable = fields[i].get('label');
        const isCustStandardField = !(
          initFields.find((n) => n.name === fields[i].name) || fields[i].name.includes('attribute')
        );
        if (isCustStandardField && lable && value) {
          custStandardFields.push(lable);
        }
        return !isCustStandardField && value && !['__id', '_status'].includes(i);
      })
      .map((i) => [i, fields[i].getValue(dataRecord)]);
    if (!isEmpty(custStandardFields)) {
      notification.error({
        message: intl
          .get(`sodr.workspace.view.message.hasCustStandardFields`, {
            fields: String(custStandardFields.map((i) => `【${i}】`)),
          })
          .d('{fields}为扩展的标准字段，不允许批量编辑！'),
      });
      return false;
    }
    if (isEmpty(selected)) {
      const fieldMap = ds.getState('fieldMap') || {};
      ds.setState({ fieldMap: { ...fieldMap, ...others } });
    }
    (isEmpty(selected) ? listRecords : selected).forEach((i) => {
      dataList.forEach(([key, value]) => {
        const field = i.getField(key);
        const editor = editorRule(i, key);
        if (!field.disabled && editor && !field.get('isCustomizeText')) {
          i.set({ [key]: value });
          i.setState({ batchFlag: true });
        }
      });
    });
    batchMaintenanceDs.reset();
  };

  const handleBatchMaintenance = () => {
    const { selected } = ds;
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: intl.get(`slod.orderExecution.view.button.batchEdit`).d('批量编辑'),
      children: (
        <Fragment>
          <Alert
            className={styles['order-top-title-alert']}
            border={false}
            message={
              <div>
                <Icon type="help" />
                {!isEmpty(selected)
                  ? intl
                      .get(`sodr.workspace.view.alert.batchAllMaintainData`, {
                        num: selected.length,
                      })
                      .d(`已勾选{num}条数据进行批量编辑`)
                  : intl
                      .get('sodr.workspace.view.alert.batchAllMaintain')
                      .d('针对全部数据进行批量编辑')}
              </div>
            }
            closable
          />
          {customizeForm(
            { code: 'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.BATCHEDITING' },
            <Form dataSet={batchMaintenanceDs} columns={1} labelLayout="float">
              <DatePicker name="promiseDeliveryDate" />
            </Form>
          )}
        </Fragment>
      ),
      onOk: handleBatchOk,
    });
  };

  const Buttons = useMemo(
    () =>
      observer(({ dataSet }) => {
        const { selected } = dataSet;
        return (
          <Tooltip
            title={
              !isEmpty(selected)
                ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
                : intl.get('sodr.workspace.view.tooltip.batchAllMaintain').d('批量编辑全部数据')
            }
          >
            <Button
              icon="mode_edit"
              funcType="flat"
              color="primary"
              type="c7n-pro"
              disabled={dataSet.length === 0}
              onClick={handleBatchMaintenance}
              permissionList={[
                {
                  code:
                    'srm.logistics.delivery.order.execution.workbench.ps.button.tobefedback.batchedit',
                  type: 'c7n-pro',
                  meaning: '销售方订单工作台-待反馈明细-批量编辑',
                },
              ]}
            >
              {!isEmpty(selected)
                ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
                : intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑')}
            </Button>
          </Tooltip>
        );
      }),
    []
  );
  return customizeTable(
    { code: 'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.DETAILINFO' },
    <Table
      dataSet={ds}
      columns={columns}
      selectionMode={collByLine === 2 ? 'rowbox' : 'none'}
      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
      style={{ maxHeight: '450px' }}
      virtual
      virtualCell
      buttons={
        remote
          ? remote.process(
              'SODR.SUPPLIERWORKSPACE_TOFEEDBACK_DETAIL_PROCESS_TABLE_BUTTON',
              [<Buttons dataSet={ds} />],
              {
                ds,
                basicInfoDs,
              }
            )
          : [<Buttons dataSet={ds} />]
      }
    />
  );
};

export default DetailInfo;
