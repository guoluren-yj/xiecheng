/*
 * InviteHeader - 邀约处理详情-邀约头
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';

import FormField from '@/routes/components/FormField';

/**
 * 邀约头
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
export default class InviteHeader extends Component {
  render() {
    const { dataSet, isEdit = false, customizeForm, code, custLoading } = this.props;

    return customizeForm(
      {
        code,
      },
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        useWidthPercent
        custLoading={custLoading}
      >
        <FormField isEdit={isEdit} name="companyName" disabled />
        <FormField
          isEdit={isEdit}
          name="levelTypeFlag"
          componentType="SELECT"
          clearButton={false}
          renderer={({ value }) => {
            return yesOrNoRender(Number(value) ? 1 : 0);
          }}
        />
        <FormField isEdit={isEdit} name="inviteCompanyIds" componentType="LOV" />

        <FormField
          isEdit={isEdit}
          name="sendInvestigateTemplateFlag"
          disabled
          renderer={({ value }) => {
            return yesOrNoRender(Number(value) ? 1 : 0);
          }}
        />
        <FormField isEdit={isEdit} name="investigateTypeMeaning" disabled />
        <FormField isEdit={isEdit} name="investigateTemplateName" disabled />

        <FormField isEdit={isEdit} name="investigateCategoryName" disabled />
        <FormField isEdit={isEdit} name="multiSupplierCategoryDesc" disabled />
        <FormField isEdit={isEdit} name="purchaseAgentNameJoint" disabled />

        <FormField isEdit={isEdit} name="salesPersonName" disabled />
        <FormField isEdit={isEdit} name="salesPersonPhone" disabled />
        <FormField isEdit={isEdit} name="salesPersonEmail" disabled />

        <FormField isEdit={isEdit} name="roleType" disabled />
        <FormField isEdit={isEdit} name="creationDate" disabled componentType="DATETIMEPICKER" />
        <FormField isEdit={isEdit} name="inviteRemark" disabled newLine colSpan={2} />
      </Form>
    );
  }
}
