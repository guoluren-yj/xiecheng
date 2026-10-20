/**
 * ParamValueQuery 参数值查询
 * @date: 2021-1-21
 * @author CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({
  code: ['sslm.common'],
})
@connect(({ loading, evaluationDocManage }) => ({
  evaluationDocManage,
  loading: loading.effects['evaluationDocManage/queryEvaluationStatus'],
}))
export default class ParamValueModal extends Component {
  /**
   * 组件卸载时触发
   */
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationDocManage/updateState',
      payload: {
        ParamValueList: [],
        ParamValuePagination: {},
      },
    });
  }

  /**
   * 查询参数值
   */
  @Bind()
  fetchParamValueList(page = {}) {
    const { dispatch, currentRecord = {}, customizeTableCode } = this.props;
    const { evalDtlId = '' } = currentRecord;
    dispatch({
      type: 'evaluationDocManage/queryEvaluationStatus',
      payload: {
        evalDtlId,
        page,
        customizeUnitCode: customizeTableCode,
      },
    });
  }

  render() {
    const {
      visible,
      closeModal = () => {},
      loading,
      evaluationDocManage: { ParamValueList = [], ParamValuePagination = {} },
      customizeTable,
      customizeTableCode,
      custLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('sslm.common.model.evalDocManage.paramName').d('参数名称'),
        width: 100,
        dataIndex: 'paramDescription',
      },
      {
        title: intl.get('sslm.common.model.evalDocManage.calculatedValue').d('计算值'),
        width: 100,
        dataIndex: 'paramValue',
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Modal
          title={intl.get('sslm.common.view.title.paramQuery').d('参数值查询')}
          visible={visible}
          onCancel={closeModal}
          footer={null}
          width={850}
          destroyOnClose
          zIndex={1050}
        >
          {customizeTable ? (
            customizeTable(
              {
                code: customizeTableCode,
              },
              <Table
                loading={loading}
                dataSource={ParamValueList}
                pagination={ParamValuePagination}
                rowKey="evalProcessId"
                columns={columns}
                bordered
                onChange={page => this.fetchParamValueList(page)}
                custLoading={custLoading}
              />
            )
          ) : (
            <Table
              loading={loading}
              dataSource={ParamValueList}
              pagination={ParamValuePagination}
              rowKey="evalProcessId"
              columns={columns}
              bordered
              onChange={page => this.fetchParamValueList(page)}
            />
          )}
        </Modal>
      </React.Fragment>
    );
  }
}
