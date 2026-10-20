/**
 * 索赔单确认-明细页
 * @date: 2019-11-4
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Spin, Collapse, Form, Col, Icon, Row, Input, Modal, Tabs, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import querystring from 'querystring';
import { isUndefined, isEmpty, isNumber, omit, isNil, throttle } from 'lodash';
import { connect } from 'dva';
import { math } from 'choerodon-ui/dataset';

import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import classNames from 'classnames';
import moment from 'moment';
import { dateTimeRender } from 'utils/renderer';
// import { routerRedux } from 'dva/router';
import UploadModal from '_components/Upload';
import DynamicButtons from '_components/DynamicButtons';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { queryUUID, queryFileListOrg } from 'services/api';
import {
  FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  DETAIL_DEFAULT_CLASSNAME,
  DATETIME_MIN,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  getEditTableData,
  getResponse,
  filterNullValueObject,
  addItemToPagination,
  delItemsToPagination,
} from 'utils/utils';
import { fetchFlag } from '@/services/sqamCommonService';
import Change from '../../components/ChangeFormItem';
import styles from './index.less';
import BaseInfo from './BaseInfo';
import ClaimInfo from './ClaimInfo';
import StateDeal from './StateDeal';
import StateDealFilter from './StateDealFilter';
import OperationRecord from '../../RecordComponents/OperationRecord';
import ApproveRecord from '../../RecordComponents/ApproveRecord';
import Record from '../../components/OperationRecord/OperationRecord';

const prefix = `sqam.common`;

const formLayout = {
  wrapperCol: {
    style: {
      textAlign: 'center',
    },
  },
};

const customizeUnitCodes = [
  'SQAM.CLAIM_STATEMENT_DEATIL.STATEMENT',
  'SQAM.CLAIM_STATEMENT_DEATIL.BASIC_INFO',
  'SQAM.CLAIM_STATEMENT_DEATIL.CLAIM_INFO',
  'SQAM.CLAIM_STATEMENT_DEATIL.ITEM',
].join();

@remote({
  code: 'SQAM_CLAIM_STATEMENT_DETAIL_CUX',
  name: 'remote',
})
@connect(({ claimStatement, sqamCommon, loading }) => ({
  claimStatement,
  HeadLoading: loading.effects['claimStatement/FetchDetailDataHead'],
  ListLoading: loading.effects['claimStatement/FetchDetailDataList'],
  fetchOperationRecordListLoading: loading.effects['sqamCommon/fetchOperationRecord'],
  confirmLoading: loading.effects['claimStatement/ConfirmChange'],
  cancelLoading: loading.effects['claimStatement/CancelClaim'],
  maintainLoading: loading.effects['claimStatement/MaintainOriginal'],
  saveLoading: loading.effects['claimStatement/SaveClaim'],
  loading: loading.effects['sqam/approveHistory'],
  tenantId: getCurrentOrganizationId(),
  organizationId: getUserOrganizationId(),
  sqamCommon,
  deleteLineLoading: loading.effects['claimStatement/deleteLine'],
}))
@formatterCollections({
  code: [
    'sqam.common',
    'hzero.common',
    'entity.attachment',
    'entity.order',
    'entity.roles',
    'entity.business',
    'entity.organization',
    'entity.supplier',
    'entity.item',
    'sfin.invoiceBill',
  ],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SQAM.CLAIM_STATEMENT_DEATIL.BASIC_INFO',
    'SQAM.CLAIM_STATEMENT_DEATIL.STATEMENT',
    'SQAM.CLAIM_STATEMENT_DEATIL.CLAIM_INFO',
    'SQAM.CLAIM_STATEMENT_DEATIL.HEAD_BTNS',
    'SQAM.CLAIM_STATEMENT_DEATIL.ITEM',
    'SQAM.CLAIM_STATEMENT_DEATIL.ITEM_FILTER',
    'SQAM.CLAIM_STATEMENT_DEATIL.COLLAPSE',
  ],
})
export default class Detail extends PureComponent {
  form;

  formFilter = null;

  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['stateDeal', 'stateContent', 'baseInfo', 'claimInfo', 'claimItem'],
      checkedValues: '', // 默认不改判
      ChangeItemReadOnly: true,
      // isNoChange: false,
      ChangeBillReadOnly: true,
      purchaseAttachmentUuid: null,
      operationRecordVisible: false,
      fileNum: 0,
      activeKey: 'option',
      visible: false,
      isButtonsShow: false,
      selectedRowKeys: [],
      selectedRows: [],
      headerData: {},
      basePrice: '',
    };
    const Change_ = new Change('rowKey');
    this.changeList = Change_.changeList;
    this.setUpdate = Change_.setUpdate;
    this.isUpdata = Change_._isUpdate;
    this.ChangeFormItem = Change_.ChangeFormItem;
  }

  async componentDidMount() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'sqamCommon/init',
    });
    const data = await this.handleSearch();
    this.fetchLines();
    this.queryValueCode();
    this.fetchFlag(id);
    const { appealHandleActionCode = '' } = data || {};
    if (['COMMUTED_ITEM'].includes(appealHandleActionCode)) {
      this.setState({ ChangeItemReadOnly: false });
    }
    if (appealHandleActionCode) {
      this.setState({ checkedValues: appealHandleActionCode });
    }

    window.addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleEvent);
  }

  @Bind()
  handleEvent(e) {
    const { type, payload } = e.data;
    if (type === '/sqam/claimStatement/detail/:id' && payload === 'SRM-HOZON') {
      this.handleSearch();
      this.fetchLines();
      const { form } = this.props;
      setTimeout(() => {
        // 阻止单选框闪选
        form.resetFields(); // 需要对表单进行重置，否则扩展字段值不会变化
      }, 1000);
    }
  }

  /**
   * 查询
   */
  @Bind()
  async handleSearch() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    let data = {};
    if (!isUndefined(id)) {
      // 头查询
      data = await dispatch({
        type: 'claimStatement/FetchDetailDataHead',
        payload: {
          formHeaderId: id,
          customizeUnitCode:
            'SQAM.CLAIM_STATEMENT_DEATIL.BASIC_INFO,SQAM.CLAIM_STATEMENT_DEATIL.CLAIM_INFO,SQAM.CLAIM_STATEMENT_DEATIL.STATEMENT',
        },
      });
      const { purchaseAttachmentUuid } = data || {};
      // if (['COMMUTED_ITEM'].includes(appealHandleActionCode)) {
      //   // eslint-disable-next-line no-undef
      //   this.setState({ ChangeItemReadOnly: false });
      // }
      queryFileListOrg({
        attachmentUUID: purchaseAttachmentUuid || uuid(),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: 'sqam-claim',
      }).then((res1) => {
        if (res1) {
          this.setState({
            fileNum: res1.length,
          });
        }
      });
      if (data && !data.purchaseAttachmentUuid) {
        queryUUID().then((result) => {
          if (result) {
            const response = getResponse(result);
            if (response && response.content) {
              this.bindHeaderAttachmentUuid(response.content);
            }
          }
        });
      }
      this.setState({
        headerData: data || {},
        flag: true,
        basePrice: data?.claimAmountMaintainMode,
      });
      // });
    }
    return data;
  }

  // 行查询
  @Bind()
  fetchLines(page = {}) {
    const { dispatch, match, tenantId,remote: remoteProps } = this.props;
    const { id } = match.params;
    let param = {};
    if (!isUndefined(this.formFilter)) {
      param = this.formFilter?.getFieldsValue() || {};
    }
    const params = {
      page,
      formHeaderId: id,
      tenantId,
      customizeUnitCode:
        'SQAM.CLAIM_STATEMENT_DEATIL.ITEM,SQAM.CLAIM_STATEMENT_DEATIL.ITEM_FILTER',
      ...param,
    };
    const payload =remoteProps
    ? remoteProps.process("SQAM_CLAIM_STATEMENT_DETAIL_CUX_CLAIM_ITEM_QUERY_PARAMS",params,{_this: this})
    : params;
    dispatch({
      type: 'claimStatement/FetchDetailDataList',
      payload,
    });
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.formFilter = (ref.props || {}).form;
  }

  @Bind()
  fetchFlag(formHeaderId) {
    fetchFlag(formHeaderId).then((res) => {
      if (res) {
        this.setState({
          flag: true,
        });
      } else {
        this.setState({
          flag: false,
        });
      }
    });
  }

  @Bind()
  whetherDisabled(obj, record) {
    const { dispatch, claimStatement } = this.props;
    const { DetailListDataSource = [] } = claimStatement;
    dispatch({
      type: 'claimStatement/updateState',
      payload: {
        DetailListDataSource: DetailListDataSource.map((item) => {
          if (record.formLineId === item.formLineId) {
            return {
              ...item,
              disabledTax: obj.disabledTax && obj.disabledTax,
              disabledNoTax: obj.disabledNoTax && obj.disabledNoTax,
            };
          } else {
            return item;
          }
        }),
      },
    });
  }

  /**
   * checkbox选择
   */
  @Bind()
  handleCheckBoxChange(checkedValues = '') {
    this.setState({
      isButtonsShow: checkedValues.includes('COMMUTED_ITEM'),
    });
    this.handleSearch();

    if (checkedValues.includes('COMMUTED_ITEM')) {
      this.setState({
        ChangeItemReadOnly: false,
      });
    } else {
      this.setState({
        ChangeItemReadOnly: true,
      });
    }

    if (checkedValues.includes('NON_COMMUTED')) {
      this.setState({
        isNoChange: true,
      });
    } else {
      this.setState({
        isNoChange: false,
      });
    }

    if (checkedValues.includes('COMMUTED_AMOUNT')) {
      this.setState({
        ChangeBillReadOnly: false,
      });
    } else {
      this.setState({
        ChangeBillReadOnly: true,
      });
    }
    this.setState({
      checkedValues,
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /*
   * 返回列表页
   */
  @Bind()
  goBack(res) {
    const { history } = this.props;
    if (res) {
      notification.success();
      history.push({
        pathname: `/sqam/claimStatement/list`,
      });
    }
  }

  @Bind()
  expenseProcessTypeDescriptionChange(params) {
    const { headerData } = this.state;
    this.setState({
      headerData: {
        ...headerData,
        ...params,
      },
    });
  }

  // 维持原判
  @Bind()
  handleMaintainOriginal(type) {
    const {
      dispatch,
      form: { validateFields },
      claimStatement: {
        _token,
        objectVersionNumber,
        formHeaderId,
        DetailHeadDataSource,
        DetailListDataSource,
      },
    } = this.props;
    validateFields((err, value) => {
      if (!err) {
        const listDatas = getEditTableData(
          DetailListDataSource,
          ['rowKey', '_status', 'formLineId'],
          { force: true }
        ).map((item) => {
          return {
            ...item,
            occurDate: item.occurDate
              ? moment(item.occurDate).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            taxFlag: item.taxFlag ? 1 : 0,
            lineCancelFlag: item.lineCancelFlag ? 1 : 0,
          };
        });
        if (!isEmpty(DetailListDataSource) && isEmpty(listDatas)) return; // 存在必填项
        const newValues = {
          ...DetailHeadDataSource,
          ...value,
          appealHandleActionCode: this.state.checkedValues.toString(),
          creationDate: value.creationDate && moment(value.creationDate).format(DATETIME_MIN),
          _token,
          objectVersionNumber,
          formHeaderId,
          claimFormLineDTOList: listDatas,
          formNum: DetailHeadDataSource.formNum,
          feedbackDate: value.feedbackDate
            ? moment(value.feedbackDate).format('YYYY-MM-DD HH:mm:ss')
            : null,
        };

        const validateOk = () => {
          dispatch({
            type: 'claimStatement/MaintainOriginal',
            payload: {
              body: newValues,
              customizeUnitCode: customizeUnitCodes,
            },
          }).then((res) => {
            this.goBack(res);
          });
        };

        if (type === 'NON_COMMUTED') {
          dispatch({
            type: 'claimStatement/submitValidate',
            payload: { body: newValues, customizeUnitCode: customizeUnitCodes },
          }).then((valiRes) => {
            if (!valiRes) return;
            const { validatedCode, msg } = valiRes || {};
            if (validatedCode === 'WARNING') {
              Modal.confirm({
                content: msg,
                onOk: validateOk,
              });
            } else if (validatedCode === 'ERROR') {
              notification.error({
                message: intl.get('sqam.common.notification.error').d('操作失败'),
                description: msg,
              });
            } else if (valiRes) {
              return validateOk();
            }
          });
        } else {
          validateOk();
        }
      }
    });
  }

  // 确认改判

  @Bind()
  handleConfirmChange(type) {
    const { dispatch } = this.props;
    const { checkedValues = '' } = this.state;
    if (checkedValues === '') {
      Modal.warning({
        title: intl.get('sqam.common.message.pleaseMaintainData').d('请先维护数据'),
      });
    } else {
      const newValues = this.getNewestData();
      const { claimFormLineDTOList } = newValues;
      if (!isEmpty(newValues) && isEmpty(claimFormLineDTOList)) {
        notification.warning({
          message: intl
            .get('sqam.common.view.message.publishWaring')
            .d('该索赔单没有维护行信息，无法发布'),
        });
        return;
      }
      if (isEmpty(newValues)) return;
      const validateOk = () => {
        dispatch({
          type: 'claimStatement/ConfirmChange',
          payload: { body: newValues, customizeUnitCode: customizeUnitCodes },
        }).then((res) => {
          this.goBack(res);
        });
      };
      if (type === 'COMMUTED_ITEM') {
        dispatch({
          type: 'claimStatement/submitValidate',
          payload: { body: newValues, customizeUnitCode: customizeUnitCodes },
        }).then((valiRes) => {
          if (!valiRes) return;
          const { validatedCode, msg } = valiRes || {};
          if (validatedCode === 'WARNING') {
            Modal.confirm({
              content: msg,
              onOk: validateOk,
            });
          } else if (validatedCode === 'ERROR') {
            notification.error({
              message: intl.get('sqam.common.notification.error').d('操作失败'),
              description: msg,
            });
          } else if (valiRes) {
            return validateOk();
          }
        });
      } else {
        validateOk();
      }
    }
  }

  // 保存
  @Bind()
  handleSave() {
    const { dispatch, form } = this.props;

    const newValues = this.getNewestData();
    if (!isEmpty(newValues)) {
      dispatch({
        type: 'claimStatement/SaveClaim',
        payload: {
          body: newValues,
          customizeUnitCode: customizeUnitCodes,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch();
          this.fetchLines();
          setTimeout(() => {
            // 阻止单选框闪选
            form.resetFields(); // 需要对表单进行重置，否则扩展字段值不会变化
          }, 1000);
        }
      });
    }
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'claimStatement/queryValueCode',
      payload: {
        changeType: 'SQAM.APPEAL_PROCESS_ACTION', // 不改判/改判项目/改判金额
        payMentType: 'SQAM.PAYMENT_TYPE', // 费用处理方式
      },
    });
  }

  // 取消索赔

  @Bind()
  handleCancelClaim() {
    const { dispatch } = this.props;
    const newValues = this.getNewestData();
    if (!isEmpty(newValues)) {
      dispatch({
        type: 'claimStatement/CancelClaim',
        payload: { body: newValues, customizeUnitCode: customizeUnitCodes },
      }).then((res) => {
        this.goBack(res);
      });
    }
  }

  /**
   *  获取修改后的页面数据
   */
  @Bind()
  getNewestData() {
    const {
      form = {},
      claimStatement: {
        DetailListDataSource,
        DetailHeadDataSource,
        _token,
        formHeaderId,
        objectVersionNumber,
      },
    } = this.props;
    let newValues = {};
    const { validateFields } = form;
    // const { purchaseAttachmentUuid, supplierAttachmentUuid } = DetailHeadDataSource;
    validateFields((err, value) => {
      if (!err) {
        const ListDatas = getEditTableData(
          DetailListDataSource,
          ['rowKey', '_status', 'formLineId'],
          { force: true }
        ).map((item) => {
          return {
            ...item,
            occurDate: item.occurDate
              ? moment(item.occurDate).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            taxFlag: item.taxFlag ? 1 : 0,
            lineCancelFlag: item.lineCancelFlag ? 1 : 0,
          };
        });
        if (
          (DetailListDataSource.length > 0 && !isEmpty(ListDatas)) ||
          isEmpty(DetailListDataSource)
        ) {
          newValues = {
            ...DetailHeadDataSource,
            ...value,
            appealHandleActionCode: this.state.checkedValues.toString(),
            lineCancelFlag: value.lineCancelFlag ? 1 : 0,
            taxFlag: value.taxFlag ? 1 : 0,
            claimFormLineDTOList: ListDatas,
            _token,
            formHeaderId,
            objectVersionNumber,
            claimFormLineList: ListDatas,
            formNum: DetailHeadDataSource.formNum,
            feedbackDate: value.feedbackDate
              ? moment(value.feedbackDate).format('YYYY-MM-DD HH:mm:ss')
              : null,
            // purchaseAttachmentUuid,
            // supplierAttachmentUuid,
          };
        }
      }
    });
    return newValues;
  }

  // /**
  //  * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
  //  * @param {!Array<object>} attachmentUuid - 附件uuid
  //  */
  // @Bind()
  // afterOpenHeaderUploadModal(attachmentUuid) {
  //   const {
  //     claimStatement: { DetailHeadDataSource },
  //   } = this.props;
  //   if (isEmpty(DetailHeadDataSource.purchaseAttachmentUuid)) {
  //     this.bindHeaderAttachmentUuid(attachmentUuid);
  //   }
  // }

  /**
   * bindHeaderAttachmentUuid - 绑定头附件id
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  bindHeaderAttachmentUuid(attachmentUuid) {
    const {
      dispatch,
      claimStatement: { formHeaderId },
    } = this.props;
    dispatch({
      type: 'claimStatement/bindHeaderAttachmentUuid',
      payload: {
        formHeaderId,
        attachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.handleSearch();
      }
    });
  }
  /**
   * 简单的判断两个对象值是否相同
   * 忽略obj1.a = undefined,obj2.a = null 的情况(这种情况默认相同)
   * @param {*} obj1
   * @param {*} obj2
   * @returns Boolean
   */

  @Bind()
  isEqualBoth(obj1, obj2) {
    let isSame = true;
    for (const [key, value] of Object.entries(obj1)) {
      const otherValue = obj2[key];
      if (!(isNil(value) && isNil(otherValue)) && value !== otherValue) {
        // 是否两个字段的值不同，忽略字段值为undefined或者null的情况
        isSame = false;
        return false;
      }
    }
    return isSame;
  }

  /**
   * 处理列表列表数据分页变化
   */
  @Bind()
  handleListPageChange(page = {}) {
    const {
      claimStatement: { DetailListDataSource = [] },
    } = this.props;

    const newList = getEditTableData(DetailListDataSource, ['rowKey', '_status', 'formLineId'], {
      force: true,
    });

    let isEdit = false;
    if (newList.length) {
      DetailListDataSource.forEach((oldRecord, index) => {
        const newData = newList[index];
        const oldData = {};
        Object.entries(oldRecord).forEach(([key, value]) => {
          if (key !== '$form') {
            oldData[key] = value;
          }
        });
        if (!this.isEqualBoth(oldData, newData)) {
          isEdit = true;
          return true;
        }
      });
      if (isEdit) {
        // 表格数据发生变化
        Modal.confirm({
          title: intl
            .get('sqam.common.view.message.turn.saveList')
            .d('有数据未保存，翻页会导致数据丢失，是否继续?'),
          onOk: () => {
            this.fetchLines(page);
          },
          onCancel() {},
        });
      } else {
        this.fetchLines(page);
      }
    }
  }

  // 操作记录
  @Bind()
  operationRecord(visible) {
    if (visible) {
      this.fetchOperationRecord();
    }
    this.setState({
      operationRecordVisible: visible,
    });
  }

  // 操作记录
  @Bind()
  approveAndOperationRecord(visible) {
    this.setState({
      visible,
    });
  }

  // 操作记录
  @Bind()
  fetchOperationRecord(page = {}, values) {
    const { dispatch, match = {} } = this.props;
    const { id } = match.params;
    const searchValues = filterNullValueObject(values);
    if (id) {
      dispatch({
        type: 'sqamCommon/fetchOperationRecord',
        payload: {
          page,
          ...searchValues,
          formHeaderId: id,
        },
      });
    }
  }

  // 操作记录查询
  @Bind()
  fetchApproveRecord(page = {}, values) {
    const { match, dispatch } = this.props;
    const formHeaderId = match.params.id;
    const searchValues = filterNullValueObject(values);
    dispatch({
      type: 'sqamCommon/approveHistory',
      payload: {
        page,
        ...searchValues,
        formHeaderId,
      },
    });
  }

  // 更改源数据dataSource
  @Bind()
  changeDataSource(record, changItem = {}) {
    const { dispatch, claimStatement } = this.props;
    const { DetailListDataSource = [], DetailHeadDataSource = {} } = claimStatement;
    let newTotalAmount = DetailHeadDataSource.totalAmount;
    let otherSum = 0;
    DetailListDataSource.map((item) => {
      otherSum = math.plus(item.taxIncludedLineAmount, otherSum);
      return item;
    });
    const otherAmount = math.minus(newTotalAmount, otherSum);
    const newDataSource = DetailListDataSource.map((item) => {
      if (record.formLineId === item.formLineId) {
        return {
          ...item,
          ...changItem,
        };
      }
      return item;
    });
    if (isNumber(changItem.taxIncludedLineAmount)) {
      let newSum = 0;
      newDataSource.map((item) => {
        newSum = math.plus(item.taxIncludedLineAmount, newSum);
        return item;
      });
      newTotalAmount = math.plus(otherAmount, newSum);
    }
    dispatch({
      type: 'claimStatement/updateState',
      payload: {
        DetailHeadDataSource: {
          ...DetailHeadDataSource,
          totalAmount: newTotalAmount,
        },
        DetailListDataSource: newDataSource,
      },
    });
  }

  @Bind()
  publish() {
    const { checkedValues = '' } = this.state;
    if (checkedValues) {
      switch (checkedValues) {
        case 'NON_COMMUTED':
          this.handleMaintainOriginal('NON_COMMUTED');
          break;
        case 'INITIATE_ARBITRATION':
          this.handleMaintainOriginal();
          break;
        case 'COMMUTED_AMOUNT':
          this.handleConfirmChange();
          break;
        case 'COMMUTED_ITEM':
          this.handleConfirmChange('COMMUTED_ITEM');
          break;
        case 'CANCLE':
          this.handleCancelClaim();
          break;
        default:
          break;
      }
    }
  }

  // 计算申诉次数
  @Bind()
  getApplyTimes(appealedSum = 0, appealedCount = 0) {
    return [false, null, undefined, '', 0, NaN].includes(appealedCount)
      ? appealedSum
      : `${appealedSum}/${appealedCount}`;
  }

  @Bind()
  tabChange(key) {
    this.setState({
      activeKey: key,
    });
  }

  // 新增行
  @Bind()
  addLine() {
    const {
      dispatch,
      claimStatement: { DetailListDataSource = [], DetailListPagination = {} },
    } = this.props;
    const newlineDateSource = [
      ...DetailListDataSource,
      {
        rowKey: uuid(),
        formLineId: uuid(),
        _status: 'create',
        disabledTax: false,
        disabledNoTax: false,
      },
    ];
    dispatch({
      type: 'claimStatement/updateState',
      payload: {
        DetailListDataSource: newlineDateSource,
        DetailListPagination: addItemToPagination(
          DetailListDataSource.length,
          DetailListPagination
        ),
      },
    });
  }

  // 执行删除
  @Bind()
  handleDelete(deleteList = []) {
    const { dispatch } = this.props;
    const deleteLines = deleteList.map((item) => omit(item, ['$form', 'rowKey', '_status']));
    dispatch({
      type: 'claimStatement/deleteLine',
      payload: deleteLines,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchLines();
        this.setState({ selectedRowKeys: [], selectedRows: [] });
      }
    });
  }

  /**
   * 删除行数据
   */
  @Bind()
  deleteLine() {
    const {
      dispatch,
      claimStatement: { DetailListDataSource = [], DetailListPagination = {} },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const deleteList = [];
    const createList = [];
    DetailListDataSource.forEach((item) => {
      if (selectedRowKeys.includes(item.rowKey)) {
        if (item._status === 'update') {
          deleteList.push(item);
        } else if (item._status === 'create') {
          createList.push(item.rowKey);
        }
      }
    });
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.remove`).d('确定删除选中数据'),
      onOk: () => {
        if (!isEmpty(deleteList)) {
          if (DetailListDataSource.some((item) => item._status === 'create')) {
            Modal.confirm({
              title: intl
                .get(`hzero.common.validation.nowDataNotSave`)
                .d(`当前数据有未保存。继续操作将造成数据丢失，是否继续？`),
              onOk: () => this.handleDelete(deleteList),
            });
          } else {
            this.handleDelete(deleteList);
          }
        } else if (!isEmpty(createList)) {
          const newlineDateSource = DetailListDataSource.filter((item) => {
            return !createList.includes(item.rowKey);
          });
          dispatch({
            type: 'claimStatement/updateState',
            payload: {
              DetailListDataSource: newlineDateSource,
              DetailListPagination: delItemsToPagination(
                selectedRowKeys.length,
                DetailListDataSource.length,
                DetailListPagination
              ),
            },
          });
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
          });
        }
      },
    });
  }

  @Bind()
  handleRowSelect(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  @Bind()
  headerBtnsRender() {
    const { checkedValues, fileNum, purchaseAttachmentUuid, flag } = this.state;
    const {
      maintainLoading,
      confirmLoading,
      cancelLoading,
      HeadLoading,
      ListLoading,
      deleteLineLoading,
      saveLoading,
      claimStatement: { DetailHeadDataSource = {}, formHeaderId },
    } = this.props;
    const isLoading =
      HeadLoading ||
      ListLoading ||
      confirmLoading ||
      cancelLoading ||
      maintainLoading ||
      deleteLineLoading ||
      saveLoading;
    const btns = [
      {
        name: 'saveBtn',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          loading: isLoading,
          onClick: () => this.handleSave(),
        },
      },
      {
        name: 'operating',
        child: flag
          ? intl.get('hzero.common.button.approveAndOperating').d('审批/操作记录')
          : intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          disabled: !formHeaderId,
          loading: isLoading,
          onClick: () =>
            flag
              ? this.approveAndOperationRecord(true, formHeaderId)
              : this.operationRecord(true, formHeaderId),
        },
      },
      {
        name: 'upload',
        btnComp: UploadModal,
        btnProps: {
          showFilesNumber: false,
          attachmentUUID: DetailHeadDataSource.purchaseAttachmentUuid || purchaseAttachmentUuid,
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          bucketDirectory: 'sqam-claim',
          btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${
            DetailHeadDataSource.purchaseAttachmentUuid ? fileNum : 0
          })`,
          btnProps: {
            icon: 'upload',
            disabled: !formHeaderId,
            loading: isLoading,
          },
        },
      },
      {
        name: 'submit',
        child: intl.get('sqam.common.button.publish').d('发布'),
        btnProps: {
          icon: 'save',
          type: 'primary',
          onClick: throttle(this.publish, 1500, { trailing: false }),
          disabled: !checkedValues,
          loading: isLoading,
        },
      },
    ];
    return btns;
  }

  // 记录数据
  @Bind()
  handleSetState(payload) {
    this.setState(payload);
  } 

  // 埋点处理是否显示索赔单行的勾选框
  @Bind()
  handleTableSelectFlag() {
    const { remote: remoteProps } = this.props;
    const { headerData } = this.state;
    return remoteProps
      ? remoteProps.process('SQAM_CLAIM_STATEMENT_DETAIL_CUX_LINE_SELECT', false, { headerData })
      : false;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      collapseKeys,
      ChangeItemReadOnly,
      // isNoChange,
      checkedValues,
      operationRecordVisible,
      ChangeBillReadOnly,
      purchaseAttachmentUuid,
      activeKey,
      visible,
      selectedRowKeys,
      isButtonsShow,
      headerData,
      basePrice,
      selectedRows,
    } = this.state;
    const {
      match,
      form = {},
      tenantId,
      HeadLoading,
      ListLoading,
      claimStatement,
      fetchOperationRecordListLoading,
      sqamCommon = {},
      customizeTable,
      customizeForm,
      loading,
      customizeBtnGroup,
      customizeFilterForm,
      custConfig,
      deleteLineLoading,
      history,
      customizeCollapse,
      remote: remoteProps,
    } = this.props;
    const {
      DetailListDataSource = [],
      DetailHeadDataSource = {},
      DetailListPagination,
      formHeaderId,
      code: { payMentType = [], changeType = [] },
    } = claimStatement;
    const {
      operationRecordList = [],
      operationRecordPagination = {},
      approveHistoryList = [],
    } = sqamCommon;
    const { getFieldDecorator } = form;
    const baseInfoProps = {
      customizeForm,
      form,
      dataSource: DetailHeadDataSource,
    };
    const claimInfoProps = {
      form,
      payMentType,
      ChangeItemReadOnly,
      dataSource: DetailHeadDataSource,
      expenseProcessTypeDescriptionChange: this.expenseProcessTypeDescriptionChange,
      customizeForm,
      checkedValues,
      history,
    };
    const stateDealProps = {
      payMentType,
      basePrice,
      headerData,
      ChangeFormItem: this.ChangeFormItem,
      form,
      tenantId,
      customizeTable,
      checkedValues, 
      dataSource: DetailListDataSource,
      pagination: DetailListPagination,
      ChangeItemReadOnly,
      ChangeBillReadOnly,
      ListLoading,
      claimTypeId: DetailHeadDataSource.claimTypeId,
      onChange: this.handleListPageChange,
      whetherDisabled: this.whetherDisabled,
      changeDataSource: this.changeDataSource,
      customizeUnitCode: 'SQAM.CLAIM_STATEMENT_DEATIL.ITEM',
      rowSelection:
        isButtonsShow || this.handleTableSelectFlag()
          ? {
              selectedRowKeys,
              onChange: this.handleRowSelect,
            }
          : null,
    };
    const uploadModalProps = {
      btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${
        DetailHeadDataSource.purchaseAttachmentUuid ? this.state.fileNum : 0
      })`,
      btnProps: {
        icon: 'upload',
        disabled: !formHeaderId,
      },
      showFilesNumber: false,
      attachmentUUID: DetailHeadDataSource.purchaseAttachmentUuid || purchaseAttachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
      // afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };

    const OperationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      loading: fetchOperationRecordListLoading,
      onCancel: () => this.approveAndOperationRecord(false),
      handleOperationRecordSearch: this.fetchOperationRecord,
      isExport: true,
      formHeaderId,
    };

    const ApproveRecordProps = {
      dataSource: approveHistoryList,
      loading,
      handleOperationRecordSearch: this.fetchApproveRecord,
    };

    const UploadModalProps = {
      viewOnly: true,
      attachmentUUID: DetailHeadDataSource.supplierAttachmentUuid,
      icon: 'download',
      tenantId: getCurrentOrganizationId(),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
      uploadSuccess: this.handleSearch,
      removeCallback: this.handleSearch,
    };

    const RecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.fetchOperationRecord,
      hideModal: () => this.operationRecord(false),
      visible: operationRecordVisible,
      isExport: true,
      formHeaderId,
    };

    const modalProps = {
      visible,
      width: 1100,
      footer: null,
      onCancel: () => this.approveAndOperationRecord(false),
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      // title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    };

    const stateDealFilterProps = {
      tenantId,
      isButtonsShow,
      DetailHeadDataSource,
      addLine: this.addLine,
      selectedRowKeys,
      deleteLine: this.deleteLine,
      fetchLines: this.fetchLines,
      formHeaderId,
      fetchDetailDataHead: this.handleSearch,
      onRef: this.handleBindRef,
      customizeFilterForm,
      custConfig,
      deleteLineLoading,
      remoteProps,
      handleSetState: this.handleSetState,
      fetchHeader: this.handleSearch,
      selectedRows,
      headerData,
      lineData: DetailListDataSource,
      basicForm: form,
    };
    const { supplierCompanyName, formNum } = DetailHeadDataSource;
    const notPubType = match.path !== '/pub/sqam/claimStatement/detail/:id';
    return (
      <React.Fragment>
        {notPubType && (
          <Header
            title={
              !isUndefined(supplierCompanyName) && !isUndefined(formNum)
                ? `${supplierCompanyName}${formNum}${intl
                    .get(`sqam.common.view.claimStatementDeal`)
                    .d(`索赔单申诉处理`)}`
                : ''
            }
            backPath="/sqam/claimStatement/list"
          >
            {customizeBtnGroup(
              { code: 'SQAM.CLAIM_STATEMENT_DEATIL.HEAD_BTNS', pro: true },
              <DynamicButtons buttons={this.headerBtnsRender()} />
            )}
          </Header>
        )}
        <Content className={classNames(styles['page-content'])}>
          <Spin
            spinning={HeadLoading && ListLoading}
            wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}
          >
            {!notPubType && (
              <UploadModal
                {...uploadModalProps}
                btnProps={{ ...uploadModalProps.btnProps, style: { marginBottom: '10px' } }}
              />
            )} 
            {customizeCollapse({
              code:"SQAM.CLAIM_STATEMENT_DEATIL.COLLAPSE"
            },
            <Collapse
              forceRender
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`sqam.common.panel.statementDeal`).d('申诉处理')}</h3>
                    <a>
                      {collapseKeys.includes('stateDeal')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('stateDeal') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="stateDeal"
              >
                {customizeForm(
                  {
                    code: 'SQAM.CLAIM_STATEMENT_DEATIL.STATEMENT',
                    form,
                    dataSource: DetailHeadDataSource,
                  },
                  <Fragment>
                    <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item label={intl.get('sqam.common.model.applyTimes').d('申诉次数')}>
                          {getFieldDecorator('appealedSum')(
                            <span>
                              {this.getApplyTimes(
                                DetailHeadDataSource.appealedSum,
                                DetailHeadDataSource.appealedCount
                              )}
                            </span>
                          )}
                        </Form.Item>
                      </Col>
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item label={intl.get('sqam.common.date.statementDate').d('申诉日期')}>
                          {getFieldDecorator('appealedDate')(
                            <span>{dateTimeRender(DetailHeadDataSource.appealedDate)}</span>
                          )}
                        </Form.Item>
                      </Col>
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item
                          label={intl.get(`${prefix}.panel.appealHandledDate`).d('申诉处理日期')}
                        >
                          {getFieldDecorator('appealHandledDate')(
                            <span>{dateTimeRender(DetailHeadDataSource.appealHandledDate)}</span>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item
                          label={intl.get(`${prefix}.panel.statementContent`).d('申诉内容')}
                        >
                          {getFieldDecorator('appealContent')(
                            <span>{DetailHeadDataSource.appealContentMeaning}</span>
                          )}
                        </Form.Item>
                      </Col>
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item
                          label={intl
                            .get(`${prefix}.panel.supplierAppealAttachment`)
                            .d('供应商申诉附件')}
                          {...formLayout}
                        >
                          {getFieldDecorator('supplierAttachmentUuid')(
                            <span>{<UploadModal {...UploadModalProps} />}</span>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item
                          label={intl.get(`${prefix}.model.statementOption`).d('申诉意见')}
                        >
                          {getFieldDecorator('appealOpinion')(
                            <span>{DetailHeadDataSource.appealOpinion}</span>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item label={intl.get(`sqam.common.model.dealAction`).d('处理动作')}>
                          {getFieldDecorator('appealHandleActionCode', {
                            initialValue: DetailHeadDataSource.appealHandleActionCode,
                            rules: [
                              {
                                required: true,
                                message: intl.get('hzero.common.validation.notNull', {
                                  name: intl.get(`sqam.common.model.dealAction`).d('处理动作'),
                                }),
                              },
                            ],
                          })(
                            <Select
                              allowClear
                              style={{ width: '50%' }}
                              onChange={this.handleCheckBoxChange}
                            >
                              {changeType.map((item) => (
                                <Select.Option key={item.value}>{item.meaning}</Select.Option>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
                      <Col {...FORM_COL_2_LAYOUT}>
                        <Form.Item
                          label={intl.get(`sqam.common.model.statementResolution`).d('决议说明')}
                        >
                          {getFieldDecorator('appealHandleOpinion', {
                            initialValue: DetailHeadDataSource.appealHandleOpinion,
                            rules: [
                              {
                                required: true,
                                message: intl.get('hzero.common.validation.notNull', {
                                  name: intl
                                    .get(`sqam.common.model.statementResolution`)
                                    .d('决议说明'),
                                }),
                              },
                            ],
                          })(<Input.TextArea rows={4} style={{ height: '56px' }} />)}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Fragment>
                )}
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`sqam.common.view.panel.baseInfo`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('baseInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="baseInfo"
              >
                <BaseInfo {...baseInfoProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`sqam.common.view.panel.claimInfo`).d('索赔信息')}</h3>
                    <a>
                      {collapseKeys.includes('claimInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('claimInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="claimInfo"
              >
                <ClaimInfo {...claimInfoProps} />
              </Collapse.Panel>
              <Collapse.Panel
                className={styles['purchase-application']}
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`sqam.common.view.panel.claimItem`).d('索赔项目')}</h3>
                    <a>
                      {collapseKeys.includes('claimItem')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('claimItem') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="claimItem"
              >
                <StateDealFilter {...stateDealFilterProps} />
                <StateDeal {...stateDealProps} />
              </Collapse.Panel>
            </Collapse>
          )}
          </Spin>
          <Modal {...modalProps}>
            <Tabs onChange={this.tabChange} activeKey={activeKey} animated={false}>
              <Tabs.TabPane
                tab={intl.get('hzero.common.button.operating').d('操作记录')}
                key="option"
              > 
                <OperationRecord {...OperationRecordProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl
                  .get(`sqam.common.model.qualityRectification.approvalRecord`)
                  .d('审批记录')}
                key="approve"
              >
                <ApproveRecord {...ApproveRecordProps} />
              </Tabs.TabPane>
            </Tabs>
          </Modal>
          <Record {...RecordProps} />
        </Content>
      </React.Fragment>
    );
  }
}
