import React from 'react';
import { Form, Input, Row, Col, List, Dropdown, Menu, Icon } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import styles from './index.less';
import getInsData, { bigNumberList } from '../FunctionDoc';

const AnyList: any = List;
const ListItem = List.Item;
const MenuItem = Menu.Item;
const { Meta } = ListItem;
const FormItem = Form.Item;
const { TextArea } = Input;

const htmlText = `<div class="demo-wrapper" style="color: <%=u1.no === 1 ? 'red' : '#333' %>">
    <%= u1.title%>
</div>
`;

const defaultFieldList = [
  {
    unitFieldName: intl.get('hpfm.individual.common.none').d('无'),
    unitFieldCode: '',
  },
];
const defaultAliasList = {
  unitName: intl.get('hpfm.individual.common.context').d('上下文参数'),
  unitCode: 'context',
  alias: 'c',
};
const reg = /([_A-Za-z0-9]+)\.$/;
const toCamel = /(_)([a-z])/g;
export default class ComputeRule extends React.Component<{
  unitId?: string | number;
  unitAlias: any[];
  unitCode: string;
  onRef: Function;
  form?: any;
  rule?: string;
  relatedParams: any;
  readOnly?: boolean;
}, any> {
  textArea: any;

  hiddenDiv: React.RefObject<any>;

  constructor(props) {
    super(props);
    const { unitAlias = [], unitCode, unitId, onRef } = props;
    const unitAliasMap = new Map();
    const fieldsMap = new Map();

    onRef(this);
    this.queryRelatedUnits(unitId)
      .then(r => {
        if (getResponse(r)) {
          let res = r;
          const currentUnit = res.find(item => item.unitId === unitId) || {};
          // 筛选器单元只能选择到当前单元的字段
          if (currentUnit && currentUnit.unitType === 'SEARCHBAR') {
            res = [currentUnit];
          }
          unitAlias.forEach(i => {
            unitAliasMap.set(i.unitCode, i.alias);
          });
          res.forEach(units => {
            const { unitFields = [], ...unit } = units;
            const alias = unit.unitCode === unitCode ? 'self' : unitAliasMap.get(unit.unitCode);
            if (alias !== undefined) {
              fieldsMap.set(alias, unitFields);
            }
          });
        }
      });
    fieldsMap.set('c', [
      {
        unitFieldName: intl.get('hpfm.customize.common.organizationId').d('采购方租户'),
        unitFieldCode: 'organizationId',
      },
      {
        unitFieldName: intl.get('hpfm.customize.common.tenantId').d('供应商租户'),
        unitFieldCode: 'tenantId',
      },
    ]);
    this.state = {
      fieldList: defaultFieldList,
      left: 0,
      top: 0,
      insertPosition: -1,
      posReverseY: false,
      open: false,
      fieldsMap,
    };
    this.hiddenDiv = React.createRef();
  }

  // eslint-disable-next-line no-unused-vars
  queryRelatedUnits(unitId: any): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  getAliasList() {
    const { unitAlias = [], unitCode } = this.props;
    const newAliasArray = unitAlias.concat([defaultAliasList]);
    const menu = (
      <Menu className={styles['unit-alias-list']}>
        {newAliasArray.map(i => (
          <MenuItem className="no-cursor" disabled>
            <div className="unit-name">{i.unitName}</div>
            <div className="unit-code">{i.unitCode}</div>
            <span className="unit-alias">{i.unitCode === unitCode ? 'self' : i.alias}</span>
          </MenuItem>
        ))}
      </Menu>
    );
    return (
      <Dropdown className="inc-title" overlay={menu} trigger={['click']}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className="ant-dropdown-link">
          {intl.get('hpfm.individual.view.message.title.aliasRefer').d('别名对照')}&nbsp;
          <Icon type="down" />
        </a>
      </Dropdown>
    );
  }

  onClickSyntax(syntax = '') {
    const { form } = this.props;
    const { selectionStart, selectionEnd } = this.textArea.textAreaRef;
    const originText = form.getFieldValue('renderRule') || '';
    let newText;
    if (selectionStart === undefined || selectionEnd === undefined) {
      newText = `${originText}${syntax}`;
      form.setFieldsValue({ renderRule: newText });
    } else {
      const leftText = originText.slice(0, selectionStart);
      const rightText = originText.slice(selectionEnd);
      form.setFieldsValue({ renderRule: `${leftText}${syntax}${rightText}` });
    }
    this.textArea.textAreaRef.focus();
  }

  getInnerFunList() {
    const newBigNumberList = bigNumberList.filter(i => !["MINUS", "TIMES", "DIV", "MOD", "LT", "LTE", "GT", "GTE"].includes(i.key));
    const menu = (
      <Menu className={styles['unit-alias-list']}>
        {newBigNumberList.map(i => {
          const ins = getInsData(i.key, intl);
          return (
            <MenuItem className="no-cursor" disabled>
              <div className="unit-name" key={`${i.funName}()`}>
                {ins.funIns}
              </div>
              <div className="unit-code">$MATH.{ins.funName}</div>
            </MenuItem>
          );
        })}
        <MenuItem className="no-cursor" disabled>
          <div className="unit-name" key="capitalAmount()">
            {intl.get("hpfm.customize.common.fun.capitalAmount").d("金额大数字转中文函数")}
          </div>
          <div className="unit-code">$sboot.capitalAmount(bigNumber, &quot;¥&quot;)</div>
        </MenuItem>
      </Menu>
    );
    return (
      <Dropdown className="inc-title" overlay={menu} trigger={['click']}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className="ant-dropdown-link">
          {intl.get('hpfm.customize.common.supportFunList').d('函数清单')}&nbsp;
          <Icon type="down" />
        </a>
      </Dropdown>
    );
  }

  getSyntaxList() {
    const menu = (
      <Menu className={styles['unit-alias-list']} onClick={({ key }) => this.onClickSyntax(key)}>
        <MenuItem key={'<%= u1.test %>'}>
          <div className="unit-name">
            {intl.get('hpfm.individual.view.message.title.getVariable').d('获取变量')}
          </div>
          <div className="unit-code">{'<%= u1.test %>'}</div>
        </MenuItem>
        <MenuItem key={'<%= var test = u1.test; %>'}>
          <div className="unit-name">
            {intl.get('hpfm.individual.view.message.title.assignVariable').d('变量赋值')}
          </div>
          <div className="unit-code">{'<% var test = u1.test; %>'}</div>
        </MenuItem>
        <MenuItem key={"<%= u1.test = '1' ? true : false %>"}>
          <div className="unit-name">
            {intl.get('hpfm.individual.view.message.title.thrExpression').d('三元表达式')}
          </div>
          <div className="unit-code">{"<%= u1.test == '1' ? true : false %>"}</div>
        </MenuItem>
        <MenuItem key={'<% if (u1.v1) { %> ... <% } else if (u1.v2) { %> ... <% } %>'}>
          <div className="unit-name">
            {intl.get('hpfm.individual.view.message.title.ifExpression').d('if-控制')}
          </div>
          <div className="unit-code">
            {'<% if (u1.v1) { %> ... <% } else if (u1.v2) { %> ... <% } %>'}
          </div>
        </MenuItem>
        <MenuItem
          key={'<% for(var i = 0; i < u1.arr.length; i++){ %><%= i %> <%= u1.arr[i] %><% } %>'}
        >
          <div className="unit-name">
            {intl.get('hpfm.individual.view.message.title.forExpression').d('for-循环')}
          </div>
          <div className="unit-code">
            {`<% for(var i = 0; i < u1.arr.length; i++){ %>
                <%= i %> <%= u1.arr[i] %>
              <% } %>`}
          </div>
        </MenuItem>
      </Menu>
    );
    return (
      <Dropdown className="inc-title" overlay={menu} trigger={['click']}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className="ant-dropdown-link">
          {intl.get('hpfm.individual.view.message.title.syntaxRefer').d('语法对照')}&nbsp;
          <Icon type="down" />
        </a>
      </Dropdown>
    );
  }

  renderList() {
    const { fieldList, left = '50%', top = '50%', open, posReverseY } = this.state;
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <ul
        onClick={this.fillFromTipsList}
        className={`${styles['fields-tip']} ${open ? '' : styles.hidden}`}
        style={{ left, top, transform: `translateY(${posReverseY ? '-100%' : '0'})` }}
      >
        {fieldList.map(i => (
          <li value={i.unitFieldCode}>
            <div className="name">{i.unitFieldName}</div>
            <div className="code">{i.unitFieldCode}</div>
          </li>
        ))}
      </ul>
    );
  }

  @Bind()
  openList(e) {
    const { fieldsMap } = this.state;
    const { selectionStart, value = '', scrollLeft, scrollTop } = e.target || {};
    const cacLengthStr = value.substring(0, selectionStart);
    const textGroupByLine = cacLengthStr.split('\n') || [''];
    const search = cacLengthStr.match(reg);

    if (!isNil(search)) {
      const currentLine = textGroupByLine[textGroupByLine.length - 1];
      this.hiddenDiv.current.innerText = currentLine;
      const { clientWidth: c1 } = this.hiddenDiv.current;
      const visualHeight = textGroupByLine.length * 20 - scrollTop;
      const visualWidth = c1 - scrollLeft;
      const posReverseY = visualHeight >= 159;
      const posReverseX = visualWidth >= 445;
      // eslint-disable-next-line no-nested-ternary
      const scrollPosFixX = scrollLeft === 0 ? 0 : posReverseX ? -4 : 3;
      this.setState({
        left: posReverseX ? visualWidth - 150 + scrollPosFixX : visualWidth + scrollPosFixX,
        top: visualHeight,
        posReverseY,
        insertPosition: selectionStart,
        open: true,
        fieldList: fieldsMap.get(search[1]) || defaultFieldList,
      });
    } else {
      this.setState({
        left: 0,
        top: 0,
        insertPosition: -1,
        open: false,
        posReverseY: false,
        fieldList: defaultFieldList,
      });
    }
  }

  @Bind()
  closeList() {
    this.setState({
      left: 0,
      top: 0,
      insertPosition: -1,
      open: false,
      posReverseY: false,
      fieldList: defaultFieldList,
    });
  }

  @Bind()
  fillFromTipsList(e) {
    const { form } = this.props;
    const { insertPosition } = this.state;
    e.stopPropagation();
    let ele = e.target;
    // eslint-disable-next-line no-constant-condition
    while(true) {
      if (ele.nodeName === "LI" || !ele) break;
      ele = ele.parentNode;
    }
    if (ele) {
      const value = ele.getAttribute('value').replace(toCamel, (_, _1, $2) => $2.toUpperCase());
      let text = form.getFieldValue('renderRule');
      const leftText = text.slice(0, insertPosition);
      const rightText = text.slice(insertPosition);
      text = `${leftText}${value}${rightText}`;
      form.setFieldsValue({ renderRule: text });
      this.setState({
        left: 0,
        top: 0,
        insertPosition: -1,
        open: false,
      });
      this.textArea.textAreaRef.focus();
      this.textArea.textAreaRef.setSelectionRange(text.length, text.length);
    }
  }

  render() {
    const { form, rule, readOnly  } = this.props;
    return (
      <Row gutter={12}>
        <Col span={8}>
          <div className={styles.title} style={{ marginBottom: '8px' }}>
            {intl.get('hpfm.individual.view.message.title.configInc').d('配置说明')}
          </div>
          <AnyList itemLayout="horizontal" style={{ height: '342px', overflow: 'auto' }}>
            <ListItem>
              <Meta
                title={
                  <div className={styles['config-inc']}>
                    <span className="inc-title">
                      {intl
                        .get('hpfm.individual.view.message.tips.title1')
                        .d('在规则中使用表达式')}
                    </span>
                    {this.getSyntaxList()}
                  </div>
                }
                description={intl
                  .get('hpfm.individual.view.message.tips.desc1')
                  .d('规则代码中可以在任意位置使用‘<%= 表达式 %>’进行表达时运算')}
              />
            </ListItem>
            <ListItem>
              <Meta
                title={
                  <div className={styles['config-inc']}>
                    <span className="inc-title">
                      {intl.get('hpfm.individual.view.message.tips.title2').d('获取字段')}
                    </span>
                    {this.getAliasList()}
                  </div>
                }
                description={intl
                  .get('hpfm.individual.view.message.tips.desc2')
                  .d(
                    '若当前单元设置了关联单元，可通过‘单元别名.单元字段’的方式获取，如：u1.rfxTitle （输入‘u1.’会自动提示单元中存在的字段，点击可自动补全）；表单、表格和查询类型默认关联当前单元，固定使用别名‘self’。\n目前上下文参数支持origanizationId-采购方租户和tenantId-供应商租户，通过别名‘c’获取.'
                  )}
              />
            </ListItem>
            <ListItem>
              <Meta
                title={
                  <div className={styles['config-inc']}>
                    <span className="inc-title">
                      {intl.get('hpfm.individual.view.message.tips.title3').d('工具函数')}
                    </span>
                    {this.getInnerFunList()}
                  </div>
                }
                description={intl
                  .get('hpfm.individual.view.message.tips.desc3')
                  .d(
                    '包含大数字运算、文本渲染等函数'
                  )}
              />
            </ListItem>
          </AnyList>
        </Col>
        <Col span={16}>
          <div className={styles.title} style={{ marginBottom: '8px' }}>
            {intl.get('hpfm.individual.view.message.title.ruleCode').d('规则代码')}
          </div>
          <div className={styles['code-container']}>
            <FormItem>
              {readOnly ? (
                <span style={{ whiteSpace: "pre-wrap" }}>
                  {rule || intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
                </span>
              ) : form.getFieldDecorator('renderRule', {
                initialValue: rule,
              })(
                <TextArea
                  ref={ref => {
                    this.textArea = ref;
                  }}
                  className={styles['code-text-area']}
                  placeholder={htmlText}
                  onChange={this.openList}
                  onClick={this.closeList}
                />
              )}
            </FormItem>
            <div className={styles['text-area-compute-offset']} ref={this.hiddenDiv} />
            {this.renderList()}
          </div>
        </Col>
      </Row>
    );
  }
}