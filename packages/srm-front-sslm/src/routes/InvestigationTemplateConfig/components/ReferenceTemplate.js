/*
 * ReferenceTemplate - 引用模板Tabs
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Tabs, TextField, Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse } from 'utils/utils';

import TempatePreview from '@/routes/components/Investigation';

import {
  saveReferenceTemplateSite,
  saveReferenceTemplateOrg,
} from '@/services/investigationDefinitionOrgService';

import styles from '../index.less';

const tableMaxHeight = `calc(100vh - 209px)`;
/**
 * 引用模板
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
export default class ReferenceTemplate extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      activeKey: 'org',
      pageChacheFlag: true,
    };
  }

  /**
   * 处理确认勾选模板
   */
  @Bind()
  async handleClickOk() {
    const { activeKey } = this.state;
    const {
      siteTempDs,
      orgTempDs,
      newInvestigateTemplateId,
      oldInvestigateTemplateId,
    } = this.props;
    if (activeKey === 'site') {
      const selectedData = siteTempDs.toJSONData();
      if (isEmpty(selectedData)) {
        notification.warning({
          message: intl.get(`sslm.referTemp.view.message.mustChooseOne`).d('请选择一条模板'),
        });
        return false;
      }
      const { investigateTemplateId } = selectedData[0] || {};
      const payload = {
        templateId: oldInvestigateTemplateId,
        quoteTemplateId: investigateTemplateId,
      };
      const res = await this.handleSaveReferenceTemplate(payload);
      return res;
    } else if (activeKey === 'org') {
      const selectedData = orgTempDs.toJSONData();
      if (isEmpty(selectedData)) {
        notification.warning({
          message: intl.get(`sslm.referTemp.view.message.mustChooseOne`).d('请选择一条模板'),
        });
        return false;
      }
      const { investigateTemplateId } = selectedData[0] || {};
      const payload = {
        releasedTemplateId: newInvestigateTemplateId,
        templateId: oldInvestigateTemplateId,
        quoteTemplateId: investigateTemplateId,
      };
      const res = await this.handleSaveReferenceTemplate(payload);
      return res;
    }
  }

  /**
   * 引用模板表格行预览
   */
  @Bind()
  handlePreviewModal(record) {
    const { activeKey } = this.state;
    const investigateTemplateId = record.get('investigateTemplateId');
    Modal.open({
      title: intl.get(`spfm.investigationDefinition.view.message.title.modal`).d('模板明细'),
      drawer: true,
      children: (
        <TempatePreview
          investigateTemplateId={investigateTemplateId}
          type={activeKey}
          previewFlag
          showTabBar={false}
          isModalFlag
        />
      ),
      style: { width: 1090 },
      bodyStyle: {
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
      okText: intl.get(`sslm.investTempConfig.view.button.referenceTemplate`).d('引用此模板'),
      onOk: () => {
        // 保存选择行 todo
        return this.handleReferenceTemplate(record);
      },
    });
  }

  /**
   * 处理保存
   */
  @Bind()
  async handleReferenceTemplate(record) {
    const { activeKey } = this.state;
    const { newInvestigateTemplateId, oldInvestigateTemplateId, modal } = this.props;
    const selectedData = record.toData();
    if (activeKey === 'site') {
      const { investigateTemplateId } = selectedData || {};
      const payload = {
        templateId: oldInvestigateTemplateId,
        quoteTemplateId: investigateTemplateId,
      };
      const res = await this.handleSaveReferenceTemplate(payload);
      if (res) {
        // 关闭引用模板弹窗
        if (modal) {
          modal.close();
        }
      }
      return res;
    } else if (activeKey === 'org') {
      const { investigateTemplateId } = selectedData || {};
      const payload = {
        releasedTemplateId: newInvestigateTemplateId,
        templateId: oldInvestigateTemplateId,
        quoteTemplateId: investigateTemplateId,
      };
      const res = await this.handleSaveReferenceTemplate(payload);
      if (res) {
        // 关闭引用模板弹窗
        if (modal) {
          modal.close();
        }
      }
      return res;
    }
  }

  // 引用租户/平台模板接口调用
  @Bind()
  async handleSaveReferenceTemplate(payload) {
    const { activeKey } = this.state;
    const { handleRefresh = () => {} } = this.props;
    if (activeKey === 'site') {
      return saveReferenceTemplateSite(payload).then(res => {
        if (getResponse(res)) {
          notification.success();
          // 关闭弹窗 刷新页面
          handleRefresh();
          return true;
        }
        return false;
      });
    } else {
      return saveReferenceTemplateOrg(payload).then(res => {
        if (getResponse(res)) {
          notification.success();
          // 关闭弹窗 刷新页面
          handleRefresh();
          return true;
        }
        return false;
      });
    }
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'templateCode',
      },
      {
        name: 'templateName',
      },
      {
        name: 'investigateTypeMeaning',
      },
      {
        name: 'industryMeaning',
      },
      {
        name: 'remark',
      },
      {
        name: 'templateDetail',
        renderer: ({ record }) => {
          return (
            <a
              onClick={() => {
                this.handlePreviewModal(record);
              }}
            >
              {intl.get(`sslm.referTemp.model.referTemp.templateDetails`).d('预览')}
            </a>
          );
        },
      },
      {
        name: 'creationDate',
        width: 200,
      },
    ];
    return columns;
  }

  // 筛选器左侧渲染
  @Bind()
  renderLeftSearchBar(type = '') {
    const { siteTempDs, orgTempDs } = this.props;
    const currentDs = type === 'site' ? siteTempDs : orgTempDs;
    return (
      <TextField
        clearButton
        style={{ width: 250 }}
        valueChangeAction="blur"
        onChange={value => {
          // eslint-disable-next-line no-unused-expressions
          currentDs.queryDataSet?.current?.set('templateName', value);
          currentDs.query();
        }}
        value={currentDs.queryDataSet?.current?.get('templateName')}
        placeholder={intl
          .get('sslm.investDefOrg.model.investDefOrg.templateNameQuery')
          .d('请输入名称模板查询')}
      />
    );
  }

  // 查询
  @Bind()
  handleQuery(queryProps = {}, type = '') {
    const { pageChacheFlag } = this.state;
    const siteFlag = type === 'site';
    const { siteTempDs, orgTempDs } = this.props;
    const { params } = queryProps;
    const currentDs = siteFlag ? siteTempDs : orgTempDs;
    if (currentDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = currentDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['templateName'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      currentDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        currentDs.query(currentDs.currentPage);
      } else {
        currentDs.query();
      }
    } else {
      currentDs.query();
    }
  }

  // 清空、重置回调
  @Bind()
  clearValues(type = '') {
    const { siteTempDs, orgTempDs } = this.props;
    const siteFlag = type === 'site';
    const dataSet = siteFlag ? siteTempDs : orgTempDs;
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  }

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabChange(key) {
    this.setState(
      {
        activeKey: key,
        pageChacheFlag: true,
      }
      // () => {
      //   this.handleQuery();
      // }
    );
  }

  render() {
    const { customizeTable = () => {}, siteTempDs, orgTempDs } = this.props;
    const { activeKey } = this.state;

    return (
      <React.Fragment>
        <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabChange}>
          <Tabs.TabPane
            tab={<span>{intl.get(`sslm.referTemp.view.message.title.site`).d('平台级模板')}</span>}
            key="site"
          >
            <div style={{ height: tableMaxHeight }}>
              {customizeTable(
                {
                  code: 'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.REF_SITE_LIST',
                },
                <SearchBarTable
                  cacheState
                  dataSet={siteTempDs}
                  columns={this.getColumns()}
                  searchCode="SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.SITE.SEARCH_BAR"
                  style={{ maxHeight: '100%' }}
                  searchBarConfig={{
                    closeFilterSelector: true,
                    expandable: false,
                    editorProps: {},
                    left: {
                      render: () => this.renderLeftSearchBar('site'),
                    },
                    onQuery: queryProps => this.handleQuery(queryProps, 'site'),
                    onReset: () => this.clearValues('site'),
                    onClear: () => this.clearValues('site'),
                    onFieldChange: () => {
                      this.setState({
                        pageChacheFlag: false,
                      });
                    },
                  }}
                  className={styles['reference-template-table']}
                />
              )}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<span>{intl.get(`sslm.referTemp.view.message.title.org`).d('租户级模板')}</span>}
            key="org"
          >
            <div style={{ height: tableMaxHeight }}>
              {customizeTable(
                {
                  code: 'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.REF_ORG_LIST',
                },
                <SearchBarTable
                  cacheState
                  dataSet={orgTempDs}
                  columns={this.getColumns()}
                  searchCode="SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.ORG.SEARCH_BAR"
                  style={{ maxHeight: '100%' }}
                  searchBarConfig={{
                    closeFilterSelector: true,
                    expandable: false,
                    editorProps: {},
                    left: {
                      render: () => this.renderLeftSearchBar('org'),
                    },
                    onQuery: queryProps => this.handleQuery(queryProps, 'org'),
                    onReset: () => this.clearValues('org'),
                    onClear: () => this.clearValues('org'),
                    onFieldChange: () => {
                      this.setState({
                        pageChacheFlag: false,
                      });
                    },
                  }}
                  className={styles['reference-template-table']}
                />
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  }
}
