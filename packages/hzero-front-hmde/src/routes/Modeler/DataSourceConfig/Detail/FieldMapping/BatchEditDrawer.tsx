import React, { PureComponent } from 'react';
import { Modal, Icon } from 'choerodon-ui';
import { DataSet, Form, Table, Select, Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { DataSetStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import { getResponse } from 'hzero-front/lib/utils/utils';
import { fetchFieldMappingGroup } from '@/services/modelDataSourceService';
import { fieldBatchEditFormDS, fieldBatchEditTableDS } from './stores/FieldMappingDS';
import styles from './index.less';

const { Sidebar } = Modal;

interface FieldSourceDrawerProps {
  tipVisible: boolean;
  drawerFormDs: DataSet;
  drawerTableDs: DataSet;
  handleDrawerVisible: (visible?: boolean) => void;
  onCloseTip: () => void;
  onBatchAdd: (fields?: any[]) => void;
}

interface FieldSourceDrawerState {
  dataList: any[];
  targetModelList: any[];
  originModelList: any[];
}

@observer
export default class FieldSourceDrawer extends PureComponent<
  FieldSourceDrawerProps,
  FieldSourceDrawerState
> {
  formDs: DataSet;

  tableDs: DataSet;

  constructor(props) {
    super(props);
    this.state = {
      dataList: [],
      targetModelList: [],
      originModelList: [],
    };
    this.formDs = new DataSet(fieldBatchEditFormDS());
    this.tableDs = new DataSet(fieldBatchEditTableDS());
  }

  componentDidMount() {
    this.fetchData();
  }

  @Bind()
  fetchData() {
    const { drawerFormDs } = this.props;
    const { dataObjectCode } = drawerFormDs.current?.get('originDataObject');
    const targetDataObjectCode = drawerFormDs.current?.get('targetDataObjectCode');
    this.tableDs.status = DataSetStatus.loading;
    fetchFieldMappingGroup({
      originDataObjectCode: dataObjectCode,
      targetDataObjectCode,
    })
      .then((res) => {
        if (getResponse(res)) {
          const { dataList = [], targetModelList = [], originModelList = [] } = res || {};
          const tableData = this.filterTableSelectedData(dataList);
          this.tableDs.loadData(tableData);
          this.setState({
            dataList: tableData,
            targetModelList,
            originModelList,
          });
        }
      })
      .finally(() => {
        this.tableDs.status = DataSetStatus.ready;
      });
  }

  @Bind()
  filterTableSelectedData(dataList) {
    let result = dataList;
    const drawerTableData = this.props.drawerTableDs.toData();
    if (!isEmpty(drawerTableData)) {
      result = dataList.filter((data: any) => {
        return drawerTableData.every((d: any) => {
          return (
            d.originDataFieldId !== data.originDataFieldId &&
            d.targetDataFieldId !== data.targetDataFieldId
          );
        });
      });
    }
    return result;
  }

  @Bind()
  handleOk() {
    const { handleDrawerVisible, onBatchAdd } = this.props;
    handleDrawerVisible();
    onBatchAdd(this.tableDs.selected.map((item) => item.toData()));
  }

  @Bind()
  handleCancel() {
    const { handleDrawerVisible } = this.props;
    handleDrawerVisible();
  }

  @Bind()
  reset() {
    this.formDs.reset();
  }

  @Bind()
  query() {
    const { dataList = [] } = this.state;
    const targetModelId = this.formDs.current?.get('targetModel');
    const originModelId = this.formDs.current?.get('originModel');
    let result = dataList;
    if (targetModelId) {
      result = result.filter((item) => item.targetLogicModelId === targetModelId);
    }
    if (originModelId) {
      result = result.filter((item) => item.originLogicModelId === originModelId);
    }
    this.tableDs.loadData(result);
  }

  render() {
    const { targetModelList = [], originModelList = [] } = this.state;
    const { tipVisible, onCloseTip } = this.props;
    return (
      <Sidebar
        visible
        closable
        title="批量定义"
        className={styles.drawer}
        width={1000}
        onCancel={this.handleCancel}
        footer={
          <div>
            <Button
              color={ButtonColor.primary}
              disabled={isEmpty(this.tableDs.selected)}
              onClick={this.handleOk}
            >
              确定
            </Button>
            <Button onClick={this.handleCancel}>取消</Button>
          </div>
        }
      >
        {tipVisible && (
          <div className={styles.tips}>
            <Icon type="wb_incandescent" className={styles['tips-icon-info']} />
            <Icon type="close" className={styles['tips-icon-close']} onClick={onCloseTip} />
            <div>建议行对行映射，如：</div>
            <div>1、采购申请转采购订单场景，为申请行映射订单行；</div>
            <div>2、订单头信息获取自订单行，通过默认值规则维护；</div>
          </div>
        )}
        <div className={styles['filter-form-wrap']}>
          <Form columns={2} dataSet={this.formDs}>
            <Select name="targetModel">
              {targetModelList.map((item) => (
                <Select.Option value={item.id}>{item.name}</Select.Option>
              ))}
            </Select>
            <Select name="originModel">
              {originModelList.map((item) => (
                <Select.Option value={item.id}>{item.name}</Select.Option>
              ))}
            </Select>
          </Form>
          <div className={styles['filter-form-btns']}>
            <Button onClick={this.reset}>重置</Button>
            <Button color={ButtonColor.primary} onClick={this.query}>
              查询
            </Button>
          </div>
        </div>
        <Table dataSet={this.tableDs} queryBar={TableQueryBarType.none}>
          <Table.Column name="targetModelName" />
          <Table.Column name="targetDisplayName" />
          <Table.Column name="originModelName" />
          <Table.Column name="originDisplayName" />
        </Table>
      </Sidebar>
    );
  }
}
