/*
 * @Author: yitian.mao@going-link.com
 * @Date: 2022-03-21 12:23:53
 * @Description:
 */
import React, { Component } from 'react';
import { Table, Lov, TextArea, Select, DataSet, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import styles from '../index.less';

export default class ContractBusinessTerms extends Component {
  handleTermContent = (record) => {
    const { editable } = this.props;
    const termType = record.get('termType');
    switch (termType) {
      case 'VARCAHR':
      case 'TEXT':
        return editable && <TextArea />;
      case 'LOV':
        return editable && <Select searchable />;
      default:
        return editable;
    }
  };

  renderColumns() {
    const { editable } = this.props;
    const columns = [
      {
        name: 'termTypeCode',
        width: '11%',
      },
      {
        name: 'termTypeName',
        width: '31%',
        // editor: editable,
      },
      {
        name: 'termContent',
        width: '41%',
        tooltip: 'overflow',
        renderer: ({ record, text, value }) =>
          value && record.get('termType') === 'LOV' && !editable
            ? record.get('termTypeList')?.find((term) => term.value === value)?.meaning
            : text,
        editor: this.handleTermContent,
      },
      {
        name: 'remark',
        width: '16%',
        tooltip: 'overflow',
      },
    ];
    return columns;
  }

  @Bind()
  handleCreate(data, pcTermTypeDS) {
    const { businessTermsDs } = this.props;
    data.forEach((item) => {
      const {
        termTypeCode,
        termTypeName,
        termContentDefault: termContent,
        remark,
        termType,
        termTypeId,
        termTypeLov,
        termTypeList,
        nullableFlag,
      } = item;
      businessTermsDs.create(
        {
          termTypeCode,
          termTypeName,
          termContent,
          remark,
          termType,
          termTypeId,
          termTypeLov,
          termTypeList,
          nullableFlag,
        },
        0
      );
    });
    pcTermTypeDS.clearCachedSelected();
    pcTermTypeDS.unSelectAll();
    pcTermTypeDS.reset();
  }

  /**
   * 删除
   */
  @Bind()
  async handleDelete() {
    const { businessTermsDs } = this.props;
    const selectedRows = businessTermsDs.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    businessTermsDs.remove(newAddRows);
    // 删除线上数据
    await businessTermsDs.delete(existedRows, {
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
  }

  render() {
    const { editable, businessTermsDs, headerInfo = {}, customizeBtnGroup = () => {} } = this.props;
    const { pcTypeId } = headerInfo;
    const HeaderButtons = observer(() => {
      const pcTermTypeDS = new DataSet({
        fields: [
          {
            name: 'pcTermType',
            type: 'object',
            lovCode: 'SPCM.PC_TERM_TYPE',
            dynamicProps: {
              lovPara: () => {
                return {
                  pcTypeId,
                  excludeTermCodes: businessTermsDs
                    ?.toData()
                    ?.filter((item) => item.termTypeCode)
                    .map((item) => item.termTypeCode)
                    .toString(),
                };
              },
            },
          },
        ],
      });

      return customizeBtnGroup(
        {
          code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.BUSINESSTERMS.BTN_GROUP',
        },
        [
          <Button
            data-name="delete"
            disabled={isEmpty(businessTermsDs.selected)}
            onClick={this.handleDelete}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>,
          <Lov
            name="pcTermType"
            multiple
            color="primary"
            mode="button"
            noCache
            clearButton={false}
            data-name="create"
            onChange={(data) => this.handleCreate(data, pcTermTypeDS)}
            dataSet={pcTermTypeDS}
            tableProps={{ selectionMode: 'rowbox' }} // 勾选模式为 rowbox
          >
            {intl.get('hzero.common.btn.add').d('新增')}
          </Lov>,
        ]
      );
    });
    return (
      <>
        {editable && (
          <div className={styles['btn-wrapper']}>
            <HeaderButtons />
          </div>
        )}
        <Table dataSet={businessTermsDs} columns={this.renderColumns()} />
      </>
    );
  }
}
