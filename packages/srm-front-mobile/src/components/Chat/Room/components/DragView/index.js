import React, { Component } from 'react';
import CLN from 'classnames';
import styles from './index.less';

export default class Dragview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMoving: false,
    };
  }

  startPoint = null;

  lastPoint = null;

  touchStart = (e) => {
    this.startPoint = {
      x: e.screenX,
      y: e.screenY,
    };
    this.lastPoint = {
      x: e.screenX,
      y: e.screenY,
    };
    this.setState({ isMoving: true });
  };

  touchMove = (e) => {
    if (!this.state.isMoving) {
      return false;
    }
    const currentPoint = {
      x: e.screenX,
      y: e.screenY,
    };
    if (this.props.direction === 'vertical') {
      const chnageY = this.lastPoint.y - currentPoint.y;
      this.props.onChange(chnageY);
    } else {
      // horizontal
      const changeX = this.lastPoint.x - currentPoint.x;
      this.props.onChange(changeX);
    }

    this.lastPoint = {
      x: e.screenX,
      y: e.screenY,
    };
  };

  touchEnd = (e) => {
    if (!this.state.isMoving) {
      return false;
    }
    const currentPoint = {
      x: e.screenX,
      y: e.screenY,
    };
    if (this.props.direction === 'vertical') {
      const chnageY = this.lastPoint.y - currentPoint.y;
      this.props.onChange(chnageY);
    } else {
      const changeX = this.lastPoint.x - currentPoint.x;
      this.props.onChange(changeX);
    }
    this.setState({ isMoving: false });
    this.startPoint = null;
    this.lastPoint = null;
  };

  touchCancel = () => {
    this.setState({ isMoving: false });
    this.startPoint = null;
    this.lastPoint = null;
  };

  render() {
    const { className } = this.props;
    const { isMoving } = this.state;
    return (
      <div className={CLN(styles['drag-view'], className)} onMouseDown={this.touchStart}>
        {isMoving ? (
          <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
            onMouseMove={this.touchMove}
            onMouseUp={this.touchEnd}
            onMouseOut={this.touchEnd}
            onBlur={this.touchCancel}
          />
        ) : null}
      </div>
    );
  }
}
