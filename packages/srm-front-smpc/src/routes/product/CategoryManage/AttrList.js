import React from 'react';
import { Bind } from 'lodash-decorators';
import { Tabs } from 'hzero-ui';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import {
  enabledRenderer,
  yesOrNoRenderer,
  supportFlagRenderer,
} from '@/routes/product/utilsApi/renderer';

import AttrForm from './AttrForm';
import { attrTableDs, attrFormDs } from './ds';
import { saveAttrInfo } from './api';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnClose: true,
  drawer: true,
};
export default class AttrList extends React.Component {
  formDs;

  createModal;

  ds = new DataSet(attrTableDs());

  basicDs = new DataSet(attrTableDs(1));

  operationType = [
    intl.get('smpc.product.model.checkbox').d('多选'),
    intl.get('smpc.product.model.radio').d('单选'),
    intl.get('smpc.product.model.text').d('文本'),
    intl.get('smpc.product.model.bool').d('布尔值'),
  ];

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = { activeKey: 'all' };
  }

  componentDidMount() {
    const { cid } = this.props;
    if (cid) {
      this.query(cid);
    }
  }

  componentWillReceiveProps(newProps) {
    const { cid } = newProps;
    if (cid !== this.props.cid) {
      this.query(cid);
    }
  }

  @Bind()
  query(cid) {
    this.ds.setQueryParameter('categoryId', cid);
    this.basicDs.setQueryParameter('categoryId', cid);
    this.ds.query();
    this.basicDs.query();
  }

  @Bind()
  getColumns() {
    const { onNext = (e) => e } = this.props;
    const columns = [
      {
        name: 'attributeCode',
        width: 140,
      },
      {
        name: 'attributeName',
      },
      {
        name: 'baseAttrFlag',
        width: 90,
        renderer: yesOrNoRenderer,
      },
      {
        name: 'requiredFlag',
        width: 90,
        renderer: yesOrNoRenderer,
      },
      {
        name: 'operationType',
        width: 90,
        renderer: ({ value }) => this.operationType[value],
      },
      {
        name: 'valueCustom',
        width: 140,
        renderer: supportFlagRenderer,
      },
      {
        name: 'enabledFlag',
        width: 90,
        renderer: enabledRenderer,
      },
      {
        name: 'operation',
        width: 160,
        renderer: ({ record }) => {
          const line = record.toData();
          return (
            <span className="action-link">
              <a onClick={() => this.attrModal(line)} disabled={line.baseAttrFlag === 1}>
                {intl.get('smpc.product.button.edit').d('编辑')}
              </a>
              <a onClick={() => onNext(line, 5)} disabled={line.operationType === 2}>
                {intl.get('smpc.categoryManage.button.lookProperty').d('查看属性值')}
              </a>
            </span>
          );
        },
      },
    ];
    return columns;
  }

  @Bind()
  attrModal(line) {
    const { cid } = this.props;
    this.formDs = new DataSet(attrFormDs());
    // 设置方式默认单选，默认支持自定义属性值，默认非必填，默认启用
    this.formDs.create(
      line || { categoryId: cid, operationType: 1, valueCustom: 1, requiredFlag: 0, enabledFlag: 1 }
    );
    this.createModal = Modal.open({
      ...modalProps,
      key: 'attrModal',
      style: { width: 380 },
      title: line
        ? intl.get('smpc.categoryManage.view.editAttr').d('编辑属性')
        : intl.get('smpc.categoryManage.view.bindNewProperty').d('绑定新属性'),
      onOk: () => this.save(),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <AttrForm dataSet={this.formDs} />,
    });
  }

  @Bind()
  async save() {
    const flag = await this.formDs.validate();
    if (flag) {
      const params = this.formDs.toJSONData()[0];
      const result = getResponse(await saveAttrInfo({ ...params }));
      if (result) {
        notification.success();
        this.createModal.close();
        this.ds.query(this.ds.currentPage);
      }
    }
    return false;
  }

  render() {
    const { activeKey } = this.state;
    const columns = this.getColumns();
    const tabPaneList = [
      {
        label: intl.get('smpc.categoryManage.view.allAttrs').d('所有属性'),
        key: 'all',
        dataSet: this.ds,
      },
      {
        label: intl.get('smpc.product.model.basicAttrs').d('基本属性'),
        key: 'basic',
        dataSet: this.basicDs,
      },
    ];

    return (
      <Tabs
        activeKey={activeKey}
        tabBarStyle={{ marginTop: '-16px' }}
        onChange={(key) => this.setState({ activeKey: key })}
      >
        {tabPaneList.map((item) => (
          <Tabs.TabPane tab={item.label} key={item.key}>
            <Table
              dataSet={item.dataSet}
              // buttons={item.buttons}
              columns={columns}
              columnResizable
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
    );
  }
}
