import React, { Component } from 'react';
import { Modal, Form, Input, Button } from 'hzero-ui';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import Switch from 'components/Switch';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class Company extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * 公司条件查询
   */
  @Bind()
  handleCompanySearch() {
    const { fetchCompany, pcTypeId, pcTempId } = this.props;
    if (isFunction(fetchCompany)) {
      fetchCompany(pcTypeId, pcTempId);
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
      visible, // 公司查询时弹出lov
      pagination,
      loading,
      onSearch,
      form,
      dataSource,
      hideModal,
      saveCompany,
      pcTypeId,
      pcTempId,
      pcTempEditable, // 协议模板行是否可以编辑
    } = this.props;
    const { getFieldDecorator } = form;
    const companyColumns = [
      {
        title: intl.get('entity.company.code').d('公司编码'),
        width: 300,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('entity.company.enabledFlag').d('启用'),
        dataIndex: 'enabledFlag',
        render: (val, record) =>
          ['update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('enabledFlag', {
                initialValue: val,
              })(<Switch disabled={!pcTempEditable || !record.editFlag} />)}
            </FormItem>
          ) : (
            val
          ),
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
          onOk={saveCompany}
          onCancel={hideModal}
        >
          {/* <Content style={{ paddingLeft: 0, paddingRight: 0 }}> */}
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
                  onClick={() => this.handleCompanySearch()}
                  type="primary"
                  htmlType="submit"
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Form>
          </div>
          <EditTable
            bordered
            loading={loading}
            rowKey="companyId"
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => onSearch(pcTypeId, pcTempId, page)}
            columns={companyColumns}
          />
          {/* </Content> */}
        </Modal>
      </React.Fragment>
    );
  }
}
