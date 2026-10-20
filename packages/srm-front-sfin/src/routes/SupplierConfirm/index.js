/**
 * index.js - 扣款单确认
 * @date: 2020-11-13
 * @author: lichao <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Modal, Form, Row, Col, Input } from 'hzero-ui';
import { isUndefined, isEmpty } from 'lodash';
import Upload from 'srm-front-boot/lib/components/Upload';
import { connect } from 'dva';

import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { Bind, Throttle } from 'lodash-decorators';

import Search from './Search';
import List from './List';

const viewProps = 'sfin.supplierConfirm.view';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const formRemarkLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const { TextArea } = Input;

@connect(({ loading = {}, supplierConfirm, supplierCommon }) => ({
  loading:
    loading.effects['supplierConfirm/queryList'] ||
    loading.effects['supplierConfirm/handleConfrim'] ||
    loading.effects['supplierConfirm/handleReturn'],
  supplierConfirm,
  supplierCommon,
}))
@formatterCollections({
  code: [
    'hzero.common',
    'entity.company',
    'sfin.supplierChargeEntry',
    'entity.roles',
    'sfin.supplierConfirm',
    'entity.attachment',
  ],
})
@Form.create({ fieldNameProp: null })
export default class SupplierConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      returnVisible: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.fetchList(); // 查询数据
    this.fetchEnum(); // 查询值集
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */

  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    this.setState({ selectedRows: [] });
    dispatch({
      type: 'supplierConfirm/queryList',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierConfirm/init',
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 确认
   */
  @Bind()
  @Throttle(1000)
  handleConfrim() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    Modal.confirm({
      title: intl.get(`sfin.supplierConfirm.view.title.confirm`).d('是否确认'),
      onOk: () => {
        dispatch({
          type: 'supplierConfirm/handleConfrim',
          payload: {
            selectedRowKeys,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchList(); // 查询数据
            this.setState({
              selectedRowKeys: [],
            });
          }
        });
      },
    });
  }

  /**
   * 退回
   */
  @Bind()
  @Throttle(1000)
  handleReturn() {
    // console.log('test');
    // const {
    //   form: { getFieldDecorator },
    // } = this.props;
    this.setState({
      returnVisible: true,
    });
  }

  /**
   * 确认退回
   */
  @Bind()
  handleConfrimReturn() {
    // console.log('test');
    // const {
    //   form: { getFieldDecorator },
    // } = this.props;
    const { dispatch, form = {} } = this.props;
    const { selectedRows } = this.state;
    // const returnRemark = form.getFieldValue('returnRemark');
    form.validateFields((err, values) => {
      if (!err) {
        const dataSource = selectedRows.map((item) => {
          return { ...item, ...values };
        });
        dispatch({
          type: 'supplierConfirm/handleReturn',
          payload: {
            dataSource,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchList(); // 查询数据
            this.setState({
              returnVisible: false,
              selectedRowKeys: [],
            });
          }
        });
      }
    });
  }

  /**
   * 确认退回
   */
  @Bind()
  handleCancelReturn() {
    this.setState({
      returnVisible: false,
    });
  }

  render() {
    const {
      supplierConfirm: { dataSource = [], pagination = {}, enumMap = {} },
      loading = false,
      form: { getFieldDecorator },
    } = this.props;
    const { selectedRows = [], returnVisible, selectedRowKeys, tenantId } = this.state;

    const searchProps = {
      enumMap,
      onRef: (node) => {
        this.filterForm = (node.props || {}).form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      dataSource,
      pagination,
      selectedRows,
      onSearch: this.fetchList,
      loading,
      onHandleRecord: this.handleRecordChange,
      onRowSelectChange: this.onRowSelectChange,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${viewProps}.supplierConfirm`).d('扣款单确认')}>
          <Button
            icon="check"
            loading={loading}
            disabled={isEmpty(selectedRowKeys)}
            onClick={this.handleConfrim}
          >
            {intl.get(`hzero.common.button.confrim`).d('确认')}
          </Button>
          <Button
            disabled={isEmpty(selectedRowKeys)}
            icon="close"
            onClick={this.handleReturn}
            loading={loading}
          >
            {intl.get(`hzero.common.button.return`).d('退回')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        {returnVisible && (
          <Modal
            width={1000}
            title={intl.get(`sfin.supplierChargeEntry.model.supplier.backRemark`).d('扣款退回说明')}
            style={{ top: 20 }}
            visible={returnVisible}
            onOk={() => this.handleConfrimReturn()}
            onCancel={() => this.handleCancelReturn()}
          >
            <Fragment>
              <Form className="more-fields-search-form">
                <Row {...EDIT_FORM_ROW_LAYOUT} className="inclusion-row">
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`${viewProps}.supplierAttachmentUuid`).d('说明附件')}
                    >
                      {getFieldDecorator('supplierAttachmentUuid')(
                        <Upload
                          bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                          bucketDirectory="ssrc-rfx-rfxitem"
                          tenantId={tenantId}
                          afterOpenUploadModal={this.afterOpenUploadModal}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row
                  {...EDIT_FORM_ROW_LAYOUT}
                  className="inclusion-row"
                  style={{ marginTop: '5px' }}
                >
                  <Col span={21}>
                    <Form.Item
                      label={intl.get(`${viewProps}.returnRemark`).d('退回说明')}
                      {...formRemarkLayout}
                    >
                      {getFieldDecorator('returnRemark', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${viewProps}.returnRemark`).d('退回说明'),
                            }),
                          },
                        ],
                      })(<TextArea typeCase="upper" rows={3} style={{ overflow: 'hidden' }} />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Fragment>
          </Modal>
        )}
      </Fragment>
    );
  }
}
