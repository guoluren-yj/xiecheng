import React, { Component, Fragment } from 'react';
import { Modal, Table } from 'hzero-ui';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { getCurrentOrganizationId } from 'utils/utils';

import styles from './index.less';

@connect(({ feedback8D, loading }) => ({
  feedback8D,
  relation8DLoading: loading.effects['feedback8D/relation8D'],
  tenantId: getCurrentOrganizationId(),
}))
export default class CorrelationModal extends Component {
  componentDidMount() {
    this.fetchAddRelation8D();
  }

  // 查询可新增的关联8D列表
  @Bind()
  fetchAddRelation8D() {
    const { dispatch, tenantId, problemHeaderId } = this.props;
    dispatch({
      type: 'feedback8D/relation8D',
      payload: {
        tenantId,
        problemHeaderId,
      },
    });
  }

  render() {
    const {
      visible,
      onDetail = (e) => e,
      feedback8D = {},
      togglerVisibleFn = (e) => e,
      relation8DLoading,
    } = this.props;
    const { correlationList } = feedback8D;
    const modalProps = {
      visible,
      title: intl.get(`sqam.common.model.common.relatedRectification`).d('关联整改报告'),
      onCancel: togglerVisibleFn,
      width: 600,
      footer: null,
      className: styles.correlation,
    };
    const columns = [
      {
        title: intl.get('sqam.common.model.qualityRectification.code').d('整改报告编号'),
        dataIndex: 'problemNum',
        render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('sqam.common.model.qualityRectification.title').d('整改报告标题'),
        dataIndex: 'problemTitle',
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createdName',
      },
    ];
    return (
      <Fragment>
        <Modal {...modalProps}>
          <Table
            loading={relation8DLoading}
            columns={columns}
            bordered
            rowKey="rowKey"
            dataSource={correlationList}
          />
        </Modal>
      </Fragment>
    );
  }
}
