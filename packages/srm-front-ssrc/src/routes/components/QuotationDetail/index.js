/**
 * inquiryHall - 寻源维护/物品信息 - 物品报价明细明细
 * @date: 2020-05-14
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import {
  Modal,
  Form,
  Row,
  Col,
  Button,
  InputNumber,
  Input,
  Select,
  DatePicker,
  Drawer,
} from 'hzero-ui';
import { isEmpty, filter, without } from 'lodash';
import moment from 'moment';

import {
  EDIT_FORM_ITEM_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import {
  addItemsToPagination,
  delItemsToPagination,
  getDateFormat,
  tableScrollWidth,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';
import CPopover from '@/routes/components/CPopover/';
import { PRIVATE_BUCKET } from '_utils/config';

import { execMathExpress } from './calculate';
import { dateFormate } from '@/utils/utils';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

import style from './index.less';

const { Option } = Select;
const FormItem = Form.Item;

@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
@Form.create({ fieldNameProp: null })
@connect(({ quotationDetail, loading }) => ({
  quotationDetail,
  fetchDataLoading:
    loading.effects['quotationDetail/fetchQuotationDetailHeader'] ||
    loading.effects['quotationDetail/fetchTwoDetails'],
  saveLoading: loading.effects['quotationDetail/saveElementDetail'],
  deleteLoading: loading.effects['quotationDetail/deleteElementDetail'],
}))
export default class QuotationDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(), // 组织id
      selectedRows: [], // 勾选行
      selectedRowKeys: [], // 勾选key
      record: props.itemLineRecord || {}, // 物品明细行数据
      abandonedFlag:
        (props.itemLineRecord.$form
          ? props.itemLineRecord.$form.getFieldValue('abandonedFlag')
          : props.itemLineRecord.abandonedFlag) || 0,
      expandedRowKeys: [], // 报价明细项展开行
    };
  }

  componentDidMount() {
    this.fetchQuotationDetailHeader();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'quotationDetail/updateState',
      payload: {
        header: {},
        quotationDetail: [],
        quotationDetailPagination: {},
      },
    });
    this.setState({
      expandedRowKeys: [],
      record: {},
    });
  }

  /**
   * 头-报价明细
   */
  @Bind()
  fetchQuotationDetailHeader(page = {}) {
    const { dispatch, sourceFrom = 'RFX' } = this.props;
    const { record = {} } = this.state;
    dispatch({
      type: 'quotationDetail/fetchQuotationDetailHeader',
      payload: {
        page,
        rfxLineItemId: record.rfxLineItemId || record.bidLineItemId,
        itemId: record.itemId,
        itemCategoryId: record.itemCategoryId,
        sourceFrom,
        rfxHeaderId: record.rfxHeaderId || record.bidHeaderId,
        quotationLineId: record.quotationLineId,
        quotationHeaderId: record.quotationHeaderId,
      },
    }).then((res) => {
      if (!isEmpty(res)) {
        if (!isEmpty(res.supQuotationDetailPage.content)) {
          this.setState({
            expandedRowKeys: res.supQuotationDetailPage.content.map(
              (item) => item.supQuotationDetailId
            ),
          });
        }
        // 查询报价明细模板
        this.fetchQuotationDetailTemplate(res);
        // 收集查询所有报价明细动态列值集
        if (
          !isEmpty(res.supQuotationDetailPage && res.supQuotationDetailPage.content) &&
          !isEmpty(res.supQuotationDetailPage.content[0].quotationColumns)
        ) {
          this.fetchQuotationDetailValueList(
            res.supQuotationDetailPage.content[0].quotationColumns
          );
        }
      }
    });
  }

  /**
   * 查询报价明细模板
   */
  @Bind()
  fetchQuotationDetailTemplate(res) {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotationDetail/fetchQuotationDetailTemplate',
      payload: {
        templateId: res.templateId,
      },
    });
  }

  /**
   * 收集查询所有报价明细动态列值集
   */
  @Bind()
  fetchQuotationDetailValueList(quotationColumns = []) {
    const lovCodes = {};
    if (isEmpty(quotationColumns)) return;
    quotationColumns.forEach((item) => {
      const { componentType, lovCode } = item;

      if (componentType === 'ValueList' && lovCode) {
        lovCodes[lovCode] = lovCode;
      }
    });
    // 查询值集
    this.queryQuotationDetailValueList(lovCodes);
  }

  // 查询报价明细值集
  @Bind()
  queryQuotationDetailValueList(codes = {}) {
    const { dispatch } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'quotationDetail/batchCode',
      payload: {
        lovCodes: {
          tenantId: organizationId,
          ...codes,
        },
      },
    });
  }

  /**
   * 获取-报价明细-保存数据
   */
  getUpdateData = (source, quoDetailAttachmentUuid) => {
    const { sourceFrom = 'RFX' } = this.props;
    const { record = {}, organizationId } = this.state;
    const {
      rfxHeaderId = null,
      bidHeaderId = null,
      rfxLineItemId = null,
      bidLineItemId = null,
      quotationLineId = null,
    } = record;
    let data = [];
    if (Array.isArray(source) && !isEmpty(source)) {
      data = source.map((item) => {
        const { quotationColumns = [] } = item;
        const newQuotationColumns =
          (quotationColumns &&
            quotationColumns.map((elementItem) => {
              const { columnCode = null, componentType = null } = elementItem || {};
              let supQuotationColumnValue = this.props.form.getFieldValue(
                `inputTypeCode#${item.supQuotationDetailId}#${columnCode}`
              );

              if (componentType && componentType === 'DatePicker') {
                supQuotationColumnValue = dateFormate(
                  supQuotationColumnValue,
                  DEFAULT_DATETIME_FORMAT
                );
              }

              return {
                ...elementItem,
                supQuotationColumnValue,
                quoDetailAttachmentUuid,
              };
            })) ||
          [];
        if (!isEmpty(item.children) && Array.isArray(item.children)) {
          return {
            ...item,
            sourceFrom,
            quoDetailAttachmentUuid,
            tenantId: organizationId,
            rfxLineItemId: rfxLineItemId || bidLineItemId,
            sourceHeaderId: rfxHeaderId || bidHeaderId,
            quotationLineId: quotationLineId || null,
            quotationHeaderId: record.quotationHeaderId || null,
            supQuotationDetailId: item._status === 'create' ? undefined : item.supQuotationDetailId,
            configName:
              this.props.form.getFieldValue(`configName#${item.supQuotationDetailId}`) ||
              item.configName,
            configCode:
              this.props.form.getFieldValue(`configCode#${item.supQuotationDetailId}`) ||
              item.configCode,
            quotationColumns: newQuotationColumns,
            children: this.getUpdateData(item.children, quoDetailAttachmentUuid),
          };
        } else {
          return {
            ...item,
            sourceFrom,
            quoDetailAttachmentUuid,
            tenantId: organizationId,
            rfxLineItemId: rfxLineItemId || bidLineItemId,
            sourceHeaderId: rfxHeaderId || bidHeaderId,
            quotationLineId: quotationLineId || null,
            quotationHeaderId: record.quotationHeaderId || null,
            supQuotationDetailId: item._status === 'create' ? undefined : item.supQuotationDetailId,
            configName:
              this.props.form.getFieldValue(`configName#${item.supQuotationDetailId}`) ||
              item.configName,
            configCode:
              this.props.form.getFieldValue(`configCode#${item.supQuotationDetailId}`) ||
              item.configCode,
            quotationColumns: newQuotationColumns,
          };
        }
      });
    }
    return data;
  };

  /**
   * 自定义报价明细项保存
   */
  @Bind()
  saveEditElement() {
    const {
      dispatch,
      form,
      quotationDetail: { quotationDetail = [], quotationDetailPagination = {}, header = {} },
    } = this.props;
    const { record = {} } = this.state;
    const { attachmentNeedFlag = 0, supQuotationDetailId = null } = header;
    let isError = false;

    const quoDetailAttachmentUuid = form.getFieldValue('quoDetailAttachmentUuid') || null;
    if (attachmentNeedFlag && !quoDetailAttachmentUuid) {
      notification.warning({
        message: intl
          .get('hzero.common.message.confirm.attachment.atLeast')
          .d('附件为必传项，请至少上传一个附件！'),
      });
      return;
    }
    form.validateFields((err) => {
      if (err) {
        isError = true;
      }
    });

    if (isError) {
      return;
    }

    dispatch({
      type: 'quotationDetail/saveElementDetail',
      payload: {
        quotationHeaderId: record.quotationHeaderId,
        quotationColumns: {
          supQuotationDetailId,
          quoDetailAttachmentUuid,
          supQuotationDetailList: this.getUpdateData(quotationDetail, quoDetailAttachmentUuid),
        },
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          expandedRowKeys: [],
        });
        // reset表单，解决表格field不更新的问题，比如汇总列
        this.props.form.resetFields();
        // 查询明细项列表
        this.fetchQuotationDetailHeader(quotationDetailPagination);
      }
    });
  }

  /**
   * 新建自定义报价明细项
   */
  @Bind()
  handleElementAdd() {
    const {
      dispatch,
      quotationDetail: { quotationDetail = [], template = [], quotationDetailPagination = {} },
    } = this.props;

    if (isEmpty(template)) {
      notification.warning({
        message: intl.get('ssrc.inquiryHall.view.quotationTemplateEmpty').d('报价模板为空'),
      });
      return;
    }

    const newQuotationDetail = [
      {
        supQuotationDetailId: uuidv4(),
        quotationColumns: template || [],
        createFlag: 1,
        parentDetailId: 0, // 一级细项标记
        _status: 'create', // 新建标记位
      },
      ...quotationDetail,
    ];

    dispatch({
      type: 'quotationDetail/updateState',
      payload: {
        quotationDetail: newQuotationDetail,
        quotationDetailPagination: addItemsToPagination(
          1,
          quotationDetail.length,
          quotationDetailPagination
        ),
      },
    });
  }

  /**
   * 新建-二级报价明细
   */
  @Bind()
  createDetailsChildren(tableRecord) {
    const {
      dispatch,
      quotationDetail: { quotationDetail = [], template = [] },
    } = this.props;
    const { expandedRowKeys = [] } = this.state;

    if (isEmpty(template)) {
      notification.warning({
        message: intl.get('ssrc.inquiryHall.view.quotationTemplateEmpty').d('报价模板为空'),
      });
      return;
    }

    if (!expandedRowKeys.includes(tableRecord.supQuotationDetailId)) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, tableRecord.supQuotationDetailId],
      });
    }

    // 新建二级报价明细项
    const newElementDetailList = quotationDetail.map((item) => {
      if (item.supQuotationDetailId === tableRecord.supQuotationDetailId) {
        return !isEmpty(item.children)
          ? {
              ...item,
              children: [
                {
                  supQuotationDetailId: uuidv4(),
                  quotationColumns: template || [],
                  createFlag: 1,
                  parentDetailId: tableRecord.supQuotationDetailId,
                  _status: 'create', // 新建标记位
                },
                ...item.children,
              ],
            }
          : {
              ...item,
              children: [
                {
                  supQuotationDetailId: uuidv4(),
                  quotationColumns: template || [],
                  createFlag: 1,
                  parentDetailId: tableRecord.supQuotationDetailId,
                  _status: 'create', // 新建标记位
                },
              ],
            };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'quotationDetail/updateState',
      payload: {
        quotationDetail: newElementDetailList,
      },
    });

    // 未展开，先查询接口，再插入children
    // if (!expandedRowKeys.includes(tableRecord.supQuotationDetailId) && tableRecord.childFlag) {
    //   dispatch({
    //     type: 'quotationDetail/fetchTwoDetails',
    //     payload: {
    //       sourceFrom,
    //       quotationDetail,
    //       supQuotationDetailId: tableRecord.supQuotationDetailId,
    //       sourceHeaderId: record.rfxHeaderId || record.bidHeaderId,
    //       rfxLineItemId: record.rfxLineItemId || record.bidLineItemId,
    //       itemId: record.itemId,
    //       itemCategoryId: record.itemCategoryId,
    //       quotationLineId: record.quotationLineId,
    //       quotationHeaderId: record.quotationHeaderId,
    //     },
    //   }).then(res => {
    //     if (res) {
    //       // 新建二级报价明细项
    //       const newElementDetailList = res.map(item => {
    //         if (item.supQuotationDetailId === tableRecord.supQuotationDetailId) {
    //           return !isEmpty(item.children)
    //             ? {
    //                 ...item,
    //                 children: [
    //                   {
    //                     supQuotationDetailId: uuidv4(),
    //                     quotationColumns: template || [],
    //                     createFlag: 1,
    //                     parentDetailId: tableRecord.supQuotationDetailId,
    //                     _status: 'create', // 新建标记位
    //                   },
    //                   ...item.children,
    //                 ],
    //               }
    //             : {
    //                 ...item,
    //                 children: [
    //                   {
    //                     supQuotationDetailId: uuidv4(),
    //                     quotationColumns: template || [],
    //                     createFlag: 1,
    //                     parentDetailId: tableRecord.supQuotationDetailId,
    //                     _status: 'create', // 新建标记位
    //                   },
    //                 ],
    //               };
    //         } else {
    //           return item;
    //         }
    //       });
    //       dispatch({
    //         type: 'quotationDetail/updateState',
    //         payload: {
    //           quotationDetail: newElementDetailList,
    //         },
    //       });
    //     }
    //   });
    // } else {
    //   // 新建二级报价明细项
    //   const newElementDetailList = quotationDetail.map(item => {
    //     if (item.supQuotationDetailId === tableRecord.supQuotationDetailId) {
    //       return !isEmpty(item.children)
    //         ? {
    //             ...item,
    //             children: [
    //               {
    //                 supQuotationDetailId: uuidv4(),
    //                 quotationColumns: template || [],
    //                 createFlag: 1,
    //                 parentDetailId: tableRecord.supQuotationDetailId,
    //                 _status: 'create', // 新建标记位
    //               },
    //               ...item.children,
    //             ],
    //           }
    //         : {
    //             ...item,
    //             children: [
    //               {
    //                 supQuotationDetailId: uuidv4(),
    //                 quotationColumns: template || [],
    //                 createFlag: 1,
    //                 parentDetailId: tableRecord.supQuotationDetailId,
    //                 _status: 'create', // 新建标记位
    //               },
    //             ],
    //           };
    //     } else {
    //       return item;
    //     }
    //   });
    //   dispatch({
    //     type: 'quotationDetail/updateState',
    //     payload: {
    //       quotationDetail: newElementDetailList,
    //     },
    //   });
    // }
    // if (!expandedRowKeys.includes(tableRecord.supQuotationDetailId)) {
    //   this.setState({
    //     expandedRowKeys: [...expandedRowKeys, tableRecord.supQuotationDetailId],
    //   });
    // }
  }

  /**
   * 展开二级细项
   */
  @Bind()
  expandTwoDetails(expanded, tableRecord) {
    const {
      dispatch,
      quotationDetail: { quotationDetail = [] },
    } = this.props;
    const { expandedRowKeys = [] } = this.state;
    // 展开
    if (expanded && !expandedRowKeys.includes(tableRecord.supQuotationDetailId)) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, tableRecord.supQuotationDetailId],
      });
      // dispatch({
      //   type: 'quotationDetail/fetchTwoDetails',
      //   payload: {
      //     sourceFrom,
      //     quotationDetail,
      //     supQuotationDetailId: tableRecord.supQuotationDetailId,
      //     sourceHeaderId: record.rfxHeaderId || record.bidHeaderId,
      //     rfxLineItemId: record.rfxLineItemId || record.bidLineItemId,
      //     itemId: record.itemId,
      //     itemCategoryId: record.itemCategoryId,
      //     quotationLineId: record.quotationLineId,
      //     quotationHeaderId: record.quotationHeaderId,
      //   },
      // });
    } else if (!expanded && expandedRowKeys.includes(tableRecord.supQuotationDetailId)) {
      // 清理数据
      const newData = quotationDetail.map((item) => {
        if (item.supQuotationDetailId === tableRecord.supQuotationDetailId) {
          const { children = [], ...otherItem } = item;
          return isEmpty(children) ? otherItem : item;
        } else {
          return item;
        }
      });
      this.setState({
        expandedRowKeys: without(expandedRowKeys, tableRecord.supQuotationDetailId),
      });
      dispatch({
        type: 'quotationDetail/updateState',
        payload: {
          quotationDetail: newData,
        },
      });
    }
  }

  /**
   * 删除报价明细项
   */
  @Bind()
  handleElementDelete() {
    const {
      dispatch,
      quotationDetail: { quotationDetail = [], quotationDetailPagination = {} },
    } = this.props;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      expandedRowKeys = [],
      record = {},
    } = this.state;
    // 获取元数据中要删除行
    const oldDeleteRows = selectedRows && selectedRows.filter((item) => item._status === 'update');
    let selectData = [];
    let restData = [];
    // 一级元素
    if (isEmpty(expandedRowKeys)) {
      // 过滤出勾选数据
      selectData = filter(quotationDetail, (item) => {
        return selectedRowKeys.indexOf(item.supQuotationDetailId) >= 0;
      });
      // 未有二级展开项，过滤出勾选数据剩下数据
      restData = filter(quotationDetail, (item) => {
        return selectedRowKeys.indexOf(item.supQuotationDetailId) < 0;
      });
    } else {
      // 有展开项
      const getRestData = (source, keys) => {
        const data = [];
        for (let i = 0; i < source.length > 0; i++) {
          if (!keys.includes(source[i].supQuotationDetailId)) {
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
      restData = getRestData(quotationDetail, selectedRowKeys);
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
              type: 'quotationDetail/updateState',
              payload: {
                quotationDetail: restData,
                quotationDetailPagination: delItemsToPagination(
                  selectData.length,
                  quotationDetail.length,
                  quotationDetailPagination
                ),
              },
            });
            this.setState({ selectedRows: [], selectedRowKeys: [] });
          } else {
            dispatch({
              type: 'quotationDetail/deleteElementDetail',
              payload: {
                sourceHeaderId: record.rfxHeaderId || record.bidHeaderId,
                quotationLineId: record.quotationLineId,
                deleteIds: oldDeleteRows.map((n) => n.supQuotationDetailId),
              },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'quotationDetail/updateState',
                  payload: {
                    quotationDetail: restData,
                    quotationDetailPagination: delItemsToPagination(
                      selectData.length,
                      quotationDetail.length,
                      quotationDetailPagination
                    ),
                  },
                });
                this.setState({ selectedRows: [], selectedRowKeys: [] });
              }
            });
          }
        },
      });
    }
  }

  /**
   * 根据表达式，监听计算
   */
  @Bind()
  changeInputNumberData(value, columnCode, record) {
    const {
      quotationDetail: { quotationDetail = [] },
    } = this.props;
    if (isEmpty(quotationDetail) && isEmpty(quotationDetail[0].quotationColumns)) return;
    const calculationRuleList = []; // [[key, value], [key, value]]
    quotationDetail[0].quotationColumns.forEach((item) => {
      // 存在表达式
      if (item.calculationRule) {
        const precision = item.quotationColumnCmpts?.filter(
          (i) => i.attributeName === 'precision'
        )?.[0]?.attributeValue;
        calculationRuleList.push({
          columnCode: item.columnCode,
          calculationRule: item.calculationRule,
          precision,
        });
      }
    });
    if (isEmpty(calculationRuleList)) return;
    calculationRuleList.forEach((item) => {
      // 表达式中存在当前code,需要计算
      if (item.calculationRule.indexOf(columnCode) !== -1) {
        const formValues = this.props.form.getFieldsValue();
        let obj = {};
        for (const i in formValues) {
          if (i.indexOf(record.supQuotationDetailId) !== -1) {
            // 截取columnCode
            const code = i.substring(i.lastIndexOf('#') + 1);
            obj = {
              ...obj,
              [code]: formValues[i],
              [columnCode]: value,
            };
          }
        }
        const targetValueObj = execMathExpress(item.calculationRule, filterNullValueObject(obj));
        let targetValue = null;
        if (targetValueObj.num || targetValueObj.num === 0) {
          targetValue = targetValueObj.num / targetValueObj.den;
          if (item.precision > 0) {
            targetValue = targetValue.toFixed(item.precision);
          }
        }
        this.props.form.setFieldsValue({
          [`inputTypeCode#${record.supQuotationDetailId}#${item.columnCode}`]: targetValue,
        });
      }
    });
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel() {
    this.props.dispatch({
      type: 'quotationDetail/updateState',
      payload: {
        header: {},
        quotationDetail: [],
        quotationDetailPagination: {},
        template: [],
        templatePagination: {},
      },
    });
    this.props.onCancel();
  }

  /**
   * 组件是否禁用
   *
   * @param {*} [record={}]
   * @param {*} [item={}]
   * @returns
   * @memberof ItemQutationDetailModal
   */
  @Bind()
  isDisabled(record = {}, item = {}) {
    const { columnCode = null, componentType, defaultFlag, calculationRule } = item;
    if (!columnCode) {
      return false;
    }

    if (
      record.quotationDetailType === 'ALL' ||
      record.quotationDetailType === 'SCOPE' ||
      record.quotationDetailType === 'RULE'
    ) {
      return true;
    } else if (record.quotationDetailType === 'NO') {
      if ((componentType === 'InputNumber' || componentType === 'Input') && defaultFlag) {
        return true;
      }
      return record[`${columnCode}Required`] === 'READONLY' || calculationRule;
    }
  }

  // 整理组件基本属性
  @Bind()
  collectAttrProps(attrs = [], itemData = {}) {
    if (!attrs || !Array.isArray(attrs) || !attrs.length) {
      return {};
    }

    let data = {};
    attrs.forEach((item) => {
      const { attributeName = '', attributeValue = null } = item;
      const BoolAttrs = ['allowThousandth', 'showToday'];
      const NumberAttrs = ['maxLength', 'max', 'min', 'step', 'precision'];

      if (attributeValue === 'null' || !attributeValue) {
        return;
      }

      if (BoolAttrs.includes(attributeName)) {
        data = Object.assign(data, {
          [attributeName]: !(attributeValue === '0' || !attributeValue),
        });
      } else if (NumberAttrs.includes(attributeName)) {
        data = Object.assign(data, {
          [attributeName]: Number(attributeValue) || null,
        });
      } else if (attributeValue !== 'null') {
        const value = this.getFormatValue(attributeValue, itemData);
        data = Object.assign(data, {
          [attributeName]: value,
        });
      }
    });
    return data;
  }

  /**
   * 组件渲染
   *
   * @param {*} [data={}]
   * @returns
   * @memberof ItemQutationDetailModal
   */
  @Bind()
  renderCurComponent(record = {}, data = {}) {
    const {
      quotationDetail: { code = [] },
      quotationStatus = null,
      continuousQuotationFlag = 1,
    } = this.props;
    const { componentType, lovCode, quotationColumnCmpts = [] } = data;
    const { abandonedFlag = 0, organizationId } = this.state;
    const allAttributesProps = this.collectAttrProps(quotationColumnCmpts, data);
    const isDisable =
      quotationStatus === 'QUOTED' && !continuousQuotationFlag
        ? true
        : this.isDisabled(record, data);
    const alls = {
      ...allAttributesProps,
      code: lovCode,
      disabled: isDisable || abandonedFlag,
      style: { width: '100%' },
    };
    switch (componentType) {
      case 'Input':
        return <Input {...alls} />;
      case 'InputNumber':
        return (
          <InputNumber
            {...alls}
            onChange={(value) => this.changeInputNumberData(value, data.columnCode, record)}
          />
        );
      case 'TextArea':
        return <Input.TextArea {...alls} />;
      case 'ValueList':
        return (
          <Select {...alls} allowClear>
            {!isEmpty(code[lovCode]) &&
              code[lovCode].map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.meaning}
                </Option>
              ))}
          </Select>
        );
      case 'DatePicker':
        return <DatePicker format={getDateFormat()} {...alls} />;
      // components
      case 'Lov':
        return (
          <Lov
            queryParams={{ tenantId: organizationId }}
            {...alls}
            textValue={record[`${data.columnCode}Meaning`]}
          />
        );
      case 'Switch':
        return <Switch {...alls} />;
      case 'Upload':
        return <Upload fileSize={FIlESIZE} filePreview tenantId={organizationId} {...alls} />;
      case 'Checkbox':
        return <Checkbox {...alls} />;

      default:
        return <Input />;
    }
  }

  /**
   * 组件的属性提取
   *
   * @param {*} [record={}]
   * @param {*} [item={}]
   * @returns
   * @memberof ItemQutationDetailModal
   */
  @Bind()
  isRequired(record = {}, item = {}) {
    const { columnCode = null } = item;
    if (!columnCode) {
      return false;
    }
    if (
      record.quotationDetailType === 'ALL' ||
      record.quotationDetailType === 'SCOPE' ||
      record.quotationDetailType === 'RULE'
    ) {
      return false;
    } else if (record.quotationDetailType === 'NO') {
      const isRequiredValue = record[`${columnCode}Required`] || null;
      const result =
        isRequiredValue === 'REQUIRED' || isRequiredValue === 1 || isRequiredValue === '1';
      return result;
    }
  }

  /**
   * 获取格式化值
   *
   * @param {*} [val=null]
   * @param {*} item
   */
  @Bind()
  getFormatValue(val = null, item = {}) {
    const { componentType } = item;
    if (componentType === 'DatePicker') {
      return val ? moment(val) : null;
    }

    return val;
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  renderDataSource() {
    const {
      quotationDetail: { quotationDetail = [] },
    } = this.props;
    if (!quotationDetail) {
      return [];
    }
    const getData = (source) => {
      if (Array.isArray(source)) {
        const restructureSource = source.map((item) => {
          let elementValue = {};
          const { quotationColumns = [], ...otherItem } = item;
          const newQuotationColumns =
            quotationColumns &&
            quotationColumns.map((newItem) => {
              elementValue = {
                ...elementValue,
                [newItem.columnCode]: newItem.supQuotationColumnValue || null,
                [`${newItem.columnCode}Required`]:
                  newItem.quotationColumnValue || newItem.requiredFlag || null,
                [`${newItem.columnCode}Meaning`]: newItem.supQuotationColumnValueMeaning || null,
              };
              return newItem;
            });
          if (!isEmpty(item.children) && Array.isArray(item.children)) {
            return {
              ...otherItem,
              ...elementValue,
              quotationColumns: newQuotationColumns || [],
              children: getData(item.children),
            };
          } else {
            return {
              ...item,
              ...elementValue,
              quotationColumns: newQuotationColumns,
            };
          }
        });
        return restructureSource;
      }
    };
    return getData(quotationDetail);
  }

  renderColumns() {
    const {
      quotationStatus = null,
      continuousQuotationFlag = 1,
      quotationDetail: { quotationDetail = [], header = {} },
      allowCreateFlag = 0,
    } = this.props;
    const { abandonedFlag = 0 } = this.state;
    let columns = [];
    if (!isEmpty(quotationDetail) && !isEmpty(quotationDetail[0].quotationColumns)) {
      const rowColumns = quotationDetail[0].quotationColumns.map((item, index, arrays) => {
        const obj = {
          dataIndex: `${item.columnCode}`,
          title: `${item.columnName}`,
          // width: 150,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {this.props.form.getFieldDecorator(
                  `inputTypeCode#${record.supQuotationDetailId}#${item.columnCode}`,
                  {
                    initialValue: this.getFormatValue(val, item),
                    rules: [
                      {
                        required: this.isRequired(record, item),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: `${item.columnName}`,
                        }),
                      },
                    ],
                  }
                )(this.renderCurComponent(record, item))}
              </FormItem>
            ) : (
              val
            ),
        };

        if (arrays.length !== index + 1) {
          obj.width = 150;
        }

        return obj;
      });
      columns = [
        {
          title: intl.get(`ssrc.common.model.common.configCode`).d('报价明细项编码'),
          dataIndex: 'configCode',
          width: 150,
          fixed: 'left',
          render: (val, record) =>
            record.createFlag !== 1 ||
            (quotationStatus === 'QUOTED' && !continuousQuotationFlag) ||
            abandonedFlag ? (
              <CPopover content={val}>{val}</CPopover>
            ) : ['create', 'update'].includes(record._status) ? (
              <FormItem
                className={
                  record.parentDetailId === 0
                    ? style['configCode-td']
                    : style['configCode-child-td']
                }
              >
                {this.props.form.getFieldDecorator(`configCode#${record.supQuotationDetailId}`, {
                  initialValue: record.configCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('ssrc.common.model.common.configCode').d('报价明细项编码'),
                      }),
                    },
                  ],
                })(<Input trim inputChinese={false} />)}
              </FormItem>
            ) : (
              <CPopover content={val}>{val}</CPopover>
            ),
        },
        {
          title: intl.get(`ssrc.common.model.common.configName`).d('报价明细项名称'),
          dataIndex: 'configName',
          width: 150,
          fixed: 'left',
          render: (val, record) =>
            record.createFlag !== 1 ||
            (quotationStatus === 'QUOTED' && !continuousQuotationFlag) ||
            abandonedFlag ? (
              <CPopover content={val}>{val}</CPopover>
            ) : ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {this.props.form.getFieldDecorator(`configName#${record.supQuotationDetailId}`, {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('ssrc.common.model.common.configName').d('报价明细项名称'),
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl.get(`ssrc.common.model.common.configName`).d('报价明细项名称')}
                    field="configName"
                    token={record._token}
                  />
                )}
              </FormItem>
            ) : (
              <CPopover content={val}>{val}</CPopover>
            ),
        },
        {
          title: intl.get(`ssrc.common.model.common.nextQuotationDetails`).d('下级报价明细'),
          dataIndex: 'nextQuotationDetails',
          width: 120,
          render: (val, record) =>
            record._status === 'update' && record.parentDetailId === 0 ? (
              <a onClick={() => this.createDetailsChildren(record)}>
                {intl.get('hzero.common.button.create').d('新建')}
              </a>
            ) : (
              val
            ),
        },
        ...rowColumns,
      ];
    }
    if (
      (!header.allowCreateFlag && !allowCreateFlag) ||
      abandonedFlag ||
      (quotationStatus === 'QUOTED' && !continuousQuotationFlag)
    ) {
      columns.splice(2, 1);
    }
    return columns;
  }

  renderHeader() {
    const {
      quotationStatus = null,
      continuousQuotationFlag = 1,
      quotationDetail: { header = {}, quotationDetail = [] },
      form: { getFieldDecorator },
    } = this.props;
    const { organizationId, abandonedFlag = 0 } = this.state;
    let { quoDetailAttachmentUuid = null } = header;
    if (!header.quoDetailAttachmentUuid) {
      quoDetailAttachmentUuid =
        (!isEmpty(quotationDetail) && quotationDetail[0].quoDetailAttachmentUuid) || null;
    }
    return (
      <Row>
        <Col span={8}>
          <FormItem className={`${style['form-item-control']} ${style['form-item']}`}>
            {header.templateNum ? `${header.templateNum} - ${header.templateName}` : null}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem
            label={intl.get(`ssrc.common.model.common.viewPurchaseAttachment`).d('查看采购方附件')}
            {...SEARCH_FORM_ITEM_LAYOUT}
            className={style['form-item']}
          >
            <Upload
              filePreview
              viewOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="quotation-template"
              attachmentUUID={header.attachmentUuid}
              tenantId={organizationId}
              icon="download"
            />
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem
            {...EDIT_FORM_ITEM_LAYOUT}
            label={intl.get(`ssrc.common.model.common.uploadAttachment`).d('上传附件')}
            className={style['form-item']}
          >
            {getFieldDecorator('quoDetailAttachmentUuid', {
              initialValue: quoDetailAttachmentUuid,
              rules: [
                {
                  required: header.attachmentNeedFlag,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`ssrc.common.model.common.uploadAttachment`).d('上传附件'),
                  }),
                },
              ],
            })(
              <Upload
                viewOnly={
                  (quotationStatus === 'QUOTED' && !continuousQuotationFlag) || abandonedFlag
                }
                fileSize={FIlESIZE}
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-rfxheader"
                attachmentUUID={quoDetailAttachmentUuid}
                tenantId={organizationId}
                filePreview
                {...ChunkUploadProps}
              />
            )}
          </FormItem>
        </Col>
      </Row>
    );
  }

  render() {
    const {
      quotationStatus = null,
      continuousQuotationFlag = 1,
      visible = false,
      fetchDataLoading,
      saveLoading,
      deleteLoading,
      quotationDetail: { header = {}, quotationDetailPagination = {} },
      allowCreateFlag = 0,
    } = this.props;
    const { selectedRowKeys = [], abandonedFlag = 0, expandedRowKeys = [] } = this.state;
    const rowSelection = {
      selectedRowKeys,
      getCheckboxProps: (record) => ({
        disabled: record.createFlag !== 1 || abandonedFlag,
      }),
      onChange: this.handleSelectChange,
    };
    return (
      <Drawer
        closable
        destroyOnClose
        visible={visible}
        title={intl.get(`ssrc.common.view.message.title.quotationDetail`).d('报价明细')}
        onClose={this.handleCancel}
        confirmLoading={saveLoading}
        // footer={
        //   <React.Fragment>
        //     <Button onClick={this.handleCancel}>
        //       {intl.get('hzero.common.button.cancel').d('取消')}
        //     </Button>
        //     <Button
        //       type="primary"
        //       disabled={(quotationStatus === 'QUOTED' && !continuousQuotationFlag) || abandonedFlag}
        //       onClick={this.saveEditElement}
        //       loading={saveLoading}
        //     >
        //       {intl.get('hzero.common.button.ok').d('确定')}
        //     </Button>
        //   </React.Fragment>
        // }
        width="70%"
      >
        {this.renderHeader()}
        {(header.allowCreateFlag === 1 || allowCreateFlag === 1) && (
          <div style={{ textAlign: 'right', marginBottom: '12px', marginTop: '4px' }}>
            <Button
              onClick={this.handleElementDelete}
              disabled={isEmpty(selectedRowKeys) || abandonedFlag}
              loading={deleteLoading}
              style={{ marginRight: '16px' }}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button type="primary" disabled={abandonedFlag} onClick={this.handleElementAdd}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
        )}
        <EditTable
          bordered
          rowKey="supQuotationDetailId"
          columns={this.renderColumns()}
          dataSource={this.renderDataSource()}
          scroll={{ x: tableScrollWidth(this.renderColumns()) || 0 }}
          loading={fetchDataLoading}
          rowSelection={
            header.allowCreateFlag === 1 || allowCreateFlag === 1 ? rowSelection : false
          }
          onChange={(page) => this.fetchQuotationDetailHeader(page)}
          pagination={quotationDetailPagination}
          onExpand={this.expandTwoDetails}
          expandedRowKeys={expandedRowKeys}
        />

        <div className={style['modal-footer-button-group']}>
          <Button onClick={this.handleCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            type="primary"
            disabled={(quotationStatus === 'QUOTED' && !continuousQuotationFlag) || abandonedFlag}
            onClick={this.saveEditElement}
            loading={saveLoading}
            className={style['button-m-l-sm']}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
