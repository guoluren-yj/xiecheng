import React, { Component } from 'react';
import { Form, Button, TextField, Lov, DatePicker } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

import styles from './index.less';

export default class ListTable extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      moreQueryFiledVisible: false,
    };
  }

  @Bind()
  handleToggle() {
    this.setState({ moreQueryFiledVisible: !this.state.moreQueryFiledVisible });
    if (this.props.onFilterFlag) {
      this.props.onFilterFlag(!this.state.moreQueryFiledVisible);
    }
  }

  render() {
    const { moreQueryFiledVisible } = this.state;
    const { onSearch, formDs } = this.props;
    return (
      <div className={styles['filter-form']}>
        <Form
          style={{ flex: 'auto' }}
          columns={3}
          dataSet={formDs}
          labelLayout="float"
          onKeyDown={(e) => {
            if (e.keyCode === 13) return onSearch();
          }}
        >
          <TextField name="processDescriptionLike" />
          <TextField name="processDefinitionNameLike" />
          <Lov
            name="startedUserLov"
            placeholder={intl.get('hwfp.common.model.apply.owner').d('申请人')}
          />
          {moreQueryFiledVisible && <TextField name="processInstanceId" />}
          {moreQueryFiledVisible && <DatePicker name="startedTime" />}
        </Form>
        <div className={styles['filter-form-btns']}>
          <Button onClick={this.handleToggle}>
            {moreQueryFiledVisible
              ? intl.get('hzero.common.button.collected').d('收起查询')
              : intl.get('hzero.common.button.viewMore').d('更多查询')}
          </Button>
          <Button
            onClick={() => {
              formDs.current.reset();
            }}
          >
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button color="primary" onClick={() => onSearch()}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </div>
      </div>
    );
  }
}
