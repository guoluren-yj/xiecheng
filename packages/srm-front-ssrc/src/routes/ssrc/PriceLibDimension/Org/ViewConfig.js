import React, { PureComponent } from 'react';
import { TextField } from 'choerodon-ui/pro';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { Bind } from 'lodash-decorators';
import { Popconfirm } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';

export default class ViewConfig extends PureComponent {
  /**
   * 编辑
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelEdit(record) {
    record.setState('editAble', true);
  }

  /**
   * 取消
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handleCancel(record) {
    record.reset();
    record.setState('editAble', false);
  }

  render() {
    const { tableDs, enabledEdit } = this.props;
    const columns = [
      {
        name: 'lineNum',
        width: 80,
        align: 'left',
        editor: (record) => record.status === 'add' || enabledEdit,
      },
      {
        name: 'viewCode',
        width: 120,
        editor: (record) => {
          if (record.status === 'add') {
            return <TextField name="viewCode" restrict="a-zA-Z0-9-_" />;
          }
        },
      },
      {
        name: 'viewName',
        width: 120,
        editor: (record) => record.status === 'add' || enabledEdit,
      },
      {
        name: 'viewIndicesLov',
        width: 200,
        editor: (record) =>
          (record.status === 'add' || enabledEdit) && !record.get('hasDataFlag'),
      },
      {
        name: 'viewRuleCode',
        width: 200,
        editor: (record) =>
          (record.status === 'add' || enabledEdit) && !record.get('hasDataFlag'),
      },
      {
        name: 'invalidFlag',
        width: 140,
        editor: (record) => record.status === 'add' || enabledEdit,
        ...!enabledEdit && {
          renderer: ({ value }) => yesOrNoRender(value),
        },
      },
      // enabledEdit && {
      //   header: intl.get('hzero.common.edit').d('编辑'),
      //   width: 100,
      //   renderer: ({ record }) => {
      //     if (record.status !== 'add' && !enabledEdit) {
      //       return (
      //         <Popconfirm
      //           title={intl
      //             .get('ssrc.priceLibDimension.view.message.viewCoedEditWarning')
      //             .d('修改【视图索引】将会清空现有价格视图，并重建视图，请谨慎修改【视图索引】！')}
      //           onConfirm={() => this.handelEdit(record)}
      //           okText={intl.get('hzero.common.button.confirm').d('确认')}
      //           cancelText={intl.get('hzero.common.view.button.cancel').d('取消')}
      //         >
      //           <a onClick={()=>this.handelEdit(record)}>{intl.get('hzero.common.button.editor').d('编辑')}</a>
      //         </Popconfirm>
      //       );
      //     } else if (enabledEdit) {
      //       return (
      //         <a onClick={() => this.handleCancel(record)}>
      //           {intl.get('hzero.common.view.button.cancel').d('取消')}
      //         </a>
      //       );
      //     }
      //  },
      // },
    ];

    const buttons = ['add', ['delete', { icon: 'delete_sweep', children: intl.get(`hzero.common.button.batchdelete`).d('批量删除') }]];

    return (
      <FilterBarTable
        style={{ maxHeight: 'calc(100vh - 190px)' }}
        customizable
        customizedCode='SSRC.PRICE_LIB_DIMENSION.VIEW_CONFIG'
        dataSet={tableDs}
        columns={columns}
        buttons={enabledEdit && buttons}
        queryFieldsLimit={2}
        filterBarConfig={{
          autoQuery: false,
          collpaseble: !!enabledEdit,
          sortFieldName: 'orderField',
          defaultSortedField: 'lineNum',
          defaultSortedOrder: 'asc',
        }}
      />
    );
  }
}
