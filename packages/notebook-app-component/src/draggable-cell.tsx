/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

import * as React from "react";
import {
  DragSource,
  DropTarget,
  DragSourceMonitor,
  ConnectDragSource,
  ConnectDragPreview,
  ConnectDropTarget,
  DropTargetMonitor,
  DragSourceConnector,
  DropTargetConnector
} from "react-dnd";
import { ContentRef } from "@nteract/types";

/**
  The cell drag preview image is just a little stylized version of

   [ ]

  It matches nteract's default light theme

 */
const cellDragPreviewImage = [
  "data:image/png;base64,",
  "iVBORw0KGgoAAAANSUhEUgAAADsAAAAzCAYAAAApdnDeAAAAAXNSR0IArs4c6QAA",
  "AwNJREFUaAXtmlFL3EAUhe9MZptuoha3rLWgYC0W+lj/T3+26INvXbrI2oBdE9km",
  "O9Nzxu1S0LI70AQScyFmDDfkfvdMZpNwlCCccwq7f21MaVM4FPtkU0o59RdoJBMx",
  "WZINBg+DQWGKCAk+2kIKFh9JlSzLYVmOilEpR1Kh/iUbQFiNQTSbzWJrbYJximOJ",
  "cSaulpVRoqh4K8JhjprIVJWqFlCpQNG51roYj8cLjJcGf5RMZWC1TYw1o2LxcEmy",
  "0jeEo3ZFWVHIx0ji4eeKHFOx8l4sVVVZnBE6tWLHq7xO7FY86YpPeVjeo5y61tlR",
  "JyhXEOQhF/lw6BGWixHvUWXVTpdgyUMu8q1h/ZJbqQhdiLsESx4FLvL9gcV6q3Cs",
  "0liq2IHuBHjItYIV3rMvJnrYrkrdK9sr24EO9NO4AyI+i/CilOXbTi1xeXXFTyAS",
  "GSOfzs42XmM+v5fJ5JvP29/fl8PDw43nhCbUpuzFxYXs7OxKmqZb1WQGkc/P80K+",
  "T6dbnROaVJuyfPY+Pj7aup7h66HP/1Uu5O7u59bnhSTWpmxIEU3l9rBNdbrp6/TK",
  "Nt3xpq7XK9tUp5u+Tm2/s/jYJdfX12LwBHVycrKRK89zmeJhYnZ7K3Fcz3e/2mDP",
  "z7/waZEf8zaC+gSkKa3l4OBA3uztbXdOYFZtsKcfToNKSZNUPp6GnRN0AST3C1Ro",
  "x9qS3yvbFqVC6+yVDe1YW/J7ZduiVGidvbKhHWtLfq9sW5QKrdMri9cxB6OFhQmO",
  "TrDuBHjIRT5CEZZj0i7xOkYnWGeCPOQiHqC8lc/R60cLnNPuvjOkns7dk4t8/Jfv",
  "s46mRlWqQiudxebVV3gAj7C9hXsmgZeztnfe/91YODEr3IoF/JY/sE2gbGaVLci3",
  "hh0tRtWNvsm16JmNcOs6N9dW72LP7yOtWbEhjAUkZ+icoJ5HbE6+NSxMjKWe6cKb",
  "GkUWgMwiFbXSlRpFkXelUlF4F70rVd7Bd4oZ/LL8xiDmtPV2Nwyf2zOlTfHERY7i",
  "Haa1+w2+iFqx0aIgvgAAAABJRU5ErkJggg=="
].join("");

type Props = {
  focusCell: (payload: any) => void;
  id: string;
  moveCell: (payload: any) => void;
  children: React.ReactNode;
  contentRef: ContentRef;
};

type DnDSourceProps = {
  connectDragPreview: ConnectDragPreview;
  connectDragSource: ConnectDragSource;
  isDragging: boolean;
};

type DnDTargetProps = {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
};

type State = {
  hoverUpperHalf: boolean;
};

const cellSource = {
  beginDrag(props: Props) {
    return {
      id: props.id
    };
  }
};

function isDragUpper(
  props: Props,
  monitor: DropTargetMonitor,
  el: HTMLElement
): boolean {
  const hoverBoundingRect = el.getBoundingClientRect();
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  const clientOffset = monitor.getClientOffset();
  const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

  return hoverClientY < hoverMiddleY;
}

const cellTarget = {
  drop(props: Props, monitor: DropTargetMonitor, component: any): void {
    if (monitor) {
      const hoverUpperHalf = isDragUpper(props, monitor, component.el);
      // DropTargetSpec monitor definition could be undefined. we'll need a check for monitor in order to pass validation.
      props.moveCell({
        id: monitor.getItem().id,
        destinationId: props.id,
        above: hoverUpperHalf,
        contentRef: props.contentRef
      });
    }
  },

  hover(props: Props, monitor: DropTargetMonitor, component: any): void {
    if (monitor) {
      component.setState({
        hoverUpperHalf: isDragUpper(props, monitor, component.el)
      });
    }
  }
};

function collectSource(
  connect: DragSourceConnector,
  monitor: DragSourceMonitor
): {
  connectDragSource: ConnectDragSource;
  isDragging: boolean;
  connectDragPreview: ConnectDragPreview;
} {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview()
  };
}

function collectTarget(
  connect: DropTargetConnector,
  monitor: DropTargetMonitor
): {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
} {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

class DraggableCellView extends React.Component<
  Props & DnDSourceProps & DnDTargetProps,
  State
> {
  el?: HTMLDivElement | null;

  state = {
    hoverUpperHalf: true
  };

  componentDidMount(): void {
    const connectDragPreview = this.props.connectDragPreview;
    const img = new (window as any).Image();

    img.src = cellDragPreviewImage;
    img.onload = function dragImageLoaded() {
      connectDragPreview(img);
    };
  }

  selectCell = () => {
    const { focusCell, id, contentRef } = this.props;
    focusCell({ id, contentRef });
  };

  render() {
    return this.props.connectDropTarget(
      <div
        style={{
          opacity: this.props.isDragging ? 0.25 : 1,
          borderTop:
            this.props.isOver && this.state.hoverUpperHalf
              ? "3px lightgray solid"
              : "3px transparent solid",
          borderBottom:
            this.props.isOver && !this.state.hoverUpperHalf
              ? "3px lightgray solid"
              : "3px transparent solid"
        }}
        className={"draggable-cell"}
        ref={el => {
          this.el = el;
        }}
      >
        {this.props.connectDragSource(
          <div
            className="cell-drag-handle"
            onClick={this.selectCell}
            role="presentation"
          />
        )}
        {this.props.children}
        <style jsx>{`
          .draggable-cell {
            position: relative;
            padding: 10px;
          }

          .cell-drag-handle {
            position: absolute;
            z-index: 200;
            width: var(--prompt-width, 50px);
            height: 100%;
            cursor: move;
          }
        `}</style>
      </div>
    );
  }
}

const source = DragSource<Props, DnDSourceProps>(
  "CELL",
  cellSource,
  collectSource
);
const target = DropTarget<Props, DnDTargetProps>(
  "CELL",
  cellTarget,
  collectTarget
);

export default source(target(DraggableCellView));
