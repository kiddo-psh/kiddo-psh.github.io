// Light-only, muted from github-light so code sits on the cool paper.
const fg = '#18191A';
const comment = '#6C6E70';
const keyword = '#9A5F65';
const fn = '#5E5878';
const string = '#3E5268';
const builtin = '#4A6A86';

export const light = {
  name: 'cool-light',
  displayName: 'Cool Light',
  type: 'light',
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': fg,
  },
  tokenColors: [
    { settings: { foreground: fg } },
    { scope: ['comment', 'punctuation.definition.comment', 'string.comment'], settings: { foreground: comment } },
    { scope: ['constant', 'entity.name.constant', 'variable.other.constant', 'variable.other.enummember', 'variable.language', 'support.constant'], settings: { foreground: builtin } },
    { scope: ['entity', 'entity.name'], settings: { foreground: fn } },
    { scope: 'entity.name.tag', settings: { foreground: builtin } },
    { scope: 'variable.parameter.function', settings: { foreground: fg } },
    { scope: ['keyword', 'storage', 'storage.type'], settings: { foreground: keyword } },
    { scope: ['keyword.operator', 'storage.modifier.package', 'storage.modifier.import', 'storage.type.java'], settings: { foreground: fg } },
    { scope: ['string', 'punctuation.definition.string', 'string punctuation.section.embedded source', 'source.regexp', 'string.regexp'], settings: { foreground: string } },
    { scope: ['support', 'support.function', 'support.type', 'support.class', 'meta.property-name', 'support.variable'], settings: { foreground: builtin } },
    { scope: ['variable', 'variable.other', 'punctuation'], settings: { foreground: fg } },
    { scope: 'invalid', settings: { foreground: keyword } },
    { scope: 'markup.inline.raw', settings: { foreground: builtin } },
    { scope: ['markup.bold', 'markup.italic'], settings: { foreground: fg } },
  ],
};
