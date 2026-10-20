import React, { Component } from 'react';
import { Modal, Form, Table, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class AddCompany extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * handleFormReset - 重置按钮事件
   */
  @Bind()
  handleFormReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      dataSource,
      pagination,
      loading,
      visible,
      hideModal,
      handleSureAddCompany,
      fetchAddCompany,
      form,
      rowAddCompany, // 新增的公司列
    } = this.props;
    const { getFieldDecorator } = form;
    const companyAddColumns = [
      {
        title: intl.get('entity.company.code').d('公司编码'),
        width: 180,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        dataIndex: 'companyName',
      },
    ];
    return (
      <React.Fragment>
        <Modal
          title={intl.get(`spcm.common.model.companyList`).d('公司列表')}
          width={1000}
          visible={visible}
          destroyOnClose
          onClose={hideModal}
          onOk={handleSureAddCompany}
          onCancel={hideModal}
        >
          <div className="table-list-search" style={{ marginBottom: 8 }}>
            <Form layout="inline">
              <FormItem label={intl.get('entity.company.code').d('公司编码')}>
                {getFieldDecorator('companyNum')(<Input style={{ width: 150 }} />)}
              </FormItem>
              <FormItem label={intl.get('entity.company.name').d('公司名称')}>
                {getFieldDecorator('companyName')(<Input style={{ width: 150 }} />)}
              </FormItem>
              <FormItem>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => fetchAddCompany()}
                  type="primary"
                  htmlType="submit"
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Form>
          </div>
          <Table
            bordered
            loading={loading}
            rowKey="companyId"
            dataSource={dataSource}
            rowSelection={rowAddCompany}
            pagination={pagination}
            onChange={(page) => fetchAddCompany(page)}
            columns={companyAddColumns}
          />
          {/* </Content> */}
        </Modal>
      </React.Fragment>
    );
  }
}
