import React, { PureComponent } from 'react';
import { Table, Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { Icon, Tag, Row, Col, Animate } from 'choerodon-ui';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getFlexLink } from '@/routes/utils';
import MyIcon from '@/routes/components/MyIcon';
import styles from './index.less';

function sizeChangerRenderer({ text }) {
  return intl
    .get(`srm.common.view.message.numberPage`, {
      num: text,
    })
    .d(`{num}条/页`);
}

export default class CommonTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // mountFlag: true,
      currentClickDocumentKey: '',
    };
  }

  statusTagRender = (code, meaning) => {
    if (!code && !meaning) {
      return;
    }

    const statusTagStyle = new Map([
      ['RED', { bgColor: 'rgba(240,84,52, 0.15)', color: 'rgb(240,84,52)' }], // 风险 红
      ['ORANGE', { bgColor: 'rgba(252,119,0, 0.15)', color: 'rgb(252,119,0)' }], // 待办 橘
      ['BLUE', { bgColor: 'rgba(25,131,245,0.15)', color: 'rgb(25,131,245)' }], // 进行中 蓝
      ['GREEN', { bgColor: 'rgba(58,179,68,0.15)', color: 'rgb(58,179,68)' }], // 完成 绿
      ['GREY', { bgColor: 'rgb(229,231,236)', color: 'rgb(78,87,105)' }], // 取消&失效 灰
    ]);

    // const colorConfigList = [
    //   {
    //     // 黄色
    //     status: ['PENDING', 'DELIVERY_DATE_REVIEW', 'CLOSEING', 'CANCELING', 'CANCELLED_PARTIAL'],
    //     color: '#fef4e2',
    //     style: { color: '#fca400' },
    //   },
    //   {
    //     // 绿色
    //     status: ['APPROVED', 'PUBLISHED', 'CONFIRMED', 'PART_FEED_BACK', 'SUBMITTED', 'SUBMITTED_WFL'],
    //     color: '#ebf7f1',
    //     style: { color: '#47b883' },
    //   },
    //   {
    //     // 红色
    //     status: ['REJECTED', 'DELIVERY_DATE_REJECT'],
    //     color: ' #ffeeeb',
    //     style: { color: '#f56649' },
    //   },
    //   {
    //     // 灰色
    //     status: ['CLOSED', 'CANCELED', 'PUBLISH_CANCEL'],
    //     color: '#F0F0F0',
    //     style: { color: 'rgba(0,0,0, .65)' },
    //   },
    // ];
    // const colorConfig = colorConfigList.find(i => i.status.includes(code));
    const styleConfig = statusTagStyle.get(code);
    return (
      <Tag color={styleConfig?.bgColor} style={{ color: styleConfig?.color }}>
        {meaning}
      </Tag>
    );
  };

  actionTagRender = (actionList) => {
    if (!actionList || !(actionList instanceof Array)) {
      return;
    }

    const actionTagColor = new Map([
      ['NORMAL', { bgColor: '#E8E8EB', color: '#6A6A6D' }], // 普通状态 灰
      ['REMIND', { bgColor: '#FC8800', color: '#FFF' }], // 提醒状态 橘
      ['WARN', { bgColor: '#F56349', color: '#FFF' }], // 警告状态 红
    ]);

    return actionList.map((item) => (
      <Tooltip placement="top" title={item?.desc ?? null}>
        <Tag
          color={actionTagColor.get(item?.color ?? 'REMIND').bgColor}
          style={{ color: actionTagColor.get(item?.color ?? 'REMIND').color }}
          // onMouseEnter={this.handleMouseLeave}
        >
          {item.actionTitle}
        </Tag>
      </Tooltip>
    ));
  };

  buttonDTORender = (record, buttonDTOList) => {
    if (!record || !buttonDTOList || !(buttonDTOList instanceof Array)) {
      return;
    }
    return buttonDTOList.map((item) => (
      <Button
        color="primary"
        onClick={() => {
          const { setActiveRow, selectedKey, todoDocSetTimer } = this.props;
          setActiveRow(record);
          const path = item?.detailPageLink;
          const parameters = item?.parameters ?? {};
          const { params = {}, search = {} } = parameters;
          if (
            path === '/sodr/order-workspace/reference-document/list' ||
            path === '/spcm/contract-workspace/reference-document/list'
          ) {
            const title = intl.get('swbh.common.model.common.referenceDocCreation').d('引用单据创建');
            getFlexLink(title, path, { ...params }, { ...search }, true, todoDocSetTimer, record);
          } else {
            getFlexLink('val', path, { ...params }, { ...search }, false, todoDocSetTimer, record);
          }
        }}
      >
        {item.buttonName}
      </Button>
    ));
  };

  tooltipRender = (text, placement = 'right', theme = 'light', title = '') => {
    return (
      <Tooltip placement={placement} title={title || text} theme={theme}>
        {text}
      </Tooltip>
    );
  };

  getSpecialStyleData = (type, value, isTitle = false) => {
    if (!type) {
      return <span>{value}</span>;
    }

    const styleMap = new Map([
      // [
      //   'COMMON', // 常规
      //   {
      //     color: '#000',
      //     fontWeight: 400,
      //   },
      // ],
      [
        'FOCUS', // 重点
        {
          color: '#1D2129',
          fontWeight: 600,
        },
      ],
      [
        'MARKED_RED', // 标红
        {
          color: '#F56349',
          fontWeight: 400,
        },
      ],
    ]);

    return <span style={styleMap.get(type)}>{value}</span>;
    // return <span>{value}</span>;
  };

  getCustomizeContent = (data = []) => {
    if (!(data && data?.length > 0)) {
      return;
    }

    return data?.map((item, index) => {
      return item?.content ? (
        <>
          {item?.prefix ? item?.prefix : null}
          {this.getSpecialStyleData(item?.style ?? null, item?.content)}
          {item?.suffix ? item?.suffix : null}
          {/* {data?.length === index + 1 ? <></> : '/'} */}
        </>
      ) : null;
    });
  };

  // 一行一列
  tradeBody0 = (record) => {
    let content = null;
    if (record?.get('tradeBody0')) {
      content = <span>{this.getCustomizeContent(record?.get('tradeBody0'))}</span>;
      return this.tooltipRender(content);
    }

    const isTransfer = record?.get('entryCode') && record?.get('entryCode') === 'TRANSFER';
    content = isTransfer ? (
      <span>
        {record?.get('unitName') && record?.get('unitCount') ? (
          <>
            {`${record?.get('unitName') ?? '-'}${intl.get('swbh.common.model.common.etc').d('等')}`}
            <span style={{ color: '#36C2CF' }}>{record?.get('unitCount') ?? 0}</span>
            {`${intl.get('swbh.common.model.common.department').d('部门')}，`}
          </>
        ) : null}
        {record?.get('prRequestedName') && record?.get('prRequestedCount') ? (
          <>
            {`${record?.get('prRequestedName') ?? '-'}${intl.get('swbh.common.model.common.etc').d('等')}`}
            <span style={{ color: '#36C2CF' }}> {record?.get('prRequestedCount') ?? '-'}</span>
            {`${intl.get('swbh.common.model.common.piece').d('个')}${intl
              .get('swbh.common.model.common.applicant')
              .d('申请人')}`}
          </>
        ) : null}
      </span>
    ) : (
      <span>{record?.get('supplierName') ? record?.get('supplierName') : record?.get('supplierCompanyName')}</span>
    );

    return (
      <>
        <span className={`${styles.marginRight}`}>{`${intl.get('swbh.common.view.supply').d('供')}:`}</span>
        {this.tooltipRender(content)}
      </>
    );
  };

  // 二行一列
  tradeBody1 = (record) => {
    let content = null;
    if (record?.get('tradeBody1')) {
      content = <span>{this.getCustomizeContent(record?.get('tradeBody1'))}</span>;
      return this.tooltipRender(content);
    }

    const isTransfer = record?.get('entryCode') && record?.get('entryCode') === 'TRANSFER';

    content = isTransfer ? (
      <span>{record?.get('companyName')}</span>
    ) : (
      <span>
        {record?.get('companyName')}
        {!isEmpty(record?.get('ouName')) && (
          <span className={styles['super-list-grey']} style={{ margin: '0 5px 0 5px' }}>
            /
          </span>
        )}
        {record?.get('ouName')}
      </span>
    );

    return (
      <>
        <span className={`${styles.marginRight}`}>{`${intl.get('swbh.common.view.purchase').d('采')}:`}</span>
        {this.tooltipRender(content)}
      </>
    );
  };

  // 一行二列
  businessField0 = (record) => {
    let content = null;
    if (record?.get('businessField0')) {
      content = <div>{this.getCustomizeContent(record?.get('businessField0'))}</div>;
      return this.tooltipRender(content);
    }
    content = <div>{record?.get('itemName') && this.tooltipRender(record?.get('itemName'))}</div>;

    return this.tooltipRender(content);
  };

  // 二行二列
  businessField1 = (record) => {
    let content = null;
    if (record?.get('businessField1')) {
      content = <div>{this.getCustomizeContent(record?.get('businessField1'))}</div>;
      return this.tooltipRender(content);
    }

    const isTransfer = record?.get('entryCode') && record?.get('entryCode') === 'TRANSFER';

    content = (
      <div>
        <span>
          <span className={styles.bold}>{(isTransfer ? record?.get('lineCount') : record?.get('lineNum')) ?? '-'}</span>
          <span>{intl.get('swbh.common.view.row').d('行')}</span>
          <span style={{ margin: '0 5px 0 5px' }}>/</span>
          <span>{intl.get('swbh.common.view.altogether').d('共')}</span>
          <span className={styles.bold}>
            {(isTransfer ? record?.get('lineQuantityCount') : record?.get('lineQuantity')) ?? '-'}
          </span>
          <span>{intl.get('swbh.common.view.item').d('件')}</span>
        </span>
        <span className={`${styles.marginLeft} ${styles.redColor} ${styles.bold}`}>
          ￥{(record?.get('taxIncludeAmount') || record?.get('taxIncludedAmount')) ?? '-'}
        </span>
      </div>
    );
    return <>{this.tooltipRender(content)}</>;
  };

  // 一行三列
  contentBody0 = (record) => {
    let content = null;
    if (record?.get('contentBody0')) {
      content = <div>{this.getCustomizeContent(record?.get('contentBody0'))}</div>;
      return this.tooltipRender(content);
    }
    content = <div>{record?.get('poTypeName') && this.tooltipRender(record?.get('poTypeName'))}</div>;

    return this.tooltipRender(content);
  };

  // 二行三列
  contentBody1 = (record) => {
    let content = null;
    if (record?.get('contentBody1')) {
      content = <div>{this.getCustomizeContent(record?.get('contentBody1'))}</div>;
      return this.tooltipRender(content);
    }
    content = <div>{record?.get('remark') && this.tooltipRender(record?.get('remark'))}</div>;

    return this.tooltipRender(content);
  };

  handleMouseEnter = (e, record, content) => {
    const tipNode = <span>{content}</span>;
    Tooltip.show(e?.currentTarget, {
      title: tipNode,
      theme: 'light',
      placement: 'right',
    });
  };

  handleMouseLeave = () => {
    Tooltip.hide();
  };

  docTitleCell = (record) => {
    let content = null;

    if (record?.get('titleField') && record?.get('titleField')?.length > 0) {
      const title = record?.get('titleField')?.map((item, index) => {
        return item?.content ? (
          <>
            {item?.prefix ? item?.prefix : null}
            {this.getSpecialStyleData('FOCUS', item?.content, true)}
            {item?.suffix ? item?.suffix : null}
          </>
        ) : null;
      });
      const status =
        record?.get('statusField') && record?.get('statusField')?.length > 0
          ? record?.get('statusField')?.[0]
            ? this.statusTagRender(record?.get('statusField')?.[0]?.style, record?.get('statusField')?.[0]?.content)
            : null
          : null;
      // content = <div>{this.getCustomizeContent(record?.get('businessField1'))}</div>;
      // return this.tooltipRender(content);
      content = (
        <>
          <span className={`${styles.marginRightMin}`}>
            {title}
            {status}
          </span>
          <span className={styles.tagBox}>{this.actionTagRender(record?.get('actionList'))}</span>
        </>
      );
    } else {
      content = (
        <>
          <span className={`${styles.bolder} ${styles.marginRightMin}`}>
            {record?.get('docTypeName') ?? intl.get('swbh.common.view.message.purchaseOrde').d('采购订单')}
            {record?.get('todoTitle') ? ` - ${record?.get('todoTitle')} :` : ''}
          </span>
          <span className={`${styles.greyColor} ${styles.marginRightMin}`}>{record?.get('displayPoNum')}</span>
          <span className={styles.tagBox}>
            {record?.get('statusCode') && record?.get('statusCodeMeaning') ? (
              <Tag>{record?.get('statusCodeMeaning')}</Tag>
            ) : null}

            {this.actionTagRender(record?.get('actionList'))}
          </span>
        </>
      );
    }

    return (
      <div>
        {/* <Icon type={docImgMap?.get(record?.get('cardCode') ?? 'SODR')?.iconType} className={styles.icon} /> */}
        <MyIcon type={`${record?.get('cardCode')?.toLowerCase() || 'sodr'}-o`} />
        {/* <span onMouseEnter={(e) => this.handleMouseEnter(e, record, content)} onMouseLeave={this.handleMouseLeave}> */}
        {content}
        {/* </span> */}
      </div>
    );
  };

  dateRender = (time) => {
    if (!time) {
      return;
    }

    const { selectedKey } = this.props;

    let currentDateTooltip = '';

    switch (selectedKey) {
      case 'PENDING': // '，草稿箱'
        currentDateTooltip = intl.get('swbh.common.model.common.docCreateTime').d('单据创建时间');
        break;
      case 'TODO': // '待办'
        currentDateTooltip = intl.get('swbh.common.model.common.todoCreateTime').d('待办生成时间');
        break;
      case 'FOCUS': // '待阅读'
        currentDateTooltip = intl.get('swbh.common.model.common.focusCreateTime').d('待阅生成时间');
        break;
      case 'INITIATE': // 我发起
        currentDateTooltip = intl.get('swbh.common.model.common.lastUpdateTime').d('最后更新时间');
        break;
      case 'HANDLE': // 我经办
        currentDateTooltip = intl.get('swbh.common.model.common.docLastUpdateDate').d('单据最后更新时间');
        break;
      default:
        currentDateTooltip = '';
    }
    return this.tooltipRender(time, 'topRight', 'dark ', currentDateTooltip);
  };

  mainRender = (record) => {
    if (!record) {
      return;
    }
    const { setActiveRow } = this.props;

    return (
      <>
        <div className="mask" />
        <div
          className={styles.main}
          onClick={() => {
            setActiveRow(record);
            const path = record?.get('detailRouteLink');
            const detailParameters = record?.get('detailParameters') ?? {};
            const { params = {}, search = {} } = detailParameters;
            getFlexLink('11', path, { ...params }, { ...search }, false);
          }}
        >
          <div className={styles.top}>
            {this.docTitleCell(record)}
            {/* <div className={styles.greyColor}>{record?.get('lastUpdateDate')}</div> */}
            <div className={styles.greyColor}>{this.dateRender(record?.get('displayDate'))}</div>
          </div>
          <div className={`${styles.bottom} ${styles.greyColor}`}>
            <Row type="flex" justify="space-between" className={styles.rowFlexBox}>
              <Col span={4} order={1}>
                {this.tradeBody0(record)}
              </Col>
              <Col span={4} order={2}>
                {this.businessField0(record)}
              </Col>
              <Col span={4} order={3}>
                {this.contentBody0(record)}
              </Col>
            </Row>
            <Row type="flex" justify="space-between" className={styles.rowFlexBox}>
              <Col span={4} order={1}>
                {this.tradeBody1(record)}
              </Col>
              <Col span={4} order={2}>
                {this.businessField1(record)}
              </Col>
              <Col span={4} order={3}>
                {this.contentBody1(record)}
              </Col>
            </Row>
          </div>
        </div>
      </>
    );
  };

  getColumns = () => {
    const {
      showOperation = true,
      selectedKey,
      attentionIgnore = () => {},
      attentionIgnoreLoading = false,
    } = this.props;
    const columns = [
      {
        name: 'companyName',
        renderer: ({ record }) => this.mainRender(record),
        tooltip: 'none',
      },
    ];
    if (showOperation) {
      columns.push({
        name: 'operation',
        width: 100,
        renderer: ({ record }) => {
          return (
            <>
              <div className="mask" />
              <div className={styles.operation}>
                {selectedKey === 'FOCUS' ? (
                  <Button
                    color="primary"
                    onClick={() => {
                      this.setState({ currentClickDocumentKey: record?.get('documentKey') });
                      attentionIgnore(record);
                    }}
                    loading={
                      attentionIgnoreLoading && this.state.currentClickDocumentKey === record?.get('documentKey')
                    }
                  >
                    {intl.get('swbh.common.model.common.hadRead').d('已阅')}
                  </Button>
                ) : record?.get('buttonDTOList') ? (
                  this.buttonDTORender(record, record.get('buttonDTOList'))
                ) : (
                  <Icon type="more_horiz" onClick={() => {}} />
                )}
                {/* <Button>忽略</Button> */}

                {/* <Icon type="more_horiz" onClick={() => this.openModalTest(record)} /> */}
              </div>
            </>
          );
        },
      });
    }
    return columns;
  };

  render() {
    const {
      dataSet,
      columns,
      changePagination,
      selectedKey,
      showOperation,
      todoDocSetTimer = () => {},
      ...otherParams
    } = this.props;

    return (
      <Table
        pagination={{
          // hideOnSinglePage: true,
          showSizeChangerLabel: false,
          showTotal: false,
          showPager: true,
          showQuickJumper: false,
          sizeChangerPosition: 'right',
          sizeChangerOptionRenderer: sizeChangerRenderer,
          onChange: changePagination,
        }}
        className={styles.commonTable}
        queryBar="none"
        dataSet={dataSet}
        columns={this.getColumns()}
        {...otherParams}
      />
    );
  }
}
