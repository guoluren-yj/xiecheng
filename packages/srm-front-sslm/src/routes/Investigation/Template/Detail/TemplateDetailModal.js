/*
 * TemplateDetailModal - 引用模板弹窗页面
 * @date: 2018/09/03 16:11:56
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import InvestigationTab from '@/routes/Investigation/Component';
import HeadInfo from '@/routes/Investigation/Template/Preview/HeadInfo';

@connect(({ loading, investigationDefinitionOrg }) => ({
  investigationDefinitionOrg,
  loading: loading.effects['investigationDefinitionOrg/fetchTemplate'],
  organizationId: getCurrentOrganizationId(),
}))
export default class TemplateDetailModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.fetchTemplate();
  }

  fetchTemplate() {
    const {
      dispatch,
      organizationId,
      investigationDefinitionOrg: { currentInvestigateTemplateId },
    } = this.props;
    if (currentInvestigateTemplateId) {
      dispatch({
        type: 'investigationDefinitionOrg/fetchTemplate',
        payload: { investigateTemplateId: currentInvestigateTemplateId, organizationId },
      });
    }
  }

  handleOnCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationDefinitionOrg/updateState',
      payload: {
        temDetailVisible: false,
      },
    });
  };

  render() {
    const {
      investigationDefinitionOrg: { temDetailVisible, detailHeaderInfo, detailConfig },
      organizationId,
      loading,
    } = this.props;
    return (
      <Modal
        title={intl.get(`spfm.investigationDefinition.view.message.title.modal`).d('模板明细')}
        visible={temDetailVisible}
        onCancel={this.handleOnCancel}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        width={1000}
        footer={null}
      >
        <Spin spinning={loading}>
          <HeadInfo headInfo={detailHeaderInfo} />
          <InvestigationTab
            config={detailConfig}
            organizationId={organizationId}
            tabPosition="left"
            edit
          />
        </Spin>
      </Modal>
    );
  }
}
