/* eslint-disable no-useless-constructor */
import React, { Component } from 'react';
import { Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { sum, throttle } from 'lodash';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { addItemToPagination } from 'utils/utils';
import EditTable from 'components/EditTable';
import DynamicButtons from '_components/DynamicButtons';

const prefix = `sqam.common.model.qualityRectification`;

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
    const { otherDetailList = [], otherInfoAPagination = {} } = detail;
    const max = Math.max(...otherDetailList.map((item) => item.otherLineNum));

    const newLineList = [
      {
        _status: 'create',
        otherDetailId: uuidv4(),
        otherLineNum: Number.isFinite(max) ? max + 1 : 1,
      },
      ...otherDetailList,
    ].sort((a, b) => {
      return a.otherLineNum - b.otherLineNum;
    });
    const data = {
      ...detail,
      otherDetailList: newLineList,
      otherInfoPagination: addItemToPagination(otherDetailList.length, otherInfoAPagination),
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
    this.props.onSelectRow(selectedRowKeys, selectedRows, 'otherInfoA');
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
          otherDetailList: [],
          otherInfoAPagination: {},
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
        dataIndex: 'otherLineNum',
        width: 120,
      },
    ];
    const columns = remote
    ?remote.process("SQAM_COMPONENTS_OTHERINFO_A_TABLE_COLUMNS",cols,{_this:this})
    :cols;
    const isLoading = deleteLoading || loading;
    return (
      <React.Fragment>
        <Row>
          <Col>
            <div className="table-groupMember-operator" style={{ marginBottom: 16 }}>
              {customizeBtnGroup &&
                customizeBtnGroup(
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
                rowKey="otherDetailId"
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
