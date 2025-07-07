var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/astq.ts
import CacheLRU from "cache-lru";

// src/astq-adapter.js
var ASTQAdapter = class {
  constructor() {
    this._adapters = [];
    return this;
  }
  register(adapter, force = false) {
    this._adapters.unshift({ adapter, force });
    return this;
  }
  unregister(adapter) {
    if (adapter === void 0)
      this._adapters = [];
    else {
      let adapters = [];
      for (let i = 0; i < this._adapters.length; i++)
        if (this._adapters[i].adapter !== adapter)
          adapters.push(this._adapters[i]);
      this._adapters = adapters;
    }
    return this;
  }
  select(node) {
    for (let i = 0; i < this._adapters.length; i++)
      if (this._adapters[i].force || this._adapters[i].adapter.taste(node))
        return this._adapters[i].adapter;
    return void 0;
  }
};

// src/astq-adapter-xmldom.js
var ASTQAdapterXMLDOM = class {
  static taste(node) {
    return typeof Node === "object" && node !== null && node instanceof Node && typeof node === "object" && typeof node.nodeType === "number" && typeof node.nodeName === "string";
  }
  static getParentNode(node) {
    return node.parentNode;
  }
  static getChildNodes(node) {
    return typeof node.childNodes === "object" && node.childNodes !== null && node.hasChildNodes() ? Array.prototype.slice.call(node.childNodes, 0) : [];
  }
  static getNodeType(node) {
    return typeof node.nodeName === "string" ? node.nodeName : "unknown";
  }
  static getNodeAttrNames(node) {
    return typeof node.attributes === "object" && node.attributes !== null && node.hasAttributes() ? Array.prototype.slice.call(node.attributes, 0).map((n) => n.nodeName) : [];
  }
  static getNodeAttrValue(node, attr) {
    return typeof node.attributes === "object" && node.attributes !== null && node.hasAttributes() ? node.getAttribute(attr) : void 0;
  }
};

// src/astq-adapter-parse5.js
var ASTQAdapterParse5 = class {
  static taste(node) {
    return typeof node === "object" && node !== null && !(typeof Node === "object" && node instanceof Node) && typeof node.nodeName === "string" && node.nodeName !== "";
  }
  static getParentNode(node) {
    return node.parentNode;
  }
  static getChildNodes(node) {
    return typeof node.childNodes === "object" && node.childNodes instanceof Array ? node.childNodes : [];
  }
  static getNodeType(node) {
    return node.nodeName;
  }
  static getNodeAttrNames(node) {
    let attrs = ["value"];
    if (typeof node.attrs === "object" && node.attrs instanceof Array)
      attrs = attrs.concat(node.attrs.map((n) => n.name));
    return attrs;
  }
  static getNodeAttrValue(node, attr) {
    let value;
    if (attr === "value")
      value = node.value;
    else if (typeof node.attrs === "object" && node.attrs instanceof Array) {
      let values = node.attrs.filter((n) => n.name === attr).map((n) => n.value);
      if (values.length === 1)
        value = values[0];
    }
    return value;
  }
};

// src/astq-adapter-mozast.js
var ASTQAdapterMozAST = class {
  static taste(node) {
    return typeof node === "object" && node !== null && typeof node.type === "string" && node.type !== "";
  }
  static getParentNode(node, type) {
    if (type !== "*" && type !== "parent")
      throw new Error('no such axis named "' + type + '" for walking to parent nodes');
    if (typeof node.parent !== "undefined")
      return node.parent;
    else
      throw new Error("Your Mozilla SpiderMonkey AST does not support parent node traversal");
  }
  static getChildNodes(node, type) {
    let childs = [];
    let checkField = (node2, field) => {
      if (Object.prototype.hasOwnProperty.call(node2, field) && this.taste(node2[field]))
        childs.push(node2[field]);
      else if (Object.prototype.hasOwnProperty.call(node2, field) && typeof node2[field] === "object" && node2[field] instanceof Array) {
        node2[field].forEach((node3) => {
          if (this.taste(node3))
            childs.push(node3);
        });
      }
    };
    if (type === "*") {
      for (let field in node)
        checkField(node, field);
    } else {
      if (typeof node[type] !== "undefined")
        checkField(node, type);
    }
    return childs;
  }
  static getNodeType(node) {
    return node.type;
  }
  static getNodeAttrNames(node) {
    let names = [];
    for (let field in node)
      if (Object.prototype.hasOwnProperty.call(node, field) && typeof node[field] !== "object" && field !== "type" && field !== "loc")
        names.push(field);
    return names;
  }
  static getNodeAttrValue(node, attr) {
    if (Object.prototype.hasOwnProperty.call(node, attr) && typeof node[attr] !== "object" && attr !== "type" && attr !== "loc")
      return node[attr];
    else
      return void 0;
  }
};

// src/astq-adapter-graphql.js
var ASTQAdapterGraphQL = class {
  static taste(node) {
    return typeof node === "object" && node !== null && typeof node.kind === "string" && node.kind !== "";
  }
  static getParentNode(node, type) {
    throw new Error("GraphQL AST does not support parent node traversal");
  }
  static getChildNodes(node, type) {
    let childs = [];
    let checkField = (node2, field) => {
      if (Object.prototype.hasOwnProperty.call(node2, field) && this.taste(node2[field]))
        childs.push(node2[field]);
      else if (Object.prototype.hasOwnProperty.call(node2, field) && typeof node2[field] === "object" && node2[field] instanceof Array) {
        node2[field].forEach((node3) => {
          if (this.taste(node3))
            childs.push(node3);
        });
      }
    };
    if (type === "*") {
      for (let field in node)
        checkField(node, field);
    } else {
      if (typeof node[type] !== "undefined")
        checkField(node, type);
    }
    return childs;
  }
  static getNodeType(node) {
    return node.kind;
  }
  static getNodeAttrNames(node) {
    let names = [];
    for (let field in node)
      if (Object.prototype.hasOwnProperty.call(node, field) && typeof node[field] !== "object" && field !== "kind" && field !== "loc")
        names.push(field);
    return names;
  }
  static getNodeAttrValue(node, attr) {
    if (Object.prototype.hasOwnProperty.call(node, attr) && typeof node[attr] !== "object" && attr !== "kind" && attr !== "loc")
      return node[attr];
    else
      return void 0;
  }
};

// src/astq-adapter-json.js
var ASTQAdapterJSON = class {
  static taste(node) {
    return typeof node === "object" && node !== null;
  }
  static getParentNode(node, type) {
    throw new Error("JSON does not support parent node traversal");
  }
  static getChildNodes(node, type) {
    let childs = [];
    let checkField = (node2, field) => {
      if (Object.prototype.hasOwnProperty.call(node2, field) && this.taste(node2[field]))
        childs.push(node2[field]);
      else if (Object.prototype.hasOwnProperty.call(node2, field) && typeof node2[field] === "object" && node2[field] instanceof Array) {
        node2[field].forEach((node3) => {
          if (this.taste(node3))
            childs.push(node3);
        });
      }
    };
    if (type === "*") {
      for (let field in node)
        checkField(node, field);
    } else {
      if (typeof node[type] !== "undefined")
        checkField(node, type);
    }
    return childs;
  }
  static getNodeType(node) {
    if (node === null)
      return "Null";
    else if (node instanceof Boolean)
      return "Boolean";
    else if (node instanceof Number)
      return "Number";
    else if (node instanceof String)
      return "String";
    else if (typeof node === "object") {
      if (node instanceof Array)
        return "Array";
      else if (typeof node.constructor === "function" && typeof node.constructor.name === "string")
        return node.constructor.name;
      else
        return "Object";
    } else
      return "Unknown";
  }
  static getNodeAttrNames(node) {
    let names = [];
    for (let field in node)
      if (Object.prototype.hasOwnProperty.call(node, field) && typeof node[field] !== "object")
        names.push(field);
    return names;
  }
  static getNodeAttrValue(node, attr) {
    if (Object.prototype.hasOwnProperty.call(node, attr) && typeof node[attr] !== "object")
      return node[attr];
    else
      return void 0;
  }
};

// src/astq-adapter-cheerio.js
var ASTQAdapterCheerio = class {
  static taste(node) {
    return typeof node === "object" && node !== null && (!(typeof Element === "object" && node instanceof Element) && typeof node.tagName === "string" && node.tagName !== "" || !(typeof Document === "object" && node instanceof Document) && typeof node.type === "string" && node.type === "root");
  }
  static getParentNode(node) {
    return node.parentNode;
  }
  static getChildNodes(node) {
    return typeof node.childNodes === "object" && node.childNodes instanceof Array ? node.childNodes : [];
  }
  static getNodeType(node) {
    return node.tagName || `#${node.type || "unknown"}`;
  }
  static getNodeAttrNames(node) {
    let attrs = ["value"];
    if (typeof node.attribs === "object")
      attrs = attrs.concat(Object.keys(node.attribs));
    return attrs;
  }
  static getNodeAttrValue(node, attr) {
    let value;
    if (attr === "value")
      value = node.nodeValue;
    else if (typeof node.attribs === "object")
      value = node.attribs[attr];
    return value;
  }
};

// src/astq-adapter-unist.js
var ASTQAdapterUniST = class {
  static taste(node) {
    return typeof node === "object" && node !== null && typeof node.type === "string" && node.type !== "";
  }
  static getParentNode(node) {
    if (typeof node.parent === "object" && node.parent !== null)
      return node.parent;
    else
      throw new Error("Your UniST AST does not support parent node traversal");
  }
  static getChildNodes(node) {
    return typeof node.children === "object" && node.children instanceof Array ? node.children : [];
  }
  static getNodeType(node) {
    return node.type;
  }
  static getNodeAttrNames(node) {
    const attrs = [];
    for (const attr in node)
      if (Object.prototype.hasOwnProperty.call(node, attr) && attr !== "type" && attr !== "data" && attr !== "position" && attr !== "children" && typeof node[attr] !== "object")
        attrs.push(attr);
    return attrs;
  }
  static getNodeAttrValue(node, attr) {
    if (Object.prototype.hasOwnProperty.call(node, attr) && attr !== "type" && attr !== "data" && attr !== "position" && attr !== "children" && typeof node[attr] !== "object")
      return node[attr];
    else
      return void 0;
  }
};

// src/astq-adapter-asty.js
var ASTQAdapterASTY = class {
  static taste(node) {
    return typeof node === "object" && node !== null && typeof node.ASTy === "boolean";
  }
  static getParentNode(node) {
    return node.parent();
  }
  static getChildNodes(node) {
    return node.childs();
  }
  static getNodeType(node) {
    return node.type();
  }
  static getNodeAttrNames(node) {
    return node.attrs();
  }
  static getNodeAttrValue(node, attr) {
    return node.get(attr);
  }
};

// src/astq-funcs.js
var ASTQFuncs = class {
  constructor() {
    this._funcs = {};
    return this;
  }
  register(name, func) {
    this._funcs[name] = func;
  }
  run(name, args) {
    let func = this._funcs[name];
    if (typeof func !== "function")
      throw new Error('invalid function "' + name + '"');
    return func.apply(null, args);
  }
};

// src/astq-funcs-std.js
var pos = (A, T) => {
  let parent = A.getParentNode(T, "*");
  if (parent === null)
    return 1;
  let pchilds = A.getChildNodes(parent, "*");
  for (let i = 0; i < pchilds.length; i++)
    if (pchilds[i] === T)
      return i + 1;
  throw new Error("cannot find myself");
};
var parents = (A, T) => {
  let parents2 = [];
  while ((T = A.getParentNode(T, "*")) !== null)
    parents2.push(T);
  return parents2;
};
var stdfuncs = {
  /*  type name of node  */
  "type": (A, T) => {
    return A.getNodeType(T);
  },
  /*  attribute names of node  */
  "attrs": (A, T, sep) => {
    if (sep === void 0)
      sep = " ";
    return sep + A.getNodeAttrNames(T).join(sep) + sep;
  },
  /*  depth of node in tree  */
  "depth": (A, T) => {
    let depth = 1;
    let node = T;
    while ((node = A.getParentNode(node, "*")) !== null)
      depth++;
    return depth;
  },
  /*  return position of node between siblings  */
  "pos": (A, T) => {
    return pos(A, T);
  },
  /*  check position of node between siblings  */
  "nth": (A, T, num) => {
    num = parseInt(num, 10);
    let parent = A.getParentNode(T, "*");
    if (parent !== null) {
      let pchilds = A.getChildNodes(parent, "*");
      if (num < 0)
        num = pchilds.length - (num + 1);
      for (let i = 0; i < pchilds.length; i++)
        if (pchilds[i] === T)
          return i + 1 === num;
      return false;
    } else if (num === 1)
      return true;
    else
      return false;
  },
  /*  check position of node to be first of siblings  */
  "first": (A, T) => {
    return stdfuncs.nth(A, T, 1);
  },
  /*  check position of node to be last of siblings  */
  "last": (A, T) => {
    return stdfuncs.nth(A, T, -1);
  },
  /*  count number of keys/elements/characters/etc  */
  "count": (A, T, val) => {
    if (typeof val === "object" && val instanceof Array)
      return val.length;
    else if (typeof val === "object")
      return Object.keys(val).length;
    else if (typeof val === "string")
      return val.length;
    else
      return String(val).length;
  },
  /*  check whether node is below another  */
  "below": (A, T, other) => {
    if (!A.taste(other))
      throw new Error('invalid argument to function "below" (node expected)');
    let node = T;
    while ((node = A.getParentNode(node, "*")) !== null)
      if (node === other)
        return true;
    return false;
  },
  /*  check whether node follows another  */
  "follows": (A, T, other) => {
    if (!A.taste(other))
      throw new Error('invalid argument to function "follows" (node expected)');
    if (T === other)
      return false;
    let pathOfT = [T].concat(parents(A, T)).reverse();
    let pathOfOther = [other].concat(parents(A, other)).reverse();
    let len = Math.min(pathOfT.length, pathOfOther.length);
    let i;
    for (i = 0; i < len; i++)
      if (pathOfT[i] !== pathOfOther[i])
        break;
    if (i === 0)
      throw new Error("internal error: root nodes have to be same same");
    else if (i === len) {
      if (pathOfOther.length < pathOfT.length)
        return true;
      else
        return false;
    } else
      return pos(A, pathOfT[i]) > pos(A, pathOfOther[i]);
  },
  /*  check whether node is in a list of nodes  */
  "in": (A, T, val) => {
    if (!(typeof val === "object" && val instanceof Array))
      throw new Error('invalid argument to function "in" (array expected)');
    for (let i = 0; i < val.length; i++)
      if (val[i] === T)
        return true;
    return false;
  },
  /*  retrieve a sub-string  */
  "substr": (A, T, str, pos2, len) => {
    return String(str).substr(pos2, len);
  },
  /*  retrieve index of a sub-string  */
  "index": (A, T, str, sub, from) => {
    return String(str).indexOf(sub, from);
  },
  /*  remove whitespaces at begin and end of string  */
  "trim": (A, T, str) => {
    return String(str).trim();
  },
  /*  convert string to lower-case  */
  "lc": (A, T, str) => {
    return String(str).toLowerCase();
  },
  /*  convert string to upper-case  */
  "uc": (A, T, str) => {
    return String(str).toUpperCase();
  }
};
var astq_funcs_std_default = stdfuncs;

// src/astq-query.js
import ASTY from "asty";
import PEGUtil from "pegjs-util";

// src/astq-util.js
var ASTQUtil = class {
  /*  pad a string with spaces to the left/right  */
  static pad(str, num) {
    let n = num < 0 ? -num : num;
    if (str.length > n)
      str = str.substr(0, n);
    else {
      let pad = Array(n + 1 - str.length).join(" ");
      str = num < 0 ? str + pad : pad + str;
    }
    return str;
  }
  /*  check whether value is "true" (or can be considered to be true)  */
  static truthy(value) {
    let result;
    switch (typeof value) {
      case "boolean":
        result = value;
        break;
      case "number":
        result = value !== 0 && !isNaN(value);
        break;
      case "string":
        result = value !== "";
        break;
      case "object":
        result = false;
        if (value !== null) {
          result = true;
          if (value instanceof Array)
            result = value.length > 0;
        }
        break;
      default:
        result = false;
    }
    return result;
  }
  /*  coerce value to particular type  */
  static coerce(value, type) {
    if (typeof value !== type) {
      try {
        switch (type) {
          case "boolean":
            if (typeof value === "object" && value instanceof Array)
              value = value.length !== 0;
            else if (typeof value !== "boolean")
              value = Boolean(value);
            break;
          case "number":
            if (typeof value === "object" && value instanceof Array)
              value = value.length;
            else if (typeof value !== "number")
              value = Number(value);
            break;
          case "string":
            if (typeof value !== "string")
              value = String(value);
            break;
          case "regexp":
            if (!(typeof value === "object" && value instanceof RegExp))
              value = new RegExp(value);
            break;
        }
      } catch (e) {
        throw new Error("cannot coerce value into type " + type);
      }
    }
    return value;
  }
};

// src/astq-query-trace.js
var ASTQQueryTrace = class {
  /*  determine output prefix based on tree depth  */
  prefixOf(Q, T) {
    let depth = 0;
    let node = Q;
    while ((node = node.parent()) !== null)
      depth++;
    let prefix1 = ASTQUtil.pad("", 4 * depth);
    depth = 0;
    node = T;
    while ((node = this.adapter.getParentNode(node, "*")) !== null)
      depth++;
    let prefix2 = ASTQUtil.pad("", 4 * depth);
    return { prefix1, prefix2 };
  }
  /*  begin tracing step  */
  traceBegin(Q, T) {
    if (!this.trace)
      return;
    let { prefix1, prefix2 } = this.prefixOf(Q, T);
    console.log("ASTQ: execute: | " + ASTQUtil.pad(prefix1 + Q.type() + " (", -60) + " | " + prefix2 + this.adapter.getNodeType(T));
  }
  /*  end tracing step  */
  traceEnd(Q, T, val) {
    if (!this.trace)
      return;
    let { prefix1, prefix2 } = this.prefixOf(Q, T);
    let result;
    if (val === void 0)
      result = "undefined";
    else if (typeof val === "object" && val instanceof Array) {
      result = "[";
      val.forEach((node) => {
        result += "node(" + this.adapter.getNodeType(node) + "),";
      });
      result = result.replace(/,$/, "") + "]";
    } else
      result = typeof val + "(" + val + ")";
    if (result.length > 60)
      result = result.substr(0, 60) + "...";
    console.log("ASTQ: execute: | " + ASTQUtil.pad(prefix1 + "): " + result, -60) + " | " + prefix2 + this.adapter.getNodeType(T));
  }
};

// src/astq-query-exec.js
var ASTQQueryExec = class extends ASTQQueryTrace {
  constructor(adapter, params, funcs, trace) {
    super();
    this.adapter = adapter;
    this.params = params;
    this.funcs = funcs;
    this.trace = trace;
  }
  execQuery(Q, T) {
    this.traceBegin(Q, T);
    let output = [];
    Q.childs().forEach((Q2) => {
      output = output.concat(this.execPath(Q2, T));
    });
    this.traceEnd(Q, T, output);
    return output;
  }
  execPath(Q, T) {
    this.traceBegin(Q, T);
    let nodes = [T];
    let result = [];
    let resultExplicit = false;
    Q.childs().forEach((Q2) => {
      let output = [];
      nodes.forEach((T2) => {
        output = output.concat(this.execStep(Q2, T2));
      });
      nodes = output;
      if (Q2.get("isResult")) {
        resultExplicit = true;
        result = result.concat(nodes);
      }
    });
    this.traceEnd(Q, T, nodes);
    return resultExplicit ? result : nodes;
  }
  execStep(Q, T) {
    this.traceBegin(Q, T);
    let childs = Q.childs();
    let axis = null;
    let match = null;
    let filter = null;
    let i = 0;
    if (i < childs.length && childs[i].type() === "Axis")
      axis = childs[i++];
    if (i < childs.length && childs[i].type() === "Match")
      match = childs[i++];
    if (i < childs.length && childs[i].type() === "Filter")
      filter = childs[i++];
    if (match === null)
      throw new Error("no matching part in query step");
    let nodes = [];
    let id = match.get("id");
    let matchAndTake = (T2) => {
      let type = this.adapter.getNodeType(T2);
      if (id === "*" || id === type) {
        let take = true;
        if (filter !== null) {
          if (!this.execFilter(filter, T2))
            take = false;
        }
        if (take)
          nodes.push(T2);
      }
    };
    if (axis !== null) {
      let op = axis.get("op");
      let t = axis.get("type");
      if (op === "/") {
        this.adapter.getChildNodes(T, t).forEach((T2) => matchAndTake(T2));
      } else if (op === "//") {
        let walk = (T2) => {
          matchAndTake(T2);
          this.adapter.getChildNodes(T2, t).forEach((T3) => walk(T3));
        };
        this.adapter.getChildNodes(T, t).forEach((T2) => walk(T2));
      } else if (op === "./") {
        matchAndTake(T);
        this.adapter.getChildNodes(T, t).forEach((T2) => matchAndTake(T2));
      } else if (op === ".//") {
        matchAndTake(T);
        let walk = (T2) => {
          matchAndTake(T2);
          this.adapter.getChildNodes(T2, t).forEach((T3) => walk(T3));
        };
        this.adapter.getChildNodes(T, t).forEach((T2) => walk(T2));
      } else if (op === "-/") {
        let parent = this.adapter.getParentNode(T, "*");
        if (parent !== null) {
          let pchilds = this.adapter.getChildNodes(parent, t);
          let leftSibling = null;
          for (let i2 = 0; i2 < pchilds.length; i2++) {
            if (pchilds[i2] === T)
              break;
            leftSibling = pchilds[i2];
          }
          if (leftSibling !== null)
            matchAndTake(leftSibling);
        }
      } else if (op === "-//") {
        let parent = this.adapter.getParentNode(T, "*");
        if (parent !== null) {
          let pchilds = this.adapter.getChildNodes(parent, t);
          let i2 = 0;
          for (; i2 < pchilds.length; i2++)
            if (pchilds[i2] === T)
              break;
          for (i2--; i2 >= 0; i2--)
            matchAndTake(pchilds[i2]);
        }
      } else if (op === "+/") {
        let parent = this.adapter.getParentNode(T, "*");
        if (parent !== null) {
          let pchilds = this.adapter.getChildNodes(parent, t);
          let i2;
          for (i2 = 0; i2 < pchilds.length; i2++)
            if (pchilds[i2] === T)
              break;
          if (i2 < pchilds.length)
            matchAndTake(pchilds[++i2]);
        }
      } else if (op === "+//") {
        let parent = this.adapter.getParentNode(T, "*");
        if (parent !== null) {
          let pchilds = this.adapter.getChildNodes(parent, t);
          let i2;
          for (i2 = 0; i2 < pchilds.length; i2++)
            if (pchilds[i2] === T)
              break;
          if (i2 < pchilds.length)
            for (i2++; i2 < pchilds.length; i2++)
              matchAndTake(pchilds[i2]);
        }
      } else if (op === "~/") {
        let parent = this.adapter.getParentNode(T, "*");
        if (parent !== null) {
          let pchilds = this.adapter.getChildNodes(parent, t);
          let i2;
          for (i2 = 0; i2 < pchilds.length; i2++)
            if (pchilds[i2] === T)
              break;
          if (i2 > 0)
            matchAndTake(pchilds[i2 - 1]);
          if (i2 < pchilds.length - 1)
            matchAndTake(pchilds[i2 + 1]);
        }
      } else if (op === "~//") {
        let parent = this.adapter.getParentNode(T, "*");
        if (parent !== null) {
          let pchilds = this.adapter.getChildNodes(parent, t);
          for (let i2 = 0; i2 < pchilds.length; i2++)
            if (pchilds[i2] !== T)
              matchAndTake(pchilds[i2]);
        }
      } else if (op === "../") {
        let parent = this.adapter.getParentNode(T, t);
        if (parent !== null)
          matchAndTake(parent);
      } else if (op === "..//") {
        let node = T;
        for (; ; ) {
          let parent = this.adapter.getParentNode(node, t);
          if (parent === null)
            break;
          matchAndTake(parent);
          node = parent;
        }
      } else if (op === "<//") {
        let ctx = { sentinel: T, take: true };
        for (; ; ) {
          let parent = this.adapter.getParentNode(T, "*");
          if (parent === null)
            break;
          T = parent;
        }
        let walk = (T2) => {
          if (T2 === ctx.sentinel)
            ctx.take = false;
          if (ctx.take)
            matchAndTake(T2);
          if (ctx.take)
            this.adapter.getChildNodes(T2, t).forEach((T3) => walk(T3));
        };
        if (T !== ctx.sentinel) {
          matchAndTake(T);
          this.adapter.getChildNodes(T, t).forEach((T2) => walk(T2));
        }
        nodes = nodes.reverse();
      } else if (op === ">//") {
        let ctx = { sentinel: T, take: false };
        for (; ; ) {
          let parent = this.adapter.getParentNode(T, "*");
          if (parent === null)
            break;
          T = parent;
        }
        let walk = (T2) => {
          if (ctx.take)
            matchAndTake(T2);
          if (T2 === ctx.sentinel)
            ctx.take = true;
          this.adapter.getChildNodes(T2, t).forEach((T3) => walk(T3));
        };
        this.adapter.getChildNodes(T, t).forEach((T2) => walk(T2));
      }
    } else
      matchAndTake(T);
    this.traceEnd(Q, T, nodes);
    return nodes;
  }
  execFilter(Q, T) {
    this.traceBegin(Q, T);
    let expr = Q.childs()[0];
    let result = this.execExpr(expr, T);
    result = ASTQUtil.truthy(result);
    this.traceEnd(Q, T, result);
    return result;
  }
  execExpr(Q, T) {
    switch (Q.type()) {
      case "ConditionalBinary":
        return this.execExprConditionalBinary(Q, T);
      case "ConditionalTernary":
        return this.execExprConditionalTernary(Q, T);
      case "Logical":
        return this.execExprLogical(Q, T);
      case "Bitwise":
        return this.execExprBitwise(Q, T);
      case "Relational":
        return this.execExprRelational(Q, T);
      case "Arithmetical":
        return this.execExprArithmetical(Q, T);
      case "Unary":
        return this.execExprUnary(Q, T);
      case "FuncCall":
        return this.execExprFuncCall(Q, T);
      case "Attribute":
        return this.execExprAttribute(Q, T);
      case "Param":
        return this.execExprParam(Q, T);
      case "LiteralString":
        return this.execExprLiteralString(Q, T);
      case "LiteralRegExp":
        return this.execExprLiteralRegExp(Q, T);
      case "LiteralNumber":
        return this.execExprLiteralNumber(Q, T);
      case "LiteralValue":
        return this.execExprLiteralValue(Q, T);
      case "Path":
        return this.execExprPath(Q, T);
    }
  }
  execExprConditionalBinary(Q, T) {
    this.traceBegin(Q, T);
    let result = this.execExpr(Q.childs()[0], T);
    if (!ASTQUtil.truthy(result))
      result = this.execExpr(Q.childs()[1], T);
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprConditionalTernary(Q, T) {
    this.traceBegin(Q, T);
    let result = this.execExpr(Q.childs()[0], T);
    if (ASTQUtil.truthy(result))
      result = this.execExpr(Q.childs()[1], T);
    else
      result = this.execExpr(Q.childs()[2], T);
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprLogical(Q, T) {
    this.traceBegin(Q, T);
    let result = false;
    switch (Q.get("op")) {
      case "&&":
        result = ASTQUtil.truthy(this.execExpr(Q.childs()[0], T));
        if (result)
          result = result && ASTQUtil.truthy(this.execExpr(Q.childs()[1], T));
        break;
      case "||":
        result = ASTQUtil.truthy(this.execExpr(Q.childs()[0], T));
        if (!result)
          result = result || ASTQUtil.truthy(this.execExpr(Q.childs()[1], T));
        break;
    }
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprBitwise(Q, T) {
    this.traceBegin(Q, T);
    let v1 = ASTQUtil.coerce(this.execExpr(Q.childs()[0], T), "number");
    let v2 = ASTQUtil.coerce(this.execExpr(Q.childs()[1], T), "number");
    let result;
    switch (Q.get("op")) {
      case "&":
        result = v1 & v2;
        break;
      case "|":
        result = v1 | v2;
        break;
      case "<<":
        result = v1 << v2;
        break;
      case ">>":
        result = v1 >> v2;
        break;
    }
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprRelational(Q, T) {
    this.traceBegin(Q, T);
    let v1 = this.execExpr(Q.childs()[0], T);
    let v2 = this.execExpr(Q.childs()[1], T);
    let result;
    switch (Q.get("op")) {
      case "==":
        result = v1 === v2;
        break;
      case "!=":
        result = v1 !== v2;
        break;
      case "<=":
        result = ASTQUtil.coerce(v1, "number") <= ASTQUtil.coerce(v2, "number");
        break;
      case ">=":
        result = ASTQUtil.coerce(v1, "number") >= ASTQUtil.coerce(v2, "number");
        break;
      case "<":
        result = ASTQUtil.coerce(v1, "number") < ASTQUtil.coerce(v2, "number");
        break;
      case ">":
        result = ASTQUtil.coerce(v1, "number") > ASTQUtil.coerce(v2, "number");
        break;
      case "=~":
        result = ASTQUtil.coerce(v1, "string").match(ASTQUtil.coerce(v2, "regexp")) !== null;
        break;
      case "!~":
        result = ASTQUtil.coerce(v1, "string").match(ASTQUtil.coerce(v2, "regexp")) === null;
        break;
    }
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprArithmetical(Q, T) {
    this.traceBegin(Q, T);
    let v1 = this.execExpr(Q.childs()[0], T);
    let v2 = this.execExpr(Q.childs()[1], T);
    let result;
    switch (Q.get("op")) {
      case "+":
        if (typeof v1 === "string")
          result = v1 + ASTQUtil.coerce(v2, "string");
        else
          result = ASTQUtil.coerce(v1, "number") + ASTQUtil.coerce(v2, "number");
        break;
      case "-":
        result = ASTQUtil.coerce(v1, "number") + ASTQUtil.coerce(v2, "number");
        break;
      case "*":
        result = ASTQUtil.coerce(v1, "number") * ASTQUtil.coerce(v2, "number");
        break;
      case "/":
        result = ASTQUtil.coerce(v1, "number") / ASTQUtil.coerce(v2, "number");
        break;
      case "%":
        result = ASTQUtil.coerce(v1, "number") % ASTQUtil.coerce(v2, "number");
        break;
      case "**":
        result = Math.pow(ASTQUtil.coerce(v1, "number"), ASTQUtil.coerce(v2, "number"));
        break;
    }
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprUnary(Q, T) {
    this.traceBegin(Q, T);
    let v = this.execExpr(Q.childs()[0], T);
    let result;
    switch (Q.get("op")) {
      case "!":
        result = !ASTQUtil.coerce(v, "boolean");
        break;
      case "~":
        result = ~ASTQUtil.coerce(v, "number");
        break;
    }
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprFuncCall(Q, T) {
    this.traceBegin(Q, T);
    let id = Q.get("id");
    let args = [this.adapter, T];
    Q.childs().forEach((Q2) => {
      args.push(this.execExpr(Q2, T));
    });
    let result = this.funcs.run(id, args);
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprAttribute(Q, T) {
    this.traceBegin(Q, T);
    let id = Q.get("id");
    let result = this.adapter.getNodeAttrValue(T, id);
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprParam(Q, T) {
    this.traceBegin(Q, T);
    let id = Q.get("id");
    if (typeof this.params[id] === "undefined")
      throw new Error('invalid parameter "' + id + '"');
    let result = this.params[id];
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprLiteralString(Q, T) {
    this.traceBegin(Q, T);
    let result = Q.get("value");
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprLiteralRegExp(Q, T) {
    this.traceBegin(Q, T);
    let result = Q.get("value");
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprLiteralNumber(Q, T) {
    this.traceBegin(Q, T);
    let result = Q.get("value");
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprLiteralValue(Q, T) {
    this.traceBegin(Q, T);
    let result = Q.get("value");
    this.traceEnd(Q, T, result);
    return result;
  }
  execExprPath(Q, T) {
    this.traceBegin(Q, T);
    let result = this.execPath(Q, T);
    this.traceEnd(Q, T, result);
    return result;
  }
};

// src/astq-query.js
var PEG = __require("pegjs-otf");
var ASTQQueryParse = PEG.generateFromFile(
  /* eslint n/no-path-concat: off */
  __dirname + "/astq-query-parse.pegjs",
  { optimize: "speed", cache: true }
);
var ASTQQuery = class {
  /*  create a new instance of the query instance  */
  constructor(selector) {
    this.asty = new ASTY();
    this.ast = null;
    if (selector)
      this.compile(selector);
  }
  /*  compile query selector into AST  */
  compile(selector, trace) {
    if (trace)
      console.log("ASTQ: compile: +-------------------------------------------------------------------------------------------------------\nASTQ: compile: | " + selector);
    let result = PEGUtil.parse(ASTQQueryParse, selector, {
      startRule: "query",
      makeAST: (line, column, offset, args) => {
        return this.asty.create.apply(this.asty, args).pos(line, column, offset);
      }
    });
    if (result.error !== null)
      throw new Error("ASTQ: compile: query parsing failed:\n" + PEGUtil.errorMessage(result.error, true).replace(/^/mg, "ERROR: "));
    this.ast = result.ast;
    if (trace)
      console.log("ASTQ: compile: +-------------------------------------------------------------------------------------------------------\n" + this.dump().replace(/\n$/, "").replace(/^/mg, "ASTQ: compile: | "));
    return this;
  }
  /*  dump the query AST  */
  dump() {
    return this.ast.dump();
  }
  /*  execute the query AST onto node  */
  execute(node, adapter, params, funcs, trace) {
    if (trace)
      console.log("ASTQ: execute: +-------------------------------------------------------------------------------------------------------");
    let qe = new ASTQQueryExec(adapter, params, funcs, trace);
    return qe.execQuery(this.ast, node);
  }
};

// src/astq-version.js
var version = {
  major: "2",
  minor: "8",
  micro: "1",
  date: "20240308"
};
var astq_version_default = version;

// src/astq.ts
var ASTQ = class {
  constructor() {
    this._adapter = new ASTQAdapter().register(ASTQAdapterXMLDOM, false).register(ASTQAdapterParse5, false).register(ASTQAdapterMozAST, false).register(ASTQAdapterGraphQL, false).register(ASTQAdapterJSON, false).register(ASTQAdapterCheerio, false).register(ASTQAdapterUniST, false).register(ASTQAdapterASTY, false);
    this._funcs = new ASTQFuncs();
    for (const name in astq_funcs_std_default) {
      this.func(name, astq_funcs_std_default[name]);
    }
    this._cache = new CacheLRU();
  }
  version() {
    return astq_version_default;
  }
  adapter(adapter, force = false) {
    if (arguments.length < 1 || arguments.length > 2) {
      throw new Error("ASTQ#adapter: invalid number of arguments");
    }
    this._adapter.unregister();
    if (!(typeof adapter === "object" && adapter instanceof Array)) {
      adapter = [adapter];
    }
    if (adapter.length > 1 && force) {
      throw new Error("ASTQ#adapter: you can force just a single adapter to not taste the AST node");
    }
    adapter.forEach((adapterItem) => {
      let resolvedAdapter;
      if (typeof adapterItem === "string") {
        if (adapterItem === "mozast") {
          resolvedAdapter = ASTQAdapterMozAST;
        } else if (adapterItem === "graphql") {
          resolvedAdapter = ASTQAdapterGraphQL;
        } else if (adapterItem === "xmldom") {
          resolvedAdapter = ASTQAdapterXMLDOM;
        } else if (adapterItem === "parse5") {
          resolvedAdapter = ASTQAdapterParse5;
        } else if (adapterItem === "json") {
          resolvedAdapter = ASTQAdapterJSON;
        } else if (adapterItem === "cheerio") {
          resolvedAdapter = ASTQAdapterCheerio;
        } else if (adapterItem === "unist") {
          resolvedAdapter = ASTQAdapterUniST;
        } else if (adapterItem === "asty") {
          resolvedAdapter = ASTQAdapterASTY;
        } else {
          throw new Error("ASTQ#adapter: unknown built-in adapter");
        }
      } else {
        resolvedAdapter = adapterItem;
      }
      this._adapter.register(resolvedAdapter, force);
    });
    return this;
  }
  func(name, func) {
    if (arguments.length !== 2) {
      throw new Error("ASTQ#func: invalid number of arguments");
    }
    this._funcs.register(name, func);
    return this;
  }
  cache(entries) {
    if (arguments.length !== 1) {
      throw new Error("ASTQ#cache: invalid number of arguments");
    }
    this._cache.limit(entries);
    return this;
  }
  compile(selector, trace) {
    if (arguments.length < 1) {
      throw new Error("ASTQ#compile: too less arguments");
    }
    if (arguments.length > 2) {
      throw new Error("ASTQ#compile: too many arguments");
    }
    if (trace === void 0) {
      trace = false;
    }
    let query = this._cache.get(selector);
    if (query === void 0) {
      query = new ASTQQuery();
      query.compile(selector, trace);
      this._cache.set(selector, query);
    }
    return query;
  }
  execute(node, query, params, trace) {
    if (arguments.length < 2) {
      throw new Error("ASTQ#execute: too less arguments");
    }
    if (arguments.length > 4) {
      throw new Error("ASTQ#execute: too many arguments");
    }
    if (params === void 0) {
      params = {};
    }
    if (trace === void 0) {
      trace = false;
    }
    const adapter = this._adapter.select(node);
    if (adapter === void 0) {
      throw new Error("ASTQ#execute: no suitable adapter found for node");
    }
    return query.execute(node, adapter, params, this._funcs, trace);
  }
  query(node, selector, params, trace) {
    if (arguments.length < 2) {
      throw new Error("ASTQ#query: too less arguments");
    }
    if (arguments.length > 4) {
      throw new Error("ASTQ#query: too many arguments");
    }
    if (params === void 0) {
      params = {};
    }
    if (trace === void 0) {
      trace = false;
    }
    return this.execute(node, this.compile(selector, trace), params, trace);
  }
};
export {
  ASTQ as default
};
//# sourceMappingURL=astq.js.map