// Shiki themes share the neutral/green article palette; token meanings remain distinct.
function theme(name, type, colors) {
  const [background,foreground,comment,green,string,number] = colors;
  return {
    name,type,
    colors:{'editor.background':background,'editor.foreground':foreground},
    tokenColors:[
      {scope:['comment','punctuation.definition.comment'],settings:{foreground:comment}},
      {scope:['keyword','storage','entity.name.function','support.function'],settings:{foreground:green}},
      {scope:['string','markup.inline.raw'],settings:{foreground:string}},
      {scope:['constant.numeric','constant.language','entity.name.type','support.type'],settings:{foreground:number}},
      {scope:['variable','punctuation','meta'],settings:{foreground}},
      {scope:['invalid'],settings:{foreground:type==='light'?'#b42335':'#ff9ba6'}},
    ],
  };
}
export const light=theme('kiddo-light','light',['#f2f4f6','#333d4b','#6b7684','#246b50','#21696d','#566b29']);
export const dark=theme('kiddo-dark','dark',['#202329','#e5e8eb','#b0b8c1','#80cfa7','#83cdd0','#c0d58b']);
