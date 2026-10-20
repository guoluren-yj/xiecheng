/**
 * MessageQueueSearch -消息队列数据查询
 * @date: 2018-9-17
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';
import FormList from './FormList';
import styles from './index.less';

@connect(({ messageQueueSearch, loading }) => ({
  messageQueueSearch,
  loading: loading.effects['messageQueueSearch/queryMessageQueueList'],
}))
@formatterCollections({ code: ['sitf.messageQueueSearch', 'entity.application'] })
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/message-queue-search' })
export default class MessageQueueSearch extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageCache: {
        page: 0,
        size: 10,
      },
    };
  }

  /**
   * 查询消息队列数据
   * @param {object} params
   */
  @Bind()
  fetchMessageList(params = {}) {
    const { dispatch } = this.props;
    const { pageCache } = this.state;
    this.setState({ loading: true });
    dispatch({
      type: 'messageQueueSearch/queryMessageQueueList',
      payload: {
        ...pageCache,
        ...params,
      },
    }).then(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    const { messageQueueSearch: { list = {} } } = this.props;
    const formProps = {
      fetchMessageList: this.fetchMessageList,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sitf.messageQueueSearch.view.messageQueueSearch.indexTitle')
            .d('消息队列数据查询')}
        />
        <Content>
          <FormList {...formProps} />
          <Spin spinning={this.state.loading}>
            <div className={styles['form-queue-content']}>
              <div className={styles['form-queue-item']}>
                <ul>
                  <li>
                    <span className={styles['form-queue-item-title']}>
                      {intl
                        .get('sitf.messageQueueSearch.model.messageQueueSearch.topic')
                        .d('Topic')}:
                    </span>
                    <span className={styles['form-queue-item-content']}>{list.topic}</span>
                  </li>
                  <li>
                    <span className={styles['form-queue-item-title']}>
                      {intl.get('sitf.messageQueueSearch.model.messageQueueSearch.tag').d('Tag')}:
                    </span>
                    <span className={styles['form-queue-item-content']}>{list.tag}</span>
                  </li>
                  <li>
                    <span className={styles['form-queue-item-title']}>
                      {intl.get('sitf.messageQueueSearch.model.messageQueueSearch.key').d('Key')}:
                    </span>
                    <span className={styles['form-queue-item-content']}>{list.key}</span>
                  </li>
                  <li>
                    <span className={styles['form-queue-item-title']}>
                      {intl
                        .get('sitf.messageQueueSearch.model.messageQueueSearch.storeTime')
                        .d('StoreTime')}:
                    </span>
                    <span className={styles['form-queue-item-content']}>{list.storeTime}</span>
                  </li>
                  <li>
                    <span className={styles['form-queue-item-title']}>
                      {intl
                        .get('sitf.messageQueueSearch.model.messageQueueSearch.messageBody')
                        .d('MessageBody')}:
                    </span>
                    <span className={styles['form-queue-item-content']}>{list.messageBody}</span>
                  </li>
                </ul>
              </div>
            </div>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
