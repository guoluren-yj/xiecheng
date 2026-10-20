/*
 * RegisterInviteInfo - 认证审批邀约信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isNil, isEmpty, isArray } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import FormField from '@/routes/components/FormField';
import { checkClassify } from '@/services/supplierInviteManageServices';

/**
 * 认证审批邀约信息
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@observer
export default class RegisterInviteInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      dataSet,
      isEdit = false,
      customizeForm = () => {},
      code = '',
      columns = 3,
      custLoading = false,
    } = this.props;

    let sendInviteFlag = true;
    const currentRecord = dataSet?.current;
    if (currentRecord) {
      const autoPartnerFlag = currentRecord.get('autoPartnerFlag');
      sendInviteFlag = autoPartnerFlag === '1';
    }

    return customizeForm(
      {
        code,
        readOnly: !isEdit,
      },
      <Form
        dataSet={dataSet}
        columns={columns}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        useWidthPercent
        custLoading={custLoading}
      >
        <FormField
          isEdit={isEdit}
          name="autoPartnerFlag"
          componentType="SELECT"
          renderer={({ value }) => {
            return isNil(value) ? '-' : yesOrNoRender(Number(value) ? 1 : 0);
          }}
        />
        <FormField
          isEdit={isEdit}
          name="levelTypeFlag"
          componentType="SELECT"
          hidden={!sendInviteFlag}
          renderer={({ value }) => {
            return isNil(value) ? '-' : yesOrNoRender(Number(value) ? 1 : 0);
          }}
        />
        <FormField isEdit={isEdit} name="companyIds" componentType="LOV" hidden={!sendInviteFlag} />

        <FormField
          isEdit={isEdit}
          name="purchaseAgentIds"
          componentType="LOV"
          hidden={!sendInviteFlag}
        />
        <FormField
          isEdit={isEdit}
          name="categoryIds"
          componentType="LOV"
          hidden={!sendInviteFlag}
          searchFieldInPopup
          onOption={({ record: optionRecord }) => {
            return {
              disabled: !optionRecord.get('checkFlag'),
            };
          }}
          tableProps={{
            treeAsync: true,
            alwaysShowRowBox: true,
            selectionMode: 'rowbox',
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
        <FormField
          isEdit={isEdit}
          name="itemCategoryIds"
          componentType="LOV"
          hidden={!sendInviteFlag}
          searchFieldInPopup
          onOption={({ record: optionRecord }) => {
            return {
              disabled: optionRecord.get('isCheck') === false,
            };
          }}
          tableProps={{
            virtual: true,
            virtualCell: true,
            treeAsync: true,
            onRow: ({ record: tableRecord }) => {
              const nodeProps = {};
              if (tableRecord.get('hasChild') === '0') {
                nodeProps.isLeaf = true;
              }
              return nodeProps;
            },
          }}
        />

        <FormField isEdit={isEdit} name="stageId" componentType="SELECT" hidden={!sendInviteFlag} />

        <FormField
          isEdit={isEdit}
          name="remark"
          componentType="TEXTAREA"
          hidden={!sendInviteFlag}
          colSpan={2}
          resize="vertical"
        />
      </Form>
    );
  }
}
