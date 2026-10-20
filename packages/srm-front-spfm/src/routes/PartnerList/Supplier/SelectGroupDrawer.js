/**
 * SelectGroupDrawer - 选择分组
 * @date: 2019-07-04
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Drawer, Button, Checkbox, Row, Modal, notification } from 'hzero-ui';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

const CheckboxGroup = Checkbox.Group;

@connect(({ loading, supplier }) => ({
  supplier,
  groupList: supplier.groupList,
  queryGroupLoading: loading.effects['supplier/queryGroup'],
  saveGroupLoading: loading.effects['supplier/saveGroup'],
}))
export default class SelectGroupDrawer extends Component {
  state = {
    checkedValues: [],
  };

  componentDidMount() {
    this.handleGroup();
  }

  /**
   * 查询分组列表
   */
  handleGroup() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplier/queryGroup',
    });
  }

  /**
   * 选中项改变时的回调
   */
  @Bind()
  handleChange(checkedValues) {
    this.setState({ checkedValues });
  }

  /**
   * 确定
   */
  @Bind()
  handleSaveGroup() {
    const { checkedValues } = this.state;
    const { handleClose, dispatch, selectedRows, handleTableChange } = this.props;

    if (isEmpty(checkedValues)) {
      notification.warning({
        message: intl
          .get('spfm.supplier.model.supplier.platform.selectOneGroup')
          .d('至少选择一个分组！'),
      });
    } else {
      const onOk = () => {
        dispatch({
          type: 'supplier/saveGroup',
          payload: {
            resultGroup: checkedValues,
            supplierDTO: [selectedRows.supplierCompanyId],
            isPlatformEnterprise: 1,
          },
        }).then((res) => {
          if (res) {
            handleClose();
            handleTableChange();
          }
        });
      };
      Modal.confirm({
        title: intl
          .get(`spfm.supplier.model.supplier.platform.confirmMessage`)
          .d('加入监控将会扣除监控额度，是否确认加入？'),
        onOk,
      });
    }
  }

  render() {
    const { selectGroupVisible, handleClose, groupList, saveGroupLoading } = this.props;
    return (
      <Fragment>
        <Drawer
          width={520}
          onClose={handleClose}
          visible={selectGroupVisible}
          title={intl.get(`spfm.supplier.model.supplier.platform.choiceGroup`).d('选择分组')}
        >
          <div>
            {intl
              .get(`spfm.supplier.model.supplier.platform.drawerTitleNotic`)
              .d('请为您的供应商选择分组（至少选择一个）：')}
          </div>
          <CheckboxGroup style={{ width: '100%' }} onChange={this.handleChange}>
            {groupList.map((item) => (
              <Row style={{ marginTop: 16 }}>
                <Checkbox value={item.monitorGroupId}>{item.monitorGroupName}</Checkbox>
              </Row>
            ))}
          </CheckboxGroup>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button style={{ marginRight: 8 }} onClick={handleClose}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button type="primary" loading={saveGroupLoading} onClick={this.handleSaveGroup}>
              {intl.get('hzero.common.button.confirm').d('确认')}
            </Button>
          </div>
        </Drawer>
      </Fragment>
    );
  }
}
