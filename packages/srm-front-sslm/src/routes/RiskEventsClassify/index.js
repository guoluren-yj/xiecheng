/**
 * RiskEventsClassify - 风险分类
 * @date: 2019-07-03
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getEditTableData, getUserOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

@connect(({ riskMonitoring, loading }) => ({
  riskMonitoring,
  tenantId: getUserOrganizationId(),
  riskClassifyList: riskMonitoring.riskClassifyList,
  riskScanList: riskMonitoring.riskScanList,
  riskClassifyPagination: riskMonitoring.riskClassifyPagination,
  queryRiskClassifyLoading: loading.effects['riskMonitoring/queryRiskClassify'],
  saveRiskClassifyLoading: loading.effects['riskMonitoring/saveRiskClassify'],
  enabledLoading: loading.effects['riskMonitoring/enabledRiskClassify'],
}))
@formatterCollections({ code: ['sslm.riskEvents'] })
export default class RiskEventsClassify extends Component {
  form;

  componentDidMount() {
    this.queryCode();
    this.queryRiskClassify();
  }

  /**
   * 值集查询
   */
  @Bind()
  queryCode() {
    const { dispatch, tenantId } = this.props;
    const code = {
      tenantId,
      messageType: 'SSLM.RISK.MESSAGE_TYPE',
    };
    dispatch({
      type: 'riskMonitoring/queryValueCode',
      payload: code,
    });
  }

  /**
   * 绑定表单form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询风险分类
   */
  @Bind()
  queryRiskClassify(page = {}) {
    const { dispatch } = this.props;
    const formValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'riskMonitoring/queryRiskClassify',
      payload: {
        page,
        ...formValues,
      },
    });
  }

  /**
   * 行内编辑
   */
  @Bind()
  handleEditRiskClassify(record, flag) {
    const { riskClassifyList, dispatch } = this.props;
    const newRiskClassifyList = riskClassifyList.map(item => {
      const { ...newItem } = item;
      if (item.riskCategoryId === record.riskCategoryId) {
        return { ...newItem, _status: flag ? 'update' : '' };
      } else {
        return newItem;
      }
    });

    dispatch({
      type: 'riskMonitoring/updateState',
      payload: {
        riskClassifyList: newRiskClassifyList,
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSaveRiskClassify() {
    const { dispatch, riskClassifyList, riskClassifyPagination } = this.props;
    const tableValues = getEditTableData(riskClassifyList, ['_status', 'riskCategoryId']);

    if (!isEmpty(tableValues)) {
      dispatch({
        type: 'riskMonitoring/saveRiskClassify',
        payload: {
          tableValues,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.queryRiskClassify(riskClassifyPagination);
        }
      });
    }
  }

  /**
   * 取消
   */
  @Bind()
  handleCancelRiskClassify(record) {
    const { dispatch, riskClassifyList } = this.props;
    let updateList;

    if (record._status === 'create') {
      updateList = riskClassifyList.filter(item => item.riskCategoryId !== record.riskCategoryId);
    } else {
      updateList = riskClassifyList.map(item => {
        const { ...newItem } = item;
        if (item.riskCategoryId === record.riskCategoryId) {
          return { ...newItem, _status: '' };
        } else {
          return newItem;
        }
      });
    }

    dispatch({
      type: 'riskMonitoring/updateState',
      payload: {
        riskClassifyList: updateList,
      },
    });
  }

  /**
   * 新增分类
   */
  @Bind()
  handleAddRiskClassify() {
    const { dispatch, riskClassifyList, tenantId } = this.props;
    dispatch({
      type: 'riskMonitoring/updateState',
      payload: {
        riskClassifyList: [
          { _status: 'create', enabledFlag: 1, riskCategoryId: uuidv4(), tenantId },
          ...riskClassifyList,
        ],
      },
    });
  }

  /**
   * 启用/禁用
   */
  @Bind()
  handleEnabledRiskClassify(record) {
    const { dispatch, riskClassifyPagination } = this.props;
    const { _status, ...others } = record;
    dispatch({
      type: 'riskMonitoring/enabledRiskClassify',
      payload: {
        ...others,
        enabledFlag: record.enabledFlag === 1 ? 0 : 1,
        isSendMessage: record.enabledFlag === 0 ? record.isSendMessage : 0,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.queryRiskClassify(riskClassifyPagination);
      }
    });
  }

  /**
   * 查询风险事件维度
   */
  @Bind()
  handleSickDim(record) {
    const { dispatch } = this.props;
    if (record.riskCategoryId) {
      dispatch({
        type: 'riskMonitoring/queryRiskDim',
        payload: {
          riskCategoryId: record.riskCategoryId,
        },
      });
    }
  }

  render() {
    const {
      riskClassifyList,
      riskClassifyPagination,
      queryRiskClassifyLoading,
      saveRiskClassifyLoading,
      enabledLoading,
      riskMonitoring: { code: { messageType = [] } = {} } = {},
    } = this.props;
    const filterFormProps = {
      onRef: this.handleBindRef,
      onSearch: this.queryRiskClassify,
    };
    const tableProps = {
      messageType,
      dataSource: riskClassifyList,
      pagination: riskClassifyPagination,
      loading: queryRiskClassifyLoading || enabledLoading,
      onChange: this.queryRiskClassify,
      handleEdit: this.handleEditRiskClassify,
      handleEnabled: this.handleEnabledRiskClassify,
      handleCancel: this.handleCancelRiskClassify,
      handleQuerySickDim: this.handleSickDim,
      handleAssignRiskDim: this.handleAssignRiskDim,
    };
    const allLoading = queryRiskClassifyLoading || saveRiskClassifyLoading || enabledLoading;
    return (
      <Fragment>
        <Header
          title={intl
            .get(`sslm.riskEvents.view.title.riskEventsClassifyDefine`)
            .d('风险事件分类定义')}
        >
          <Button
            icon="plus"
            loading={allLoading}
            type="primary"
            onClick={this.handleAddRiskClassify}
          >
            {intl.get(`sslm.riskEvents.view.button.addClassify`).d('新增分类')}
          </Button>
          <Button loading={allLoading} icon="save" onClick={this.handleSaveRiskClassify}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterFormProps} />
          <ListTable {...tableProps} />
        </Content>
      </Fragment>
    );
  }
}
