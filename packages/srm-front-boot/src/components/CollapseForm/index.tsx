/* eslint-disable react/no-find-dom-node */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
/**
 * 折叠表单C7N
 * @date: 2020-09-08
 * @author: ZT <tong.zhao@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Zhenyun
 */

import type { CSSProperties, ReactElement } from 'react';
import React, { Children, cloneElement, isValidElement } from 'react';
import type { DataSet, Row } from 'choerodon-ui/pro';
import { Form, Icon } from 'choerodon-ui/pro';
import type { LabelAlign as align, LabelLayout as Layout } from 'choerodon-ui/pro/lib/form/enum';
import { FormLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'hzero-front/lib/utils/intl';
import ReactDOM from 'react-dom';
import styles from './style.less';

const defaultAlign: align.left | any = "left";
const defaultLayout: Layout.horizontal | any = "horizontal";
// eslint-disable-next-line no-unused-vars
declare module "react" {
  // eslint-disable-next-line no-unused-vars
  interface HTMLAttributes<T> {
    newLine?: boolean;
    colSpan?: number;
    label?: any;
  }

}
interface FormProps {
  /** 内联样式 */
  style?: CSSProperties;
  /** DataSet */
  dataSet: DataSet;
  /** 展示的列数 */
  columns?: number;
  /** 展示的行数 */
  showLines?: number;
  /** 收起时的高度，该项优先级高于showLines和singLeHeight */
  unExpandHeight?: number;
  children: ReactElement[];
  /** 标签对齐方式 */
  labelAlign?: align;
  /** 标签位置 */
  labelLayout?: Layout;
  /** 决定表单是栅格模式还是表格模式 */
  layout?: FormLayout;
  /** 获取内部form的ref */
  formRef?: Function;
  /** 高级选项附加类名 */
  wrapperClassName?: string;
  /** anchor的className */
  anchorClassName?: string;
  firstShowFields?: string[];
  expandText?: string;
  unExpandTExt?: string;
}

export default class CollapseForm extends React.PureComponent<FormProps, any> {
  form: any;

  formWrapper: any;

  cacheElement: any[] = [];

  changeExpand = false;

  hiddenRowNum: number[] = [];

  constructor(props: Readonly<FormProps>) {
    super(props);
    this.form = React.createRef();
    this.formWrapper = React.createRef();
    this.state = {
      expand: false,
    };
  }

  changeCollapse = () => {
    const { expand } = this.state;
    this.changeExpand = true;
    const formWrapper = ReactDOM.findDOMNode(this.formWrapper.current);
    const startHeight = this.computeHeight(expand);
    (formWrapper as any).style.height = `${startHeight}px`;
      const finalHeight = this.computeHeight(!expand);
      (formWrapper as any).style.height = `${finalHeight}px`;
      this.setState({ expand: !expand });

  }

  componentDidMount() {
    const { formRef } = this.props;
    if (typeof formRef === "function") {
      formRef(this.form.current);
    }
    const formWrapper = (ReactDOM.findDOMNode(this.formWrapper.current) as Element);
    (formWrapper as any).style.height = `${this.computeHeight(false)}px`;
    setTimeout(()=>{
      (formWrapper as any).style.height = "auto";
    }, 300);
  }

  componentDidUpdate(){
    const formWrapper = (ReactDOM.findDOMNode(this.formWrapper.current) as Element);
    // 在没有手动变更expand前，高度随时更新
    if(!this.changeExpand){
      (formWrapper as any).style.height = `${this.computeHeight(this.state.expand)}px`;
    }
    setTimeout(()=>{
      (formWrapper as any).style.height = "auto";
    }, 300);
  }

  computeHeight(expand){
    if(this.props.layout === FormLayout.none){
      return this.computeHeightNone(expand);
    }
    return this.computeHeightTable(expand);
  }

  computeHeightTable(expand){
    const form: Element = ReactDOM.findDOMNode(this.form.current) as Element;
    // 不考虑表格嵌套
    const table = form.getElementsByTagName("table");
    if(table && table[0]){
      const {
        children = [],
        columns = 2,
        showLines = 2,
        firstShowFields = [],
      } = this.props;
      const minShowNums = showLines * columns;
      const newChildren = children instanceof Array ? children : [children];
      const firstShowFieldsNum = newChildren.reduce((p, n)=>{
        if(firstShowFields.includes(n && n.props && n.props.name)){
          return p+1;
        }
        return p;
      }, 0);
      // 12为内容区域样式的padding修正数值，下面return 12同样原因。
      let totalHeight = 12;
      let {rows} = (table[0] as any);
      rows = Array.prototype.slice.call(rows, 0);
      if(expand){
        this.cacheElement.forEach((ele: any)=>{
          // eslint-disable-next-line no-param-reassign
          ele.element.style.display = ele.originDisplay||"table-cell";
        });
        this.cacheElement = [];
        rows.forEach(tr=>{
          totalHeight+=tr.getBoundingClientRect().height;
        });
        return totalHeight;
      } else {
        let showNums = (firstShowFields.length > 0 ? firstShowFieldsNum : minShowNums);
        const countRows: Element[] = [];
        const toDisplayNone =(child, index)=>{
          if(index >= showNums){
            this.cacheElement.push({originDisplay: child.style.display||undefined, element: child});
            // eslint-disable-next-line no-param-reassign
            child.style.display = "none";
          }
        };
        // 每次计算收起状态高度时，先恢复并清空缓存的elemtnt
        this.cacheElement.forEach((ele: any)=>{
          // eslint-disable-next-line no-param-reassign
          ele.element.style.display = ele.originDisplay||"table-cell";
        });
        this.cacheElement = [];
        for(let i = 0; i < rows.length; i++){
          if(rows[i].children && rows[i].children.length>0){
            if(showNums<rows[i].children.length){
              Array.prototype.slice.call(rows[i].children, 0).forEach(toDisplayNone);
            }
            if(showNums>0){
              showNums-=rows[i].children.length;
              countRows.push(rows[i]);
            }
          }
        }
        countRows.forEach(tr=>{
          totalHeight+=tr.getBoundingClientRect().height;
        });
      }
      return totalHeight;
    }
    return 12;
  }

  computeHeightNone(expand){
    const form: Element = ReactDOM.findDOMNode(this.form.current) as Element;
    // 不考虑表格嵌套
    let rows: any = form.getElementsByClassName("c7n-row");
    if(rows && rows.length>0){
      // 12为内容区域样式的padding修正数值，下面return 12同样原因。
      let totalHeight = 12;
      rows = Array.prototype.slice.call(rows, 0);
      if(expand){
        this.cacheElement.forEach((ele: any)=>{
          // eslint-disable-next-line no-param-reassign
          ele.element.style.display = ele.originDisplay || "block";
        });
        this.cacheElement = [];
        rows.forEach(e=>{
          totalHeight+=e.getBoundingClientRect().height;
        });
        return totalHeight;
      } else {
        // 每次计算收起状态高度时，先恢复并清空缓存的elemtnt
        this.cacheElement.forEach((ele: any)=>{
          // eslint-disable-next-line no-param-reassign
          ele.element.style.display = ele.originDisplay || "block";
        });
        this.cacheElement = [];
        rows.forEach((row, index) => {
          if(this.hiddenRowNum.includes(index)){
            this.cacheElement.push({originDisplay: row.style.display || undefined, element: row});
            // eslint-disable-next-line no-param-reassign
            row.style.display = "none";
          }
          totalHeight+=row.getBoundingClientRect().height;
        });
      }
      return totalHeight;
    }
  }

  render() {
    const {
      wrapperClassName,
      children = [],
      dataSet,
      columns = 2,
      showLines = 2,
      firstShowFields = [],
      labelAlign = defaultAlign,
      labelLayout = defaultLayout,
      layout,
      anchorClassName = "defaultAnchor",
      expandText = intl.get('hzero.common.button.up').d('收起'),
      unExpandTExt = intl.get("hzero.common.button.higherOptions").d("高级选项"),
      ...resFormProps
    } = this.props;
    const { expand } = this.state;
    const minShowNums = showLines * columns;
    let newChildren = children;
    let visibleAnchor;
    if (layout === FormLayout.none) {
      let visibleRow = 0;
      let totalRow = 0;
      this.hiddenRowNum = [];
      Children.forEach(children, (row, index) => {
        if(firstShowFields.reduce((res, field)=>res || isValidElement(row) && testRowHasTargetField(row as any, field), false)){
          visibleRow ++;
        } else {
          this.hiddenRowNum.push(index);
        }
        totalRow ++;
      });
      visibleAnchor = visibleRow !== totalRow;
    } else {
      newChildren = children instanceof Array ? children : [children];
      visibleAnchor = newChildren.filter(child => !!child).length > minShowNums;
      if (firstShowFields.length > 0) {
        const { firstShowFieldsChildren, normalFieldsChildren } = newChildren.reduce((p, n) => {
          if (firstShowFields.includes(n && n.props && n.props.name)) {
            p.firstShowFieldsChildren.push(n);
          } else if (n) {
            p.normalFieldsChildren.push(expand ? n : cloneElement(n, {style: {...n.props.style, display: "none"}}));
          }
          return p;
        }, { firstShowFieldsChildren: [] as any, normalFieldsChildren: [] as any });
        newChildren = firstShowFieldsChildren.concat(normalFieldsChildren);
        if (normalFieldsChildren.length === 0) visibleAnchor = false;
        else visibleAnchor = true;
      }
    }
    return (
      <div className={wrapperClassName}>
        <div
          ref={this.formWrapper}
          className={styles["collapse-form"]}
        >
          <Form
            {...resFormProps}
            ref={this.form}
            layout={layout}
            columns={columns}
            labelAlign={labelAlign}
            labelLayout={labelLayout}
            dataSet={dataSet}
          >
            {newChildren}
          </Form>
        </div>
        <div
          style={{ display: visibleAnchor ? "block" : "none" }}
          className={[anchorClassName, styles.anchorWrapper].join(" ")}
        >
          <span className={styles.anchor} onClick={this.changeCollapse}>
            <span
              className="text"
            >
              {expand ? expandText : unExpandTExt}
            </span>
            <Icon type={expand?"expand_less":"expand_more"} />
          </span>
        </div>
      </div>
    );
  }
}

function testRowHasTargetField(row: Row, field: string) {
  let find = false;
  if(row.props.style && row.props.style.display === "none") return false;
  Children.forEach(row.props.children, colChild => {
    if (
      isValidElement(colChild)
      && isValidElement(colChild.props.children)
      && isValidElement(colChild.props.children.props.children)
      && colChild.props.children.props.children.props.name === field
    ) {
      find = true;
    }
  });
  return find;
}