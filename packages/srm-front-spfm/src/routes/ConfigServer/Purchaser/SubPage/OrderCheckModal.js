/**
 * OrderPriceModifiableModal 订单维护页面来源数据校验配置Modal
 * @date: 2019-12-18
 * @author YangLin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Modal, Form, Button } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';

import Checkbox from 'components/Checkbox';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import { isFunction } from 'util';

import styles from './index.less';

@connect(({ configServer, loading }) => ({
  configServer,
  saving: loading.effects['configServer/saveSettings'],
}))
export default class OrderCheckModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], // 直连开票规则数据
      sourceManageFlag: props.initData.includes('SOURCE') ? 1 : 0,
      agreementFlag: props.initData.includes('CONTRACT') ? 1 : 0,
    };
  }

  async componentWillMount() {
    // const { initData } = this.props;
    await this.setState({
      dataSource: [
        {
          createMethod: intl
            .get(`spfm.configServer.view.message.manualRequest`)
            .d('手工/申请转订单'),
          agreementFlag: this.state.agreementFlag,
          sourceManageFlag: this.state.sourceManageFlag,
        },
      ],
    });
  }

  /**
   * 订单维护价格修改配置保存
   */
  @Bind()
  handleSave() {
    const { change010224, dispatch, settings } = this.props;
    const { sourceManageFlag, agreementFlag } = this.state;
    let str = '';
    if (sourceManageFlag) {
      str += 'SOURCE';
      if (agreementFlag) {
        str += ',CONTRACT';
      }
    } else if (agreementFlag) {
      str += 'CONTRACT';
    }
    if (isFunction(change010224)) {
      change010224(str);
    }
    const targetItem = { ...settings };
    targetItem['010224'] = str;
    dispatch({
      type: 'configServer/saveSettings',
      payload: {
        customizeSetting: targetItem,
      },
    }).then((result) => {
      if (result) {
        notification.success();
      }
    });
  }

  /**
   * 关闭订单维护价格修改配置弹窗
   */
  @Bind()
  handleModalVisible() {
    const { handleModal } = this.props;
    if (isFunction(handleModal)) {
      handleModal('orderCheckVisible', false);
    }
  }

  render() {
    const { visible, saving } = this.props;
    const { dataSource = [] } = this.state;
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.common.createMethod`).d('创建方式'),
        dataIndex: 'createMethod',
      },
      {
        title: intl.get(`spfm.configServer.model.common.agreementFlag`).d('校验协议'),
        dataIndex: 'agreementFlag',
        render: (val) => (
          <Form.Item>
            <Checkbox
              defaultChecked={val}
              onChange={(e) => {
                this.setState({
                  agreementFlag: e.target.checked,
                });
              }}
            />
          </Form.Item>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.common.sourceManageFlag`).d('校验寻源'),
        dataIndex: 'sourceManageFlag',
        render: (val) => (
          <Form.Item>
            <Checkbox
              defaultChecked={val}
              onChange={(e) => {
                this.setState({
                  sourceManageFlag: e.target.checked,
                });
              }}
            />
          </Form.Item>
        ),
      },
    ];
    return (
      <Fragment>
        <Modal
          title={intl
            .get(`spfm.configServer.view.title.orderCheckModifiable`)
            .d('订单创建启用多种来源单据数量校验')}
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
          <EditTable columns={columns} dataSource={dataSource} pagination={false} bordered />
        </Modal>
      </Fragment>
    );
  }
}
