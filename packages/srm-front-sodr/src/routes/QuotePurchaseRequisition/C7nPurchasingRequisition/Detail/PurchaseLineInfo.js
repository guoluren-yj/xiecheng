/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, cloneElement, useMemo } from 'react';
// import { observable, action } from 'mobx';
import {
  Table,
  Modal,
  NumberField,
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
// import uuid from 'uuid/v4';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { Button } from 'components/Permission';

import C7nPriceModal from '../../components/C7nPriceModal';
import Bom from '@/routes/components/Bom';
import CategoryLov from '@/routes/components/CategoryLov';
import { redirectToOther, formatAumont } from '@/routes/components/utils';
import CustomSpecsModal from '@/routes/components/CustomSpecsModal';
import { handleBatchOk } from '@/routes/QuotePurchaseRequisition/utils';
import { clearPoItemBOM, priceUpdate } from '@/services/orderWorkspaceService';
import LineQuotation from '../../NewPurchasingRequisition/LineQuotation';
import { prToLine } from '@/services/quotePurchaseRequisitionService';
// import styles from '../../index.less';
import styles from './header.less';

const DetailInfo = (props) => {
  const {
    ds,
    cuxRemote,
    setPrice,
    loadings,
    poHeaderId,
    customizeForm,
    customizeTable,
    priceUpdateList,
    getValues = (e) => e,
    handleIncludedPriceFcous = (e) => e,
    loading,
    batchMaintenanceDs,
    fetchDetailHeader = (e) => e,
    purchasingRequisitionDs,
  } = props;

  // 单据来源为 采购申请 且尚未保存头信息
  const headerInfoDs = ds.getState('headerInfoDs');
  const basicCurrent = headerInfoDs?.current;
  const summaryFlag = useMemo(() => {
    if (basicCurrent) {
      return basicCurrent.get('summaryFlag');
    }
  }, [basicCurrent]);
  const canEdit = !(
    headerInfoDs?.toJSONData()[0]?.sourceBillTypeCode === 'PURCHASE_REQUEST' &&
    [1, 2].includes(headerInfoDs?.toJSONData()[0]?.unSaveEnable)
  );

  const priceModalParams = (record) => {
    // const line = record.toJSONData();
    const line = record.toJSONData();
    const { poHeaderDetailDTO = {} } = getValues();
    return { poHeaderDetailDTO, poLineDetailDTOs: [line] };
  };

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

  const addPurchaseRequisition = () => {
    const Footer = observer(({ dataSet, okBtn, cancelBtn }) => {
      const { selected } = dataSet;
      return (
        <Fragment>
          {cloneElement(okBtn, { disabled: isEmpty(selected) })}
          {cancelBtn}
        </Fragment>
      );
    });
    Modal.open({
      title: intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请'),
      key: Modal.key(),
      drawer: true,
      destroyOnClose: true,
      style: { width: 1090 },
      children: <LineQuotation dataSet={purchasingRequisitionDs} />,
      okText: intl.get('hzero.common.button.creat').d('新建'),
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      okProps: {
        icon: 'add',
      },
      afterClose: () => {
        purchasingRequisitionDs.unSelectAll();
        purchasingRequisitionDs.clearCachedSelected();
      },
      onOk: throttle(handleCreateLine, THROTTLE_TIME, { trailing: false }),
      footer: (okBtn, cancelBtn) => {
        return <Footer okBtn={okBtn} cancelBtn={cancelBtn} dataSet={purchasingRequisitionDs} />;
      },
    });
    purchasingRequisitionDs.query();
  };

  const handleCreateLine = async () => {
    const { selected } = purchasingRequisitionDs;
    const validateRes = await Promise.all(selected.map((i) => i.validate()));
    if (validateRes.findIndex((i) => !i) === -1) {
      const data = selected.map((i) => i.toJSONData());
      const res = getResponse(
        await prToLine({
          poHeaderId,
          data,
          query: { customizeUnitCode: 'SODR.PURCHASE_REQUISITION_LIST.LINE' },
        })
      );
      if (res) {
        fetchDetailHeader(true);
      }
      return !!res;
    }
    return false;
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
              code:
                headerInfoDs?.current?.get('poSourcePlatform') === 'ERP'
                  ? 'SODR.ORDER_CREATE_LINE_LIST.BATCH_ERP'
                  : 'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
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
              <NumberField
                name="enteredTaxIncludedPrice"
                disabled={headerInfoDs?.current?.get('benchmarkPriceType') === 'NET_PRICE'}
              />
              <NumberField
                name="unitPrice"
                disabled={
                  headerInfoDs?.current?.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE' ||
                  headerInfoDs?.current?.get('benchmarkPriceType') === undefined
                }
              />
            </Form>
          )}
        </Fragment>
      ),
      onOk: throttle(
        () =>
          handleBatchOk({
            ds,
            batchMaintenanceDs,
            hasPriceLibrary: true,
            headerInfoDs,
            remote: cuxRemote,
            remoteCode: 'SODR_PURCHASE_REQUISITION_C7N',
          }),
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const handleUpdatePrice = throttle(
    () => {
      loading({ updatePrice: true });
      priceUpdate({
        poHeaderId,
        query: {
          // customizeUnitCode: `SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BASICINFO,SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ORGANIZATIONINFO,SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.DETAILINFO`,
          customizeUnitCode:
            'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION,SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
        },
      }).then((res) => {
        loading({ updatePrice: false });
        if (getResponse(res)) {
          fetchDetailHeader();
        }
      });
    },
    THROTTLE_TIME,
    { trailing: false }
  );

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
            icon="root"
            funcType="flat"
            color="primary"
            type="c7n-pro"
            onClick={handleUpdatePrice}
            loading={loadings.updatePrice || loadings.all}
            disabled={isEmpty(priceUpdateList)}
          >
            {intl.get(`sodr.workspace.view.button.quoteTheLatestPrice`).d('引用最新价格')}
          </Button>
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
          {canEdit && (
            <Button
              funcType="flat"
              color="primary"
              icon="contact_mail-o"
              type="c7n-pro"
              onClick={addPurchaseRequisition}
              disabled={!canEdit}
              loading={loadings.updatePrice || loadings.all}
              permissionList={[
                {
                  code: `srm.po-admin.po.po-change.ps.detail.purchasingrequisition.quote`,
                  type: 'button',
                  meaning: '订单维护-引用采购申请明细-引用采购申请',
                },
              ]}
            >
              {intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请')}
            </Button>
          )}
          <Button
            wait={THROTTLE_TIME}
            funcType="flat"
            color="primary"
            icon="delete"
            type="c7n-pro"
            loading={loadings.deleteLine || loadings.all}
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

  const openC7nPriceModal = (record) => {
    Modal.open({
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
      children: (
        <C7nPriceModal
          readOnly={false}
          customizeTable={customizeTable}
          summaryFlag={summaryFlag}
          params={priceModalParams(record)}
          customizeCode="SODR.ORDER_CREATE_LINE_LIST.PROPOSED.PRICE"
        />
      ),
      onOk: setPrice,
    });
  };

  const openBom = async (record) => {
    if (record.status === 'add') {
      Modal.info({
        children: intl
          .get('sodr.workspace.view.info.noSaveBomLine')
          .d('该订单行未保存，bom信息不能维护，请先保存！'),
      });
      return;
    }
    if (record.get('saveBomItemId') !== record.get('itemId')?.itemId) {
      const res = await getResponse(clearPoItemBOM({ poLineId: record.get('poLineId') }));
      if (res) {
        record.set({ saveBomItemId: record.get('itemId')?.itemId });
      }
    }
    Modal.open({
      footer: (okBtn, cancelBtn) => cancelBtn,
      cancelText: intl.get('hzero.common.btn.cancel').d('取消'),
      cancelProps: { color: 'primary' },
      closable: true,
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.view.title.bom').d('外协BOM'),
      children: (
        <Bom
          record={record}
          customizeTable={customizeTable}
          compatible={{
            queryPara: {
              itemId: record.get('itemId')?.itemId,
              poHeaderId: record.get('poHeaderId'),
              poLineId: record.get('poLineId'),
              poLineLocationId: record.get('poLineLocationId'),
            },
            createDefault: {
              needByDate: record.get('needByDate'),
              invOrganizationId: record.get('invOrganizationId')?.organizationId,
              invOrganizationName: record.get('invOrganizationId')?.organizationName,
              poHeaderId: record.get('poHeaderId'),
              poLineId: record.get('poLineId'),
              poLineLocationId: record.get('poLineLocationId'),
            },
          }}
          // code="SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BOM"
        />
      ),
    });
  };

  const getColumns = () => {
    const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
    const sodrEnabled = doubleUnitEnabled !== 0;
    const base = [
      {
        name: 'translate', // H
        width: 70,
        renderer: ({ record }) => (
          <a
            disabled={!canEdit || !record.get('displayLineNum')}
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
      {
        name: 'projectCategory',
        width: 150,
        editor: true,
      },
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
        name: 'skuType', // H
        width: 120,
      },
      {
        name: 'customUomName', // H
        width: 120,
      },
      {
        name: 'customQuantity', // H
        width: 120,
      },
      {
        name: 'packageQuantity', // H
        width: 120,
      },
      {
        name: 'customSpecsJson', // H
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="customSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },
      {
        name: 'customSpecs', // H
        width: 150,
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
        //   name: 'currencyLov'
        name: 'currencyCode',
        width: 150,
        editor: true,
      },
      {
        //   name: 'taxLov',
        name: 'taxId',
        width: 150,
        editor: true,
      },
      {
        name: 'lastPurchasePrice',
        width: 150,
        align: 'right',
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'priceLibraryId',
        width: 150,
        renderer: ({ record }) => {
          // const headerInfo = ds.getState('headerInfoDs').toJSONData()[0] || {};
          // const newPriceLibFlag = ds.getState('newPriceLibFlag');
          // const { modifyablePriceFlag, returnOrderFlag } = headerInfo;
          // const readOnly = !(
          //   [1, -1].includes(modifyablePriceFlag) &&
          //   newPriceLibFlag &&
          //   !returnOrderFlag
          // );
          // console.log('headerInfo', headerInfo);
          // console.log('line111', ds.toJSONData()[0]);
          return (
            <a disabled={!canEdit} onClick={() => openC7nPriceModal(record)}>
              {intl.get('sodr.workspace.model.common.referPrice').d('参考价格')}
            </a>
          );
        },
      },
      {
        //   name: 'invInventoryLov',
        name: 'invInventoryId',
        width: 150,
        editor: true,
      },
      {
        //   name: 'invLocationLov',
        name: 'invLocationName',
        width: 150,
        editor: true,
        renderer: ({ record }) => record.get('locationName'),
      },
      {
        name: 'needByDate',
        width: 150,
        editor: true,
      },
      {
        name: 'bom',
        width: 150,
        renderer: ({ record }) => {
          // console.log('record.get projectCategor', record.get('projectCategory'));
          // <Bom
          //   record={record}
          //   disabled={record.get('projectCategory') !== 'L' || !saved}
          //   customizeTable={customizeTable}
          //   code="SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BOM"
          // />
          return (
            <a
              disabled={record.get('projectCategory')?.value !== 'L'}
              onClick={() => openBom(record)}
            >
              {intl.get('hzero.common.button.maintain').d('维护')}
            </a>
          );
        },
      },
      {
        //   name: 'departmentLov',
        name: 'departmentId',
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
        // name: 'costLov',
        name: 'costId',
        width: 150,
        editor: true,
      },
      {
        // name: 'accountSubjectLov', // H
        name: 'accountSubjectId',
        width: 150,
        editor: true,
      },
      {
        // name: 'wbsLov', // H
        name: 'wbsCode',
        width: 150,
        editor: true,
      },
      {
        name: 'freeFlag',
        align: 'left',
        width: 150,
        editor: true,
      },
      {
        name: 'returnedFlag',
        align: 'left',
        width: 150,
        editor: true,
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
        name: 'sourceNumAndLine',
        width: 150,
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => redirectToOther('purchase', record.toData())}>{value}</a>
        ),
      },

      // 为其他来源字段，不该显示
      // {
      //   name: 'sourceNumAndLine',
      //   width: 150,
      //   renderer: ({ text, record }) =>
      //     text === '|' ? '' : record.get('sourceNumAndLine') || record.get('sourceCodeNum'),
      // },
      {
        name: 'prRequestedName',
        width: 150,
      },
      {
        // name: 'accountAssignTypeLov',
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
        // name: 'subSupplierLov', // H
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
      // {
      //   name: 'lastPurchasePrice',
      //   width: 150,
      //   renderer: ({ value }) => numberRender(value),
      // },

      // 默认隐藏字段

      // {
      //   name: 'priceSource',
      //   width: 150,
      //   renderer: ({ record }) => record.get('priceSourceMeaning'),
      // },
      // {
      //   name: 'priceSourceNum',
      //   width: 150,
      // },
      // {
      //   name: 'priceSourceLineNum',
      //   width: 150,
      // },
      // {
      //   name: 'sourceNumAndLine',
      //   width: 150,
      //   renderer: ({ text, record }) =>
      //     text === '|' ? '' : record.get('sourceNumAndLine') || record.get('sourceCodeNum'),
      // },
    ];
    const conract = [
      {
        name: 'canHoldPrQuantity',
        width: 150,
      },
      {
        name: 'canHoldPcQuantity',
        width: 150,
      },
      {
        name: 'unitPrice',
        width: 150,
        editor: (record) => (
          <NumberField
            onFocus={() => {
              handleIncludedPriceFcous(record, 'price');
            }}
          />
        ),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        editor: (record) => (
          <NumberField
            onFocus={() => {
              handleIncludedPriceFcous(record, 'price');
            }}
          />
        ),
      },
      {
        // name: 'contractLov',
        name: 'contractNum',
        width: 150,
        editor: true,
      },
      {
        name: 'unitPriceBatch',
        width: 150,
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
        name: 'receiveTelNum', // H
        width: 400,
        editor: (record) => {
          return <TextField addonBefore={<Select record={record} name="internationalTelCode" />} />;
        },
        renderer: ({ record, text }) =>
          [record.get('internationalTelCode'), text].filter(Boolean).join('-'),
      },
      {
        name: 'budgetAccountId',
        width: 150,
        editor: true,
      },
    ];
    const erp = [
      {
        name: 'unitPrice',
        width: 150,
        editor: (record) => (
          <NumberField
            onFocus={() => {
              handleIncludedPriceFcous(record, 'price');
            }}
          />
        ),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        editor: (record) => (
          <NumberField
            onFocus={() => {
              handleIncludedPriceFcous(record, 'price');
            }}
          />
        ),
      },
      {
        name: 'unitPriceBatch',
        width: 150,
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
        name: 'receiveTelNum', // H
        width: 400,
        editor: (record) => {
          return <TextField addonBefore={<Select record={record} name="internationalTelCode" />} />;
        },
      },
      {
        name: 'budgetAccountId',
        width: 150,
        editor: true,
      },
    ];
    const columns = ds.getState('conractFlag') ? base.concat(conract) : base.concat(erp);
    return uniqBy(columns, 'name');
  };

  // 获取个性化表格编码
  const getCustomizeTableCode = () => {
    const { poSourcePlatform } = ds.getState('headerInfoDs')?.toJSONData()[0] || {};
    let code;
    switch (poSourcePlatform) {
      case 'ERP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP';
        break;
      case 'E-COMMERCE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
        break;
      case 'SRM':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'SHOP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'CATALOGUE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE';
        break;
      default:
        code = null;
        break;
    }
    return code;
  };

  // console.log('申请转 行ds', ds.toJSONData()[0]);
  return (
    <Fragment>
      {!isEmpty(priceUpdateList) && (
        <Alert
          message={intl
            .get(`sodr.workspace.view.message.priceUpdate`)
            .d('价格库价格有更新，可点击下方左上角“引用最新价格”按钮获取最新价格')}
          type="info"
          showIcon
        />
      )}
      {customizeTable(
        {
          // code: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.DETAILINFO',
          code: getCustomizeTableCode(),
          __force_record_to_update__: true,
          lovIgnore: false,
        },
        <Table
          // virtual
          spin={{ spinning: loadings.handleIncludedPriceFcous || loadings.conversionUpdate }}
          dataSet={ds}
          columns={getColumns()}
          buttons={getButtons()}
          editMode={canEdit ? 'cell' : 'inline'}
          selectionMode={canEdit ? 'rowbox' : 'none'}
          style={{ maxHeight: 450 }}
        />
      )}
    </Fragment>
  );
};

export default compose(observer)(DetailInfo);
