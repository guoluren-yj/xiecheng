/**
 * index.js
 * 适配器列表
 * @date: 2020-12-30
 * @author: guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { DataSet, Modal, TextArea, Form } from 'choerodon-ui/pro';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_PLATFORM } from '_utils/config';

import styles from './modal.less';

const DS = {
  autoQuery: false,
  dataToJSON: 'all',
  fields: [
    {
      name: 'retrieveId',
      type: 'string',
    },
    {
      name: 'content',
      type: 'string',
    },
    {
      name: 'confirmRemark',
      type: 'string',
      label: intl
        .get('spfm.enterpriseRecovery.model.enterpriseRecovery.inputReason')
        .d('请输入申诉原因'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_PLATFORM}/v1/company-retrieves/popup-notifier`,
        method: 'GET',
      };
    },
    submit: (a = {}) => {
      const { dataSet = {} } = a;
      const { queryParameter = {} } = dataSet;
      const { params = {} } = queryParameter;
      const { retrieveId, ...otherParams } = params;
      return {
        url: `${SRM_PLATFORM}/v1/company-retrieves/confirm/${retrieveId}`,
        method: 'POST',
        data: otherParams,
      };
    },
  },
};

class A extends React.Component {
  async componentDidMount() {
    const { ds } = this.props.valueDs;
    const result = await ds.query();
    if (result && result.length > 0) {
      result.forEach((item) => {
        this.handleModalOpen(item);
      });
    }
  }

  handlePassModal = ({ modal, retrieveId }) => {
    const { ds } = this.props.valueDs;
    Modal.open({
      className: styles.customerM,
      key: Modal.key(),
      title: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.reason').d('申诉原因'),
      children: (
        <Form dataSet={ds} labelLayout="float" columns={1}>
          <TextArea resize="both" name="confirmRemark" />
        </Form>
      ),
      style: { width: 448 },
      // footer: false,
      onOk: () => {
        const results = ds.toJSONData();
        const { confirmRemark } = results[0] || {};
        ds.setQueryParameter('params', { confirmRemark, confirmResult: 0, retrieveId });
        ds.submit();
        modal.close();
        ds.reset();
        return true;
      },
      closable: true,
      okFirst: true,
    });
  };

  handleModalOpen = (result = {}) => {
    const { ds } = this.props.valueDs;
    const { content = '', retrieveId } = result;
    const modal = Modal.open({
      className: styles.customerM,
      key: Modal.key(),
      title: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.appeal').d('企业找回申诉'),
      children: <div>{content}</div>,
      style: { width: 648 },
      // footer: false,
      okText: intl
        .get('spfm.enterpriseRecovery.model.enterpriseRecovery.yesAppeal')
        .d('有异议，需申诉'),
      cancelText: intl
        .get('spfm.enterpriseRecovery.model.enterpriseRecovery.noAppeal')
        .d('已悉知，无异议'),
      onCancel: () => {
        ds.setQueryParameter('params', { confirmResult: 1, retrieveId });
        ds.submit();
        return true;
      },
      onOk: () => {
        this.handlePassModal({ modal, retrieveId });
        return false;
      },
      okFirst: true,
      closable: true,
    });
  };

  render() {
    return null;
  }
}

export default formatterCollections({
  code: [
    'spfm.enterpriseRecovery',
    'hzero.common',
    'spfm.configServer',
    'entity.tenant',
    'entity.supplier',
  ],
})(
  withProps(
    () => {
      const ds = new DataSet(DS);
      const valueDs = {
        ds,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(A)
);
