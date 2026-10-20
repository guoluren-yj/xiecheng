/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-09-15 15:57:25
 * @FilePath: /srm-front-sslm/src/routes/SupplierKpiIndicator/IndicationAssign/utils.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Form, InputNumber } from 'hzero-ui';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const { Item: FormItem } = Form;

/**
 * @description: 细项权限表格columns
 * @return {Columns[]} 返回H0表格columns配置
 */
const getColumns = ({ handleCheckedRespWeight, isRespWeightRequired, dataSource }) => {
  return [
    {
      key: 'respUserId',
      title: intl.get('sslm.supplierKpiIndicator.model.supplier.respUser').d('评分账户'),
      dataIndex: 'respUserId',
      width: 150,
      render: (val, record) => {
        const { getFieldDecorator, setFieldsValue, getFieldValue } = record.$form;
        if (record._status === 'update' || record._status === 'create') {
          getFieldDecorator('respLoginName');
          return (
            <FormItem>
              {getFieldDecorator('respUserId', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierKpiIndicator.model.supplier.respUser')
                        .d('评分账户'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSLM.KPI_CHOOSE_USER"
                  textValue={getFieldValue('respLoginName') || record.respLoginName}
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  onChange={(_, row) => {
                    setFieldsValue({
                      respLoginName: row.loginName,
                      respUserId: row.userId,
                      respUserName: row.userName,
                    });
                  }}
                />
              )}
            </FormItem>
          );
        } else {
          return getFieldValue('respLoginName') || record.respLoginName;
        }
      },
    },
    {
      key: 'respUserName',
      title: intl
        .get('sslm.supplierKpiIndicator.model.supplier.respUserNameDesc')
        .d('评分用户描述'),
      dataIndex: 'respUserName',
      width: 180,
      render: (val, record) => {
        const { getFieldDecorator, getFieldValue } = record.$form;
        if (record._status === 'update' || record._status === 'create') {
          return (
            <FormItem>
              {getFieldDecorator('respUserName', {
                initialValue: val,
              })(<span>{getFieldValue('respUserName') || val}</span>)}
            </FormItem>
          );
        } else {
          return getFieldValue('respUserName') || val;
        }
      },
    },
    {
      key: 'respWeight',
      title: intl.get('sslm.supplierKpiIndicator.model.supplier.respWeight').d('权重%'),
      dataIndex: 'respWeight',
      width: 130,
      render: (val, record) => {
        const { getFieldDecorator, getFieldValue } = record.$form;
        if (record._status === 'update' || record._status === 'create') {
          return (
            <FormItem>
              {getFieldDecorator('respWeight', {
                initialValue: val,
                rules: [
                  {
                    required: isRespWeightRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierKpiIndicator.model.supplier.respWeight')
                        .d('权重%'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  precision={2}
                  max={100}
                  step={0.01}
                  onChange={newValue => handleCheckedRespWeight(newValue, record)}
                  onBlur={() => {
                    dataSource.forEach(item => {
                      const { validateFields } = item.$form;
                      validateFields(['respWeight'], {
                        force: true,
                      });
                    });
                  }}
                />
              )}
            </FormItem>
          );
        } else {
          return getFieldValue('respLoginName') || val;
        }
      },
    },
  ];
};

export { getColumns };
