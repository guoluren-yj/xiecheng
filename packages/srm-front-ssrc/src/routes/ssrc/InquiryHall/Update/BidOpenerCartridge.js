/**
 * inquiryHall - 寻源服务/询价大厅-定义开标人
 * @date: 2018-01-07
 * @author:  <jiangqi.nan@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import classNames from 'classnames';
import formatterCollections from 'utils/intl/formatterCollections';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { phoneRender } from '@/utils/renderer';
import styles from './index.less';

@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
export default class BidOpenerCartridge extends PureComponent {
  /**
   * lov组件选定数据
   */
  @Bind()
  handleChangeLov(val, dataList, record) {
    const { passwordFlag } = this.props;
    record.$form.setFieldsValue({
      userId: dataList.id,
      realName: dataList.realName,
      email: dataList.email,
      phone: dataList.phone,
      passwordFlag,
      internationalTelCode: dataList.internationalTelCode,
      internationalTelCodeMeaning: dataList.internationalTelCodeMeaning,
    });
  }

  render() {
    const {
      fetchBidholderListLoading,
      organizationId,
      dataSource,
      pagination,
      handleAddBidHolder,
      fetchBidholderUpdate,
      fetchBidholderDelete,
      handleAddCurrentUser,
      handleSearch,
      bidRowSelection,
      saveBidHolderLoading,
      passwordFlag,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.loginName`).d('用户名'),
        dataIndex: 'loginName',
        width: 150,
        render: (val, record) => {
          if (record._status === 'create') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('loginName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.inquiryHall.model.inquiryHall.loginName`).d('用户名'),
                      }),
                    },
                  ],
                  initialValue: record.loginName,
                })(
                  <Lov
                    code="HIAM.TENANT.USER"
                    textValue={record.loginName}
                    queryParams={{ organizationId }}
                    onChange={(value, dataList) => this.handleChangeLov(value, dataList, record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.realName`).d('名称'),
        dataIndex: 'realName',
        key: 'realName',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('realName', {
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.realName`).d('名称'),
                    }),
                  },
                ],
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        dataIndex: 'email',
        key: 'email',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('email', {
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.email').d('邮箱'),
                    }),
                  },
                ],
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.telPhone`).d('电话'),
        key: 'phone',
        dataIndex: 'phone',
        width: 200,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            // <Form.Item>
            //   {record.$form.getFieldDecorator('phone', {
            //     rules: [
            //       {
            //         required: false,
            //         message: intl.get('hzero.common.validation.notNull', {
            //           name: intl.get(`ssrc.inquiryHall.model.inquiryHall.telPhone`).d('电话'),
            //         }),
            //       },
            //     ],
            //     initialValue: val,
            //   })(<Input add disabled />)}
            // </Form.Item>
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('phone', {
                  initialValue: record.phone,
                })(
                  <div>
                    {phoneRender(
                      record.$form.getFieldValue('internationalTelCodeMeaning'),
                      record.$form.getFieldValue('phone')
                    )}
                  </div>
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('internationalTelCode', {
                  initialValue: record.internationalTelCode,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('internationalTelCodeMeaning', {
                  initialValue: record.internationalTelCodeMeaning,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.passwordFlag`).d('启用开标密码'),
        dataIndex: 'passwordFlag',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('passwordFlag', {
                initialValue: record.passwordFlag,
                valuePropName: 'checked',
              })(<Checkbox disabled={!passwordFlag} />)}
            </Form.Item>
          ) : (
            <span>{enableRender(val)}</span>
          ),
      },
    ];
    return (
      <Fragment>
        <div style={{ textAlign: 'right' }}>
          <Button type="default" style={{ marginRight: 15 }} onClick={handleAddCurrentUser}>
            {intl.get(`ssrc.inquiryHall.view.message.button.joinCurrentUser`).d('加入当前用户')}
          </Button>
          <Button
            icon="save"
            type="default"
            style={{ marginRight: 15 }}
            onClick={fetchBidholderUpdate}
            loading={saveBidHolderLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="delete"
            style={{ marginRight: '15px' }}
            type="default"
            onClick={() => fetchBidholderDelete()}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button icon="plus" type="primary" onClick={handleAddBidHolder}>
            {intl.get(`ssrc.inquiryHall.view.message.button.addOpener`).d('新增开标人')}
          </Button>
        </div>
        <EditTable
          bordered
          loading={fetchBidholderListLoading}
          rowKey="rfxMemberId"
          className={classNames(styles['ssrc-bid-list'])}
          style={{ marginTop: 20 }}
          rowSelection={bidRowSelection}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={(page) => handleSearch(page)}
        />
      </Fragment>
    );
  }
}
