import React, { PureComponent } from 'react';
import { Button, Drawer, Form, Input, Row, Col, Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { TextField } from 'choerodon-ui/pro';

import {
  getResponse,
  getCurrentOrganizationId,
  createPagination,
  filterNullValueObject,
} from 'utils/utils';
import intl from 'utils/intl';

import { queryMateriel } from '@/services/materielService';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
export default class Materiel extends PureComponent {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      content: [],
      pagination: {},
      selectedRows: [],
      selectedRowKeys: [],
      itemCodeMultiSelectData: [],
    };
  }

  componentDidMount() {
    this.handleMaterialData();
  }

  /**
   * 物料数据查询
   * @param {object} payload - 查询参数
   */
  @Bind()
  handleMaterialData(payload = {}) {
    const { form } = this.props;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    this.setState({
      loading: true,
    });
    queryMateriel({
      organizationId,
      page: isEmpty(payload) ? {} : payload,
      ...filterValues,
      itemCodeMultiSelect: Array.from(new Set(filterValues?.itemCodeMultiSelect || []))?.join(','),
      noChangeFlag: 1,
      sort: {
        columnKey: 'lastUpdateDate',
        field: 'lastUpdateDate',
        order: 'desc',
      },
      customizeUnitCode:
        'SMDM_MATERIELAPPLICATION_MATERIEL_MODAL.LIST,SMDM_MATERIELAPPLICATION_MATERIEL_MODAL.SERRCH',
    })
      .then((res) => {
        if (getResponse(res)) {
          this.setState({
            content: res.content,
            pagination: createPagination(res),
          });
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  @Bind()
  saveFormData() {
    const { onOk } = this.props;
    const { selectedRows } = this.state;
    onOk(selectedRows);
  }

  /**
 * 查询
 */
  @Bind()
  handleMultChange(value) {
    const { form } = this.props;
    if (value) {
      const data = value.map((ele) => ele.trim().replace(/\s+/g, ','))
      const valueData = [];
      data?.forEach(i => {
        valueData.push(...(i?.split(',')))
      })
      this.setState({ itemCodeMultiSelectData: valueData }, () => {
        form?.setFieldsValue({ itemCodeMultiSelect: valueData })
      })
    } else {
      this.setState({ itemCodeMultiSelectData: null }, () => {
        form?.setFieldsValue({ itemCodeMultiSelect: null })
      })
    }
  }


  @Bind()
  renderFilterForm() {
    const {
      form,
      form: { getFieldDecorator },
      customizeFilterForm,
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { display, itemCodeMultiSelectData } = this.state;
    return customizeFilterForm(
      {
        code: 'SMDM_MATERIELAPPLICATION_MATERIEL_MODAL.SERRCH',
        form,
        expand: display,
      },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码')}
                >
                  {getFieldDecorator('itemCode')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materiel.model.materiel.itemCodeMultiSelect')
                    .d('物料编码（批量）')}
                >
                  {getFieldDecorator('itemCodeMultiSelect')(
                    <TextField multiple trim="both" style={{ width: '100%' }} onChange={this.handleMultChange} value={itemCodeMultiSelectData} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.materiel.model.materiel.itemName').d('物料名称')}
                >
                  {getFieldDecorator('itemName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.materiel.model.materiel.specifications`).d('规格')}
                >
                  {getFieldDecorator('specifications')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.materiel.model.materiel.model`).d('型号')}
                >
                  {getFieldDecorator('model')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.materiel.model.common.externalSystemCode')
                    .d('外部来源系统编码')}
                >
                  {getFieldDecorator('externalSystemCode')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ display: !display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: !display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                htmlType="submit"
                onClick={this.handleMaterialData}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  onTableSelectedRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { customizeTable, visible, onCancel, confirmLoading } = this.props;
    const { loading, content, pagination, selectedRowKeys } = this.state;

    const columns = [
      {
        title: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
        dataIndex: 'itemName',
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ),
        width: 250,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.specifications').d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.model').d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.primaryUomName`).d('基本计量单位'),
        width: 150,
        dataIndex: 'uomName',
      },
      {
        title: intl.get('smdm.materiel.model.common.externalSystemCode').d('来源系统'),
        width: 100,
        align: 'center',
        dataIndex: 'externalSystemCode',
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onTableSelectedRowChange,
    };

    return (
      <Drawer
        destroyOnClose
        title={intl.get('smdm.materiel.model.materiel.selectChangeMaterier').d('选择变更物料')}
        placement="right"
        width="1090px"
        onClose={() => onCancel()}
        visible={visible}
      >
        <div className="table-list-search">{this.renderFilterForm()}</div>
        {customizeTable(
          {
            code: 'SMDM_MATERIELAPPLICATION_MATERIEL_MODAL.LIST',
          },
          <Table
            bordered
            rowKey="itemId"
            loading={loading}
            dataSource={content}
            rowSelection={rowSelection}
            columns={columns}
            pagination={pagination}
            onChange={this.handleMaterialData}
          />
        )}
        <div className={styles['modal-button']}>
          <Button
            style={{
              marginRight: 8,
            }}
            onClick={() => onCancel()}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            onClick={this.saveFormData}
            type="primary"
            loading={confirmLoading}
            disabled={selectedRowKeys?.length !== 1}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
