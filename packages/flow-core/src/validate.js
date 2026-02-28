"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFlow = validateFlow;
function validateFlow(flow) {
    const errors = [];
    const triggers = flow.nodes.filter(n => n.type === "trigger");
    if (triggers.length !== 1) {
        errors.push({ code: "TRIGGER_COUNT", message: "Debe existir exactamente 1 Trigger." });
    }
    return errors;
}
