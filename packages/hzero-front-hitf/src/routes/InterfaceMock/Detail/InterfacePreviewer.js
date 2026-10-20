/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/6/15
 * @copyright HAND ® 2021
 */
import React from 'react';
import { Icon, Spin } from 'choerodon-ui';
import getLang from '@/langs/interfaceMockLang';
import styles from './index.less';

export default class MockDrawer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshLoading: false,
    };
  }

  async handleRefresh() {
    const { onRefresh = () => {} } = this.props;
    this.setState({ refreshLoading: true });
    await onRefresh();
    this.setState({ refreshLoading: false });
  }

  render() {
    const { label, template, data } = this.props;
    const { refreshLoading } = this.state;

    return (
      <Spin spinning={refreshLoading}>
        <div className={styles.previewer}>
          <div className={styles['result-template']}>
            <div className={styles.header}>
              <span className={styles.title}>{`${label}${getLang('TEMPLATE')}`}</span>
            </div>
            <pre className={styles.body}>
              {JSON.stringify(
                template,
                (_, v) => {
                  if (typeof v === 'function') {
                    return v.toString();
                  }
                  if (v !== undefined && v !== null && v.exec) {
                    return v.toString();
                  } else {
                    return v;
                  }
                },
                2
              )}
            </pre>
          </div>
          <div className={styles['result-mocked']}>
            <div className={styles.header}>
              <span className={styles.title}>{`${label}${getLang('DATA')}`}</span>
              <Icon className={styles.icon} type="refresh" onClick={() => this.handleRefresh()} />
            </div>
            <pre className={styles.body}>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      </Spin>
    );
  }
}
