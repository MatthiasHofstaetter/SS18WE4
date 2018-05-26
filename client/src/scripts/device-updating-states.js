const update = {
    "item-generator": updateItemGenerator,
    "machine": updateMachine,
    "conveyor": updateConveyor,
    "intelligent-conveyor": updateIntelligentConveyor,
    "interim-storage": updateInterimStorage,
    "end-storage": updateStorage,
    "trash-storage": updateStorage
};

/**
 * Update the image of an item generator ("3D-Drucker")
 * @param container The jQuery container for the device
 * @param {?number} min The minimum value for the device
 * @param {?number} max The maximum value for the device
 * @param value The new value to set
 */
function updateItemGenerator(container, min, max, value) {
    const firstPlane = container.find(".firstPlane"),
        secondPlane = container.find(".secondPlane"),
        thirdPlane = container.find(".thirdPlane");

    if (!firstPlane || !secondPlane || !thirdPlane) {
        return;
    }

    switch (value) {
        case 0:
            firstPlane.show();
            secondPlane.hide();
            thirdPlane.hide();
            break;
        case 1:
            firstPlane.show();
            secondPlane.show();
            thirdPlane.hide();
            break;
        case 2:
            firstPlane.show();
            secondPlane.show();
            thirdPlane.show();
            break;
        default:
            firstPlane.hide();
            secondPlane.hide();
            thirdPlane.hide();
            break;
    }
}

/**
 * Update the image of a machine ("Maschine")
 * @param container The jQuery container for the device
 * @param {?number} min The minimum value for the device
 * @param {?number} max The maximum value for the device
 * @param value The new value to set
 */
function updateMachine(container, min, max, value) {
    const minLabel = container.find("title:contains(min_label)").parent().find("tspan"),
        maxLabel = container.find("title:contains(max_label)").parent().find("tspan"),
        minY = container.find("title:contains(max_temp)").parent().attr("y") + 1,
        maxY = container.find("title:contains(min_temp)").parent().attr("y") + 1;

    if (!minLabel || !maxLabel || !minLabel || !maxY) {
        return;
    }

    minLabel.text(min);
    maxLabel.text(max);

    const boundedValue = value <= min ? min : value <= max ? value : max;
    const div = max - min, delta = Math.abs(maxY - minY) / div;
    const y = Math.round((maxY - delta * (Math.abs(min) + boundedValue)) * 100000) / 100000;

    const path = container.find("title:contains(cur_temp)").parent();
    let d = path.attr("d");
    d = d.replace(d.split(' ')[4], y);
    path.attr("d", d);

    if (value <= max || value > max) {
        path.css("fill", "#ff0000");
    }
    if (value <= max * 2 / 3) {
        path.css("fill", "#ff6600");
    }
    if (value <= max * 1 / 3) {
        path.css("fill", "#008800");
    }
}

/**
 * Update the image of a conveyor ("Förderband")
 * @param container The jQuery container for the device
 * @param {?number} min The minimum value for the device
 * @param {?number} max The maximum value for the device
 * @param value The new value to set
 */
function updateConveyor(container, min, max, value) {
    const packageItem = container.find(".package");

    if (!packageItem) {
        return;
    }

    if (value) {
        packageItem.show();
    } else {
        packageItem.hide();
    }
}

/**
 * Update the image of an intelligent conveyor ("Intelligentes Förderband")
 * @param container The jQuery container for the device
 * @param {?number} min The minimum value for the device
 * @param {?number} max The maximum value for the device
 * @param value The new value to set
 */
function updateIntelligentConveyor(container, min, max, value) {
    const packageLeft = container.find(".packageLeft"),
        packageRight = container.find(".packageRight");

    if (!packageLeft || !packageRight) {
        return;
    }

    if (value) {
        packageLeft.show();
        packageRight.show();
    } else {
        packageLeft.hide();
        packageRight.hide();
    }
}

/**
 * Update the image of an interim storage ("Temporäres Lager")
 * @param container The jQuery container for the device
 * @param {?number} min The minimum value for the device
 * @param {?number} max The maximum value for the device
 * @param value The new value to set
 */
function updateInterimStorage(container, min, max, value) {
    const packageBottom = container.find(".packageBottom"),
        packageTop = container.find(".packageTop");

    if (!packageBottom || !packageTop) {
        return;
    }

    if (value <= min) {
        packageBottom.hide();
        packageTop.hide();
    } else if (value < max / 2) {
        packageBottom.show();
        packageTop.hide();
    } else {
        packageBottom.show();
        packageTop.show();
    }
}

/**
 * Update the image of an end storage ("Endlager") or a trash storage ("Mülllager")
 * @param container The jQuery container for the device
 * @param {?number} min The minimum value for the device
 * @param {?number} max The maximum value for the device
 * @param value The new value to set
 */
function updateStorage(container, min, max, value) {
    const amount = container.find("title:contains(amount)").parent().find("tspan");

    if (!amount) {
        return;
    }

    const boundedValue = value <= min ? min : value <= max ? value : max;
    amount.html(boundedValue);
}
