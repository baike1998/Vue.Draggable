import { capitalize, camelize } from "../util/string";
import { events, isReadOnlyEvent } from "./sortableEvents";

function isHtmlAttribute(value) {
  return ["id", "class"].includes(value) || value.startsWith("data-");
}

function project(entries) {
  return entries.reduce((res, [key, value]) => {
    res[key] = value;
    return res;
  }, {});
}

function getComponentAttributes({ $attrs, componentData }) {
  const attributes = project(
    Object.entries($attrs).filter(([key, _]) => isHtmlAttribute(key))
  );
  if (!componentData) {
    return attributes;
  }
  const { on, props, attrs } = componentData;
  Object.entries(on || {}).forEach(([key, value]) => {
    attributes[`on${capitalize(key)}`] = value;
  });
  return {
    ...attributes,
    ...attrs,
    ...props
  };
}

function createSortableOption({ $attrs, callBackBuilder }) {
  const options = project(getValidSortableEntries($attrs));
  Object.entries(callBackBuilder).forEach(([eventType, eventBuilder]) => {
    events[eventType].forEach(event => {
      options[`on${event}`] = eventBuilder(event);
    });
  });
  return {
    draggable: ">*",
    ...options
  };
}

function getValidSortableEntries(value) {
  return Object.entries(value)
    .filter(([key, _]) => !isHtmlAttribute(key))
    .map(([key, value]) => [camelize(key), value])
    .filter(([key, _]) => !isReadOnlyEvent(key));
}

export {
  getComponentAttributes,
  createSortableOption,
  getValidSortableEntries
};