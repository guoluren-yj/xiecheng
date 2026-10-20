/**
 * index - 参数定义
 * @date: 2021-1-20
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Drawer, Checkbox, Input, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import EditTable from 'components/EditTable';
import { getEditTableData } from 'utils/utils';
import { enableRender } from 'utils/renderer';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class ParamDefinition extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, currentRecord = {} } = this.props;
    const { evalTplIndFmlId = '' } = currentRecord;
    return (
      visible && evalTplIndFmlId && evalTplIndFmlId !== prevProps.currentRecord.evalTplIndFmlId
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.queryParamDefinition();
    }
  }

  /**
   * 查询数据
   */
  @Bind()
  queryParamDefinition() {
    const { fetchParamDefinition = () => {}, currentRecord = {} } = this.props;
    const { evalTplIndFmlId = '' } = currentRecord;
    fetchParamDefinition({ evalTplIndFmlId }, (res) => {
      if (res) {
        this.setState({
          dataSource: res,
        });
      }
    });
  }

  /**
   * 清除
   */
  @Bind()
  handleClean(record) {
    const { dataSource } = this.state;
    const newPlatformContactList = dataSource.filter(
      (n) => n.tplIndFmlParamId !== record.tplIndFmlParamId
    );
    this.setState({ dataSource: newPlatformContactList });
  }

  /**
   * 编辑/取消
   */
  @Bind()
  handleEdit(flag, record) {
    const { dataSource } = this.state;
    const newPlatformContactList = dataSource.map((item) => {
      if (item.tplIndFmlParamId === record.tplIndFmlParamId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    this.setState({ dataSource: newPlatformContactList });
  }

  /**
   * 新增
   */
  @Bind()
  handleAdd() {
    const { dataSource } = this.state;
    this.setState({
      dataSource: [{ _status: 'create', tplIndFmlParamId: uuidv4(), enableFlag: 1 }, ...dataSource],
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { saveParamDefinition = () => {}, currentRecord = {} } = this.props;
    const { dataSource } = this.state;
    const { evalTplIndFmlId = '', evalTplId = '', evalTplIndId = '' } = currentRecord;
    const data = getEditTableData(dataSource, ['tplIndFmlParamId']);
    if (Array.isArray(data) && data.length !== 0) {
      const tableValues = data.map((item) => {
        return {
          ...item,
          evalTplId,
          evalTplIndId,
        };
      });
      const payload = {
        evalTplIndFmlId,
        tableValues,
      };
      saveParamDefinition(payload, (res) => {
        if (res) {
          this.queryParamDefinition();
        }
      });
    }
  }

  render() {
    const {
      onClose = () => {},
      visible,
      formulaDrawerStatus = 'edit',
      queryParamDefinitionLoading,
    } = this.props;
    const { dataSource } = this.state;
    const drawerProps = {
      title: intl.get(`sslm.common.model.formula.paramDefinition`).d('参数定义'),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose,
      width: 750,
    };

    const columns = [
      {
        title: intl.get('sslm.common.model.formula.paramCode').d('参数编码'),
        dataIndex: 'paramField',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('paramField', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.common.model.formula.paramCode').d('参数编码'),
                    }),
                  },
                ],
              })(<Input inputChinese={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.common.model.formula.paramName').d('参数名称'),
        dataIndex: 'paramDescription',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('paramDescription', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.common.model.formula.paramName').d('参数名称'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.button.enabled').d('启用'),
        dataIndex: 'enableFlag',
        width: 80,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('enableFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
            </FormItem>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 100,
        render: (_, record) => (
          <Fragment>
            {record._status === 'create' && (
              <a onClick={() => this.handleClean(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
            {record._status === 'update' && (
              <a onClick={() => this.handleEdit(false, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a
                disabled={formulaDrawerStatus !== 'edit'}
                onClick={() => this.handleEdit(true, record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      },
    ];

    return (
      <Drawer {...drawerProps}>
        <div
          style={{
            textAlign: 'right',
            margin: '16px 0',
            display: formulaDrawerStatus === 'edit' ? 'block' : 'none',
          }}
        >
          <Button onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleAdd}>
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        </div>
        <EditTable
          bordered
          rowKey="tplIndFmlParamId"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          loading={queryParamDefinitionLoading}
        />
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
            zIndex: 1,
          }}
        >
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
