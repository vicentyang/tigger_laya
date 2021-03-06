/**
 * 包含了解析 template 字符串的函数.
 */
import {ComponentNode} from '../ctrl/ComponentManager';
import {expToFunction, expressionVars} from './Expression';
import {ParsedDirective} from '../ctrl/DirectiveManager';
import Dom from '../util/Dom';

/**
 * 将Dom Elment 转换成 ComponentNode 
 */
export function elementToComponentNode(ele: Element, root?: ComponentNode): ComponentNode {
    let res: ComponentNode = Object.create(null);
    let attrs: NamedNodeMap = ele.attributes;
    if (root === undefined) {
        root = res;
    }
    res.check = [];
    res.condition = [];
    let normals:    Array<{name: string,
                           value: (context) => any}>
                                     = Array.prototype.filter.call(attrs, (v) => !/^l-/.test(v.name))
                                          .map(({name: attrName, value: attrValue}) => {
                                              return {
                                                  name: attrName,
                                                  value: expToFunction(attrValue)
                                              };
                                          });
    let children:   Array<Element>   = Dom.getChildren(ele);
    let phaserCons: string           = ele.nodeName.toLowerCase()
                                                   .replace(/^\w/, (a) => a.toUpperCase())
                                                   .replace(/\-([a-z])/g, (a: string, b: string) => {
                                                        return b.toUpperCase();
                                                    });
    let directives: Array<ParsedDirective> =
        Array.prototype.filter.call(attrs, (v) => /^l-/.test(v.name))
            .filter(({name, value}) => {
                let directive = parseDirective(name);
                if (directive.name === 'if') {
                    conditionBind(root, value, directive, res);
                    return false;
                } else if (directive.name === 'update') {
                    updateBind(root, value, directive);
                    return false;
                } else {
                    return true;
                }
            })
            .map(({name, value}): ParsedDirective => {
                let directive = parseDirective(name);
                let vars = expressionVars(value);
                return {
                    name: directive.name,
                    argument: directive.argument,
                    value: expToFunction(value, vars),
                    triggers: vars.map(v => v.replace(/\..*/, ''))
                };
            });
    res.normals    = normals;
    res.directives = directives;
    res.name       = phaserCons;
    res.children   = children.map(v => elementToComponentNode(v, root ? root : res));
    return res;
}

export function parseDirective(name: string): {name: string, argument: string} {
    let dn;
    let da;
    try {
        dn = name.match(/^l-([a-z]+)/)[1];
        da = name.replace(/^l-[a-z]+/, '')
                    .replace('-', '')
                    .replace(/\-([a-z])/g, (a: string, b: string) => {
                        return b.toUpperCase();
                    });
    } catch (e) {
        console.error('指令格式有誤: ', name, e);
    }
    return {name: dn, argument: da};
}

function updateBind(root, value, directive) {
    let vars = expressionVars(value);
    let fun = expToFunction(value, vars);
    root.condition.push({
        name: directive.name,
        argument: directive.argument,
        value: fun,
        triggers: vars.map(v => v.replace(/\..*/, ''))
    });
}

function conditionBind(root, value, directive, res) {
    let vars = expressionVars(value);
    let fun = expToFunction(value, vars);
    root.condition.push({
        name: directive.name,
        argument: directive.argument,
        value: fun,
        triggers: vars.map(v => v.replace(/\..*/, ''))
    });
    res.check.push(fun);
}
