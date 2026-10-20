import React, { PureComponent } from 'react';
import { Form, Input, Button, Table, Modal, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

@Form.create({ fieldNameProp: null })
export default class ShareModal extends PureComponent {
  constructor(props) {
    super(props);
    // props.onRef(this);
    this.state = {
      // rowKeys: [],
    };
  }

  /**
   * 分享选择的列表
   */
  @Bind()
  handleRowSelectChange(rowKeys, modalRows) {
    this.props.onSelect(rowKeys, modalRows);
  }

  /**
   * 查询
   */
  @Bind()
  search() {
    const { onbatchShare, records } = this.props;
    const fromList = this.props.form.getFieldsValue();
    onbatchShare('', fromList, records);
  }

  render() {
    // const { rowKeys } = this.state;
    const {
      form: { getFieldDecorator },
      visible,
      dataList,
      shareModalOk,
      modalPagination,
      shareModalCancel,
      modalLoading,
      defaultSelect,
      records,
      infoLoading,
      onbatchShare,
    } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.company').d('公司'),
        width: 100,
        dataIndex: 'companyName',
      },
      {
        title: intl.get('scec.goodsShare.model.goodsShare.companyNum').d('代码'),
        width: 150,
        dataIndex: 'companyNum',
      },
    ];
    const rowSelection = {
      selectedRowKeys: defaultSelect,
      onChange: this.handleRowSelectChange,
    };
    return (
      <Modal
        width="40%"
        destroyOnClose
        visible={visible}
        onCancel={shareModalCancel}
        onOk={() => shareModalOk()}
        confirmLoading={infoLoading}
        title={
          <React.Fragment>
            <Tooltip
              placement="topLeft"
              title="商品只能被分享给与商品所属供应商建立了合作关系的其他公司"
            >
              {intl.get('scec.goodsShare.model.goodsShare.share').d('分享')}
              <Icon style={{ marginLeft: '5px' }} type="question-circle-o" />
            </Tooltip>
          </React.Fragment>
        }
        {...otherProps}
      >
        <Form layout="inline">
          <Form.Item label={intl.get('scec.common.model.company').d('公司')}>
            {getFieldDecorator('companyName')(<Input />)}
          </Form.Item>
          <Form.Item label={intl.get('scec.goodsShare.model.goodsShare.companyNum').d('代码')}>
            {getFieldDecorator('companyNum')(<Input />)}
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={this.search}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </Form.Item>
        </Form>
        <Table
          bordered
          loading={modalLoading}
          rowKey="companyId"
          columns={columns}
          dataSource={dataList}
          pagination={modalPagination}
          rowSelection={rowSelection}
          onChange={(page, _) => onbatchShare(page, _, records)}
        />
      </Modal>
    );
  }
}
