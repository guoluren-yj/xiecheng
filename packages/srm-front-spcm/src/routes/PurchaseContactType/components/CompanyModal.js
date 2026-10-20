import React, { Component } from 'react';
import { Modal, Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
import Switch from 'components/Switch';
import EditTable from 'components/EditTable';
import { yesOrNoRender } from 'utils/renderer';
// import { filterNullValueObject } from 'utils/utils';
import styles from '../Detail/index.less';
import AddCompanyModal from './AddCompanyModal';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class Company extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    if (isFunction(props.onRefAdd)) {
      props.onRefAdd(this);
    }
    this.state = {
      addCompanyVisible: false,
    };
  }
  // componentDidMount() {
  //   const { onSearch } = this.props;
  //   onSearch();
  // }

  /**
   * 查询公司列表
   * @param {Object} page - 分页信息
   */
  @Bind()
  handCompanySearch() {
    const { handleCompany } = this.props;
    if (isFunction(handleCompany)) {
      handleCompany();
    }
  }

  /**
   * 查询新增公司列表
   * @param {Object} page - 分页信息
   */
  @Bind()
  handAddCompanySearch() {
    const { fetchAddCompany } = this.props;
    if (isFunction(fetchAddCompany)) {
      fetchAddCompany();
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

  /**
   * 新建公司-弹框modal
   */
  @Bind()
  handleAddCompany() {
    const { fetchAddCompany } = this.props;
    this.setState(
      {
        addCompanyVisible: true,
      },
      fetchAddCompany()
    );
  }

  /**
   * 删除新建未保存的公司
   */
  @Bind()
  handleClearCompany() {
    const { handleClearCompany } = this.props;
    handleClearCompany();
  }

  /**
   * 删除新建未保存的公司
   */
  @Bind()
  handleCloseCompany() {
    const { handleCloseAddCompany = () => {} } = this.props;
    this.setState(
      {
        addCompanyVisible: false,
      },
      handleCloseAddCompany()
    );
  }

  /**
   * 确认新建未保存的公司
   */
  @Bind()
  handleSureAddCompany() {
    const { handleSureAddCompany } = this.props;
    this.setState(
      {
        addCompanyVisible: false,
      },
      handleSureAddCompany()
    );
  }

  /**
   * 确认保存新建的公司
   */
  @Bind()
  handleSureSaveCompany() {
    const { handleSureSaveCompany } = this.props;
    handleSureSaveCompany();
  }

  render() {
    const {
      visible, // 公司查询时弹出lov
      dataSource, // 数据源
      pagination,
      companyAddDataSource,
      companyAddPagination,
      loading,
      addCompanyLoading,
      onSearch,
      form,
      hideModal,
      rowSelection, // 已加入的公司列或新加入的公司列
      rowAddCompany, // 新增的公司列
      clearCompanyRowsKeys, // 公司清除列key
      fetchAddCompany,
      onRef,
      maintainEditable = true,
    } = this.props;
    const { addCompanyVisible } = this.state;
    const { getFieldDecorator } = form;
    const addCompanyProps = {
      dataSource: companyAddDataSource,
      pagination: companyAddPagination,
      visible: addCompanyVisible,
      loading: addCompanyLoading,
      hideModal: this.handleCloseCompany,
      handleSureAddCompany: this.handleSureAddCompany,
      fetchAddCompany,
      rowAddCompany,
      onRef,
      // onRef: node => {
      //   this.companyForm = node.props.form;
      // },
      //  onAddRef: node => {
      // //   this.companyAddForm = node.props.form;
      // // },
    };
    const companyColumns = [
      {
        title: intl.get('entity.company.code').d('公司编码'),
        width: 180,
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
          ['create', 'update'].includes(record._status) && maintainEditable ? (
            <FormItem>
              {record.$form.getFieldDecorator('enabledFlag', {
                initialValue: val,
              })(<Switch />)}
            </FormItem>
          ) : (
            yesOrNoRender(val)
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
          onOk={maintainEditable ? this.handleSureSaveCompany : hideModal}
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
                  onClick={this.handCompanySearch}
                  type="primary"
                  htmlType="submit"
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Form>
            <Form layout="inline" className={styles['btn-wrapper']}>
              {maintainEditable && (
                <React.Fragment>
                  <Button
                    type="primary"
                    style={{ marginRight: 8 }}
                    onClick={() => this.handleAddCompany()}
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                  <Button
                    style={{ marginRight: 8 }}
                    disabled={clearCompanyRowsKeys.length === 0}
                    onClick={() => this.handleClearCompany()}
                  >
                    {intl.get('hzero.common.button.clear').d('清除')}
                  </Button>
                </React.Fragment>
              )}
            </Form>
          </div>
          <EditTable
            bordered
            loading={loading}
            rowKey="companyId"
            dataSource={dataSource}
            rowSelection={rowSelection}
            pagination={pagination}
            onChange={onSearch}
            columns={companyColumns}
          />
          {/* </Content> */}
        </Modal>
        {addCompanyVisible && <AddCompanyModal {...addCompanyProps} />}
      </React.Fragment>
    );
  }
}
