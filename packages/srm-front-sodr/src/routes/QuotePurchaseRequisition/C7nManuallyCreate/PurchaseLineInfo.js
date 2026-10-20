/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useCallback, useMemo } from 'react';
import {
  Table,
  Modal,
  NumberField,
  Form,
  DatePicker,
  Lov,
  TextField,
  Select,
  Tooltip,
  Icon,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import DocFlow from '_components/DocFlow';
import { observer } from 'mobx-react-lite';
import { Button } from 'components/Permission';

import { isEmpty, compose, uniqBy, throttle } from 'lodash';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getResponse } from 'utils/utils';
import { stringify } from 'querystring';
import notification from 'utils/notification';
import { numberRender } from 'utils/renderer';
import { formatAumont } from '@/routes/components/utils';
import CategoryLov from '@/routes/components/CategoryLov';
import CommonImport from 'hzero-front/lib/components/Import';
import TooltipButton from '@/routes/components/TooltipButton';
import C7nPriceModal from '../../components/C7nPriceModal';
import { handleBatchOk } from '@/routes/QuotePurchaseRequisition/utils';
import { MAX_QUAN_NUMBER, THROTTLE_TIME } from '@/routes/components/utils/constant';
import Bom from '@/routes/components/Bom';
// import CustomSpecsModal from '@/routes/components/CustomSpecsModal';
import { clearPoItemBOM, priceUpdate } from '@/services/orderWorkspaceService';
import styles from './header.less';

const DetailInfo = (props) => {
  const {
    ds,
    history,
    setPrice,
    loadings,
    cuxRemote,
    poHeaderId,
    customizeForm,
    customizeTable,
    priceUpdateList,
    getValues = (e) => e,
    handleIncludedPriceFcous = (e) => e,
    loading,
    batchMaintenanceDs,
    fetchDetailHeader = (e) => e,
  } = props;

  // 单据来源为 采购申请 且尚未保存头信息
  const headerInfoDs = ds?.getState('headerInfoDs');
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

  const handleCreate = () => {
    const headerCurrent = headerInfoDs?.current || {};
    getValues();
    ds.create({
      currencyCode: headerCurrent.get('currencyCode')?.currencyCode,
      defaultPrecision: headerCurrent.get('defaultPrecision'),
      projectCategory: ds.getState('defaultProjectCategory'),
      projectCategoryMeaning: ds.getState('defaultProjectCategoryMeaning'),
      // organizationCode: headerCurrent.get('organizationCode'),
      invOrganizationId: ds.getState('defaultOrgId'),
      invOrganizationName: ds.getState('defaultOrgName'),
    });
  };

  const handleDelete = () => {
    const { selected = [], totalCount } = ds;
    const { statusCode } = headerInfoDs?.current?.toJSONData() || {};
    const validSelected = selected.filter((i) => i.get('poLineLocationId')) || [];
    if (!isEmpty(validSelected)) {
      if (validSelected.length >= totalCount && statusCode === 'REJECTED') {
        notification.warning({
          message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
        });
        return;
      }
      ds.delete(selected).then((res) => {
        if (getResponse(res)) {
          ds.remove(selected, true);
          fetchDetailHeader(true);
        }
      });
    } else {
      Modal.confirm({
        title: intl.get(`sodr.common.model.common.deltetLists`).d('是否删除数据？'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          async () => {
            ds.remove(selected);
          },
          THROTTLE_TIME,
          { trailing: false }
        ),
      });
    }
  };
  //   const { value, meaning } = item || {};
  //   if (['taxId', 'invInventoryId', 'costId', 'invOrganizationId'].includes(value)) {
  //     return <Lov name={value} />;
  //   } else if (['needByDate'].includes(value)) {
  //     return <DatePicker name="needByDate" />;
  //   } else if (['enteredTaxIncludedPrice'].includes(value)) {
  //     return (
  //       <NumberField
  //         name="enteredTaxIncludedPrice"
  //         disabled={headerInfoDs?.current?.get('benchmarkPriceType') === 'NET_PRICE'}
  //       />
  //     );
  //   } else if (['unitPrice'].includes(value)) {
  //     return (
  //       <NumberField
  //         name="unitPrice"
  //         disabled={
  //           headerInfoDs?.current?.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE' ||
  //           headerInfoDs?.current?.get('benchmarkPriceType') === undefined
  //         }
  //       />
  //     );
  //   } else {
  //     return <TextField label={meaning} name={value} />;
  //   }
  // };

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
              {/* {batchMaintain.map((i) => batchMaintenanceItem(i))} */}
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
            remoteCode: 'SODR_MANUALCREATEION_C7N',
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
            icon="playlist_add"
            funcType="flat"
            color="primary"
            type="c7n-pro"
            onClick={handleCreate}
            loading={loadings.create || loadings.all}
          >
            {intl.get(`hzero.common.button.increase`).d('新增')}
          </Button>
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
            icon="archive"
            type="c7n-pro"
            color="primary"
            funcType="flat"
            onClick={handleImport}
            permissionList={[
              {
                code: `srm.po-admin.po.po-change.ps.button.purchaseline.import`,
                type: 'button',
                meaning: '订单维护-手工创建-明细行导入按钮',
              },
            ]}
          >
            {intl.get('hzero.common.viewtitle.batchImport').d('批量导入')}
          </Button>
          <CommonImport
            businessObjectTemplateCode="SPUC.PO_LINE_IMPORT"
            prefixPatch={SRM_SPUC}
            refreshButton
            buttonText={intl.get(`hzero.common.button.newBatchImport`).d('(新)批量导入')}
            args={{ poHeaderId }} // 上传参数
            buttonProps={{
              icon: 'archive',
              type: 'c7n-pro',
              color: 'primary',
              funcType: 'flat',
              disabled: !poHeaderId,
              permissionList: [
                {
                  code: `srm.po-admin.po.po-change.ps.button.purchaseline.newimport`,
                  type: 'button',
                  meaning: '订单维护-手工创建-明细行新版导入按钮',
                },
              ],
            }} // 导入按钮属性
            successCallBack={() => {
              ds.query();
              fetchDetailHeader();
            }} // 导入成功的回调
          />
          <Button
            funcType="flat"
            icon="mode_edit"
            color="primary"
            type="c7n-pro"
            loading={loadings.all}
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
          <TooltipButton
            tipTitle={intl
              .get(`sodr.common.view.message.deleteSelectedLine`)
              .d('仅可删除勾选的订单行')}
            buttonText={intl.get(`hzero.common.button.delete`).d('删除')}
            btnProps={{
              icon: 'delete',
              type: 'c7n-pro',
              funcType: 'flat',
              color: 'primary',
              onClick: handleDelete,
              wait: THROTTLE_TIME,
              loading: loadings.deleteLine || loadings.all,
              disabled: !dataSet.selected.length || !canEdit,
            }}
          />
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
    const itemId = record.get('itemId')?.itemId;
    if (record.status === 'add') {
      Modal.info({
        children: intl
          .get('sodr.workspace.view.info.noSaveBomLine')
          .d('该订单行未保存，bom信息不能维护，请先保存！'),
      });
      return;
    }
    if (record.get('saveBomItemId') !== itemId) {
      const res = await getResponse(clearPoItemBOM({ poLineId: record.get('poLineId') }));
      if (res) {
        record.set({ saveBomItemId: itemId });
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
              itemId,
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
        />
      ),
    });
  };

  const getColumns = useCallback(() => {
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
      // {
      //   name: 'skuType', // H
      //   width: 120,
      // },
      // {
      //   name: 'customUomName', // H
      //   width: 120,
      // },
      // {
      //   name: 'customQuantity', // H
      //   width: 120,
      // },
      // {
      //   name: 'packageQuantity', // H
      //   width: 120,
      // },
      // {
      //   name: 'customSpecsJson', // H
      //   width: 120,
      //   renderer: ({ value }) => (
      //     <CustomSpecsModal type="customSpecs" data={value ? JSON.parse(value) : []} />
      //   ),
      // },
      // {
      //   name: 'customSpecs', // H
      //   width: 150,
      // },
      {
        name: 'commonName',
        width: 120,
      },
      sodrEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        editor: true,
        max: MAX_QUAN_NUMBER,
      },
      sodrEnabled && {
        name: 'secondaryUomId',
        width: 150,
        editor: true,
      },
      {
        name: 'quantity',
        width: 150,
        max: MAX_QUAN_NUMBER,
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
        editor: true,
      },
      {
        name: 'taxId',
        width: 150,
        editor: true,
      },
      {
        name: 'lastPurchasePrice',
        width: 150,
        align: 'right',
        renderer: ({ value }) => numberRender(value),
      },
      {
        name: 'priceLibraryId',
        width: 150,
        renderer: ({ record }) => {
          return (
            <a disabled={!canEdit} onClick={() => openC7nPriceModal(record)}>
              {intl.get('sodr.workspace.model.common.referPrice').d('参考价格')}
            </a>
          );
        },
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
        name: 'bom',
        width: 150,
        renderer: ({ record }) => {
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
        editor: true,
      },

      // 为其他来源字段，不该显示
      // {
      //   name: 'sourceNumAndLine',
      //   width: 150,
      //   renderer: ({ text, record }) =>
      //     text === '|' ? '' : record.get('sourceNumAndLine') || record.get('sourceCodeNum'),
      // },
      // {
      //   name: 'prRequestedName',
      //   width: 150,
      // },
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
        name: 'subSupplierId',
        width: 120,
        editor: true,
      },
      {
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
    ];
    const erp = [
      {
        name: 'unitPrice',
        width: 150,
        editor: (record) => (
          <NumberField
            onFocus={() => {
              // eslint-disable-next-line no-unused-expressions
              headerInfoDs.getState('itemChangePriceFlag') === 1
                ? null
                : handleIncludedPriceFcous(record, 'price');
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
              // eslint-disable-next-line no-unused-expressions
              headerInfoDs.getState('itemChangePriceFlag') === 1
                ? null
                : handleIncludedPriceFcous(record, 'price');
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
        renderer: ({ record, text }) =>
          [record.get('internationalTelCode'), text].filter(Boolean).join('-'),
      },
      {
        name: 'budgetAccountId',
        width: 150,
        editor: true,
      },
    ];
    const contract = [
      {
        name: 'contractNum',
        width: 150,
        editor: true,
      },
    ];
    const columns = base.concat(erp);
    if (ds.getState('conractFlag')) {
      columns.push(...contract);
    }
    return uniqBy(columns, 'name');
  }, [canEdit, headerInfoDs, summaryFlag]);

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

  const tableProps = {
    spin: { spinning: loadings.handleIncludedPriceFcous || loadings.conversionUpdate },
    // virtual: true,
    dataSet: ds,
    columns: getColumns(),
    buttons: getButtons(),
    editMode: canEdit ? 'cell' : 'inline',
    selectionMode: canEdit ? 'rowbox' : 'none',
    style: { maxHeight: 450 },
  };
  if (!poHeaderId) {
    tableProps.pagination = false;
  }

  const handleImport = () => {
    const option = {
      pathname: '/sodr/purchase-order-maintain/line-creation/data-import/SPUC.PO_LINE_IMPORT',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-manuall-create?poHeaderId=${poHeaderId}&source=newRequisition&entrance=maintain`,
        args: JSON.stringify({
          poHeaderId,
        }),
      }),
    };
    history.push(option);
  };

  return (
    <Fragment>
      {!isEmpty(priceUpdateList) && (
        <p className={styles['order-top-title']}>
          <span />
          {intl
            .get(`sodr.quotePurchase.view.message.priceUpdate`)
            .d('价格库价格有更新，可点击下方右上角“引用最新价格”按钮获取最新价格')}
        </p>
      )}
      {customizeTable(
        {
          code: getCustomizeTableCode(),
          __force_record_to_update__: true,
          lovIgnore: false,
        },
        <Table {...tableProps} />
      )}
    </Fragment>
  );
};

export default compose(observer)(DetailInfo);
