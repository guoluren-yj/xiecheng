/**
 * @date: 2018-8-15
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Button, Spin, Modal } from 'hzero-ui';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import HeadInfo from '@/routes/Investigation/Template/Detail/spfm/HeadInfo';
import InvestigationTab from '@/routes/Investigation/Component';
import Items from './Items';
import ReferenceTemplateModal from './ReferenceTemplateModal';
import TemplateDetailModal from './TemplateDetailModal';

/**
 * 租户级模板明细定义
 * @extends {Component} - PureComponent
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} investigationDefinitionSite - 数据源
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, investigationDefinitionOrg }) => ({
  investigationDefinitionOrg,
  allLoading:
    loading.effects['investigationDefinitionOrg/init'] ||
    loading.effects['investigationDefinitionOrg/openPreview'] ||
    loading.effects['investigationDefinitionOrg/saveTemptDetail'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['spfm.investigationDefinition', 'sslm.common', 'sslm.investTempConfig'],
})
@withCustomize({
  unitCode: ['SSLM.INVESTIGATION_TEMPLATE_DETAILE.REFERENCE'],
})
export default class Definition extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { investigateTemplateId, updateInvestigateTemplateId },
      },
    } = props;
    this.state = {
      updateInvestigateTemplateId: investigateTemplateId,
      investigateTemplateId: updateInvestigateTemplateId,
      dataSource: {},
    };
  }

  static childContextTypes = {
    isOrg: PropTypes.bool,
  };

  getChildContext() {
    return {
      isOrg: true, // 是否租户级
    };
  }

  componentDidMount() {
    this.fetchList();
  }

  /**
   * 查询数据
   */
  @Bind()
  fetchList() {
    const { dispatch, organizationId } = this.props;
    const { investigateTemplateId } = this.state;
    if (investigateTemplateId) {
      dispatch({
        type: 'investigationDefinitionOrg/init',
        payload: { investigateTemplateId, organizationId },
      });
    }
  }

  @Bind()
  getHeaderInfo() {
    const { investigateTemplateId } = this.state;
    return {
      investigateTemplateId,
    };
  }

  @Bind()
  handlePreview() {
    const { dispatch, organizationId } = this.props;
    const { investigateTemplateId } = this.state;
    dispatch({
      type: 'investigationDefinitionOrg/openPreview',
      payload: {
        organizationId,
        investigateTemplateId,
      },
    }).then(res => {
      // 判断是否启用”附件信息“页签
      const purchaserAttachmentFlag = res.some(n => n.configName === 'sslmInvestgAttachment');
      if (purchaserAttachmentFlag) {
        // 将采购方预定义的附件模板带到附件信息上
        dispatch({
          type: 'investigationDefinitionOrg/queryAttachmentList',
          payload: {
            investigateTemplateId,
          },
        }).then(attachmentres => {
          if (res) {
            this.setState({
              dataSource: {
                sslmInvestgAttachment: attachmentres.map(n => ({
                  ...n,
                  purchaserAttachmentUuid: n.purchaseTemplUuid,
                  attachmentDesc: n.description,
                })),
              },
            });
          }
        });
      }
    });
  }

  @Bind()
  handlePreviewCancel() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationDefinitionOrg/updateState',
      payload: {
        previewVisible: false,
      },
    });
  }

  @Bind()
  handleReload() {
    this.fetchList();
  }

  @Bind()
  handleAllocateReference() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationDefinitionOrg/updateState',
      payload: {
        referenceModalVisible: true,
      },
    });
  }

  render() {
    const {
      dispatch,
      investigationDefinitionOrg: {
        headerInfo,
        config,
        currentInvestigateTemplateId,
        previewConfig = [],
        referenceModalVisible = false,
        previewVisible = false,
        temDetailVisible,
      },
      organizationId,
      allLoading = false,
      customizeTabPane,
    } = this.props;
    const { investigateTemplateId, updateInvestigateTemplateId, dataSource } = this.state;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`spfm.investigationDefinition.view.message.title`).d('调查表明细维护')}
          backPath="/sslm/investigation-template-define/list"
        >
          <Button icon="search" type="primary" onClick={this.handlePreview} loading={allLoading}>
            {intl.get('hzero.common.button.preview').d('预览')}
          </Button>
          <Button icon="fork" onClick={() => this.handleAllocateReference()} loading={allLoading}>
            {intl.get('hzero.common.button.qutote').d('引用其他模板')}
          </Button>
        </Header>
        <Content style={{ marginBottom: '0px' }}>
          <Spin spinning={allLoading}>
            <HeadInfo dispatch={dispatch} headerInfo={headerInfo} onRefresh={this.fetchList} />
            <Items
              config={config}
              organizationId={organizationId}
              // fetchList={this.fetchList}
              investigateTemplateId={investigateTemplateId}
              updateInvestigateTemplateId={updateInvestigateTemplateId}
            />
          </Spin>
        </Content>
        {referenceModalVisible && (
          <ReferenceTemplateModal
            investigateTemplateId={investigateTemplateId}
            updateInvestigateTemplateId={updateInvestigateTemplateId}
            callBack={this.fetchList}
            customizeTabPane={customizeTabPane}
          />
        )}
        {temDetailVisible && <TemplateDetailModal key={currentInvestigateTemplateId} />}
        {previewVisible && (
          <Modal
            title={intl.get(`spfm.investigationDefinition.view.message.title.modal`).d('模板明细')}
            visible={previewVisible}
            onCancel={this.handlePreviewCancel}
            wrapClassName="ant-modal-sidebar-right"
            transitionName="move-right"
            width={1000}
            footer={null}
          >
            <InvestigationTab
              edit
              config={previewConfig}
              organizationId={organizationId}
              tabPosition="left"
              dataSource={dataSource}
            />
          </Modal>
        )}
      </React.Fragment>
    );
  }
}
