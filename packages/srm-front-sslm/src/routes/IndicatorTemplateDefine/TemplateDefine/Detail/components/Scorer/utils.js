/*
 * @Date: 2024-04-26 10:21:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export const getColumns = ({ evalRespRule, isEdit, respCalMethod, onAssignScorer }) => {
  switch (evalRespRule) {
    case 'RATER': // 评分人规则为评分人时，只展示评分人
      return [
        {
          name: 'respLoginName',
        },
        {
          name: 'respUserName',
        },
        {
          name: 'respWeight',
          editor: isEdit,
          hidden: respCalMethod === 'AVERAGE',
        },
      ];
    default:
      return [
        // 供应商
        {
          name: 'supplierCompanyNum',
          width: 120,
          hidden: !['SUPPLIER', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(
            evalRespRule
          ),
        },
        {
          name: 'supplierCompanyName',
          width: 200,
          hidden: !['SUPPLIER', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(
            evalRespRule
          ),
        },
        // 品类
        {
          name: 'categoryCode',
          width: 120,
          hidden: !['CATEGORY', 'SU+CA+IN'].includes(evalRespRule),
        },
        {
          name: 'categoryName',
          width: 200,
          hidden: !['CATEGORY', 'SU+CA+IN'].includes(evalRespRule),
        },
        // 物料
        {
          name: 'itemCode',
          width: 120,
          hidden: !['ITEM', 'SU+IT+IN'].includes(evalRespRule),
        },
        {
          name: 'itemName',
          width: 200,
          hidden: !['ITEM', 'SU+IT+IN'].includes(evalRespRule),
        },
        // 指标
        {
          name: 'indicatorCode',
          width: 160,
          headerStyle: evalRespRule === 'INDICATOR' ? { paddingLeft: 48 } : {},
          hidden: !['INDICATOR', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(
            evalRespRule
          ),
        },
        {
          name: 'indicatorName',
          width: 200,
          hidden: !['INDICATOR', 'SUPPLIER+INDICATOR', 'SU+CA+IN', 'SU+IT+IN'].includes(
            evalRespRule
          ),
        },
        {
          name: 'scoreTypeMeaning',
          width: 100,
          hidden: evalRespRule !== 'INDICATOR',
        },
        {
          name: 'indicatorTypeMeaning',
          width: 100,
          hidden: evalRespRule !== 'INDICATOR',
        },
        {
          name: 'evalStandard',
          width: 150,
          hidden: evalRespRule !== 'INDICATOR',
        },
        // 分配规则
        {
          name: 'assignRule',
          width: 120,
          editor: record => !record.get('children') && isEdit,
        },
        {
          name: 'assignedScore',
          width: 100,
          hidden: !isEdit,
          renderer: ({ record }) =>
            record.get('children') ? (
              '-'
            ) : (
              <Button funcType="link" onClick={() => onAssignScorer('edit', record)}>
                {intl.get('sslm.common.model.message.assign').d('分配')}
              </Button>
            ),
        },
        {
          name: 'scorer',
          width: 200,
        },
      ].filter(col => !col.hidden); // 过滤一遍，否则个性化设置会展示全量字段
  }
};
