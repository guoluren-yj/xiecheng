import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Tabs, Spin } from 'choerodon-ui';
import DiffViewer from 'react-diff-viewer';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import styles from '../index.less';

const { TabPane } = Tabs;

@connect(({ loading, contractCommon }) => ({
  contractCommon,
  loading: loading.effects['contractCommon/fetchTextComparison'],
}))
export default class TextComparisonModal extends Component {
  componentDidMount() {
    this.fetchTextComparison('first');
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'contractCommon/updateState',
      payload: {
        firstComparisonList: [],
        lastComparisonList: [],
      },
    });
  }

  @Bind()
  fetchTextComparison(version) {
    const { dispatch, pcHeaderId } = this.props;
    dispatch({
      type: 'contractCommon/fetchTextComparison',
      payload: {
        pcHeaderId,
        version,
      },
    });
  }

  @Bind()
  handleTabChange() {
    const {
      contractCommon: { lastComparisonList = [] },
    } = this.props;
    if (isEmpty(lastComparisonList)) {
      this.fetchTextComparison('last');
    }
  }

  @Bind()
  handleGetContent(list, position) {
    if (!isEmpty(list)) {
      if (position === 'left') {
        return list[0].content;
      } else {
        return list[1].content;
      }
    }
  }

  render() {
    const {
      visible,
      onCancel,
      loading,
      contractCommon: { firstComparisonList = [], lastComparisonList = [] },
    } = this.props;

    const firstDiffViewerProps = {
      oldValue: this.handleGetContent(firstComparisonList, 'left'),
      newValue: this.handleGetContent(firstComparisonList, 'right'),
      showDiffOnly: false,
    };

    const lastDiffViewerProps = {
      oldValue: this.handleGetContent(lastComparisonList, 'left'),
      newValue: this.handleGetContent(lastComparisonList, 'right'),
      showDiffOnly: false,
    };

    return (
      <Modal
        title={intl.get('spcm.common.view.title.textComparison').d('文本对比')}
        wrapClassName={styles['full-modal-wrapper']}
        width="100%"
        visible={visible}
        onCancel={onCancel}
        footer={null}
      >
        <Spin spinning={loading}>
          <Tabs animated={false} type="card" onChange={this.handleTabChange}>
            <TabPane
              key="firstVersion"
              style={{ overflowX: 'auto' }}
              tab={intl.get('spcm.common.view.title.firstVersion').d('初次版本')}
            >
              <DiffViewer {...firstDiffViewerProps} />
            </TabPane>
            <TabPane
              key="lastVersion"
              style={{ overflowX: 'auto' }}
              tab={intl.get('spcm.common.view.title.lastVersion').d('上次版本')}
            >
              <DiffViewer {...lastDiffViewerProps} />
            </TabPane>
          </Tabs>
        </Spin>
      </Modal>
    );
  }
}
