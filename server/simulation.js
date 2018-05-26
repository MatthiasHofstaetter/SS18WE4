/*jslint node: true */
/*jslint esversion: 6*/

const interval = 3000; // 3 seconds
const connectionTable = {
    "item-generator": ["machine"],
    "machine": ["conveyor", "intelligent-conveyor", "trash-storage"],
    "conveyor": ["interim-storage"],
    "intelligent-conveyor": ["interim-storage", "end-storage", "trash-storage"],
    "interim-storage": ["end-storage", "trash-storage"],
    "end-storage": [],
    "trash-storage": []
};

module.exports = {
    simulateSmartProduction: function(devices, refreshCallback) {
        "use strict";
        setInterval(simulate, interval);

        function checkIfProductionChainIsValid() {
            return Object.entries(devices).every(([key, device]) => {
                const possibleSuccessors = connectionTable[device.type];
                if (!(possibleSuccessors instanceof Array)) {
                    return true;
                }

                if (device.successors.length === 0 && possibleSuccessors.length !== 0) {
                    // Types with a non-empty possibleSuccessors array must have at least one successor
                    return false;
                }

                // All successors must be possible successors
                return device.successors.every(index => possibleSuccessors.includes(devices[index].type));
            });
        }

        function simulate() {
            if (!checkIfProductionChainIsValid()) {
                console.log("Production chain is invalid, skipping simulation");
            } else {
                console.log("Running simulation iteration");

                resetAllOneCycleDevices();
                Object.entries(devices).forEach(([key, device]) => {
                    const control = device.control;
                    switch (control.type) {
                        case "boolean":
                            if (control.current) {
                                updateSuccessor(selectRandomSuccessor(device.successors));
                            }
                            break;
                        case "enum":
                            if (control.current === control.values.length - 1) {
                                updateSuccessor(selectRandomSuccessor(device.successors));
                            }
                            break;
                        case "continuous":
                            if (device.type === "machine") {
                                let successor = null;
                                if (control.current < (control.max * 2 / 3) && control.current > 0) {
                                    const nonTrashSuccessors = device.successors.filter(successor => {
                                        return devices[successor].type !== "trash-storage";
                                    });
                                    successor = selectRandomSuccessor(nonTrashSuccessors);
                                } else if (control.current >= (control.max * 2 / 3)) {
                                    const trashSuccessors = device.successors.filter(successor => {
                                        return devices[successor].type === "trash-storage";
                                    });
                                    successor = selectRandomSuccessor(trashSuccessors);
                                }
                                updateSuccessor(successor);
                            } else if (control.current > 0) {
                                let successor = selectRandomSuccessor(device.successors);
                                if (successor) {
                                    updateSuccessor(successor);
                                    control.current--;
                                }
                            }
                            break;
                    }

                    if (device.type === "item-generator") {
                        updateSuccessor(device);
                    }
                });
            }
        }

        function resetAllOneCycleDevices() {
            Object.entries(devices).forEach(([key, device]) => {
                const control = device.control, type = device.type;
                if (control.current && (type === "machine" || type === "conveyor" || type === "intelligent-conveyor")) {
                    control.current = 0;
                    refreshCallback(device.index, control.current);
                }
            });
        }

        function selectRandomSuccessor(successors) {
            if (!successors.length) {
                return null;
            }
            const index = successors[Math.floor(Math.random() * successors.length)];
            return devices[index];
        }

        function updateSuccessor(device) {
            if (!device) {
                return;
            }

            switch (device.control.type) {
                case "enum":
                    updateEnumValues(device);
                    break;
                case "boolean":
                    updateBooleanValue(device);
                    break;
                case "continuous":
                    updateContinuousValue(device);
                    break;
                default:
                    return;
            }

            refreshCallback(device.index, device.control.current);
        }

        function updateBooleanValue(device) {
            device.control.current = 1;
        }

        function updateEnumValues(device) {
            const control = device.control;
            control.current = (control.current + 1) % control.values.length;
        }

        function updateContinuousValue(device) {
            const control = device.control;
            if (device.type === "machine") {
                control.current = control.min + Math.ceil(Math.random() * (control.max - control.min));
            } else {
                control.current = control.current < control.max ? control.current + 1 : control.min;
            }
        }
    }
};
