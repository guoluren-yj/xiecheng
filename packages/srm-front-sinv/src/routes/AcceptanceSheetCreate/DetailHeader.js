import React, { Component } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { connect } from 'dva';
import { Row, Col, Form, DatePicker, Input, Icon, Select, Tooltip, Spin } from 'hzero-ui';
import Lov from 'components/Lov';
import moment from 'moment';
import { dateRender } from 'utils/renderer';
import classnames from 'classnames';
import { isEmpty, isUndefined, isArray } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
// import withCustomize from 'srm-front-cuz';
import UploadModal from '_components/Upload/index';

// import ValueList from 'components/ValueList';
import { getDateFormat, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  DETAIL_DEFAULT_CLASSNAME,
} from 'utils/constants';

import styles from './index.less';

import MultiSelectModal from './DetailNoDocumentSource/MultiSelectModal.js';

// import CheckoutPerson from './CheckoutPerson';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
// @withCustomize({
//   unitCode: ['SINV.ACCEPTANCE_CREATE_DETAIL.HEADER'],
// })
@Form.create({ fieldNameProp: null })
@connect(({ loading, acceptanceSheetCreate }) => ({
  fetchHeaderLoading: loading.effects['acceptanceSheetCreate/fetchHeader'],
  acceptanceSheetCreate,
}))
export default class DetailHeader extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    props.Ref(this);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      tagShow: false,
      tags: [],
      clearFlag: true,
      isDisabled: false,
      purAgentVisible: false,
      selectedChildRows: [],
      selectedRowKeys: [],
      visible: false,
      acceptorNameVisible: false,
    };
  }

  componentDidMount() {
    this.init();
  }

  @Bind()
  init() {
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetCreate/fetchFormData',
    });
  }

  /**
   * 同步 多选框 值节流以提高性能
   * @param {String} value - 多选框 组件变更值
   */
  @Bind()
  @Throttle(500)
  setValue(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  searchButton() {
    if (this.state.loading) {
      return <Icon key="search" type="loading" />;
    } else {
      return (
        <Icon
          key="search"
          type="search"
          onClick={this.fetchPurAgentLovData}
          style={{ cursor: 'pointer', color: '#666' }}
        />
      );
    }
  }

  /**
   * 更新modal项目采购负责人列表数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  saveRecordRows() {
    const { form, updateState } = this.props;
    const { selectedChildRows } = this.state;
    this.handleShowPurAgent();
    const value = Array.isArray(selectedChildRows) && selectedChildRows.length && selectedChildRows.map((o) => o.userName);
    const userId = Array.isArray(selectedChildRows) && selectedChildRows.length && selectedChildRows.map((o) => o.userId);
    if (value) {
      form.setFieldsValue({ acceptorName: value });
    }
    if (userId) {
      form.registerField('acceptorId');
      form.setFieldsValue({ acceptorId: userId });
    }
    this.setState(
      {
        tags: userId,
      },
      () => {
        this.setValue(value);
        updateState(value, userId);
      }
    );
  }

  @Bind()
  hoverTagShow() {
    const { tagShow } = this.state;
    this.setState({
      tagShow: !tagShow,
    });
  }

  @Bind()
  hoverTagHide() {
    this.setState({
      tagShow: false,
    });
  }

  /**
   * 查询项目采购负责人lov
   */
  @Bind()
  handleFecthRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 控制项目采购负责人弹出框的显示
   */
  @Bind()
  handleShowPurAgent() {
    const { purAgentVisible } = this.state;
    const {
      headerInfo: { acceptorIdList = [], acceptorNameList = [] },
    } = this.props;
    this.setState({
      purAgentVisible: !purAgentVisible,
      selectedChildRows: acceptorIdList.map((ele, ind) => {
        return {
          userId: ele,
          userName: acceptorNameList[ind],
        };
      }),
      selectedRowKeys: acceptorIdList,
    });
  }

  /**
   * 查询项目采购负责人选择lov数据
   */
  @Bind()
  fetchPurAgentLovData(params = {}) {
    const { purAgentVisible } = this.state;
    if (!purAgentVisible) {
      this.handleShowPurAgent();
    }
    const {
      dispatch,
      acceptanceSheetCreate: { purAgentPagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'acceptanceSheetCreate/fetchPurAgentLovData',
      payload: {
        page: isEmpty(params) ? purAgentPagination : params,
        ...fieldValues,
      },
    });
  }

  @Bind()
  emitEmpty() {
    const { form, updateState } = this.props;
    this.setState(
      {
        tags: '',
      },
      () => {
        if (form) {
          form.setFieldsValue({
            acceptorName: '',
          });
        }
        updateState([], []);
      }
    );
  }

  @Bind()
  onGetSupplierId(text, lovRecord) {
    const { form } = this.props;
    const { registerField, setFieldsValue, resetFields } = form;
    const { supplierTenantId, supplierId } = lovRecord;
    resetFields(['supplierTenantId', 'supplierCompanyId']);
    registerField('supplierTenantId');
    registerField('supplierId');
    setFieldsValue({ supplierTenantId });
    setFieldsValue({ supplierId });
  }

  @Bind()
  setHeaderInfo() {
    const { headerInfo } = this.state;
    return headerInfo;
  }

  /**
   * 改变多选框
   */
  @Bind()
  handleRowSelect(selectedRowKeys, selectedChild) {
    const rowIds = selectedChild.map((ele) => ele.userId);
    const { selectedChildRows } = this.state;
    const newRows = selectedChildRows.filter(
      (obj) => selectedRowKeys.findIndex((ele) => obj.userId === ele) !== -1
    );
    const dataSource = newRows.filter((ele) => !rowIds.includes(ele.userId));
    this.setState({
      selectedRowKeys,
      selectedChildRows: [...dataSource, ...selectedChild],
    });
  }

  @Bind()
  handerOnChangeFileUuid(test, lovRecord) {
    const { handleOnChangeFile } = this.props;
    handleOnChangeFile(test, lovRecord);
  }

  @Bind()
  handleTooltipVisible(item, value) {
    this.setState({ [item]: value });
  }

  @Bind()
  render() {
    const {
      editable = true,
      maintainEditable = false,
      form = {},
      headerInfo = {},
      fetchHeaderLoading = false,
      acceptanceSheetCreate: { purAgentPagination = {}, purAgentList = {} },
      orderSource,
      acceptBaseCode,
      customizeForm,
      dataSourceLoading,
    } = this.props;
    const { purAgentVisible, selectedChildRows, selectedRowKeys, acceptorNameVisible } = this.state;
    const queryFields = [
      {
        field: 'loginName',
        label: intl.get(`sinv.acceptanceSheetCreate.title.user`).d('账户'),
      },
      {
        field: 'userName',
        label: intl.get(`sinv.acceptanceSheetCreate.title.realName`).d('用户名'),
      },
    ];
    const { acceptorIdList = [] } = headerInfo;
    const fieldsColumn = [
      {
        title: intl.get(`sinv.acceptanceSheetCreate.title.user`).d('账户'),
        dataIndex: 'loginName',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.title.realName`).d('用户名'),
        dataIndex: 'userName',
        align: 'left',
        width: 150,
      },
    ];
    const purAgentModel = {
      acceptorIdList,
      selectedChildRows,
      purAgentVisible,
      queryFields,
      fieldsColumn,
      purAgentPagination,
      purAgentList,
      onRef: this.handleFecthRef,
      onChange: this.handleShowPurAgent,
      onSaveRecord: this.saveRecordRows,
      fetchPurAgentData: this.fetchPurAgentLovData,
      handleRowSelect: this.handleRowSelect,
      selectedRowKeys,
    };
    const { organizationId, tags = [], clearFlag = true, isDisabled = false } = this.state;
    const { getFieldDecorator = (e) => e, getFieldValue = (e) => e } = form;
    const showSuffix = tags && clearFlag && !isDisabled;
    const lovClassNames = ['lov-input'];
    if (showSuffix) {
      lovClassNames.push('lov-suffix');
    }
    if (isDisabled) {
      lovClassNames.push('lov-disabled');
    }
    const personName =
      isArray(headerInfo.acceptorNameList) && headerInfo.acceptorNameList
        ? headerInfo.acceptorNameList.join()
        : headerInfo.acceptorNameList;
    const suffix = (
      <React.Fragment>
        {!!personName && (
          <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        )}
        {this.searchButton()}
      </React.Fragment>
    );
    // const { projectPurAgents = [] } = headerInfo;
    const uploadProps = {
      viewOnly: true,
      icon: false,
      attachmentUUID: headerInfo.templateAttachmentUuid ? headerInfo.templateAttachmentUuid : '',
      btnText: intl.get(`sinv.acceptanceSheetCreate.model.upload`).d('附件模板'),
      showFilesNumber: true,
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-acceptance',
      contractTypeFlag: true,
    };
    return (
      <React.Fragment>
        <Spin spinning={fetchHeaderLoading || false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          {customizeForm(
            {
              form,
              dataSourceLoading,
              dataSource: headerInfo,
              code: 'SINV.ACCEPTANCE_CREATE_DETAIL.HEADER',
            },
            <Form className={styles['header-form']}>
              <Row
                {...EDIT_FORM_ROW_LAYOUT}
                className={editable || maintainEditable ? 'half-row' : 'read-half-row'}
              >
                <Col {...FORM_COL_2_LAYOUT}>
                  {editable || maintainEditable ? (
                    <FormItem
                      label={intl.get(`sinv.acceptanceSheetCreate.model.title`).d('验收单标题')}
                    >
                      {getFieldDecorator('title', {
                        initialValue: headerInfo.title,
                        rules: [
                          {
                            required: editable || maintainEditable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`sinv.acceptanceSheetCreate.model.title`)
                                .d('验收单标题'),
                            }),
                          },
                          {
                            max: 120,
                            message: intl.get('hzero.common.validation.max', { max: 120 }),
                          },
                        ],
                      })(<Input />)}
                    </FormItem>
                  ) : (
                    <FormItem
                      label={intl.get(`sinv.acceptanceSheetCreate.model.title`).d('验收单标题')}
                    >
                      {getFieldDecorator('title', {
                        initialValue: headerInfo.title,
                      })(<span>{headerInfo.title}</span>)}
                    </FormItem>
                  )}
                </Col>
              </Row>
              <Row
                {...EDIT_FORM_ROW_LAYOUT}
                className={classnames(editable ? 'inclusion-row' : 'read-row')}
              >
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.acceptListNum`).d('验收单号')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('acceptListNum', {
                      initialValue: headerInfo.acceptListNum,
                    })(<span>{headerInfo.acceptListNum}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.companyId`).d('公司')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {editable && maintainEditable
                      ? getFieldDecorator('companyId', {
                        initialValue: headerInfo.companyId,
                      })(<span>{headerInfo.companyName}</span>)
                      : getFieldDecorator('companyId', {
                        initialValue: headerInfo.companyId,
                        rules: [
                          {
                            required: editable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`sinv.acceptanceSheetCreate.model.companyId`)
                                .d('公司'),
                            }),
                          },
                        ],
                      })(
                        <Lov
                          code="SPUC.ACCEPT_COMPANY"
                          textValue={headerInfo.companyName}
                          queryParams={{ organizationId }}
                        />
                      )}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.supplier`).d('供应商')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {editable && maintainEditable
                      ? getFieldDecorator('supplierCompanyId', {
                        initialValue: headerInfo.supplierCompanyId,
                      })(<span>{headerInfo.supplierCompanyName}</span>)
                      : getFieldDecorator('supplierCompanyId', {
                        initialValue: headerInfo.supplierCompanyId,
                        rules: [
                          {
                            required: editable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`sinv.acceptanceSheetCreate.model.supplier`)
                                .d('供应商'),
                            }),
                          },
                        ],
                      })(
                        <Lov
                          code="SPUC.ACCEPT_SUPPLIER"
                          textValue={headerInfo.supplierCompanyName}
                          queryParams={{
                            tenantId: organizationId,
                            companyId: getFieldValue('companyId'),
                          }}
                          onChange={this.onGetSupplierId}
                        />
                      )}
                  </FormItem>
                </Col>
              </Row>
              <Row
                {...EDIT_FORM_ROW_LAYOUT}
                className={classnames(editable || maintainEditable ? 'writable-row' : 'read-row')}
              >
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`sinv.acceptanceSheetCreate.model.acceptListType`)
                      .d('验收类型')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {editable || maintainEditable
                      ? getFieldDecorator('acceptListTypeId', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`sinv.acceptanceSheetCreate.model.acceptListType`)
                                .d('验收类型'),
                            }),
                          },
                        ],
                        initialValue: headerInfo.acceptListTypeId,
                      })(
                        <Lov
                          disabled={headerInfo.sourceCodeMeaning}
                          code="SPUC.ACCEPT_TYPE"
                          textValue={headerInfo.acceptListTypeName}
                          lovOptions={{ displayField: 'acceptListTypeName' }}
                          queryParams={{ tenantId: organizationId }}
                          onChange={(test, lovRecord) =>
                            this.handerOnChangeFileUuid(test, lovRecord)
                          }
                        />
                      )
                      : getFieldDecorator('acceptListTypeId', {
                        initialValue: headerInfo.acceptListTypeId,
                      })(<span>{headerInfo.acceptListTypeName}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`sinv.acceptanceSheetCreate.model.sourceCode`)
                      .d('验收单据来源')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {editable && maintainEditable
                      ? getFieldDecorator('sourceCode', {
                        initialValue: headerInfo.sourceCode,
                      })(<span>{headerInfo.sourceCodeMeaning}</span>)
                      : getFieldDecorator('sourceCode', {
                        rules: [
                          {
                            required: editable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`sinv.acceptanceSheetCreate.model.sourceCode`)
                                .d('验收单据来源'),
                            }),
                          },
                        ],
                        initialValue: headerInfo.sourceCode,
                      })(
                        <Select allowClear onChange={this.handleSourceCode}>
                          {orderSource.map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                  </FormItem>
                </Col>
                {getFieldValue('sourceCode') === 'ORDER' || headerInfo.sourceCode === 'ORDER' ? (
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`sinv.acceptanceSheetCreate.model.criteria`).d('验收基准')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('acceptBaseCode', {
                        initialValue: headerInfo.acceptBaseCode,
                      })(
                        <span>
                          {intl
                            .get(`sinv.acceptanceSheetCreate.model.orderMaterial`)
                            .d('订单物料行')}
                        </span>
                      )}
                    </FormItem>
                    {/* <DisplayFormItem
                      label={intl.get(`sinv.acceptanceSheetCreate.model.criteria`).d('验收基准')}
                      // value={headerInfo.acceptBaseCoding}
                      value={intl
                        .get(`sinv.acceptanceSheetCreate.model.orderMaterial`)
                        .d('订单物料行')}
                    /> */}
                  </Col>
                ) : getFieldValue('sourceCode') === 'CONTRACT' ||
                  headerInfo.sourceCode === 'CONTRACT' ? (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <FormItem
                        label={intl.get(`sinv.acceptanceSheetCreate.model.criteria`).d('验收基准')}
                        {...EDIT_FORM_ITEM_LAYOUT}
                      >
                        {editable && maintainEditable
                        ? getFieldDecorator('acceptBaseCode', {
                          initialValue: headerInfo.acceptBaseCode,
                        })(<span>{headerInfo.acceptBaseCoding}</span>)
                        : getFieldDecorator('acceptBaseCode', {
                          rules: [
                            {
                              required: editable,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get(`sinv.acceptanceSheetCreate.model.criteria`)
                                  .d('验收基准'),
                              }),
                            },
                          ],
                          initialValue: headerInfo.acceptBaseCode,
                        })(
                          <Select allowClear>
                            {acceptBaseCode.map((n) => (
                              <Option key={n.value} value={n.value}>
                                {n.meaning}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                ) : null}
              </Row>
              <Row
                {...EDIT_FORM_ROW_LAYOUT}
                className={classnames(editable || maintainEditable ? 'writable-row' : 'read-row')}
              >
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.checkMan`).d('验收人')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('acceptorName', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`sinv.acceptanceSheetCreate.model.checkMan`).d('验收人'),
                          }),
                        },
                      ],
                      initialValue: personName,
                    })(
                      <Input
                        readOnly={!false}
                        value={tags}
                        onFocus={() => this.hoverTagShow()}
                        // addonAfter={this.searchButton()}
                        suffix={suffix}
                        onChange={(e) => this.saveRecordRows(e.target.value)}
                        allowClear={clearFlag}
                        disabled={isDisabled}
                        onMouseEnter={() =>
                          this.handleTooltipVisible('acceptorNameVisible', !!personName)
                        }
                        onMouseLeave={() => this.handleTooltipVisible('acceptorNameVisible', false)}
                        className={lovClassNames.join(' ')}
                      />
                    )}
                    <Tooltip title={personName} visible={acceptorNameVisible} />
                  </FormItem>
                </Col>

                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.checkDate`).d('验收日期')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {editable || maintainEditable
                      ? getFieldDecorator('acceptDate', {
                        initialValue: headerInfo.acceptDate
                          ? moment(headerInfo.acceptDate)
                          : null,
                        rules: [
                          {
                            required: editable || maintainEditable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`sinv.acceptanceSheetCreate.model.checkDate`)
                                .d('验收日期'),
                            }),
                          },
                        ],
                      })(
                        <DatePicker
                          format={getDateFormat()}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            currentDate && moment().isBefore(currentDate, 'day')
                          }
                          onChange={this.handleChangeFormItem}
                        />
                      )
                      : getFieldDecorator('acceptDate', {
                        initialValue: headerInfo.acceptDate
                          ? moment(headerInfo.acceptDate)
                          : null,
                      })(<span>{dateRender(headerInfo.acceptListTypeName)}</span>)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.createMan`).d('创建人')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('createByName', {
                      initialValue: headerInfo.createByName,
                    })(<span>{headerInfo.createByName}</span>)}
                  </FormItem>
                </Col>
              </Row>

              <Row
                {...EDIT_FORM_ROW_LAYOUT}
                className={classnames(editable || maintainEditable ? 'writable-row' : 'read-row')}
              >
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.upload`).d('附件模板')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('templateAttachmentUuid', {
                      initialValue: headerInfo.templateAttachmentUuid,
                    })(<UploadModal {...uploadProps} />)}
                  </FormItem>
                </Col>
              </Row>

              <Row
                {...EDIT_FORM_ROW_LAYOUT}
                className={classnames(editable || maintainEditable ? 'half-row' : 'read-half-row')}
              >
                <Col {...FORM_COL_2_LAYOUT}>
                  <FormItem
                    label={intl
                      .get(`sinv.acceptanceSheetCreate.model.detailRemark`)
                      .d('验收详细情况')}
                  >
                    {editable || maintainEditable
                      ? getFieldDecorator('acceptDetails', {
                        initialValue: headerInfo.acceptDetails,
                        rules: [
                          {
                            max: 480,
                            message: intl.get('hzero.common.validation.max', { max: 480 }),
                          },
                        ],
                      })(<TextArea onChange={this.handleChangeFormItem} rows={2} />)
                      : getFieldDecorator('acceptDetails', {
                        initialValue: headerInfo.acceptDetails,
                      })(<span>{headerInfo.acceptDetails}</span>)}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          )}
        </Spin>
        <MultiSelectModal {...purAgentModel} Key="new" />
      </React.Fragment>
    );
  }
}
