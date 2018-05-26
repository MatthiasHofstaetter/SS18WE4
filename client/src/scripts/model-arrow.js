/**
 * A class representing one arrow
 *
 * @param {Device} startDevice The start node for this arrow
 * @param {Device} [endDevice] The (optional) end node for this arrow
 * @class
 */
function Arrow(startDevice, endDevice) {
    "use strict";
    const _this = this;

    console.debug("Creating new arrow");

    /**
     * The start node for this arrow
     * @member {Device}
     */
    this.startDevice = startDevice;

    /**
     * The (optional) end node for this arrow
     * @member {?Device}
     */
    this.endDevice = endDevice;

    /**
     * The diagram on which this arrow is shown
     * @member {Diagram}
     */
    let diagram = null;

    /**
     * The jQuery DOM object representing this arrow
     */
    const object = $(document.createElementNS("http://www.w3.org/2000/svg", "path"))
        .addClass("arrow-path")
        .attr("tabindex", "0");

    // Initialize the event handlers
    attachEventHandlers();

    /**
     * Add the event handlers for the diagram
     */
    function attachEventHandlers() {
        object.click(event => {
            event.stopPropagation();
            diagram.arrowClick(_this);
        });

        object.keyup(event => {
            if (event.which === 13 || event.which === 32) {
                // Enter or space pressed
                event.stopPropagation();
                diagram.arrowClick(_this);
            }
        });
    }

    /**
     * Move the arrow to another diagram instance
     * @param {Diagram} newDiagram
     */
    function setDiagram(newDiagram) {
        diagram = newDiagram;
        diagram.arrows.append(object);
    }

    /**
     * Add this arrow to the end nodes, if not yet present
     * @returns {boolean} True if the arrow was added, false if it was already present
     */
    function add() {
        if (!_this.endDevice || _this.endDevice === _this.startDevice || _this.startDevice.isConnectedTo(_this.endDevice)) {
            return false;
        }

        _this.startDevice.addArrowOut(_this);
        _this.endDevice.addArrowIn(_this);
        object.addClass("arrow-path-added");
        return true;
    }

    /**
     * Mark this device as active or inactive
     * @param {boolean} active
     */
    function setActive(active) {
        if (active) {
            object.addClass("active");
        } else {
            object.removeClass("active");
        }
    }

    /**
     * Update the end position of the arrow path
     * @param {number[]} endPosition New end position of the arrow
     */
    function updateEndPosition(endPosition) {
        const startPosition = _this.startDevice.getIntersectionCoordinates(endPosition);
        redraw(startPosition, endPosition);
    }

    /**
     * Update the arrow path according to the device positions, or hide the path if no end device is set
     */
    function updateArrow() {
        if (_this.endDevice) {
            const startPosition = _this.startDevice.getIntersectionCoordinates(_this.endDevice.getCenterCoordinates()),
                endPosition = _this.endDevice.getIntersectionCoordinates(startPosition);
            redraw(startPosition, endPosition);
        } else {
            object.hide();
        }
    }

    /**
     * Redraw the arrow path between the given positions
     * @param {number[]} startPosition New start position of the arrow path
     * @param {number[]} endPosition New end position of the arrow path
     */
    function redraw(startPosition, endPosition) {
        object.attr("d", `M${startPosition[0]},${startPosition[1]} L${endPosition[0]},${endPosition[1]}`);
        object.show();
    }

    /**
     * Set the end device for this arrow
     * @param {Device} device The device to use as endpoint
     */
    function setEndDevice(device) {
        _this.endDevice = device;
        updateArrow();
    }

    /**
     * Remove this arrow from the DOM and its devices
     */
    function deleteArrow() {
        object.remove();
        object.off();
        _this.startDevice.deleteArrow(_this);
        if (_this.endDevice) {
            _this.endDevice.deleteArrow(_this);
        }
    }

    // Export some of the methods
    this.setDiagram = setDiagram;
    this.add = add;
    this.setActive = setActive;
    this.updateEndPosition = updateEndPosition;
    this.updateArrow = updateArrow;
    this.setEndDevice = setEndDevice;
    this.deleteArrow = deleteArrow;
}
