/*
 * Supplement - 信息补录
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Lov } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { isArray, isEmpty } from 'lodash';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { checkClassify } from '@/services/supplierInviteManageServices';

import RegisterInviteInfo from '../../Detail/components/RegisterInviteInfo';

import styles from '../index.less';

/**
 * 信息补录
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
@withCustomize({
  isTemplate: true,
})
export default class Supplement extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { queryTemplateConfig, templateCode, templateVersion, stageCode, pageCode } = this.props;
    const templateInfoPromise = new Promise(resolve => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    if (queryTemplateConfig) {
      queryTemplateConfig(templateInfoPromise, {
        stageCode,
        pageCode,
      });
    }
  }

  render() {
    const {
      otherInfoDs,
      customizeForm = () => {},
      custLoading,
      allowSupplierInviteFlag,
      inviteInfoDs,
    } = this.props;

    return (
      <React.Fragment>
        <div className={styles['certification-wf-modal-c7n-card']}>
          <Card
            bordered={false}
            title={intl.get('spfm.enterprise.view.message.otherInfo').d('其他信息')}
          >
            {customizeForm(
              {
                code: 'SSLM_CERTIFICATION_DEAL_SUPPLEMENT.OTHER_INFO',
                enableCreate: false,
                __force_record_to_update__: true,
              },
              <Form dataSet={otherInfoDs} columns={2} labelLayout="float" custLoading={custLoading}>
                <Lov
                  name="multiSupplierCategoryId"
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
          </Card>
          {allowSupplierInviteFlag && (
            <Card
              bordered={false}
              title={intl.get('sslm.supplierInvite.view.title.inviteInfo').d('邀约信息')}
            >
              <RegisterInviteInfo
                dataSet={inviteInfoDs}
                isEdit
                customizeForm={customizeForm}
                code="SSLM_CERTIFICATION_DEAL_SUPPLEMENT.POLICY_INVITE_INFO"
                columns={2}
                custLoading={custLoading}
              />
            </Card>
          )}
        </div>
      </React.Fragment>
    );
  }
}
