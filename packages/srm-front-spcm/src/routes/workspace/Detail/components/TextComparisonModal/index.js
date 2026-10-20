import React, { Component } from 'react';
import { Select } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import DiffViewer from 'react-diff-viewer';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import classnames from 'classnames';

import { fetchCompareSelect, fetchCompareFile } from '@/services/newContractService';

import styles from './index.less';

const { Option } = Select;

export default class TextComparisonModal extends Component {
  state = {
    loading: false,
    compareSelect: [],
    defaultValue: 'FIRST_CONTRACT',
    comparisonList: [],
  };

  componentDidMount() {
    this.fetchCompareSelect();
  }

  @Bind()
  async fetchCompareSelect() {
    const { pcHeaderId } = this.props;
    const { defaultValue } = this.state;
    const res = await fetchCompareSelect({ pcHeaderId });
    if (getResponse(res)) {
      this.setState({
        compareSelect: res,
        defaultValue: res?.[0]?.contractFileCode || defaultValue,
      });
      this.handleSelectChange(res?.[0]?.contractFileCode || defaultValue);
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

  @Bind()
  async handleSelectChange(value) {
    const { pcHeaderId } = this.props;
    this.setState({ loading: true });
    const res = await fetchCompareFile({ pcHeaderId, contractFileCode: value });
    this.setState({ loading: false });
    if (getResponse(res)) {
      this.setState({ comparisonList: res, defaultValue: value });
    }
  }

  render() {
    const { compareStyles } = this.props;

    const { compareSelect, defaultValue, comparisonList, loading } = this.state;

    const firstDiffViewerProps = {
      leftTitle: (
        <Select style={{ width: 300 }} value={defaultValue} onChange={this.handleSelectChange}>
          {compareSelect.map((option) => (
            <Option value={option.contractFileCode}>{option.contractFileCodeMeaning}</Option>
          ))}
        </Select>
      ),
      rightTitle: intl.get('spcm.common.view.title.contractFile').d('合同文本'),
      oldValue: this.handleGetContent(comparisonList, 'left'),
      newValue: this.handleGetContent(comparisonList, 'right'),
      showDiffOnly: false,
    };

    return (
      <Content className={classnames(styles['compare-wrapper'], compareStyles?.className)}>
        <Spin spinning={loading}>
          <div className={styles['diff-container']}>
            <DiffViewer {...firstDiffViewerProps} />
          </div>
        </Spin>
      </Content>
    );
  }
}
