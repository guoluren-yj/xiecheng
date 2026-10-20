/**
 * RiskClassifyModal - 风险分类弹出框
 * @date: 2019-07-03
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Spin, Modal, Form, Transfer } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';

@Form.create({ fieldNameProp: null })
@connect(({ riskMonitoring, loading }) => ({
  riskMonitoring,
  saveLoading: loading.effects['riskMonitoring/assignRiskDim'],
  queryLoading: loading.effects['riskMonitoring/queryRiskDim'],
}))
@formatterCollections({ code: ['sslm.riskEvents'] })
export default class RiskClassifyModal extends Component {
  componentDidMount() {
    const { handleQuerySickDim, selectRow } = this.props;
    handleQuerySickDim(selectRow);
  }

  /**
   * 选项在两栏之间转移时的回调
   */
  @Bind()
  handleChange(targetKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'riskMonitoring/updateState',
      payload: {
        riskScanTargetKeys: targetKeys,
      },
    });
  }

  /**
   * Transfer
   */
  @Bind()
  renderTransfer(item) {
    const label = (
      <Fragment>
        <span style={{ marginRight: '20px' }}>{item.dimensionCode}</span>
        <span>{item.dimensionName}</span>
      </Fragment>
    );
    return {
      label,
      value: `${item.dimensionCode} ${item.dimensionName}`,
    };
  }

  /**
   * 分配风险事件维度
   */
  @Bind()
  handleAssignRiskDim() {
    const {
      dispatch,
      riskMonitoring: { riskScanList = [], riskScanTargetKeys = [] },
      selectRow,
      handleQuerySickDim,
    } = this.props;
    const arr = [];
    for (let i = 0; i < riskScanTargetKeys.length; i++) {
      for (let n = 0; n < riskScanList.length; n++) {
        if (riskScanTargetKeys[i] === riskScanList[n].riskDimId) {
          arr.push(riskScanList[n]);
        }
      }
    }

    dispatch({
      type: 'riskMonitoring/assignRiskDim',
      payload: {
        riskCategoryId: selectRow.riskCategoryId,
        riskDimAssigns: arr,
      },
    }).then(res => {
      if (res) {
        notification.success();
        handleQuerySickDim(selectRow);
      }
    });
  }

  render() {
    const {
      riskClassifyVisible,
      onCancel,
      saveLoading,
      queryLoading,
      riskMonitoring: { riskScanList = [], riskScanTargetKeys = [] },
    } = this.props;
    return (
      <Modal
        width={620}
        className={styles['risk-modal']}
        visible={riskClassifyVisible}
        title={intl.get(`sslm.riskEvents.view.title.choiceEventDimension`).d('选择事件维度')}
        onCancel={onCancel}
        onOk={this.handleAssignRiskDim}
        confirmLoading={saveLoading}
      >
        <Spin spinning={queryLoading}>
          <Transfer
            rowKey={item => item.riskDimId}
            showSearch
            dataSource={riskScanList}
            targetKeys={riskScanTargetKeys}
            render={this.renderTransfer}
            listStyle={{ height: 400, width: 253 }}
            onChange={this.handleChange}
          />
        </Spin>
      </Modal>
    );
  }
}
