import React, { Component, createRef } from 'react';
import { Form as BaseForm } from 'choerodon-ui';
import { Table } from "hzero-ui";
import { Button, Modal, Spin, Tooltip, Icon } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { createPagination, getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { totalRender } from 'hzero-front/lib/utils/renderer';
import { Size } from 'choerodon-ui/lib/_util/enum';
import {
  queryRelatedUnits,
  saveFieldIndividual,
  querySameModelUnit,
  copyFiled,
  checkValueCodeAssignMenu,
} from '../../../../../services/customizeConfigService';
import ComputeRule from '../../../../../components/ComputeRule';
import ParamsConfig from '../../../../../components/ParamsConfig';
import { filterFxUnitType } from "../../../../../utils/constConfig";
import { openFieldDetail } from '../../common/modals';

const rowKey = 'id';

class ParamsConfigImpl extends ParamsConfig {
  queryRelatedUnits() {
    return queryRelatedUnits({ unitId: this.props.unitId, returnVirtual: true, filterUnitType: filterFxUnitType });
  }
}

@(BaseForm.create as any)({ fieldNameProp: null })
class ComputeRuleImpl extends ComputeRule {
  queryRelatedUnits() {
    return queryRelatedUnits({ unitId: this.props.unitId, returnVirtual: true, filterUnitType: filterFxUnitType });
  }
}

export function openFieldDetailImpl(record, options) {
  const {unitId, ...baseOptions} = options;
  const subModalCommonParams = {unitId};
  const saveFieldUrl = async (fieldDTO) => {
    const res = await checkValueCodeAssignMenu({ isSite: false }, fieldDTO);
    if (!res || typeof res !== "string" && getResponse(res)) {
      return saveFieldIndividual(fieldDTO);
    }
    return Modal.confirm({
      title: (
        <span>
          <Icon type="warning" style={{ color: "orange", verticalAlign: "text-top" }} />
          {intl.get("hpfm.customize.common.confirmSaveField").d("确认继续保存字段")}
        </span>
      ),
      children: <div style={{maxWidth: "470px", wordBreak: "break-word"}}>{res}</div>,
      onOk: () => {
        return saveFieldIndividual(fieldDTO);
      },
      onCacnel: () => undefined
    });
  }
  openFieldDetail(record, {...baseOptions, isTemplate: false, subModalCommonParams, mode: "customize"}, {
    ComputeRuleImpl, ParamsConfigImpl,
    saveFieldUrl,
  });
}

export function openCopyField(unitInfoDs, unitFieldsDs) {
  const unitInfo = unitInfoDs.current.toData();
  const copyFields = unitFieldsDs.selected.map(r=>r.toData());
  const ref = createRef<CopyFieldModal>();
  Modal.open({
    title: intl.get('hpfm.individual.model.title.selectUnitCopyField').d('选择个性化单元进行字段拷贝'),
    style: { width: 1000 },
    className: "copy-field-modal",
    children: (
      <CopyFieldModal currentUnit={unitInfo} copyFields={copyFields} ref={ref} />
    ),
    onOk: () => {
      return ref.current!.handleOk();
    },
  });
}

class CopyFieldModal extends Component<{
  modal?: any;
  currentUnit: any;
  copyFields: any[];
}, {
  sourceData: any[];
      sourcePagination: any;
      targetData: any[];
      sourceSelectedKeys: any[];
      targetSelectedKeys: any[];
      fetchLoading: boolean;
      saveLoading: boolean;
}> {

  constructor(props) {
    super(props);
    this.state = {
      sourceData: [], // 左侧表格数据
      sourcePagination: {}, // 左侧表格分页
      targetData: [], // 右侧表格数据
      sourceSelectedKeys: [], // 左侧表格选中数据
      targetSelectedKeys: [], // 右侧表格选中数据
      fetchLoading: true,
      saveLoading: false,
    };
  }

  componentDidMount() {
    this.fetchSourceData();
  }

  fetchSourceData = (params = {}) => {
    const { currentUnit = {} } = this.props;
    const { unitType, id } = currentUnit;
    this.setState({fetchLoading: true});
    querySameModelUnit({
        lovCode: 'HPFM.CUST.UNIT_FOR_FIELD_COPY',
        tenantId: getCurrentOrganizationId(),
        unitId: id,
        unitType,
        ...params,
      }).then((res) => {
      if (getResponse(res)) {
        if (res.fail) {
          notification.error({ message: res.message });
          return;
        }
        const dataSource = (res || {}).content || [];
        const pagination = createPagination(res || {}, undefined);
        this.setState({
          sourceData: dataSource,
          sourcePagination: pagination,
        });
      }
    }).finally(()=>this.setState({fetchLoading: false}));
  }

  getTableColumns = () => {
    return [
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.unitName').d('单元名称'),
        dataIndex: 'unitName',
        width: 400,
        render: (_, record) => {
          const { unitName, unitCode } = record;
          return (
            <div>
              <div style={{ fontWeight: 600, color: '#666' }}>{unitName}</div>
              <div style={{ color: '#a5a5a5' }}>
                <Tooltip placement="bottom" title={unitCode}>
                  {unitCode}
                </Tooltip>
              </div>
            </div>
          );
        },
      },
    ];
  }

  handleSelected = (type, selectedKeys) => {
    this.setState({
      [type]: selectedKeys,
    } as any);
  }

  handleTransfer = (from) => {
    const { sourceData, targetData, sourceSelectedKeys, targetSelectedKeys } = this.state;
    if (from === 'source') {
      const transferData = sourceData.filter((item) => sourceSelectedKeys.includes(item[rowKey]));
      this.setState({
        sourceSelectedKeys: [],
        targetData: targetData.concat(transferData),
      });
    } else {
      const newTargetData = targetData.filter((item) => !targetSelectedKeys.includes(item[rowKey]));
      this.setState({
        targetSelectedKeys: [],
        targetData: newTargetData,
      });
    }
  }

  handleChangePagination = ({ current, pageSize }) => {
    this.fetchSourceData({ page: { current, pageSize } });
  }

  handleOk = () => {
    const { copyFields = [] } = this.props;
    const { targetData = [] } = this.state;
    const configFieldIds = copyFields.map((item) => item.configFieldId);
    const unitIds = targetData.map((item) => item[rowKey]);
    this.setState({saveLoading: true});
    return copyFiled({
        configFieldIds,
        unitIds,
      }).then((res) => {
      if (getResponse(res)) {
        notification.success(undefined as any);
      }
    }).finally(()=>this.setState({saveLoading: false}));
  }

  render() {
    const {
      sourceData = [],
      sourcePagination = {},
      targetData = [],
      sourceSelectedKeys = [],
      targetSelectedKeys = [],
      fetchLoading,
      saveLoading,
    } = this.state;
    return (
      <Spin spinning={fetchLoading || saveLoading || false}>
        <div className='modal-content'>
          <div className='modal-content-left'>
            <Table
              rowKey={rowKey}
              resizable={false}
              columns={this.getTableColumns()}
              dataSource={sourceData}
              pagination={sourcePagination}
              onChange={this.handleChangePagination as any}
              rowSelection={{
                  getCheckboxProps: (record: any) => ({
                    disabled: targetData.find((item) => item[rowKey] === record[rowKey]),
                  }),
                  selectedRowKeys: sourceSelectedKeys,
                  onChange: (selectedKeys) =>
                    this.handleSelected('sourceSelectedKeys', selectedKeys),
                }}
            />
          </div>
          <div className='modal-content-center'>
            <div>
              <Button
                icon="keyboard_arrow_left"
                size={Size.small}
                disabled={targetSelectedKeys.length < 1}
                onClick={() => this.handleTransfer('target')}
              />
              <Button
                icon="keyboard_arrow_right"
                size={Size.small}
                disabled={sourceSelectedKeys.length < 1}
                onClick={() => this.handleTransfer('source')}
              />
            </div>
          </div>
          <div className='modal-content-right'>
            <Table
              rowKey={rowKey}
              resizable={false}
              columns={this.getTableColumns()}
              pagination={{
                  showSizeChanger: true,
                  showTotal: totalRender,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
              dataSource={targetData}
              rowSelection={{
                  selectedRowKeys: targetSelectedKeys,
                  onChange: (selectedKeys) =>
                    this.handleSelected('targetSelectedKeys', selectedKeys),
                }}
            />
          </div>
        </div>
      </Spin>
    );
  }
}
