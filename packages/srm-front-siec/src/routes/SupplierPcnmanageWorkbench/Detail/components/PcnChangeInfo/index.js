import React, { Component, Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { SRM_SIEC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
import CommonImport from 'hzero-front/lib/components/Import';
import { observer } from 'mobx-react-lite';
import DynamicButtons from '_components/DynamicButtons';

export default class PcnChangeInfo extends Component {
  @Bind()
  lineAdd() {
    const { tableDs } = this.props;
    tableDs.create({}, 0);
  }

  @Bind()
  lineDelete() {
    const { tableDs } = this.props;
    const { selected = [] } = tableDs;
    tableDs.delete(selected);
  }

  @Bind()
  getColumns() {
    const { editableFlag, pageFlags } = this.props;
    const { searchFlag, approveFlag, sqeApproveFlag } = pageFlags;
    const creatFlag = !(searchFlag || approveFlag || sqeApproveFlag); // 新建页面标识
    const currentEditableFlag = editableFlag && creatFlag;
    const columns = {
      base: [
        {
          name: 'lineNum',
          width: 80,
          // renderer: ({ record }) => record.index + 1,
        },
        {
          name: 'itemId',
          width: 180,
          editor: currentEditableFlag,
        },
        {
          name: 'itemName',
          width: 180,
          editor: currentEditableFlag,
        },
        {
          name: 'industryCategoryId',
          width: 180,
          editor: currentEditableFlag,
        },
        {
          name: 'uomName',
          width: 180,
          editor: false,
        },
        {
          name: 'supplierInventoryQuantity',
          width: 180,
          editor: currentEditableFlag,
        },
        {
          name: 'supplierProcessingMethod',
          width: 180,
          editor: currentEditableFlag,
        },
        {
          name: 'supplierRemark',
          width: 180,
          editor: currentEditableFlag,
        },
      ],
      read: [
        {
          name: 'buyerInventoryQuantity',
          width: 180,
          editor: approveFlag || sqeApproveFlag,
        },
        {
          name: 'buyerProcessingMethod',
          width: 180,
          editor: approveFlag || sqeApproveFlag,
        },
        {
          name: 'buyerRemark',
          width: 180,
          editor: approveFlag || sqeApproveFlag,
        },
      ],
      attach: [
        {
          name: 'attachmentUuid',
          editor: currentEditableFlag,
        },
      ],
    };
    return searchFlag || approveFlag || sqeApproveFlag
      ? columns.base.concat(columns.read, columns.attach)
      : columns.base.concat(columns.attach);
  }

  @Bind()
  buttons() {
    const { tableDs, editableFlag, pageFlags, pcnHeaderId } = this.props;
    const { searchFlag, approveFlag, sqeApproveFlag } = pageFlags;
    const creatFlag = !(searchFlag || approveFlag || sqeApproveFlag); // 新建页面标识
    const currentEditableFlag = editableFlag && creatFlag;
    const Buttons = observer(({ dataSet }) => {
      const btns = currentEditableFlag
        ? [
            {
              name: 'create',
              btnType: 'c7n-pro',
              child: intl.get('hzero.common.button.new').d('新建'),
              btnProps: {
                funcType: 'flat',
                color: 'primary',
                icon: 'playlist_add',
                onClick: () => this.lineAdd(),
              },
            },
            {
              name: 'delete',
              btnType: 'c7n-pro',
              child: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
              btnProps: {
                funcType: 'flat',
                color: 'primary',
                icon: 'delete_sweep',
                onClick: () => this.lineDelete(),
                disabled: isEmpty(dataSet?.selected),
              },
            },
            {
              name: 'newImport',
              group: true,
              child: (
                <CommonImport
                  businessObjectTemplateCode="SRM_C_SRM_SIEC_PCN_HEADER_DETAIL_LINE_IMPORT"
                  prefixPatch={SRM_SIEC}
                  refreshButton
                  buttonText={intl.get(`hzero.common.view.title.batchImport`).d('批量导入')}
                  args={{
                    tenantId: getCurrentOrganizationId(),
                    templateCode: 'SRM_C_SRM_SIEC_PCN_HEADER_DETAIL_LINE_IMPORT',
                    pcnHeaderId,
                  }}
                  buttonProps={{
                    icon: 'archive',
                    type: 'c7n-pro',
                    funcType: 'flat',
                  }}
                  successCallBack={() => {
                    tableDs.query();
                  }}
                />
              ),
            },
          ]
        : [];
      return <DynamicButtons buttons={btns.filter((i) => !i.hidden)} />;
    });
    return [<Buttons dataSet={tableDs} />];
  }

  render() {
    const { tableDs, editableFlag, pageFlags, customizeTable } = this.props;
    const { searchFlag, approveFlag, sqeApproveFlag } = pageFlags;
    const creatFlag = !(searchFlag || approveFlag || sqeApproveFlag); // 新建页面标识
    const currentEditableFlag = editableFlag && creatFlag;
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SIEC.SUPPIER_PCN_MANAGEWORK_BENCH_DETAI.LINE',
            dataSet: tableDs,
            custLoading: false,
          },
          <Table
            dataSet={tableDs}
            columns={this.getColumns()}
            buttons={currentEditableFlag && this.buttons()}
            // style={{ maxHeight: `calc(100% - 70px)` }}
            style={{ maxHeight: 530 }}
            selectionMode={currentEditableFlag ? 'rowbox' : 'none'}
          />
        )}
      </Fragment>
    );
  }
}
