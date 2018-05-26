/**
 * Function called for updating the image of this device
 *
 * @callback updateFunction
 * @param {jQuery} object The jQuery DOM node for this device
 * @param min The minimum value for the device
 * @param max The maximum value for the device
 * @param value The new value for the device
 */

/**
 * A class representing one device
 *
 * @param {number} index The index of this device
 * @param {number[]} position The x and y coordinates of this device, relative to the diagram
 * @param {string} type The type of this device
 * @param {string} title The title of this device
 * @param {Control} control The control for this device
 * @class
 */
function Device(index, position, type, title, control) {
    "use strict";
    const _this = this;

    console.debug("Creating new device");

    /**
     * The index of this device
     * @member {number}
     * @const
     */
    this.index = index;

    /**
     * The type of this device
     * @member {string}
     * @const
     */
    this.type = type;

    /**
     * The title of this device
     * @member {string}
     * @const
     */
    this.title = title;

    /**
     * The control for this device
     * @member {Control}
     * @const
     */
    this.control = control;

    /**
     * A list of incoming arrows
     * @member {Arrow[]}
     */
    let arrowsIn = [];

    /**
     * A list of outgoing arrows
     * @member {Arrow[]}
     */
    let arrowsOut = [];

    /**
     * The diagram on which this device is shown
     * @member {Diagram}
     */
    let diagram = null;

    /**
     * The function used to redraw the device image
     * @member {updateFunction}
     */
    const updateFunction = update[type];

    /**
     * The jQuery DOM object representing this device
     */
    const object = $(
        `<li class="device device-in-area" aria-labelledby="device-in-area-${this.index}" title="${this.title}" tabindex="0">
            <dl class="device-properties">
                <dt class="accessibility">Maschinentyp</dt>
                <dd id="device-in-area-${this.index}" class="device-name">${this.title}</dd>
                <dt>Vorgänger:</dt>
                <dd class="device-neighbour predecessors"></dd>
                <dt>Nachfolger:</dt>
                <dd class="device-neighbour successors"></dd>
            </dl>
            <div class="device-image">${images[type]}</div>
        </li>`);

    // Initialize the event handlers
    attachEventHandlers();

    // Initialize the device position
    object
        .css("position", "")
        .css("left", position[0])
        .css("top", position[1]);

    // Initialize the image
    updateDevice();

    /**
     * Add the event handlers for the diagram
     */
    function attachEventHandlers() {
        object.contextmenu(event => diagram.showContextMenu(_this, event));

        object.mousedown(event => {
            event.stopPropagation();
            diagram.deviceMouseDown(_this);
        });

        object.keyup(event => {
            if (event.which === 13 || event.which === 32) {
                // Enter or space pressed
                event.stopPropagation();
                diagram.deviceMouseDown(_this);
            }
        });

        object.mouseup(() => diagram.deviceMouseUp(_this));

        object.dblclick(() => diagram.showDeviceDetails(_this));

        object.mouseenter(() => {
            const arrowDeviceAdd = diagram.arrowReference.clone()
                .addClass("arrow-device-add-in-area")
                .mousedown(() => diagram.activateArrowDrawing());
            object.append(arrowDeviceAdd);
        });

        object.mouseleave(() => object.find(".arrow-device-add-in-area").remove());
    }

    /**
     * Move the device to another diagram instance
     * @param {Diagram} newDiagram
     */
    function setDiagram(newDiagram) {
        diagram = newDiagram;
        diagram.devices.append(object);
        object.draggable({
            cursor: "move",
            containment: diagram.area,
            revert: "invalid",
            drag: moveDevice
        });
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
     * Update the list of predecessors in the DOM
     */
    function updatePredecessors() {
        const str = arrowsIn
            .sort((a, b) => a.startDevice.index - b.startDevice.index)
            .map(arrow => arrow.startDevice.title)
            .join(", ");
        object.find(".predecessors").html(str);
    }

    /**
     * Update the list of successors in the DOM
     */
    function updateSuccessors() {
        const str = arrowsOut
            .sort((a, b) => a.endDevice.index - b.endDevice.index)
            .map(arrow => arrow.endDevice.title)
            .join(", ");
        object.find(".successors").html(str);
    }

    /**
     * Update the position of all connected arrows
     */
    function moveDevice() {
        arrowsIn.forEach(arrow => arrow.updateArrow());
        arrowsOut.forEach(arrow => arrow.updateArrow());
        if (diagram) {
            diagram.deviceMove(_this);
        }
    }

    /**
     * Determines if a direct connection to the given device already exists
     * @param {Device} device The target device
     * @returns {boolean} True iff there exists a direct arrow in either direction
     */
    function isConnectedTo(device) {
        return arrowsOut.some(arrow => arrow.endDevice === device)
            || arrowsIn.some(arrow => arrow.startDevice === device);
    }

    /**
     * Update the image for the given value
     */
    function updateDevice() {
        if (updateFunction) {
            updateFunction(object, control.min, control.max, control.current);
        }
    }

    /**
     * Add an incoming arrow to the device
     * @param {Arrow} arrow The arrow for which this device is the end node
     */
    function addArrowIn(arrow) {
        arrowsIn.push(arrow);
        updatePredecessors();
    }

    /**
     * Add an outgoing arrow to the device
     * @param {Arrow} arrow The arrow for which this device is the start node
     */
    function addArrowOut(arrow) {
        arrowsOut.push(arrow);
        updateSuccessors();
    }

    /**
     * Delete this device and all connected arrows
     * @return {Arrow[]} The deleted arrows
     */
    function deleteDevice() {
        object.remove();
        object.off();

        // Create a copy of the arrow arrays to prevent deletion in this.deleteArrow
        const arrows = arrowsIn.concat(arrowsOut);
        arrowsIn = [];
        arrowsOut = [];

        // Delete all arrows
        arrows.forEach(arrow => arrow.deleteArrow());
        return arrows;
    }

    /**
     * Remove the given arrow from the list of arrows
     * @param {Arrow} arrow The arrow to remove
     */
    function deleteArrow(arrow) {
        let index;

        index = arrowsIn.indexOf(arrow);
        if (index >= 0) {
            arrowsIn.splice(index, 1);
            updatePredecessors();
        }

        index = arrowsOut.indexOf(arrow);
        if (index >= 0) {
            arrowsOut.splice(index, 1);
            updateSuccessors();
        }
    }

    /**
     * Get the coordinates of the top-left corner of this device
     * @returns {number[]} A two-element array containing the top-left-corner in the order [left, top]
     */
    function getPosition() {
        return [object[0].offsetLeft, object[0].offsetTop];
    }

    /**
     * Get the coordinates of the center of this device
     * @returns {number[]} A two-element array containing the center in the order [left, top]
     */
    function getCenterCoordinates() {
        return [object[0].offsetLeft + object.width() / 2, object[0].offsetTop + object.height() / 2];
    }

    /**
     * Get the coordinates of this device
     * @param {number[]} targetPosition An two-element array containing the target coordinates of a line
     * @returns {number[]} A two-element array containing the point on the border closest to the target
     */
    function getIntersectionCoordinates(targetPosition) {
        // Determine the center of the device
        const width = object.width() * 0.58,
            height = object.height() * 0.58,
            center = getCenterCoordinates(),
            x = center[0],
            y = center[1],
            dx = targetPosition[0] - x,
            dy = targetPosition[1] - y;

        if (dx === 0) {
            // Vertical arrow
            return [x, y + Math.sign(dy) * height];
        }

        const slope = dy / dx;
        if (Math.abs(slope) * width >= height) {
            // Arrow intersects the top or bottom border
            return [x + Math.sign(dy) * height / slope, y + Math.sign(dy) * height]
        } else {
            // Arrow intersects the left or right border
            return [x + Math.sign(dx) * width, y + Math.sign(dx) * width * slope];
        }
    }

    // Export some of the methods
    this.setDiagram = setDiagram;
    this.setActive = setActive;
    this.updateDevice = updateDevice;
    this.getPosition = getPosition;
    this.getCenterCoordinates = getCenterCoordinates;
    this.getIntersectionCoordinates = getIntersectionCoordinates;
    this.isConnectedTo = isConnectedTo;
    this.addArrowIn = addArrowIn;
    this.addArrowOut = addArrowOut;
    this.deleteArrow = deleteArrow;
    this.deleteDevice = deleteDevice;
}
