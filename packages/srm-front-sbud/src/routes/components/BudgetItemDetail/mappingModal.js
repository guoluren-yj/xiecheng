/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-05-18 10:34:41
 * @LastEditors: yanglin
 * @LastEditTime: 2022-06-17 13:42:25
 */
import React from 'react';
import { Modal, Form, TextArea } from 'choerodon-ui/pro';
import intl from 'utils/intl';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = function Index(props) {
  const openModal = () => {
    const { name, record, disabled = false } = props;
    const oldValue = record.get(name);

    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '450px' },
      title: intl.get(`${commonPrompt}.complexSqlMapping`).d('复杂sql映射'),
      children: (
        <>
          <Form record={record} columns={1} labelLayout="float" useColon={false}>
            <TextArea name={name} disabled={disabled} />
          </Form>
        </>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      onCancel: () => {
        record.set({
          [name]: oldValue,
        });
      },
    });
  };

  return (
    <div>
      <a onClick={() => openModal()}> {intl.get(`${commonPrompt}.viewMapping`).d('查看映射')} </a>
    </div>
  );
};

export default Index;
