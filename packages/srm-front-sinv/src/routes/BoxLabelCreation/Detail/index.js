/**
 * index.js 收货执行明细
 * @date: 2020-09-06
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import { DataSet, Button, Table, Output, Form, TextField, Select, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import querystring from 'querystring';
import { connect } from 'dva';

import { Header, Content } from 'components/Page';
import { SRM_SPUC } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
// import WithCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { revokeLine, createLabelLine, deleteLabelLine } from '@/services/boxLabelCreationService';
import { detailHeaderDs, detailLineDs, detailCreatedLabelDs } from '../store/boxLabelCreationDS';
import styles from '../index.less';
import commonStyles from '../../components/index.less';
import { showBigNumber } from '@/routes/components/utils';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();

@WithCustomize({
  unitCode: [
    'SINV.BOX_LABEL_CREATION_DETAIL.HEADER',
    'SINV.BOX_LABEL_CREATION_DETAIL.LABEL_LINE',
    'SINV.BOX_LABEL_CREATION_DETAIL.MAINTAIN',
    'SINV.BOX_LABEL_CREATION_DETAIL1.HEADER',
    'SINV.BOX_LABEL_CREATION_DETAIL1.LABEL_LINE',
    'SINV.BOX_LABEL_CREATION_DETAIL1.MAINTAIN',
    'SINV.BOX_LABEL_CREATION_DETAIL2.HEADER',
    'SINV.BOX_LABEL_CREATION_DETAIL2.LABEL_LINE',
    'SINV.BOX_LABEL_CREATION_DETAIL2.MAINTAIN',
    'SINV.BOX_LABEL_CREATION_DETAIL3.HEADER',
    'SINV.BOX_LABEL_CREATION_DETAIL3.LABEL_LINE',
    'SINV.BOX_LABEL_CREATION_DETAIL3.MAINTAIN',
    'SINV.BOX_LABEL_CREATION_DETAIL4.HEADER',
    'SINV.BOX_LABEL_CREATION_DETAIL4.LABEL_LINE',
    'SINV.BOX_LABEL_CREATION_DETAIL4.MAINTAIN',
  ],
})
@formatterCollections({ code: ['sinv.boxLabelCreation', 'sinv.common'] })
@connect(({ loading, boxLabelCreation }) => ({
  boxLabelCreation,
  deleteLoading: loading.effects['boxLabelCreation/labelVoid'],
  saveLoading: loading.effects['boxLabelCreation/saveLabel'],
  submitLoading: loading.effects['boxLabelCreation/submitLabel'],
}))
export default class ExecutionDetail extends Component {
  custList = [0, 1, 2, 3, 4];

  constructor(props) {
    super(props);
    const {
      location: { search },
      match: { params = {} },
    } = props;
    const { sortNo } = querystring.parse(search.substr(1));
    const newSortNo = Number(sortNo);
    this.state = {
      sortNo: newSortNo,
      defaultActiveKey: ['maintain', 'label'],
    };
    this.detailHeaderDs = new DataSet({
      ...detailHeaderDs(),
      transport: {
        read: ({ data }) => {
          if (this.custList.includes(newSortNo)) {
            Object.assign(data, {
              customizeUnitCode: `SINV.BOX_LABEL_CREATION_DETAIL${newSortNo || ''}.HEADER`,
            });
          }
          return {
            url: `${SRM_SPUC}/v1/${organizationId}/label-headers/${params.labelHeaderId}`,
            method: 'GET',
            data,
          };
        },
      },
    });

    this.detailLineDs = new DataSet({
      ...detailLineDs(),
      transport: {
        read: ({ data }) => {
          if (this.custList.includes(newSortNo)) {
            Object.assign(data, {
              customizeUnitCode: `SINV.BOX_LABEL_CREATION_DETAIL${newSortNo || ''}.LABEL_LINE`,
            });
          }
          return {
            url: `${SRM_SPUC}/v1/${organizationId}/label-asn-lines/${params.labelHeaderId}`,
            method: 'GET',
            data,
          };
        },
      },
    });

    this.detailCreatedLabelDs = new DataSet({
      ...detailCreatedLabelDs(),
      transport: {
        read: ({ data }) => {
          if (this.custList.includes(newSortNo)) {
            Object.assign(data, {
              customizeUnitCode: `SINV.BOX_LABEL_CREATION_DETAIL${newSortNo || ''}.MAINTAIN`,
            });
          }
          return {
            url: `${SRM_SPUC}/v1/${organizationId}/label-lines/${params.labelHeaderId}`,
            method: 'GET',
            data,
          };
        },
      },
    });
  }

  componentDidMount() {
    this.detailHeaderDs.query();
    this.detailLineDs.query();
    this.detailCreatedLabelDs.query();
  }

  columns = [
    {
      name: 'serialNumber',
      width: 60,
    },
    {
      name: 'asnNum',
      width: 180,
    },
    {
      name: 'asnLineNum',
      width: 100,
    },
    {
      name: 'itemCode',
      width: 80,
    },
    {
      name: 'itemName',
      width: 150,
    },
    {
      name: 'shipQuantity',
      width: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'toPackageQuantity',
      width: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'unitPackageQuantity',
      width: 100,
      editor: (record) => record.get('toPackageQuantity') !== 0,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'packageQuantity',
      width: 100,
      editor: (record) => record.get('toPackageQuantity') !== 0,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'lotNum',
      width: 80,
    },
    {
      name: 'productionDate',
    },
  ];

  createdColumns = [
    {
      name: 'labelLineCode',
      width: 128,
    },
    {
      name: 'labelLineNum',
      width: 100,
    },
    {
      name: 'itemCode',
      width: 120,
    },
    {
      name: 'itemName',
      width: 118,
    },
    {
      name: 'volumeLength',
      width: 127,
    },
    {
      name: 'volumeWide',
      width: 120,
    },
    {
      name: 'volumeHeight',
      width: 117,
    },
    {
      name: 'netWeight',
      width: 106,
    },
    {
      name: 'grossWeight',
      width: 108,
    },
    {
      name: 'unitPackageQuantity',
      width: 106,
      renderer: ({ value }) => showBigNumber(value),
    },
  ];

  handleSave = async () => {
    const { dispatch } = this.props;
    const headerData = this.detailHeaderDs.toData()[0];
    const labelHeaderDTO = {
      ...headerData,
      labelAsnLineDTOList: this.detailLineDs.toData(),
    };
    const headerStatus = await this.detailHeaderDs.validate();
    const lineStatus = await this.detailLineDs.validate();
    if (headerStatus && lineStatus) {
      dispatch({
        type: 'boxLabelCreation/saveLabel',
        payload: labelHeaderDTO,
      }).then((res) => {
        if (res && !res.failed) {
          notification.success();
          this.detailHeaderDs.query();
          this.detailLineDs.query();
        }
      });
    }
  };

  handleChangeMode = async (value, oldValue) => {
    const { dispatch } = this.props;
    const headerData = this.detailHeaderDs.toData()[0];
    const labelHeaderDTO = {
      labelHeaderId: headerData.labelHeaderId,
      packageMode: value,
      _token: headerData._token,
      objectVersionNumber: headerData.objectVersionNumber,
    };
    dispatch({
      type: 'boxLabelCreation/saveLabel',
      payload: labelHeaderDTO,
    }).then((res) => {
      if (res && !res.failed) {
        this.detailHeaderDs.query();
      } else {
        this.detailHeaderDs.records[0].set('packageMode', oldValue);
      }
    });
  };

  handleSubmit = async () => {
    const { dispatch } = this.props;
    const labelHeaderDTO = this.detailHeaderDs.toData()[0];
    const headerStatus = await this.detailHeaderDs.validate();
    const lineStatus = await this.detailLineDs.validate();
    if (headerStatus && lineStatus) {
      dispatch({
        type: 'boxLabelCreation/submitLabel',
        payload: labelHeaderDTO,
      }).then((res) => {
        if (res && !res.failed) {
          notification.success();
          this.props.history.push({
            pathname: `/sinv/box-label-creation/list`,
          });
        }
      });
    }
  };

  @Bind()
  async handleDelete() {
    const { dispatch } = this.props;
    const headerData = this.detailHeaderDs.toData()[0];
    dispatch({
      type: 'boxLabelCreation/labelVoid',
      payload: headerData,
    }).then((res) => {
      if (res && !res.failed) {
        notification.success();
        this.props.history.push({
          pathname: `/sinv/box-label-creation/list`,
        });
      }
    });
  }

  revokeLines = async () => {
    const selectedLines = this.detailLineDs.selected.map((item) => item.toJSONData());
    const result = getResponse(await revokeLine(selectedLines));
    if (result && !result.failed) {
      notification.success();
      this.detailLineDs.query();
    }
  };

  createLines = async () => {
    const headerData = this.detailHeaderDs.toData()[0];
    const selectedLines = this.detailLineDs.selected;
    const selectedData = selectedLines.map((item) => item.toData());
    const selectedPackageQuantity = new Set(selectedData.map((item) => item.packageQuantity));
    if (headerData.packageMode === 'MIX' && selectedPackageQuantity.size !== 1) {
      notification.warning({
        message: intl
          .get('sinv.boxLabelCreation.model.common.validataPackageMode')
          .d('请维护相同比例份数进行混装'),
      });
      return;
    }
    const seleteStatus = await Promise.all(selectedLines.map((item) => item.validate(true)));
    const newSlectedData = selectedData.map((item) => {
      const { volumeLength, volumeWide, volumeHeight, netWeight, grossWeight } = headerData;
      return {
        ...item,
        volumeLength,
        volumeWide,
        volumeHeight,
        netWeight,
        grossWeight,
      };
    });
    if (!seleteStatus.includes(false)) {
      const result = getResponse(await createLabelLine(newSlectedData));
      if (result && !result.failed) {
        notification.success();
        this.detailLineDs.query();
        this.detailCreatedLabelDs.query();
      }
    }
  };

  deleteLabelLine = async () => {
    const selectedLines = this.detailCreatedLabelDs.selected;
    const selectedData = selectedLines.map((item) => item.toData());
    const result = getResponse(await deleteLabelLine(selectedData));
    if (result && !result.failed) {
      notification.success();
      this.detailLineDs.query();
      this.detailCreatedLabelDs.query();
    }
  };

  getButtons = () => {
    const Buttons = observer((props) => {
      return (
        <Fragment>
          <Button
            icon="playlist_add"
            key="revoke"
            color="primary"
            funcType="flat"
            onClick={this.revokeLines}
            disabled={isEmpty(props.dataSet.selected)}
          >
            {intl.get('hzero.common.button.revoke').d('撤销')}
          </Button>
          <Button
            icon="playlist_add"
            key="create"
            color="primary"
            funcType="flat"
            onClick={this.createLines}
            disabled={isEmpty(props.dataSet.selected)}
          >
            {intl.get('hzero.common.button.creation').d('创建')}
          </Button>
        </Fragment>
      );
    });
    return [<Buttons dataSet={this.detailLineDs} />];
  };

  deleteLabelLineButton = () => {
    const Buttons = observer((props) => {
      return (
        <Button
          icon="playlist_add"
          key="revoke"
          color="primary"
          funcType="flat"
          onClick={this.deleteLabelLine}
          disabled={isEmpty(props.dataSet.selected)}
        >
          {intl.get('hzero.common.button.enter').d('删除')}
        </Button>
      );
    });
    return [<Buttons dataSet={this.detailCreatedLabelDs} />];
  };

  activeKeyChange = (defaultActiveKey) => {
    this.setState({ defaultActiveKey });
  };

  render() {
    const { customizeTable, customizeForm, deleteLoading, saveLoading, submitLoading } = this.props;
    const { defaultActiveKey, sortNo } = this.state;
    const ObHeader = observer((props) => {
      const { labelConfigName } = props.dataSet.toData()[0] || {};
      return (
        <Header
          title={`${labelConfigName || ''}${intl
            .get('sinv.boxLabelCreation.view.title.boxLabelCreationDetail')
            .d('明细维护')}`}
          backPath="/sinv/box-label-creation/list"
        >
          <Button
            icon="check"
            color="primary"
            funcType="raised"
            onClick={this.handleSubmit}
            loading={submitLoading}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>

          <Button
            icon="save"
            color="primary"
            funcType="raised"
            onClick={this.handleSave}
            loading={saveLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="delete"
            funcType="raised"
            onClick={this.handleDelete}
            loading={deleteLoading}
          >
            {intl.get(`hzero.common.button.invalid`).d('作废')}
          </Button>
        </Header>
      );
    });
    return (
      <Fragment>
        <ObHeader dataSet={this.detailHeaderDs} />
        <Content>
          <Spin dataSet={this.detailHeaderDs}>
            {customizeForm(
              {
                // custLoading,
                code: this.custList.includes(sortNo)
                  ? `SINV.BOX_LABEL_CREATION_DETAIL${sortNo || ''}.HEADER`
                  : null,
              },
              <Form dataSet={this.detailHeaderDs} columns={3}>
                <Output name="labelNum" colSpan={3} />
                <TextField name="volumeLength" />
                <TextField name="volumeWide" />
                <TextField name="volumeHeight" />
                <TextField name="netWeight" />
                <TextField name="grossWeight" />
                <Select name="packageMode" onChange={this.handleChangeMode} />
              </Form>
            )}
          </Spin>
          <Collapse
            className={(styles['flex-header-table'], commonStyles['collapse-title'])}
            defaultActiveKey={defaultActiveKey}
            onChange={this.activeKeyChange}
          >
            <Panel
              header={intl.get('sinv.boxLabelCreation.view.tab.maintain').d('待生成标签')}
              key="maintain"
            >
              {customizeTable(
                {
                  code: this.custList.includes(sortNo)
                    ? `SINV.BOX_LABEL_CREATION_DETAIL${sortNo || ''}.MAINTAIN`
                    : null,
                },
                <Table
                  buttons={this.getButtons()}
                  dataSet={this.detailLineDs}
                  columns={this.columns}
                />
              )}
            </Panel>
            <Panel
              header={intl.get('sinv.boxLabelCreation.view.tab.label').d('已生成标签')}
              key="label"
            >
              {customizeTable(
                {
                  code: this.custList.includes(sortNo)
                    ? `SINV.BOX_LABEL_CREATION_DETAIL${sortNo || ''}.LABEL_LINE`
                    : null,
                },
                <Table
                  buttons={this.deleteLabelLineButton()}
                  dataSet={this.detailCreatedLabelDs}
                  columns={this.createdColumns}
                />
              )}
            </Panel>
          </Collapse>
        </Content>
      </Fragment>
    );
  }
}
