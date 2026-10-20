/**
 * index.js 销售方标签创建/查询
 * @date: 2020-09-06
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import { DataSet, Button, Table } from 'choerodon-ui/pro';
import { Tree, Spin, Badge, Input } from 'choerodon-ui';
import { Button as PermissionButton } from 'components/Permission';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNil, isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import { connect } from 'dva';
import { stringify } from 'querystring';
import qs from 'qs';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import { dateRender } from 'utils/renderer';
import remote from 'hzero-front/lib/utils/remote';

import {
  labelMaintain,
  fetchTreeList,
  labelPrint,
  // createAndPrint,
  asnPrint,
} from '@/services/boxLabelCreationService';
import {
  lineDs,
  formDs,
  generatingDs,
  printDs,
  onlyLabelPrintDs,
  asnStatusOptionDs,
} from './store/boxLabelCreationDS';
import styles from './index.less';
import { showBigNumber, globalPrint } from '../components/utils';

const { TreeNode } = Tree;
const { Search } = Input;

@WithCustomize({
  unitCode: [
    'SINV.BOX_LABEL_CREATION_LIST.GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST.NOT_UNIQUE',
    'SINV.BOX_LABEL_CREATION_LIST.QUERY_PRINT',
    'SINV.BOX_LABEL_CREATION_LIST.TO_BE_GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST.GENERATED_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST.QUERY_PRINT_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST.TO_BE_GENERATED_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST1.GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST1.NOT_UNIQUE',
    'SINV.BOX_LABEL_CREATION_LIST1.QUERY_PRINT',
    'SINV.BOX_LABEL_CREATION_LIST1.TO_BE_GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST1.GENERATED_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST1.QUERY_PRINT_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST1.TO_BE_GENERATED_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST2.GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST2.NOT_UNIQUE',
    'SINV.BOX_LABEL_CREATION_LIST2.QUERY_PRINT',
    'SINV.BOX_LABEL_CREATION_LIST2.TO_BE_GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST2.GENERATED_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST2.QUERY_PRINT_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST2.TO_BE_GENERATED_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST3.GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST3.NOT_UNIQUE',
    'SINV.BOX_LABEL_CREATION_LIST3.QUERY_PRINT',
    'SINV.BOX_LABEL_CREATION_LIST3.TO_BE_GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST3.GENERATED_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST3.QUERY_PRINT_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST3.TO_BE_GENERATED_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST4.GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST4.NOT_UNIQUE',
    'SINV.BOX_LABEL_CREATION_LIST4.QUERY_PRINT',
    'SINV.BOX_LABEL_CREATION_LIST4.TO_BE_GENERATED',
    'SINV.BOX_LABEL_CREATION_LIST4.GENERATED_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST4.QUERY_PRINT_QUERY',
    'SINV.BOX_LABEL_CREATION_LIST4.TO_BE_GENERATED_QUERY',
  ],
})
@remote(
  {
    code: 'SINV_BOX_LABEL_CREATION_PAGE',
    name: 'cuxRemote',
  },
  {
    process: {
      renderPageHeaderButtons: undefined,
    },
  }
)
@formatterCollections({ code: ['sinv.boxLabelCreation', 'sinv.common'] })
@connect(({ loading, boxLabelCreation }) => ({
  boxLabelCreation,
  createAndPrintLoading: loading.effects['boxLabelCreation/createAndPrint'],
}))
export default class ReceiptExecution extends Component {
  lineDs = new DataSet(lineDs());

  formDs = new DataSet(formDs());

  generatingDs = new DataSet(generatingDs());

  printDs = new DataSet(printDs());

  onlyLabelPrintDs = new DataSet(onlyLabelPrintDs());

  node = [
    {
      title: intl.get('sinv.boxLabelCreation.model.common.toGenerateCount').d('待生成'),
      field: 'toGenerateCount',
    },
    {
      title: intl.get('sinv.boxLabelCreation.model.common.generatingCount').d('生成中'),
      field: 'generatingCount',
    },
    {
      title: intl.get('sinv.boxLabelCreation.model.common.queryPrintCount').d('查询/打印'),
      field: 'queryPrintCount',
    },
  ];

  custList = [0, 1, 2, 3, 4];

  constructor(props) {
    super(props);
    const {
      location: { search },
    } = props;
    const { asnNum } = qs.parse(search.substr(1));
    this.state = {
      loading: true,
      fieldStatus: this.node[0].field,
      treeList: [],
      nodeDataRef: {},
      selectedKeys: [],
      cacheDataSet: {},
      condition: null || asnNum,
    };
  }

  componentDidMount() {
    const { condition } = this.state;
    asnStatusOptionDs.query().then((res) => {
      if (res) {
        const data = res.filter((i) => ['SHIPPED', 'CANCELLED', 'CLOSED'].includes(i.value));
        asnStatusOptionDs.loadData(data);
      }
    });
    if (condition) {
      this.fetchTreeList({ condition });
      return false;
    }
    this.fetchTreeList();
  }

  @Bind()
  async fetchTreeList(query = {}) {
    this.setState({ loading: true });
    const res = getResponse(await fetchTreeList(query));
    if (res && !res.failed && res?.length > 0) {
      // 针对计算首次加载有数据的索引
      let countIndex = `${res[0].labelConfigId}-toGenerateCount`;
      res.some((i) => {
        if (i.toGenerateCount > 0) {
          countIndex = `${i.labelConfigId}-toGenerateCount`;
          return true;
        } else if (i.generatingCount > 0) {
          countIndex = `${i.labelConfigId}-generatingCount`;
          return true;
        } else if (i.queryPrintCount > 0) {
          countIndex = `${i.labelConfigId}-queryPrintCount`;
          return true;
        }
        return false;
      });
      const data = res.map((i) => {
        const children = this.node.map((item) => {
          return {
            ...item,
            ...i,
            key: `${i.labelConfigId}-${item.field}`,
            count: i[item.field],
          };
        });
        return {
          ...i,
          title: i.labelName,
          key: i.labelConfigId,
          children,
        };
      });
      const params = (data[0] && data[0].children && data[0].children[0]) || {};
      const tempArr = [];
      data.forEach((i) => {
        tempArr.push(...i.children);
      });
      const countParams = tempArr.filter((i) => i.key === countIndex)[0];
      this.setState({
        loading: false,
        treeList: data,
        nodeDataRef: params,
        selectedKeys: [params.key],
      });
      const { condition } = this.state;
      // 针对计算首次加载有数据的节点参数
      if (condition) {
        this.setState(
          {
            nodeDataRef: countParams,
            fieldStatus: countParams?.field,
            selectedKeys: (countIndex && [countIndex]) || [params.key],
          },
          () => {
            this.handleFetch(countParams);
          }
        );
        return false;
      }
      if (!isEmpty(res)) {
        this.handleFetch(params);
      }
    }
  }

  @Bind()
  handleFetch(dataRef = {}) {
    const { condition } = this.state;
    const { field } = dataRef;
    const currentDs = this.getCurrentDs(field);
    const code = this.getCustomizeUnitCode();
    const filterCode = this.getCustomizeFilterCode();
    currentDs.setQueryParameter('condition', condition);
    currentDs.setQueryParameter('labelConfigId', dataRef.labelConfigId);
    currentDs.setQueryParameter(
      'customizeUnitCode',
      this.custList.includes(dataRef.sortNo) ? `${code},${filterCode}` : undefined
    );
    currentDs.query();
  }

  conditionQuery = async (condition) => {
    this.setState({ condition }, () => {
      this.fetchTreeList({ condition });
    });
  };

  @Bind()
  onSelect(selectedKeys, e) {
    const dataRef = e.node.props.dataRef || {};
    this.setState({ nodeDataRef: dataRef, fieldStatus: dataRef.field, selectedKeys }, () => {
      this.handleFetch(dataRef);
    });
  }

  @Bind()
  getCurrentDs(fieldStatus) {
    const { nodeDataRef = {}, cacheDataSet = {} } = this.state;
    const currentDsName = `${fieldStatus}${nodeDataRef.labelConfigId}`;
    if (cacheDataSet[currentDsName]) {
      return cacheDataSet[currentDsName];
    }
    let currentDs;
    switch (fieldStatus) {
      case 'toGenerateCount':
        currentDs = new DataSet(lineDs());
        break;
      case 'generatingCount':
        currentDs = new DataSet(generatingDs());
        break;
      case 'queryPrintCount':
        currentDs = nodeDataRef.onlyLabelCodeFlag
          ? new DataSet(printDs())
          : new DataSet(onlyLabelPrintDs());
        break;
      default:
        currentDs = new DataSet(lineDs());
        break;
    }
    this.setState({
      cacheDataSet: { ...cacheDataSet, [currentDsName]: currentDs },
    });
    return currentDs;
  }

  loop = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode
            className="tree-node-title"
            selectable={false}
            title={item.title}
            key={item.key}
            dataRef={item}
          >
            {this.loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={`${item.title}(${item.count})`} key={item.key} dataRef={item} />;
    });
  };

  //  维护明细
  handlemaintain = () => {
    const { nodeDataRef = {}, fieldStatus } = this.state;
    const currentDs = this.getCurrentDs(fieldStatus);
    const selectedRecords = currentDs.selected;
    const lines = selectedRecords.map((item) => item.toData());
    const data = {
      labelConfigId: nodeDataRef.labelConfigId,
      lines,
    };
    currentDs.validate().then(async (res) => {
      if (res) {
        const result = getResponse(await labelMaintain(data));

        if (result && !result.failed) {
          this.goDetail(result.labelHeaderId);
        }
      }
    });
  };

  goDetail = (labelHeaderId) => {
    const { nodeDataRef = {} } = this.state;
    this.props.history.push({
      pathname: `/sinv/box-label-creation/detail/${labelHeaderId}`,
      search: this.custList.includes(nodeDataRef.sortNo)
        ? stringify({
            sortNo: nodeDataRef.sortNo,
          })
        : null,
    });
  };

  // 生成并打印
  creatrAndPrint = () => {
    const { dispatch } = this.props;
    const { nodeDataRef = {}, fieldStatus } = this.state;
    const currentDs = this.getCurrentDs(fieldStatus);
    const selectedRecords = currentDs.selected;
    if (isEmpty(selectedRecords)) return;
    Promise.all(selectedRecords.map((item) => item.validate(true))).then((res) => {
      if (res.includes(false)) {
        notification.warning({
          message: intl
            .get('sinv.boxLabelCreation.view.message.submit')
            .d('请正确维护勾选行的单包装数！'),
        });
      } else {
        const lines = selectedRecords.map((item) => item.toData());
        const data = {
          labelConfigId: nodeDataRef.labelConfigId,
          lines,
        };
        // const result = getResponse(await createAndPrint(data));
        dispatch({
          type: 'boxLabelCreation/createAndPrint',
          payload: data,
        }).then((result) => {
          if (result && !result.failed) {
            this.setState({ loading: true });
            this.fetchTreeList();
            currentDs.unSelectAll();
            this.handlePrint(
              nodeDataRef.onlyLabelCodeFlag ? result.labelLineDTOList : result.labelAsnLineDTOList
            );
          }
        });
      }
    });
  };

  // 打印
  handlePrint = async (createLines) => {
    const { fieldStatus, nodeDataRef = {} } = this.state;
    const currentDs = this.getCurrentDs(fieldStatus);
    const selectedRecords = currentDs.selected;

    const lines = createLines || selectedRecords.map((item) => item.toData());
    lines.forEach((e) => Object.assign(e, { templateCode: nodeDataRef.templateCode }));
    const result = nodeDataRef.onlyLabelCodeFlag
      ? getResponse(await labelPrint(lines))
      : getResponse(await asnPrint(lines));
    globalPrint(result);
  };

  // 删除
  handleDelete = () => {
    const { fieldStatus } = this.state;
    const currentDs = this.getCurrentDs(fieldStatus);
    const confirmMessage = intl
      .get(`sinv.boxLabelCreation.view.message.labelConfirmMessage`)
      .d('此操作将删除关联送货单的所有标签数据，是否确定？');
    currentDs.delete(currentDs.selected, {
      children: confirmMessage,
      okProps: { style: { backgroundColor: '#29bece', borderColor: '#29bece' } },
    });
  };

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {value} string  -当前数据
   * @param {object} record -单条数据
   */
  @Bind()
  showUomText(record) {
    const uomName = record.get('uomName');
    const uomCode = record.get('uomCode');
    const unitCodeIsShow = record.get('unitCodeIsShow');
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  getCloumns = (fieldStatus) => {
    const { nodeDataRef = {} } = this.state;
    const allColumns = {
      toGenerateCount: [
        {
          name: 'asnNum',
          width: 150,
        },
        {
          name: 'displayAsnLineNum',
          width: 50,
        },
        {
          name: 'itemCode',
          width: 100,
        },
        {
          name: 'itemName',
          width: 150,
        },
        {
          name: 'uomName',
          width: 100,
          renderer: ({ record }) => this.showUomText(record),
        },
        {
          name: 'shipQuantity',
          width: 80,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'unitPackageQuantity',
          width: 120,
          editor: (record) => record.isSelected,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'packageQuantity',
          width: 80,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'remainderQuantity',
          width: 80,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'lotNum',
          width: 80,
        },
        {
          name: 'productionDate',
          width: 150,
        },
        {
          name: 'lotExpirationDate',
          width: 120,
        },
        {
          name: 'serialNum',
          // width: 80,
        },
        {
          name: 'companyName',
          width: 150,
        },
      ],
      generatingCount: [
        {
          name: 'statusCode',
          width: 80,
        },
        {
          name: 'labelNum',
          width: 150,
          renderer: ({ record, value }) => {
            const labelHeaderId = record.get('labelHeaderId');
            return <a onClick={() => this.goDetail(labelHeaderId)}>{value}</a>;
          },
        },
        {
          name: 'creationDate',
          width: 120,
        },
        {
          name: 'realName',
          width: 100,
        },
        {
          name: 'supplierName',
          width: 200,
        },
        {
          name: 'companyName',
          width: 200,
        },
        {
          name: 'createCampCode',
          width: 120,
        },
      ],
      labelPrint: [
        {
          name: 'labelLineCode',
          width: 120,
        },
        {
          name: 'labelLineNum',
          width: 80,
        },
        {
          name: 'unitPackageQuantity',
          width: 100,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'printCode',
          width: 120,
          renderer: ({ value, record }) => (
            <Badge
              status={value === 'UNPRINTABLE' ? 'error' : 'success'}
              text={record.getField('printCode') && record.getField('printCode').getText(value)}
            />
          ),
        },
        {
          name: 'itemCode',
          width: 100,
        },
        {
          name: 'itemName',
          width: 150,
        },
        {
          name: 'asnNum',
          width: 120,
        },
        {
          name: 'displayAsnLineNum',
          width: 80,
        },
        {
          name: 'asnStatus',
          width: 100,
        },
        {
          name: 'supplierName',
        },
        {
          name: 'companyName',
          width: 150,
        },
        {
          name: 'productionDate',
          width: 120,
          renderer: ({ value }) => dateRender(value),
        },
        {
          name: 'creationDate',
          width: 180,
        },
        {
          name: 'createCampCode',
          width: 120,
        },
      ],
      onlyLabelPrint: [
        {
          name: 'asnNum',
          width: 120,
        },
        {
          name: 'displayAsnLineNum',
          width: 80,
        },
        {
          name: 'printCode',
          width: 120,
          renderer: ({ value, record }) => (
            <Badge
              status={value === 'UNPRINTABLE' ? 'error' : 'success'}
              text={record.getField('printCode') && record.getField('printCode').getText(value)}
            />
          ),
        },
        {
          name: 'itemCode',
          width: 120,
        },
        {
          name: 'itemName',
          width: 150,
        },
        {
          name: 'shipQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'unitPackageQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'packageQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'remainderQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'lotNum',
          width: 80,
        },
        {
          name: 'productionDate',
          renderer: ({ value }) => dateRender(value),
        },
        {
          name: 'lotExpirationDate',
          width: 120,
        },
        {
          name: 'creationDate',
          width: 180,
        },
        {
          name: 'createCampCode',
          width: 120,
        },
      ],
    };
    if (fieldStatus === 'queryPrintCount') {
      return nodeDataRef.onlyLabelCodeFlag ? allColumns.labelPrint : allColumns.onlyLabelPrint;
    }
    return allColumns[fieldStatus] || [];
  };

  getButtons = (fieldStatus) => {
    const { createAndPrintLoading = false, cuxRemote } = this.props;
    console.log('cuxRemote', cuxRemote);
    const { renderPageHeaderButtons } = cuxRemote?.props?.process || {};
    const { nodeDataRef, cacheDataSet = {}, loading } = this.state;
    const currentDs = cacheDataSet[`${fieldStatus}${nodeDataRef.labelConfigId}`];
    const Buttons = observer((props) => {
      const generateAndprintButton = (
        <Button
          // icon="playlist_add"
          key="print"
          color="primary"
          // funcType="flat"
          onClick={this.creatrAndPrint}
          loading={createAndPrintLoading || loading}
          disabled={isEmpty(props.dataSet?.selected)}
        >
          {intl.get('sinv.boxLabelCreation.model.common.generateAndprint').d('生成并打印')}
        </Button>
      );

      const maintainButton = (
        <Button
          // icon="playlist_add"
          key="print"
          color="primary"
          // funcType="flat"
          onClick={this.handlemaintain}
          disabled={isEmpty(props.dataSet?.selected)}
        >
          {intl.get('sinv.boxLabelCreation.model.common.maintainDetail').d('维护明细')}
        </Button>
      );

      const printButton = (
        <Fragment>
          <Button
            // icon="playlist_add"
            key="print"
            color="primary"
            // funcType="flat"
            onClick={() => this.handlePrint()}
            disabled={isEmpty(props.dataSet?.selected)}
          >
            {intl.get('hzero.common.button.print').d('打印')}
          </Button>
          <PermissionButton
            // icon="playlist_add"
            // funcType="flat"
            onClick={this.handleDelete}
            disabled={isEmpty(props.dataSet?.selected)}
            permissionList={[
              {
                code: `srm.logistics.delivery.box.label.creation.ps.button.delete`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.enter').d('删除')}
          </PermissionButton>
          {isFunction(renderPageHeaderButtons) && renderPageHeaderButtons(props.dataSet?.selected)}
        </Fragment>
      );

      console.log('fieldStatus', fieldStatus);
      console.log('renderPageHeaderButtons', renderPageHeaderButtons);

      if (fieldStatus === 'toGenerateCount') {
        return nodeDataRef.mixedPackageFlag ? maintainButton : generateAndprintButton;
      } else if (fieldStatus === 'queryPrintCount') {
        return printButton;
      }
    });
    return [<Buttons dataSet={currentDs} />];
  };

  getCustomizeUnitCode = () => {
    const { nodeDataRef, fieldStatus } = this.state;
    const sortNo = nodeDataRef.sortNo === 0 ? '' : nodeDataRef.sortNo;
    let customizeUnitCode;
    switch (fieldStatus) {
      case 'toGenerateCount':
        customizeUnitCode = `SINV.BOX_LABEL_CREATION_LIST${sortNo}.TO_BE_GENERATED`;
        break;
      case 'generatingCount':
        customizeUnitCode = `SINV.BOX_LABEL_CREATION_LIST${sortNo}.GENERATED`;
        break;
      case 'queryPrintCount':
        customizeUnitCode = nodeDataRef.onlyLabelCodeFlag
          ? `SINV.BOX_LABEL_CREATION_LIST${sortNo}.QUERY_PRINT`
          : `SINV.BOX_LABEL_CREATION_LIST${sortNo}.NOT_UNIQUE`;
        break;
      default:
        customizeUnitCode = `SINV.BOX_LABEL_CREATION_LIST${sortNo}.TO_BE_GENERATED`;
        break;
    }
    return this.custList.includes(nodeDataRef.sortNo) ? customizeUnitCode : null;
  };

  getCustomizeFilterCode = () => {
    const { fieldStatus, nodeDataRef = {} } = this.state;
    const sortNo = nodeDataRef.sortNo === 0 ? '' : nodeDataRef.sortNo;
    let filterCode;
    switch (fieldStatus) {
      case 'toGenerateCount':
        filterCode = `SINV.BOX_LABEL_CREATION_LIST${sortNo}.TO_BE_GENERATED_QUERY`;
        break;
      case 'generatingCount':
        filterCode = `SINV.BOX_LABEL_CREATION_LIST${sortNo}.GENERATED_QUERY`;
        break;
      case 'queryPrintCount':
        filterCode = `SINV.BOX_LABEL_CREATION_LIST${sortNo}.QUERY_PRINT_QUERY`;
        break;
      default:
        filterCode = `SINV.BOX_LABEL_CREATION_LIST${sortNo}.TO_BE_GENERATED_QUERY`;
        break;
    }
    return this.custList.includes(nodeDataRef.sortNo) ? filterCode : null;
  };

  render() {
    const { customizeTable } = this.props;
    const {
      loading,
      fieldStatus,
      treeList = [],
      selectedKeys,
      cacheDataSet = {},
      nodeDataRef = {},
      condition,
    } = this.state;
    const buttons = this.getButtons(fieldStatus);
    const code = this.getCustomizeUnitCode();
    const filterCode = this.getCustomizeFilterCode();
    const currentDs = cacheDataSet[`${fieldStatus}${nodeDataRef.labelConfigId}`];
    return (
      <Fragment>
        <Header
          title={intl
            .get('sinv.boxLabelCreation.view.title.supplierBoxLabelCreation')
            .d('销售方标签创建/查询')}
        >
          {buttons}
        </Header>
        <Content>
          <div className={styles['execution-content']}>
            <div className="left-content">
              <Search
                defaultValue={condition}
                onSearch={this.conditionQuery}
                placeholder={intl
                  .get('sinv.boxLabelCreation.model.common.condition')
                  .d('订单/协议号/物料编码')}
              />
              <Spin spinning={loading}>
                {treeList.length > 0 && (
                  <Tree defaultExpandAll selectedKeys={selectedKeys} onSelect={this.onSelect}>
                    {this.loop(treeList)}
                  </Tree>
                )}
              </Spin>
            </div>
            <div className="right-content">
              {currentDs &&
                customizeTable(
                  {
                    code,
                    filterCode,
                  },
                  <Table
                    dataSet={currentDs}
                    columns={this.getCloumns(fieldStatus)}
                    queryFieldsLimit={3}
                    // buttons={buttons}
                  />
                )}
            </div>
          </div>
        </Content>
      </Fragment>
    );
  }
}
