/**
 * CategoryTable - 自主品类分配定义
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Badge, Checkbox } from 'hzero-ui';
import { isEmpty } from 'lodash';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import Switch from 'components/Switch';
import notification from 'utils/notification';

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { fetchDoExecute } from '@/services/materielService';
import InviterModal from './InviterModal';

const FormItem = Form.Item;

/**
 * 自主品类分配定义
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class CategoryTable extends PureComponent {
  state = {
    drawerVisible: false,
    recordSource: {},
    selectedRows: [],
    idList: [],
    // canSelectParentRows: false,
    categoryLevelControl: false,
  };

  componentDidMount() {
    const { onClearRows } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
    // fetchDoExecute([{ fullPathCode: 'SITE.SMDM.ITEM_CATEGORY_LEVEL_LIMIT' }]).then((res) => {
    //   if (res && !res.failed) {
    //     this.setState({ canSelectParentRows: res?.[0] && res?.[0] !== '1' });
    //   } else {
    //     notification.error({ message: res?.message });
    //   }
    // });

    fetchDoExecute([
      {
        fullPathCode: 'SITE.SMDM.CATEGORY_LEVEL_CONTROL',
        parameterMap: {
          businessObjectCode: 'SRM_C_SRM_SMDM_ITEM',
        },
      },
    ]).then((res) => {
      if (res && !res.failed) {
        this.setState({ categoryLevelControl: res?.[0] && res?.[0] !== 'ALL' });
      } else {
        notification.error({ message: res?.message });
      }
    });
    // if (itemId) {
    //   onTableChange({}, 'queryCategory');
    // }
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [] });
  }

  /**
   * 方法含义？
   * 参数？
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const idList = [];
    selectedRows.forEach((item) => {
      if (!item.isLocal) {
        idList.push(item.categoryAssignId);
      }
    });
    this.setState({ selectedRows, idList });
  }

  /**
   * 方法含义？
   * 参数？
   */
  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination, 'queryCategory');
  }

  /**
   * 渲染是否
   * @param {Boolean} v
   */
  @Bind()
  yesOrNoRender(v) {
    const statusMap = ['default', 'success'];
    return (
      <Badge
        status={statusMap[v]}
        text={v === 1 ? intl.get('hzero.common.status.yes') : intl.get('hzero.common.status.no')}
      />
    );
  }

  /**
   * 方法含义？
   * 参数？
   */
  @Bind()
  onOpen(recordSource) {
    if (recordSource) {
      this.setState({ drawerVisible: true, recordSource });
    } else {
      this.setState({ drawerVisible: true, recordSource: {} });
    }
  }

  /**
   * 方法含义？
   * 参数？
   */
  @Bind()
  onClose() {
    this.setState({ drawerVisible: false });
  }

  /**
   * 新建保存
   */
  @Bind()
  async saveCreateData(newData = []) {
    const { dataSource = [], onAdd, remote } = this.props;
    const dataSourceCatogoryIds = dataSource.map((item) => item.categoryId);
    if (!newData.every((item) => !dataSourceCatogoryIds.includes(item.categoryId))) {
      notification.warning({
        message: intl.get(`smdm.materiel.model.materiel.repeatCategory`).d('已过滤新增的重复品类'),
      });
    }
    const dataList = newData
      .filter((item) => !dataSourceCatogoryIds.includes(item.categoryId))
      .map((item) => {
        return { ...item, categoryAssignId: uuidv4(), defaultFlag: 0, isLocal: true };
      });
    await onAdd([...dataList, ...dataSource], 'categoryData', false);
    if (remote) {
      const { dataSource: newDataSource } = this.props;
      remote.event.fireEvent('afterAddCategory', {
        dataSource: newDataSource,
        handleEditAndSaveLine: this.handleEditAndSaveLine,
      });
    }
  }

  /**
   * 编辑保存
   */
  @Bind()
  saveFormData() {
    const { form, dataSource = [], onAdd } = this.props;
    const { recordSource = {} } = this.state;
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        const newFieldsValues = {
          ...recordSource,
          ...fieldsValues,
        };
        const data = isEmpty(dataSource) ? [] : [...dataSource];
        let newDataSource = [];
        if (newFieldsValues.defaultFlag) {
          data.forEach((item) => {
            newDataSource.push({ ...item, defaultFlag: 0 });
          });
        } else {
          newDataSource = [...data];
        }
        if (newFieldsValues.isCreat) {
          newDataSource.unshift(newFieldsValues);
        } else {
          const { categoryAssignId } = newFieldsValues;
          newDataSource = newDataSource.map((item) => {
            if (item.categoryAssignId === categoryAssignId) {
              return { ...item, ...newFieldsValues };
            } else {
              return item;
            }
          });
        }
        const dataList = newDataSource.map((item) => {
          if (item.isCreat) {
            const { isCreat, ...other } = item;
            return other;
          } else {
            return item;
          }
        });
        onAdd(dataList, 'categoryData', false);
        this.setState({ drawerVisible: false });
      }
    });
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dataSource = [], onDeleteRows } = this.props;
    const { selectedRows, idList } = this.state;

    const newSelectedRows = selectedRows.map((item) => {
      return item.categoryAssignId;
    });
    const newDataSource = dataSource.filter((item) => {
      return newSelectedRows.indexOf(item.categoryAssignId) > -1 === false;
    });
    this.setState({ selectedRows: [] });
    onDeleteRows(newDataSource, idList, 'deleteCategoryTableData', 'categoryData', false);
  }

  /**
   * 方法含义？
   */
  renderForm() {
    const { form, onValid, isEdit } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const { recordSource } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    getFieldDecorator('categoryCode', { initialValue: recordSource.categoryCode });
    return (
      <Form layout="horizontal">
        <FormItem
          {...formLayOut}
          label={intl.get(`smdm.materiel.model.materiel.categoryCode`).d('品类代码')}
        >
          {getFieldDecorator('categoryId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`smdm.materiel.model.materiel.categoryCode`).d('品类代码'),
                }),
              },
            ],
            initialValue: recordSource.categoryId,
          })(
            <Lov
              code="SMDM.TREE_ITEM_CATEGORY"
              textValue={recordSource.categoryCode}
              lovOptions={{ displayField: 'categoryCode' }}
              queryParams={{ enabledFlag: 1 }}
              onChange={(value, record) => {
                setFieldsValue({
                  categoryCode: record.categoryCode,
                  categoryName: record.categoryName,
                });
                if (isEdit) {
                  onValid(form, 'categoryId', value);
                }
              }}
            />
          )}
        </FormItem>
        <FormItem
          {...formLayOut}
          label={intl.get(`smdm.materiel.model.materiel.categoryName`).d('品类名称')}
        >
          {getFieldDecorator('categoryName', {
            initialValue: recordSource.categoryName,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          {...formLayOut}
          label={intl.get(`smdm.materiel.model.materiel.defaultFlag`).d('是否主品类')}
        >
          {getFieldDecorator('defaultFlag', {
            initialValue: recordSource.defaultFlag ? recordSource.defaultFlag : 0,
          })(<Switch />)}
        </FormItem>
      </Form>
    );
  }

  @Bind()
  handleCancelModal() {
    this.setState({ inviterModalVisible: false });
  }

  @Bind()
  handleOpenModal() {
    this.setState({ inviterModalVisible: true });
  }

  @Bind()
  handleEditAndSaveLine(record, options) {
    const { categoryAssignId, categoryId } = record;
    const { dataSource = [], handleStateUpdate, fetchCategoryTemplate } = this.props;
    const newDataSource = dataSource.map((item) => {
      if (item.categoryAssignId === categoryAssignId) {
        return { ...item, ...options };
      }
      return item;
    });
    const ifWarning = newDataSource.filter((item) => item.defaultFlag).length >= 2;
    if (ifWarning) {
      notification.warning({
        message: intl
          .get(`smdm.materiel.model.materiel.onlyOneDefaultFlag`)
          .d('每个物料只能维护一个主品类'),
      });
      return;
    }
    if (newDataSource.length > 0) {
      handleStateUpdate(
        'categoryData',
        options.clear
          ? newDataSource.map((ds) => {
              const { $form, _status, ...otherds } = ds;
              return otherds;
            })
          : newDataSource
      );
      if (options.clear && options.defaultFlag) {
        fetchCategoryTemplate(categoryId);
      }
    }
  }

  render() {
    const {
      selectedRows,
      inviterModalVisible = false,
      // canSelectParentRows,
      categoryLevelControl,
    } = this.state;
    const { dataSource, fetchDataCategories, customizeTable, editAble } = this.props;
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.categoryCode`).d('品类代码'),
        dataIndex: 'categoryCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.categoryName`).d('品类名称'),
        dataIndex: 'categoryName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.defaultFlag`).d('是否主品类'),
        dataIndex: 'defaultFlag',
        render: (val, record) =>
          record._status === 'update'
            ? record.$form.getFieldDecorator('defaultFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)
            : this.yesOrNoRender(val, record),
      },
      editAble && {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'center',
        dataIndex: 'option',
        render: (_, record) => {
          return record._status === 'update' ? (
            <>
              <a
                onClick={() =>
                  this.handleEditAndSaveLine(record, {
                    ...(record.$form?.getFieldsValue() || {}),
                    clear: true,
                  })
                }
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </a>
              <a
                onClick={() => this.handleEditAndSaveLine(record, { _status: '' })}
                style={{ marginLeft: '15px' }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            </>
          ) : (
            <a onClick={() => this.handleEditAndSaveLine(record, { _status: 'update' })}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ].filter(Boolean);
    const rowSelection = {
      onChange: this.onSelectChange,
    };
    const inviterModelProps = {
      // acceptorIdList,
      inviterVisble: true,
      handleCancelModal: this.handleCancelModal,
      fetchData: fetchDataCategories,
      triggerChange: this.saveCreateData,
      // canSelectParentRows,
      categoryLevelControl,
    };
    return (
      <React.Fragment>
        {editAble && (
          <div className="table-list-search" style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              disabled={isEmpty(selectedRows)}
              onClick={this.handleDelete}
            >
              {intl.get(`smdm.materiel.view.message.toolTip.category.delete`).d('删除品类')}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                this.handleOpenModal();
              }}
            >
              {intl.get(`smdm.materiel.view.message.toolTip.category.create`).d('新建品类')}
            </Button>
          </div>
        )}
        {customizeTable(
          {
            code: 'SMDM_MATERIEL_CATEGORY.LIST',
          },
          <EditTable
            bordered
            rowKey="categoryAssignId"
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            rowSelection={rowSelection}
            onChange={this.handleTableChange}
          />
        )}
        {inviterModalVisible && <InviterModal {...inviterModelProps} />}
        {/* <Drawer
          destroyOnClose
          title={
            recordSource.categoryAssignId
              ? intl.get(`smdm.materiel.view.message.toolTip.category.edit`).d('编辑品类')
              : intl.get(`smdm.materiel.view.message.toolTip.category.create`).d('新建品类')
          }
          placement="right"
          width="520px"
          onClose={this.onClose}
          visible={drawerVisible}
        >
          {this.renderForm()}
          <div className={styles['modal-button']}>
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.onClose}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button onClick={this.saveFormData} type="primary">
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
        </Drawer> */}
      </React.Fragment>
    );
  }
}
