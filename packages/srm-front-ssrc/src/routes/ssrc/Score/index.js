/**
 * Score - 评分模板入口
 * @date: 2019-1-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Tabs } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import uuidV4 from 'uuid/v4';
import queryString from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';
// import { enableRender, numberRender } from 'utils/renderer';
import {
  getEditTableData,
  addItemToPagination,
  getCurrentOrganizationId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { openTab } from 'utils/menuTab';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { SRM_SSRC } from '_utils/config';

import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import common from '@/routes/ssrc/common.less';
import ElementsTable from './Elements';
import TemplateTable from './Template';
import Iconfont from '../components/Icons'; // 下载至本地的icon

const promptCode = 'ssrc.score';

/**
 * 评分模板入口
 * @extends {Component} - Component
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} taxRateOrg - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} saving - 保存按钮是否提交成功
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch= e=>e ] - redux dispatch方法
 * @return React.element
 */

class Score extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'elements',
      tenantId: getCurrentOrganizationId(),
      newScoreFlag: false, // 新分值法
    };
  }

  componentDidMount() {
    this.queryValueCode();
    // 查询是否使用新评分法
    this.queryNewScoreConfigSheet();
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'score/queryValueCode',
      payload: {
        scoreModeList: 'SSRC.SCORE_MODE', // 评分模式
        templatePurposeList: 'SSRC.SCORE_TEMPLATE_PURPOSE', // 模板用途
        scoreTemplateScoreType: 'SSRC.TEMPLATE_SCORE_TYPE', // 模板评分类型
      },
    });
  }

  // 配置表 是否使用新评分法
  @Bind()
  async queryNewScoreConfigSheet() {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_new_score_type_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (isEmpty(data)) {
        this.setState({ newScoreFlag: true });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * tabs切换执行
   * @param {String} activeKey 激活面板的key
   */
  @Bind()
  handleTabsChange(activeKey) {
    // const { score: { templatePagination = {} } } = this.props;
    // if (activeKey === 'elements') {
    //   // this.handleSearchTemplate();
    // } else if(activeKey==='template') {
    //   this.templateTable.handleSearchTemplate(templatePagination);
    // }
    this.setState({ activeKey });
  }

  /**
   * 新建一行
   * @param {String} activeKey tabKey
   */
  @Bind()
  @Debounce(200)
  handleCreateRow(activeKey) {
    const {
      dispatch,
      score: {
        elementsList = [],
        elementsPagination = {},
        templateList = [],
        templatePagination = {},
      },
    } = this.props;
    const { tenantId } = this.state;
    if (activeKey === 'elements') {
      dispatch({
        type: 'score/updateState',
        payload: {
          elementsList: [
            {
              indicateId: uuidV4(),
              enabledFlag: 1,
              detailEnabledFlag: 0,
              tenantId,
              _status: 'create',
            },
            ...elementsList,
          ],
          elementsPagination: addItemToPagination(elementsList.length, elementsPagination),
        },
      });
    } else if (activeKey === 'template') {
      dispatch({
        type: 'score/updateState',
        payload: {
          templateList: [
            {
              templateId: uuidV4(),
              enabledFlag: 1,
              tenantId,
              _status: 'create',
            },
            ...templateList,
          ],
          templatePagination: addItemToPagination(templateList.length, templatePagination),
        },
      });
    }
  }

  /**
   * 保存
   * @protected （乐成教育二开）禁止修改、删除此方法名
   */
  @Bind()
  handleSave(activeKey) {
    const {
      dispatch,
      score: {
        elementsList = [],
        templateList = [],
        templatePagination = {},
        elementsPagination = {},
      },
    } = this.props;
    if (activeKey === 'elements') {
      // 先校验行内编辑
      const elementsData = getEditTableData(elementsList, ['indicateId']);
      if (isEmpty(elementsData)) return;
      // 行内编辑通过，检验有木有新增一级评分要素
      const createdElement = elementsData.find((item) => item._status === 'create');
      // 存在新增一级评分要素
      if (!isEmpty(createdElement) && createdElement.detailEnabledFlag) {
        notification.warning({
          message: `${createdElement.indicateName}${intl
            .get('ssrc.score.view.notification.elements.empty')
            .d('尚未维护评分要素细项！')}`,
        });
      } else {
        dispatch({
          type: 'score/saveElements',
          payload: {
            elementsData,
            customizeUnitCode: 'SSRC.SCORE_TEMPLATE.SCORE_ELEMENT_LIST',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.searchElements(elementsPagination);
          }
        });
      }
    } else if (activeKey === 'template') {
      const templateData = getEditTableData(templateList, ['templateId']);
      if (isEmpty(templateData)) return;

      const newTemplateData = templateData.map((item) =>
        item.scoreMode === 'NONE' ? { ...item, technologyWeight: null, businessWeight: null } : item
      );
      // 区分商务技术  templatePurpose scoreMode
      // const diffData = newTemplateData.filter(
      //   (item) => item.scoreMode === 'DIFF' && item.templatePurpose === 'EXPERT_SCORE'
      // );

      // if (
      //   !isEmpty(diffData) &&
      //   diffData.some((item) => item.technologyWeight + item.businessWeight !== 100)
      // ) {
      //   notification.warning({
      //     message: intl
      //       .get('ssrc.score.view.notification.weight.templateSum')
      //       .d('保存失败，请保持模板技术商务权重之和为100！'),
      //   });
      // } else {
      dispatch({
        type: 'score/saveTemplate',
        payload: newTemplateData,
      }).then((res) => {
        if (res) {
          notification.success();
          this.searchTemplate(templatePagination);
        }
      });
      // }
    }
  }

  /**
   * 回调查询模板的函数
   * @param {Function} ref
   */
  @Bind()
  handleBindSearchTemplate(ref = {}) {
    this.searchTemplate = ref;
  }

  /**
   * 回调查询模板的函数
   * @param {Function} ref
   */
  @Bind()
  handleBindSearchElements(ref = {}) {
    this.searchElements = ref;
  }

  /**
   * 批量创建
   */
  @Bind()
  handleBatchExport() {
    const { tenantId } = this.state;
    openTab({
      key: '/ssrc/score/comment-import/SSRC.SCORE_INDICATE',
      search: queryString.stringify({
        key: '/ssrc/score/comment-import/SSRC.SCORE_INDICATE',
        title: 'hzero.common.title.batchImport',
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        auto: true,
        backPath: `/ssrc/score/list`,
        args: JSON.stringify({
          tenantId,
        }),
      }),
    });
  }

  @Bind()
  renderElementsTable(elementsProps) {
    return <ElementsTable {...elementsProps} />;
  }

  /**
   * 模板表格
   * @protected （乐成教育二开）禁止修改、删除此方法名
   */
  @Bind()
  renderTemplatesTable(templateProps) {
    return <TemplateTable {...templateProps} />;
  }

  render() {
    const {
      loading,
      saving,
      score: { elementsList = [], templateList = [] } = {},
      customizeTable,
      customizeFilterForm,
      custLoading,
      customizeBtnGroup,
    } = this.props;
    const { activeKey, newScoreFlag = false } = this.state;

    const isElementsSave = elementsList.filter(
      (o) => o._status === 'create' || o._status === 'update'
    );
    const isTemplateSave = templateList.filter(
      (o) => o._status === 'create' || o._status === 'update'
    );

    const elementsProps = {
      customizeTable,
      customizeFilterForm,
      custLoading,
      onBindSearch: this.handleBindSearchElements,
    };

    const templateProps = {
      onBindSearch: this.handleBindSearchTemplate,
      customizeTable,
      customizeFilterForm,
      custLoading,
      newScoreFlag,
    };

    const importProps = {
      businessObjectTemplateCode: 'SSRC.SCORE_INDICATE',
      prefixPatch: SRM_SSRC,
      auto: true,
      args: {
        tenantId: getCurrentOrganizationId(),
      },
      buttonText: intl.get('hzero.common.button.import.new').d('(新)导入'),
      icon: 'archive',
      buttonProps: {
        permissionList: [
          {
            code: `${this.props.match.path}.button.batch-import-new`,
            type: 'button',
            meaning:
              intl.get(`${promptCode}.view.title.scoreAndTemplate`).d('评分要素及模板') -
              intl.get(`ssrc.inquiryHall.view.message.button.elementsImportNew`).d('批量创建'),
          },
        ],
      },
      tenantId: getCurrentOrganizationId(),
      name: 'batchImportNew',
      successCallBack: this.searchElements,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`ssrc.score.view.title.scoreAndTemplate`).d('评分要素及模板')}>
          {customizeBtnGroup({ code: 'SSRC.SCORE_TEMPLATE.LIST_BUTTONS' }, [
            <Button
              type="primary"
              icon="plus"
              loading={loading}
              onClick={() => this.handleCreateRow(activeKey)}
              name="create"
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>,
            <Button
              icon="save"
              loading={saving}
              disabled={
                activeKey === 'elements' ? isEmpty(isElementsSave) : isEmpty(isTemplateSave)
              }
              onClick={() => this.handleSave(activeKey)}
              name="save"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>,
            <Button type="default" onClick={() => this.handleBatchExport()} name="import">
              <Iconfont type="main-import" size={16} className={common['btn-icon']} />
              {intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}
            </Button>,
            <CommonImportNew {...importProps} />,
          ])}
        </Header>
        <Content style={{ padding: '0px 16px' }}>
          <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabsChange}>
            <Tabs.TabPane
              tab={intl.get(`${promptCode}.view.message.tab.elementsDef`).d('评分要素定义')}
              key="elements"
              // forceRender
            >
              {this.renderElementsTable(elementsProps)}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`${promptCode}.view.message.tab.templateDef`).d('评分模板定义')}
              key="template"
              // forceRender
            >
              {this.renderTemplatesTable(templateProps)}
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}

const hocScore = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.SCORE_TEMPLATE.TMPL_ASSIGN',
      'SSRC.SCORE_TEMPLATE.LIST_BUTTONS',
      'SSRC.SCORE_TEMPLATE.SCORE_ELEMENT_LIST',
      'SSRC.SCORE_TEMPLATE.SCORE_ELEMENT_FILTER',
      'SSRC.SCORE_TEMPLATE.SCORE_TEMPLATE_FILTER',
    ],
  })(
    connect(({ score, loading }) => ({
      score,
      saving: loading.effects['score/saveTemplate'] || loading.effects['score/saveElements'],
    }))(
      formatterCollections({ code: ['ssrc.score', 'ssrc.inquiryHall', 'scux.ssrc'] })(
        CacheComponent({ cacheKey: '/ssrc/score' })(NewComponent)
      )
    )
  );
};
export default hocScore(Score);
export { hocScore, Score };
