/**
 * WatsonFile - 培训资料
 * @date: 2021-04-21
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Spin, DataSet } from 'choerodon-ui/pro';
import { Row, Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CUSTOMIZATION, PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Bind, Throttle } from 'lodash-decorators';

import styles from './Cards.less';

const prefix = `spfm.dashboard`;
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['spfm.dashboard'] })
export default class WatsonFile extends React.Component {
  constructor(props) {
    super(props);
    this.scrollBox = React.createRef();
    this.titleBox = React.createRef();
    this.listBox = React.createRef();
  }

  dataDs = new DataSet({
    autoQuery: false,
    autoCreate: false,
    fields: [
      {
        name: 'title',
        type: 'string',
        label: intl.get(`${prefix}.model.title`).d('标题'),
      },
      {
        name: 'attachmentUuid',
        type: 'string',
      },
    ],

    transport: {
      read: {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/watsons-data-managements/list?browseType=1`,
        method: 'GET',
      },
    },
  });

  state = {
    dataList: [],
  };

  isQuery = false;

  componentDidMount() {
    this.dataDs.query().then((res) => {
      if (res && !isEmpty(res.content)) {
        this.setState({ dataList: res.content });
        // 初始化检查是否存在滚动条
        if (
          this.titleBox &&
          this.titleBox.current &&
          this.titleBox.current.clientHeight + this.listBox.current.clientHeight <
            this.scrollBox.current.clientHeight
        ) {
          this.initQueryMore();
        }
      }
    });
  }

  /**
   * initQueryMore: 初始化时如果卡片较大则继续查询更多数据
   */
  @Bind()
  initQueryMore() {
    if (this.dataDs.currentPage === this.dataDs.totalPage) return;
    this.dataDs.queryMore(this.dataDs.currentPage + 1).then((res) => {
      if (res && !isEmpty(res.content)) {
        const newDataList = this.state.dataList.concat(res.content);
        this.setState({ dataList: newDataList });
        if (
          this.titleBox &&
          this.titleBox.current &&
          this.titleBox.current.clientHeight + this.listBox.current.clientHeight <
            this.scrollBox.current.clientHeight
        ) {
          this.initQueryMore(); // 递归
        }
      }
    });
  }

  /**
   * handleScroll: 响应卡片滚动事件，动态加载ds列表项
   */
  @Bind()
  @Throttle()
  handleScroll(e) {
    if (this.dataDs.currentPage === this.dataDs.totalPage) return;
    const { scrollHeight, clientHeight, scrollTop } = e.target;
    // 如果滚动到底部
    if (scrollHeight - scrollTop - clientHeight < clientHeight / 10 && !this.isQuery) {
      this.isQuery = true;
      this.dataDs
        .queryMore(this.dataDs.currentPage + 1)
        .then((res) => {
          if (res && !isEmpty(res.content)) {
            const newDataList = this.state.dataList.concat(res.content);
            this.setState({ dataList: newDataList });
          }
        })
        .finally(() => {
          this.isQuery = false;
        });
    }
  }

  render() {
    return (
      <div className={styles.supplierManagement} onScroll={this.handleScroll} ref={this.scrollBox}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img-supplier-management']} ref={this.titleBox}>
            <span className={styles['card-title']}>
              {intl.get(`spfm.dashboard.view.watson.trainingMaterials`).d('培训资料')}
            </span>
            <a onClick={this.openModal} className={styles['card-icon']}>
              <Icon type="ellipsis" />
            </a>
          </div>
          <Spin dataSet={this.dataDs}>
            <ol style={{ paddingLeft: '30px' }} ref={this.listBox}>
              {this.state.dataList.map((item) => (
                <li style={{ marginBottom: '8px' }}>
                  <span>{item.title}</span>
                  <span style={{ float: 'right', marginRight: '18px' }}>
                    <UploadModal
                      attachmentUUID={item.attachmentUuid}
                      bucketName={PRIVATE_BUCKET}
                      viewOnly
                    />
                  </span>
                </li>
              ))}
              {this.dataDs.currentPage !== this.dataDs.totalPage && <Spin />}
            </ol>
          </Spin>
        </Row>
      </div>
    );
  }
}
