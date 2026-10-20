import { SRM_SLOD } from '_utils/config';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { MAX_BIGNUMBER_NUMBER } from '@/routes/components/utils/constant';
import { fetchUnreadChatAPI } from '../../../components/Chat/services';

const organizationId = getCurrentOrganizationId();

// 待确认
const affirmDS = (id, code, key, doubleUnitEnabled, nodeId) => ({
  primaryKey: id,
  cacheSelection: true, // 跨页勾选
  pageSize: 20,
  fields: [
    {
      name: 'statusCodeMeaning', // 头状态 头
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.statusCodeMeaning').d('状态'),
    },
    {
      name: 'lineStatusMeaning', // 行状态  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.statusCodeMeaning').d('状态'),
    },
    // {
    //   name: 'operate', // 操作  头
    //   type: 'string',
    // },
    {
      name: 'displayAsnNum', // 单据编号 头-行 -送货
      type: 'string',
      label: ['right'].includes(key)
        ? intl.get('slod.deliveryWorkbench.model.common.displayAsnNums').d('单据编号-行号')
        : intl.get('slod.deliveryWorkbench.model.common.displayPlanNum').d('单据编号'),
    },
    {
      name: 'displayPlanNum', // 单据编号 头-行- 标签
      type: 'string',
      label: ['right'].includes(key)
        ? intl.get('slod.deliveryWorkbench.model.common.displayAsnNums').d('单据编号-行号')
        : intl.get('slod.deliveryWorkbench.model.common.displayPlanNum').d('单据编号'),
    },
    {
      name: 'displayLabelNum', // 单据编号 头-行- 计划
      type: 'string',
      label: ['right'].includes(key)
        ? intl.get('slod.deliveryWorkbench.model.common.displayAsnNums').d('单据编号-行号')
        : intl.get('slod.deliveryWorkbench.model.common.displayPlanNum').d('单据编号'),
    },
    {
      name: 'companyName', // 公司 头-行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.companyName').d('公司'),
    },
    {
      name: 'supplierCompanyName', // 供应商  头-行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
    },
    {
      name: 'createCampCodeMeaning', // 创建方   值集 SLOD.CAMP_CODE  头-行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createCampCode').d('创建方'),
    },
    {
      name: 'createdName', // 创建人  头-行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createdName').d('创建人'),
    },
    {
      name: 'creationDate', // 创建时间 头
      type: 'dateTime',
      label: intl.get('slod.deliveryWorkbench.model.common.creationDate').d('创建时间'),
    },
    {
      name: 'strategyName', // 发货策略 头
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.strategyName').d('发货策略'),
    },
    {
      name: 'processingNodeMeaning', // 当前处理节点 头
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.currenctNode').d('当前处理节点'),
    },
    {
      name: 'operating', // 操作记录  头
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.operating').d('操作记录'),
    },
    {
      name: 'invOrganizationName', // 收货组织  头  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.invOrganizationName').d('收货组织'),
    },
    {
      name: 'sourceCodeMeaning', // 来源系统  头
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.sourceCodeMeaning').d('来源系统'),
    },
    {
      name: 'itemCode', // 物料编码 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName', // 物料名称 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.secondaryDisplayUom').d('单位'),
      name: 'secondaryDisplayUom', // 单位
      type: 'string',
    },
    {
      name: 'displayUom', // 单位 行
      type: 'string',
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.displayUom').d('基本单位')
        : intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
    },
    {
      name: 'fillSecondaryQuantity', // 标签数量 行
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: ['PLAN', 'ASN'].includes(code)
        ? intl.get('slod.deliveryWorkbench.model.common.secondaryAffirmQuality').d('确认数量')
        : intl.get('slod.deliveryWorkbench.model.common.fillSecondaryQuantity').d('标签数量'),
    },
    {
      name: 'quantity', // 标签数量 行
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: ['PLAN', 'ASN'].includes(code)
        ? doubleUnitEnabled
          ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmQuality').d('确认基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.affirmQuality').d('确认数量')
        : doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.BaseQuantity').d('标签基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.quantity').d('标签数量'),
    },
    {
      name: 'unitPackageQuantity', // 单包装数  行
      type: 'number',
      label:
        code === 'LABEL'
          ? intl.get('slod.deliveryWorkbench.model.common.packageQuantity').d('比例份数')
          : intl.get('slod.deliveryWorkbench.model.common.packages').d('件数'),
    },
    {
      name: 'packageQuantity', // 比例分数  行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
    },
    {
      name: 'remainderQuantity', // 尾数  行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.remainderQuantity').d('尾数'),
    },
    {
      name: 'volumeLength', // 体积长（CM)  行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.volumeLength').d('体积长（CM)'),
    },
    {
      name: 'volumeWidth', // 体积宽（CM)  行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.volumeWidth').d('体积宽（CM)'),
    },
    {
      name: 'volumeHeight', // 体积高（CM)  行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.volumeHeight').d('体积高（CM)'),
    },
    {
      name: 'netWeight', // 净重（KG)  行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.netWeight').d('净重（KG)'),
    },
    {
      name: 'grossWeight', // 毛重（KG)  行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.grossWeight').d('毛重（KG)'),
    },
    {
      name: 'lotNum', // 批次号  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.lotNum').d('批次号'),
    },
    {
      name: 'productionDate', // 生产日期  行
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.productionDate').d('生产日期'),
    },
    {
      name: 'lotExpirationDate', // 批次有效期  行
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.lotExpirationDate').d('批次有效期'),
    },
    {
      name: 'serialNum', // 序列号  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.serialNum').d('序列号'),
    },
    {
      name: 'labelDetail', // 标签明细 -- 跳转字段  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.labelDetail').d('标签明细'),
    },
    {
      name: 'purchaseLineRemark', // 采购方行备注  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseLineRemark').d('采购方行备注'),
    },
    {
      name: 'supplierLineRemark', // 供应商行备注  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierLineRemark').d('供应商行备注'),
    },
    {
      name: 'purchaseRemark', // 采购方备注  行
      type: 'string',
    },
    {
      name: 'supplierRemark', // 供应商备注  行
      type: 'string',
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号-行号 fromDisplayPoLineNum 行号  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoNum').d('来源订单号-行号'),
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号-行号   sourceDisplayLineNum 行号  行
      type: 'string',
      label: intl
        .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
        .d('来源单据编号-行号'),
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.sourceType').d('来源单据类型'),
    },
    {
      name: 'displayPlanLineNum', // 行号 计划  行
      type: 'string',
    },
    {
      name: 'secondaryQuantity', // 本次计划数量  计划  行
      type: 'number',
      label:
        code === 'PLAN'
          ? intl
              .get('slod.deliveryWorkbench.model.common.secondaryPresentQuantity')
              .d('本次计划数量')
          : intl
              .get('slod.deliveryWorkbench.model.common.secondaryThisTimeuantity')
              .d('本次创建数量'),
    },
    {
      name: 'actualQuantity', // 本次计划数量  计划  行
      type: 'number',
      label:
        code === 'PLAN'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
                .d('本次计划基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
          : doubleUnitEnabled
          ? intl
              .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
              .d('本次创建基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
    },
    {
      name: 'plannedArrivalDate', // 本次计划到货日期 计划  行
      type: 'date',
      label: intl
        .get('slod.deliveryWorkbench.model.common.plannedArrivalDate')
        .d('本次计划到货日期'),
    },
    {
      name: 'confirmArrivalDate', // 确认到货日期  计划  行
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.confirmArrivalDate').d('确认到货日期'),
    },
    {
      name: 'neededDate', // 需求日期  行
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.neededDate').d('需求日期'),
    },
    {
      name: 'promisedDate', // 承诺交货日期  计划  行
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.promisedDate').d('承诺交货日期'),
    },
    {
      name: 'agentName', // 采购员  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.agentName').d('采购员'),
    },
    {
      name: 'categoryName', // 品类  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.categoryName').d('品类'),
    },
    {
      name: 'receiveAddress',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.receiveAddres').d('收货地址'),
    },
    {
      name: 'splitFlag', // 拆分标记  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.splitFlag').d('拆分标记'),
    },
    {
      name: 'updatedName', // 更新人  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.updatedName').d('更新人'),
    },
    {
      name: 'weightUomName', // 重量单位  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.weightUomName').d('重量单位'),
    },
    {
      name: 'shelfLife', // 保质期  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.shelfLife').d('保质期'),
    },
    {
      name: 'shipToLocContName', // 联系人  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.shipToLocContName').d('联系人'),
    },
    {
      name: 'shipToLocTelNum', // 联系电话  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.shipToLocTelNum').d('联系电话'),
    },
    {
      name: 'productNum', // 商品编码  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.productNum').d('商品编码'),
    },
    {
      name: 'productName', // 商品名称  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.productName').d('商品名称'),
    },
    {
      name: 'catalogName', // 商品目录 送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.catalogName').d('商品目录'),
    },
    {
      name: 'projectTaskId',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.projectTaskId').d('项目任务名称'),
    },
  ],
  transport: {
    read: ({ data, params: _p }) => {
      const { params, ...other } = data;
      const { nodeTemplateCode, nodeConfigId, hdKey } = params || {};
      const queryData = filterNullValueObject({ ...params, ...other });
      let param;
      if (data.customizeUnitCode) {
        const { templateCode, templateVersion, cuszTplStageCode, cuszTplPageCode } =
          data.tplInfo || {};
        param = {
          ..._p,
          customizeUnitCode: data.customizeUnitCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
        };
      }
      const url = hdKey === 'left' ? `wait-confirm/header/page` : `wait-confirm/line/page`;
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/${url}`,
        method: 'GET',
        param,
        data: queryData,
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      const headerIds = dataSet?.reduce((acc, cur) => {
        const value = cur?.get(id);
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(headerIds)) {
        // 查询审批记录数据
        const chatList = await fetchUnreadChatAPI({
          body: headerIds,
          campKey: 's',
          nodeConfigId: nodeId,
          nodeTemplateCode: code,
        });
        if (getResponse(chatList)) {
          dataSet.setState({ chatList: chatList || [] });
        } else {
          dataSet.setState({ chatList: [] });
        }
      }
    },
  },
});

export { affirmDS };
