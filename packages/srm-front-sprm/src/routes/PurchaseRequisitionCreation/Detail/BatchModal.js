import React, { PureComponent, Fragment } from 'react';
import { Drawer, Button } from 'hzero-ui';
import { DataSet, Lov, Form, DatePicker, TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const batchMaintainDs = (getFieldValue) => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  fields: [
    {
      name: 'receiveAddress',
      label: intl.get(`sprm.common.model.receiveAddress`).d('收货地址'),
    },
    {
      name: 'receiveContactName',
      label: intl.get(`sprm.common.model.common.receiverContactName`).d('收货联系人'),
    },
    {
      name: 'receiveTelNum',
      label: intl.get(`sprm.common.model.common.receiverTelNum`).d('收货联系电话'),
    },
    {
      label: intl.get(`sprm.common.model.common.projectNum`).d('项目号'),
      name: 'projectNum',
    },
    {
      label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
      name: 'projectName',
    },
    {
      name: 'innerPoNum',
      label: intl.get(`sprm.common.model.common.inpaperNum`).d('内部订单号'),
    },
    {
      name: 'remark',
      label: intl.get(`sprm.common.model.common.remark`).d('备注'),
    },
    {
      label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
      name: 'budgetAccountId',
      type: 'object',
      lovCode: 'SMDM.BUDGET_ACCOUNT',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
            companyId: getFieldValue('companyId'),
          };
        },
      },
      transformRequest: (value) => value?.budgetAccountId,
      transformResponse(value, data) {
        if (value) {
          return {
            budgetAccountId: value,
            budgetAccountNum: data.budgetAccountNum,
            budgetAccountName: data.budgetAccountName,
          };
        } else {
          return null;
        }
      },
      valueField: 'budgetAccountId',
      textField: 'budgetAccountName',
    },
    {
      bind: 'budgetAccountId.budgetAccountNum',
      name: 'budgetAccountNum',
    },
    {
      bind: 'budgetAccountId.budgetAccountName',
      label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
      name: 'budgetAccountName',
    },
    {
      label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
      name: 'projectCategory',
      type: 'object',
      transformRequest: (value) => value?.value,
      transformResponse(value, data) {
        if (value) {
          return {
            projectCategory: data.value,
            projectCategoryMeaning: data.meaning,
          };
        } else {
          return null;
        }
      },
      lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
    },
    {
      name: 'projectCategoryMeaning',
      bind: 'projectCategory.meaning',
      label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
    },
    {
      label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
      name: 'expBearDepId',
      type: 'object',
      valueField: 'unitId',
      textField: 'unitName',
      lovCode: 'SPFM.UNIT_G_C',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
            // ouId: getFieldValue('ouId'),
            unitTypeCode: 'D',
            unitCompanyId: getFieldValue('parentUnitId'),
          };
        },
      },
      transformRequest: (value) => value?.unitId,
      transformResponse(value, data) {
        if (value) {
          return {
            expBearDepId: data.unitId,
            expBearDepName: data.unitName,
            expBearDep: data.unitName,
          };
        } else {
          return null;
        }
      },
    },
    {
      name: 'expBearDepName',
      label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
      bind: 'expBearDepId.unitName',
    },
    {
      name: 'expBearDep',
      label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
      bind: 'expBearDepId.unitName',
    },
    {
      name: 'accountSubjectId',
      type: 'object',
      lovCode: 'SPRM.ACCOUNT_SUBJECT',
      label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
      valueField: 'accountSubjectId',
      transformRequest: (value) => value?.accountSubjectId,
      textField: 'accountSubjectName',
      lovPara: { tenantId: organizationId, companyId: getFieldValue('companyId') },
      transformResponse(value, data) {
        if (value) {
          return {
            accountSubjectId: value,
            accountSubjectNum: data.accountSubjectNum,
          };
        } else {
          return null;
        }
      },
    },
    {
      name: 'accountSubjectNum',
      bind: 'accountSubjectId.accountSubjectNum',
    },
    {
      label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
      name: 'accountSubjectName',
      bind: 'accountSubjectId.accountSubjectName',
    },
    {
      name: 'inventoryId',
      type: 'object',
      lovCode: 'SPRM.INVENTORY',
      label: intl.get(`sprm.common.model.inventoryName`).d('库房'),
      valueField: 'inventoryId',
      textField: 'inventoryName',
      lovPara: { tenantId: organizationId },
      transformRequest: (value) => value?.inventoryId,
      dynamicProps: {
        disabled({ record }) {
          return !record.get('invOrganizationId');
        },
      },
      transformResponse(value, data) {
        if (value) {
          return {
            inventoryId: value,
            inventoryName: data.inventoryName,
            inventoryIdMeaning: data.inventoryName,
          };
        } else {
          return null;
        }
      },
    },
    {
      name: 'inventoryIdMeaning',
      bind: 'inventoryId.inventoryName',
    },
    {
      label: intl.get(`sprm.common.model.sumProject`).d('库房'),
      name: 'inventoryName',
      bind: 'inventoryId.inventoryName',
    },
    {
      label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
      name: 'neededDate',
      type: 'date',
    },
    {
      name: 'invOrganizationId',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      dynamicProps: {
        lovPara() {
          return {
            ouId: getFieldValue('ouId'),
            enabledFlag: 1,
            tenantId: organizationId,
          };
        },
      },
      transformResponse(value, data) {
        if (value) {
          return {
            invOrganizationId: value,
            invOrganizationName: data.organizationName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value?.organizationId,
      valueField: 'organizationId',
      textField: 'organizationName',
      label: intl.get('entity.organization.class.inventory').d('库存组织'),
    },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationId.organizationName',
    },
    {
      name: 'batchAddress',
      bind: 'invOrganizationId.address',
    },
    {
      name: 'costId',
      type: 'object',
      label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
      lovCode: 'SPRM.COST_CENTER',
      transformRequest: (value) => value?.costId,
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
            ouId: getFieldValue('ouId'),
            companyId: getFieldValue('companyId'),
          };
        },
      },
      transformResponse(value, data) {
        if (value) {
          return {
            costId: value,
            costName: data.costName,
            costCode: data.costCode,
          };
        } else {
          return null;
        }
      },
      valueField: 'costId',
      textField: 'costName',
    },
    {
      label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
      name: 'costName',
      bind: 'costId.costName',
    },
    {
      name: 'costCode',
      bind: 'costId.costCode',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbsCode',
      type: 'object',
      lovCode: 'SMDM.WBS',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
            companyId: getFieldValue('companyId'),
            ouId: getFieldValue('ouId'),
          };
        },
      },
      transformRequest: (value) => value?.wbsCode,
      transformResponse(value, data) {
        if (value) {
          return {
            wbsCode: data.wbsCode,
            wbs: data.wbsCode,
            wbsName: data.wbsName,
          };
        } else {
          return null;
        }
      },
      valueField: 'wbsCode',
      textField: 'wbsName',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbs',
      bind: 'wbsCode.wbsName',
    },
  ],
});

@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_CREATION.BATCH_EDIT',
    'SPRM.PURCHASE_REQUISITION_CREATION.BATCH_SRMEDIT',
  ],
})
export default class CustomSpecModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    const { getFieldValue } = this.props;
    this.batchDs = new DataSet(batchMaintainDs(getFieldValue));
  }

  render() {
    const { visible, onClose, prSourcePlatform, handleSubmit, customizeForm } = this.props;

    const isCatalogOrECom = ['CATALOGUE', 'E-COMMERCE', 'SHOP'].includes(prSourcePlatform); // 来源是电商或目录化或商城申请
    return (
      <Fragment>
        <Drawer
          width={380}
          title={intl.get('sprm.purchaseReqCreation.view.button.batchMaintain').d('批量维护')}
          placement="right"
          destroyOnClose
          visible={visible}
          closable
          onClose={() => onClose()}
          style={{
            overflow: 'auto',
            paddingBottom: 53,
          }}
          zIndex={999}
        >
          {customizeForm(
            {
              code:
                prSourcePlatform === 'SRM'
                  ? 'SPRM.PURCHASE_REQUISITION_CREATION.BATCH_SRMEDIT'
                  : 'SPRM.PURCHASE_REQUISITION_CREATION.BATCH_EDIT',
              dataSet: this.batchDs,
            },
            <Form dataSet={this.batchDs} labelLayout="float" useColon={false}>
              <DatePicker name="neededDate" />
              <Lov name="invOrganizationId" />
              <Lov name="inventoryId" />
              <Lov name="costId" />
              <Lov name="wbsCode" />

              {!isCatalogOrECom && <TextField name="receiveAddress" />}
              {!isCatalogOrECom && <TextField name="receiveContactName" />}
              {!isCatalogOrECom && <TextField name="receiveTelNum" />}
              {!isCatalogOrECom && <Lov name="budgetAccountId" />}

              <TextField name="projectNum" />
              <TextField name="projectName" />
              <TextField name="remark" />
              <Lov name="projectCategory" />
              <Lov name="expBearDepId" />
              <Lov name="accountSubjectId" />
            </Form>
          )}

          <div
            style={{
              position: 'absolute',
              zIndex: 1,
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={() => onClose()}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button
              onClick={() => {
                const [listData] = this.batchDs.toJSONData();
                const fieldsMap = this.batchDs.fields.toJSON();
                handleSubmit(listData, null, fieldsMap);
              }}
              type="primary"
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
        </Drawer>
      </Fragment>
    );
  }
}
