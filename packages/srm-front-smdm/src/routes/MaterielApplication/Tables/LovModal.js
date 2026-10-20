import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Form, Row, Col, Button, Input } from 'hzero-ui';
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, createPagination, getResponse, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { isUndefined } from 'lodash';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

export default Form.create({ fieldNameProp: null })((props) => {
  const {
    column = {},
    queryParams,
    code,
    onOk,
    onCancel,
    title,
    form,
    selectedRowKeys: keys,
  } = props;
  const [dataSource, setDataSource] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState(keys);
  const { queryFields = [] } = column;

  const fetchList = useCallback((params) => {
    setLoading(true);
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    request(`${HZERO_PLATFORM}/v1/lovs/sql/data`, {
      method: 'GET',
      query: parseParameters({ ...queryParams, lovCode: code, page: params, ...filterValues }),
    }).then((res) => {
      if (res) {
        const list = getResponse(res) || {};
        const pagination = createPagination(list) || {};
        setDataSource({
          list: list.content || [],
          pagination,
        });
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchList();
  }, []);

  const handleOk = () => {
    if (selectedRowKeys.length === 0) {
      onOk([], []);
    } else if (selectedRowKeys.length !== selectedRows.length) {
      const { list = [] } = dataSource;
      const newRows = list.filter((item) => selectedRowKeys.includes(item.inventoryId));
      onOk(selectedRowKeys, newRows);
    } else {
      onOk(selectedRowKeys, selectedRows);
    }
  };

  return (
    <Modal destroyOnClose title={title} width={780} visible onOk={handleOk} onCancel={onCancel}>
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                {queryFields.map((item) => (
                  <Col span={12}>
                    <Form.Item {...formItemLayout} label={item.label}>
                      {form.getFieldDecorator(item.field)(<Input />)}
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button onClick={() => form.resetFields()}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  type="primary"
                  htmlType="submit"
                  onClick={fetchList}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <Table
        rowKey="inventoryId"
        columns={column.tableFields}
        dataSource={dataSource.list}
        onChange={fetchList}
        pagination={dataSource.pagination}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: (rowKeys, rows) => {
            setSelectedRows(rows);
            setSelectedRowKeys(rowKeys);
          },
        }}
      />
    </Modal>
  );
});
