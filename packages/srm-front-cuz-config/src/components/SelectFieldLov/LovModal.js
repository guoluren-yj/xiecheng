import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Table,
  Row,
  Col,
  Button,
} from 'hzero-ui';
import { isNil, isArray, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { totalRender } from 'utils/renderer';

import { queryModelFields } from '@/services/customizeConfigService';

import styles from './index.less';

const rowKey = 'fieldCode';
const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

const SelectFieldLovModal = ({
  form,
  onClose,
  queryParams,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [allTableData, setAllTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [tablePagination, setTablePagination] = useState(null);

  useEffect(() => {
    handleQuery();
  }, []);

  const handleQuery = async() => {
    setLoading(true);
    const res = await queryModelFields(!isNil(queryParams) ? queryParams : {});
    setLoading(false);
    if (getResponse(res) && isArray(res.content) && !isEmpty(res.content)) {
      setAllTableData(res.content);
      setTableData(res.content);
      setTablePagination(createTablePagination(res.content));
    } else {
      setAllTableData([]);
      setTableData([]);
    }
  };

  const createTablePagination = (data) => {
    return {
      showSizeChanger: true,
      total: data.length,
      showTotal: totalRender,
    };
  };

  const handleFilter = () => {
    setSelectedKeys([]);
    setLoading(true);
    const { fieldCode, fieldName } = form.getFieldsValue();
    const filterData = allTableData.filter(item => {
      let flag = true;
      if (fieldCode) {
        flag = item.fieldCode ? item.fieldCode.includes(fieldCode) : false;
      }
      if (fieldName) {
        flag = item.fieldName ? item.fieldName.includes(fieldName) : false;
      }
      return flag;
    });
    setLoading(false);
    setTableData(filterData);
    setTablePagination(createTablePagination(filterData));
  };

  const handleReset = () => form.resetFields();

  const columns = [
    {
      title: intl.get('hpfm.customize.common.fieldCode').d('字段编码'),
      dataIndex: 'fieldCode',
    },
    {
      title: intl.get('hpfm.customize.common.fieldName').d('字段名称'),
      dataIndex: 'fieldName',
    },
  ];

  const rowSelection = {
    type: 'radio',
    selectedRowKeys: selectedKeys,
    onChange: (keys) => setSelectedKeys(keys),
  };

  const handleClickTbRow = (record) => {
    if (record && record[rowKey]) {
      setSelectedKeys([record[rowKey]]);
    }
  };

  const handleDbClickTbRow = (record) => {
    handleClickTbRow(record);
    const value = record[rowKey];
    if (onChange) {
      onChange(value, record);
      onClose();
    }
  };

  const handleOk = () => {
    if (selectedKeys.length < 1) {
      Modal.warning({
        title: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return;
    }
    if (onChange) {
      const value = selectedKeys[0];
      const record = allTableData.find(item => item[rowKey] === value);
      onChange(value, record);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();
      handleFilter();
    }
  };

  return (
    <Modal
      destroyOnClose
      closable
      visible
      width={700}
      onCancel={onClose}
      bodyStyle={{ padding: '56px 16px 0px' }}
      onOk={handleOk}
    >
      <Form>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={intl.get('hpfm.customize.common.fieldCode').d('字段编码')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('fieldCode')(<Input onKeyDown={handleKeyDown} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={intl.get('hpfm.customize.common.fieldName').d('字段名称')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('fieldName')(<Input onKeyDown={handleKeyDown} />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className={styles['query-from-btns']}>
            <Button onClick={handleReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button type='primary' style={{ marginLeft: '8px' }} onClick={handleFilter} onDoubleClick>
              {intl.get('hzero.common.button.query').d('查询')}
            </Button>
          </Col>
        </Row>
      </Form>
      <Table
        bordered
        rowKey={rowKey}
        columns={columns}
        dataSource={tableData}
        loading={loading}
        rowSelection={rowSelection}
        pagination={tablePagination}
        onRow={(record) => ({
          onClick: () => handleClickTbRow(record),
          onDoubleClick: () => handleDbClickTbRow(record),
        })}
      />
    </Modal>
  );
};

export default Form.create({ fieldNameProp: null })(SelectFieldLovModal);