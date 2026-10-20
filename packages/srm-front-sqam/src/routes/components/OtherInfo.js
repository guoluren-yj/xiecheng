/* eslint-disable no-useless-constructor */
import React, { Component } from 'react';
import { Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { sum, throttle } from 'lodash';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { addItemToPagination, getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';
import Import from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SQAM } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';

const prefix = `sqam.common.model.qualityRectification`;
const tenantId = getCurrentOrganizationId();

@connect(({ create8D }) => ({
  create8D,
}))
export default class OtherInfo extends Component {
  constructor(props) {
    super(props);
  }

  @Bind
  handleAdd() {
    const { namespaceKey, dispatch, create8D, detailInfo } = this.props;
    let { detail } = create8D;
    if (namespaceKey) {
      detail = detailInfo;
    }
    const { lineList = [], otherInfoPagination = {} } = detail;
    const max = Math.max(...lineList.map((item) => item.lineNum));

    const newLineList = [
      {
        _status: 'create',
        otherInfoId: uuidv4(),
        lineNum: Number.isFinite(max) ? max + 1 : 1,
      },
      ...lineList,
    ].sort((a, b) => {
      return a.lineNum - b.lineNum;
    });
    const data = {
      ...detail,
      lineList: newLineList,
      otherInfoPagination: addItemToPagination(lineList.length, otherInfoPagination),
    };
    dispatch({
      type: namespaceKey ? `${namespaceKey}/updateState` : 'create8D/updateState',
      payload: {
        detail: data,
        basicInfo: data,
      },
    });
  }

  @Bind
  handleRowSelect(selectedRowKeys, selectedRows) {
    this.props.onSelectRow(selectedRowKeys, selectedRows, 'otherInfo');
  }

  componentWillUnmount() {
    const {
      create8D: { detail = {} },
      dispatch,
    } = this.props;
    dispatch({
      type: 'create8D/updateState',
      payload: {
        detail: {
          ...detail,
          lineList: [],
          otherInfoPagination: {},
        },
      },
    });
  }

  @Bind()
  headerBtnsRender() {
    const {
      readOnly = true,
      deleteLoading,
      loading,
      onRemove = (e) => e,
      selectedRowKeys = [],
      handleSearch,
      problemHeaderId,
      importFlag,
      code,
      camp = 'purchase',
    } = this.props;
    const isLoading = deleteLoading || loading;

    const btns = [
      !readOnly && {
        name: 'create',
        child: intl.get(`${prefix}.add`).d('新增'),
        btnProps: {
          icon: 'plus',
          onClick: throttle(this.handleAdd, 1500, { trailing: false }),
          loading: isLoading,
          style: { marginRight: 16 },
        },
      },
      !readOnly && {
        name: 'delete',
        child: intl.get(`${prefix}.del`).d('删除'),
        btnProps: {
          icon: 'delete',
          onClick: throttle(onRemove, 1500, { trailing: false }),
          loading: isLoading,
          disabled: selectedRowKeys.length === 0,
          style: { marginRight: 16 },
        },
      },
      importFlag && {
        name: 'newImport',
        btnComp: Import,
        childFor: 'buttonText',
        child: intl.get('hzero.common.button.newImport').d('(新)导入'),
        btnProps: {
          businessObjectTemplateCode:
            camp === 'supplier'
              ? 'SQAM.PROBLEM_SUP_DETAIL_LINE_IMPORT'
              : 'SQAM.PROBLEM_DETAIL_LINE_IMPORT',
          buttonProps: {
            icon: 'archive',
            loading,
            style: { marginRight: 16 },
          },
          prefixPatch: '/sqam',
          args: {
            tenantId,
            templateCode:
              camp === 'supplier'
                ? 'SQAM.PROBLEM_SUP_DETAIL_LINE_IMPORT'
                : 'SQAM.PROBLEM_DETAIL_LINE_IMPORT',
            problemHeaderId,
          },
          successCallBack: () => {
            if (handleSearch) handleSearch();
          },
        },
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: intl.get('hzero.common.button.newExport').d('(新)导出'),
        btnProps: {
          otherButtonProps: {
            icon: 'unarchive',
            loading: isLoading,
          },
          requestUrl:
            camp === 'supplier'
              ? `${SRM_SQAM}/v1/${tenantId}/edproblemheaderdetaillines/detail/supplier/export/${problemHeaderId}/new`
              : `${SRM_SQAM}/v1/${tenantId}/edproblemheaderdetaillines/detail/export/${problemHeaderId}/new`,
          queryParams: {
            problemHeaderId,
            customizeUnitCode: code,
          },
          templateCode:
            camp === 'supplier' ? 'SQAM_ED_SUP_PROBLEM_DETAIL_LINE' : 'SQAM_ED_PROBLEM_DETAIL_LINE',
          method: 'POST',
          allBody: true,
          exportAsync: false,
        },
      },
    ];

    return btns;
  }

  render() {
    const {
      remote,
      readOnly = true,
      dataSource = [],
      selectedRowKeys = [],
      deleteLoading,
      loading,
      customizeTable,
      code,
      custLoading,
      customizeBtnGroup,
      btnCustomCode,
    } = this.props;
    const cols = [
      {
        title: intl.get(`sqam.common.model.common.displayNumber`).d('行号'),
        dataIndex: 'lineNum',
        width: 120,
      },
    ];
    const columns = remote
    ?remote.process("SQAM_COMPONENTS_OTHER_INFO_TABLE_COLUMNS",cols,{_this:this})
    :cols;
    const isLoading = deleteLoading || loading;
    return (
      <React.Fragment>
        <Row>
          <Col>
            <div className="table-groupMember-operator" style={{ marginBottom: 16 }}>
              {customizeBtnGroup(
                { code: btnCustomCode, pro: true },
                <DynamicButtons buttons={this.headerBtnsRender()} />
              )}
            </div>

            {customizeTable(
              {
                code,
                custLoading,
                clearCache: (a, b, cb) => {
                  if (a !== b) {
                    cb(a);
                  }
                },
              },
              <EditTable
                bordered
                loading={isLoading}
                rowKey="otherInfoId"
                pagination={false} // 去掉分页，目前分页无效，lineList是放到头信息里面的一个字段
                dataSource={dataSource}
                columns={columns}
                rowSelection={
                  readOnly
                    ? null
                    : {
                        selectedRowKeys,
                        onChange: this.handleRowSelect,
                      }
                }
                scroll={{ x: sum(columns.map((n) => n.width)) + 400 }}
              />
            )}
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}
