import ObjectID from 'bson-objectid';

import Constants from '~/config/Constants';

export default class HotspotCanvasEditor {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    this.isMouseDown = false;
    this.mouseDownPosition = { x: 0, y: 0 };
    this.currentMousePosition = { x: 0, y: 0 };
    this.objects = [];
    this.eventCanvas = document.createElement('canvas');
    this.eventCanvas.width = this.width;
    this.eventCanvas.height = this.height;
    this.eventCtx = this.eventCanvas.getContext('2d');
    this.cursor = 'default';
    this.objectUnderCursor = null;
    this.selectedObject = null;
    this.selectedObjectCache = null;
    this.resizeHandleUnderCursor = null;
    this.polygonPointUnderCursor = -1;
    this.isReadOnly = false;
    this.correctHotspotImage = {
      asset: 'https://cf.quizizz.com/image/greenCheck.png',
      height: 32,
      width: 32,
    };
    this.eventHandlers = {
      update: (_) => _,
      selectionChange: (_) => _,
      delete: (_) => _,
      updateMode: (_) => _,
    };

    const img = new Image();
    img.src = this.correctHotspotImage.asset;
    this.renderCorrectImage = img;

    this.strokeColor = '#0000FF';
    this.correctStrokeColor = '#00FF00';
    this.correctFillColor = 'rgba(98, 195, 112, 0.2)';
    this.shadowColor = 'rgba(0, 0, 0, 0.1)';
    Object.assign(this, {
      selectionLineWidth: 2,
      selectionHandleRadius: 8,
      selectionHandleFillColor: 'white',
      selectionHandleStrokeColor: 'blue',
      labelColor: 'black',
      labelFont: '12px Arial',
      circleHotspot: {
        radius: 14,
        strokeColor: this.strokeColor,
        fillColor: '#FFF',
        lineWidth: 2,
        checkedStrokeColor: this.correctStrokeColor,
        checkedFillColor: '#FFF',
      },
      rectangleHotspot: {
        strokeColor: this.strokeColor,
        fillColor: '#2D70AE33',
        lineWidth: 2,
        checkedStrokeColor: this.correctStrokeColor,
        checkedFillColor: this.correctFillColor,
      },
      polygonHotspot: {
        strokeColor: this.strokeColor,
        fillColor: '#2D70AE33',
        lineWidth: 2,
        checkedStrokeColor: this.correctStrokeColor,
        checkedFillColor: this.correctFillColor,
      },
      isForMobile: false,
      customCursorSize: 32,
      ...options,
    });

    this.modes = {
      POINTER: 'pointer',
      PLACE_CIRCLE_HOTSPOT: 'placeCircleHotspot',
      PLACE_RECTANGLE_HOTSPOT: 'placeRectangleHotspot',
      PLACE_POLYGON_HOTSPOT: 'placePolygonHotspot',
      PLACING_POLYGON_HOTSPOT: 'placingPolygonHotspot',
      MOVE_OBJECT: 'moveObject',
      MOVE_POLYGON_POINT: 'movePolygonPoint',
      RESIZE_OBJECT_NW: 'resizeObjectNW',
      RESIZE_OBJECT_NE: 'resizeObjectNE',
      RESIZE_OBJECT_SE: 'resizeObjectSE',
      RESIZE_OBJECT_SW: 'resizeObjectSW',
    };
    this.mode = this.modes.POINTER;

    this.addEventListeners();

    this.draw();
  }

  setShapeMode(shape) {
    switch (shape) {
      case Constants.HotspotTypes.CIRCLE:
        return this.setMode(this.modes.PLACE_CIRCLE_HOTSPOT);
      case Constants.HotspotTypes.RECTANGLE:
        return this.setMode(this.modes.PLACE_RECTANGLE_HOTSPOT);
      case Constants.HotspotTypes.FREEFORM:
        return this.setMode(this.modes.PLACE_POLYGON_HOTSPOT);
      default:
        break;
    }
  }

  deepCopy(object) {
    return JSON.parse(JSON.stringify(object));
  }

  setReadOnly() {
    this.isReadOnly = true;
  }

  cacheSelectedObject() {
    this.selectedObjectCache = this.deepCopy(this.selectedObject);
  }

  setObjects(objects) {
    this.objects = objects;
  }

  addEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('touchstart', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('touchmove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('touchend', this.onMouseUp.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('mouseup', this.handleWindowMouseUp.bind(this));
  }

  subscribe(event, handler) {
    this.eventHandlers[event] = handler;
  }

  setObjectProperty(id, property, value) {
    const object = this.objects.find((o) => o.id === id);
    if (object) {
      object[property] = value;
    }
  }

  deleteObject(optionId) {
    this.objects = this.objects.filter((o) => o.optionId !== optionId);
    this.selectedObject = null;
    this.selectedObjectCache = null;
    this.objectUnderCursor = null;
    this.resizeHandleUnderCursor = null;
    this.polygonPointUnderCursor = -1;
  }

  onKeyDown(e) {
    if (this.isReadOnly) {
      return;
    }

    if (e.key === 'Escape') {
      this.setMode(this.modes.POINTER);
    }

    if (e.key === 'Backspace' && this.selectedObject) {
      this.eventHandlers.delete(this.selectedObject.optionId);
    }
  }

  onMouseDown(e) {
    if (this.isReadOnly) {
      return;
    }

    const { top, left } = e.target.getBoundingClientRect();

    const cursorPosition = {
      x: e.offsetX ?? (e.changedTouches?.[0]?.pageX - left),
      y: e.offsetY ?? (e.changedTouches?.[0]?.pageY - top),
    };

    this.isMouseDown = true;
    if (this.mode === this.modes.POINTER) {
      if (this.resizeHandleUnderCursor) {
        if (this.resizeHandleUnderCursor === 'nw') {
          this.setMode(this.modes.RESIZE_OBJECT_NW);
        } else if (this.resizeHandleUnderCursor === 'ne') {
          this.setMode(this.modes.RESIZE_OBJECT_NE);
        } else if (this.resizeHandleUnderCursor === 'se') {
          this.setMode(this.modes.RESIZE_OBJECT_SE);
        } else if (this.resizeHandleUnderCursor === 'sw') {
          this.setMode(this.modes.RESIZE_OBJECT_SW);
        }
        this.cacheSelectedObject();
        this.mouseDownPosition = cursorPosition;
      } else if (this.polygonPointUnderCursor !== -1) {
        this.setMode(this.modes.MOVE_POLYGON_POINT);
        this.cacheSelectedObject();
        this.eventHandlers.selectionChange(this.selectedObject.optionId);
        this.mouseDownPosition = cursorPosition;
      } else if (this.objectUnderCursor) {
        this.selectedObject = this.objectUnderCursor;
        this.setMode(this.modes.MOVE_OBJECT);
        this.cacheSelectedObject();
        this.eventHandlers.selectionChange(this.selectedObject.optionId);
        this.mouseDownPosition = cursorPosition;
      } else if (this.selectedObject) {
        this.selectedObject = null;
        this.eventHandlers.selectionChange('');
        this.selectedObjectCache = null;
        this.resizeHandleUnderCursor = null;
        this.mouseDownPosition = { x: 0, y: 0 };
      }
    } else if (this.mode === this.modes.PLACE_CIRCLE_HOTSPOT) {
      this.createCircleHotspot(cursorPosition);
    } else if (this.mode === this.modes.PLACE_RECTANGLE_HOTSPOT) {
      this.mouseDownPosition = cursorPosition;
    } else if (this.mode === this.modes.PLACE_POLYGON_HOTSPOT) {
      this.createPolygonHotspot({
        points: [cursorPosition],
      });
      this.mouseDownPosition = cursorPosition;
    } else if (this.mode === this.modes.PLACING_POLYGON_HOTSPOT) {
      const isClosing = Math.abs(this.selectedObject.points[0].x - cursorPosition.x) < 10
        && Math.abs(this.selectedObject.points[0].y - cursorPosition.y) < 10;
      if (isClosing) {
        this.setMode(this.modes.POINTER);
        this.eventHandlers.update(this.objects);
      } else {
        this.selectedObject.points.push(cursorPosition);
        this.eventHandlers.update(this.objects);
      }
    }
  }

  handleWindowMouseUp() {
    // if user clicks outside of canvas, we need to create the rectangle hotspot
    if (this.mode === this.modes.PLACE_RECTANGLE_HOTSPOT) {
      this.onMouseUp();
    }
  }

  onMouseUp() {
    if (this.isReadOnly) {
      return;
    }

    this.isMouseDown = false;
    if (this.selectedObject) {
      this.selectedObject.isDragging = false;
    }
    if (this.mode === this.modes.PLACE_RECTANGLE_HOTSPOT) {
      this.createRectangleHotspot();
    } else if (this.mode === this.modes.MOVE_OBJECT) {
      this.setMode(this.modes.POINTER);
      this.eventHandlers.update(this.objects);
    } else if (this.mode === this.modes.RESIZE_OBJECT_NW
        || this.mode === this.modes.RESIZE_OBJECT_NE
        || this.mode === this.modes.RESIZE_OBJECT_SE
        || this.mode === this.modes.RESIZE_OBJECT_SW) {
      this.eventHandlers.update(this.objects);
      this.setMode(this.modes.POINTER);
      this.selectedObjectCache = null;
      this.resizeHandleUnderCursor = null;
    } else if (this.mode === this.modes.MOVE_POLYGON_POINT) {
      this.setMode(this.modes.POINTER);
      this.eventHandlers.update(this.objects);
      this.selectedObjectCache = null;
      this.polygonPointUnderCursor = -1;
    }
  }

  onMouseMove(e) {
    if (this.isReadOnly) {
      return;
    }

    const { top = 0, left = 0 } = e.target.getBoundingClientRect() ?? {};

    this.currentMousePosition = {
      x: e.offsetX ?? (e.changedTouches?.[0]?.clientX - left),
      y: e.offsetY ?? (e.changedTouches?.[0]?.clientY - top),
    };

    if (this.mode === this.modes.POINTER) {
      const pixel = this.eventCtx.getImageData(this.currentMousePosition.x, this.currentMousePosition.y, 1, 1).data;
      if (pixel[3] === 255) {
        if (pixel[2] > 0) {
          if (this.selectedObject.type === 'rectangleHotspot') {
            if (pixel[2] === 1) {
              this.resizeHandleUnderCursor = 'nw';
              this.objectUnderCursor = null;

              this.cursor = 'resize';
              this.canvas.style.cursor = 'nwse-resize';
            } else if (pixel[2] === 2) {
              this.resizeHandleUnderCursor = 'ne';
              this.objectUnderCursor = null;

              this.cursor = 'resize';
              this.canvas.style.cursor = 'nesw-resize';
            } else if (pixel[2] === 3) {
              this.resizeHandleUnderCursor = 'se';
              this.objectUnderCursor = null;

              this.cursor = 'resize';
              this.canvas.style.cursor = 'nwse-resize';
            } else if (pixel[2] === 4) {
              this.resizeHandleUnderCursor = 'sw';
              this.objectUnderCursor = null;

              this.cursor = 'resize';
              this.canvas.style.cursor = 'nesw-resize';
            }
          } else if (this.selectedObject.type === 'polygonHotspot') {
            this.polygonPointUnderCursor = pixel[2] - 1;
            this.cursor = 'move';
            this.canvas.style.cursor = 'move';
          }
        } else {
          this.objectUnderCursor = this.objects.find((object) => object.id === this.getIdFromNumber(pixel[0]));
          this.resizeHandleUnderCursor = null;
          this.polygonPointUnderCursor = -1;
          if (this.objectUnderCursor) {
            this.cursor = 'pointer';
            this.canvas.style.cursor = 'pointer';
          }
        }
      } else if (this.cursor !== 'default') {
        this.cursor = 'default';
        this.canvas.style.cursor = 'default';
        this.objectUnderCursor = null;
        this.resizeHandleUnderCursor = null;
        this.polygonPointUnderCursor = -1;
      }
    } else if (this.mode === this.modes.MOVE_OBJECT) {
      this.selectedObject.isDragging = true;
      if (this.selectedObject.type === 'circleHotspot') {
        this.selectedObject.x = this.currentMousePosition.x;
        this.selectedObject.y = this.currentMousePosition.y;
      } else if (this.selectedObject.type === 'rectangleHotspot') {
        this.selectedObject.x = this.currentMousePosition.x - this.selectedObject.width / 2;
        this.selectedObject.y = this.currentMousePosition.y - this.selectedObject.height / 2;
      } else if (this.selectedObject.type === 'polygonHotspot') {
        this.selectedObject.points.forEach((point, index) => {
          point.x = this.selectedObjectCache.points[index].x + this.currentMousePosition.x - this.mouseDownPosition.x;
          point.y = this.selectedObjectCache.points[index].y + this.currentMousePosition.y - this.mouseDownPosition.y;
        });
      }
    } else if (this.mode === this.modes.RESIZE_OBJECT_NW) {
      if (this.selectedObject.type === 'rectangleHotspot') {
        this.selectedObject.width = this.selectedObjectCache.width + this.mouseDownPosition.x - this.currentMousePosition.x;
        this.selectedObject.height = this.selectedObjectCache.height + this.mouseDownPosition.y - this.currentMousePosition.y;
        this.selectedObject.x = this.currentMousePosition.x;
        this.selectedObject.y = this.currentMousePosition.y;
      }
    } else if (this.mode === this.modes.RESIZE_OBJECT_NE) {
      if (this.selectedObject.type === 'rectangleHotspot') {
        this.selectedObject.width = this.selectedObjectCache.width + this.currentMousePosition.x - this.mouseDownPosition.x;
        this.selectedObject.height = this.selectedObjectCache.height + this.mouseDownPosition.y - this.currentMousePosition.y;
        this.selectedObject.y = this.currentMousePosition.y;
      }
    } else if (this.mode === this.modes.RESIZE_OBJECT_SE) {
      if (this.selectedObject.type === 'rectangleHotspot') {
        this.selectedObject.width = this.selectedObjectCache.width + this.currentMousePosition.x - this.mouseDownPosition.x;
        this.selectedObject.height = this.selectedObjectCache.height + this.currentMousePosition.y - this.mouseDownPosition.y;
      }
    } else if (this.mode === this.modes.RESIZE_OBJECT_SW) {
      if (this.selectedObject.type === 'rectangleHotspot') {
        this.selectedObject.width = this.selectedObjectCache.width + this.mouseDownPosition.x - this.currentMousePosition.x;
        this.selectedObject.height = this.selectedObjectCache.height + this.currentMousePosition.y - this.mouseDownPosition.y;
        this.selectedObject.x = this.currentMousePosition.x;
      }
    } else if (this.mode === this.modes.MOVE_POLYGON_POINT) {
      if (this.selectedObject.type === 'polygonHotspot') {
        this.selectedObject.points[this.polygonPointUnderCursor].x = this.currentMousePosition.x;
        this.selectedObject.points[this.polygonPointUnderCursor].y = this.currentMousePosition.y;
      }
    }
  }

  setMode(mode) {
    if (this.isReadOnly) {
      return;
    }

    this.mode = mode;

    this.eventHandlers.updateMode(mode);

    switch (mode) {
      case this.modes.POINTER:
        this.cursor = this.objectUnderCursor ? 'pointer' : 'default';
        this.canvas.style.cursor = this.objectUnderCursor ? 'pointer' : 'default';
        break;
      case this.modes.PLACE_CIRCLE_HOTSPOT:
      case this.modes.PLACE_RECTANGLE_HOTSPOT:
        this.cursor = '';
        this.canvas.style.cursor = null;
        this.selectedObject = null;
        this.eventHandlers.selectionChange('');
        break;
      case this.modes.PLACE_POLYGON_HOTSPOT:
      case this.modes.PLACING_POLYGON_HOTSPOT:
        this.cursor = '';
        this.canvas.style.cursor = null;
        break;
      default:
        break;
    }
  }

  setOptionById(optionId, value = {}) {
    const optionIndex = this.objects.findIndex((option) => option.optionId === optionId);

    Object.assign(this.objects[optionIndex], value);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.eventCtx.clearRect(0, 0, this.width, this.height);
  }

  draw() {
    this.clearCanvas();

    this.objects.forEach((object) => {
      if (object.type === 'circleHotspot') {
        this.drawCircleHotspot(object);
      } else if (object.type === 'rectangleHotspot') {
        this.drawRectangleHotspot(object);
      } else if (object.type === 'polygonHotspot') {
        this.drawPolygonHotspot(object);
      }
    });

    if (this.selectedObject) {
      this.drawSelection();
    }

    if (this.mode === this.modes.PLACE_RECTANGLE_HOTSPOT && this.isMouseDown) {
      this.ctx.beginPath();
      this.ctx.rect(
        this.mouseDownPosition.x,
        this.mouseDownPosition.y,
        this.currentMousePosition.x - this.mouseDownPosition.x,
        this.currentMousePosition.y - this.mouseDownPosition.y,
      );
      this.ctx.lineWidth = this.rectangleHotspot.lineWidth;
      this.ctx.strokeStyle = this.rectangleHotspot.strokeColor;
      this.ctx.fillStyle = this.rectangleHotspot.fillColor;
      this.ctx.stroke();
      this.ctx.fill();
    }

    requestAnimationFrame(this.draw.bind(this));
  }

  drawCircleHotspot({
    id, checked, x, y, radius, isDragging = false,
  }) {
    this.ctx.beginPath();

    this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.ctx.lineWidth = this.circleHotspot.lineWidth;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = this.shadowColor;

    if (checked) {
      this.ctx.fillStyle = this.circleHotspot.checkedFillColor;
      this.ctx.strokeStyle = this.circleHotspot.checkedStrokeColor;
    } else {
      this.ctx.strokeStyle = this.circleHotspot.strokeColor;
      this.ctx.fillStyle = this.circleHotspot.fillColor;
    }
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();

    if (checked) {
      this.ctx.beginPath();
      this.ctx.fillStyle = this.circleHotspot.checkedStrokeColor;
      this.ctx.arc(x, y, radius / 2, 0, 2 * Math.PI, false);
      this.ctx.fill();
      this.ctx.closePath();
    }

    // draw outer circle for visibility
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius + this.circleHotspot.lineWidth, 0, 2 * Math.PI, false);
    this.ctx.strokeStyle = '#FFF';
    if (!checked && isDragging) {
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
    }
    this.ctx.stroke();
    this.ctx.closePath();

    // handling actions for in memory event canvas
    this.eventCtx.beginPath();
    this.eventCtx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.eventCtx.fillStyle = id;
    this.eventCtx.fill();
    this.eventCtx.closePath();
  }

  drawRectangleHotspot({
    id, checked, x, y, width, height, isDragging = false,
  }) {
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.lineWidth = this.rectangleHotspot.lineWidth;
    if (checked) {
      let imageBadgeScalingFactor = 1;
      if (width < this.correctHotspotImage.width || height < this.correctHotspotImage.height) {
        imageBadgeScalingFactor = Math.min(width / this.correctHotspotImage.width, height / this.correctHotspotImage.height);
      }
      const imageBadgeWidth = this.correctHotspotImage.width * imageBadgeScalingFactor;
      const imageBadgeHeight = this.correctHotspotImage.height * imageBadgeScalingFactor;
      this.ctx.drawImage(this.renderCorrectImage, x + width / 2 - imageBadgeWidth / 2, y + height / 2 - imageBadgeHeight / 2, imageBadgeWidth, imageBadgeHeight);
      this.ctx.strokeStyle = this.rectangleHotspot.checkedStrokeColor;
      this.ctx.fillStyle = this.rectangleHotspot.checkedFillColor;
    } else {
      this.ctx.strokeStyle = this.rectangleHotspot.strokeColor;
      this.ctx.fillStyle = this.rectangleHotspot.fillColor;
    }
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();

    // draw outer rectangle for visibility
    // draw outer circle for visibility
    this.ctx.beginPath();
    this.ctx.rect(x - this.rectangleHotspot.lineWidth, y - this.rectangleHotspot.lineWidth, width + this.rectangleHotspot.lineWidth * 2, height + this.rectangleHotspot.lineWidth * 2);
    this.ctx.strokeStyle = '#FFF';
    if (isDragging) {
      this.ctx.lineWidth = 6;
      this.ctx.strokeStyle = checked ? this.rectangleHotspot.checkedFillColor : 'rgba(0, 0, 255, 0.2)';
    }
    this.ctx.stroke();
    this.ctx.closePath();

    this.eventCtx.beginPath();
    this.eventCtx.rect(x, y, width, height);
    this.eventCtx.fillStyle = id;
    this.eventCtx.fill();
    this.eventCtx.closePath();
  }

  drawPolygonHotspot({
    id, label, checked, points, isDragging,
  }) {
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    // draw outer polygin for visibility
    if (isDragging) {
      this.ctx.shadowBlur = 25;
      this.ctx.shadowColor = checked ? this.polygonHotspot.checkedFillColor : 'rgba(0, 0, 255, 0.2)';
    }
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    if (this.mode !== 'placingPolygonHotspot' || (this.selectedObject && this.selectedObject.id !== id)) {
      this.ctx.closePath();
    }
    this.ctx.lineWidth = this.polygonHotspot.lineWidth;
    const polygonXCenter = points.reduce((acc, point) => acc + point.x, 0) / points.length;
    const polygonYCenter = points.reduce((acc, point) => acc + point.y, 0) / points.length;
    if (checked) {
      this.ctx.drawImage(this.renderCorrectImage, polygonXCenter - this.correctHotspotImage.width / 2, polygonYCenter - this.correctHotspotImage.height / 2, this.correctHotspotImage.width, this.correctHotspotImage.height);
      this.ctx.strokeStyle = this.polygonHotspot.checkedStrokeColor;
      this.ctx.fillStyle = this.polygonHotspot.checkedFillColor;
    } else {
      this.ctx.strokeStyle = this.polygonHotspot.strokeColor;
      this.ctx.fillStyle = this.polygonHotspot.fillColor;
    }
    this.ctx.shadowBlur = 15;
    this.ctx.stroke();
    if (this.mode !== 'placingPolygonHotspot' || (this.selectedObject && this.selectedObject.id !== id)) {
      this.ctx.fill();
    }

    this.eventCtx.beginPath();
    this.eventCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.eventCtx.lineTo(points[i].x, points[i].y);
    }
    this.eventCtx.closePath();
    this.eventCtx.fillStyle = id;
    this.eventCtx.fill();
  }

  drawSelection() {
    if (this.selectedObject.type === 'circleHotspot') {
      this.ctx.beginPath();
      this.ctx.arc(this.selectedObject.x, this.selectedObject.y, this.selectedObject.radius, 0, 2 * Math.PI, false);
      this.ctx.lineWidth = this.selectionLineWidth;
      this.ctx.strokeStyle = this.selectedObject.checked ? this.correctStrokeColor : this.strokeColor;
      this.ctx.stroke();
    } else if (this.selectedObject.type === 'rectangleHotspot') {
      this.ctx.beginPath();
      this.ctx.rect(this.selectedObject.x, this.selectedObject.y, this.selectedObject.width, this.selectedObject.height);
      this.ctx.lineWidth = this.selectionLineWidth;
      this.ctx.strokeStyle = this.selectedObject.checked ? this.correctStrokeColor : this.strokeColor;
      this.ctx.stroke();

      this.drawSelectionHandles();
    } else if (this.selectedObject.type === 'polygonHotspot') {
      this.ctx.beginPath();
      this.ctx.moveTo(this.selectedObject.points[0].x, this.selectedObject.points[0].y);
      for (let i = 1; i < this.selectedObject.points.length; i++) {
        this.ctx.lineTo(this.selectedObject.points[i].x, this.selectedObject.points[i].y);
      }

      if (this.mode !== 'placingPolygonHotspot') {
        this.ctx.closePath();
      } else {
        this.ctx.lineTo(this.currentMousePosition.x, this.currentMousePosition.y);
      }

      this.ctx.lineWidth = this.selectionLineWidth;
      this.ctx.strokeStyle = this.selectedObject.checked ? this.correctStrokeColor : this.strokeColor;
      this.ctx.stroke();

      this.drawSelectionHandles();
    }
  }

  drawSelectionHandles() {
    if (this.selectedObject.type === 'rectangleHotspot') {
      this.ctx.beginPath();
      this.ctx.arc(this.selectedObject.x, this.selectedObject.y, this.selectionHandleRadius, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = this.selectionHandleFillColor;
      this.ctx.fill();
      this.ctx.strokeStype = this.selectionHandleStrokeColor;
      this.ctx.stroke();
      this.ctx.closePath();

      this.eventCtx.beginPath();
      this.eventCtx.arc(this.selectedObject.x, this.selectedObject.y, this.selectionHandleRadius, 0, 2 * Math.PI, false);
      this.eventCtx.fillStyle = '#000001';
      this.eventCtx.fill();
      this.eventCtx.closePath();

      this.ctx.beginPath();
      this.ctx.arc(this.selectedObject.x + this.selectedObject.width, this.selectedObject.y, this.selectionHandleRadius, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = this.selectionHandleFillColor;
      this.ctx.fill();
      this.ctx.strokeStype = this.selectionHandleStrokeColor;
      this.ctx.stroke();
      this.ctx.closePath();

      this.eventCtx.beginPath();
      this.eventCtx.arc(this.selectedObject.x + this.selectedObject.width, this.selectedObject.y, this.selectionHandleRadius, 0, 2 * Math.PI, false);
      this.eventCtx.fillStyle = '#000002';
      this.eventCtx.fill();
      this.eventCtx.closePath();

      this.ctx.beginPath();
      this.ctx.arc(this.selectedObject.x + this.selectedObject.width, this.selectedObject.y + this.selectedObject.height, this.selectionHandleRadius, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = this.selectionHandleFillColor;
      this.ctx.fill();
      this.ctx.strokeStype = this.selectionHandleStrokeColor;
      this.ctx.stroke();
      this.ctx.closePath();

      this.eventCtx.beginPath();
      this.eventCtx.arc(this.selectedObject.x + this.selectedObject.width, this.selectedObject.y + this.selectedObject.height, this.selectionHandleRadius, 0, 2 * Math.PI, false);
      this.eventCtx.fillStyle = '#000003';
      this.eventCtx.fill();
      this.eventCtx.closePath();

      this.ctx.beginPath();
      this.ctx.arc(this.selectedObject.x, this.selectedObject.y + this.selectedObject.height, this.selectionHandleRadius, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = this.selectionHandleFillColor;
      this.ctx.fill();
      this.ctx.strokeStype = this.selectionHandleStrokeColor;
      this.ctx.stroke();
      this.ctx.closePath();

      this.eventCtx.beginPath();
      this.eventCtx.arc(this.selectedObject.x, this.selectedObject.y + this.selectedObject.height, this.selectionHandleRadius, 0, 2 * Math.PI, false);
      this.eventCtx.fillStyle = '#000004';
      this.eventCtx.fill();
      this.eventCtx.closePath();
    } else if (this.selectedObject.type === 'polygonHotspot') {
      this.selectedObject.points.forEach((point, index) => {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.selectionHandleRadius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.selectionHandleFillColor;
        this.ctx.fill();
        this.ctx.strokeStype = this.selectionHandleStrokeColor;
        this.ctx.stroke();
        this.ctx.closePath();

        this.eventCtx.beginPath();
        this.eventCtx.arc(point.x, point.y, this.selectionHandleRadius, 0, 2 * Math.PI, false);
        this.eventCtx.fillStyle = `#00000${index + 1}`;
        this.eventCtx.fill();
        this.eventCtx.closePath();
      });

      if (this.mode === 'placingPolygonHotspot') {
        this.ctx.beginPath();
        this.ctx.arc(this.currentMousePosition.x, this.currentMousePosition.y, this.selectionHandleRadius - 2, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.selectionHandleFillColor;
        this.ctx.fill();
        this.ctx.strokeStype = this.selectionHandleStrokeColor;
        this.ctx.stroke();
        this.ctx.closePath();

        this.eventCtx.beginPath();
        this.eventCtx.arc(this.currentMousePosition.x, this.currentMousePosition.y, this.selectionHandleRadius - 2, 0, 2 * Math.PI, false);
        this.eventCtx.fillStyle = `#00000${this.selectedObject.points.length + 1}`;
        this.eventCtx.fill();
        this.eventCtx.closePath();
      }
    }
  }

  getIdFromNumber(number) {
    return `#${number < 16 ? '0' : ''}${number.toString(16)}0000`;
  }

  createCircleHotspot({ x, y }) {
    const { radius } = this.circleHotspot;

    this.objects.push({
      id: this.getIdFromNumber(this.objects.length),
      optionId: ObjectID().toHexString(),
      label: `Hotspot ${this.objects.length + 1}`,
      type: 'circleHotspot',
      x,
      y,
      radius,
      checked: false,
    });

    this.selectedObject = this.objects[this.objects.length - 1];
    this.eventHandlers.selectionChange(this.selectedObject.optionId);

    this.setMode(this.modes.POINTER);
    this.eventHandlers.update(this.objects);
  }

  createRectangleHotspot() {
    const x = this.currentMousePosition.x - this.mouseDownPosition.x < 0 ? this.currentMousePosition.x : this.mouseDownPosition.x;
    const y = this.currentMousePosition.y - this.mouseDownPosition.y < 0 ? this.currentMousePosition.y : this.mouseDownPosition.y;
    let width = Math.abs(this.currentMousePosition.x - this.mouseDownPosition.x);
    let height = Math.abs(this.currentMousePosition.y - this.mouseDownPosition.y);

    // if the user just clicks without dragging, create a default size rectangle
    if (width < 5) {
      width = 64;
    }

    if (height < 5) {
      height = 64;
    }

    this.objects.push({
      id: this.getIdFromNumber(this.objects.length),
      label: `Hotspot ${this.objects.length + 1}`,
      optionId: ObjectID().toHexString(),
      type: 'rectangleHotspot',
      x,
      y,
      width,
      height,
      checked: false,
    });

    this.selectedObject = this.objects[this.objects.length - 1];
    this.eventHandlers.selectionChange(this.selectedObject.optionId);

    this.setMode(this.modes.POINTER);
    this.eventHandlers.update(this.objects);
  }

  createPolygonHotspot({ points }) {
    this.objects.push({
      id: this.getIdFromNumber(this.objects.length),
      label: `Hotspot ${this.objects.length + 1}`,
      optionId: ObjectID().toHexString(),
      type: 'polygonHotspot',
      points,
      checked: false,
    });

    this.selectedObject = this.objects[this.objects.length - 1];
    this.eventHandlers.selectionChange(this.selectedObject.optionId);

    this.setMode(this.modes.PLACING_POLYGON_HOTSPOT);
    this.eventHandlers.update(this.objects);
  }
}
