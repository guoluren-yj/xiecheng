/**
 * Banner - 门户轮播图
 * @date: 2019-6-21
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import TemplateForm from './TemplateForm';

@Form.create({ fieldNameProp: null })
export default class Banner extends PureComponent {
  state = {
    selectedRows: [],
    cancelFlag: false,
  };

  componentDidMount() {
    const { onClearRows } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
  }

  /**
   * 保存选择行的数据
   * @param {Array} selectedRowKeys - 选中行主键
   * @param {Array} selectedRows - 选中行信息
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
      cancelFlag: selectedRows.length > 0,
    });
  }

  @Bind()
  deleteSelectRows(selectedRows) {
    const { onDeleteSelectRows } = this.props;
    this.setState({
      cancelFlag: false,
    });
    onDeleteSelectRows(selectedRows); // 删除勾选行
  }

  render() {
    const {
      onCreateRow,
      onEditRow,
      onCancelRow,
      onDeleteRow,
      bannerList = [],
      configId,
    } = this.props;
    const NumberObj = {};
    const { selectedRows, cancelFlag } = this.state;
    bannerList.forEach((item, index) => {
      NumberObj[item.configItemId] = bannerList.length - index;
    });
    const columns = [
      {
        title: intl.get('spfm.portalAssign.model.portalAssign.number').d('序号'),
        dataIndex: 'configItemId',
        render: text => {
          return NumberObj[text];
        },
      },
      {
        title: intl.get('spfm.portalAssign.model.portalAssign.name').d('配置图片名称'),
        dataIndex: 'description',
        render: (text, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('description', {
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl
                  //         .get('spfm.portalAssign.model.portalAssign.name')
                  //         .d('配置图片名称'),
                  //     }),
                  //   },
                  // ],
                  initialValue: record.description,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return text;
          }
        },
      },
      {
        title: intl.get('spfm.portalAssign.model.portalAssign.linkUrl').d('跳转链接'),
        dataIndex: 'linkUrl',
        width: 300,
        render: (text, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('linkUrl', {
                  rules: [
                    // {
                    //   required: true,
                    //   message: intl.get('hzero.common.validation.notNull', {
                    //     name: intl.get('spfm.portalAssign.model.portalAssign.linkUrl').d('跳转链接'),
                    //   }),
                    // },
                    {
                      validator: (rule, value, callback) => {
                        // console.log(value);
                        if (isEmpty(value)) {
                          callback();
                        } else {
                          // var reg = /^http(s)?:\/\/.*?(?:gif|png|jpg|jpeg|webp|svg|psd|bmp|tif)$/i
                          const sRegex =
                            '^((https|http|rtsp|mms)?://)' +
                            // + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@
                            '(([0-9]{1,3}.){3}[0-9]{1,3}' + // IP形式的URL- 199.194.52.184
                            '|' + // 允许IP和DOMAIN（域名）
                            "([0-9a-z_!~*'()-]+.)*" + // 域名- www.
                            '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' + // 二级域名
                            '[a-z]{2,6})' + // first level domain- .com or .museum
                            '(:[0-9]{1,4})?' + // 端口- :80
                            '((/?)|' + // a slash isn't required if there is no file name
                            "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
                          const reg = new RegExp(sRegex);
                          if (reg.test(value)) {
                            // console.log('aaa')
                            callback();
                          } else {
                            // console.log('aaa1')
                            callback(
                              new Error(
                                intl
                                  .get('smdm.rateOrg.view.validation.NoProtocol')
                                  .d(`不是合法的网址`)
                              )
                            );
                          }
                        }
                      },
                    },
                  ],
                  initialValue: record.linkUrl,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return <a onClick={() => window.open(text)}>{text}</a>;
          }
        },
      },
      {
        title: intl.get('spfm.portalAssign.model.portalAssign.imageUrl').d('附件'),
        dataIndex: 'imageUrl',
        width: 300,
        render: (_, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('imageUrl', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.portalAssign.model.portalAssign.imageUrl').d('附件'),
                      }),
                    },
                  ],
                  initialValue: record.imageUrl,
                })(
                  <TemplateForm
                    initData={record}
                    type="carousel"
                    carousel={bannerList}
                    configId={configId}
                    key={record.configItemId}
                  />
                )}
              </Form.Item>
            );
          } else {
            return (
              <TemplateForm
                initData={record}
                disabled
                type="carousel"
                carousel={bannerList}
                configId={configId}
                key={record.configItemId}
              />
            );
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: (_, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return (
              <Badge
                status={record.enabledFlag ? 'success' : 'error'}
                text={
                  record.enabledFlag
                    ? intl.get('hzero.common.status.enable').d('启用')
                    : intl.get('hzero.common.status.disable').d('禁用')
                }
              />
            );
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        dataIndex: 'edit',
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  onDeleteRow(record, 'carousel');
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  onCancelRow(record, 'carousel');
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  onEditRow(record, 'carousel');
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRows.map(o => o.configItemId),
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: ['update', 'create'].includes(record._status),
      }),
    };
    return (
      <React.Fragment>
        <div style={{ margin: '8px 0 16px', textAlign: 'right' }}>
          <Button
            onClick={() => this.deleteSelectRows(selectedRows)}
            disabled={!cancelFlag}
            style={{ marginLeft: '8px' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          {bannerList.length < 6 && (
            <Button
              type="primary"
              onClick={() => onCreateRow('carousel')}
              style={{ marginLeft: '8px' }}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          )}
        </div>
        <EditTable
          bordered
          rowKey="configItemId"
          columns={columns}
          pagination={false}
          dataSource={bannerList}
          rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}
