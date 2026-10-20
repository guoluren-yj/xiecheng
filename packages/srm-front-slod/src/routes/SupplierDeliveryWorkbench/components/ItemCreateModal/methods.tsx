/**
 * index.js
 * @date: 2025-05-18
 * @author: zuoxiangyu <xaingyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2024, Hand
 */
import React from 'react';
// import moment from 'moment';
import { isNil, isEmpty } from 'lodash';
import request from 'utils/request';
import { SRM_SLOD } from '_utils/config';
import { Button } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

const organizationId = getCurrentOrganizationId();

/**
 * 列表 - 行信息/查询条件
 * @delivery {*} params
 * return {arr}
 */
function lineColumns(): any{
  const lineCms = [
    {
      title: intl.get(`hzero.common.button.action`).d('操作'),
      name: 'action',
      width: 80,
      renderer: ({ record, dataSet }) => {
        if (!record?.get('custLineId')) {
          return '-';
        } else {
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleSplit(record, dataSet)}
              disabled={record?.get('leftCanCreateQuantity') === 0}
            >
              {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
            </Button>
          );
        }
      },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
      name: 'itemCode',
      type: 'string',
      width: 120,
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
      name: 'itemName',
      type: 'string',
      width: 120,
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
      name: 'displayUom',
      type: 'string',
      width: 120,
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
      name: 'canCreateQuantity',
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.surplusCanCreateQuantity').d('剩余可创建数量'),
      name: 'leftCanCreateQuantity',
      type: 'number',
      width: 130,
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.secondaryPresentQuantity').d('本次计划数量'),
      name: 'actualQuantity',
      type: 'number',
      editor: true,
      dynamicProps: {
        disabled: ({ record }) => record?.get('custLineId'),
        required: ({ record }) => !record?.get('custLineId'),
      },
    },
    {
      name: 'plannedArrivalDate',
      type: 'date',
      width: 150,
      editor: true,
      // min: moment().format('YYYY-MM-DD HH:mm:ss'),
      label: intl.get('slod.deliveryWorkbench.model.common.plannedArrivalDate').d('本次计划到货日期'),
      dynamicProps: {
        disabled: ({ record }) => record?.get('custLineId'),
        required: ({ record }) => !record?.get('custLineId'),
      },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.companyName').d('公司'),
      name: 'companyName',
      type: 'string',
      width: 150,
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
      name: 'supplierCompanyName',
      type: 'string',
      width: 150,
    },
  ];
  return { lineCms};
};

// fetchLine
const fetchLine = ({ nodeConfigId, body, campKey }) => {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/plan/${nodeConfigId}/create-by-item/merge-check?campKey=${campKey}`, {
    method: 'POST',
    body,
  });
};

// 拆分
const handleSplit = (record, dataSet) => {
  const dataList = {
    ...record.toData(),
    custLineId: null,
    actualQuantity: 0,
    canCreateQuantity: null,
    objectVersionNumber: null,
    leftCanCreateQuantity: null,
  };
  dataSet.create(dataList, record.index + 1);
};

// 删除
const deleteFn = (dataSet) => {

  const selected = dataSet?.selected;

  selected?.forEach((item, index, array) => {

    const parentData = array?.filter(n => n?.get('itemCode') === item?.get('itemCode') && !n?.get('custLineId'));

    // 勾选的拆分行本次计划数量之和
    // const selectedQuery = parentData?.map(n => {
    //   const field = n?.getField('actualQuantity');
    //   // 判断是否校验通过，不通过则返回0
    //   if (!field?.valid) {
    //     return 0;
    //   };
    //   return n?.get('actualQuantity') || 0;
    // }).reduce((a, b) => a + b, 0);
    
    dataSet.forEach((record) => {
      if (record.get('custLineId') && record.get('itemCode') === item.get('itemCode')) {
  
        // 原行可创建数量
        const parent_canCreateQuantity = record?.get('canCreateQuantity');

        // 原行剩余可创建数量
        const parent_leftCanCreateQuantity = record?.get('leftCanCreateQuantity');

        // 勾选行的 本次计划数量
        const current_actualQuantity = item?.get('actualQuantity');

        // 计算后的本次计划数量：原行可创建数量 - 原行剩余可创建数量 - 本次计划数量
        // const actualQuantity = parent_canCreateQuantity - parent_leftCanCreateQuantity - current_actualQuantity;
        const actualQuantity =math?.minus((math?.minus(parent_canCreateQuantity, parent_leftCanCreateQuantity)), current_actualQuantity);
  
        // 剩余可创建数量：判断 “原行可创建数量” 是否大于 “勾选的拆分行本次计划数量之和”，若大于：“原行剩余可创建数量” + “本次计划数量”，否则：原行可创建数量
        // const resultQuery = parent_canCreateQuantity > selectedQuery ? record?.get('leftCanCreateQuantity') + current_actualQuantity : canCreateQuantity;
        const leftCanCreateQuantity =  math?.plus(parent_leftCanCreateQuantity, current_actualQuantity);
        
        // 获取勾选行的 本次计划数量 字段
        const field = item?.getField('actualQuantity');

        // 判断 原行的“可创建数量” 是否等于 “剩余可创建数量”，若等于，则不进行赋值
        if (parent_canCreateQuantity !== parent_leftCanCreateQuantity && field?.valid) {
          // 校验本次计划数量总量是否大于可创建数量 大于则不进行赋值
          if (field?.valid) record.set('leftCanCreateQuantity', leftCanCreateQuantity);
          if (field?.valid) record.set('actualQuantity', actualQuantity);
        };
      };
    });
    dataSet.remove(dataSet.selected);
  });
};

// 创建
const createFn = async (ds, dataSet, campKey, btnParams, history) => {
  const flag = await ds.validate();
  if (!flag) return false;
  const planLineItemList = ds?.toData()?.filter((item) => !item.custLineId) || [];
  const planLineVOList = dataSet?.selected?.map(n => n?.toData()) || [];
  const nodeConfigId = planLineVOList[0]?.nodeConfigId;
  if (isEmpty(planLineItemList)) {
    notification.warning({
      message: intl.get('slod.deliveryWorkbench.view.noSplittingData').d('无法创建，原因是未进行拆分，不存在可创建的数据。'),
    });
    return false;
  };
  const res = await request(`${SRM_SLOD}/v1/${organizationId}/delivery/plan/${nodeConfigId}/create-by-item?campKey=${campKey}`, {
    method: 'POST',
    body: {
      planLineItemList,
      planLineVOList,
    },
  });
  if (getResponse(res)) {
      // eslint-disable-next-line no-param-reassign
      btnParams.tableConfigRef.cache = true;
      // eslint-disable-next-line no-param-reassign
      btnParams.tableConfigRef.page = 'detail';
    (notification as any).success();
    console.log(history);
    combineTab({...res, history, nodeConfigId});
    return true;
  } else {
    return false;
  };
};

/**
 * 创建按钮是否进入并单
 * @object _object
 * */
const combineTab = (res={}) => {
  const { deliveryHeaderId, history, nodeConfigId }: any = res;
  history.push({
    pathname: `/slod/supplier-delivery-workbench/detail/create`,
    search: `nodeTemplateCode=PLAN&nodeConfigId=${nodeConfigId}&headerId=${deliveryHeaderId}`,
  });
};

// load
const loadFn = (dataSet) => {
  dataSet.forEach((record) => {
    if (record.get('custLineId')) {
      Object.assign(record, { selectable: false });
    }
  });
};

// update
const updateFn = (record, name, value, dataSet) => {
  if (name === 'actualQuantity') {

    // 判断是否是拆分行编辑
    if (record.get('custLineId')) return;

    // 获取拆分前的原始行
    const cRecord = record?.custRecord;

    dataSet.forEach((item, index, array) => {

      // 获取拆分前的原始行，并修改可创建数量和剩余可创建数量
      if (item.get('itemCode') === record.get('itemCode') && item.get('custLineId')) {

        // 判断 拆分的数据是否超过两条，不超过则用“可创建数量”计算
        if (array.length<=2) {

          // 判断 拆分行拆分的本次计划数量 是否超出“剩余可创建数量”,未超出则执行正常计算逻辑
          if (item.get('canCreateQuantity') >= value) {

            const canCreateQuantity = item?.get('canCreateQuantity'); // 原行的 可创建数量

            const field = record?.getField('actualQuantity');
            field.set('validator', () => {
              return true;
            });

            if (!isNil(value)) {
              // 剩余可创建数量 = 可创建数量 - 本次计划数量
              // const leftCanCreateQuantity = item.get('canCreateQuantity') - value;
              const leftCanCreateQuantity = math?.minus(item?.get('canCreateQuantity'), value);
              item.set('leftCanCreateQuantity', leftCanCreateQuantity);

              // 本次计划数量 = 可创建数量 - 剩余可创建数量
              const actualQuantity = math?.minus(canCreateQuantity, leftCanCreateQuantity);
              item.set('actualQuantity',actualQuantity);
            };

            if (isNil(value)) {
               // 剩余可创建数量 = 可创建数量 - 本次计划数量
              // const leftCanCreateQuantity = item.get('canCreateQuantity') - 0;
              const leftCanCreateQuantity = math?.minus(item?.get('canCreateQuantity'), 0);
              item.set('leftCanCreateQuantity', leftCanCreateQuantity);

              // 本次计划数量 = 可创建数量 - 剩余可创建数量
              const actualQuantity = math?.minus(canCreateQuantity, leftCanCreateQuantity);
              item.set('actualQuantity', actualQuantity);
            };
          };

          // 判断 拆分行拆分的本次计划数量 是否超出“剩余可创建数量”,超出则执行校验
          if (item.get('canCreateQuantity') < value) {
            const field = record?.getField('actualQuantity');
            field.set('validator', () => {
              if (item.get('canCreateQuantity') < value) {
                return intl.get(`slod.deliveryWorkbench.model.common.actualQuantityValidator`).d('本次计划数量不能超过可创建数量');
              };
              return true;
            });
          };
        }

        // 判断 拆分的数据是否超过两条，超过则用“剩余可创建数量”计算
        if (array.length > 2) {

          // 获取对应的原始行的拆分行
          const parentData = array.filter(n => n?.get('itemCode') === record.get('itemCode') && !n?.get('custLineId'));
          // 汇总所有行的‘本次计划数量’之和，原始行不计入，只计算拆分行
          const calculationResultsQuantity = parentData.map(n => {
            if (!n?.get('custLineId')) {
              return n?.get('actualQuantity') || 0;
            };
            return 0;
          }).reduce((a, b) => a + b, 0);

           // 剩余可创建数量 = 可创建数量 - 本次计划数量之和（只计入拆分行）
          // const leftCanCreateQuantity = item.get('canCreateQuantity') - calculationResultsQuantity;
          const leftCanCreateQuantity = math?.minus(item?.get('canCreateQuantity'), calculationResultsQuantity);

          // 判断 拆分行拆分的本次计划数量 是否超出“剩余可创建数量”,未超出则执行正常计算逻辑
          if ((leftCanCreateQuantity + value) >= value) {

            const field = record?.getField('actualQuantity');
            field.set('validator', () => {
              return true;
            });

            item.set('leftCanCreateQuantity', leftCanCreateQuantity); // 剩余可创建数量
            item.set('actualQuantity', calculationResultsQuantity); // 本次计划数量之和（只计入拆分行）
          };

          // 判断 拆分行拆分的本次计划数量 是否超出“剩余可创建数量”,超出则执行校验 (leftCanCreateQuantity + value) < value
          if ((math?.plus(leftCanCreateQuantity, value)) < value) {
            const field = record?.getField('actualQuantity');
            field.set('validator', () => {
              return intl.get(`slod.deliveryWorkbench.model.common.actualQuantityValidator`).d('本次计划数量不能超过可创建数量');
            });
          };
        };
      }
    });
  };
};



export {
  loadFn,
  createFn,
  updateFn,
  deleteFn,
  fetchLine,
  lineColumns,
  handleSplit,
};
