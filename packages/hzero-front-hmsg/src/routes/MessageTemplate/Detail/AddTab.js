import React from 'react';
import { Form, Switch } from 'choerodon-ui/pro';

import styles from './index.less';

export default class AddTab extends React.PureComponent {
  render() {
    const { languageList, formDs } = this.props;
    return (
      <Form dataSet={formDs}>
        {languageList.map((item) => (
          <div className={styles['lang-drawer']}>
            <div>{item.name}</div>
            <Switch
              name={item.code}
              disabled={item.langRequiredFlag}
            />
          </div>
        ))}
      </Form>
    );
  }
}
