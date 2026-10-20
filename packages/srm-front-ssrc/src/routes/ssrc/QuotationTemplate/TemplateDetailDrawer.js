/**
 * TemplateDetailDrawer - 模板明细抽屉
 * @date: 2019-08-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { sum, isNumber, isEmpty, filter, without } from 'lodash';
import {
  Button,
  Row,
  Col,
  Form,
  Input,
  Modal,
  InputNumber,
  Select,
  Tabs,
  Icon,
  Tooltip,
  Tag,
} from 'hzero-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { Header, Content } from 'components/Page';
import TLEditor from 'components/TLEditor';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemsToPagination,
  delItemsToPagination,
  getResponse,
} from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';
import common from '@/routes/ssrc/common.less';
import { fetchSummaryItems } from '@/services/quotationTemplateService';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import Iconfont from '../components/Icons'; // 下载至本地的icon

import CopyExistTplModal from './CopyExistTplModal';
import AttrsDrawer from './AttrsDrawer';
import styles from './index.less';

const FormItem = Form.Item;
const { TabPane } = Tabs;
const promptCode = 'ssrc.quotationTemplate';

@Form.create({ fieldNameProp: null })
@connect(({ quotationTemplate, loading }) => ({
  quotationTemplate,
  organizationId: getCurrentOrganizationId(),
  queryTemplateDetailLoading: loading.effects['quotationTemplate/queryTemplateDetailRow'],
  fetchDetailElementLoading:
    loading.effects['quotationTemplate/fetchDetailElement'] ||
    loading.effects['quotationTemplate/fetchTwoDetails'],
  saveTemplateDetailLoading:
    loading.effects['quotationTemplate/saveQuoRowDetail'] ||
    loading.effects['quotationTemplate/saveQuoElementDetail'],
  deleteTemplateDetailLoading:
    loading.effects['quotationTemplate/deleteTemplateDetail'] ||
    loading.effects['quotationTemplate/deleteElementDetail'],
  nextDetaliItemLoading: loading.effects['quotationTemplate/queryDetaliItem'],
  saveLineDetailLoading:
    loading.effects['quotationTemplate/saveRowDetail'] ||
    loading.effects['quotationTemplate/saveElementDetail'],
}))
export default class TemplateDetailDrawer extends Component {
  state = {
    defaultShow: true,
    dataSource: [],
    attrsDrawerVisible: false, // 组件属性侧滑框
    selectedRows: [], // 选中项
    selectedRowKeys: [], // 选中项的key
    copyExistTplVisible: false, // 复制已有品类模板的visible
    activeKey: 'col',
    expandedRowKeys: [], // 报价明细项展开行
    summaryItemList: {}, // 指定范围数据
  };

  componentDidMount() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    const lovCodes = {
      inputTypeCode: 'SSRC.QUOTATION_INPUT_TYPE',
      summaryTypeCode: 'SSRC.QUOTATION_DETAIL_SUMMARY',
      quotationDetailType: 'SSRC.QUOTATION_DETAIL_TYPE',
    };
    dispatch({
      type: 'quotationTemplate/batchCode',
      payload: {
        lovCodes,
      },
    });
    dispatch({
      type: 'quotationTemplate/queryDetailHeader',
      payload: {
        templateId: params.templateId,
      },
    });
    this.handleTemplateDetali();
  }

  /**
   *  复制已有品类模板Modal
   */
  @Bind()
  handleCopyExistTpl() {
    const { copyExistTplVisible } = this.state;
    this.setState({ copyExistTplVisible: !copyExistTplVisible });
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 组件改变时执行
   */
  @Bind()
  updateComponent(value, record, lovList) {
    // eslint-disable-next-line
    if (value) {
      record.$form.setFieldsValue({
        lovCode: undefined,
        componentId: lovList.componentId,
        componentDescription: lovList.componentDescription,
      });
      // 类型不为数值并且calculationRule有值
      if (value !== 'InputNumber' && record.$form.getFieldValue('calculationRule')) {
        record.$form.setFieldsValue({
          calculationRule: undefined,
        });
      }
      // 类型不为数值，文本并且defaultFlag有值
      if (
        value !== 'InputNumber' ||
        (value !== 'Input' && record.$form.getFieldValue('defaultFlag'))
      ) {
        record.$form.setFieldsValue({
          defaultFlag: 0,
        });
      }
    } else {
      record.$form.setFieldsValue({
        lovCode: undefined,
        componentId: undefined,
        componentDescription: undefined,
      });
    }
    if (record.$form.getFieldValue('calculationRule')) {
      record.$form.setFieldsValue({
        calculationRule: undefined,
      });
    }
    if (record.$form.getFieldValue('defaultFlag')) {
      record.$form.setFieldsValue({
        defaultFlag: 0,
      });
    }
  }

  /**
   * 计算规则改变时执行
   */
  @Bind()
  changeCalculationRule(value, record) {
    if (record.$form.getFieldValue('defaultFlag')) {
      record.$form.setFieldsValue({
        defaultFlag: 0,
      });
    }
  }

  /**
   * 默认值改变时执行
   */
  @Bind()
  changeDefaultFlag(value, record) {
    if (record.$form.getFieldValue('requiredFlag')) {
      record.$form.setFieldsValue({
        requiredFlag: 0,
      });
    }
  }

  /**
   * 改变值集触发
   */
  @Bind()
  updateLov(value, record, lovList) {
    // eslint-disable-next-line
    if (value) {
      record.$form.setFieldsValue({
        lovId: lovList.lovId,
      });
    }
  }

  /**
   * 查询模板明细
   */
  @Bind()
  handleTemplateDetali(flag = 0, page = {}) {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: 'quotationTemplate/queryTemplateDetailRow',
      payload: {
        page,
        templateId: params.templateId,
      },
    }).then((res) => {
      if (res) {
        if (flag === 1) {
          this.setState({
            selectedRows: [], // 选中项
            selectedRowKeys: [], // 选中项的key
          });
        }
        this.fetchDetailElement();
        this.setState({
          dataSource: res.content.map((item) => ({ ...item, _status: 'update' })),
          defaultShow: this.state.activeKey === 'col',
        });
        if (this.state.activeKey === 'element') {
          this.setState({
            expandedRowKeys: [],
          });
        }
      }
    });
  }

  /**
   * 下一步查询自定义报价明细项
   */
  @Bind()
  handleDetaliItem() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    const { dataSource } = this.state;
    const quotationTplDtls = getEditTableData(dataSource, ['quotationColumnId', '_status']);
    if (!isEmpty(quotationTplDtls)) {
      dispatch({
        type: 'quotationTemplate/queryDetaliItem',
        payload: {
          templateId: params.templateId,
          quotationColumns: quotationTplDtls,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            activeKey: 'element',
            defaultShow: false,
            selectedRows: [], // 选中项
            selectedRowKeys: [], // 选中项的key
            dataSource: res.map((item) => ({ ...item, _status: 'update' })),
          });

          // reset表单，解决表格field不更新的问题,后台值赋值不了表单
          this.props.form.resetFields();
          // 查询明细项列表
          this.fetchDetailElement();
        }
      });
    }
  }

  /**
   * 查询明细项列表
   */
  @Bind()
  fetchDetailElement(page = {}) {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: 'quotationTemplate/fetchDetailElement',
      payload: {
        page,
        templateId: params.templateId,
      },
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { dataSource } = this.state;
    this.setState({
      dataSource: [
        { quotationColumnId: uuidv4(), _status: 'create', enabledFlag: 1, requiredFlag: 0 },
        ...dataSource,
      ],
    });
    this.props.dispatch({
      type: 'quotationTemplate/updateState',
      payload: {
        templateDetailPagination: addItemsToPagination(
          1,
          dataSource.length,
          this.props?.quotationTemplate?.templateDetailPagination
        ),
      },
    });
  }

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabsChange(newActiveKey) {
    const {
      quotationTemplate: { detailHeader = {} },
    } = this.props;
    const { activeKey } = this.state;
    if (newActiveKey === 'element' && detailHeader.templateStatus !== 'RELEASED') {
      return;
    }

    if (activeKey === 'element' && newActiveKey === 'col') {
      this.setState({
        expandedRowKeys: [],
      });
    }

    this.setState({ activeKey: newActiveKey });
  }

  @Bind()
  handleSaveDetail(quotationTplDtls, formValues) {
    const {
      dispatch,
      match: { params },
    } = this.props;

    const save = () => {
      dispatch({
        type: 'quotationTemplate/saveQuoRowDetail',
        payload: {
          templateId: params.templateId,
          quotationColumns: quotationTplDtls,
          ...formValues,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch({
            type: 'quotationTemplate/queryDetailHeader',
            payload: {
              templateId: params.templateId,
            },
          });
          this.handleTemplateDetali();
        }
      });
    };

    save();
  }

  /**
   * 大保存自定义明细列
   */
  @Bind()
  handleSave() {
    const {
      form: { getFieldsValue },
    } = this.props;
    const { dataSource } = this.state;
    const quotationTplDtls = getEditTableData(dataSource, ['quotationColumnId', '_status']) || [];
    const formValues = getFieldsValue();
    this.handleSaveDetail(quotationTplDtls, formValues);
    // if (!isEmpty(quotationTplDtls)) {
    //   this.handleSaveDetail(quotationTplDtls, formValues);
    // }
  }

  /**
   * 自定义报价明细列保存
   */
  @Bind()
  saveEditRow() {
    const { dataSource } = this.state;
    const quotationTplDtls = getEditTableData(dataSource, ['quotationColumnId', '_status']);
    if (!isEmpty(quotationTplDtls)) {
      const {
        dispatch,
        match: { params },
        quotationTemplate: { templateDetailPagination },
      } = this.props;
      dispatch({
        type: 'quotationTemplate/saveRowDetail',
        payload: {
          templateId: params.templateId,
          quotationColumns: quotationTplDtls,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleTemplateDetali(templateDetailPagination);
        }
      });
    }
  }

  /**
   * 删除已有数据(调接口删除)
   */
  @Bind()
  handleRowsDelete(existRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotationTemplate/deleteTemplateDetail',
      payload: existRows.map((n) => n.quotationColumnId),
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRowKeys: [],
        });
        notification.success();
        this.handleTemplateDetali();
      }
    });
  }

  /**
   * 删除新建数据(前端数据更新)
   */
  @Bind()
  handleUpdateState(newList) {
    const { selectedRows, dataSource } = this.state;
    this.setState({
      dataSource: newList,
      selectedRowKeys: [],
    });
    this.props.dispatch({
      type: 'quotationTemplate/updateState',
      payload: {
        templateDetailPagination: delItemsToPagination(
          selectedRows.length,
          dataSource.length,
          this.props?.quotationTemplate?.templateDetailPagination
        ),
      },
    });
    notification.success();
  }

  /**
   * 确认删除框
   */
  @Bind()
  handleDeleteConfirm(onOk) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk,
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRows, dataSource } = this.state;
    // 获取selectedRows中的新建行
    const newRows = selectedRows.filter((item) => item._status === 'create');
    // 获取新建行的templateDetailId
    const newRowsKeys = newRows.map((item) => item.quotationColumnId);
    // 获取selectedRows中的现有行
    const existRows = selectedRows.filter((item) => item._status !== 'create');
    // 在dataSource中排除selectedRows中的新建行
    const newList = dataSource.filter((item) => !newRowsKeys.includes(item.quotationColumnId));

    if (isEmpty(newRows)) {
      this.handleDeleteConfirm(() => this.handleRowsDelete(existRows));
    } else if (isEmpty(existRows)) {
      this.handleDeleteConfirm(() => this.handleUpdateState(newList));
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
        onOk: () => {
          dispatch({
            type: 'quotationTemplate/deleteTemplateDetail',
            payload: existRows.map((n) => n.quotationColumnId),
          }).then((res) => {
            if (res) {
              this.handleUpdateState(newList);
              this.handleTemplateDetali();
            }
          });
        },
      });
    }
  }

  // 显示组件
  @Bind()
  showAttrsDrawer(record) {
    this.setState({
      attrsDrawerVisible: true,
      drawerData: record,
    });
  }

  @Bind()
  hideAttrsDrawer() {
    this.setState({
      attrsDrawerVisible: false,
    });
  }

  /**
   * 获取-自定义明细列-保存数据
   */
  getUpdateData = (source) => {
    const { form } = this.props;
    let data = [];
    if (Array.isArray(source) && !isEmpty(source)) {
      data = source.map((item) => {
        const { quotationColumns = [] } = item;
        const quotationDetailType = form.getFieldValue(
          `quotationDetailType#${item.templateDetailId}`
        );
        const newQuotationCloumns = quotationColumns.map((elementItem) => {
          let field = 'quotationColumnValue';
          if (quotationDetailType === 'NO' && elementItem.defaultFlag) {
            field = 'columnDefaultValue';
          } else if (
            quotationDetailType === 'RULE' &&
            elementItem.componentType === 'InputNumber'
          ) {
            field = 'quoTplDtlCalculationRule';
          }
          return {
            ...elementItem,
            [field]: form.getFieldValue(
              `inputTypeCode#${item.templateDetailId}#${elementItem.quotationColumnId}`
            ),
          };
        });
        if (!isEmpty(item.children) && Array.isArray(item.children)) {
          return {
            ...item,
            quotationDetailType,
            templateDetailId: item._status === 'create' ? undefined : item.templateDetailId,
            configCode: form.getFieldValue(`configCode#${item.templateDetailId}`),
            configName: form.getFieldValue(`configName#${item.templateDetailId}`),
            lineSequence: form.getFieldValue(`lineSequence#${item.templateDetailId}`),
            enabledFlag: form.getFieldValue(`enabledFlag#${item.templateDetailId}`),
            summaryItemList: form.getFieldValue(`summaryItemList#${item.templateDetailId}`),
            quotationColumns: newQuotationCloumns,
            children: this.getUpdateData(item.children),
          };
        } else {
          return {
            ...item,
            quotationDetailType,
            templateDetailId: item._status === 'create' ? undefined : item.templateDetailId,
            configCode: form.getFieldValue(`configCode#${item.templateDetailId}`),
            configName: form.getFieldValue(`configName#${item.templateDetailId}`),
            lineSequence: form.getFieldValue(`lineSequence#${item.templateDetailId}`),
            enabledFlag: form.getFieldValue(`enabledFlag#${item.templateDetailId}`),
            summaryItemList: form.getFieldValue(`summaryItemList#${item.templateDetailId}`),
            quotationColumns: newQuotationCloumns,
          };
        }
      });
    }
    return data;
  };

  /**
   * 大保存自定义明细项
   */
  @Bind()
  handleElement() {
    const {
      form: { getFieldsValue },
    } = this.props;
    const {
      form,
      dispatch,
      match: { params },
      quotationTemplate: { elementDetailList, elementDetailPagination },
    } = this.props;
    const formValues = getFieldsValue();
    // 先验证头，再验证行
    form.validateFieldsAndScroll({ force: true }, (err) => {
      if (!err) {
        const { allowCreateFlag, attachmentNeedFlag, attachmentUuid } = formValues;
        dispatch({
          type: 'quotationTemplate/saveQuoElementDetail',
          payload: {
            allowCreateFlag,
            attachmentNeedFlag,
            attachmentUuid,
            templateId: params.templateId,
            quotationTplDtls: this.getUpdateData(elementDetailList),
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.setState({
              expandedRowKeys: [],
              summaryItemList: {},
            });
            dispatch({
              type: 'quotationTemplate/queryDetailHeader',
              payload: {
                templateId: params.templateId,
              },
            });
            this.fetchDetailElement(elementDetailPagination);
          }
        });
      }
    });
  }

  /**
   * 自定义报价明细项保存
   */
  @Bind()
  saveEditElement() {
    const {
      form,
      dispatch,
      match: { params },
      quotationTemplate: { elementDetailList, elementDetailPagination },
    } = this.props;
    // 先验证头，再验证行
    form.validateFieldsAndScroll({ force: true }, (err) => {
      if (!err) {
        dispatch({
          type: 'quotationTemplate/saveElementDetail',
          payload: {
            templateId: params.templateId,
            quotationColumns: this.getUpdateData(elementDetailList),
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.setState({
              expandedRowKeys: [],
              summaryItemList: {},
            });
            // 查询明细项列表
            this.fetchDetailElement(elementDetailPagination);
          }
        });
      }
    });
  }

  /**
   * 新建自定义报价明细项-一级
   */
  @Bind()
  handleElementAdd() {
    const {
      dispatch,
      // form: { getFieldDecorator },
      quotationTemplate: { elementDetailList = [], elementDetailPagination = {} },
    } = this.props;
    const { dataSource } = this.state;
    let newColnmn = [];
    if (!isEmpty(dataSource)) {
      newColnmn = dataSource.map((item) => {
        return {
          quotationColumnId: item.quotationColumnId,
          columnName: item.columnName,
          columnCode: item.columnCode,
          quotationColumnValue: item.quotationColumnValue,
          componentType: item.componentType,
          defaultFlag: item.defaultFlag,
        };
      });
    }
    dispatch({
      type: 'quotationTemplate/updateState',
      payload: {
        elementDetailList: [
          {
            templateDetailId: uuidv4(),
            quotationColumns: newColnmn,
            enabledFlag: 1,
            parentDetailId: 0, // 一级细项标记
            quotationDetailType: 'NO', // 明细项类型，默认值不汇总
            _status: 'create', // 新建标记位
          },
          ...elementDetailList,
        ],
        elementDetailPagination: addItemsToPagination(
          1,
          elementDetailList.length,
          elementDetailPagination
        ),
      },
    });
  }

  /**
   * 新建-二级报价明细
   */
  @Bind()
  createDetailsChildren(record) {
    const {
      dispatch,
      match: { params },
      quotationTemplate: { elementDetailList = [] },
    } = this.props;
    const { dataSource, expandedRowKeys = [] } = this.state;
    let newColnmn = [];
    if (!isEmpty(dataSource)) {
      newColnmn = dataSource.map((item) => {
        return {
          quotationColumnId: item.quotationColumnId,
          columnName: item.columnName,
          columnCode: item.columnCode,
          quotationColumnValue: item.quotationColumnValue,
          componentType: item.componentType,
          defaultFlag: item.defaultFlag,
        };
      });
    }
    // 未展开，先查询接口，再插入children
    if (!expandedRowKeys.includes(record.templateDetailId) && record.childFlag) {
      dispatch({
        type: 'quotationTemplate/fetchTwoDetails',
        payload: {
          elementDetailList,
          templateId: params.templateId,
          templateDetailId: record.templateDetailId,
        },
      }).then((res) => {
        if (res) {
          // 新建二级报价明细项
          const newElementDetailList = res.map((item) => {
            if (item.templateDetailId === record.templateDetailId) {
              return !isEmpty(item.children)
                ? {
                    ...item,
                    children: [
                      {
                        templateDetailId: uuidv4(),
                        quotationColumns: newColnmn,
                        enabledFlag: record.enabledFlag,
                        parentDetailId: record.templateDetailId,
                        parentEnabledFlag: record.enabledFlag,
                        quotationDetailType: 'NO', // 明细项类型，默认值不汇总
                        _status: 'create', // 新建标记位
                      },
                      ...item.children,
                    ],
                  }
                : {
                    ...item,
                    children: [
                      {
                        templateDetailId: uuidv4(),
                        quotationColumns: newColnmn,
                        enabledFlag: record.enabledFlag,
                        parentDetailId: record.templateDetailId,
                        parentEnabledFlag: record.enabledFlag,
                        quotationDetailType: 'NO', // 明细项类型，默认值不汇总
                        _status: 'create', // 新建标记位
                      },
                    ],
                  };
            } else {
              return item;
            }
          });
          dispatch({
            type: 'quotationTemplate/updateState',
            payload: {
              elementDetailList: newElementDetailList,
            },
          });
        }
      });
    } else {
      // 新建二级报价明细项
      const newElementDetailList = elementDetailList.map((item) => {
        if (item.templateDetailId === record.templateDetailId) {
          return !isEmpty(item.children)
            ? {
                ...item,
                children: [
                  {
                    templateDetailId: uuidv4(),
                    quotationColumns: newColnmn,
                    enabledFlag: record.enabledFlag,
                    parentDetailId: record.templateDetailId,
                    parentEnabledFlag: record.enabledFlag,
                    quotationDetailType: 'NO', // 明细项类型，默认值不汇总
                    _status: 'create', // 新建标记位
                  },
                  ...item.children,
                ],
              }
            : {
                ...item,
                children: [
                  {
                    templateDetailId: uuidv4(),
                    quotationColumns: newColnmn,
                    enabledFlag: record.enabledFlag,
                    parentDetailId: record.templateDetailId,
                    parentEnabledFlag: record.enabledFlag,
                    quotationDetailType: 'NO', // 明细项类型，默认值不汇总
                    _status: 'create', // 新建标记位
                  },
                ],
              };
        } else {
          return item;
        }
      });
      dispatch({
        type: 'quotationTemplate/updateState',
        payload: {
          elementDetailList: newElementDetailList,
        },
      });
    }
    if (!expandedRowKeys.includes(record.templateDetailId)) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, record.templateDetailId],
      });
    }
  }

  /**
   * 展开二级细项
   */
  @Bind()
  expandTwoDetails(expanded, record) {
    const {
      dispatch,
      match: { params },
      quotationTemplate: { elementDetailList = [] },
    } = this.props;
    const { expandedRowKeys = [] } = this.state;
    // 展开
    if (expanded && !expandedRowKeys.includes(record.templateDetailId)) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, record.templateDetailId],
      });
      dispatch({
        type: 'quotationTemplate/fetchTwoDetails',
        payload: {
          elementDetailList,
          templateId: params.templateId,
          templateDetailId: record.templateDetailId,
        },
      });
    } else if (!expanded && expandedRowKeys.includes(record.templateDetailId)) {
      // 清理数据
      const newData = elementDetailList.map((item) => {
        if (item.templateDetailId === record.templateDetailId) {
          const { children, ...otherItem } = item;
          return record.childFlag
            ? {
                ...item,
                children: [],
              }
            : otherItem;
        } else {
          return item;
        }
      });
      this.setState({
        expandedRowKeys: without(expandedRowKeys, record.templateDetailId),
      });
      dispatch({
        type: 'quotationTemplate/updateState',
        payload: {
          elementDetailList: newData,
        },
      });
    }
  }

  /**
   * 删除自定义报价明细项
   */
  @Bind()
  handleElememntDelete() {
    const {
      dispatch,
      quotationTemplate: { elementDetailList, elementDetailPagination },
    } = this.props;
    const { selectedRows, selectedRowKeys, expandedRowKeys = [] } = this.state;
    // 获取元数据中要删除行
    const oldDeleteRows = selectedRows && selectedRows.filter((item) => item._status === 'update');
    let selectData = [];
    let restData = [];
    // 一级元素
    if (isEmpty(expandedRowKeys)) {
      // 过滤出勾选数据
      selectData = filter(elementDetailList, (item) => {
        return selectedRowKeys.indexOf(item.templateDetailId) >= 0;
      });
      // 未有二级展开项，过滤出勾选数据剩下数据
      restData = filter(elementDetailList, (item) => {
        return selectedRowKeys.indexOf(item.templateDetailId) < 0;
      });
    } else {
      // 有展开项
      const getRestData = (source, keys) => {
        const data = [];
        for (let i = 0; i < source.length > 0; i++) {
          if (!keys.includes(source[i].templateDetailId)) {
            data.push(source[i]);
          }
          if (Array.isArray(source[i].children) && !isEmpty(source[i].children)) {
            Object.assign(source[i], {
              children: getRestData(source[i].children, selectedRowKeys),
            });
          }
        }
        return data;
      };
      restData = getRestData(elementDetailList, selectedRowKeys);
      // 一级
      selectData = selectedRows.filter((item) => item.parentDetailId === 0) || [];
    }
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
        onOk: () => {
          const remoteDelete = [];
          const localDelete = [];
          selectedRows.forEach((item) => {
            if (item._status === 'create') {
              localDelete.push(item);
            }
            if (item._status === 'update') {
              remoteDelete.push(item);
            }
          });
          if (isEmpty(remoteDelete)) {
            dispatch({
              type: 'quotationTemplate/updateState',
              payload: {
                elementDetailList: restData,
                elementDetailPagination: delItemsToPagination(
                  selectData.length,
                  elementDetailList.length,
                  elementDetailPagination
                ),
              },
            });
            this.setState({ selectedRows: [], selectedRowKeys: [] });
          } else {
            dispatch({
              type: 'quotationTemplate/deleteElementDetail',
              payload: oldDeleteRows.map((n) => n.templateDetailId),
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'quotationTemplate/updateState',
                  payload: {
                    elementDetailList: restData,
                    elementDetailPagination: delItemsToPagination(
                      selectData.length,
                      elementDetailList.length,
                      elementDetailPagination
                    ),
                  },
                });
                this.setState({ selectedRows: [], selectedRowKeys: [], summaryItemList: {} });
              }
            });
          }
        },
      });
    }
  }

  /**
   * 改变启用-父级启用，子集可编辑，父级禁用，子集不可编辑
   */
  @Bind()
  changeEnabledFlag(checked, record = {}) {
    const {
      dispatch,
      match: { params },
      quotationTemplate: { elementDetailList = [] },
    } = this.props;
    const { expandedRowKeys = [] } = this.state;
    // 父级
    if (record.parentDetailId === 0 && record._status === 'update') {
      const { children, ...otherRecord } = record;
      dispatch({
        type: 'quotationTemplate/changeEnabledFlag',
        payload: {
          record: { ...otherRecord, enabledFlag: checked },
          templateId: params.templateId,
        },
      }).then((res) => {
        if (res) {
          const newElementDetailList = elementDetailList.map((item) => {
            if (item.templateDetailId === record.templateDetailId) {
              return {
                ...item,
                objectVersionNumber: res.objectVersionNumber,
                enabledFlag: res.enabledFlag,
              };
            } else {
              return item;
            }
          });
          dispatch({
            type: 'quotationTemplate/updateState',
            payload: {
              elementDetailList: newElementDetailList,
            },
          });
          // 已展开二级，查询二级
          if (expandedRowKeys.includes(record.templateDetailId)) {
            dispatch({
              type: 'quotationTemplate/fetchTwoDetails',
              payload: {
                elementDetailList: newElementDetailList,
                templateId: params.templateId,
                templateDetailId: record.templateDetailId,
              },
            });
          }
        }
      });
    }
  }

  /**
   * 查询指定范围下拉框数据
   */
  @Bind()
  async handleFocusSummaryItems(record = {}) {
    const {
      match: { params },
    } = this.props;
    const { summaryItemList = {} } = this.state;
    if (isEmpty(summaryItemList[record.templateDetailId])) {
      fetchSummaryItems({
        templateDetailId: record._status === 'update' ? record.templateDetailId : undefined,
        parentDetailId: record.parentDetailId,
        templateId: params.templateId,
      }).then((res) => {
        const responseRes = getResponse(res);
        if (responseRes && !responseRes.failed) {
          this.setState({
            summaryItemList: { ...summaryItemList, [record.templateDetailId]: responseRes.content },
          });
        }
      });
    }
  }

  /**
   * 改变明细项类型
   */
  @Bind()
  changeQuotationDetailType(value, record = {}) {
    const oldValue = this.props.form.getFieldValue(
      `quotationDetailType#${record.templateDetailId}`
    );
    if (value === 'SCOPE') {
      if (oldValue === 'NO' || oldValue === 'ALL' || oldValue === 'RULE') {
        record.quotationColumnAttrs.forEach((item) => {
          this.props.form.setFieldsValue({
            [`inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`]: 'NO',
          });
        });
      }
    } else if (value === 'ALL') {
      if (oldValue === 'SCOPE') {
        this.props.form.setFieldsValue({
          [`summaryItemList#${record.templateDetailId}`]: undefined,
        });
        record.quotationColumnAttrs.forEach((item) => {
          this.props.form.setFieldsValue({
            [`inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`]: 'NO',
          });
        });
      } else if (oldValue === 'NO' || oldValue === 'RULE') {
        record.quotationColumnAttrs.forEach((item) => {
          this.props.form.setFieldsValue({
            [`inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`]: 'NO',
          });
        });
      }
    } else if (value === 'NO') {
      if (oldValue === 'SCOPE') {
        this.props.form.setFieldsValue({
          [`summaryItemList#${record.templateDetailId}`]: undefined,
        });
        record.quotationColumnAttrs.forEach((item) => {
          this.props.form.setFieldsValue({
            [`inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`]: '',
          });
        });
      } else if (oldValue === 'ALL') {
        record.quotationColumnAttrs.forEach((item) => {
          this.props.form.setFieldsValue({
            [`inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`]: '',
          });
        });
      } else if (oldValue === 'RULE') {
        record.quotationColumnAttrs.forEach((item) => {
          if (item.componentType === 'InputNumber') {
            this.props.form.setFieldsValue({
              [`inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`]: '',
            });
          }
        });
      }
    } else if (value === 'RULE') {
      if (oldValue === 'NO') {
        record.quotationColumnAttrs.forEach((item) => {
          if (
            item.componentType === 'InputNumber' ||
            (item.componentType === 'Input' && item.defaultFlag)
          ) {
            this.props.form.setFieldsValue({
              [`inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`]: '',
            });
          }
        });
      } else if (oldValue === 'SCOPE') {
        this.props.form.setFieldsValue({
          [`summaryItemList#${record.templateDetailId}`]: undefined,
        });
        record.quotationColumnAttrs.forEach((item) => {
          this.props.form.setFieldsValue({
            [`inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`]: '',
          });
        });
      } else if (oldValue === 'ALL') {
        record.quotationColumnAttrs.forEach((item) => {
          this.props.form.setFieldsValue({
            [`inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`]: '',
          });
        });
      }
    }
  }

  /**
   * 渲染列组件
   */
  @Bind()
  renderColumnComponent(item = {}, record = {}) {
    const {
      quotationTemplate: {
        code: { inputTypeCode = [], summaryTypeCode = [] },
      },
    } = this.props;
    const flag =
      this.props.form.getFieldValue(`quotationDetailType#${record.templateDetailId}`) === 'SCOPE' ||
      this.props.form.getFieldValue(`quotationDetailType#${record.templateDetailId}`) === 'ALL';
    const selectType = flag ? summaryTypeCode : inputTypeCode;
    let component = (
      <Select
        allowClear
        style={{ width: '100%' }}
        disabled={flag && item.componentType !== 'InputNumber'}
      >
        {selectType.map((n) => (
          <Select.Option value={n.value} key={n.value}>
            {n.meaning}
          </Select.Option>
        ))}
      </Select>
    );
    // 默认值功能
    if (
      this.props.form.getFieldValue(`quotationDetailType#${record.templateDetailId}`) === 'NO' &&
      item.defaultFlag
    ) {
      switch (item.componentType) {
        case 'InputNumber':
          component = <InputNumber disabled={flag} style={{ width: '100%' }} />;
          break;
        case 'Input':
          component = (
            <Input
              disabled={flag && item.componentType !== 'InputNumber'}
              style={{ width: '100%' }}
            />
          );
          break;
        default:
          break;
      }
    }
    // 指定规则, 数值格式字段变为文本框格式
    if (
      this.props.form.getFieldValue(`quotationDetailType#${record.templateDetailId}`) === 'RULE'
    ) {
      if (item.componentType === 'InputNumber') {
        component = (
          <Input
            disabled={flag && item.componentType !== 'InputNumber'}
            style={{ width: '100%' }}
            suffix={
              <Tooltip
                title={intl.get(`${promptCode}.view.message.rule.tip`).d(
                  // eslint-disable-next-line no-template-curly-in-string
                  '注意：输入细项编码，细项编码只能由数字、字母、下划线组成，请按照${细项编码}输入，例${010}。'
                )}
              >
                <Icon type="info-circle-o" style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
          />
        );
      }
    }
    return component;
  }

  /**
   * 渲染单元格值
   */
  @Bind()
  renderColumnValue(item = {}, elementItem = {}) {
    const {
      quotationTemplate: { detailHeader },
    } = this.props;
    let value;
    if (detailHeader.templateStatus === 'RELEASED') {
      value = elementItem.quotationColumnValueMeaning;
      if (item.quotationDetailType === 'NO') {
        value = elementItem.defaultFlag
          ? elementItem.columnDefaultValue
          : elementItem.quotationColumnValueMeaning;
      } else if (item.quotationDetailType === 'RULE') {
        value =
          elementItem.componentType === 'InputNumber'
            ? elementItem.quoTplDtlCalculationRule
            : elementItem.quotationColumnValueMeaning;
      }
    } else {
      value = elementItem.quotationColumnValue;
      if (item.quotationDetailType === 'NO') {
        value = elementItem.defaultFlag
          ? elementItem.columnDefaultValue
          : elementItem.quotationColumnValue;
      } else if (item.quotationDetailType === 'RULE') {
        value =
          elementItem.componentType === 'InputNumber'
            ? elementItem.quoTplDtlCalculationRule
            : elementItem.quotationColumnValue;
      }
    }
    return value;
  }

  /**
   * 渲染自定义项表格表格数据源
   *
   * @param {*} [elementDetailList=[]]
   * @returns
   * @memberof ScoreElementTable
   */
  renderDataSource(elementDetailList = []) {
    const getData = (source) => {
      if (Array.isArray(source)) {
        const restructureSource =
          source &&
          source.map((item) => {
            let elementValue = {};
            const quotationColumnAttrs = [];
            const { quotationColumns = [], ...otherItem } = item;
            quotationColumns.forEach((elementItem) => {
              elementValue = {
                ...elementValue,
                [elementItem.quotationColumnId]: this.renderColumnValue(item, elementItem),
              };
              quotationColumnAttrs.push({
                quotationColumnId: elementItem.quotationColumnId,
                componentType: elementItem.componentType,
                defaultFlag: elementItem.defaultFlag,
              });
            });
            if (!isEmpty(item.children) && Array.isArray(item.children)) {
              return {
                ...otherItem,
                ...elementValue,
                quotationColumnAttrs,
                children: getData(item.children),
              };
            } else {
              return {
                ...otherItem,
                ...elementValue,
                quotationColumnAttrs,
              };
            }
          });
        return restructureSource;
      }
    };
    return getData(elementDetailList);
  }

  /**
   * 渲染报价明细项列
   */
  renderColumns(dataSource = []) {
    const {
      quotationTemplate: {
        detailHeader,
        code: { quotationDetailType = [] },
      },
    } = this.props;
    const { summaryItemList = {} } = this.state;
    let rowColumns = [];
    if (!isEmpty(dataSource)) {
      rowColumns =
        dataSource[0].quotationColumns &&
        dataSource[0].quotationColumns.map((item) => {
          return {
            dataIndex: `${item.quotationColumnId}`,
            title: `${item.columnName}`,
            width: 150,
            render: (val, record) => {
              if (
                ['create', 'update'].includes(record._status) &&
                detailHeader.templateStatus !== 'RELEASED'
              ) {
                return (
                  <FormItem>
                    {this.props.form.getFieldDecorator(
                      `inputTypeCode#${record.templateDetailId}#${item.quotationColumnId}`,
                      {
                        initialValue: val,
                      }
                    )(this.renderColumnComponent(item, record))}
                  </FormItem>
                );
              } else {
                return val;
              }
            },
          };
        });
    }
    return [
      {
        title: intl.get(`${promptCode}.model.template.configCode`).d('报价明细项编码'),
        dataIndex: 'configCode',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <FormItem
              className={
                record.parentDetailId === 0
                  ? styles['configCode-td']
                  : styles['configCode-child-td']
              }
            >
              {this.props.form.getFieldDecorator(`configCode#${record.templateDetailId}`, {
                initialValue: record.configCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.configCode`).d('报价明细项编码'),
                    }),
                  },
                  // {
                  //   pattern: /^\w+$/,
                  //   message: intl
                  //     .get(`${promptCode}.validation.configCode`)
                  //     .d('报价明细项编码只能由数字、字母、下划线组成'),
                  // },
                ],
              })(<Input trim inputChinese={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.configName`).d('报价明细项名称'),
        dataIndex: 'configName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <FormItem>
              {this.props.form.getFieldDecorator(`configName#${record.templateDetailId}`, {
                initialValue: record.configName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.configName`).d('报价明细项名称'),
                    }),
                  },
                  {
                    max: 180,
                    message: intl.get('hzero.common.validation.max', {
                      max: 180,
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get(`${promptCode}.model.template.configName`).d('报价明细项名称')}
                  field="configName"
                  token={record._token}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.lineSequence`).d('行顺序(从上到下)'),
        dataIndex: 'lineSequence',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <FormItem>
              {this.props.form.getFieldDecorator(`lineSequence#${record.templateDetailId}`, {
                initialValue: record.lineSequence,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.template.lineSequence`)
                        .d('行顺序(从上到下)'),
                    }),
                  },
                ],
              })(
                <InputNumber min={0} max={99999999999999} precision={0} style={{ width: '100%' }} />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.nextQuotationDetails`).d('下级报价明细'),
        dataIndex: 'nextQuotationDetails',
        width: 120,
        render: (val, record) =>
          detailHeader.templateStatus !== 'RELEASED' &&
          record._status === 'update' &&
          record.parentDetailId === 0 ? (
            <a onClick={() => this.createDetailsChildren(record)}>
              {intl.get('hzero.common.button.create').d('新建')}
            </a>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.quotationDetailType`).d('明细项类型'),
        dataIndex: 'quotationDetailType',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <FormItem>
              {this.props.form.getFieldDecorator(`quotationDetailType#${record.templateDetailId}`, {
                initialValue: record.quotationDetailType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.template.quotationDetailType`)
                        .d('明细项类型'),
                    }),
                  },
                ],
              })(
                <Select
                  style={{ width: '100%' }}
                  onChange={(value) => this.changeQuotationDetailType(value, record)}
                >
                  {quotationDetailType.map((n) => (
                    <Select.Option value={n.value} key={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            record.quotationDetailTypeMeaning
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.summaryItemList`).d('指定范围'),
        dataIndex: 'summaryItemList',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <FormItem>
              {this.props.form.getFieldDecorator(`summaryItemList#${record.templateDetailId}`, {
                initialValue: record.summaryItemList === null ? undefined : record.summaryItemList,
                rules: [
                  {
                    required:
                      this.props.form.getFieldValue(
                        `quotationDetailType#${record.templateDetailId}`
                      ) === 'SCOPE',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.summaryItemList`).d('指定范围'),
                    }),
                  },
                ],
              })(
                <Select
                  style={{ width: '100%' }}
                  mode="multiple"
                  onFocus={() => this.handleFocusSummaryItems(record)}
                  // onBlur={() => this.setState({ summaryItemList: {...summaryItemList, [record.templateDetailId]: []} })}
                  disabled={
                    this.props.form.getFieldValue(
                      `quotationDetailType#${record.templateDetailId}`
                    ) !== 'SCOPE'
                  }
                  optionLabelProp="value"
                >
                  {summaryItemList[record.templateDetailId] &&
                    summaryItemList[record.templateDetailId].map((n) => (
                      <Select.Option value={n.configCode} key={n.configCode}>
                        {n.configCode}-{n.configName}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val?.map((item) => <Tag>{item}</Tag>)
          ),
      },
      ...rowColumns,
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 60,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {this.props.form.getFieldDecorator(`enabledFlag#${record.templateDetailId}`, {
                initialValue: record.enabledFlag,
              })(
                <Checkbox
                  disabled={
                    detailHeader.templateStatus === 'RELEASED' || record.parentEnabledFlag === 0
                  }
                  onChange={(e) => this.changeEnabledFlag(e.target.checked, record)}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
  }

  render() {
    const {
      match: { params },
      organizationId,
      fetchDetailElementLoading,
      queryTemplateDetailLoading,
      saveTemplateDetailLoading,
      deleteTemplateDetailLoading,
      saveLineDetailLoading,
      nextDetaliItemLoading,
      form: { getFieldDecorator },
      quotationTemplate: {
        detailHeader,
        templateDetailPagination,
        elementDetailList = [],
        elementDetailPagination,
      },
    } = this.props;
    const {
      copyExistTplVisible,
      selectedRowKeys,
      dataSource,
      defaultShow,
      activeKey,
      expandedRowKeys = [],
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    const copyExistTplProps = {
      templateId: params.templateId,
      copyExistTplVisible,
      onCancel: this.handleCopyExistTpl,
      onResh: this.handleTemplateDetali,
      quotationDimension: detailHeader.templateDimension,
    };
    const flag = 1;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.template.columnCode`).d('报价明细列编码'),
        dataIndex: 'columnCode',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <FormItem>
              {record.$form.getFieldDecorator('columnCode', {
                initialValue: record.columnCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.columnCode`).d('报价明细列编码'),
                    }),
                  },
                  {
                    pattern: /^[a-z]+$/i,
                    message: intl
                      .get(`${promptCode}.validation.columnCode`)
                      .d('报价明细列编码只能由英文字母组成'),
                  },
                ],
              })(<Input trim inputChinese={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.columnName`).d('报价明细列名称'),
        dataIndex: 'columnName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <FormItem>
              {record.$form.getFieldDecorator('columnName', {
                initialValue: record.columnName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.columnName`).d('报价明细列名称'),
                    }),
                  },
                  {
                    max: 180,
                    message: intl.get('hzero.common.validation.max', {
                      max: 180,
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get(`${promptCode}.model.template.columnName`).d('报价明细列名称')}
                  field="columnName"
                  token={record._token}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.rowLine`).d('列顺序(从左到右)'),
        dataIndex: 'columnSequence',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <FormItem>
              {record.$form.getFieldDecorator('columnSequence', {
                initialValue: record.columnSequence,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.rowLine`).d('列顺序(从左到右)'),
                    }),
                  },
                ],
              })(<InputNumber min={0} max={99999999999999} style={{ width: '100%' }} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.compents`).d('组件'),
        dataIndex: 'componentDescription',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <React.Fragment>
              <FormItem>
                {record.$form.getFieldDecorator('componentType', {
                  initialValue: record.componentType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.template.compents`).d('组件'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPFM.INVESTIGATE_COMPONENTS"
                    queryParams={{ enabledFlag: 1 }}
                    textField="componentDescription"
                    textValue={record.componentDescription}
                    onChange={(value, lovList) => {
                      this.updateComponent(value, record, lovList);
                    }}
                  />
                )}
              </FormItem>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('componentId', {
                  initialValue: record.componentId,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('componentDescription', {
                  initialValue: record.componentDescription,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.batchs`).d('值集'),
        dataIndex: 'lovCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <React.Fragment>
              <FormItem>
                {record.$form.getFieldDecorator('lovCode', {
                  initialValue: record.lovCode,
                })(
                  <Lov
                    code={
                      record.$form.getFieldValue('componentType') === 'Lov'
                        ? 'HPFM.LOV_VIEW.CODE'
                        : 'SPFM.LOV.LOV_DETAIL.ORG'
                    }
                    queryParams={{ enabledFlag: 1, lovQueryFlag: 1 }}
                    textValue={record.lovCode}
                    textField="lovCode"
                    onChange={(value, lovList) => {
                      this.updateLov(value, record, lovList);
                    }}
                    disabled={
                      record.$form.getFieldValue('componentType') !== 'ValueList' &&
                      record.$form.getFieldValue('componentType') !== 'Lov'
                    }
                  />
                )}
              </FormItem>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('lovId', {
                  initialValue: record.lovId,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.attrs`).d('组件属性'),
        key: 'attrs',
        width: 85,
        render: (val, record) =>
          ['update'].includes(record._status) && (
            <a onClick={() => this.showAttrsDrawer(record)}>
              {intl.get(`spfm.investigationDefinition.model.definition.attrs`).d('组件属性')}
            </a>
          ),
      },
      {
        title: (
          <span>
            {intl
              .get(`spfm.investigationDefinition.model.definition.calculationRule`)
              .d('计算规则')}
            <Tooltip
              title={intl
                .get('spfm.investigationDefinition.view.message.calcRule.tips')
                .d(
                  '【用于定义报价明细字段的计算逻辑。例：行金额=单价*数量，行金额字段配置的计算规则为Quantity*Price】'
                )}
            >
              <Icon style={{ marginLeft: '4px' }} type="question-circle-o" />
            </Tooltip>
          </span>
        ),
        dataIndex: 'calculationRule',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          detailHeader.templateStatus !== 'RELEASED' ? (
            <FormItem>
              {record.$form.getFieldDecorator('calculationRule', {
                initialValue: record.calculationRule,
              })(
                <Input
                  style={{ width: '100%' }}
                  disabled={record.$form.getFieldValue('componentType') !== 'InputNumber'}
                  onChange={(value) => {
                    this.changeCalculationRule(value, record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.defaultFlag`).d('默认值配置'),
        dataIndex: 'defaultFlag',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('defaultFlag', {
                initialValue: record.defaultFlag || 0,
              })(
                <Checkbox
                  disabled={
                    detailHeader.templateStatus === 'RELEASED' ||
                    (record.$form.getFieldValue('componentType') !== 'InputNumber' &&
                      record.$form.getFieldValue('componentType') !== 'Input') ||
                    record.$form.getFieldValue('calculationRule')
                  }
                  onChange={(value) => this.changeDefaultFlag(value, record)}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.whetherTrue`).d('是否必输'),
        dataIndex: 'requiredFlag',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('requiredFlag', {
                initialValue: record.requiredFlag || 0,
              })(
                <Checkbox
                  disabled={
                    detailHeader.templateStatus === 'RELEASED' ||
                    record.$form.getFieldValue('defaultFlag')
                  }
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 60,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('enabledFlag', {
                initialValue: record.enabledFlag,
              })(<Checkbox disabled={detailHeader.templateStatus === 'RELEASED'} />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Fragment>
        <Header
          title={intl.get(`${promptCode}.model.title.detailMantain`).d('报价明细维护')}
          backPath="/ssrc/quotation-template/list"
        >
          <Button
            icon="save"
            type="primary"
            onClick={defaultShow ? this.handleSave : this.handleElement}
            loading={saveTemplateDetailLoading}
            disabled={detailHeader.templateStatus === 'RELEASED'}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="default" onClick={this.handleCopyExistTpl}>
            <Iconfont type="main-reinquiry" style={{ marginRight: '8px' }} />
            {detailHeader.templateDimension === 'ITEM'
              ? intl.get(`${promptCode}.model.template.copyMaterialTemplate`).d('复制已有物料模板')
              : intl.get(`${promptCode}.model.template.copyCategoryTemplate`).d('复制已有品类模板')}
          </Button>
        </Header>
        <Content className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}>
          <Form className="read-row-custom">
            <Row gutter={24} className="read-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.template.code`).d('报价模板编码')}
                >
                  {detailHeader.templateNum}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.template.name`).d('报价模板名称')}
                >
                  {detailHeader.templateName}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.template.quotationDimension`).d('模板维度')}
                >
                  {detailHeader.templateDimensionMeaning}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24} className="read-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.template.allowCreateFlag`)
                    .d('允许供应商新建明细行')}
                >
                  {getFieldDecorator('allowCreateFlag', {
                    initialValue: detailHeader.allowCreateFlag,
                  })(<Checkbox disabled={detailHeader.templateStatus === 'RELEASED'} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.template.attachment`).d('供应商附件必传')}
                >
                  {getFieldDecorator('attachmentNeedFlag', {
                    initialValue: detailHeader.attachmentNeedFlag,
                  })(
                    <Checkbox
                      disabled={detailHeader.templateStatus === 'RELEASED'}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.template.purchaserAttachment`)
                    .d('采购方附件')}
                >
                  {getFieldDecorator('attachmentUuid', {
                    initialValue: detailHeader.attachmentUuid,
                  })(
                    <UploadModal
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="quotation-template"
                      attachmentUUID={detailHeader.attachmentUuid}
                      tenantId={organizationId}
                      viewOnly={detailHeader.templateStatus === 'RELEASED'}
                      fileSize={FIlESIZE}
                      {...ChunkUploadProps}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
          <Tabs
            animated={false}
            tabPosition="left"
            onChange={this.handleTabsChange}
            activeKey={activeKey}
            onTabClick={() => this.handleTemplateDetali(flag)}
          >
            <TabPane
              forceRender
              key="col"
              tab={intl.get(`${promptCode}.model.template.quoDetailCol`).d('自定义报价明细列')}
            >
              <div
                className={styles['item-list-search']}
                style={{ display: detailHeader.templateStatus === 'RELEASED' ? 'none' : 'block' }}
              >
                <Form layout="inline">
                  <Button
                    type="primary"
                    onClick={defaultShow ? this.handleAdd : this.handleElementAdd}
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                  <Button
                    onClick={defaultShow ? this.saveEditRow : this.saveEditElement}
                    loading={saveLineDetailLoading}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                  <Button
                    onClick={defaultShow ? this.handleDelete : this.handleElememntDelete}
                    disabled={isEmpty(selectedRowKeys)}
                    loading={deleteTemplateDetailLoading}
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </Button>
                </Form>
              </div>
              <EditTable
                bordered
                rowKey="quotationColumnId"
                columns={columns}
                rowSelection={rowSelection}
                dataSource={dataSource}
                scroll={{ x: scrollX }}
                loading={queryTemplateDetailLoading}
                onChange={(page) => this.handleTemplateDetali(flag, page)}
                pagination={templateDetailPagination}
              />
            </TabPane>
            <TabPane
              forceRender
              tab={intl.get(`${promptCode}.model.template.quoDetailEle`).d('自定义报价明细项')}
              key="element"
            >
              <div
                className={styles['item-list-search']}
                style={{ display: detailHeader.templateStatus === 'RELEASED' ? 'none' : 'block' }}
              >
                <Form layout="inline">
                  <Button
                    type="primary"
                    onClick={defaultShow ? this.handleAdd : this.handleElementAdd}
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                  <Button
                    onClick={defaultShow ? this.saveEditRow : this.saveEditElement}
                    loading={saveLineDetailLoading}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                  <Button
                    onClick={defaultShow ? this.handleDelete : this.handleElememntDelete}
                    disabled={isEmpty(selectedRowKeys)}
                    loading={deleteTemplateDetailLoading}
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </Button>
                </Form>
              </div>
              <EditTable
                bordered
                rowKey="templateDetailId"
                columns={this.renderColumns(elementDetailList)}
                rowSelection={rowSelection}
                dataSource={this.renderDataSource(elementDetailList) || []}
                scroll={{ x: scrollX }}
                loading={fetchDetailElementLoading}
                onChange={(page) => this.fetchDetailElement(page)}
                pagination={elementDetailPagination}
                onExpand={this.expandTwoDetails}
                expandedRowKeys={expandedRowKeys}
              />
            </TabPane>
            <Form>
              {defaultShow && (
                <div
                  className={styles['item-list-search']}
                  style={{
                    display: detailHeader.templateStatus === 'RELEASED' ? 'none' : 'block',
                  }}
                >
                  <Form layout="inline">
                    <Button
                      type="primary"
                      onClick={this.handleDetaliItem}
                      loading={nextDetaliItemLoading}
                    >
                      {intl.get('hzero.common.button.next').d('下一步')}
                    </Button>
                  </Form>
                </div>
              )}
            </Form>
          </Tabs>
        </Content>
        {this.state.attrsDrawerVisible && (
          <AttrsDrawer
            detailHeader={detailHeader}
            visible={this.state.attrsDrawerVisible}
            record={this.state.drawerData}
            onClose={this.hideAttrsDrawer}
          />
        )}
        {copyExistTplVisible && <CopyExistTplModal {...copyExistTplProps} />}
      </Fragment>
    );
  }
}
