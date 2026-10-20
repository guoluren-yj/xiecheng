import React, { Component, Fragment } from 'react';
import { Table, Select, NumberField } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { queryMapIdpValue } from 'services/api';
import notification from 'utils/notification';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

export default class ModalChildren extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldTypeOpts: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const { configureDs } = this.props;
    this.fetchOpts();
    configureDs.query();
  }

  /**
   * 新建
   */
  @Bind()
  async fetchOpts() {
    const opts = await getResponse(
      queryMapIdpValue({
        fieldTypeOpts: 'SPCM.TEMPLATE_LIST_FORMAT',
      })
    );
    this.setState({ ...opts });
  }

  @Bind()
  handleChangeOpts(currentField, value, setFields, record) {
    const { fieldTypeOpts } = this.state;
    let selectItem = null;
    switch (currentField) {
      case 'tempName':
        selectItem = fieldTypeOpts.find((item) => item.value === value);
        break;
      default:
        break;
    }
    const fields = setFields.reduce(
      (obj, { key, value: val }) => ({ ...obj, [key]: selectItem ? selectItem[val] : null }),
      {}
    );
    record.set(fields);
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    const { tenantId } = this.state;
    const { pcTypeId } = this.props;
    this.props.configureDs.create(
      {
        tenantId,
        pcTypeId,
        enabledFlag: true,
        isEdit: true,
        status: 'add',
      },
      Infinity
    );
  }

  // /**
  //  * 删除
  //  */
  // @Bind()
  // async handleDelete() {
  //   const { configureDs } = this.props;
  //   const selectedData = configureDs.selected;

  //   const newAddRows = selectedData.filter((s) => s.status === 'add') || [];
  //   const existedRows = selectedData.filter((s) => ['sync', 'update'].includes(s.status)) || [];

  //   // 删除本地数据
  //   configureDs.remove(newAddRows);
  //   // 删除线上数据
  //   const res = await configureDs.delete(existedRows);
  //   if (res && !res.failed) {
  //     configureDs.query();
  //   }
  // }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.props.configureDs.validate();
    if (flag) {
      const res = await this.props.configureDs.submit();
      if (res && !res.failed) {
        this.props.configureDs.query();
      }
    } else {
      notification.warning({
        message: intl.get('hzero.common.validation.notNull', {
          name: intl.get(`spcm.common.model.common.mandatoryField`).d('必填字段'),
        }),
      });
    }
  }

  @Bind()
  getEditable(record) {
    const { editable } = this.props;
    return editable && record.get('isEdit');
  }

  @Bind()
  getScreenDs(from) {
    const { configureDs } = this.props;
    const { fieldName, fieldDesc, enabledFlag, tempName, fieldType } = from;
    configureDs.setQueryParameter('fieldName', fieldName);
    configureDs.setQueryParameter('fieldDesc', fieldDesc);
    configureDs.setQueryParameter('enabledFlag', enabledFlag);
    configureDs.setQueryParameter('tempName', tempName);
    configureDs.setQueryParameter('fieldType', fieldType);
    configureDs.query();
  }

  render() {
    const { configureDs, editable } = this.props;

    const columns = [
      {
        name: 'fieldName',
        width: 180,
        editor: this.getEditable,
      },
      {
        name: 'tempName',
        width: 180,
        editor: (record) =>
          editable &&
          record.get('isEdit') && (
            <Select
              onChange={(value) =>
                this.handleChangeOpts(
                  'tempName',
                  value,
                  [{ key: 'tempDesc', value: 'meaning' }],
                  record
                )
              }
            />
          ),
      },
      {
        name: 'fieldType',
        width: 150,
        editor: this.getEditable,
      },
      {
        name: 'flexCode',
        width: 180,
        editor: this.getEditable,
      },
      {
        name: 'flexDesc',
        width: 180,
        editor: this.getEditable,
      },
      {
        name: 'fieldTypeFormat',
        width: 180,
        editor: this.getEditable,
      },
      {
        name: 'decimalPrecision',
        width: 180,
        align: 'left',
        editor: (record) =>
          editable &&
          record.get('isEdit') &&
          record.get('fieldName') &&
          record.get('fieldName')?.includes('Decimal'),
      },
      {
        name: 'fieldDesc',
        width: 180,
        editor: this.getEditable,
      },
      {
        name: 'multipleFlag',
        width: 150,
        editor: (record) => this.getEditable(record) && record.get('fieldType') !== 'text',
      },
      {
        name: 'enabledFlag',
        width: 100,
        editor: this.getEditable,
      },
      {
        name: 'operator',
        width: 100,
        renderer: ({ record }) =>
          record.get('status') !== 'add' &&
          editable && (
            <Fragment>
              {!record.get('isEdit') && (
                <a onClick={() => record.set('isEdit', true)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              {record.get('isEdit') && (
                <a
                  onClick={async () => {
                    if (await record.validate()) {
                      record.set('isEdit', false);
                    } else {
                      notification.warning({
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spcm.common.model.common.mandatoryField`).d('必填字段'),
                        }),
                      });
                    }
                  }}
                >
                  {intl.get(`hzero.common.button.cancel`).d('取消')}
                </a>
              )}
            </Fragment>
          ),
      },
    ];

    return (
      <Fragment>
        <Table
          dataSet={configureDs}
          buttons={
            editable && [
              ['add', { onClick: this.handleCreate }],
              ['save', { onClick: this.handleSave }],
              ['delete'],
            ]
          }
          columns={columns}
        />
      </Fragment>
    );
  }
}
