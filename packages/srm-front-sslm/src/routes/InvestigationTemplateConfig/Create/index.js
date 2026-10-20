/*
 * Create - 调查表模板创建-详情
 * @date: 2020/12/1 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Button, Spin } from 'choerodon-ui/pro';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Content, Header } from 'components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { addInvestigate, queryUpdateTemplateId } from '@/services/orgInvestigateTemplateService';

import TemplateHeader from '../components/TemplateHeader';
import { listDS } from '../stores/indexDS';

import styles from '../index.less';

const organizationId = getCurrentOrganizationId();

/**
 * 调查表创建-详情
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
@formatterCollections({
  code: [
    'sslm.common',
    'sslm.investDefOrg',
    'sslm.investTempConfig',
    'spfm.investigationDefinition',
  ],
})
@WithCustomize({
  unitCode: ['SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.HEADER_INFO'],
})
export default class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saveLoading: false,
    };
    this.templateHeaderDs = new DataSet({ ...listDS(), autoCreate: true });
  }

  @Bind()
  async handleSave() {
    if (this.templateHeaderDs.current) {
      const validateFlag = await this.templateHeaderDs.current.validate();
      if (validateFlag) {
        const data = this.templateHeaderDs.current.toJSONData();
        const payload = {
          data: {
            ...data,
            tenantId: organizationId,
            releaseFlag: 0,
            enabledFlag: 1,
            newFlag: true,
          },
          customizeUnitCode: 'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.HEADER_INFO',
        };
        this.setState({
          saveLoading: true,
        });
        return addInvestigate(payload)
          .then(async res => {
            if (getResponse(res)) {
              notification.success();
              await this.handleGoToDatail(res);
            }
          })
          .finally(() => {
            this.setState({
              saveLoading: false,
            });
          });
      }
    } else {
      notification.warning({
        message: intl.get(`hzero.common.view.message.notpassRequire`).d('请填写必填字段后保存'),
      });
    }
  }

  // 跳转模板详情
  @Bind()
  handleGoToDatail(reslut = {}) {
    const { dispatch } = this.props;
    const { investigateTemplateId } = reslut;
    return new Promise(resolve => {
      queryUpdateTemplateId(investigateTemplateId)
        .then(res => {
          if (getResponse(res)) {
            const oldInvestigateTemplateId = res;
            // 跳转
            dispatch(
              routerRedux.push({
                pathname: `/sslm/investigation-template-config/detail/${investigateTemplateId}/${oldInvestigateTemplateId}/edit`,
              })
            );
          }
        })
        .finally(() => resolve());
    });
  }

  render() {
    const { saveLoading } = this.state;
    const { customizeForm } = this.props;
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sslm.investDefOrg.view.title.createInvestigateTempt')
            .d('新建调查表模板')}
          backPath="/sslm/investigation-template-config/list"
        >
          <Button
            icon="save"
            color="primary"
            onClick={() => this.handleSave()}
            loading={saveLoading}
            wait={500}
            waitType="throttle"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <React.Fragment>
          <Content>
            <Spin spinning={saveLoading}>
              <div className={styles['investigate-tempt-create-title']}>
                {intl.get('sslm.investTempConfig.view.title.investTempInfo').d('模板信息')}
              </div>
              <TemplateHeader
                dataSet={this.templateHeaderDs}
                isEdit
                isCreate
                customizeForm={customizeForm}
              />
            </Spin>
          </Content>
        </React.Fragment>
      </React.Fragment>
    );
  }
}
