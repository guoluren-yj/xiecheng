/*
 * InvestigationSite - 平台级调查模板定义
 * @date: 2018/08/07 15:12:28
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Modal } from 'hzero-ui';
import PropTypes from 'prop-types';
import querystring from 'querystring';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { filterNullValueObject, getEditTableData } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import { DATETIME_MIN } from 'utils/constants';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import SiteAddForm from './SiteAddForm';

@connect(({ loading, investigationTemDefineSite }) => ({
  loading: loading.effects['investigationTemDefineSite/fetchInvestigateList'],
  saving: loading.effects['investigationTemDefineSite/changeInvestigate'],
  investigationTemDefineSite,
}))
@formatterCollections({ code: ['sslm.questionnairePresetSite', 'spfm.investigation'] })
export default class InvestigationSite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  siteForm;

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      investigationTemDefineSite: { pagination = {} },
      dispatch,
    } = this.props;
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      dispatch({
        type: 'investigationTemDefineSite/fetchEnum',
      });
      this.handleSearch();
    }
  }

  /**
   * 查询平台计量单位类型列表
   * @param {obj} page 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.formDom)
      ? {}
      : filterNullValueObject(this.formDom.getFieldsValue());
    const { endDate, startDate } = filterValues;
    dispatch({
      type: 'investigationTemDefineSite/fetchInvestigateList',
      payload: {
        page,
        ...filterValues,
        startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
        endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
      },
    });
  }

  @Bind()
  setModalVisible(flag) {
    this.setState({ modalVisible: flag });
  }

  /**
   * 新建一条调查模板
   * 改变列表状态树和新建的Map
   */
  @Bind()
  handleCreateQuestionnaire() {
    // this.siteForm.resetFields();
    this.setModalVisible(true);
  }

  /**
   * 把dataSource中新增的和dataSourceMap中修改的传给接口
   */
  @Bind()
  handleSave() {
    const {
      investigationTemDefineSite: { investigateList, pagination },
      dispatch,
    } = this.props;
    const addList = getEditTableData(investigateList);
    if (Array.isArray(addList) && addList.length === 0) {
      return;
    }
    dispatch({
      type: 'investigationTemDefineSite/changeInvestigate',
      payload: addList,
    }).then(data => {
      if (data) {
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  @Bind()
  handleAdd() {
    const {
      dispatch,
      investigationTemDefineSite: { pagination },
    } = this.props;
    this.siteForm.validateFields((err, values) => {
      if (!err) {
        const addList = [];
        addList.push(values);
        dispatch({
          type: 'investigationTemDefineSite/changeInvestigate',
          payload: addList,
        }).then(data => {
          if (data) {
            this.setState({ modalVisible: false });
            this.handleSearch(pagination);
            notification.success();
          }
        });
      }
    });
  }

  /**
   * 取消新建的调查模板
   * 更改table状态树和新建的数据Map
   * @param {Object} record 删除行信息
   */
  @Bind()
  onHandleDelete(record = {}) {
    const {
      dispatch,
      investigationTemDefineSite: { investigateList, pagination },
    } = this.props;
    const newInvestigateList = investigateList.filter(
      item => item.investigateTemplateId !== record.investigateTemplateId
    );
    dispatch({
      type: 'investigationTemDefineSite/updateState',
      payload: {
        investigateList: newInvestigateList,
        pagination: {
          ...pagination,
          pageSize: pagination.pageSize - 1,
          total: pagination.total - 1,
        },
      },
    });
  }

  /**
   *分页改变时的回调查询方法
   *
   * @param {obj} page
   * @memberof Uom
   */
  @Bind()
  handleStandardTableChange(page = {}) {
    const {
      investigationTemDefineSite: { investigateList },
    } = this.props;
    if (investigateList.some(item => item.isEdit || item.isNew)) {
      Modal.confirm({
        title: intl.get(`spfm.investigation.view.message.title.pageChange`).d('确定离开此页面吗？'),
        content: intl.get(`spfm.investigation.view.message.content.pageChange`).d('有未保存的修改'),
        onOk() {
          this.handleSearch(page);
        },
        onCancel() {},
      });
    } else {
      this.handleSearch(page);
    }
  }

  @Bind()
  onHandleToTemplateDetail(investigateTemplateId) {
    this.props.history.push(`/spfm/investigation-template-define/detail/${investigateTemplateId}`);
  }

  /**
   * 跳转到引用模板复制页面
   * @param {*} investigateType
   * @param {*} industryId
   * @param {*} investigateTemplateId
   */
  @Bind()
  onHandleReferenceTemplate(investigateType, industryId, industryMeaning, investigateTemplateId) {
    const search = querystring.stringify({
      investigateType,
      industryId,
      investigateTemplateId,
      industryMeaning,
      tab: 'site',
    });
    const path = {
      pathname: `/sslm/reference-template`,
      search,
    };
    this.props.history.push(path);
  }

  render() {
    const {
      loading,
      saving,
      investigationTemDefineSite: { investigateList, pagination, investigateTypes },
    } = this.props;
    const { modalVisible } = this.state;
    const filterProps = {
      loading,
      investigateTypes,
      onRef: node => {
        this.formDom = node.props.form;
      },
      onFilterChange: this.handleSearch,
    };
    const listProps = {
      pagination,
      investigateTypes,
      loading,
      dataSource: investigateList,
      editLine: this.editLine,
      onSearchPaging: this.handleStandardTableChange,
      onHandleDelete: this.onHandleDelete,
      onHandleToTemplateDetail: this.onHandleToTemplateDetail,
      onHandleReferenceTemplate: this.onHandleReferenceTemplate,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`spfm.investigation.view.message.title`).d('调查表模板定义')}>
          <Button icon="plus" type="primary" onClick={this.handleCreateQuestionnaire}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" onClick={this.handleSave} loading={saving || loading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
        <SiteAddForm
          anchor="right"
          title={intl
            .get(`spfm.investigation.view.message.title.modal`)
            .d('新增平台级调查模板预置')}
          onRef={ref => {
            this.siteForm = ref.props.form;
          }}
          onHandleAdd={this.handleAdd}
          confirmLoading={saving}
          visible={modalVisible}
          onCancel={() => this.setModalVisible(false)}
          investigateTypes={investigateTypes}
        />
      </React.Fragment>
    );
  }
}
