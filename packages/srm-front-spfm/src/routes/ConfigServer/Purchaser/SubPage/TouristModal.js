import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Modal, Form, Button } from 'hzero-ui';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import EditTable from 'components/EditTable';

const tenantId = getCurrentOrganizationId();

export default class TouristModal extends Component {
  state = {
    isSave: false,
  };

  /**
   * 关闭modal
   */
  @Bind()
  handleCancel() {
    const {
      settings,
      onCancel,
      form: { getFieldValue },
    } = this.props;
    if (
      settings['011012'] !== getFieldValue('011012') ||
      settings['011014'] !== getFieldValue('011014')
    ) {
      Modal.confirm({
        content: intl
          .get('spfm.configServer.view.message.save')
          .d('当前有未保存的数据,继续操作将丢失？'),
        onOk: () => {
          onCancel('touristVisible', false);
        },
      });
    } else {
      onCancel('touristVisible', false);
    }
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      onSave,
      settings,
      onCancel,
      form: { getFieldValue, getFieldsValue },
    } = this.props;
    const a = getFieldValue('011012');
    const b = getFieldValue('011014');
    if (settings['011012'] !== a || settings['011014'] !== b) {
      onSave({
        ...settings,
        ...getFieldsValue(),
      });
    } else onCancel('touristVisible', false);
  }

  render() {
    const {
      visible,
      settings,
      loading,
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.companyName').d('公司名称'),
        dataIndex: 'companyId',
        key: 'companyId',
        render: () => {
          return (
            <Form.Item>
              {getFieldDecorator('011012', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.common.model.companyName').d('公司名称'),
                    }),
                  },
                ],
                initialValue: settings['011012'],
              })(
                <Lov
                  allowClear={false}
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  textField="011013"
                  textValue={settings['011013']}
                  queryParams={{ tenantId }}
                  onChange={(_, item) => {
                    this.setState({ isSave: true }, () => {
                      setFieldsValue({ '011013': item.companyName });
                    });
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl
          .get(`spfm.configServer.view.purchaseContract..view.isShowPrice`)
          .d('是否显示价格'),
        dataIndex: 'showPrice',
        key: 'showPrice',
        render: () => {
          return (
            <Form.Item>
              {getFieldDecorator('011014', {
                initialValue: settings['011014'] || 0,
              })(<Switch onChange={() => this.setState({ isSave: true })} />)}
            </Form.Item>
          );
        },
      },
    ];
    return (
      <Modal
        title={intl
          .get(`spfm.configServer.view.purchaseContract.touristCompanyList`)
          .d('选择子公司')}
        width={600}
        visible={visible}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div style={{ textAlign: 'right', margin: '10px 0' }}>
          <Button type="primary" disabled={!this.state.isSave} onClick={this.handleSave}>
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </div>
        <EditTable
          bordered
          dataSource={[{}]}
          columns={columns}
          loading={loading}
          pagination={false}
        />
      </Modal>
    );
  }
}
