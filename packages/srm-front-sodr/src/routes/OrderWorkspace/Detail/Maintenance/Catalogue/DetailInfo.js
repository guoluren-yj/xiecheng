/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment } from 'react';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import {
  TextField,
  Modal,
  Icon,
  Form,
  Lov,
  DatePicker,
  NumberField,
  TextArea,
  Select,
  TelField,
} from 'choerodon-ui/pro';
import DocFlow from '_components/DocFlow';
import CustomSpecsModal from '@/routes/components/CustomSpecsModal';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import { isEmpty, throttle } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';
import { handleBatchOk } from '@/routes/components/utils';
import CategoryLov from '@/routes/components/CategoryLov';
import TooltipButton from '@/routes/components/TooltipButton';
import styles from '../../index.less';

const DetailInfo = (props) => {
  const {
    ds,
    customizeTable,
    batchMaintenanceDs,
    customizeForm,
    displayDocAndDocFlow = {},
    getValues,
    remote,
  } = props;
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
  const handleBatchMaintenance = () => {
    const { selected } = ds;
    Modal.open({
      drawer: true,
      style: { width: 380 },
      bodyStyle: { overflowX: 'hidden' },
      title: intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑'),
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
            { code: 'SODR.WORKSPACE_CATALOGUE_DETAIL.BATCHEDIT_NEW', lovIgnore: false },
            <Form dataSet={batchMaintenanceDs} columns={1} labelLayout="float">
              <Lov name="invOrganizationId" />
              <Lov name="invInventoryId" />
              <Lov name="invLocationId" />
              <DatePicker name="needByDate" />
              <Lov name="costId" />
              <Lov name="departmentId" />
              <Lov
                name="projectCategory"
                placeholder={intl.get('sodr.workspace.model.common.projectCategory').d('项目类别')}
              />
              <NumberField name="unitPriceBatch" />
              <TextField name="shipToThirdPartyAddress" />
              <TextField name="shipToThirdPartyContact" />
              <TextArea name="remark" />
              <NumberField name="receiveToleranceQuantity" />
              <Select name="receiveToleranceQuantityType" />
              <TelField name="receiveTelNum" />
            </Form>
          )}
        </Fragment>
      ),
      onOk: throttle(
        () =>
          handleBatchOk(batchMaintenanceDs, ds, {
            hasPriceLibrary: true,
            getValues,
            remote,
            remoteCode: 'SODR.WORKSPACE_MAINTENANCE_CATALOGUE_PROCESS_BATCH_EDIT',
          }),
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const columns = () => {
    const lineColumns = [
      {
        name: 'displayLineNum',
        width: 70,
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
      },
      {
        name: 'productNum',
        width: 150,
        editor: true,
      },
      {
        name: 'productName',
        width: 180,
        editor: true,
      },
      {
        name: 'catalogName',
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
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        editor: true,
      },
      doubleUnitEnabled && {
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
        name: 'needByDate',
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
        name: 'taxId',
        width: 150,
        editor: true,
      },
      // {
      //   name: 'lastPurchasePrice',
      //   width: 150,
      //   renderer: ({ value }) => numberRender(value),
      // },
      {
        name: 'unitPriceBatch',
        width: 150,
        editor: true,
      },
      {
        name: 'currencyCode',
        width: 150,
        editor: true,
      },
      {
        name: 'categoryId',
        width: 150,
        editor: (record) => <CategoryLov data={{ record, ds }} />,
      },
      {
        name: 'invOrganizationId',
        width: 150,
        editor: true,
      },
      {
        name: 'invInventoryId',
        width: 150,
        editor: true,
      },
      {
        name: 'invLocationId',
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
        name: 'departmentId',
        width: 150,
        editor: true,
      },
      {
        name: 'costId',
        width: 150,
        editor: true,
      },
      {
        name: 'projectCategory',
        width: 150,
        editor: true,
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        width: 180,
      },
      {
        name: 'prRequestedName',
        width: 150,
        renderer: ({ record }) => record.get('purReqAppliedName'),
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
      // 默认隐藏字段
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
        name: 'productSpecs',
        width: 150,
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
        name: 'receiveTelNum',
        width: 400,
        editor: true,
        // editor: (record) => {
        //   return <TextField addonBefore={<Select record={record} name="internationalTelCode" />} />;
        // },
        // renderer: ({ record, text }) =>
        //   [record.get('internationalTelCode'), text].filter(Boolean).join('-'),
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
        name: 'accountAssignTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'domesticUnitPrice',
        width: 150,
      },
      {
        name: 'domesticLineAmount',
        width: 150,
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
      },
      {
        name: 'receiveToleranceQuantityType',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveToleranceQuantity',
        width: 150,
        editor: true,
      },
      {
        name: 'docFlow',
        width: 100,
        hidden: displayDocAndDocFlow.displayDocFlow !== '1',
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
      {
        name: 'fundLineTermId',
        width: 150,
        renderer: ({ record }) => record.get('fundLineTermName'),
      },
    ];
    return remote?.process('processColumns', lineColumns);
  };
  const getButtons = () => {
    const Buttons = observer(({ dataSet }) => {
      const { selected } = dataSet;
      const buttons = [
        {
          name: 'batchEdit',
          btnComp: TooltipButton,
          child: !isEmpty(selected)
            ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
            : intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑'),
          childFor: 'buttonText',
          btnProps: {
            tipTitle: !isEmpty(selected)
              ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
              : intl.get('sodr.workspace.view.tooltip.batchAllMaintain').d('批量编辑全部数据'),
            btnProps: {
              funcType: 'flat',
              icon: 'mode_edit',
              color: 'primary',
              type: 'c7n-pro',
              onClick: handleBatchMaintenance,
              permissionList: [
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.purrqsline.batchedit',
                  type: 'c7n-pro',
                  meaning: '订单工作台-采购申请明细行-批量编辑',
                },
              ],
            },
          },
        },
      ];
      // return customizeBtnGroup(
      //   { code: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.LINE_BUTTONS', pro: true },
      //   <DynamicButtons buttons={buttons} />
      // );
      return <DynamicButtons buttons={buttons} />;
    });
    return [<Buttons dataSet={ds} />];
  };

  return customizeTable(
    {
      code: 'SODR.WORKSPACE_CATALOGUE_DETAIL.DETAILINFO',
      __force_record_to_update__: true,
      lovIgnore: false,
    },
    <SearchBarTable
      searchCode="SODR.WORKSPACE_CATALOGUE_DETAIL.DETAILINFO_FILTER"
      dataSet={ds}
      columns={columns()}
      // selectionMode="none"
      buttons={getButtons()}
      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
      style={{ maxHeight: '450px' }}
      virtual
      virtualCell
      searchBarConfig={{
        // autoQuery: false,
        checkDataSetStatus: false,
        closeFilterSelector: true,
      }}
    />
  );
};

export default DetailInfo;
