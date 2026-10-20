/**
 * PurBusCheckRules -采购事务类型校验规则配置
 * @date: 2020-4-12
 * @author JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Modal, Button, Form, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty, isNumber, sum } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import EditTable from 'components/EditTable';

import styles from './index.less';
@connect(({ loading, configServer }) => ({
  loading: loading.effects['configServer/fetchReceiveTrxType'],
  saveLoading: loading.effects['configServer/saveRcvTrxType'],
  configServer,
}))
export default class PurchaseTransModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.fetchRcvTrxTypeList();
  }

  @Bind()
  fetchRcvTrxTypeList(params = {}) {
    const { dispatch } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'configServer/fetchReceiveTrxType',
      payload: {
        isUpdate: true,
        organizationId,
        page: isEmpty(params) ? {} : params,
      },
    });
  }

  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('purBusCheckRulesVisible', false);
    }
  }

  /**
   * 保存
   */
  @Bind()
  handleSaveData() {
    const {
      dispatch,
      configServer: {
        trxTypeList: { content = [] },
        trxTypePagination = {},
      },
    } = this.props;
    const params = getEditTableData(content, ['rcvTrxTypeId']);
    const endParams = params.map((item, index, arr) => {
      const {
        externalSystemCode,
        externalSystemName,
        refTrxTypeId,
        refTrxTypeCode,
        ...otherValues
      } = item;
      const flagIndex = content.findIndex(o => {
        return o.rcvTrxTypeId === arr[index].rcvTrxTypeId;
      });
      const externalSystem =
        externalSystemCode && (externalSystemCode !== 'SRM') === externalSystemName
          ? content[flagIndex].externalSystemCode
          : externalSystemCode;
      const refTrxType =
        refTrxTypeId === refTrxTypeCode ? content[flagIndex].refTrxTypeId : refTrxTypeId;
      return {
        externalSystemCode: externalSystem,
        externalSystemName,
        refTrxTypeId: refTrxType,
        refTrxTypeCode,
        ...otherValues,
      };
    });
    dispatch({
      type: 'configServer/saveRcvTrxType',
      payload: [...endParams],
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchRcvTrxTypeList(trxTypePagination);
      }
    });
  }

  render() {
    const {
      loading,
      saveLoading,
      visible,
      configServer: { trxTypeList = {}, trxTypePagination = {} },
    } = this.props;
    const { content: dataSource = [] } = trxTypeList;
    const columns = [
      {
        title: intl.get('spfm.configServer.model.purchaser.enableCheck').d('是否启用校验'),
        dataIndex: 'validateFlag',
        width: 110,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('validateFlag', {
                  initialValue: record.validateFlag,
                })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
              </Form.Item>
            );
          } else {
            return <Checkbox checked={val} value={val} disabled />;
          }
        },
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.sourceCode`).d('数据来源'),
        dataIndex: 'sourceCode',
        width: 150,
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.rcvTrxTypeCode`).d('事务类型编码'),
        dataIndex: 'rcvTrxTypeCode',
        width: 150,
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.rcvTrxTypeName`).d('事务类型名称'),
        dataIndex: 'rcvTrxTypeName',
        width: 150,
      },
      {
        title: intl
          .get(`spfm.configServer.model.purchaser.refTrxTypeName`)
          .d('对应SRM事务类型名称'),
        dataIndex: 'refTrxTypeName',
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0))) + 300;
    return (
      <Modal
        title={intl
          .get('spfm.configServer.model.purchaser.view.purBusCheckRules.title')
          .d('采购事务类型校验规则配置')}
        visible={visible}
        footer={null}
        width={1000}
        onCancel={this.hideModal}
      >
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button type="primary" onClick={() => this.handleSaveData()} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
        <EditTable
          bordered
          className={styles['purchase-trans-modal']}
          scroll={{ x: scrollX }}
          loading={loading || saveLoading}
          rowKey="rcvTrxTypeId"
          dataSource={dataSource}
          columns={columns}
          pagination={trxTypePagination}
          onChange={page => this.fetchRcvTrxTypeList(page)}
        />
      </Modal>
    );
  }
}
