/**
 * Class for the complete diagram
 * @param callbacks The object containing callbacks for the diagram
 * @param areaEl The DOM element for the area
 * @param arrowButtonEl The DOM element for the arrow button
 * @param contextEl The DOM element for the context menu
 * @param arrowReferenceEl The DOM element for the arrow reference
 * @class
 */
function Diagram(callbacks, areaEl, arrowButtonEl, contextEl, arrowReferenceEl) {
    "use strict";
    const _this = this;

    /**
     * The jQuery object containing the diagram wrapper
     * @const
     */
    this.area = $(areaEl);

    /**
     * The jQuery object containing the arrow button in the sidebar
     */
    const arrowButton = $(arrowButtonEl);

    /**
     * The jQuery object containing the arrows svg area
     * @const
     */
    this.arrows = this.area.find(".arrows svg");

    /**
     * The jQuery object containing the device list
     * @const
     */
    this.devices = this.area.find(".devices");

    /**
     * The jQuery object containing the context menu
     */
    const context = $(contextEl);

    /**
     * The jQuery object containing the arrow reference
     * @const
     */
    this.arrowReference = $(arrowReferenceEl);

    /**
     * True iff a click on a device should start a new arrow
     * @member {boolean}
     */
    let startArrow = false;

    /**
     * The temporary arrow when drawing
     * @member {Arrow}
     */
    let drawingArrow = null;

    /**
     * The currently selected device
     * @member {Device}
     */
    let selectedDevice = null;

    /**
     * The currently selected arrow
     * @member {Arrow}
     */
    let selectedArrow = null;

    /**
     * The index of the last added device
     * @member {number}
     */
    let lastDeviceIndex = 0;

    // Initialize events
    attachEventHandlers();

    callbacks.initDevices(device => {
        device.setDiagram(this);
        if (device.index > lastDeviceIndex) {
            lastDeviceIndex = device.index;
        }
    });
    callbacks.initArrows(arrow => {
        arrow.setDiagram(this);
        arrow.add();
        arrow.updateArrow();
    });

    /**
     * Add the event handlers for the diagram
     */
    function attachEventHandlers() {
        // Deactivate the default browser context menu within the diagram
        _this.area.contextmenu(event => event.preventDefault());

        $(window).resize(() => {
            _this.area.find(".device").draggable({disabled: $(window).width() < 768});
        });

        // Update the currently drawn arrow's endpoint on mouse movement
        _this.area.mousemove(event => {
            if (drawingArrow) {
                drawingArrow.updateEndPosition(getRelativeCoordinates(event.pageX, event.pageY));
            }
        });

        // Enable the diagram area to be droppable
        _this.area.droppable({
            tolerance: "fit",
            drop: addDevice
        });

        // Toggle arrow drawing when clicking on the arrow button
        arrowButton.mousedown(event => {
            event.stopPropagation();
            toggleArrowActive()
        });

        context.mousedown(event => event.stopPropagation());

        // Remove context menu and active marker when clicking somewhere within the body
        $("body").mousedown(() => {
            context.hide();
            selectDevice(null);
            selectArrow(null);
            deactivateArrowDrawing();
        });

        // Listen to shortcut keys
        $("html").keyup(event => {
            if ($("input, select").has($(event.target)).length) {
                // Don't execute key handler when inside an input element
                return;
            }

            switch (event.keyCode) {
                case 46:
                    // Del (ENTF) pressed
                    deleteSelectedArrow();
                    deleteSelectedDevice();
                    break;
                case 65:
                    // a,A pressed
                    toggleArrowActive();
                    break;
            }
        });

        context.find(".contextView").click(event => {
            event.preventDefault();
            context.hide();
            if (selectedDevice) {
                showDeviceDetails(selectedDevice);
            }
        });

        context.find(".contextDelete").click(event => {
            event.preventDefault();
            context.hide();
            deleteSelectedDevice();
        });
    }

    /**
     * Remove all event handlers
     */
    function destroy() {
        _this.area.off();
        _this.area.droppable("destroy");
        arrowButton.off();
        context.off();
        context.find().off();
        $("body").off();
        $("html").off();
        $(window).off();

        deactivateArrowDrawing();
        selectArrow(null);
        selectDevice(null);
    }

    /**
     * Toggle whether drawing arrows is active or not
     */
    function toggleArrowActive() {
        if (startArrow || drawingArrow) {
            deactivateArrowDrawing();
        } else {
            activateArrowDrawing();
        }
    }

    /**
     * Permanently append the currently drawn arrow to the diagram
     */
    function addArrow() {
        if (drawingArrow) {
            if (drawingArrow.add()) {
                callbacks.afterArrowAdd(drawingArrow);
            } else {
                drawingArrow.deleteArrow();
            }

            if (startArrow) {
                drawingArrow = new Arrow(drawingArrow.endDevice);
                drawingArrow.setDiagram(_this);
                startArrow = false;
            } else {
                drawingArrow = null;
                deactivateArrowDrawing();
            }
        } else {
            deactivateArrowDrawing();
        }
    }

    /**
     * Set arrow drawing to active
     */
    function activateArrowDrawing() {
        console.debug("Activating arrow drawing");

        selectArrow(null);
        selectDevice(null);

        startArrow = true;
        arrowButton.addClass("active");
        _this.area.find(".device").draggable({disabled: true});
    }

    /**
     * Set arrow drawing to inactive and delete the temporary arrow
     */
    function deactivateArrowDrawing() {
        console.debug("Deactivating arrow drawing");

        if (drawingArrow) {
            drawingArrow.deleteArrow();
            drawingArrow = null;
        }

        startArrow = false;
        arrowButton.removeClass("active");
        _this.area.find(".device").draggable({disabled: false});
    }

    /**
     * Determine the coordinates relative to the diagram area's top left corner
     *
     * @param {number} x The absolute x coordinate
     * @param {number} y The absolute y coordinate
     * @returns {number[]} An array with two elements containing the relative x and y coordinates
     */
    function getRelativeCoordinates(x, y) {
        return [
            x - _this.area.offset().left - _this.area[0].clientLeft,
            y - _this.area.offset().top - _this.area[0].clientTop
        ];
    }

    /**
     * Add a new device on dropping it onto the diagram area
     * @param event The jQuery event instance
     * @param ui The jQuery UI instance
     */
    function addDevice(event, ui) {
        if (!ui.helper.hasClass("device-in-area")) {
            // Only add if not already present in the diagram
            console.debug("Adding new device");

            const width = ui.helper.width();
            const height = ui.helper.height();
            const pos = getRelativeCoordinates(ui.offset.left, ui.offset.top);

            if (pos[0] >= 0 && pos[0] + width <= _this.area.width()
                && pos[1] >= 0 && pos[1] + height <= _this.area.height()) {
                // Init device
                const source = ui.draggable,
                    index = ++lastDeviceIndex,
                    data = JSON.parse(source.data("device")),
                    title = `${data.title} ${index}`;

                data.control.log = [];
                data.control.current = data.control.min || 0;
                const device = new Device(index, pos, data.type, title, data.control);
                device.setDiagram(_this);
                callbacks.afterDeviceAdd(device);
            }
        }
    }

    /**
     * Callback for clicking on an arrow
     * @param {Arrow} arrow the arrow instance
     */
    function arrowClick(arrow) {
        console.debug("Called click event on arrow", arrow);
        selectArrow(selectedArrow === arrow ? null : arrow);
    }

    /**
     * Callback for showing the details of a device
     * @param {Device} device
     */
    function showDeviceDetails(device) {
        callbacks.onDeviceDetails(device);
    }

    /**
     * Callback for opening the context menu for the given device
     * @param {Device} device the device instance
     * @param event The jQuery Event instance
     */
    function showContextMenu(device, event) {
        console.debug("Called context-menu event on device", device);

        selectDevice(device);
        deactivateArrowDrawing();
        context.css("left", event.pageX).css("top", event.pageY).show();
    }

    /**
     * Callback for mouse down on a device
     * @param {Device} device the device instance
     */
    function deviceMouseDown(device) {
        console.debug("Called mouse-down event on device", device);

        if (selectedDevice === device) {
            // Deselect the device if already selected
            selectDevice(null);
            if (drawingArrow) {
                drawingArrow.deleteArrow();
                drawingArrow = null;
            }
        } else {
            selectDevice(device);
            if (startArrow && !drawingArrow) {
                // Start an arrow at this device
                drawingArrow = new Arrow(device);
                drawingArrow.setDiagram(_this);
                startArrow = false;
            } else if (drawingArrow) {
                // End an arrow at this device
                drawingArrow.setEndDevice(device);
                addArrow(drawingArrow);
            }
        }
    }

    /**
     * Callback for releasing the mouse over a device (end of mouse movement)
     * @param {Device} device the device instance
     */
    function deviceMouseUp(device) {
        console.debug("Called mouse-up event on device", device);

        if (drawingArrow && drawingArrow.startDevice !== device) {
            drawingArrow.setEndDevice(device);
            addArrow(drawingArrow);
        }
    }

    /**
     * Callback for showing the details of a device
     * @param {Device} device
     */
    function deviceMove(device) {
        callbacks.onDeviceMove(device);
    }

    /**
     * Select the given arrow
     * @param {?Arrow} arrow The arrow to select, or null to unselect
     */
    function selectArrow(arrow) {
        console.debug("Selecting arrow", arrow);

        if (selectedArrow) {
            // Deselect the previously selected arrow
            selectedArrow.setActive(false);
            selectedArrow = null;
        }
        if (arrow) {
            // Select the new arrow, if given
            selectDevice(null);
            arrow.setActive(true);
            selectedArrow = arrow;
        }
    }

    /**
     * Select the given device
     * @param {?Device} device The device to select, or null to unselect
     */
    function selectDevice(device) {
        console.debug("Selecting device", device);

        if (selectedDevice) {
            // Deselect the previously selected device
            selectedDevice.setActive(false);
            selectedDevice = null;
        }
        if (device) {
            // Select the new device, if given
            selectArrow(null);
            device.setActive(true);
            selectedDevice = device;
        }
    }

    /**
     * Remove the selected arrow
     */
    function deleteSelectedArrow() {
        if (selectedArrow) {
            selectedArrow.deleteArrow();
            callbacks.afterArrowDelete(selectedArrow);
            selectedArrow = null;
        }
    }

    /**
     * Completely remove the selected device
     */
    function deleteSelectedDevice() {
        if (selectedDevice) {
            const deletedArrows = selectedDevice.deleteDevice();
            callbacks.afterDeviceDelete(selectedDevice);
            deletedArrows.forEach(arrow => callbacks.afterArrowDelete(arrow));
            selectedDevice = null;
        }
    }

    // Export some methods
    this.destroy = destroy;
    this.activateArrowDrawing = activateArrowDrawing;
    this.arrowClick = arrowClick;
    this.showDeviceDetails = showDeviceDetails;
    this.showContextMenu = showContextMenu;
    this.deviceMouseDown = deviceMouseDown;
    this.deviceMouseUp = deviceMouseUp;
    this.deviceMove = deviceMove;
}
