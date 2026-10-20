import React, { useState, useCallback, Fragment, useEffect, useRef } from 'react';

import { Modal, Spin, Form, Input } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import { customAttribute } from '@/services/purchaseRequisitionCreationService';

const FormItem = Form.Item;
const commonPrompt = 'sprm.common.model.common';

const useSetState = (initialState) => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    (newState) => {
      set((prevState) => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

export const ItemCustom = ({
  record: { itemId = '', prLineId = '', _status },
  // customMadeFlag,
  disabled,
  record,
}) => {
  const inputEl = useRef(null);
  const [state, setState] = useSetState({
    data: [],
    visible: false,
    loading: false,
  });

  const { loading, data, visible } = state;

  const inputElMouseenter = useCallback(() => {
    if (itemId && !loading) {
      setState({ loading: true });
      customAttribute({
        itemId,
        prLineId: _status === 'create' ? null : prLineId,
        customMadeFlag: 1,
      }).then((res) => {
        if (res && res.failed) {
          notification.error({ message: res.message });
        }
        if (res && !res.failed) {
          const currentData = res
            ? res.map((ele) => ({
                ...ele,
                _status: ['create', 'update'].includes(_status) && !disabled ? 'update' : undefined,
              }))
            : [];
          setState({
            loading: false,
            visible: true,
            data: currentData,
          });
        }
      });
    }
  }, [itemId, prLineId, loading]);

  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.addEventListener('click', inputElMouseenter);
    }
  }, [itemId, prLineId]);

  const handleOk = () => {
    if (['create', 'update'].includes(_status) && !disabled) {
      const prLineListTem = getEditTableData(data);
      record.$form.registerField('customAttributeList');
      record.$form.setFieldsValue({
        customAttributeList: prLineListTem,
      });
    }
    setState({ visible: false });
  };

  const handleCancel = useCallback(() => {
    setState({ visible: false });
  }, []);

  return (
    <Fragment>
      <a ref={inputEl}>{intl.get('sprm.common.itemcustom.special').d('定制属性')}</a>
      <Modal visible={visible} onOk={handleOk} onCancel={() => handleCancel()}>
        <Content {...{ loading, data, _status }} />
      </Modal>
    </Fragment>
  );
};

const Content = formatterCollections({
  code: ['sprm.common', 'entity.company'],
})(({ loading, data }) => {
  const columns = [
    {
      title: intl.get(`${commonPrompt}.componentName`).d('属性名称'),
      dataIndex: 'attributeName',
      width: 120,
      render: (val, record) =>
        ['create', 'update'].includes(record._status) ? (
          <FormItem>
            {record.$form.getFieldDecorator(`attributeName`, {
              initialValue: val,
            })(<span>{val}</span>)}
          </FormItem>
        ) : (
          val
        ),
    },
    {
      title: intl.get(`${commonPrompt}.cpValue`).d('属性值'),
      dataIndex: 'attributeValue',
      render: (val, record) =>
        ['create', 'update'].includes(record._status) ? (
          <FormItem>
            {record.$form.getFieldDecorator(`attributeValue`, {
              initialValue: val,
            })(<Input />)}
          </FormItem>
        ) : (
          val
        ),
      width: 100,
    },
  ];

  return (
    <Spin spinning={loading}>
      <EditTable
        bordered
        columns={columns}
        rowKey="prLineId"
        dataSource={data}
        pagination={false}
      />
    </Spin>
  );
});
