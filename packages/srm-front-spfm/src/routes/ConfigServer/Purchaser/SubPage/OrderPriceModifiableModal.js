/**
 * OrderPriceModifiableModal 订单维护页面允许修改价格配置Modal
 * @date: 2019-12-18
 * @author MaoJiaqi <jiaqi.mao@hand-china.com >
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Modal, Form, Button } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isArray } from 'lodash';

import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import { isFunction } from 'util';

import styles from './index.less';

@connect(({ configServer, loading }) => ({
  queryOrderPriceModifiableLoading: loading.effects['configServer/queryOrderPriceModifiable'],
  saving: loading.effects['configServer/saveOrderPriceModifiable'],
  configServer,
}))
export default class OrderPriceModifiableModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], // 直连开票规则数据
    };
  }

  componentDidMount() {
    this.handleQuery();
  }

  /**
   * 查询订单维护价格修改配置
   */
  @Bind()
  handleQuery() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/queryOrderPriceModifiable',
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.map(item => ({ ...item, _status: 'update' })),
        });
      }
    });
  }

  /**
   * 订单维护价格修改配置保存
   */
  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const { dataSource = [] } = this.state;
    const editTableData = getEditTableData(dataSource, ['_status']);
    if (isArray(editTableData)) {
      dispatch({
        type: 'configServer/saveOrderPriceModifiable',
        payload: editTableData,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleQuery();
        }
      });
    }
  }

  /**
   * 关闭订单维护价格修改配置弹窗
   */
  @Bind()
  handleModalVisible() {
    const { handleModal } = this.props;
    if (isFunction(handleModal)) {
      handleModal('orderPriceModifiableVisible', false);
    }
  }

  render() {
    const { saving, visible, queryOrderPriceModifiableLoading } = this.props;
    const { dataSource = [] } = this.state;
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.common.poSourcePlatform`).d('来源平台'),
        dataIndex: 'poSourcePlatformMeaning',
      },
      {
        title: intl.get(`spfm.configServer.model.common.modifyablePriceFlag`).d('允许修改价格'),
        dataIndex: 'modifyablePriceFlag',
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('modifyablePriceFlag', {
              initialValue: ['ERP', 'E-COMMERCE'].includes(record.poSourcePlatform) ? 0 : val,
            })(
              <Checkbox
                disabled={['ERP', 'E-COMMERCE'].includes(record.poSourcePlatform)}
                onChange={e => {
                  if (!e.target.checked) {
                    record.$form.setFieldsValue({ onlyLowerPriceFlag: 0 });
                  }
                }}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.common.onlyLowerPriceFlag`).d('仅允许价格调低'),
        dataIndex: 'onlyLowerPriceFlag',
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('onlyLowerPriceFlag', {
              initialValue: val,
            })(<Checkbox disabled={!record.$form.getFieldValue('modifyablePriceFlag')} />)}
          </Form.Item>
        ),
      },
    ];
    return (
      <Fragment>
        <Modal
          title={intl
            .get(`spfm.configServer.view.title.orderPriceModifiable`)
            .d('订单维护页面允许修改价格设置')}
          visible={visible}
          onCancel={this.handleModalVisible}
          footer={null}
          width={600}
          className={styles['order-price']}
        >
          <div className={styles.header}>
            <Button type="primary" onClick={this.handleSave} loading={saving}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
          <EditTable
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered
            loading={queryOrderPriceModifiableLoading}
          />
        </Modal>
      </Fragment>
    );
  }
}
