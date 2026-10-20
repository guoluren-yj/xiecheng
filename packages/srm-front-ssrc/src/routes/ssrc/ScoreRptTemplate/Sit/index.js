/**
 * scoreRptTemplate - 评分报告
 * @date: 2020-06-18
 * @author: LS <shuo.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import querystring from 'querystring';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

@formatterCollections({ code: ['ssrc.scoreRptTemplate', 'hzero.common'] })
@connect(({ scoreRptTemplate, loading }) => ({
  scoreRptTemplate,
  tenantId: getCurrentOrganizationId(),
  loading: loading.effects['scoreRptTemplate/fetchScorRpt'],
  copyLoading: loading.effects['scoreRptTemplate/copyTemplate'],
  deleteLoading: loading.effects['scoreRptTemplate/deleteTemplate'],
}))
export default class ProcessDefine extends Component {
  form;

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      scoreRptTemplate: { pagination = {} },
      dispatch,
    } = this.props;
    this.handleSearch(pagination);
    dispatch({
      type: 'scoreRptTemplate/fetchQueryBatchCode',
      payload: {
        lovCodes: {
          statusList: 'HPFM.ENABLED_FLAG',
          typeList: 'SSRC.SCORE_RPT_TEMPLATE_TYPE',
        },
      },
    });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'scoreRptTemplate/fetchScorRpt',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * 跳转到明细页
   * @param {String} templateId
   */
  @Bind()
  redirectDetail(templateId) {
    const { dispatch } = this.props;
    if (templateId) {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/scoreRptTemplate-site/detail`,
          search: templateId ? querystring.stringify({ templateId }) : null,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/scoreRptTemplate-site/create`,
        })
      );
    }
  }

  @Bind()
  viewTemplate(templateId) {
    const { dispatch } = this.props;
    if (templateId) {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/scoreRptTemplate-site/detail`,
          search: templateId ? querystring.stringify({ templateId, viewOnly: 1 }) : null,
        })
      );
    }
  }

  render() {
    const {
      scoreRptTemplate: {
        resultsList = [],
        pagination = {},
        lovCode: { statusList, typeList },
      },
      tenantId,
      loading,
    } = this.props;
    // const {

    // } = this.state;
    const filterProps = {
      // category,
      // isSiteFlag,
      onSearch: this.handleSearch,
      statusList,
      typeList,
      onRef: this.handleBindRef,
    };
    const listProps = {
      dataSource: resultsList,
      pagination,
      loading,
      tenantId,
      redirectDetail: this.redirectDetail,
      viewTemplate: this.viewTemplate,
      onChange: this.handleSearch,
    };

    return (
      <>
        <Header
          title={intl.get('ssrc.scoreRptTemplate.model.scoreRptTemplate.title').d('评分报告')}
        >
          <Button icon="plus" type="primary" onClick={() => this.redirectDetail()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </>
    );
  }
}
