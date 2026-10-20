/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, cloneElement } from 'react';
import {
  Table,
  Modal,
  Form,
  DatePicker,
  Lov,
  TextField,
  Select,
  // Button,
  Tooltip,
  Icon,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import DocFlow from '_components/DocFlow';
import { observer } from 'mobx-react-lite';
import { isEmpty, compose, uniqBy, throttle } from 'lodash';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Button } from 'components/Permission';
import { getResponse } from 'utils/utils';

import CategoryLov from '@/routes/components/CategoryLov';
import { formatAumont, redirectToOther } from '@/routes/components/utils';
import { handleBatchOk } from '@/routes/QuotePurchaseRequisition/utils';
import { rfxToLine } from '@/services/quotePurchaseRequisitionService';
import SourcingResults from './SourcingResults';
import styles from './header.less';

const DetailInfo = (props) => {
  const {
    ds,
    // loading,
    loadings,
    poHeaderId,
    cuxRemote,
    customizeForm,
    customizeTable,
    batchMaintenanceDs,
    // getValues = e => e,
    fetchDetailHeader = (e) => e,
    // handleIncludedPriceFcous = e => e,
    sourcingResultsDs,
    history,
  } = props;

  const headerInfoDs = ds.getState('headerInfoDs');
  // 暂时按采购申请处理
  const canEdit = !(
    headerInfoDs?.toJSONData()[0]?.sourceBillTypeCode === 'PURCHASE_REQUEST' &&
    [1, 2].includes(headerInfoDs?.toJSONData()[0]?.unSaveEnable)
  );

  const handleDelete = () => {
    const { selected = [], totalCount } = ds;
    const validSelected = selected.filter((i) => i.get('poLineLocationId')) || [];
    if (selected) {
      if (validSelected.length >= totalCount) {
        notification.warning({
          message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
        });
        return;
      }
    }
    ds.delete(selected).then((res) => {
      if (res && res.success) {
        ds.remove(selected, true);
        fetchDetailHeader(true);
      }
    });
  };

  const handleBatchMaintenance = () => {
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑'),
      children: (
        <Fragment>
          <Alert
            className={styles['order-top-title-alert']}
            border={false}
            message={
              <div>
                <Icon type="help" />
                {!isEmpty(ds.selected)
                  ? intl
                      .get(`sodr.workspace.view.alert.batchAllMaintainData`, {
                        num: ds.selected.length,
                      })
                      .d(`已勾选${ds.selected.length}条数据进行批量编辑`)
                  : intl
                      .get('sodr.workspace.view.alert.currentPagebatchAllMaintain')
                      .d('针对当前页全部数据进行批量编辑')}
              </div>
            }
            closable
          />

          {customizeForm(
            {
              code: 'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
            },
            <Form dataSet={batchMaintenanceDs} columns={1} labelLayout="float">
              <Lov name="invOrganizationId" />
              <Lov
                name="invInventoryId"
                disabled={!batchMaintenanceDs?.current?.get('invOrganizationId.organizationId')}
              />
              <DatePicker name="needByDate" />
              <Lov name="taxId" />
              <Lov name="costId" />
            </Form>
          )}
        </Fragment>
      ),
      onOk: throttle(
        () =>
          handleBatchOk({
            ds,
            batchMaintenanceDs,
            headerInfoDs,
            remote: cuxRemote,
            remoteCode: 'SODR.ORDER_MAINTENANCE_SEARCHFORTHESOURCE_C7N',
          }),
        THROTTLE_TIME,
        {
          trailing: false,
        }
      ),
    });
  };

  // const cancelHold = async () => {
  //   const { selected } = sourcingResultsDs;
  //   const one = selected.every((i) => i.get('pendingFlag') === 1);
  //   const zero = selected.every((i) => i.get('pendingFlag') === 0);
  //   if (!one && !zero) {
  //     return notification.warning({
  //       message: intl
  //         .get('sodr.sourceFrom.view.message.checkMark')
  //         .d('勾选行暂挂标识不一致,请检查!'),
  //     });
  //   }
  //   loading({ cancelHold: true });
  //   const resultList = selected.map((i) => ({
  //     tenantId,
  //     pendingFlag: i.get('pendingFlag') === 1 ? 0 : 1,
  //     type: 'SOURCE',
  //     resultId: i.get('resultId'),
  //     sourceContractConfigId: i.get('sourceContractConfigId'),
  //     poSourceContractConfigObjectVersionNumber: i.get('poSourceContractConfigObjectVersionNumber'),
  //   }));
  //   const res = getResponse(await pendingFlag(resultList));
  //   loading({ cancelHold: false });
  //   if (res) {
  //     sourcingResultsDs.unSelectAll();
  //     sourcingResultsDs.clearCachedSelected();
  //     sourcingResultsDs.query();
  //   }
  // };

  const handleCreateLine = async () => {
    const { selected } = sourcingResultsDs;
    const validateRes = await Promise.all(selected.map((i) => i.validate()));
    if (validateRes.findIndex((i) => !i) === -1) {
      const data = selected.map((i) => i.toJSONData());
      const res = getResponse(
        await rfxToLine({
          poHeaderId,
          data,
          query: { customizeUnitCode: 'SODR.PURCHASE_SOURCE_LIST.LINE' },
        })
      );
      if (res) {
        fetchDetailHeader(true);
      }
      return !!res;
    }
    return false;
  };

  const addSourcingResults = () => {
    const Footer = observer(({ dataSet, okBtn, cancelBtn }) => {
      const { selected } = dataSet;
      // const allPendingFlag =
      //   !isEmpty(selected) && selected.every((i) => i.get('pendingFlag') === 1);
      return (
        <Fragment>
          {cloneElement(okBtn, { disabled: isEmpty(selected) })}
          {/* <Button
            type="c7n-pro"
            icon={allPendingFlag ? 'unlock' : 'lock'}
            disabled={isEmpty(selected)}
            onClick={cancelHold}
          >
            {allPendingFlag
              ? intl.get(`sodr.orderMaintain.sourceFrom.cancelHold`).d('取消暂挂')
              : intl.get(`sodr.orderMaintain.sourceFrom.hold`).d('暂挂')}
          </Button> */}
          {cancelBtn}
        </Fragment>
      );
    });
    Modal.open({
      title: intl.get(`sodr.workspace.view.tabPane.sourcingResults`).d('引用寻源结果'),
      key: Modal.key(),
      drawer: true,
      destroyOnClose: true,
      style: { width: 1090 },
      children: (
        <SourcingResults
          dataSet={sourcingResultsDs}
          history={history}
          customizeTable={customizeTable}
        />
      ),
      okText: intl.get('hzero.common.button.creat').d('新建'),
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      okProps: {
        icon: 'add',
      },
      afterClose: () => {
        sourcingResultsDs.unSelectAll();
        sourcingResultsDs.clearCachedSelected();
      },
      onOk: throttle(handleCreateLine, THROTTLE_TIME, { trailing: false }),
      footer: (okBtn, cancelBtn) => {
        return <Footer okBtn={okBtn} cancelBtn={cancelBtn} dataSet={sourcingResultsDs} />;
      },
    });
  };

  const translate = (record) => {
    const fieldsMap = Object.keys(record.toData());
    const data = record.get([...fieldsMap]);
    const newRecord = ds.create({}, record.index + 1);
    newRecord.init({
      ...data,
      _token: null,
      poLineId: null,
      _status: 'create',
      displayLineNum: null,
      poLineLocationId: null,
      objectVersionNuber: null,
    });
  };

  const getButtons = () => {
    const Buttons = observer(({ dataSet }) => {
      return (
        <Fragment>
          <Button
            funcType="flat"
            icon="mode_edit"
            color="primary"
            type="c7n-pro"
            onClick={handleBatchMaintenance}
            disabled={!canEdit || isEmpty(ds.toJSONData())}
          >
            {dataSet.selected.length > 0 ? (
              <Tooltip
                title={intl
                  .get('sodr.quotePurchase.view.nStripTickaBtchEdit', {
                    n: dataSet.selected.length,
                  })
                  .d(`已勾选${dataSet.selected.length}条数据进行批量编辑`)}
              >
                {intl.get(`sodr.quotePurchase.view.button.tickaBtchEdit`).d('勾选批量编辑')}
              </Tooltip>
            ) : (
              <Tooltip
                title={intl
                  .get('sodr.quotePurchase.view.allBatchMaintain')
                  .d('批量编辑当前页全部数据')}
              >
                {intl.get(`sodr.quotePurchase.model.quotePurchase.batchMaintain`).d('批量编辑')}
              </Tooltip>
            )}
          </Button>
          <Button
            funcType="flat"
            icon="find_in_page"
            color="primary"
            type="c7n-pro"
            onClick={addSourcingResults}
            permissionList={[
              {
                code: `srm.po-admin.po.po-change.ps.detail.searchforthesource.quote`,
                type: 'button',
                meaning: '订单维护-引用寻源结果明细-引用寻源结果',
              },
            ]}
          >
            {intl.get(`sodr.workspace.view.tabPane.sourcingResults`).d('引用寻源结果')}
          </Button>
          <Button
            wait={THROTTLE_TIME}
            funcType="flat"
            color="primary"
            icon="delete"
            type="c7n-pro"
            loading={loadings.deleteLine}
            disabled={!dataSet.selected.length || !canEdit}
            onClick={handleDelete}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
        </Fragment>
      );
    });
    return [<Buttons dataSet={ds} />];
  };

  const getColumns = () => {
    const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
    const sodrEnabled = doubleUnitEnabled !== 0;
    const columns = [
      {
        name: 'translate', // H
        width: 70,
        renderer: ({ record }) => (
          <a
            disabled={!record.get('displayLineNum')}
            onClick={() => {
              translate(record);
            }}
          >
            {intl.get('sodr.workspace.model.common.translate').d('拆分')}
          </a>
        ),
      },
      {
        name: 'displayLineNum',
        width: 70,
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
      },
      // {
      //   name: 'projectCategory',
      //   width: 150,
      //   editor: true,
      // },
      {
        name: 'invOrganizationId',
        width: 150,
        editor: true,
      },
      {
        name: 'itemId',
        width: 150,
        editor: true,
      },
      {
        name: 'itemName',
        width: 150,
        editor: true,
      },
      {
        name: 'categoryId',
        width: 150,
        editor: (record) => <CategoryLov data={{ record, ds }} />,
      },
      {
        name: 'commonName',
        width: 120,
      },
      sodrEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        editor: true,
      },
      sodrEnabled && {
        name: 'secondaryUomId',
        width: 150,
        editor: true,
      },
      {
        name: 'quantity',
        width: 150,
        editor: true,
      },
      {
        name: 'uomId',
        width: 150,
        editor: true,
      },
      {
        name: 'currencyCode',
        width: 150,
        renderer: ({ value }) => value?.currencyCode || '',
      },
      {
        name: 'taxId',
        width: 150,
        editor: true,
      },
      {
        name: 'unitPrice',
        width: 150,
        editor: true,
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        editor: true,
      },
      {
        name: 'unitPriceBatch',
        width: 150,
        editor: true,
      },
      {
        name: 'invInventoryId',
        width: 150,
        editor: true,
      },
      {
        name: 'invLocationName',
        width: 150,
        editor: true,
      },
      {
        name: 'needByDate',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyName',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 150,
        editor: true,
      },
      {
        name: 'costId',
        width: 150,
        editor: true,
      },
      {
        name: 'accountSubjectId',
        width: 150,
        editor: true,
      },
      {
        name: 'wbsCode',
        width: 150,
        editor: true,
      },
      // {
      //   name: 'freeFlag',
      //   align: 'left',
      //   width: 150,
      //   editor: true,
      // },
      {
        name: 'returnedFlag',
        align: 'left',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveTelNum',
        width: 400,
        editor: (record) => {
          return <TextField addonBefore={<Select record={record} name="internationalTelCode" />} />;
        },
        renderer: ({ record, text }) =>
          [record.get('internationalTelCode'), text].filter(Boolean).join('-'),
      },
      {
        name: 'brand',
        width: 150,
        editor: true,
      },
      {
        name: 'specifications',
        width: 150,
        editor: true,
      },
      {
        name: 'model',
        width: 150,
        editor: true,
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        width: 150,
      },
      {
        name: 'contractNum',
        width: 150,
        editor: true,
      },
      {
        name: 'sourceNumAndLine',
        width: 150,
        renderer: ({ text, record }) => (
          <a onClick={() => redirectToOther('source', record.toData())}>
            {text === '|' ? '' : record.get('sourceNumAndLine') || record.get('sourceCodeNum')}
          </a>
        ),
      },
      {
        name: 'prRequestedName',
        width: 150,
      },
      {
        name: 'accountAssignTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'remark',
        width: 150,
        editor: true,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveToleranceQuantityType', // H
        width: 150,
        editor: true,
      },
      {
        name: 'receiveToleranceQuantity',
        width: 150,
        editor: true,
      },
      {
        name: 'purchaseLineTypeId',
        width: 120,
        editor: true,
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
      },
      {
        name: 'domesticUnitPrice',
        width: 150,
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
        renderer: ({ value }) =>
          formatAumont(value, headerInfoDs?.current?.get('domesticFinancialPrecision'), true),
      },
      {
        name: 'domesticLineAmount',
        width: 150,
        renderer: ({ value }) =>
          formatAumont(value, headerInfoDs?.current?.get('domesticFinancialPrecision'), true),
      },

      {
        name: 'budgetAccountId',
        width: 150,
        editor: true,
      },
      {
        name: 'subSupplierId',
        width: 120,
      },
      {
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
    ];
    return uniqBy(columns, 'name').filter((i) => i);
  };

  // 获取个性化表格编码
  const getCustomizeTableCode = () => {
    const { poSourcePlatform } = ds.getState('headerInfoDs')?.toJSONData()[0] || {};
    let code;
    switch (poSourcePlatform) {
      case 'ERP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP';
        break;
      // case 'E-COMMERCE':
      //   code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
      //   break;
      case 'SRM':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'SHOP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      // case 'CATALOGUE':
      //   code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE';
      //   break;
      default:
        code = null;
        break;
    }
    return code;
  };

  return (
    <Fragment>
      {customizeTable(
        {
          // code: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.DETAILINFO',
          code: getCustomizeTableCode(),
          __force_record_to_update__: true,
          lovIgnore: false,
        },
        <Table
          spin={{ spinning: loadings.handleIncludedPriceFcous || loadings.conversionUpdate }}
          dataSet={ds}
          columns={getColumns()}
          buttons={getButtons()}
          editMode={canEdit ? 'cell' : 'inline'}
          selectionMode={canEdit ? 'rowbox' : 'none'}
          style={{ maxHeight: 450 }}
          // virtual
        />
      )}
    </Fragment>
  );
};

export default compose(observer)(DetailInfo);
