import React, { Component } from 'react';
import { Form, TextField, Button } from 'choerodon-ui/pro';
import { Icon, Divider } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import styles from './style/index.less';

export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.bindRef(this);
    this.state = {
      expand: true,
    };
  }

  @Bind()
  handleExpand() {
    this.setState({
      expand: !this.state.expand,
    });
  }

  render() {
    const { onSearch, formDs, selectedLines, openBatchEditModal, deleteSelectedLines } = this.props;
    const { expand } = this.state;
    return (
      <div className={styles.filter}>
        <div className={styles['collpase-filter']}>
          <span onClick={this.handleExpand}>
            <span>
              <Icon
                type="filter_list"
                style={{ fontWeight: 600, color: '#000', fontSize: '16px' }}
              />
            </span>
            <span className={styles['collpase-filter-text']}>
              {expand
                ? intl.get('srm.filterBar.view.message.collapseFilter').d('收起筛选')
                : intl.get('srm.filterBar.view.message.expandFilter').d('展开筛选')}
            </span>
            <span>
              <Icon type={expand ? 'expand_less' : 'expand_more'} />
            </span>
          </span>
          <Divider type="vertical" style={{ margin: '0 0.08rem', background: '#ccc' }} />
          <Button
            funcType="flat"
            disabled={selectedLines.length === 0}
            onClick={openBatchEditModal}
            icon="mode_edit"
          >
            {intl.get('hwfp.automaticProcess.view.button.edit').d('编辑')}
          </Button>
          <Button
            funcType="flat"
            disabled={selectedLines.length === 0}
            onClick={deleteSelectedLines}
            style={{ marginLeft: 0 }}
            icon="autorenew"
          >
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </div>
        <Form
          dataSet={formDs}
          labelLayout="horizontal"
          labelWidth={80}
          style={{ marginLeft: '-6px', marginTop: '-8px', display: expand ? 'block' : 'none' }}
          onKeyDown={(e) => {
            if (e.keyCode === 13) return onSearch();
          }}
        >
          <TextField
            name="keyOrName"
            style={{ height: '32px', width: '380px' }}
            suffix={<Icon type="search" style={{ fontSize: '14px' }} />}
            placeholder={intl
              .get('hwfp.common.model.apply.queryKeyName')
              .d('请输入流程编码、流程名称查询')}
          />
        </Form>
      </div>
    );
  }
}
