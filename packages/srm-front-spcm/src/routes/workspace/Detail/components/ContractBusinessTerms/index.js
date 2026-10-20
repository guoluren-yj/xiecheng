// 采购协议业务条款
import React, { Component, Fragment } from 'react';
import { Table, TextArea, Select, Button, Lov, DataSet } from 'choerodon-ui/pro';
import querystring from 'querystring';
import { withRouter } from 'react-router-dom';
import { renderCompareColumns, renderStatus } from '@/utils/renderer';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';

const HeaderButtons = observer(({ _this, customizeBtnGroup, businessTermsDs, pcTypeId }) => {
  const buttonCommonProps = {
    color: 'primary',
    funcType: 'flat',
  };

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
                ?.filter(item => item.termTypeCode)
                .map(item => item.termTypeCode)
                .toString(),
            };
          },
        },
      },
    ],
  });

  return customizeBtnGroup(
    {
      code: 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS.BTN_GROUP',
    },
    [
      <Lov
        key="pcTermType"
        name="pcTermType"
        multiple
        mode="button"
        noCache
        clearButton={false}
        data-name="add"
        icon="playlist_add"
        onChange={data => _this.handleCreate(data, pcTermTypeDS)}
        dataSet={pcTermTypeDS}
        tableProps={{ selectionMode: 'rowbox' }} // 勾选模式为 rowbox
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </Lov>,
      <Button
        data-name="delete"
        disabled={isEmpty(businessTermsDs.selected)}
        onClick={_this.handleDelete}
        icon="delete_sweep"
        {...buttonCommonProps}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>,
    ]
  );
});

@withRouter
export default class ContractBusinessTerms extends Component {
  handleGetCode() {
    const {
      match: { path },
      location: { search },
      custCode,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (custCode) {
      return custCode;
    }
    if (
        path.includes('/spcm/contract-workspace/update') ||
        routerParams.hasChanged === 'true' ||
        path.includes('/spcm/contract-workspace/intelligent/')
      ) {
      return 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS';
    } else {
      return 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS.READONLY';
    }
  }

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
    const { editable, currentMode, differeFlag } = this.props;
    const columns = [
      differeFlag && {
        name: 'objectFlagMeaning',
        width: 120,
        renderer: ({ record, value }) => renderStatus(record.get('objectFlag'), value, 'change'),
      },
      {
        name: 'termTypeCode',
        width: 200,
      },
      {
        name: 'termTypeName',
        width: 200,
        // editor: editable,
      },
      {
        name: 'termContent',
        width: 300,
        tooltip: 'overflow',
        renderer: ({ record, text, value }) =>
          value && record.get('termType') === 'LOV' && !editable
            ? record.get('termTypeList')?.find((term) => term.value === value)?.meaning
            : text,
        editor: this.handleTermContent,
      },
      {
        name: 'remark',
        width: 200,
        tooltip: 'overflow',
      },
    ].filter(Boolean);
    return renderCompareColumns(columns, { currentMode, differeFlag });
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
    const {
      businessTermsDs,
      customizeTable,
      editable,
      headerInfo = {},
      customizeBtnGroup = () => {},
    } = this.props;
    const { pcTypeId } = headerInfo;

    return (
      <Fragment>
        {customizeTable(
          {
            code: this.handleGetCode(),
            // 业务条款的业务对象无法添加个性化字段，所以此处不用考虑个性化对比的情况
            // extTextRenderIntercept: currentMode
            //   ? (...extParam) => extTextRender(extParam, currentMode)
            //   : null,
          },
          <Table
            style={{ maxHeight: 430 }}
            dataSet={businessTermsDs}
            columns={this.renderColumns()}
            buttons={
              editable && [
                <HeaderButtons
                  _this={this}
                  customizeBtnGroup={customizeBtnGroup}
                  businessTermsDs={businessTermsDs}
                  pcTypeId={pcTypeId}
                />,
              ]
            }
          />
        )}
      </Fragment>
    );
  }
}
