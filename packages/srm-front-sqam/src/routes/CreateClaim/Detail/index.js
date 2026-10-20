import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Form, Icon, Modal, Tabs } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import uuid from 'uuid/v4'; 
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { math } from 'choerodon-ui/dataset';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remote from 'hzero-front/lib/utils/remote';

import classNames from 'classnames';
import { isEmpty, omit, isNumber, isFunction, isUndefined, throttle, isNil } from 'lodash';
import moment from 'moment';
import { DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  getEditTableData,
  createPagination,
  addItemToPagination,
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentUserId,
} from 'utils/utils';
import notification from 'utils/notification';
import UploadModal from '_components/Upload';
import { queryUUID, queryFileListOrg } from 'services/api';
import { stringify } from 'querystring';
import { Button as PermissionButton } from 'components/Permission';

import { fetchFlag } from '@/services/sqamCommonService';
import { decimalPointAccuracy } from '@/routes/utils';
import BasicInfoForm from './BasicInfoForm';
import ClaimInformation from './ClaimInformation';
import ClaimItem from './ClaimItem';
import Change from '../../components/ChangeFormItem';
import OperationRecord from '../../RecordComponents/OperationRecord';
import ApproveRecord from '../../RecordComponents/ApproveRecord';
import styles from './index.less';
import Record from '../../components/OperationRecord/OperationRecord';

@withCustomize({
  unitCode: [
    'SQAM.CREATE_CLAIM.DETAIL.BASIC_INFO',
    'SQAM.CREATE_CLAIM.DETAIL.CLAIM_INFO',
    'SQAM.CREATE_CLAIM.DETAIL.LINES',
  ],
})
@connect(({ createClaim, sqamCommon, loading }) => ({
  createClaim,
  sqamCommon,
  createClaimLoading: loading.effects['createClaim/createClaim'],
  fetchHeaderLoading: loading.effects['createClaim/fetchHeader'],
  fetchLinesLoading: loading.effects['createClaim/fetchLines'],
  submitLoading: loading.effects['createClaim/submitClaim'],
  userIDLoading: loading.effects['createClaim/userIDDefault'],
  fetchOperationRecordListLoading: loading.effects['sqamCommon/fetchOperationRecord'],
  fetchApproveRecordListLoading: loading.effects['sqamCommon/fetchApproveRecord'],
  loading: loading.effects['sqam/approveHistory'],
  deleteLoading: loading.effects['createClaim/deleteClaim'],
  deleteLineLoading: loading.effects['createClaim/deleteLine'],
}))
@remote({
  code: 'SQAM_CREATE_CLAIM_DETAIL_CUX',
  name: 'remote',
},{
  events:{
    cuxHandleDelete:()=>{}, // 删除逻辑二开
  }
})
@formatterCollections({
  code: [
    'sqam.common',
    'sqam.createClaim',
    'entity.item',
    'entity.company',
    'entity.business',
    'entity.supplier',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'sfin.invoiceBill',
  ],
})
@Form.create({ fieldNameProp: null })
export default class Detail extends Component {
  constructor(props) {
    super(props);
    // const {
    //   history: {
    //     location: { search },
    //   },
    // } = this.props;
    // const { typeDesc, claimTypeId, autoConfirmFlag } = querystring.parse(search.substr(1));
    this.state = {
      lineDataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      flag: false,
      visible: false,
      collapseKeys: ['A', 'B', 'C'],
      headerData: {},
      linepagination: {},
      purchaseAttachmentUuid: null,
      fileNum: 0,
      defaultTypeDesc: '',
      defaultClaimTypeId: undefined,
      defaultAutoFlag: undefined,
      activeKey: 'option',
      recordFlag: false,
      approveAndOperationVisible: false,
      expenseProcessTypeDescription: undefined,
      basePrice: '',
      firstLoad: true,
    };
    const Change_ = new Change('rowKey');
    this.changeList = Change_.changeList;
    this.setUpdate = Change_.setUpdate;
    this.isUpdata = Change_._isUpdate;
    this.ChangeFormItem = Change_.ChangeFormItem;
  }

  async componentDidMount() {
    const { match, dispatch, remote: remoteProps } = this.props;
    // const { formHeaderId } = this.state;
    if (match.params.id) {
      this.fetchHeader();
      this.fetchLines();
      this.fetchFlag(match.params.id);
    } else {
      // 获取信息
      await this.fetchDefaultConfig();
      const initParams = await remoteProps?.process('cuxCreateHeader', {}, {});
      console.log(initParams);
      dispatch({
        type: 'createClaim/userID',
        payload: { userId: getCurrentUserId() },
      }).then((result) => {
        if (result && result.enabledFlag === 1) {
          dispatch({
            type: 'createClaim/userIDDefault',
            payload: { userId: result.id },
          }).then((res) => {
            if (res && res.enabledFlag === 1) {
              this.setState({
                headerData: {
                  companyId: res.companyId,
                  companyName: res.companyName,
                  invOrganizationId: res.organizationId,
                  invOrganizationName: res.organizationName,
                  ouId: res.ouId,
                  ouName: res.ouName,
                  ouCode: res.ouCode,
                  ...(initParams || {}),
                },
              });
            }
          });
        } else {
          this.setState({
            headerData: {
              ...(initParams || {}),
            },
          });
        }
      });
    }
  }

  async componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { match: preMatch } = prevProps;
    if (match.params.id !== preMatch.params.id) {
      // await this.fetchDefaultConfig();
      this.fetchHeader();
      this.fetchLines();
      this.fetchFlag(match.params.id);
    }
  }

  @Bind()
  async fetchDefaultConfig() {
    const { dispatch } = this.props;
    // 获取信息
    const createRes = await dispatch({
      type: 'createClaim/create',
    });
    if (createRes) {
      const { typeDesc, claimTypeId, autoConfirmFlag } = createRes;
      this.setState({
        defaultTypeDesc: typeDesc,
        defaultClaimTypeId: Number(claimTypeId) || undefined,
        defaultAutoFlag: Number(autoConfirmFlag),
      });
    }
  }
  // objectVersionNumber: 2

  // objectVersionNumber: 3
  // 查询详情头数据
  @Bind()
  fetchHeader() {
    const { match, dispatch, remote: remoteProps } = this.props;
    const formHeaderId = match.params.id;
    if (formHeaderId) {
      dispatch({
        type: 'createClaim/fetchHeader',
        payload: formHeaderId,
      }).then((res) => {
        if (res && Object.keys(res).length !== 0) {
          const { purchaseAttachmentUuid = '' } = res;
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
          if (!res.purchaseAttachmentUuid) {
            queryUUID().then((result) => {
              if (result) {
                const response = getResponse(result);
                if (response && response.content) {
                  this.bindHeaderAttachmentUuid(response.content);
                }
              }
            });
          }
          if (this.state.firstLoad) {
            // 首次加载二开埋点
            if (remoteProps && remoteProps.event) {
              remoteProps.event.fireEvent('onLoadCux', {
                headerData: res,
                handleSetState: this.handleSetState,
              });
            }
          }
          this.setState({
            headerData: res,
            flag: true,
            basePrice: res.claimAmountMaintainMode,
            firstLoad: false,
          });
        }
      });
    }
  }

  // 记录数据
  @Bind()
  handleSetState(payload) {
    this.setState(payload);
  }

  @Bind()
  fetchFlag(formHeaderId) {
    fetchFlag(formHeaderId).then((res) => {
      if (res) {
        this.setState({
          recordFlag: true,
        });
      } else {
        this.setState({
          recordFlag: false,
        });
      }
    });
  }

  // 索赔单删除
  @Bind()
 async handleDeleteClaim(logicDelete = 0) {
    const { headerData } = this.state;
    const {
      dispatch,
      // match: {
      //   params: { id: formHeaderId },
      // },
      history,
      remote: remoteProps,
    } = this.props;
    const deleteParams=remoteProps.process("SQAM_CREATE_CLAIM_DETAIL_CUX_DELETE_PARAMS",{ ...headerData, logicDelete },{logicDelete,_this:this});
    const cuxRes = await remoteProps.event.fireEvent('cuxHandleDelete', {
      logicDelete,
      deleteParams,
      _this: this,
    });
    if (!cuxRes) {
      return;
    }
    Modal.confirm({
      title:
        logicDelete === 1
          ? intl.get('sqam.common.view.message.deleteClaim').d('是否删除索赔单')
          : intl.get('sqam.common.view.message.deleteClaimForever').d('是否永久删除索赔单'),
      onOk: () => {
        if (!isEmpty(headerData)) {
          dispatch({
            type: 'createClaim/deleteClaim',
            payload:deleteParams ,
          }).then((res) => {
            if (res) {
              notification.success();
              // if (logicDelete) {
              // 删除功能（物理删除），永久删除功能 逻辑删除
              history.push({
                pathname: `/sqam/createClaim/list`,
              });

              // dispatch(
              //   routerRedux.push({
              //     pathname: `/sqam/my-claim-form/detail`,
              //     search: querystring.stringify({ formHeaderId }),
              //   })
              // );
              // } else {
              //   // 永久删除功能 逻辑删除
              //   dispatch(
              //     routerRedux.push({
              //       pathname: `/sqam/createClaim/list`,
              //     })
              //   );
              // }
            }
          });
        } else {
          history.push({
            pathname: `/sqam/createClaim/list`,
          });
        }
      },
    });
  }

  // 查询详情行数据
  @Bind()
  fetchLines(page = {}) {
    const { match, dispatch } = this.props;
    const formHeaderId = match.params.id;
    if (formHeaderId) {
      dispatch({
        type: 'createClaim/fetchLines',
        payload: { formHeaderId, page },
      }).then((res) => {
        if (res) {
          this.setState({
            lineDataSource: res.content.map((item) => {
              const { amountFieldFlag } = item;
              return {
                ...item,
                rowKey: uuid(),
                _status: 'update',
                disabledTax: amountFieldFlag === 0,
                disabledNoTax: amountFieldFlag === 1,
              };
            }),
            linepagination: createPagination(res),
          });
        }
      });
    }
  }

  // 新增行
  @Bind()
  addLine() {
    const { lineDataSource, linepagination } = this.state;
    const { remote: remoteProps } = this.props;
    const defaultField = {
      rowKey: uuid(),
      formLineId: uuid(),
      _status: 'create',
      disabledTax: false,
      disabledNoTax: false,
    };
    const addField = remoteProps
      ? remoteProps.process('SQAM_CREATE_CLAIM_DETAIL_CUX_LINE_ADD_VALUE', defaultField, {
        lineDataSource,
        state: this.state,
      })
      : defaultField;
    const newlineDateSource = [...lineDataSource, addField];
    this.setState({
      lineDataSource: newlineDateSource,
      linepagination: addItemToPagination(lineDataSource.length, linepagination),
    });
  }

  // 批量新增行，绿联埋点二开用到
  @Bind()
  addLineBatch(lines) {
    const { lineDataSource, linepagination } = this.state;
    const newlineDateSource = [...lineDataSource, ...lines];
    this.setState({
      lineDataSource: newlineDateSource,
      linepagination: addItemToPagination(lineDataSource.length, linepagination),
    });
  }

  @Bind()
  whetherDisabled(obj, record) {
    const { lineDataSource } = this.state;
    this.setState({
      lineDataSource: lineDataSource.map((item) => {
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
    });
  }

  /**
   * 删除行数据
   */
  @Bind()
  deleteLine() {
    const { lineDataSource, selectedRowKeys } = this.state;
    const deleteList = [];
    const createList = [];
    lineDataSource.forEach((item) => {
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
          if (this.isUpdata() || lineDataSource.some((item) => item._status === 'create')) {
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
          const newLinedataSource = lineDataSource.filter((item) => {
            return !createList.includes(item.rowKey);
          });
          this.setState({
            lineDataSource: newLinedataSource,
            selectedRowKeys: [],
            selectedRows: [],
          });
          this.setUpdate('deleteLine', selectedRowKeys);
        }
      },
    });
  }

  // 执行删除
  @Bind()
  handleDelete(deleteList = []) {
    const { dispatch } = this.props;
    const deleteLines = deleteList.map((item) => omit(item, ['$form', 'rowKey', '_status']));
    dispatch({
      type: 'createClaim/deleteLine',
      payload: deleteLines,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchLines();
      }
    });
  }

  // 索赔单信息保存
  @Bind()
  handleSave() {
    const { lineDataSource, headerData } = this.state;
    const { form, dispatch } = this.props;
    const { match } = this.props;
    const formHeaderId = match.params.id;
    form.validateFieldsAndScroll((err, values) => {
      const additionalArray = ['supplierTenantId', 'supplierCode', 'supplierId'];
      const { supplierCompanyIdStash, ouCode, ...newValues } = values;
      const lineData = getEditTableData(lineDataSource, ['rowKey', '_status', 'formLineId']).map(
        (item) => {
          const associateItemUomPrecision =
            typeof item.associateItemUomPrecision === 'number'
              ? decimalPointAccuracy(item.associateItemQuantity, item.associateItemUomPrecision)
              : item.associateItemQuantity;

          const uomPrecision =
            typeof item.uomPrecision === 'number'
              ? decimalPointAccuracy(item.quantity, item.uomPrecision)
              : item.quantity;
          return {
            ...item,
            formHeaderId,
            quantity: uomPrecision,
            associateItemQuantity: associateItemUomPrecision,
            occurDate: item.occurDate
              ? moment(item.occurDate).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
          };
        }
      );
      const additiona = {
        feedbackDate: values.feedbackDate
          ? moment(values.feedbackDate).format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        creationDate: values.creationDate
          ? moment(values.creationDate).format(DEFAULT_DATETIME_FORMAT)
          : undefined,
      };
      additionalArray.forEach((item) => {
        additiona[item] = values[item] ? values[item] : headerData[item];
      });
      const claimFormDTO = {
        ...headerData,
        ...newValues,
        ...additiona,
        autoConfirmFlag: values.autoConfirmFlag ? 1 : 0,
        claimFormLineList: lineData,
        dataSourceNum:
          headerData.dataSourceCode === 'INSPECTION' ? null : form.getFieldValue('dataSourceNum'),
        supplierCompanyId: supplierCompanyIdStash || headerData.supplierCompanyId,
        formNum: headerData.formNum,
        claimTypeName: form.getFieldValue('claimTypeName') || headerData.claimTypeName,
        ouId: values.ouId || headerData.ouId,
        ouCode: ouCode || headerData.ouCode,
        sourceCode: formHeaderId ? headerData.sourceCode : 'MANUAL', // 如果是新建传MANUAL
      };
      if (!err && ((lineDataSource.length > 0 && !isEmpty(lineData)) || isEmpty(lineDataSource))) {
        dispatch({
          type: 'createClaim/createClaim',
          payload: claimFormDTO,
        }).then((res) => {
          if (res) {
            notification.success();
            const url = '/sqam/createClaim/detail';
            this.props.history.push(`${url}/${res.formHeaderId}`);
            if (form) form.resetFields();
            this.fetchHeader();
            this.fetchLines();
            // this.setState({ formHeaderId: res.formHeaderId }, () => {
            //   this.fetchHeader();
            //   this.fetchLines();
            // });
          }
        });
      }
    });
  }

  @Bind()
  getDefaultValue() {
    const { custConfig = {} } = this.props;
    const unitConfig = custConfig['SQAM.CREATE_CLAIM.DETAIL.LINES'];
    if (unitConfig) {
      const { fields } = unitConfig;
      const taxRateField = fields.find((item) => item.fieldCode === 'taxRate');
      return taxRateField?.defaultValueMeaning || undefined;
    }
    return undefined;
  }

  // 索赔单提交
  @Bind()
  handleSubmit() {
    const {remote: remotes, dispatch, form, match, history } = this.props;
    const { headerData = {}, lineDataSource } = this.state;
    const formHeaderId = match.params.id;
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        const { supplierCompanyIdStash, ouCode, ...newValues } = values;
        const lineList = getEditTableData(lineDataSource, ['rowKey', '_status', 'formLineId'], {
          force: true,
        }).map((item) => {
          const associateItemUomPrecision =
            typeof item.associateItemUomPrecision === 'number'
              ? decimalPointAccuracy(item.associateItemQuantity, item.associateItemUomPrecision)
              : item.associateItemQuantity;

          const uomPrecision =
            typeof item.uomPrecision === 'number'
              ? decimalPointAccuracy(item.quantity, item.uomPrecision)
              : item.quantity;
          // 当taxRate为undefined的时候，取下个性化有没有默认值
          const { taxRate } = item;
          return {
            ...item,
            taxRate: isUndefined(taxRate) ? this.getDefaultValue() : taxRate,
            formHeaderId,
            quantity: uomPrecision,
            associateItemQuantity: associateItemUomPrecision,
            occurDate: item.occurDate
              ? moment(item.occurDate).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
          };
        });
        // 索赔项目行允许为空的埋点
        const lineEmptyFlag = remotes.process("SQAM_CREATE_CLAIM_DETAIL_CUX_CLAIM_ITEM_EMPTY_FLAG", false);
        if (Array.isArray(lineDataSource) && lineDataSource.length === 0 && !lineEmptyFlag) {
          notification.warning({
            message: intl
              .get('sqam.common.view.message.submitWaring')
              .d('该索赔单没有维护行信息，无法提交'),
          });
        } else if ((Array.isArray(lineList) && lineList.length !== 0)||lineEmptyFlag) {
          const additiona = {
            feedbackDate: moment(form.getFieldValue('feedbackDate')).format(
              DEFAULT_DATETIME_FORMAT
            ),
          };
          const additionalArray = ['supplierTenantId', 'supplierCode'];
          additionalArray.forEach((item) => {
            additiona[item] = values[item] ? values[item] : headerData[item];
          });
          const claimFormDTO = {
            ...headerData,
            ...newValues,
            ...additiona,
            claimFormLineList: lineList,
            dataSourceNum:
              headerData.dataSourceCode === 'INSPECTION'
                ? null
                : form.getFieldValue('dataSourceNum'),
            supplierCompanyId: supplierCompanyIdStash || headerData.supplierCompanyId,
            autoConfirmFlag: values.autoConfirmFlag ? 1 : 0, // 处理dev环境索赔类型带出问题
            feedbackOpinion: values.feedbackOpinion
              ? moment(values.feedbackOpinion).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            creationDate: values.creationDate
              ? moment(values.creationDate).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            formNum: headerData.formNum,
            ouId: values.ouId || headerData.ouId,
            ouCode: ouCode || headerData.ouCode,
          };

          const validateOk = () => {
            dispatch({
              type: 'createClaim/submitClaim',
              payload: [claimFormDTO],
            }).then((res) => {
              if (res && (typeof res.failed === 'undefined' || isEmpty(res))) {
                history.push({
                  pathname: '/sqam/createClaim/list',
                });

                notification.success();
              } else if (res && typeof res.failed === 'boolean' && !res.failed) {
                const formNums = Object.keys(res);
                const info = Object.values(res);
                formNums.forEach((item, index) => {
                  notification.warning({
                    message: `${item}: ${info[index].desc}`,
                  });
                });
              }
            });
          };

          dispatch({
            type: 'createClaim/submitValidate',
            payload: [claimFormDTO],
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
        }
      }
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

  // 改变选中行
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * bindHeaderAttachmentUuid - 绑定头附件id
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  bindHeaderAttachmentUuid(attachmentUuid) {
    const { match, dispatch } = this.props;
    const formHeaderId = match.params.id;
    dispatch({
      type: 'createClaim/bindUUID',
      payload: {
        formHeaderId,
        attachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.fetchHeader();
      }
    });
  }

  // 操作记录弹窗显隐
  @Bind()
  operationRecord(visible) {
    this.setState({ visible });
  }

  // 操作记录弹窗显隐
  @Bind()
  approveAndOperationRecord(visible) {
    this.setState({ approveAndOperationVisible: visible });
  }

  // 操作记录查询
  @Bind()
  fetchOperationRecord(page = {}, values) {
    const { match, dispatch } = this.props;
    const formHeaderId = match.params.id;
    const searchValues = filterNullValueObject(values);
    dispatch({
      type: 'sqamCommon/fetchOperationRecord',
      payload: {
        page,
        ...searchValues,
        formHeaderId,
      },
    });
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
    const { lineDataSource, headerData } = this.state;
    let newTotalAmount = headerData.totalAmount;
    let otherSum = 0;
    lineDataSource.map((item) => {
      otherSum = math.plus(item.taxIncludedLineAmount, otherSum);
      return item;
    });
    const otherAmount = math.minus(newTotalAmount, otherSum);
    const newDataSource = lineDataSource.map((item) => {
      if (record.rowKey === item.rowKey) {
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
    this.setState({
      headerData: {
        ...headerData,
        totalAmount: newTotalAmount,
      },
      lineDataSource: newDataSource,
    });
  }

  // 设置默认币种
  @Bind()
  setDefaultCurrency(record) {
    if (!isEmpty(record)) {
      const {
        currencyCode = 'CNY',
        currencyName = `${intl.get('hzero.common.currency.cny').d('人民币')}`,
      } = record;
      const { headerData } = this.state;
      const data = { ...headerData, currencyCode, currencyName };
      this.setState({
        headerData: data,
      });
    }
  }

  /**
   * handleImport - 项目行导入
   */
  @Bind()
  handleImport() {
    const {
      match,
      dispatch,
      location: { pathname },
    } = this.props;
    const formHeaderId = match.params.id;
    dispatch(
      routerRedux.push({
        pathname: '/sqam/createClaim/data-import/SQAM.CLAIM_ITEM',
        search: stringify({
          action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
          backPath: `${pathname}`,
          args: JSON.stringify({
            tenantId: getCurrentOrganizationId(),
            templateCode: 'SQAM.CLAIM_ITEM',
            formHeaderId,
          }),
        }),
      })
    );
  }

  /*
   * handleUpdateHeader - 打开上传附件弹窗更新 uuid
   * @param {!string} u - 附件uuid返回值
   */
  @Bind()
  handleUpdateHeader(u) {
    const { headerData } = this.state;
    this.setState({
      headerData: {
        ...headerData,
        purchaseAttachmentUuid: u,
      },
    });
  }

  /*
   * 更新币种后重新计算行金额和不含税金额
   * @param item
   * value 币种精度
   */
  @Bind()
  updateCurrencyCaculAgain(item, value) {
    const { basePrice } = this.state;
    const {
      netPrice,
      lineAmount,
      taxIncludedPrice,
      taxIncludedLineAmount,
      taxRate,
      quantity,
      disabledNoTax,
      disabledTax,
    } = item || {};
    const netPriceData = isNil(netPrice) ? netPrice : math.toFixed(netPrice || 0, value);
    const taxIncludedPriceData = isNil(taxIncludedPrice)
      ? taxIncludedPrice
      : math.toFixed(taxIncludedPrice || 0, value);
    const { custConfig } = this.props;
    const unitConfig = custConfig['SQAM.CREATE_CLAIM.DETAIL.LINES'];
    const { fields = [] } = unitConfig || {};
    const taxRateField = fields.find((ele) => ele.fieldCode === 'taxRate');
    const tax =
      isNil(taxRate) && taxRateField?.defaultValueMeaning
        ? taxRateField.defaultValueMeaning
        : taxRate || 0;
    if (['netPrice', 'taxIncludedPrice'].includes(basePrice)) {
      const netPriceVal =
        basePrice === 'netPrice'
          ? netPriceData
          : math.toFixed(math.div(taxIncludedPriceData, math.plus(1, math.div(tax, 100))), value);
      const taxIncludedPriceVal =
        basePrice === 'taxIncludedPrice'
          ? taxIncludedPriceData
          : math.toFixed(math.multipliedBy(netPriceData, math.plus(1, math.div(tax, 100))), value);
      const lineAmountData = math.toFixed(math.multipliedBy(netPriceVal, quantity), value);
      const taxIncludedLineAmountData = math.toFixed(
        math.multipliedBy(taxIncludedPriceVal, quantity),
        value
      );
      return {
        netPrice: netPriceData,
        lineAmount: lineAmountData,
        taxIncludedPrice: taxIncludedPriceData,
        taxIncludedLineAmount: taxIncludedLineAmountData,
      };
    } else {
      let taxIncludedLineAmountData = taxIncludedLineAmount
        ? math.toFixed(taxIncludedLineAmount, value)
        : taxIncludedLineAmount;
      let lineAmountData = lineAmount ? math.toFixed(lineAmount, value) : lineAmount;
      const lovRecordRatePlus = math.plus(1, math.div(tax, 100));
      if (disabledNoTax && taxIncludedLineAmount) {
        lineAmountData = math.toFixed(
          math.div(taxIncludedLineAmountData, lovRecordRatePlus),
          value
        );
      }
      if (disabledTax && lineAmount) {
        taxIncludedLineAmountData = math.toFixed(
          math.multipliedBy(lineAmountData, lovRecordRatePlus),
          value
        );
      }
      return {
        netPrice: netPriceData,
        lineAmount: lineAmountData,
        taxIncludedPrice: taxIncludedPriceData,
        taxIncludedLineAmount: taxIncludedLineAmountData,
      };
    }
  }

  // 如果币种LOV发生改变更新币种精度
  @Bind()
  updateCurrencyPrecision(value) {
    const { headerData, lineDataSource } = this.state;
    const newDataSource = lineDataSource.map((item) => {
      const { $form, disabledTax, disabledNoTax } = item;
      if ($form) {
        const { setFieldsValue, getFieldsValue } = $form;
        const val = getFieldsValue() || {};
        const values =
          this.updateCurrencyCaculAgain({ ...val, disabledTax, disabledNoTax }, value) || {};
        setFieldsValue(values);
      }
      const caculValue = this.updateCurrencyCaculAgain(item, value) || {};
      return {
        ...item,
        pricePrecision: value,
        amountPrecision: value,
        ...caculValue,
      };
    });
    this.setState({
      headerData: {
        ...headerData,
        pricePrecision: value,
        amountPrecision: value,
      },
      lineDataSource: newDataSource,
    });
  }

  // 个性化影响
  @Bind()
  handleSetExpenseProcess(value) {
    const { headerData, lineDataSource } = this.state;
    const {
      form: { setFields, setFieldsValue },
      createClaim,
    } = this.props;
    const { enumMap } = createClaim || {};
    const { payMentType = [] } = enumMap || {};
    const newPayMentType = payMentType?.filter((item) => item.value === value);
    this.setState({
      headerData: {
        ...headerData,
        expenseProcessType: value,
        expenseProcessTypeDescription: newPayMentType[0]?.description,
        tag: newPayMentType[0]?.tag,
      },
    });
    if (value) {
      setFields({
        expenseProcessType: {
          value,
          errors: null,
        },
        tag: newPayMentType[0]?.tag,
      });
      if (newPayMentType[0].description) {
        lineDataSource.map((item) => {
          item.$form.setFields({
            lineAmount: {
              value: item.$form.getFieldValue('lineAmount'),
              errors: null,
            },
            taxIncludedLineAmount: {
              value: item.$form.getFieldValue('taxIncludedLineAmount'),
              errors: null,
            },
          });
          return item;
        });
      }
    } else {
      setFieldsValue({
        expenseProcessType: null,
        expenseProcessTypeDescription: undefined,
        tag: null,
      });
    }
  }

  @Bind()
  tabChange(key) {
    this.setState({
      activeKey: key,
    });
  }

  @Bind()
  handleClearOriginNum() {
    const { form: { setFieldsValue } = {} } = this.props;
    const { headerData } = this.state;
    if (isFunction(setFieldsValue)) setFieldsValue({ dataSourceNum: null });
    this.setState({ headerData: { ...headerData, dataSourceNum: null } });
  }

  render() {
    const {
      defaultTypeDesc,
      collapseKeys,
      lineDataSource,
      selectedRowKeys,
      selectedRows,
      headerData,
      flag,
      visible,
      linepagination,
      defaultAutoFlag,
      defaultClaimTypeId,
      purchaseAttachmentUuid,
      activeKey,
      recordFlag,
      approveAndOperationVisible,
      basePrice,
    } = this.state;
    const {
      form,
      match,
      sqamCommon,
      createClaimLoading,
      fetchHeaderLoading,
      fetchLinesLoading,
      submitLoading,
      fetchOperationRecordListLoading,
      loading,
      userIDLoading,
      customizeForm,
      customizeTable,
      queryUnitConfig,
      deleteLoading,
      deleteLineLoading,
      remote: remoteProps,
      history,
    } = this.props;
    const isLoading =
      createClaimLoading ||
      fetchHeaderLoading ||
      fetchLinesLoading ||
      submitLoading ||
      deleteLoading ||
      deleteLineLoading;
    const formHeaderId = match.params.id;
    const {
      operationRecordList = [],
      operationRecordPagination = {},
      approveHistoryList = [],
    } = sqamCommon;
    const basicInfoProps = {
      form,
      defaultTypeDesc,
      defaultClaimTypeId,
      headerData,
      formHeaderId,
      onSetDefaultCurrency: this.setDefaultCurrency,
      customizeForm,
      remoteProps,
    };
    const claimInformationProps = {
      form,
      formHeaderId,
      headerData,
      defaultAutoFlag,
      onClearOriginNum: this.handleClearOriginNum,
      onSetExpenseProcess: this.handleSetExpenseProcess,
      updateCurrencyPrecision: this.updateCurrencyPrecision,
      customizeForm,
      remoteProps,
      history,
    };
    const claimItemProps = {
      form,
      headerData,
      ChangeFormItem: this.ChangeFormItem,
      selectedRowKeys,
      selectedRows,
      onSelectChange: this.onSelectChange,
      addLine: this.addLine,
      deleteLine: this.deleteLine,
      onImport: this.handleImport,
      // onUpdateLine: this.updateLine,
      lineDataSource,
      linepagination,
      fetchLines: this.fetchLines,
      whetherDisabled: this.whetherDisabled,
      changeDataSource: this.changeDataSource,
      formHeaderId,
      basePrice,
      customizeTable,
      queryUnitConfig,
      isLoading,
      remoteProps,
      addLineBatch: this.addLineBatch,
      state: this.state,
      handleSetState: this.handleSetState,
      fetchHeader: this.fetchHeader,
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
    const uploadModalProps = {
      btnText: `${intl.get('entity.attachment.upLoad').d('附件上传')}(${headerData.purchaseAttachmentUuid ? this.state.fileNum : 0
        })`,
      btnProps: {
        icon: 'upload',
        disabled: !formHeaderId,
      },
      showFilesNumber: false,
      attachmentUUID: headerData.purchaseAttachmentUuid || purchaseAttachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
      uploadSuccess: this.fetchHeader,
      removeCallback: this.fetchHeader,
    };
    const modalProps = {
      visible: approveAndOperationVisible,
      width: 1100,
      footer: null,
      onCancel: () => this.approveAndOperationRecord(false),
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      // title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    };
    const RecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.fetchOperationRecord,
      hideModal: () => this.operationRecord(false),
      visible,
      formHeaderId,
      isExport: true,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`sqam.common.view.title.claimMaintenance`).d('索赔单维护')}
          backPath="/sqam/createClaim/list"
        >
          <Button
            icon="save"
            type="primary"
            onClick={throttle(this.handleSave, 1500, { trailing: false })}
            loading={isLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="check"
            disabled={!formHeaderId}
            onClick={throttle(this.handleSubmit, 1500, { trailing: false })}
            loading={isLoading}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <PermissionButton
            icon="delete"
            disabled={!formHeaderId}
            onClick={throttle(() => this.handleDeleteClaim(), 1500, { trailing: false })}
            loading={isLoading}
            permissionList={[
              {
                code: `srm.sqam.business.claim.sqam.create.claim.list.ps.radio.button.permanent_delete`,
                type: 'button',
              },
            ]}
          >
            {intl.get('sqam.common.button.deleteForever').d('永久删除')}
          </PermissionButton>
          <PermissionButton
            icon="delete"
            disabled={!formHeaderId}
            onClick={throttle(() => this.handleDeleteClaim(1), 1500, { trailing: false })}
            loading={isLoading}
            permissionList={[
              {
                code: `srm.sqam.business.claim.sqam.create.claim.list.ps.radio.button.delete`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </PermissionButton>
          {(flag || !formHeaderId) && <UploadModal {...uploadModalProps} />}
          <Button
            icon="clock-circle-o"
            disabled={!formHeaderId}
            onClick={() =>
              recordFlag ? this.approveAndOperationRecord(true) : this.operationRecord(true)
            }
            loading={isLoading}
          >
            {recordFlag
              ? intl.get('hzero.common.button.approveAndOperating').d('审批/操作记录')
              : intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
        </Header>
        <Content className={classNames(styles['page-content'])}>
          <Spin
            spinning={fetchHeaderLoading || fetchLinesLoading || userIDLoading || false}
            wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}
          >
            <Collapse
              forceRender
              defaultActiveKey={collapseKeys}
              className="form-collapse"
              onChange={this.onCollapseChange}
            >
              <Collapse.Panel
                showArrow={false}
                forceRender
                key="A"
                header={
                  <Fragment>
                    <h3>{intl.get(`sqam.common.view.panel.baseInfo`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('A')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('A') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <BasicInfoForm {...basicInfoProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                key="B"
                header={
                  <Fragment>
                    <h3>{intl.get(`sqam.common.view.panel.claimInfo`).d('索赔信息')}</h3>
                    <a>
                      {collapseKeys.includes('B')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('B') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <ClaimInformation {...claimInformationProps} />
              </Collapse.Panel>
              {formHeaderId && (
                <Collapse.Panel
                  className={styles['purchase-application']}
                  showArrow={false}
                  forceRender
                  key="C"
                  header={
                    <Fragment>
                      <h3>{intl.get(`sqam.common.view.panel.claimItem`).d('索赔项目')}</h3>
                      <a>
                        {collapseKeys.includes('C')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('C') ? 'up' : 'down'} />
                    </Fragment>
                  }
                >
                  <ClaimItem {...claimItemProps} />
                </Collapse.Panel>
              )}
            </Collapse>
          </Spin>
        </Content>
        <Modal {...modalProps} >
          <Tabs onChange={this.tabChange} activeKey={activeKey} animated={false}>
            <Tabs.TabPane
              tab={intl.get('hzero.common.button.operating').d('操作记录')}
              key="option"
            >
              <OperationRecord {...OperationRecordProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`sqam.common.model.qualityRectification.approvalRecord`).d('审批记录')}
              key="approve"
            >
              <ApproveRecord {...ApproveRecordProps} />
            </Tabs.TabPane>
          </Tabs>
        </Modal>
        <Record {...RecordProps} />
      </Fragment>
    );
  }
}
