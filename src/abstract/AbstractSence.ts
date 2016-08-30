import {LayaWorld, LayaGame} from './LayaInterface';
import {AbstractComponent} from './AbstractComponent';
import {Getter} from '../ctrl/DirectiveManager';
import ComponentManager from '../ctrl/ComponentManager';
import ViewModelManager from '../ctrl/ViewModelManager';
import StateManager from '../ctrl/StateManager';
import counter from './Counter';
import DisplayObjectManager from '../ctrl/DisplayObjectManager';
import {forEachKey} from '../util/Iter';

export interface AbstractSenceConstructor {
    new (): AbstractSence;
}

export class AbstractSence {
    refs: Map<string, any> = new Map<string, any>();
    private id: number;
    private subComponents: Array<AbstractComponent> = [];
    private layaGame: LayaGame;
    private getterProperty: Map<Getter, string> = new Map<Getter, string>();
    private repeatScope: Map<string, Array<any>> = new Map<string, Array<any>>();
    private repeatIndex: Map<string, number> = new Map<string, number>();
    private $$repeatAttrs: Set<string> = new Set<string>();

    constructor() {
        this.id = counter();
    }

    /**
     *  返回场景对象的所有子组件
     */
    getSubComponents(): Array<AbstractComponent> {
        return this.subComponents;
    }

    addSubComponent(component: AbstractComponent): void {
        this.subComponents.push(component);
    }

    getLayaGame(): LayaGame {
        return this.layaGame;
    }

    setLayaGame(game: LayaGame): void {
        this.layaGame = game;
    }

    destorySubComponent(): void {
        this.subComponents.forEach(v => {
            let id = v.getId();
            ComponentManager.deleteComponent(id);
            ViewModelManager.deleteViewModel(id);
            StateManager.delete(id);
        });
        this.subComponents = [];
    }

    getId(): number {
        return this.id;
    }

    addToRepeatScope(name: string, value: any) {
        this.repeatScope.set(name, value);
        this.$$repeatAttrs.add(name);
        if (!this.hasOwnProperty(name)) {
            Object.defineProperty(this, name, {
                get() {
                    return this.repeatScope.get(name)[this.repeatIndex.get(name)];
                }
            });
        }
    }

    setRepeatIndex(name: string, index: number) {
        this.repeatIndex.set(name, index);
        if (!this.hasOwnProperty(name + 'Index')) {
            Object.defineProperty(this, name + 'Index', {
                get() {
                    return this.repeatIndex.get(name);
                }
            });
        }
    }

    hasRepeatAttr(name: string): boolean {
        return this.$$repeatAttrs.has(name);
    }

    resetRepeatIndex() {
        forEachKey<string>(this.repeatIndex.keys(), (function (key) {
            this.repeatIndex.set(key, 0);
        }).bind(this));
    }

    generatorRepeatInfo() {
        let ret = Object.create(null);
        forEachKey<string>(this.repeatIndex.keys(), (function (key) {
            ret[key] = this.repeatIndex.get(key);
        }).bind(this));
        return ret;
    }
}
