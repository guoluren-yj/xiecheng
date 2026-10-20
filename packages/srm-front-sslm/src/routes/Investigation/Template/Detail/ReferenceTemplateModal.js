/*
 * ReferenceTemplateModal - 引用模板弹窗页面
 * @date: 2018/09/03 16:11:56
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

const { TabPane } = Tabs;

@connect(({ loading, investigationDefinitionOrg }) => ({
  investigationDefinitionOrg,
  loading: loading.effects['investigationDefinitionOrg/init'],
  savingSite: loading.effects['investigationDefinitionOrg/saveReferenceTemplateSite'],
  savingOrg: loading.effects['investigationDefinitionOrg/saveReferenceTemplateOrg'],
  loadingOrg: loading.effects['investigationDefinitionOrg/fetchInvestigateListOrg'],
  loadingSite: loading.effects['investigationDefinitionOrg/fetchInvestigateListSite'],
}))
@formatterCollections({
  code: ['sslm.referTemp'],
})
export default class ReferenceTemplateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'org',
      investigateTemplateId: props.investigateTemplateId,
      updateInvestigateTemplateId: props.updateInvestigateTemplateId,
      // currentTenantId: getCurrentOrganizationId(),
      selectedRowKeysSite: [], // 平台级选中模板
      selectedRowKeysOrg: [], // 租户级选中模板
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'investigationDefinitionOrg/queryInviteTypes',
    });
    this.handleSearch();
  }

  @Bind()
  handleSearch(fields) {
    const { activeKey } = this.state;
    if (activeKey === 'org') {
      this.handleSearchOrg(fields);
    } else {
      this.handleSearchSite(fields);
    }
  }

  /**
   * 查询可引用的模板列表平台
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearchSite(page) {
    const { dispatch } = this.props;
    const fields = this.siteForm ? this.siteForm.getFieldsValue() : {};
    dispatch({
      type: 'investigationDefinitionOrg/fetchInvestigateListSite',
      payload: {
        page,
        ...fields,
      },
    });
  }

  /**
   * 查询可引用的模板列表租户
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearchOrg(page) {
    const { dispatch } = this.props;
    const { updateInvestigateTemplateId } = this.state;
    const fields = this.orgForm ? this.orgForm.getFieldsValue() : {};
    dispatch({
      type: 'investigationDefinitionOrg/fetchInvestigateListOrg',
      payload: {
        page,
        ...fields,
        investigateTemplateId: updateInvestigateTemplateId,
      },
    });
  }

  /**
   * 根据当前的key来查询对应的列表
   * @param {String} activeKey
   */
  @Bind()
  handleTabsChange(activeKey) {
    const {
      investigationDefinitionOrg: { templateListSite, templateListOrg },
    } = this.props;
    this.setState({
      activeKey,
    });
    const action = {
      site: () => {
        if (isEmpty(templateListSite)) {
          this.handleSearchSite();
        }
      },
      org: () => {
        if (isEmpty(templateListOrg)) {
          this.handleSearchOrg();
        }
      },
    };
    if (action[activeKey]) {
      action[activeKey]();
    }
  }

  @Bind()
  hideReferenceModal() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationDefinitionOrg/updateState',
      payload: {
        referenceModalVisible: false,
      },
    });
  }

  @Bind()
  showTemDetailModal() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationDefinitionOrg/updateState',
      payload: {
        temDetailVisible: true,
      },
    });
  }

  /**
   * 根据当前tab来调用不同的复制接口
   */
  @Bind()
  handleSave() {
    const {
      activeKey,
      updateInvestigateTemplateId,
      investigateTemplateId,
      selectedRowKeysSite,
      selectedRowKeysOrg,
    } = this.state;
    const { dispatch, callBack } = this.props;
    if (selectedRowKeysSite.length > 0 || selectedRowKeysOrg.length > 0) {
      if (activeKey === 'org') {
        if (selectedRowKeysOrg.length > 0) {
          const templateId = investigateTemplateId;
          const releasedTemplateId = updateInvestigateTemplateId;
          const quoteTemplateId = selectedRowKeysOrg[0];
          dispatch({
            type: 'investigationDefinitionOrg/saveReferenceTemplateOrg',
            payload: {
              releasedTemplateId,
              templateId,
              quoteTemplateId,
            },
          }).then((result) => {
            if (result) {
              notification.success();
              this.hideReferenceModal();
              if (isFunction(callBack)) {
                callBack();
              }
            }
          });
        } else {
          notification.warning({
            message: intl.get(`sslm.referTemp.view.message.mustChooseOne`).d('请选择一条模板'),
          });
        }
      } else if (activeKey === 'site') {
        const templateId = investigateTemplateId;
        const quoteTemplateId = selectedRowKeysSite[0];
        dispatch({
          type: 'investigationDefinitionOrg/saveReferenceTemplateSite',
          payload: {
            templateId,
            quoteTemplateId,
          },
        }).then((result) => {
          if (result) {
            notification.success();
            this.hideReferenceModal();
            if (isFunction(callBack)) {
              callBack();
            }
          }
        });
      }
    } else {
      notification.warning({
        message: intl.get(`sslm.referTemp.view.message.mustChooseOne`).d('请选择一条模板'),
      });
    }
  }

  /**
   * 平台级主键
   * @param {Array} newSelectedRowKeys
   */
  @Bind()
  handleRowSelectChangeSite(newSelectedRowKeys) {
    this.setState({ selectedRowKeysSite: newSelectedRowKeys });
  }

  /**
   * 租户级主键
   * @param {*} newSelectedRowKeys
   */
  @Bind()
  handleRowSelectChangeOrg(newSelectedRowKeys) {
    this.setState({ selectedRowKeysOrg: newSelectedRowKeys });
  }

  /**
   * 打开明细预览弹窗
   */
  @Bind()
  onHandleToTemplateDetail(investigateTemplateId) {
    const { dispatch } = this.props;
    const { activeKey } = this.state;
    dispatch({
      type: 'investigationDefinitionOrg/updateState',
      payload: {
        currentInvestigateTemplateId: investigateTemplateId,
        activeKey,
      },
    });
    this.showTemDetailModal();
  }

  render() {
    const {
      investigationDefinitionOrg: {
        referenceModalVisible,
        referenceSitePagination,
        referenceOrgPagination,
        templateListSite,
        templateListOrg,
        investigateTypes = [],
      },
      loadingOrg,
      loadingSite,
      savingSite,
      savingOrg,
      customizeTabPane = () => {},
    } = this.props;
    const { activeKey, selectedRowKeysSite, selectedRowKeysOrg } = this.state;
    const siteFilterProps = {
      investigateTypes, // 调查表类型
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.siteForm = node.props.form;
      },
    };
    const orgFilterProps = {
      investigateTypes, // 调查表类型
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.orgForm = node.props.form;
      },
    };
    const listPropsSite = {
      activeKey,
      pagination: referenceSitePagination,
      dataSource: templateListSite,
      loading: loadingSite,
      onEditLine: this.editLine,
      onHandleToTemplateDetail: this.onHandleToTemplateDetail,
      onSearchPaging: this.handleSearchSite,
      rowSelection: {
        selectedRowKeys: selectedRowKeysSite, // 选中的keys
        type: 'radio',
        // selectedRows选中的行的内容
        onChange: this.handleRowSelectChangeSite, // 选定项改变传入index
        onCleanSelectedKeys: () => this.handleRowSelectChangeSite([], []),
        getCheckboxProps: (record) => ({
          disabled: record.disabled,
        }),
      },
    };
    const listPropsOrg = {
      activeKey,
      pagination: referenceOrgPagination,
      dataSource: templateListOrg,
      loading: loadingOrg,
      onEditLine: this.editLine,
      onHandleToTemplateDetail: this.onHandleToTemplateDetail,
      onSearchPaging: this.handleSearchOrg,
      rowSelection: {
        selectedRowKeys: selectedRowKeysOrg, // 选中的keys
        type: 'radio',
        // selectedRows选中的行的内容
        onChange: this.handleRowSelectChangeOrg, // 选定项改变传入index
        onCleanSelectedKeys: () => this.handleRowSelectChangeOrg([], []),
        getCheckboxProps: (record) => ({
          disabled: record.disabled,
        }),
      },
    };
    return (
      <Modal
        title={intl.get(`sslm.referTemp.view.message.title.referenceModal`).d('引用模板')}
        visible={referenceModalVisible}
        onCancel={this.hideReferenceModal}
        onOk={this.handleSave}
        confirmLoading={savingSite || savingOrg}
        width={1000}
      >
        {customizeTabPane(
          {
            code: 'SSLM.INVESTIGATION_TEMPLATE_DETAILE.REFERENCE',
          },
          <Tabs onChange={this.handleTabsChange} animated={false}>
            <TabPane
              tab={intl.get(`sslm.referTemp.view.message.title.site`).d('平台级模板')}
              key="site"
            >
              <FilterForm {...siteFilterProps} />
              <ListTable {...listPropsSite} />
            </TabPane>
            <TabPane
              tab={intl.get(`sslm.referTemp.view.message.title.org`).d('租户级模板')}
              key="org"
            >
              <FilterForm {...orgFilterProps} />
              <ListTable {...listPropsOrg} />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    );
  }
}
