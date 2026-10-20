import React, { Component } from 'react';
import { Modal, Form, Switch } from 'hzero-ui';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';

const FormItem = Form.Item;

export default class LifeCycle extends Component {
  /**
   * 公司条件查询
   */
  @Bind()
  handleLifeCycleSearch() {
    const { fetchLifeCycle, pcConfigId } = this.props;
    if (isFunction(fetchLifeCycle)) {
      fetchLifeCycle(pcConfigId);
    }
  }

  render() {
    const {
      visible, // 公司查询时弹出lov
      loading,
      dataSource = [],
      hideModal,
      saveLifeCycle,
      editContractType = false,
    } = this.props;
    const lifeCycleColumns = [
      {
        title: intl.get('spcm.common.model.common.orderSeq').d('序号'),
        width: 50,
        dataIndex: 'lineNum',
      },
      {
        title: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
        dataIndex: 'stageCodeMeaning',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.allowProtocolFlag`).d('是否启用'),
        dataIndex: 'allowProtocolFlag',
        width: 60,
        render: (val, record) =>
          ['update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('allowProtocolFlag', {
                initialValue: val,
              })(
                <Switch
                  // checked={val}
                  defaultChecked={val}
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={editContractType}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
        // (
        //   <Switch
        //     defaultChecked={val}
        //
        //     disabled={editContractType}
        //   />
        // ),
      },
    ];
    return (
      <React.Fragment>
        <Modal
          title={intl.get(`spcm.common.model.lifeCycleList`).d('生命周期控制')}
          visible={visible}
          onClose={hideModal}
          onOk={saveLifeCycle}
          onCancel={hideModal}
        >
          <EditTable
            bordered
            loading={loading}
            dataSource={dataSource}
            columns={lifeCycleColumns}
            pagination={false}
          />
          {/* </Content> */}
        </Modal>
      </React.Fragment>
    );
  }
}
