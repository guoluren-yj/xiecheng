/*
 * HttpConfigModal - http配置弹窗
 * @date: 2019-12-3
 * @author: hulingfangzi <lingfangzi.hu01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, DataSet, Select } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import notification from 'hzero-front/lib/utils/notification';
import { editTableDS } from '@/stores/Services/httpConfigDS';
import getLang from '@/langs/serviceLang';

export default class HttpConfigModal extends PureComponent {
  selectedCodes = [];

  constructor(props) {
    super(props);
    this.editTableDS = new DataSet(editTableDS());
    this.state = {
      // 删除后台数据需要设置该deleteFlag为1
      needDeletedParams: [],
    };
  }

  componentDidMount() {
    const { dataSource = [] } = this.props;
    const needDeletedParams = dataSource.filter((data) => data.deleteFlag === 1);
    this.editTableDS.loadData(dataSource.filter((data) => data.deleteFlag !== 1));
    this.props.modal.update({
      onOk: this.handleOk,
    });
    this.setState({ needDeletedParams });
  }

  @Bind()
  async handleOk() {
    const validate = await this.editTableDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { onCallBack = () => {} } = this.props;
    const { needDeletedParams } = this.state;
    // 删除的数据需要一并回传
    onCallBack([...this.editTableDS.toData(), ...needDeletedParams]);
  }

  /**
   * 删除行
   * @param {object} record - 行数据
   */
  @Bind()
  async handleDelete(record) {
    const { needDeletedParams } = this.state;
    await this.editTableDS.delete(record, false);
    // 删除后台数据需要设置deleteFlag为1
    if (record.get('httpConfigId')) {
      needDeletedParams.push({ ...record.toData(), deleteFlag: 1 });
    }
    this.setState({ needDeletedParams });
  }

  @Bind()
  handleOptionFilter(record) {
    const existPropertCodes = this.editTableDS.toData().map((item) => item.propertyCode);
    return !existPropertCodes.includes(record.get('value'));
  }

  get editColumns() {
    const { readOnly } = this.props;
    return [
      {
        title: getLang('HTTP_PARAM_NAME'),
        name: 'propertyCode',
        width: 180,
        editor: !readOnly && <Select optionsFilter={this.handleOptionFilter} />,
      },
      {
        title: getLang('HTTP_PARAM_VALUE'),
        name: 'propertyValue',
        editor: !readOnly,
      },
      !readOnly && {
        title: getLang('OPERATOR'),
        width: 60,
        align: 'center',
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'delete',
              ele: (
                <ButtonPermission type="text" onClick={() => this.handleDelete(record)}>
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ];
  }

  render() {
    const { readOnly } = this.props;
    return (
      <Table
        dataSet={this.editTableDS}
        columns={this.editColumns}
        buttons={readOnly ? [] : ['add']}
      />
    );
  }
}
