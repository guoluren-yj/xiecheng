/*
 * supplementInvestigateModal - 补充调查
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Select, Lov, SelectBox, TextArea } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { observer } from 'mobx-react';
import { isEmpty, isArray } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { checkClassify } from '@/services/supplierInviteManageServices';

import styles from '../index.less';

/**
 * 补充调查
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
@WithCustomize({
  unitCode: ['SSLM.SUP_INV_MAN_INV_PROCESS.SUP_MODAL_FORM'],
})
@observer
export default class SupplementModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 发送调查表切换
   */
  @Bind()
  handleChange(value) {
    const { modal = {} } = this.props;
    if (!isEmpty(modal)) {
      let mesage = intl.get(`spfm.disposeInvite.view.option.agree`).d('同意合作');
      if (Number(value)) {
        mesage = intl.get(`spfm.disposeInvite.view.option.sendOut`).d('发送');
      } else {
        mesage = intl.get(`spfm.disposeInvite.view.option.agree`).d('同意合作');
      }
      modal.update({
        okText: mesage,
      });
    }
  }

  render() {
    const { dataSet, customizeForm, custLoading, batchInvite = false, otherInfo = {} } = this.props;
    const current = dataSet?.current;
    const tips = intl
      .get(`spfm.disposeInvite.view.message.tab.describe`)
      .d('如果选择给对方发送调查表，则当对方提交的调查表通过您的审核后，才会建立合作伙伴关系。');
    const sendInvestigateFlag = !!Number(current ? current.get('flag') : 0);
    return (
      <React.Fragment>
        <Alert
          banner
          showIcon
          closable
          type="info"
          iconType="help"
          message={tips}
          className={styles['form-alert']}
        />
        {customizeForm(
          {
            code: 'SSLM.SUP_INV_MAN_INV_PROCESS.SUP_MODAL_FORM',
            // 此处让个性化默认值覆盖标准字段默认值
            afterCustomizeDs: () => {
              dataSet.create({ ...otherInfo });
            },
          },
          <Form
            dataSet={dataSet}
            columns={3}
            labelLayout="float"
            className={styles['card-invite-form']}
            custLoading={custLoading}
          >
            <Select name="roleType" hidden={batchInvite} />
            <Lov name="childRoleId" hidden={batchInvite} />

            <Lov
              name="multiSupplierCategoryIdLov"
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
              newLine
            />
            <Lov name="purchaseAgentIdLov" />
            <Lov
              name="categoryIdLov"
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
            <SelectBox name="flag" onChange={this.handleChange} />
            <Select name="investigateType" hidden={!sendInvestigateFlag} />
            <Lov name="investigateTemplateIdLov" hidden={!sendInvestigateFlag} />

            <TextArea name="remark" newLine colSpan={2} hidden={!sendInvestigateFlag} />
          </Form>
        )}
      </React.Fragment>
    );
  }
}
