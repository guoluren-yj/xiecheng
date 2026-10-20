import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';

const organizationId = getCurrentOrganizationId();

const lineCmsFun = () => {

    const formCms = [
        {
            name: 'oldStrategyCode',
            type: FieldType.string,
            compType: 'TextField',
            label: intl.get('sinv.receiptExecution.model.receipt.oldStrategyHeaderId').d('更新前策略'),
            disabled: true,
        },
        {
            type: FieldType.object,
            compType: 'Lov',
            name: 'strategyCodeLov',
            lovCode: 'SINV.STRATEGY_HEADER_CHANGE_URL',
            label: intl.get('sinv.receiptExecution.model.receipt.newStrategyHeaderId').d('更新后策略'),
            dynamicProps: {
                lovPara({ record }) {
                    return {
                        tenantId: organizationId,
                        oldStrategyHeaderId: record.get('oldStrategyHeaderId'),
                    };
                },
            },
            required: true,
        },
        {
            name: 'strategyCode',
            type: FieldType.string,
            bind: 'strategyCodeLov.strategyCode',
            custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
        },
        {
            name: 'newStrategyHeaderId',
            type: FieldType.string,
            bind: 'strategyCodeLov.nodeStrategyId',
            custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
        },
    ];

    const lineCms = [
        {
            name: 'itemCode',
            type: FieldType.string,
            width: 120,
            label: intl.get('sinv.receiptExecution.model.receipt.itemCode').d('物料编码'),
        },
        {
            name: 'itemName',
            type: FieldType.string,
            width: 120,
            label: intl.get('sinv.receiptExecution.model.receipt.itemName').d('物料名称'),
        },
        {
            name: 'leftQuantity',
            type: FieldType.number,
            width: 100,
            label: intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量'),
        },
        {
            name: 'leftTaxAmount',
            type: FieldType.number,
            width: 120,
            label: intl.get('sinv.receiptExecution.model.receipt.leftTaxAmount.tax').d('可执行金额(含税)'),
        },
        {
            name: 'fromDisplayPoNum',
            type: FieldType.string,
            width: 160,
            label: intl.get(`sinv.receiptWorkbench.model.view.poSourceNum`).d('来源订单编号-行号'),
            renderer: ({ value, record }) => {
                if (value) {
                  return `${value}-${record.get('fromDisplayPoLineNum')}`;
                }
            },
        },
        {
            name: 'fromDisplayAsnNum',
            type: FieldType.string,
            width: 160,
            label: intl.get(`sinv.receiptWorkbench.model.view.asnSourceNum`).d('来源送货单编号-行号'),
            renderer: ({ value, record }) => {
                if (value) {
                  return `${value}-${record.get('fromDisplayAsnLineNum')}`;
                }
            },
        },
        {
            name: 'companyName',
            type: FieldType.string,
            width: 180,
            label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
        },
        {
            name: 'supplierName',
            type: FieldType.string,
            width: 180,
            label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
        },
        {
          name: 'purchaseAgentName',
          type: FieldType.string,
          width: 120,
          label: intl.get('sinv.receiptExecution.model.receipt.purchaseAgentName').d('采购员'),
        },
    ];

    const optionCms = [
        {
            name: 'processUserName',
            type: FieldType.string,
            width: 120,
            label: intl.get(`sinv.common.model.common.processUserName`).d('操作人'),
        },
        {
            name: 'processDate',
            type: FieldType.string,
            width: 140,
            label: intl.get(`sinv.common.model.common.operatorDate`).d('操作时间'),
        },
        {
            name: 'processStatusMeaning',
            type: FieldType.string,
            width: 120,
            label: intl.get(`sinv.receiptWorkbench.model.view.operationStatusMeaning`).d('操作状态'),
        },
        {
            name: 'processMessage',
            type: FieldType.string,
            width: 140,
            label: intl.get(`sinv.receiptWorkbench.model.view.reasonForFailure`).d('失败原因'),
        },
        {
            name: 'fromDisplayPoNum',
            type: FieldType.string,
            width: 150,
            label: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
        },
        {
            name: 'fromDisplayPoLineNum',
            type: FieldType.string,
            width: 120,
            label: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
        },
        {
            name: 'fromDisplayPoLineLocationNum',
            type: FieldType.string,
            width: 120,
            label: intl.get(`sinv.common.model.common.poShipmentLineNumber`).d('订单发运行号'),
        },
        {
            name: 'oldStrategyName',
            type: FieldType.string,
            width: 140,
            label: intl.get('sinv.receiptExecution.model.receipt.oldStrategyHeaderId').d('更新前策略'),
        },
        {
            name: 'newStrategyName',
            type: FieldType.string,
            width: 140,
            label: intl.get('sinv.receiptExecution.model.receipt.newStrategyHeaderId').d('更新后策略'),
        },
    ];

    const query = [
        {
          name: 'fromDisplayPoNum',
          label: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
          display: true,
          type: FieldType.string,
        //   merge: true,
        },
        {
        type: FieldType.string,
          name: 'fromDisplayPoLineNum',
          label: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
          display: true,
        },
        {
            type: FieldType.string,
          name: 'fromDisplayPoLineLocationNum',
          label: intl.get(`sinv.common.model.common.poShipmentLineNumber`).d('订单发运行号'),
          display: true,
        },
      ];

    return { lineCms, optionCms, formCms, query };
};

const fetchLine = (data) => {
    return {
      url: `${SRM_SPUC}/v1/${organizationId}/rcv-strategy-change/query`,
      method: 'GET',
      data,
    };
  };

export { lineCmsFun, fetchLine };