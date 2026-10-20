/**
 * 调查表模版
 * @date Mon Aug 13 2018
 * @author yunqiang.wu yunqiang.wu@hang-china.com
 * @copyright Copyright(c) 2018 Hand
 */
import React from 'react';
import { Button, Spin, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { toSafeInteger, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import PropTypes from 'prop-types';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import HeadInfo from './HeadInfo';
import Items from './Items';
import InvestigationTab from '../../Component';

/**
 * 平台级模板明细定义
 * @extends {Component} - PureComponent
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} investigationDefinitionSite - 数据源
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, investigationDefinitionSite }) => ({
  investigationDefinitionSite,
  loading: loading.effects['investigationDefinitionSite/init'],
  loadingPreview: loading.effects['investigationDefinitionSite/openPreview'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: 'spfm.investigationDefinition' })
export default class Definition extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { investigateTemplateId },
      },
    } = props;
    this.state = {
      investigateTemplateId: toSafeInteger(investigateTemplateId),
    };
  }

  getChildContext() {
    return {
      isOrg: false, // 是否租户级
    };
  }

  static childContextTypes = {
    isOrg: PropTypes.bool,
  };

  componentDidMount() {
    this.fetchList();
  }

  /**
   * 查询数据
   */
  @Bind()
  fetchList() {
    const { dispatch } = this.props;
    const { investigateTemplateId } = this.state;
    if (isNumber(investigateTemplateId)) {
      dispatch({
        type: 'investigationDefinitionSite/init',
        payload: { investigateTemplateId },
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
      type: 'investigationDefinitionSite/openPreview',
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
      type: 'investigationDefinitionSite/updateState',
      payload: {
        previewVisible: false,
      },
    });
  }

  @Bind()
  handleReload() {
    this.fetchList();
  }

  render() {
    const {
      loading,
      organizationId,
      loadingPreview = false,
      investigationDefinitionSite: {
        headerInfo,
        config,
        previewConfig = [],
        previewVisible = false,
      },
    } = this.props;

    return (
      <React.Fragment>
        <Header
          title={intl.get(`spfm.investigationDefinition.view.message.title`).d('调查表明细维护')}
          backPath="/spfm/investigation-template-define/list"
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
            <HeadInfo headerInfo={headerInfo} />
            <h3>
              {intl.get(`spfm.investigationDefinition.view.message.title.config`).d('配置项信息')}
            </h3>
            <Items config={config} />
            <Modal
              title={intl
                .get(`spfm.investigationDefinition.view.message.title.modal`)
                .d('模板明细')}
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
                bucketName="srm-platform"
                edit
              />
            </Modal>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
