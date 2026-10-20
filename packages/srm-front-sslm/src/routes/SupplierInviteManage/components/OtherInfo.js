/**
 * OtherInfo - 其他信息
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { isArray, isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';

import FormField from '@/routes/components/FormField';
import { checkClassify } from '@/services/supplierInviteManageServices';

export default class OtherInfo extends Component {
  render() {
    const { dataSet, customizeForm = () => {}, isDisable = false, source } = this.props;
    return (
      <React.Fragment>
        {customizeForm(
          {
            code:
              source === 'workFlow'
                ? 'SSLM.ENT_CER_PRO.OTHER_INFO_NEW'
                : 'SSLM.ENT_CER_PRO.OTHER_INFO',
            enableCreate: false,
            labelLayout: 'vertical',
            readOnly: isDisable,
            enableReLoad: false,
          },
          <Form
            dataSet={dataSet}
            columns={3}
            labelLayout={!isDisable ? 'float' : 'vertical'}
            className={!isDisable ? '' : 'c7n-pro-vertical-form-display'}
            style={{ width: '75%', maxWidth: 1172 }}
          >
            <FormField
              isEdit={!isDisable}
              name="multiSupplierCategoryId"
              componentType="LOV"
              searchFieldInPopup
              onOption={({ record: optionRecord }) => {
                return {
                  disabled: !optionRecord.get('checkFlag'),
                };
              }}
              tableProps={{
                treeAsync: true,
                onRow: ({ record: tableRecord }) => {
                  const nodeProps = { disabled: false };
                  if (tableRecord.get('hasChild') === 0) {
                    nodeProps.isLeaf = true;
                  }
                  return nodeProps;
                },
              }}
              onBeforeSelect={async tableRecord => {
                if (!isEmpty(tableRecord)) {
                  const supplierCategoryIdList = [];
                  if (isArray(tableRecord)) {
                    tableRecord.forEach(item => {
                      const supplierCategoryId = item.get('categoryId');
                      supplierCategoryIdList.push(supplierCategoryId);
                    });
                  } else {
                    const supplierCategoryId = tableRecord.get('categoryId');
                    supplierCategoryIdList.push(supplierCategoryId);
                  }
                  const res = await checkClassify({ supplierCategoryIdList });
                  if (getResponse(res)) {
                    return true;
                  } else {
                    return false;
                  }
                } else {
                  return true;
                }
              }}
            />
          </Form>
        )}
      </React.Fragment>
    );
  }
}
