
const fs = require('fs');
const path = 'c:/Users/ok/Videos/Captures/apps/native_web/src/services/captionPresetService.ts';
let code = fs.readFileSync(path, 'utf8');

const animStart = code.indexOf('export const ANIMATION_EFFECTS: CaptionAnimationEffect[] = [');
const animEnd = code.indexOf('];', animStart) + 2;
let animArrayStr = code.substring(animStart, animEnd);
let animLines = animArrayStr.split('\n');
let newAnimArrayStr = animLines.slice(0, 21).join('\n') + '\n];';
code = code.replace(animArrayStr, newAnimArrayStr);

const presetStart = code.indexOf('export const CAPTION_PRESETS: CaptionPreset[] = [');
const presetEnd = code.indexOf('];', presetStart) + 2;
let presetArrayStr = code.substring(presetStart, presetEnd);

let presetItems = presetArrayStr.split('\n').filter(line => line.includes('{ id:'));
let boxPresets = presetItems.filter(line => line.includes(oxStyle: 'box'));
if (boxPresets.length < 20) {
  const otherPresets = presetItems.filter(line => !line.includes(oxStyle: 'box'));
  boxPresets = boxPresets.concat(otherPresets).slice(0, 20);
} else {
  boxPresets = boxPresets.slice(0, 20);
}

let newPresetArrayStr = 'export const CAPTION_PRESETS: CaptionPreset[] = [\n' + boxPresets.join('\n') + '\n];';
code = code.replace(presetArrayStr, newPresetArrayStr);

fs.writeFileSync(path, code);

