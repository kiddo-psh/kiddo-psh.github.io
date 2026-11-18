// Shiki themes share the editorial palette; token meanings remain distinct.
function theme(name, type, colors) {
  const [background,foreground,comment,keyword,string,number] = colors;
  return {
    name,type,
    colors:{'editor.background':background,'editor.foreground':foreground},
    tokenColors:[
      {scope:['comment','punctuation.definition.comment'],settings:{foreground:comment}},
      {scope:['keyword','storage','entity.name.function','support.function'],settings:{foreground:keyword}},
      {scope:['string','markup.inline.raw'],settings:{foreground:string}},
      {scope:['constant.numeric','constant.language','entity.name.type','support.type'],settings:{foreground:number}},
      {scope:['variable','punctuation','meta'],settings:{foreground}},
      {scope:['invalid'],settings:{foreground:type==='light'?'#b42335':'#ff9ba6'}},
    ],
  };
}
export const light=theme('kiddo-light','light',['#fcfcfa','#252622','#626659','#a53450','#275e72','#865219']);
export const dark=theme('kiddo-dark','dark',['#1c1d1b','#f1eee8','#b3b6a9','#ff9eb0','#a2d6e8','#f0c38b']);
