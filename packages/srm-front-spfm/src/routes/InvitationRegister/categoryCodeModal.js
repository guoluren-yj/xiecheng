/**
 * ExecutedBysModal - 需求执行人多选LOV
 * @date: 2020-2-18
 * @author: maojiaqi <mao.jiaqi@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Row, Button, Col, Icon } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import Table from '@/components/VirtualTable';
import intl from 'utils/intl';
import styles from './categoryCodeModal.less';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

let _modal;

const modalKey = Modal.key();
@Form.create({ fieldNameProp: null })
export default class categoryCodeModal extends Component {
  state = {
    expandedList: [],
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 多选框
   */
  @Bind()
  handleRowSelect(selectRowKey, selectedRows) {
    const { handleRowSelect } = this.props;
    handleRowSelect(selectRowKey, selectedRows);
  }

  /**
   * 弹窗确定
   */
  @Bind()
  handleSaveRecord() {
    const { onSaveRecord } = this.props;
    onSaveRecord();
  }

  /**
   * 表单重置
   */
  @Bind()
  resetSearchDate() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   *点击展开节点触发方法
   *
   * @param {*Boolean} expanded 展开收起标志
   * @param {*Object} record 行记录
   */
  @Bind()
  onExpand(expanded, record = {}) {
    const { expandedList = [] } = this.state;
    this.setState({
      expandedList: expanded
        ? expandedList.concat(record.categoryId)
        : expandedList.filter((o) => o !== record.categoryId),
    });
  }

  /**
   *选中父级后同时选中子集
   *
   * @param {*Object} record 当前操作的行
   * @param {*boolean} selected 选中标记
   * @param {*Array} selectedRows 已经选中行数据
   */
  // @Bind()
  // selectChilds(record = {}, selected, selectedRows) {
  //   console.log(record, selected, selectedRows)
  //   const { selectedRowKeys,  } = this.props;
  //   let { parentCategoryId = -1 } = record;
  //   const { children = [], categoryId = -1 } = record;
  //   const selectArr = [categoryId];
  //   (function pushAll(arr) {
  //     if (arr && arr.length) {
  //       arr.forEach((element) => {
  //         selectArr.push(element.categoryId);
  //         if (element.children) {
  //           pushAll(element.children);
  //         }
  //       });
  //     }
  //   })(children);
  //   if (selected) {
  //     while (parentCategoryId > 0) {
  //       const temporaryList = selectedRows.filter(
  //         // eslint-disable-next-line no-loop-func
  //         (item) => item.categoryId === parentCategoryId
  //       );
  //       if (temporaryList.length >= 1) {
  //         selectArr.push(parentCategoryId);
  //         parentCategoryId = temporaryList[0].parentCategoryId || -1;
  //       } else {
  //         break;
  //       }
  //     }
  //     this.setSelectRows([...selectedRowKeys, ...selectArr]);
  //   } else {
  //     this.setSelectRows(selectedRowKeys.filter((item) => !selectArr.includes(item)));
  //   }
  // }
  /**
   * handleSearchCategory - 搜索采购品类，返回搜索结果的节点id和祖父节点id
   * @param {object} e - 事件对象
   */

  shouldComponentUpdate(nextProps, nextState) {
    const { categoryVisible, categoryName, loadingFetchcategoryCodeList } = nextProps;
    if (_modal && categoryVisible) {
      _modal.update({
        children: this.ModalContent(nextProps, nextState),
      });
    }
    if (categoryName !== this.props.categoryName) {
      return true;
    }
    if (loadingFetchcategoryCodeList) {
      return true;
    }
    // _modal.update()
  }

  @Bind()
  handleSearchCategory() {
    const { fetchLovData } = this.props;
    const exList = [];
    const exTreeKey = (list) => {
      if (list) {
        for (let i = 0; i < list.length; i++) {
          exList.push(list[i].categoryId);
          if (list[i].children) {
            exTreeKey(list[i].children);
          }
        }
      }
    };
    fetchLovData().then((res) => {
      if (res && res.length > 0) {
        exTreeKey(res);
        this.setState({
          expandedList: exList,
        });
      } else {
        this.setState({
          expandedList: [],
        });
      }
    });
  }

  ModalContent = (props, state) => {
    const {
      queryFields = [],
      fieldsColumn = [],
      loadingFetchcategoryCodeList,
      // executedBysPagination = {},
      categoryCodeList = [],
      form: { getFieldDecorator },
      // selectedChildRows,
      selectedRowKeys,
    } = props;
    const { expandedList = [] } = state;
    // 查询条件
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map((queryItem) => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={this.handleSearchCategory} />)}
          </FormItem>
        </Col>
      );
    });
    return (
      <React.Fragment>
        <div style={{ display: 'flex', marginBottom: '5px', marginTop: '5px' }}>
          <Row style={{ flex: 'auto' }}>{queryCondition}</Row>
          <div style={{ width: '80px', padding: '5px 0 0 15px' }}>
            <Button onClick={this.resetSearchDate}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </div>
          <div style={{ width: '80px', padding: '5px 0 0 15px' }}>
            <Button type="primary" onClick={this.handleSearchCategory}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </div>
        </div>
        <Table
          isTree
          data={categoryCodeList}
          loading={loadingFetchcategoryCodeList}
          columns={fieldsColumn}
          pagination={false}
          rowKey="categoryId"
          rowSelection={{
            selectedRowKeys,
            onChange: this.handleRowSelect,
            onSelect: () => {},
          }}
          height={400}
          expandedRowKeys={expandedList}
          onExpandChange={this.onExpand}
        />
      </React.Fragment>
    );
  };

  @Bind()
  handleModal() {
    const { handleModal } = this.props;
    handleModal(true);
    _modal = Modal.open({
      key: modalKey,
      style: {
        width: 710,
      },
      title: intl.get('spfm.invitationRegister.model.invitation.categoryCode').d('准入品类'),
      drawer: false,
      closable: true,
      destroyOnClose: true,
      children: this.ModalContent(this.props, this.state),
      onOk: () => this.handleSaveRecord(),
      onCancel: () => {
        _modal = null;
        handleModal(false);
      },
      afterClose: () => {
        Modal.destroyAll();
        document
          .getElementsByClassName('c7n-pro-modal-container')[0]
          .classList.remove(styles['c7n-pro-modal-container-category']);
      },
    });
    document
      .getElementsByClassName('c7n-pro-modal-container')[0]
      .classList.add(styles['c7n-pro-modal-container-category']);
  }

  render() {
    const {
      form: { getFieldValue },
      emitEmpty,
      categoryName,
      style,
    } = this.props;
    const lovClassNames1 = ['lov-input'];
    if (getFieldValue('categoryName')) {
      lovClassNames1.push('lov-suffix');
    }
    const suffix1 = (
      <React.Fragment>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={emitEmpty} />
        <Icon
          key="search"
          type="search"
          onClick={() => this.handleModal(true)}
          style={{ cursor: 'pointer', color: '#666', marginLeft: '4px' }}
        />
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <Input
          style={style}
          readOnly
          suffix={suffix1}
          value={categoryName}
          className={lovClassNames1.join(' ')}
          allowClear
        />
      </React.Fragment>
    );
  }
}
