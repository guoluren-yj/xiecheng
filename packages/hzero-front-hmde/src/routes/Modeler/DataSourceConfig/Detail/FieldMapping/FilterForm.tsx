import React, { PureComponent } from 'react';
import { Button, DataSet, Form, Lov, TextField } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Bind } from 'lodash-decorators';

import styles from './index.less';

interface FilterFormProps {
  dataSet: DataSet;
  onQuery: () => void;
}

export default class FilterForm extends PureComponent<FilterFormProps> {
  @Bind()
  reset() {
    this.props.dataSet.reset();
  }

  render() {
    const { dataSet, onQuery } = this.props;
    return (
      <div className={styles['filter-form-wrap']}>
        <Form dataSet={dataSet} columns={2}>
          <Lov name="originDataObject" placeholder="选择数据对象" />
          <TextField name="remark" />
        </Form>
        <div className={styles['filter-form-btns']}>
          <Button onClick={this.reset}>重置</Button>
          <Button color={ButtonColor.primary} onClick={onQuery}>
            查询
          </Button>
        </div>
      </div>
    );
  }
}
