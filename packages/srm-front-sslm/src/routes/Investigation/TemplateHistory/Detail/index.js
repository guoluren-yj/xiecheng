/*
 * @Author: yunqiang.wu yunqiang.wu@hang-china.com
 * @Date: 2018-08-06 13:38:39
 * feature: 租户级调查表模板历史详情页
 */

import React from 'react';
import { Button, Spin, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import PropTypes from 'prop-types';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import HeadInfo from '@/routes/Investigation/Template/Detail/spfm/HeadInfo';
import InvestigationTab from '@/routes/Investigation/Component';
import Items from './Items';

/**
 * 租户级模板历史明细
 * @extends {Component} - PureComponent
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} investigationTemHistoryOrg - 数据源
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['sslm.investTemHisOrg', 'spfm.investigationDefinition'] })
@connect(({ loading, investigationTemHistoryDetailOrg }) => ({
  investigationTemHistoryDetailOrg,
  loading: loading.effects['investigationTemHistoryDetailOrg/init'],
  loadingPreview: loading.effects['investigationTemHistoryDetailOrg/openPreview'],
  organizationId: getCurrentOrganizationId(),
}))
export default class InvestigationTemHistoryDetailOrg extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { investigateTemplateId },
      },
    } = props;
    this.state = {
      investigateTemplateId,
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
        type: 'investigationTemHistoryDetailOrg/init',
        payload: { investigateTemplateId, organizationId },
      });
    }
  }

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
      type: 'investigationTemHistoryDetailOrg/openPreview',
      payload: {
        organizationId,
        investigateTemplateId,
      },
    });
  }

  @Bind()
  handlePreviewCancel() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationTemHistoryDetailOrg/updateState',
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
      type: 'investigationTemHistoryDetailOrg/updateState',
      payload: {
        referenceModalVisible: true,
      },
    });
  }

  render() {
    const {
      investigationTemHistoryDetailOrg: {
        headerInfo,
        config,
        previewConfig = [],
        previewVisible = false,
      },
      loading,
      loadingPreview = false,
      organizationId,
    } = this.props;
    const { investigateTemplateId } = this.state;
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.investTemHisOrg.view.message.title.detail`)
            .d('调查表模板历史版本明细')}
          backPath="/sslm/investigation-template-history/list"
        >
          <Button
            icon="search"
            type="primary"
            onClick={this.handlePreview}
            loading={loadingPreview}
          >
            {intl.get('hzero.common.button.preview').d('预览')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={loading}>
            <div style={{ margin: 16 }}>
              <HeadInfo headerInfo={headerInfo} />
            </div>
            <Items
              config={config}
              organizationId={organizationId}
              fetchList={this.fetchList}
              investigateTemplateId={investigateTemplateId}
            />
          </Spin>
        </Content>
        <Modal
          title={intl.get(`sslm.investTemHisOrg.view.message.title.modal`).d('模板明细')}
          visible={previewVisible}
          onCancel={this.handlePreviewCancel}
          wrapClassName="ant-modal-sidebar-right"
          transitionName="move-right"
          width={1000}
          footer={null}
        >
          <InvestigationTab
            config={previewConfig}
            organizationId={organizationId}
            tabPosition="left"
            edit
          />
        </Modal>
      </React.Fragment>
    );
  }
}
