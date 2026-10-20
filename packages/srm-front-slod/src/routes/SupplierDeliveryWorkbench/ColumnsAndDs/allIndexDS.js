import intl from 'utils/intl';
import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { MAX_BIGNUMBER_NUMBER } from '@/routes/components/utils/constant';
import {
  queryBatchSimpleApprovalHistory,
  // queryBatchApprovaFlag,
} from 'srm-front-boot/lib/utils/utils';
// import { getBatchOperationFlag } from '@/routes/components/utils';
import { fetchUnreadChatAPI } from '../../../components/Chat/services';

const organizationId = getCurrentOrganizationId();

// 全部
const allDS = (id, code, key, doubleUnitEnabled, nodeId) => ({
  primaryKey: id,
  cacheSelection: true, // 跨页勾选
  pageSize: 20,
  selection: !['date'].includes(key) && 'multiple',
  fields: [
    {
      name: 'operate', // 头状态 头
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.operate').d('操作'),
    },
    {
      name: 'statusCodeMeaning', // 头状态 头
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.statusCodeMeaning').d('状态'),
    },
    {
      name: 'lineStatusMeaning', // 头状态 头
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.statusCodeMeaning').d('状态'),
    },
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
      name: 'viewApproval',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.viewApproval').d('审批进度'),
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
      name: 'processingNodeMeaning', // 当前处理节点 头 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.currenctNode').d('当前处理节点'),
    },
    {
      name: 'operating', // 操作记录
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.operating').d('操作记录'),
    },
    {
      name: 'lineStatusMeaning', // 行状态 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.statusCodeMeaning').d('状态'),
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
      name: 'quantity', // 标签/确认 行
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
      name: 'unitPackageQuantity', // 单包装数 行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
    },
    {
      name: 'packageQuantity', // 比例份数 行
      type: 'number',
      label:
        code === 'ASN'
          ? intl.get('slod.deliveryWorkbench.model.common.packages').d('件数')
          : intl.get('slod.deliveryWorkbench.model.common.packageQuantity').d('比例份数'),
    },
    {
      name: 'remainderQuantity', // 尾数 行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.remainderQuantity').d('尾数'),
    },
    {
      name: 'volumeLength', // 体积长（CM) 行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.volumeLength').d('体积长（CM)'),
    },
    {
      name: 'volumeWidth', // 体积宽（CM) 行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.volumeWidth').d('体积宽（CM)'),
    },
    {
      name: 'volumeHeight', // 体积高（CM) 行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.volumeHeight').d('体积高（CM)'),
    },
    {
      name: 'netWeight', // 净重（KG) 行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.netWeight').d('净重（KG)'),
    },
    {
      name: 'grossWeight', // 毛重（KG) 行
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.grossWeight').d('毛重（KG)'),
    },
    {
      name: 'weightUomName', // 重量单位  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.weightUomName').d('重量单位'),
    },
    {
      name: 'lotNum', // 批次号  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.lotNum').d('批次号'),
    },
    {
      name: 'productionDate', // 生产日期 行
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.productionDate').d('生产日期'),
    },
    {
      name: 'lotExpirationDate', // 批次有效期 行
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.lotExpirationDate').d('批次有效期'),
    },
    {
      name: 'serialNum', // 序列号 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.serialNum').d('序列号'),
    },
    {
      name: 'labelDetail', // 标签明细 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.labelDetail').d('标签明细'),
    },
    {
      name: 'purchaseLineRemark', // 采购方行备注 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseLineRemark').d('采购方行备注'),
    },
    {
      name: 'supplierLineRemark', // 供应商行备注 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierLineRemark').d('供应商行备注'),
    },
    {
      name: 'purchaseRemark', // 采购方备注
      type: 'string',
    },
    {
      name: 'supplierRemark', // 供应商备注
      type: 'string',
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号-行号 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoNum').d('来源订单号-行号'),
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号
      type: 'string',
      label: intl
        .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
        .d('来源单据编号-行号'),
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.sourceType').d('来源单据类型'),
    },
    {
      name: 'secondaryQuantity', // 本次计划
      type: 'number',
      label:
        code === 'PLAN'
          ? intl.get('slod.deliveryWorkbench.model.common.planThisTimeuantity').d('本次计划数量')
          : intl
              .get('slod.deliveryWorkbench.model.common.secondaryThisTimeuantity')
              .d('本次创建数量'),
    },
    {
      name: 'actualQuantity', //  本次计划
      type: 'number',
      label: doubleUnitEnabled
        ? code === 'PLAN'
          ? intl
              .get('slod.deliveryWorkbench.model.common.planBaseThisTimeuantity')
              .d('本次计划基本数量')
          : intl
              .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
              .d('本次创建基本数量')
        : code === 'PLAN'
        ? intl.get('slod.deliveryWorkbench.model.common.planThisTimeuantity').d('本次计划数量')
        : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
    },
    {
      name: 'netPlanQuantity', // 净计划数量
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.netPlanQuantity').d('净计划数量'),
    },
    {
      name: 'plannedArrivalDate', // 本次计划到货日期
      type: 'date',
      label: intl
        .get('slod.deliveryWorkbench.model.common.plannedArrivalDate')
        .d('本次计划到货日期'),
    },
    {
      name: 'confirmArrivalDate', // 确认到货日期
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.confirmArrivalDate').d('确认到货日期'),
    },
    {
      name: 'poTypeName', // 订单类型
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'neededDate', // 需求日期
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.neededDate').d('需求日期'),
    },
    {
      name: 'promisedDate', // 承诺交货日期
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.promisedDate').d('承诺交货日期'),
    },
    {
      name: 'agentName', // 采购员
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.agentName').d('采购员'),
    },
    {
      name: 'categoryName', // 品类
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.categoryName').d('品类'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.invOrganizationName').d('收货组织'),
    },
    {
      name: 'splitFlag', // 拆分标记
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.splitFlag').d('拆分标记'),
    },
    {
      name: 'receiveAddress',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.receiveAddres').d('收货地址'),
    },
    {
      name: 'updatedName', // 更新人
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.updatedName').d('更新人'),
    },
    {
      name: 'asnTypeCodeMeaning', // 单据分类
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.asnTypeCodeMeaning').d('单据分类'),
    },
    {
      name: 'printFlag', // 打印标记
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.printFlag').d('打印标记'),
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.productNum').d('商品编码'),
      name: 'productNum', // 商品编码
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.productName').d('商品名称'),
      name: 'productName', // 商品名称
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.catalogName').d('商品目录'),
      name: 'catalogName', // 商品目录  送货-待创建
      type: 'string',
    },
    {
      name: 'carNumber', // 车牌号
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.carNumber').d('车牌号'),
    },
    {
      name: 'shipDate', // 发货日期
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.shipDate').d('发货日期'),
    },
    {
      name: 'expectedArriveDate', // 预计到货日期
      type: 'dateTime',
      label: intl.get('slod.deliveryWorkbench.model.common.expectedArriveDate').d('预计到货日期'),
    },
    {
      name: 'shipToLocContName', // 联系人
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.shipToLocContName').d('联系人'),
    },
    {
      name: 'shipToLocTelNum', // 联系电话
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.shipToLocTelNum').d('联系电话'),
    },
    {
      name: 'expressNum', // 物流单号
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.expressNum').d('物流单号'),
    },
    {
      name: 'acceptTime', // 妥投/签收时间
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.acceptTime').d('妥投/签收时间'),
    },
    {
      name: 'strategyName', // 发货策略
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.strategyName').d('发货策略'),
    },
    {
      name: 'strategyDataVersion', // 发货策略版本
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.strategyDataVersion').d('发货策略版本'),
    },
    {
      name: 'receiveStatus', // 接收状态
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.receiveStatus').d('接收状态'),
    },
    {
      name: 'receiveQuantity', // 接收数量
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.receiveQuantitys').d('接收数量'),
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.downstreamNodeInfoList')
        .d('下游已确认数量'),
      name: 'downstreamNodeInfoList',
      type: 'string',
      help: intl
        .get('slod.deliveryWorkbench.model.common.downstreamNodeInfoListMessage')
        .d('记录当前单据触发创建下游发货单据已确认数量'),
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.downstreamEnInfoList').d('下游在途数量'),
      name: 'downstreamEnInfoList',
      type: 'string',
      // help: intl
      //   .get('slod.deliveryWorkbench.model.common.downstreamNodeInfoListMessage')
      //   .d('记录当前单据触发创建下游发货单据已确认数量'),
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoLocationNum').d('发运号'),
      name: 'fromDisplayPoLocationNum', // 发运号
      type: 'string',
    },
    {
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.poBaseQuantity').d('订单基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.poQuantity').d('订单数量'),
      name: 'poQuantity', // 订单数量
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.tongbuStatus').d('同步状态'),
      name: 'submitSyncStatus',
      type: 'string',
    },
    {
      name: 'projectTaskId',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.projectTaskId').d('项目任务名称'),
    },
    key === 'date' &&
      code === 'PLAN' && {
        name: 'itemQuantity',
        type: 'number',
        label: intl.get('slod.deliveryWorkbench.model.common.itemQuantity').d('计划数量'),
      },
    // {
    //   label: intl.get('slod.deliveryWorkbench.model.common.processDocuments').d('单据流'),
    //   name: 'processDocuments', // 单据流
    //   type: 'string',
    // },
  ],
  transport: {
    read: ({ data, params: _p }) => {
      const { params, text, ...other } = data;
      const { nodeTemplateCode, nodeConfigId, hdKey } = params || {};
      const queryData = filterNullValueObject({ ...params, ...text, ...other });
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
      const urlCode = hdKey === 'left' ? `all/header/page` : `all/line/page`;
      const url =
        hdKey === 'date'
          ? `plan/${nodeConfigId}/all/date/page`
          : `${nodeTemplateCode}/${nodeConfigId}/${urlCode}`;
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${url}`,
        method: 'GET',
        param,
        data: queryData,
        transformResponse: (value) => {
          if (hdKey === 'date') {
            const newRes = [];
            const { content: result, ...pages } = JSON.parse(value);
            (result || []).forEach((item) => {
              const resultTableData = {};
              const { dateInfoList = [] } = item;
              dateInfoList.forEach((ele) => {
                const { planDate, quantity } = ele;
                const date = moment(planDate).format('YYYY-MM-DD');
                resultTableData[date] = quantity;
              });
              newRes.push({
                ...item,
                ...resultTableData,
              });
            });
            return { content: newRes, ...pages };
          } else {
            const { content, ...pages } = JSON.parse(value);
            return { content, ...pages };
          }
        },
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      const businessKeys = dataSet.reduce((acc, cur) => {
        const value = cur.get('businessKey');
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      const headerIds = dataSet?.reduce((acc, cur) => {
        const value = cur?.get(id);
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(businessKeys)) {
        // 查询审批记录数据
        const simpleApprovalHistoryList = await queryBatchSimpleApprovalHistory(businessKeys);
        // // 获取审批按钮显示状态
        // const approvaFlags = await queryBatchApprovaFlag(businessKeys);
        // // // 获取撤销审批按钮状态
        // const operationFlags = await getBatchOperationFlag(businessKeys);
        dataSet.setState({ simpleApprovalHistoryList, approvaFlags: {}, operationFlags: {} });
      }
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

export { allDS };
