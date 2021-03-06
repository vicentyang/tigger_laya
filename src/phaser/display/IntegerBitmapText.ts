import BitmapText from './BitmapText';
import display from '../../decorators/Display';

@display({
  require: ['x', 'y'],
  optional: ['text', 'size', 'align', 'font'],
  name: 'IntegerBitmapText'
})
export default class IntegerBitmapText extends BitmapText {
    buildRealObject(game, require, optional) {
       super.buildRealObject(game, require, optional);
       delete this.realObject.text;
       Object.defineProperty(this.realObject, 'text', {
           enumerable: false,
           configurable: false,
           get() {
               return this._text;
           },
           set(value) {
               if (value !== this._text) {
                   if (1 * value === value && value !== true) {
                       value = Math.round(value);
                   }
                   this._text = value.toString() || '';
                   this.updateText();
               }
           }
       });
    }
}
